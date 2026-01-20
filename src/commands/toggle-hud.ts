import * as vscode from 'vscode';
import { ExtensionStateManager } from '../state/index.js';

/**
 * Toggle the visibility of the HUD in the webview.
 * Story 7.2: Implement Global Hotkey Configuration System
 */
export async function toggleHUDCommand(): Promise<void> {
    const stateManager = ExtensionStateManager.getInstance();
    stateManager.toggleHUD();

    const isVisible = stateManager.isHUDVisible();
    vscode.window.showInformationMessage(`Suika: HUD ${isVisible ? 'visible' : 'hidden'}`);
}
