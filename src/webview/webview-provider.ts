import * as vscode from 'vscode';
import * as fs from 'fs';
import { ExtensionStateManager } from '../state/extension-state-manager.js';

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
