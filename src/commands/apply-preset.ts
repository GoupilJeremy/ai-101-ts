import * as vscode from 'vscode';
import { PresetManager } from '../config/preset-manager';

export async function applyPresetCommand() {
    const manager = new PresetManager();
    const presets = manager.getAvailablePresets();

    // Map presets to QuickPick items
    const items: vscode.QuickPickItem[] = presets.map(p => ({
        label: p.name,
        description: p.description,
        detail: `Mode: ${p.config.ui?.mode || 'default'}, Transparency: ${p.config.ui?.transparency || 'default'}`
    }));

    const selected = await vscode.window.showQuickPick(items, {
        placeHolder: 'Select a configuration preset to apply'
    });

    if (selected) {
        // Reverse map label to preset key or store key in item. 
        // Simplest: use label match since names are unique keys in our PRESETS const usually.
        // But better is to find the preset object.
        const preset = presets.find(p => p.name === selected.label);
        if (preset) {
            // map name back to key if needed, or just pass something that works.
            // Our manager expects keys like 'solo', 'team'. The prompt shows Names 'Solo Developer'.
            // Let's find the key.
            const entries = Object.entries(require('../config/presets').PRESETS);
            const foundEntry = entries.find(([key, val]) => (val as any).name === selected.label);

            if (foundEntry) {
                try {
                    await manager.applyPreset(foundEntry[0]);
                    vscode.window.showInformationMessage(`Applied preset: ${preset.name}`);
                } catch (e) {
                    vscode.window.showErrorMessage(`Failed to apply preset: ${e}`);
                }
            }
        }
    }
}
