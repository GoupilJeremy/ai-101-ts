import * as vscode from 'vscode';
import { ContextAgent } from '../agents/context/context-agent.js';

/**
 * Command to manually add a file to the context.
 * Prompts user to select a file from the workspace.
 */
export async function addContextFileCommand(): Promise<void> {
    // Get the context agent instance - this assumes it's accessible via some global registry
    // In a real implementation, this would be injected or accessed through a service locator
    const contextAgent = getContextAgentInstance();

    if (!contextAgent) {
        vscode.window.showErrorMessage('Context Agent not available');
        return;
    }

    // Show file picker
    const fileUri = await vscode.window.showOpenDialog({
        canSelectFiles: true,
        canSelectFolders: false,
        canSelectMany: false,
        defaultUri: vscode.workspace.workspaceFolders?.[0]?.uri,
        filters: {
            'All Files': ['*']
        },
        openLabel: 'Add to Context'
    });

    if (fileUri && fileUri[0]) {
        const filePath = fileUri[0].fsPath;
        await contextAgent.addFileToContext(filePath);
    }
}

/**
 * Command to manually remove a file from the context.
 * Shows a quick pick with current manual context files.
 */
export async function removeContextFileCommand(): Promise<void> {
    const contextAgent = getContextAgentInstance();

    if (!contextAgent) {
        vscode.window.showErrorMessage('Context Agent not available');
        return;
    }

    const manualFiles = contextAgent.getManualContextFiles();

    if (manualFiles.length === 0) {
        vscode.window.showInformationMessage('No manually added context files to remove');
        return;
    }

    // Show quick pick to select file to remove
    const selectedFile = await vscode.window.showQuickPick(
        manualFiles.map(file => ({
            label: file,
            description: 'Manually added to context'
        })),
        {
            placeHolder: 'Select file to remove from context'
        }
    );

    if (selectedFile) {
        contextAgent.removeFileFromContext(selectedFile.label);
    }
}

/**
 * Helper function to get the context agent instance.
 * This is a placeholder - in the real implementation, this would be
 * accessed through the agent orchestrator or a service registry.
 */
function getContextAgentInstance(): ContextAgent | null {
    // TODO: Implement proper dependency injection/service locator pattern
    // For now, return null to indicate not implemented
    return null;
}