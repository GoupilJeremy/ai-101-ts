import * as vscode from 'vscode';
import { TelemetryReporter } from '@vscode/extension-telemetry';

export interface ITelemetryService {
    sendEvent(eventName: string, properties?: { [key: string]: string }, measurements?: { [key: string]: number }): void;
    sendError(error: Error, properties?: { [key: string]: string }, measurements?: { [key: string]: number }): void;
    dispose(): void;
}

/**
 * Service for handling opt-in telemetry.
 * Strictly follows privacy-first rules:
 * - Default is OFF (no collection).
 * - Sanitizes all outgoing data.
 * - Respects both VSCode global and extension-specific settings.
 */
export class TelemetryService implements ITelemetryService {
    private static instance: TelemetryService;
    private reporter: TelemetryReporter | undefined;
    private isOptedIn: boolean = false;
    private readonly INSTRUMENTATION_KEY = '00000000-0000-0000-0000-000000000000'; // Placeholder for MVP

    private constructor(private context: vscode.ExtensionContext) {
        this.updateConsentStatus();
    }

    public static getInstance(context: vscode.ExtensionContext): TelemetryService {
        if (!TelemetryService.instance) {
            TelemetryService.instance = new TelemetryService(context);
        }
        return TelemetryService.instance;
    }

    /**
     * Updates the local consent status based on global and extension settings.
     */
    public updateConsentStatus(): void {
        const extensionConsent = this.context.globalState.get<boolean>('telemetry.optIn', false);
        const vscodeConsent = vscode.env.isTelemetryEnabled;

        this.isOptedIn = extensionConsent && vscodeConsent;

        if (this.isOptedIn && !this.reporter) {
            this.initializeReporter();
        } else if (!this.isOptedIn && this.reporter) {
            this.disposeReporter();
        }
    }

    private initializeReporter(): void {
        // Newer versions of @vscode/extension-telemetry use a connection string
        const connectionString = `InstrumentationKey=${this.INSTRUMENTATION_KEY}`;

        // Only initialize if opted in
        if (this.isOptedIn) {
            this.reporter = new TelemetryReporter(connectionString);
            this.context.subscriptions.push(this.reporter);
        }
    }

    private disposeReporter(): void {
        if (this.reporter) {
            this.reporter.dispose();
            this.reporter = undefined;
        }
    }

    /**
     * Sends a telemetry event after sanitizing properties.
     */
    public sendEvent(eventName: string, properties?: { [key: string]: string }, measurements?: { [key: string]: number }): void {
        if (!this.isOptedIn || !this.reporter) {
            return;
        }

        const sanitizedProperties = this.sanitize(properties || {});
        this.reporter.sendTelemetryEvent(eventName, sanitizedProperties, measurements);
    }

    /**
     * Sends an error event after sanitizing properties.
     */
    public sendError(error: Error, properties?: { [key: string]: string }, measurements?: { [key: string]: number }): void {
        if (!this.isOptedIn || !this.reporter) {
            return;
        }

        const sanitizedProperties = this.sanitize({
            ...properties,
            errorMessage: error.message,
            stack: error.stack || ''
        });

        this.reporter.sendTelemetryErrorEvent('error', sanitizedProperties, measurements);
    }

    /**
     * Recursively sanitizes data to remove PII and sensitive info.
     * Rule: NEVER log user code or API keys.
     */
    private sanitize(data: { [key: string]: string }): { [key: string]: string } {
        const sanitized: { [key: string]: string } = {};
        const sensitivePatterns = [
            /sk-[a-zA-Z0-9]{32,}/g, // Generic API keys
            /ai101\.[a-zA-Z0-9.]+\.apiKey/g, // Specific extension keys
            /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, // Emails
            /(\/[\w.-]+){2,}/g, // Absolute file paths (unix)
            /([a-zA-Z]:\\[\w.-]+){2,}/g // Absolute file paths (windows)
        ];

        for (const [key, value] of Object.entries(data)) {
            // Skip keys that are inherently sensitive
            if (key.toLowerCase().includes('key') || key.toLowerCase().includes('token') || key.toLowerCase().includes('secret')) {
                sanitized[key] = '[REDACTED]';
                continue;
            }

            let sanitizedValue = value;
            for (const pattern of sensitivePatterns) {
                sanitizedValue = sanitizedValue.replace(pattern, '[REDACTED]');
            }

            sanitized[key] = sanitizedValue;
        }

        return sanitized;
    }

    public dispose(): void {
        this.disposeReporter();
    }
}
