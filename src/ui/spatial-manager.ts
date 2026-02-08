import * as vscode from 'vscode';
import { ExtensionStateManager } from '../state/extension-state-manager.js';
import { WebviewManager } from './webview-manager.js';
import { AgentPositioning, AgentPosition, EditorBounds, VisibleRange } from './agent-positioning.js';
import { AgentType } from '../agents/shared/agent.interface.js';

/**
 * Tracks the spatial context of the editor (cursor position, visible ranges)
 * and synchronizes it with the HUD for anti-collision and contextual positioning.
 *
 * Extended in Story 11.3 to support agent anchoring to specific code lines.
 */
export class SpatialManager {
    private static instance: SpatialManager;
    private disposables: vscode.Disposable[] = [];

    /**
     * Map of agent anchors: agentId -> lineNumber
     * Story 11.3: Track which line each agent is anchored to
     */
    private agentAnchors: Map<AgentType, number> = new Map();

    private constructor() {
        this.initializeListeners();
    }

    public static getInstance(): SpatialManager {
        if (!SpatialManager.instance) {
            SpatialManager.instance = new SpatialManager();
        }
        return SpatialManager.instance;
    }

    /**
     * Anchors an agent to a specific line of code
     * The agent will be positioned at this line and follow it during scroll
     *
     * Story 11.3: New method
     *
     * @param agentId - Agent to anchor
     * @param lineNumber - Target line number (0-based)
     *
     * @example
     * ```typescript
     * spatialManager.attachAgentToLine('architect', 50);
     * // Architect will position at line 50
     * ```
     */
    public attachAgentToLine(agentId: AgentType, lineNumber: number): void {
        // Store the anchor
        this.agentAnchors.set(agentId, lineNumber);

        // Calculate and send new position
        this.updateAgentPosition(agentId);
    }

    /**
     * Detaches an agent from its anchored line
     * Agent returns to default/neutral position
     *
     * Story 11.3: New method
     *
     * @param agentId - Agent to detach
     */
    public detachAgent(agentId: AgentType): void {
        this.agentAnchors.delete(agentId);

        // Notify webview of detachment (null position)
        this.notifyWebview(agentId, null);
    }

    /**
     * Gets all currently anchored agents
     * Useful for debugging and status checks
     *
     * Story 11.3: New method
     */
    public getAnchoredAgents(): Map<AgentType, number> {
        return new Map(this.agentAnchors);
    }

    /**
     * Checks if an agent is currently anchored
     *
     * Story 11.3: New method
     */
    public isAgentAnchored(agentId: AgentType): boolean {
        return this.agentAnchors.has(agentId);
    }

    /**
     * Calculates and sends the position for an anchored agent
     *
     * Story 11.3: New private method
     */
    private updateAgentPosition(agentId: AgentType): void {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        const anchorLine = this.agentAnchors.get(agentId);
        if (anchorLine === undefined) {
            // No anchor for this agent
            this.notifyWebview(agentId, null);
            return;
        }

        const bounds = this.getEditorBounds(editor);
        const totalLines = editor.document.lineCount;
        const visibleRanges = this.getVisibleRanges(editor);

        // Calculate position using AgentPositioning
        const position = AgentPositioning.getAgentPosition(
            agentId,
            anchorLine,
            totalLines,
            bounds
        );

        // Check if the anchored line is currently visible
        const isVisible = AgentPositioning.isLineVisible(
            anchorLine,
            visibleRanges
        );

        // If not visible, optionally find nearest visible line
        // For now, we still send the position even if not visible
        // (agent will be off-screen, which is fine)

        // Send position to webview
        this.notifyWebview(agentId, {
            ...position,
            isVisible
        });
    }

    /**
     * Re-synchronizes all anchored agents
     * Called when viewport changes (scroll, resize)
     *
     * Story 11.3: New private method
     */
    private resyncAllAnchors(): void {
        this.agentAnchors.forEach((lineNumber, agentId) => {
            this.updateAgentPosition(agentId);
        });
    }

    /**
     * Gets the current editor bounds
     *
     * Story 11.3: New private method
     *
     * Note: VSCode API doesn't directly provide editor dimensions,
     * so we estimate based on typical layouts. In production, this
     * could be enhanced with webview measurements.
     */
    private getEditorBounds(editor: vscode.TextEditor): EditorBounds {
        // Estimate editor bounds
        // These are conservative estimates that work for most layouts
        // TODO: Could be improved with actual measurements from webview

        const estimatedWidth = 1200; // Typical editor width
        const estimatedHeight = 800; // Typical editor height

        return {
            top: 0,
            left: 0,
            width: estimatedWidth,
            height: estimatedHeight
        };
    }

    /**
     * Gets the current visible ranges from the editor
     *
     * Story 11.3: New private method
     */
    private getVisibleRanges(editor: vscode.TextEditor): VisibleRange[] {
        return editor.visibleRanges.map(range => ({
            start: range.start.line,
            end: range.end.line
        }));
    }

    /**
     * Notifies the webview of an agent's new position
     *
     * Story 11.3: New private method
     *
     * @param agentId - Agent to update
     * @param position - New position (or null to detach)
     */
    private notifyWebview(agentId: AgentType, position: (AgentPosition & { isVisible?: boolean }) | null): void {
        WebviewManager.getInstance().postMessageToWebview({
            type: 'toWebview:agentPositionUpdate',
            agentId,
            position
        });
    }

    /**
     * EXISTING: Initialize event listeners
     * MODIFIED: Added resync for anchored agents on scroll/resize
     */
    private initializeListeners(): void {
        // Track selection / cursor movement
        this.disposables.push(
            vscode.window.onDidChangeTextEditorSelection(e => {
                this.syncCursorPosition(e.textEditor);
            })
        );

        // Track scrolling
        // Story 11.3: Extended to resync anchored agents
        this.disposables.push(
            vscode.window.onDidChangeTextEditorVisibleRanges(e => {
                this.syncCursorPosition(e.textEditor);

                // Resync all anchored agents when viewport changes
                this.resyncAllAnchors();
            })
        );

        // Story 11.3: Track active editor changes
        this.disposables.push(
            vscode.window.onDidChangeActiveTextEditor(editor => {
                if (editor) {
                    this.syncCursorPosition(editor);
                    this.resyncAllAnchors();
                }
            })
        );
    }

    /**
     * EXISTING: Sync cursor position
     * (unchanged from original)
     */
    private syncCursorPosition(editor: vscode.TextEditor): void {
        const selection = editor.selection;
        const activeLine = selection.active.line;
        const totalLines = editor.document.lineCount;

        // Calculate relative position (0 to 1)
        const relativeY = activeLine / Math.max(1, totalLines);

        // Notify State Manager (which will forward to Webview)
        (ExtensionStateManager.getInstance() as any).notifyCursorUpdate({
            line: activeLine,
            character: selection.active.character,
            relativeY: relativeY,
            visibleRanges: editor.visibleRanges.map(r => ({
                start: r.start.line,
                end: r.end.line
            }))
        });
    }

    /**
     * EXISTING: Dispose all listeners
     * (unchanged from original)
     */
    public dispose(): void {
        this.disposables.forEach(d => d.dispose());
    }
}
