import * as vscode from 'vscode';
import { AgentOrchestrator } from '../agents/orchestrator.js';
import { AgentType, AgentStatus } from '../agents/shared/agent.interface.js';
import { ExtensionStateManager } from '../state/index.js';

/**
 * Force an agent into a specific state (thinking, idle, working, etc.)
 * Primarily for debugging and UI testing.
 * Story 7.2: Implement Global Hotkey Configuration System
 */
export async function forceAgentStateCommand(): Promise<void> {
    const agents: AgentType[] = ['architect', 'coder', 'reviewer', 'context'];
    const statuses: AgentStatus[] = ['idle', 'thinking', 'working', 'success', 'error'];

    const selectedAgent = await vscode.window.showQuickPick(agents, {
        placeHolder: 'Select Agent to Modify'
    });

    if (!selectedAgent) {
        return;
    }

    const selectedStatus = await vscode.window.showQuickPick(statuses, {
        placeHolder: `Select status for ${selectedAgent}`
    });

    if (!selectedStatus) {
        return;
    }

    const task = await vscode.window.showInputBox({
        placeHolder: 'Enter optional task description',
        prompt: `Current task for ${selectedAgent} (optional)`
    });

    ExtensionStateManager.getInstance().updateAgentState(
        selectedAgent as AgentType,
        selectedStatus as AgentStatus,
        task || undefined
    );

    vscode.window.showInformationMessage(`AI-101: Agent ${selectedAgent} forced to ${selectedStatus}`);
}
