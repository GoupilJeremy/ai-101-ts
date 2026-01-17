import * as vscode from 'vscode';
import { TelemetryManager } from '../telemetry/telemetry-manager';

/**
 * Registers telemetry-related commands.
 */
export function registerTelemetryCommands(context: vscode.ExtensionContext, telemetryManager: TelemetryManager): void {

    // Command to configure telemetry settings
    const configureTelemetry = vscode.commands.registerCommand('ai-101-ts.configureTelemetry', async () => {
        const currentStatus = telemetryManager.getConsentStatus() ? 'Enabled' : 'Disabled';
        const options = [
            { label: 'Enable Telemetry', description: 'Enable data collection', action: 'enable' },
            { label: 'Disable Telemetry', description: 'Stop data collection', action: 'disable' },
            { label: 'View Privacy Policy', description: 'Read what data we collect', action: 'privacy' },
            { label: 'Export My Data', description: 'Download collected usage data', action: 'export' },
            { label: 'Delete My Data', description: 'Request data deletion', action: 'delete' }
        ];

        const selection = await vscode.window.showQuickPick(options, {
            placeHolder: `Telemetry is currently: ${currentStatus}`
        });

        if (!selection) return;

        switch (selection.action) {
            case 'enable':
                await telemetryManager.updateConsent(true);
                break;
            case 'disable':
                await telemetryManager.updateConsent(false);
                break;
            case 'privacy':
                await vscode.env.openExternal(vscode.Uri.parse('https://github.com/GoupilJeremy/ai-101-ts/blob/main/PRIVACY.md'));
                break;
            case 'export':
                vscode.window.showInformationMessage('AI-101: Your usage data export has been requested. You will receive an email shortly (MVP Placeholder).');
                break;
            case 'delete':
                const confirm = await vscode.window.showWarningMessage(
                    'AI-101: Are you sure you want to delete your telemetry data? This will clear your local ID and send a deletion request.',
                    { modal: true },
                    'Delete Everything'
                );
                if (confirm === 'Delete Everything') {
                    await telemetryManager.updateConsent(false);
                    vscode.window.showInformationMessage('AI-101: Data deletion request sent.');
                }
                break;
        }
    });

    context.subscriptions.push(configureTelemetry);
}
