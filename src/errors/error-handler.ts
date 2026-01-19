import * as vscode from 'vscode';
import { AI101Error } from './base-error.js';
import { ErrorRegistry, IErrorDefinition } from './error-registry.js';

export interface RetryOptions {
    maxRetries?: number;
    initialDelayMs?: number;
    factor?: number;
}

export class ErrorHandler {
    private static outputChannel: vscode.OutputChannel;

    public static initialize() {
        if (!this.outputChannel) {
            this.outputChannel = vscode.window.createOutputChannel('AI 101');
        }
    }

    public static log(message: string, level: 'INFO' | 'WARNING' | 'ERROR' = 'INFO') {
        const timestamp = new Date().toISOString();
        this.outputChannel?.appendLine(`[${timestamp}] [${level}] ${message}`);
    }

    /**
     * Handles an error by logging it and displaying a user-friendly notification
     * based on the centralized ErrorRegistry.
     */
    public static handleError(error: any): void {
        let message = error instanceof Error ? error.message : String(error);
        let code = error instanceof AI101Error ? error.code : 'UNKNOWN';
        let data = error instanceof AI101Error ? error.data : {};

        this.log(`Error occurred: ${message} (Code: ${code})`, 'ERROR');
        if (error instanceof Error && error.stack) {
            this.log(error.stack, 'ERROR');
        }

        const errorDef = ErrorRegistry.getError(code);

        if (errorDef) {
            this.showErrorNotification(errorDef, data);
        } else if (error instanceof AI101Error && !error.isTransient) {
            // Fallback for AI101Errors not in registry
            this.showFallbackNotification(message, code);
        }
    }

    private static showErrorNotification(errorDef: IErrorDefinition, data: Record<string, string>): void {
        const title = errorDef.title;
        const message = this.formatTemplate(errorDef.messageTemplate, data);
        const reason = errorDef.reason;
        const suggestion = errorDef.suggestion;

        const fullMessage = `${title}: ${message}\n\n${reason}\n\n${suggestion}\n\nError Code: ${errorDef.code}`;

        const actions: string[] = ['Read Documentation'];

        if (errorDef.actionLabel && errorDef.actionCommand) {
            actions.unshift(errorDef.actionLabel);
        }

        actions.push('Open Logs');

        const showFn = this.getVscodeShowFunction(errorDef.severity);

        showFn(fullMessage, ...actions).then(selection => {
            if (selection === 'Open Logs') {
                this.outputChannel?.show();
            } else if (selection === 'Read Documentation') {
                this.openHelpLink(errorDef.documentationLink);
            } else if (selection === errorDef.actionLabel && errorDef.actionCommand) {
                this.executeAction(errorDef.actionCommand);
            }
        });
    }

    private static showFallbackNotification(message: string, code: string): void {
        const actions = ['Open Logs'];
        vscode.window.showErrorMessage(`AI 101 Error: ${message} (Code: ${code})`, ...actions).then(selection => {
            if (selection === 'Open Logs') {
                this.outputChannel?.show();
            }
        });
    }

    private static getVscodeShowFunction(severity: string) {
        switch (severity) {
            case 'Info': return vscode.window.showInformationMessage;
            case 'Warning': return vscode.window.showWarningMessage;
            case 'Error':
            default: return vscode.window.showErrorMessage;
        }
    }

    private static formatTemplate(template: string, data: Record<string, string>): string {
        let result = template;
        for (const [key, value] of Object.entries(data)) {
            result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
        }
        return result;
    }

    private static async openHelpLink(url: string): Promise<void> {
        const config = vscode.workspace.getConfiguration('ai101');
        const openIn = config.get<string>('errors.openLinksIn', 'SimpleBrowser');

        if (openIn === 'SimpleBrowser') {
            try {
                await vscode.commands.executeCommand('simpleBrowser.show', url);
            } catch (err) {
                // Fallback to external browser if SimpleBrowser fails
                await vscode.env.openExternal(vscode.Uri.parse(url));
            }
        } else {
            await vscode.env.openExternal(vscode.Uri.parse(url));
        }
    }

    private static executeAction(command: string): void {
        // Handle commands with arguments (e.g., workbench.action.openSettings?ai101)
        const [cmd, args] = command.split('?');
        if (args) {
            vscode.commands.executeCommand(cmd, args);
        } else {
            vscode.commands.executeCommand(cmd);
        }
    }

    /**
     * Executes a task with exponential backoff retry logic.
     */
    public static async handleWithRetry<T>(
        task: () => Promise<T>,
        options: RetryOptions = {}
    ): Promise<T> {
        const {
            maxRetries = 3,
            initialDelayMs = 1000,
            factor = 2
        } = options;

        let lastError: any;
        let delay = initialDelayMs;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return await task();
            } catch (error) {
                lastError = error;

                // Only retry if the error is explicitly marked as transient
                const isTransient = error instanceof AI101Error && error.isTransient;

                if (!isTransient || attempt === maxRetries) {
                    break;
                }

                this.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms delay due to: ${error.message}`, 'WARNING');

                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= factor;
            }
        }

        this.handleError(lastError);
        throw lastError;
    }
}
