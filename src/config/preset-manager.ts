import * as vscode from 'vscode';
import { IPreset, PRESETS } from './presets';
import { ConfigurationError } from '../errors/configuration-error';

export class PresetManager {
    public async applyPreset(presetName: string): Promise<void> {
        const preset = PRESETS[presetName];
        if (!preset) {
            throw new ConfigurationError({ preset: presetName });
        }

        const config = vscode.workspace.getConfiguration('ai101');
        const settings = preset.config;

        // We apply updates sequentially. In a real app we might batch or handle errors more gracefully.
        // Also note that update() writes to settings.json. We choose ConfigurationTarget.Global (User Settings) by default
        // or Workspace if a workspace is open. VSCode API defaults to Workspace if open, else Global.
        // Explicitly, let's use undefined target which implies "best available".

        if (settings.llm) {
            await config.update('llm.provider', settings.llm.provider, vscode.ConfigurationTarget.Global);
        }

        if (settings.ui) {
            if (settings.ui.transparency) {
                await config.update('ui.transparency', settings.ui.transparency, vscode.ConfigurationTarget.Global);
            }
            if (settings.ui.mode) {
                await config.update('ui.mode', settings.ui.mode, vscode.ConfigurationTarget.Global);
            }
        }

        if (settings.performance) {
            if (settings.performance.maxTokens) {
                await config.update('performance.maxTokens', settings.performance.maxTokens, vscode.ConfigurationTarget.Global);
            }
        }

        if (settings.telemetry) {
            if (settings.telemetry.enabled !== undefined) {
                await config.update('telemetry.enabled', settings.telemetry.enabled, vscode.ConfigurationTarget.Global);
            }
        }
    }

    public getAvailablePresets(): IPreset[] {
        return Object.values(PRESETS);
    }
}
