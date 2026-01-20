import * as vscode from 'vscode';

/**
 * Command to show the Suika Getting Started walkthrough
 * Opens the VSCode walkthrough UI for the Suika extension
 */
export async function showGettingStartedCommand(): Promise<void> {
    try {
        // Open the Suika getting started walkthrough
        // Format: 'publisher.extensionId#walkthroughId'
        await vscode.commands.executeCommand(
            'workbench.action.openWalkthrough',
            'GoupilJeremy.suika#suika.gettingStarted',
            false // Don't open in the background
        );
    } catch (error) {
        vscode.window.showErrorMessage(
            `Failed to open Getting Started guide: ${error instanceof Error ? error.message : String(error)}`
        );
    }
}
