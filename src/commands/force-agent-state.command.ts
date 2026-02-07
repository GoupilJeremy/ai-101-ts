import * as vscode from 'vscode';
import { AgentType, AgentStatus } from '../agents/shared/agent.interface.js';
import { ExtensionStateManager } from '../state/index.js';

/**
 * Force an agent into a specific state (thinking, idle, working, etc.)
 * Primarily for debugging and UI testing.
 * 
 * Story 7.8: Implement Force Agent State Commands for Development and Debug
 * 
 * @param agentId - Optional agent identifier for programmatic invocation
 * @param state - Optional state for programmatic invocation
 * @param task - Optional task description
 * 
 * @example
 * // Interactive mode (via Command Palette)
 * await vscode.commands.executeCommand('ai-101-ts.forceAgentState');
 * 
 * @example
 * // Programmatic mode (via keybinding or API)
 * await vscode.commands.executeCommand('ai-101-ts.forceAgentState', 'architect', 'thinking');
 */
export async function forceAgentStateCommand(
    agentId?: AgentType,
    state?: AgentStatus,
    task?: string
): Promise<void> {
    const validAgents: AgentType[] = ['architect', 'coder', 'reviewer', 'context'];
    const validStatuses: AgentStatus[] = ['idle', 'thinking', 'working', 'success', 'error'];

    // Validate programmatic arguments if provided
    let selectedAgent: AgentType | undefined = agentId;
    let selectedStatus: AgentStatus | undefined = state;
    let selectedTask: string | undefined = task;

    // If agentId is provided but invalid, show error and fall back to interactive mode
    if (agentId && !validAgents.includes(agentId)) {
        vscode.window.showErrorMessage(
            `AI-101: Invalid agent ID "${agentId}". Valid agents: ${validAgents.join(', ')}`
        );
        selectedAgent = undefined;
    }

    // If state is provided but invalid, show error and fall back to interactive mode
    if (state && !validStatuses.includes(state)) {
        vscode.window.showErrorMessage(
            `AI-101: Invalid state "${state}". Valid states: ${validStatuses.join(', ')}`
        );
        selectedStatus = undefined;
    }

    // Interactive mode: Prompt for agent if not provided or invalid
    if (!selectedAgent) {
        const agentChoice = await vscode.window.showQuickPick(validAgents as string[], {
            placeHolder: 'Select Agent to Modify'
        });

        if (!agentChoice) {
            return; // User cancelled
        }

        selectedAgent = agentChoice as AgentType;
    }

    // Interactive mode: Prompt for status if not provided or invalid
    if (!selectedStatus) {
        const statusChoice = await vscode.window.showQuickPick(validStatuses as string[], {
            placeHolder: `Select status for ${selectedAgent}`
        });

        if (!statusChoice) {
            return; // User cancelled
        }

        selectedStatus = statusChoice as AgentStatus;
    }

    // Interactive mode: Prompt for task if not provided (only in fully interactive mode)
    if (!task && !agentId && !state) {
        const taskInput = await vscode.window.showInputBox({
            placeHolder: 'Enter optional task description',
            prompt: `Current task for ${selectedAgent} (optional)`
        });

        selectedTask = taskInput || undefined;
    }

    // Guard against undefined (should not happen after interactive checks)
    if (!selectedAgent || !selectedStatus) {
        return;
    }

    // Update the agent state
    ExtensionStateManager.getInstance().updateAgentState(
        selectedAgent,
        selectedStatus,
        selectedTask
    );

    // Show confirmation message
    const taskSuffix = selectedTask ? ` (Task: ${selectedTask})` : '';
    vscode.window.showInformationMessage(
        `AI-101: Agent ${selectedAgent} forced to ${selectedStatus}${taskSuffix}`
    );
}
