import * as vscode from 'vscode';
import { TroubleshootingWebviewProvider } from '../troubleshooting/troubleshooting-webview';

/**
 * Command to show troubleshooting knowledge base
 */
export function registerShowTroubleshootingCommand(
    context: vscode.ExtensionContext,
    provider: TroubleshootingWebviewProvider
): vscode.Disposable {
    return vscode.commands.registerCommand('suika.showTroubleshooting', async () => {
        // Focus the troubleshooting view
        await vscode.commands.executeCommand('suika.troubleshootingView.focus');
    });
}

/**
 * Command to open specific troubleshooting article by ID
 */
export function registerOpenTroubleshootingArticleCommand(
    context: vscode.ExtensionContext
): vscode.Disposable {
    return vscode.commands.registerCommand(
        'suika.openTroubleshootingArticle',
        async (articleId?: string) => {
            // If no article ID provided, prompt user
            if (!articleId) {
                articleId = await vscode.window.showInputBox({
                    prompt: 'Enter article ID',
                    placeHolder: 'e.g., performance-slow-ui'
                });

                if (!articleId) {
                    return; // User cancelled
                }
            }

            // Focus troubleshooting view and send message to open article
            await vscode.commands.executeCommand('suika.troubleshootingView.focus');

            // Wait a bit for view to load, then send message
            setTimeout(() => {
                vscode.commands.executeCommand('suika.sendToTroubleshooting', {
                    type: 'openArticle',
                    articleId
                });
            }, 500);
        }
    );
}

/**
 * Command to search troubleshooting with pre-filled query
 */
export function registerSearchTroubleshootingCommand(
    context: vscode.ExtensionContext
): vscode.Disposable {
    return vscode.commands.registerCommand(
        'suika.searchTroubleshooting',
        async (query?: string) => {
            // If no query provided, prompt user
            if (!query) {
                query = await vscode.window.showInputBox({
                    prompt: 'Search troubleshooting articles',
                    placeHolder: 'Enter symptom, error code, or keyword...'
                });

                if (!query) {
                    return; // User cancelled
                }
            }

            // Focus troubleshooting view and send search query
            await vscode.commands.executeCommand('suika.troubleshootingView.focus');

            // Wait for view to load, then send search query
            setTimeout(() => {
                vscode.commands.executeCommand('suika.sendToTroubleshooting', {
                    type: 'search',
                    query
                });
            }, 500);
        }
    );
}

/**
 * Internal command to send messages to troubleshooting webview
 * Used by other commands to communicate with the webview
 */
export function registerSendToTroubleshootingCommand(
    context: vscode.ExtensionContext,
    provider: TroubleshootingWebviewProvider
): vscode.Disposable {
    return vscode.commands.registerCommand(
        'suika.sendToTroubleshooting',
        async (message: any) => {
            // This would need to be implemented in the provider
            // For now, it's a placeholder for future enhancement
            console.log('Send to troubleshooting:', message);
        }
    );
}
