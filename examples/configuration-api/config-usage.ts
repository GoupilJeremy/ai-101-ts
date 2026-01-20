import * as vscode from 'vscode';
import { IAI101API, UIMode, UITransparency } from '../../src/api/index.js';

/**
 * Example demonstrating how to use the Suika Configuration API.
 * 
 * Shows how to read, write, and listen to configuration changes.
 */
export class ConfigurationAPIExample {
    constructor(private api: IAI101API) { }

    /**
     * Example 1: Reading configuration values
     */
    readConfiguration(): void {
        // Get current UI mode
        const currentMode = this.api.getConfig('ui.mode');
        console.log(`Current UI mode: ${currentMode}`);

        // Get transparency setting
        const transparency = this.api.getConfig('ui.transparency');
        console.log(`Transparency: ${transparency}`);

        // Get performance settings
        const maxTokens = this.api.getConfig('performance.maxTokens');
        console.log(`Max tokens: ${maxTokens}`);

        // Get telemetry setting
        const telemetryEnabled = this.api.getConfig('telemetry.enabled');
        console.log(`Telemetry enabled: ${telemetryEnabled}`);

        // Get accessibility settings
        const colorblindSettings = this.api.getConfig('accessibility.colorblind');
        console.log(`Colorblind mode:`, colorblindSettings);
    }

    /**
     * Example 2: Setting individual configuration values
     */
    async setIndividualValues(): Promise<void> {
        try {
            // Set UI mode to Expert (user scope)
            await this.api.setConfig('ui.mode', UIMode.Expert, 'user');
            console.log('UI mode set to Expert');

            // Set transparency to Medium (workspace scope)
            await this.api.setConfig('ui.transparency', UITransparency.Medium, 'workspace');
            console.log('Transparency set to Medium for this workspace');

            // Set max tokens (user scope is default)
            await this.api.setConfig('performance.maxTokens', 4096);
            console.log('Max tokens set to 4096');

            vscode.window.showInformationMessage('Suika configuration updated!');
        } catch (error) {
            console.error('Failed to update configuration:', error);
            vscode.window.showErrorMessage(`Failed to update configuration: ${error}`);
        }
    }

    /**
     * Example 3: Batch updating multiple settings
     */
    async batchUpdateConfiguration(): Promise<void> {
        try {
            // Update multiple settings at once
            await this.api.updateConfig({
                'ui.mode': UIMode.Learning,
                'ui.transparency': UITransparency.Full,
                'telemetry.enabled': true,
                'performance.maxTokens': 8192
            }, 'workspace');

            console.log('Batch configuration update complete');
            vscode.window.showInformationMessage('Suika configured for learning mode!');
        } catch (error) {
            console.error('Batch update failed:', error);
        }
    }

    /**
     * Example 4: Configuration presets
     */
    async applyPreset(preset: 'beginner' | 'expert' | 'team'): Promise<void> {
        switch (preset) {
            case 'beginner':
                await this.api.updateConfig({
                    'ui.mode': UIMode.Learning,
                    'ui.transparency': UITransparency.Medium,
                    'telemetry.enabled': true
                });
                vscode.window.showInformationMessage('Applied beginner preset');
                break;

            case 'expert':
                await this.api.updateConfig({
                    'ui.mode': UIMode.Expert,
                    'ui.transparency': UITransparency.Minimal,
                    'performanceMode.autoActivate': true
                });
                vscode.window.showInformationMessage('Applied expert preset');
                break;

            case 'team':
                await this.api.updateConfig({
                    'ui.mode': UIMode.Team,
                    'teamMode.largeText': true,
                    'teamMode.surveyEnabled': true,
                    'telemetry.enabled': true
                });
                vscode.window.showInformationMessage('Applied team preset');
                break;
        }
    }

    /**
     * Example 5: Conditional configuration based on workspace
     */
    async configureForWorkspace(): Promise<void> {
        const workspaceFolders = vscode.workspace.workspaceFolders;

        if (!workspaceFolders) {
            // No workspace open - use user settings
            await this.api.setConfig('ui.mode', UIMode.Expert, 'user');
            return;
        }

        // Check if this is a team workspace (has .git directory)
        const isTeamWorkspace = await this.checkForGitRepo(workspaceFolders[0].uri);

        if (isTeamWorkspace) {
            // Team workspace - enable team mode
            await this.api.updateConfig({
                'ui.mode': UIMode.Team,
                'teamMode.largeText': true,
                'telemetry.enabled': true
            }, 'workspace');
            console.log('Configured for team workspace');
        } else {
            // Solo workspace - use focus mode
            await this.api.setConfig('ui.mode', UIMode.Focus, 'workspace');
            console.log('Configured for solo workspace');
        }
    }

    private async checkForGitRepo(uri: vscode.Uri): Promise<boolean> {
        try {
            const gitUri = vscode.Uri.joinPath(uri, '.git');
            await vscode.workspace.fs.stat(gitUri);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Example 6: Listening to configuration changes
     */
    watchConfiguration(): vscode.Disposable {
        // VSCode's built-in configuration change listener
        return vscode.workspace.onDidChangeConfiguration((event) => {
            // Check if Suika configuration changed
            if (event.affectsConfiguration('ai101')) {
                console.log('Suika configuration changed!');

                // Re-read specific values
                const newMode = this.api.getConfig('ui.mode');
                console.log(`New UI mode: ${newMode}`);

                // React to specific changes
                if (event.affectsConfiguration('suika.ui.mode')) {
                    this.onUIModeChanged(newMode);
                }

                if (event.affectsConfiguration('suika.telemetry.enabled')) {
                    const telemetryEnabled = this.api.getConfig('telemetry.enabled');
                    this.onTelemetryChanged(telemetryEnabled);
                }
            }
        });
    }

    private onUIModeChanged(newMode: UIMode): void {
        console.log(`UI mode changed to: ${newMode}`);
        vscode.window.showInformationMessage(`Suika switched to ${newMode} mode`);
    }

    private onTelemetryChanged(enabled: boolean): void {
        console.log(`Telemetry ${enabled ? 'enabled' : 'disabled'}`);
    }
}

/**
 * Example usage in extension activation:
 */
export function activate(context: vscode.ExtensionContext) {
    const ai101Extension = vscode.extensions.getExtension('GoupilJeremy.suika');
    if (!ai101Extension) return;

    const api: IAI101API = ai101Extension.exports;
    const configExample = new ConfigurationAPIExample(api);

    // Register commands
    context.subscriptions.push(
        vscode.commands.registerCommand('example.readAI101Config', () => {
            configExample.readConfiguration();
        }),

        vscode.commands.registerCommand('example.applyBeginnerPreset', async () => {
            await configExample.applyPreset('beginner');
        }),

        vscode.commands.registerCommand('example.applyExpertPreset', async () => {
            await configExample.applyPreset('expert');
        }),

        vscode.commands.registerCommand('example.applyTeamPreset', async () => {
            await configExample.applyPreset('team');
        }),

        // Watch for configuration changes
        configExample.watchConfiguration()
    );

    // Auto-configure based on workspace
    configExample.configureForWorkspace();
}
