import * as vscode from 'vscode';
import { ExtensionStateManager } from '../state/extension-state-manager.js';
import { AgentType } from '../agents/shared/agent.interface.js';

/**
 * Command handler to toggle visibility of specific agents.
 * Uses QuickPick with multi-select to allow showing/hiding individual agents.
 */
export async function toggleAgentVisibilityCommand(): Promise<void> {
    try {
        const stateManager = ExtensionStateManager.getInstance();

        // Define available agents
        const agents: Array<{ label: string; value: AgentType; description: string }> = [
            { label: 'Architect', value: 'architect', description: 'Project analysis and architecture detection' },
            { label: 'Coder', value: 'coder', description: 'Code generation and implementation' },
            { label: 'Reviewer', value: 'reviewer', description: 'Code review and risk identification' },
            { label: 'Context', value: 'context', description: 'File loading and context management' }
        ];

        // Get current visibility states
        const currentStates = agents.map(agent => {
            const agentState = stateManager.getAgentState(agent.value);
            const isVisible = agentState?.visible !== false; // Default to visible if not set
            return {
                ...agent,
                picked: isVisible
            };
        });

        const selected = await vscode.window.showQuickPick(currentStates, {
            canPickMany: true,
            placeHolder: 'Select agents to show (unselected agents will be hidden)',
            title: 'Toggle Agent Visibility'
        });

        if (selected !== undefined) {
            // Update visibility for all agents
            agents.forEach(agent => {
                const shouldBeVisible = selected.some(s => s.value === agent.value);
                stateManager.updateAgentVisibility(agent.value, shouldBeVisible);
            });

            const visibleCount = selected.length;
            const hiddenCount = agents.length - visibleCount;
            vscode.window.showInformationMessage(
                `Suika: ${visibleCount} agent(s) visible, ${hiddenCount} hidden`
            );
        }
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to toggle agent visibility: ${error}`);
    }
}

/**
 * Command handler to open the integrated documentation.
 * Opens the README.md file in a preview pane.
 */
export async function openDocumentationCommand(): Promise<void> {
    try {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            vscode.window.showWarningMessage('Suika: No workspace folder found');
            return;
        }

        // Try to find README.md in the workspace
        const readmePath = vscode.Uri.joinPath(workspaceFolders[0].uri, 'README.md');

        try {
            // Open README in preview mode
            await vscode.commands.executeCommand('markdown.showPreview', readmePath);
            vscode.window.showInformationMessage('Suika: Documentation opened');
        } catch {
            // Fallback: open as text file if preview fails
            const doc = await vscode.workspace.openTextDocument(readmePath);
            await vscode.window.showTextDocument(doc, { preview: true });
        }
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to open documentation: ${error}`);
    }
}
