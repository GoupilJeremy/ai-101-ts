import * as vscode from 'vscode';
import * as path from 'path';

/**
 * Command handler for "AI-101: View Changelog"
 * Opens the CHANGELOG.md file in Markdown Preview mode.
 */
export async function viewChangelogCommand(context: vscode.ExtensionContext) {
    try {
        const changelogPath = path.join(context.extensionPath, 'CHANGELOG.md');
        const uri = vscode.Uri.file(changelogPath);

        // Check if file exists
        try {
            await vscode.workspace.fs.stat(uri);
        } catch {
            vscode.window.showErrorMessage('CHANGELOG.md not found in extension root.');
            return;
        }

        // Open markdown preview
        await vscode.commands.executeCommand('markdown.showPreview', uri);
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to open changelog: ${error instanceof Error ? error.message : String(error)}`);
    }
}
