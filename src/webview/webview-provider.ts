import * as vscode from 'vscode';
import * as fs from 'fs';
import { ExtensionStateManager } from '../state/extension-state-manager.js';
import { ModeManager } from '../modes/mode-manager.js';
import { AgentMode } from '../modes/mode-types.js';
import { TeamMetricsTracker } from '../team/team-metrics-tracker.js';

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
                // Future: Handle annotation storage (Task 7)
                console.log('Annotation added:', message);
                break;
            default:
                console.warn('Unknown message type from webview:', type);
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
        }
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'dist', 'webview.js'));
        const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'dist', 'index.css'));
        const sumiUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'dist', 'sumi-e.css'));
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
