import * as vscode from 'vscode';
import { IConfiguration } from './configuration-manager';

export class ConfigurationIO {
    private readonly section = 'ai101';

    /**
     * Generates a JSON object containing all ai101 settings, excluding secrets.
     */
    public generateExportData(): any {
        const config = vscode.workspace.getConfiguration(this.section);

        // We manually pick keys to ensure no secrets or unwanted internal state is exported
        return {
            llm: {
                provider: config.get('llm.provider')
            },
            ui: {
                transparency: config.get('ui.transparency'),
                mode: config.get('ui.mode')
            },
            performance: {
                maxTokens: config.get('performance.maxTokens')
            },
            telemetry: {
                enabled: config.get('telemetry.enabled')
            }
        };
    }

    /**
     * Validates that the imported pulse follows the expected schema.
     */
    public validateImportData(data: any): data is Partial<IConfiguration> {
        if (!data || typeof data !== 'object') {
            return false;
        }

        // Basic check for sections
        const validProviders = ['openai', 'anthropic', 'custom'];
        const validTransparency = ['minimal', 'medium', 'full'];
        const validModes = ['learning', 'expert', 'focus', 'team', 'performance'];

        if (data.llm?.provider && !validProviders.includes(data.llm.provider)) {
            return false;
        }

        if (data.ui?.transparency && !validTransparency.includes(data.ui.transparency)) {
            return false;
        }

        if (data.ui?.mode && !validModes.includes(data.ui.mode)) {
            return false;
        }

        if (data.performance?.maxTokens !== undefined && typeof data.performance.maxTokens !== 'number') {
            return false;
        }

        if (data.telemetry?.enabled !== undefined && typeof data.telemetry.enabled !== 'boolean') {
            return false;
        }

        return true;
    }
}
