
import * as vscode from 'vscode';
import { AgentType } from '../agents/shared/agent.interface.js';
import { SpatialManager } from './spatial-manager.js';
import { ExtensionStateManager } from '../state/extension-state-manager.js';

export class EditorOverlayManager {
    private static instance: EditorOverlayManager;
    private decorations: Map<AgentType, vscode.TextEditorDecorationType> = new Map();
    private activeDecorations: Map<AgentType, { range: vscode.Range, editor: vscode.TextEditor }> = new Map();
    private disposables: vscode.Disposable[] = [];

    private constructor() {
        this.initializeDecorations();
        this.initializeListeners();
    }

    public static getInstance(): EditorOverlayManager {
        if (!EditorOverlayManager.instance) {
            EditorOverlayManager.instance = new EditorOverlayManager();
        }
        return EditorOverlayManager.instance;
    }

    private initializeDecorations(): void {
        const agentColors: Record<AgentType, string> = {
            'architect': '#D4AF37', // Gold
            'coder': '#4CAF50', // Green
            'reviewer': '#F44336', // Red
            'context': '#2196F3' // Blue
        };

        const agentIcons: Record<AgentType, string> = {
            'architect': '🏛️',
            'coder': '💻',
            'reviewer': '🔍',
            'context': '📚'
        };

        const agentTypes: AgentType[] = ['architect', 'coder', 'reviewer', 'context'];

        agentTypes.forEach(agent => {
            const decoration = vscode.window.createTextEditorDecorationType({
                isWholeLine: true,
                backgroundColor: `${agentColors[agent]}15`, // 15 = ~10% opacity
                borderWidth: '0 0 0 2px',
                borderColor: agentColors[agent],
                borderStyle: 'solid',
                after: {
                    contentText: ` ${agentIcons[agent]} ${agent.charAt(0).toUpperCase() + agent.slice(1)} working...`,
                    color: agentColors[agent],
                    margin: '0 0 0 20px',
                    fontStyle: 'italic'
                }
            });

            this.decorations.set(agent, decoration);
        });
    }

    private initializeListeners(): void {
        // Listen to SpatialManager anchor changes
        this.disposables.push(
            SpatialManager.getInstance().onAnchorChanged(event => {
                if (event.line !== undefined) {
                    this.showDecoration(event.agent, event.line);
                } else {
                    this.hideDecoration(event.agent);
                }
            })
        );

        // Listen to active editor changes to re-apply decorations
        this.disposables.push(
            vscode.window.onDidChangeActiveTextEditor(editor => {
                if (editor) {
                    this.reapplyDecorations(editor);
                }
            })
        );
    }

    private showDecoration(agent: AgentType, line: number): void {
        const editor = vscode.window.activeTextEditor;
        if (!editor) { return; }

        const decorationType = this.decorations.get(agent);
        if (!decorationType) { return; }

        const range = new vscode.Range(line, 0, line, 0); // Whole line decoration
        editor.setDecorations(decorationType, [range]);

        this.activeDecorations.set(agent, { range, editor });
    }

    private hideDecoration(agent: AgentType): void {
        const activeDeco = this.activeDecorations.get(agent);
        if (activeDeco && activeDeco.editor) {
            const decorationType = this.decorations.get(agent);
            if (decorationType) {
                activeDeco.editor.setDecorations(decorationType, []);
            }
        }
        this.activeDecorations.delete(agent);
    }

    private reapplyDecorations(editor: vscode.TextEditor): void {
        this.activeDecorations.forEach((deco, agent) => {
            // Only reapply if it was on the same document (simplified check)
            if (deco.editor.document.uri.toString() === editor.document.uri.toString()) {
                const decorationType = this.decorations.get(agent);
                if (decorationType) {
                    editor.setDecorations(decorationType, [deco.range]);
                }
            }
        });
    }

    public dispose(): void {
        this.decorations.forEach(d => d.dispose());
        this.activeDecorations.clear();
        this.disposables.forEach(d => d.dispose());
        this.disposables = [];
    }
}
