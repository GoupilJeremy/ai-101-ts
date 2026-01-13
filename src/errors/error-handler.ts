import * as vscode from 'vscode';
import { AI101Error } from './configuration-error.js';

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
     * Handles an error by logging it and optionally showing a message to the user.
     */
    public static handleError(error: any): void {
        const message = error instanceof Error ? error.message : String(error);
        const code = error instanceof AI101Error ? ` (Code: ${error.code})` : '';

        this.log(`Error occurred: ${message}${code}`, 'ERROR');
        if (error instanceof Error && error.stack) {
            this.log(error.stack, 'ERROR');
        }

        // Only show critical or authentication errors to the user via UI
        if (error instanceof AI101Error && !error.isTransient) {
            vscode.window.showErrorMessage(`AI 101 Error: ${message}`, 'Open Logs').then(selection => {
                if (selection === 'Open Logs') {
                    this.outputChannel?.show();
                }
            });
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
