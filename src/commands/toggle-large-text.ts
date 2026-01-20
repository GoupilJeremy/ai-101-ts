import * as vscode from 'vscode';

/**
 * Toggle Large Text Mode for Team Mode screen sharing visibility.
 * Applies 125% scale to HUD elements for better readability.
 */
export async function toggleLargeTextCommand(): Promise<void> {
    const config = vscode.workspace.getConfiguration('suika.teamMode');
    const currentValue = config.get<boolean>('largeText', false);
    const newValue = !currentValue;

    await config.update('largeText', newValue, vscode.ConfigurationTarget.Workspace);

    const message = newValue
        ? 'Large Text Mode enabled (125% scale)'
        : 'Large Text Mode disabled';

    vscode.window.showInformationMessage(message);

    console.log(`Suika: Large Text Mode ${newValue ? 'enabled' : 'disabled'}`);
}
