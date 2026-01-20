import * as vscode from 'vscode';
import { ConfigurationIO } from '../config/configuration-io.js';

export async function importConfigCommand() {
    const options: vscode.OpenDialogOptions = {
        canSelectMany: false,
        filters: {
            'JSON Files': ['json']
        },
        title: 'Import Suika Configuration'
    };

    const fileUris = await vscode.window.showOpenDialog(options);

    if (fileUris && fileUris.length > 0) {
        const fileUri = fileUris[0];
        try {
            const buffer = await vscode.workspace.fs.readFile(fileUri);
            const content = Buffer.from(buffer).toString('utf8');
            const data = JSON.parse(content);

            const io = new ConfigurationIO();
            if (!io.validateImportData(data)) {
                vscode.window.showErrorMessage('Invalid configuration file format.');
                return;
            }

            const config = vscode.workspace.getConfiguration('ai101');

            // Apply settings
            if (data.llm?.provider) {
                await config.update('llm.provider', data.llm.provider, vscode.ConfigurationTarget.Global);
            }

            if (data.ui) {
                if (data.ui.transparency) {
                    await config.update('ui.transparency', data.ui.transparency, vscode.ConfigurationTarget.Global);
                }
                if (data.ui.mode) {
                    await config.update('ui.mode', data.ui.mode, vscode.ConfigurationTarget.Global);
                }
            }

            if (data.performance?.maxTokens !== undefined) {
                await config.update('performance.maxTokens', data.performance.maxTokens, vscode.ConfigurationTarget.Global);
            }

            if (data.telemetry?.enabled !== undefined) {
                await config.update('telemetry.enabled', data.telemetry.enabled, vscode.ConfigurationTarget.Global);
            }

            vscode.window.showInformationMessage('Configuration imported successfully.');
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to import configuration: ${error}`);
        }
    }
}
