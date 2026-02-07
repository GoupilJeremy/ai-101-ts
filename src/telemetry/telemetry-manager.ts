import * as vscode from 'vscode';
import { TelemetryService } from './telemetry-service';

export class TelemetryManager {
    private static readonly CONSENT_VIEWED_KEY = 'telemetry.hasSeenConsentDialog';
    private static readonly CONSENT_OPT_IN_KEY = 'telemetry.optIn';

    constructor(private context: vscode.ExtensionContext) { }

    /**
     * Checks if this is the first run and shows the consent dialog if needed.
     */
    public async checkFirstRun(): Promise<void> {
        const hasSeenDialog = this.context.globalState.get<boolean>(TelemetryManager.CONSENT_VIEWED_KEY, false);

        if (!hasSeenDialog) {
            await this.showConsentDialog();
        }
    }

    /**
     * Shows the telemetry consent information message.
     */
    public async showConsentDialog(): Promise<void> {
        const message = "AI-101: Help us improve by opting into telemetry? This collects usage data (no code or keys) to help improve agent performance. Data is encrypted and anonymized after 90 days.";
        const accept = "Accept";
        const decline = "Decline";
        const learnMore = "Learn More";

        const selection = await vscode.window.showInformationMessage(message, accept, decline, learnMore);

        if (selection === accept) {
            await this.updateConsent(true);
        } else if (selection === decline) {
            await this.updateConsent(false);
        } else if (selection === learnMore) {
            await vscode.env.openExternal(vscode.Uri.parse('https://github.com/GoupilJeremy/ai-101-ts/blob/main/PRIVACY.md'));
            // Show dialog again after learning more
            await this.showConsentDialog();
            return;
        }

        await this.context.globalState.update(TelemetryManager.CONSENT_VIEWED_KEY, true);
    }

    /**
     * Updates the consent status and refreshes the TelemetryService.
     */
    public async updateConsent(optIn: boolean): Promise<void> {
        await this.context.globalState.update(TelemetryManager.CONSENT_OPT_IN_KEY, optIn);
        TelemetryService.getInstance(this.context).updateConsentStatus();

        const statusMessage = optIn ? "Telemetry enabled. Thank you!" : "Telemetry disabled.";
        vscode.window.showInformationMessage(`AI-101: ${statusMessage}`);
    }

    /**
     * Returns the current consent status.
     */
    public getConsentStatus(): boolean {
        return this.context.globalState.get<boolean>(TelemetryManager.CONSENT_OPT_IN_KEY, false);
    }
}
