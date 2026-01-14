import * as vscode from 'vscode';
import { ModeManager } from '../modes/mode-manager.js';
import { AgentMode } from '../modes/mode-types.js';

/**
 * Toggle Performance Mode on/off.
 * If current mode is Performance, restore previous mode.
 * Otherwise, switch to Performance Mode (storing current mode as previous).
 */
export async function togglePerformanceModeCommand(): Promise<void> {
    const modeManager = ModeManager.getInstance();
    const currentMode = modeManager.getCurrentMode();

    if (currentMode === AgentMode.Performance) {
        // Exiting Performance Mode - restore previous mode
        await modeManager.restorePreviousMode();
        vscode.window.showInformationMessage('Performance Mode deactivated');
    } else {
        // Entering Performance Mode - store current mode and switch
        await modeManager.setMode(AgentMode.Performance);
        vscode.window.showInformationMessage('Performance Mode activated - Optimized for low-end machines');
    }
}