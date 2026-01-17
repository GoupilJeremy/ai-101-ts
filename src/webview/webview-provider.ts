import * as vscode from 'vscode';
import * as fs from 'fs';
import { ExtensionStateManager } from '../state/extension-state-manager.js';
import { ModeManager } from '../modes/mode-manager.js';
import { AgentMode } from '../modes/mode-types.js';
import { TeamMetricsTracker } from '../team/team-metrics-tracker.js';
import { AnnotationsManager } from '../team/annotations-manager.js';
import { PerformanceDetector } from '../performance/performance-detector.js';

export class AI101WebviewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'ai101.webview';

    private _view?: vscode.WebviewView;

    constructor(
        private readonly _extensionUri: vscode.Uri,
    ) { }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                this._extensionUri
            ]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        // Register for state sync
        ExtensionStateManager.getInstance().setWebview(webviewView.webview);

        // Listen for messages from webview
        webviewView.webview.onDidReceiveMessage(this.handleWebviewMessage.bind(this));

        // Listen for configuration changes to sync large text mode
        vscode.workspace.onDidChangeConfiguration(this.handleConfigurationChange.bind(this));
    }

    private async handleWebviewMessage(message: any): Promise<void> {
        const { type } = message;

        switch (type) {
            case 'toExtension:suggestionAccepted':
                this.handleSuggestionAction(message.agent, 'accepted', message.complexity);
                break;
            case 'toExtension:suggestionRejected':
                this.handleSuggestionAction(message.agent, 'rejected', message.complexity);
                break;
            case 'toExtension:annotationAdded':
                this.handleAnnotationAdded(message.suggestionId, message.comment, message.author);
                break;
            case 'toExtension:getAnnotations':
                this.sendAnnotationsToWebview(message.suggestionId);
                break;
            case 'toExtension:lowFpsDetected':
                this.handleLowFpsDetected(message.fps, message.consecutiveCount);
                break;
            case 'toExtension:openFile':
                this.openFileInEditor(message.filePath);
                break;
            case 'toExtension:fixEdgeCase':
                this.handleFixEdgeCase(message.edgeCase);
                break;

            // Context Management
            case 'toExtension:saveContextSnapshot':
                this.handleSaveContextSnapshot(message.files, message.timestamp);
                break;
            case 'toExtension:removeContextFile':
                await this.handleRemoveContextFile(message.filePath);
                break;
            case 'toExtension:refreshContextFile':
                await this.handleRefreshContextFile(message.filePath);
                break;

            default:
                console.warn('Unknown message type from webview:', type);
        }
    }

    private async openFileInEditor(filePath: string): Promise<void> {
        if (!filePath) return;
        try {
            const uri = vscode.Uri.file(filePath);
            const doc = await vscode.workspace.openTextDocument(uri);
            await vscode.window.showTextDocument(doc);
        } catch (error) {
            console.error('Error opening file:', error);
            vscode.window.showErrorMessage(`Could not open file: ${filePath}`);
        }
    }

    private handleSaveContextSnapshot(files: any[], timestamp: number): void {
        // Just log for now, or save to a file/state
        console.log(`Saving context snapshot with ${files?.length} files at ${timestamp}`);
        vscode.window.showInformationMessage(`Context snapshot saved (${files?.length} files)`);
    }

    private async handleRemoveContextFile(filePath: string): Promise<void> {
        // Dynamic import to avoid circular dependency if possible, or assume Orchestrator is available
        const { AgentOrchestrator } = await import('../agents/orchestrator.js');
        const contextAgent = AgentOrchestrator.getInstance().getAgent('context') as any;

        if (contextAgent && typeof contextAgent.excludeFile === 'function') {
            contextAgent.excludeFile(filePath);

            // Push updated list back to webview
            if (contextAgent.getContextFiles) {
                const files = contextAgent.getContextFiles();
                this._view?.webview.postMessage({
                    type: 'toWebview:contextFilesUpdate',
                    files
                });
            }
        }
    }

    private async handleRefreshContextFile(filePath: string): Promise<void> {
        const { AgentOrchestrator } = await import('../agents/orchestrator.js');
        const contextAgent = AgentOrchestrator.getInstance().getAgent('context') as any;

        if (contextAgent && typeof contextAgent.refreshFile === 'function') {
            await contextAgent.refreshFile(filePath);
            // Re-fetch context files?
        }
    }

    private async handleFixEdgeCase(edgeCase: any): Promise<void> {
        const { AgentOrchestrator } = await import('../agents/orchestrator.js');
        const orchestrator = AgentOrchestrator.getInstance();

        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: `Fixing Edge Case: ${edgeCase.type}`,
            cancellable: false
        }, async (progress) => {
            try {
                const response = await orchestrator.processEdgeCaseFix(edgeCase);
                // In a real implementation, we would apply the edit or show a diff.
                // For now, let's just show the result in a new document or information message.
                // Or better, let Coder Agent apply edits directly if it supports it (it doesn't yet fully).
                // We'll show the suggestion in a new untitled document.
                const doc = await vscode.workspace.openTextDocument({ content: response.result, language: 'typescript' });
                await vscode.window.showTextDocument(doc, { preview: false, viewColumn: vscode.ViewColumn.Beside });

                vscode.window.showInformationMessage("Edge case fix generated. Please review side-by-side.");
            } catch (error: any) {
                vscode.window.showErrorMessage(`Failed to fix edge case: ${error.message}`);
            }
        });
    }

    private handleConfigurationChange(event: vscode.ConfigurationChangeEvent): void {
        if (event.affectsConfiguration('ai101.teamMode.largeText')) {
            const config = vscode.workspace.getConfiguration('ai101.teamMode');
            const largeTextEnabled = config.get<boolean>('largeText', false);

            if (this._view) {
                this._view.webview.postMessage({
                    type: 'toWebview:largeTextUpdate',
                    enabled: largeTextEnabled
                });
            }
        }
    }

    private handleSuggestionAction(
        agent: string,
        action: 'accepted' | 'rejected',
        complexity: 'simple' | 'medium' | 'complex' = 'medium'
    ): void {
        // Only track in Team Mode
        const currentMode = ModeManager.getInstance().getCurrentMode();

        if (currentMode === AgentMode.Team) {
            TeamMetricsTracker.getInstance().recordSuggestionAction(agent as any, action, complexity);
            console.log(`Team Mode: Suggestion ${action} logged for ${agent}`);

            // Send metrics update to webview for team visibility
            if (this._view) {
                const tracker = TeamMetricsTracker.getInstance();
                const metrics = tracker.getMetrics();
                const overallAcceptanceRate = tracker.getOverallAcceptanceRate();
                this._view.webview.postMessage({
                    type: 'toWebview:teamMetricsUpdate',
                    metrics: {
                        ...metrics,
                        overallAcceptanceRate
                    }
                });
            }
        }
    }

    private handleAnnotationAdded(suggestionId: string, comment: string, author: string): void {
        const currentMode = ModeManager.getInstance().getCurrentMode();

        if (currentMode === AgentMode.Team) {
            const annotation = AnnotationsManager.getInstance().addAnnotation(suggestionId, comment, author);
            console.log(`Team Mode: Annotation added for suggestion ${suggestionId}`);

            // Send annotation update to webview
            if (this._view) {
                this._view.webview.postMessage({
                    type: 'toWebview:annotationAdded',
                    annotation
                });
            }
        }
    }

    private sendAnnotationsToWebview(suggestionId?: string): void {
        if (!this._view) return;

        const annotationsManager = AnnotationsManager.getInstance();
        const annotations = suggestionId
            ? annotationsManager.getAnnotationsForSuggestion(suggestionId)
            : annotationsManager.getAllAnnotations();

        this._view.webview.postMessage({
            type: 'toWebview:annotationsUpdate',
            annotations
        });
    }

    /**
     * Handle low FPS detection from webview.
     * Records FPS in PerformanceDetector for trend analysis and suggestions.
     */
    private handleLowFpsDetected(fps: number, consecutiveCount: number): void {
        console.log(`Performance: Low FPS detected (${fps} fps, ${consecutiveCount} consecutive)`);
        PerformanceDetector.getInstance().recordFps(fps);
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'dist', 'webview.js'));
        const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'dist', 'index.css'));
        const sumiUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'dist', 'sumi-e.css'));
        const performanceModeStyleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'dist', 'mode-performance.css'));
        const colorblindModeStyleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'dist', 'mode-colorblind.css'));
        const timelineUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'dist', 'timeline.css'));
        const htmlPath = vscode.Uri.joinPath(this._extensionUri, 'dist', 'index.html');

        let htmlContent = '';
        try {
            htmlContent = fs.readFileSync(htmlPath.fsPath, 'utf8');
        } catch (e) {
            console.error('Error reading webview HTML:', e);
            return `<!DOCTYPE html><html><body>Error loading Webview HTML: ${e}</body></html>`;
        }

        const nonce = getNonce();

        return htmlContent
            .replace(/\$\{scriptUri\}/g, scriptUri.toString())
            .replace(/\$\{styleUri\}/g, styleUri.toString())
            .replace(/\$\{sumiUri\}/g, sumiUri.toString())
            .replace(/\$\{performanceModeStyleUri\}/g, performanceModeStyleUri.toString())
            .replace(/\$\{colorblindModeStyleUri\}/g, colorblindModeStyleUri.toString())
            .replace(/\$\{timelineUri\}/g, timelineUri.toString())
            .replace(/\$\{nonce\}/g, nonce)
            .replace(/\$\{webview.cspSource\}/g, webview.cspSource);
    }
}

function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
