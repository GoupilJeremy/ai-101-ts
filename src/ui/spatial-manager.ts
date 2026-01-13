import * as vscode from 'vscode';
import { ExtensionStateManager } from '../state/extension-state-manager.js';

/**
 * Tracks the spatial context of the editor (cursor position, visible ranges)
 * and synchronizes it with the HUD for anti-collision and contextual positioning.
 */
export class SpatialManager {
    private static instance: SpatialManager;
    private disposables: vscode.Disposable[] = [];

    private constructor() {
        this.initializeListeners();
    }

    public static getInstance(): SpatialManager {
        if (!SpatialManager.instance) {
            SpatialManager.instance = new SpatialManager();
        }
        return SpatialManager.instance;
    }

    private initializeListeners(): void {
        // Track selection / cursor movement
        this.disposables.push(
            vscode.window.onDidChangeTextEditorSelection(e => {
                this.syncCursorPosition(e.textEditor);
            })
        );

        // Track scrolling
        this.disposables.push(
            vscode.window.onDidChangeTextEditorVisibleRanges(e => {
                this.syncCursorPosition(e.textEditor);
            })
        );
    }

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

    public dispose(): void {
        this.disposables.forEach(d => d.dispose());
    }
}
