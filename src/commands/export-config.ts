import * as vscode from 'vscode';
import { ConfigurationIO } from '../config/configuration-io.js';

export async function exportConfigCommand() {
    const io = new ConfigurationIO();
    const data = io.generateExportData();
    const jsonString = JSON.stringify(data, null, 4);

    const options: vscode.SaveDialogOptions = {
        defaultUri: vscode.Uri.file('ai101-config.json'),
        filters: {
            'JSON Files': ['json']
        },
        title: 'Export Suika Configuration'
    };

    const fileUri = await vscode.window.showSaveDialog(options);

    if (fileUri) {
        try {
            const buffer = Buffer.from(jsonString, 'utf8');
            await vscode.workspace.fs.writeFile(fileUri, buffer);
            vscode.window.showInformationMessage(`Configuration exported successfully to ${fileUri.fsPath}`);
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to export configuration: ${error}`);
        }
    }
}
