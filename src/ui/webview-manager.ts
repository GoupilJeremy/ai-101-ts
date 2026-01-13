import * as vscode from 'vscode';
import { AI101WebviewProvider } from '../webview/webview-provider.js';

/**
 * Manages the lifecycle and configuration of the AI 101 Webviews (HUD).
 */
export class WebviewManager {
    private static instance: WebviewManager;
    private provider: AI101WebviewProvider | undefined;

    private constructor() { }

    public static getInstance(): WebviewManager {
        if (!WebviewManager.instance) {
            WebviewManager.instance = new WebviewManager();
        }
        return WebviewManager.instance;
    }

    /**
     * Initializes the webview provider and registers it with VS Code.
     */
    public initialize(context: vscode.ExtensionContext): void {
        this.provider = new AI101WebviewProvider(context.extensionUri);

        context.subscriptions.push(
            vscode.window.registerWebviewViewProvider(
                AI101WebviewProvider.viewType,
                this.provider,
                {
                    webviewOptions: {
                        retainContextWhenHidden: true // Preserve HUD state even when hidden
                    }
                }
            )
        );

        console.log('[WebviewManager] Initialized with retainContextWhenHidden: true');
    }

    /**
     * Returns the webview provider instance.
     */
    public getProvider(): AI101WebviewProvider | undefined {
        return this.provider;
    }
}
