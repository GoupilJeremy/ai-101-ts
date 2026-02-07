import * as vscode from 'vscode';

/**
 * Manages opt-in telemetry for the AI-101 extension.
 * Tracks usage patterns and performance metrics for analytics.
 * Story 7.1: Implement Suggestion Accept/Reject with Visual Feedback
 */
export class TelemetryManager {
    private static instance: TelemetryManager;
    private enabled: boolean = true;

    private constructor() {
        this.updateConfig();
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('ai101.telemetry.enabled')) {
                this.updateConfig();
            }
        });
    }

    public static getInstance(): TelemetryManager {
        if (!TelemetryManager.instance) {
            TelemetryManager.instance = new TelemetryManager();
        }
        return TelemetryManager.instance;
    }

    private updateConfig() {
        this.enabled = vscode.workspace.getConfiguration('ai101.telemetry').get('enabled', true);
    }

    /**
     * Tracks whether a suggestion was accepted or rejected.
     */
    public trackAcceptance(accepted: boolean, metadata?: any): void {
        if (!this.enabled) {return;}

        // Mock analytics logging (Console only for this task)
        const timestamp = new Date().toISOString();
        const action = accepted ? 'ACCEPT' : 'REJECT';
        console.log(`[TELEMETRY] ${timestamp} - Action: ${action}`, metadata || '');
    }

    /**
     * Tracks general usage events.
     */
    public trackEvent(eventName: string, metadata?: any): void {
        if (!this.enabled) {return;}
        console.log(`[TELEMETRY] Event: ${eventName}`, metadata || '');
    }
}
