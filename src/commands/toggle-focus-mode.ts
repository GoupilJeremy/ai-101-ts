import * as vscode from 'vscode';
import { ModeManager } from '../modes/mode-manager.js';
import { AgentMode } from '../modes/mode-types.js';

/**
 * Toggle Focus Mode on/off.
 * If current mode is Focus, restore previous mode.
 * Otherwise, switch to Focus Mode (storing current mode as previous).
 */
export async function toggleFocusModeCommand(): Promise<void> {
    const modeManager = ModeManager.getInstance();
    const currentMode = modeManager.getCurrentMode();

    if (currentMode === AgentMode.Focus) {
        // Exiting Focus Mode - restore previous mode
        await modeManager.restorePreviousMode();
        vscode.window.showInformationMessage('Focus Mode deactivated');
    } else {
        // Entering Focus Mode - store current mode and switch
        await modeManager.setMode(AgentMode.Focus);
        vscode.window.showInformationMessage('Focus Mode activated - HUD hidden, agents still running');
    }
}
