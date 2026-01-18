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
     * If the error has an associated troubleshooting article, provides a link to it.
     */
    public static handleError(error: any, troubleshootingArticle?: string): void {
        const message = error instanceof Error ? error.message : String(error);
        const code = error instanceof AI101Error ? ` (Code: ${error.code})` : '';

        this.log(`Error occurred: ${message}${code}`, 'ERROR');
        if (error instanceof Error && error.stack) {
            this.log(error.stack, 'ERROR');
        }

        // Only show critical or authentication errors to the user via UI
        if (error instanceof AI101Error && !error.isTransient) {
            // Determine troubleshooting article from error code or provided article
            const articleId = troubleshootingArticle || this.getArticleIdFromErrorCode(code);

            const actions = ['Open Logs'];
            if (articleId) {
                actions.unshift('Troubleshoot');
            }

            vscode.window.showErrorMessage(`AI 101 Error: ${message}`, ...actions).then(selection => {
                if (selection === 'Open Logs') {
                    this.outputChannel?.show();
                } else if (selection === 'Troubleshoot' && articleId) {
                    // Open troubleshooting article
                    vscode.commands.executeCommand('ai-101-ts.openTroubleshootingArticle', articleId);
                }
            });
        }
    }

    /**
     * Map error codes to troubleshooting article IDs
     */
    private static getArticleIdFromErrorCode(errorCode: string): string | undefined {
        const errorCodeMap: Record<string, string> = {
            'AI101-PERF-001': 'performance-slow-ui',
            'AI101-PERF-002': 'performance-high-memory',
            'AI101-LLM-001': 'connectivity-llm-timeout',
            'AI101-LLM-002': 'connectivity-llm-timeout',
            'AI101-NET-001': 'connectivity-network-errors',
            'AI101-NET-002': 'connectivity-network-errors',
            'AI101-UI-001': 'display-hud-not-showing',
            'AI101-UI-002': 'display-blank-webview',
            'AI101-AUTH-001': 'api-key-invalid',
            'AI101-AUTH-002': 'api-key-invalid',
            'AI101-AUTH-003': 'api-key-not-found',
            'AI101-CFG-001': 'config-preset-issues',
            'AI101-AGENT-001': 'agents-not-responding',
            'AI101-AGENT-002': 'agents-not-responding'
        };

        // Extract error code from string (e.g., " (Code: AI101-PERF-001)" -> "AI101-PERF-001")
        const match = errorCode.match(/AI101-[A-Z]+-\d+/);
        if (match) {
            return errorCodeMap[match[0]];
        }

        return undefined;
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
