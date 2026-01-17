import * as vscode from 'vscode';
import { ModeManager } from '../modes/mode-manager.js';
import { AgentMode } from '../modes/mode-types.js';

/**
 * Command handler to switch to Learning Mode.
 * Learning Mode provides pedagogical explanations and pattern annotations.
 */
export async function switchToLearningModeCommand(): Promise<void> {
    try {
        await ModeManager.getInstance().setMode(AgentMode.Learning);
        vscode.window.showInformationMessage('AI-101: Switched to Learning Mode');
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to switch to Learning Mode: ${error}`);
    }
}

/**
 * Command handler to switch to Expert Mode.
 * Expert Mode provides in-depth technical details and trade-offs.
 */
export async function switchToExpertModeCommand(): Promise<void> {
    try {
        await ModeManager.getInstance().setMode(AgentMode.Expert);
        vscode.window.showInformationMessage('AI-101: Switched to Expert Mode');
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to switch to Expert Mode: ${error}`);
    }
}

/**
 * Command handler to switch to Team Mode.
 * Team Mode shows visible labels and team-oriented metrics for screen sharing.
 */
export async function switchToTeamModeCommand(): Promise<void> {
    try {
        await ModeManager.getInstance().setMode(AgentMode.Team);
        vscode.window.showInformationMessage('AI-101: Switched to Team Mode');
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to switch to Team Mode: ${error}`);
    }
}
