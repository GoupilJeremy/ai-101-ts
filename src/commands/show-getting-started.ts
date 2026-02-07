import * as vscode from 'vscode';

/**
 * Command to show the AI-101 Getting Started walkthrough
 * Opens the VSCode walkthrough UI for the AI-101 extension
 */
export async function showGettingStartedCommand(): Promise<void> {
    try {
        // Open the AI-101 getting started walkthrough
        // Format: 'publisher.extensionId#walkthroughId'
        await vscode.commands.executeCommand(
            'workbench.action.openWalkthrough',
            'GoupilJeremy.ai-101-ts#ai101.gettingStarted',
            false // Don't open in the background
        );
    } catch (error) {
        vscode.window.showErrorMessage(
            `Failed to open Getting Started guide: ${error instanceof Error ? error.message : String(error)}`
        );
    }
}
