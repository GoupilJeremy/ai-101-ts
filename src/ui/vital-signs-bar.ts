import * as vscode from 'vscode';
import { CostTracker } from '../llm/cost-tracker.js';
import { MetricsProvider } from './metrics-provider.js';

/**
 * Manages the "Vital Signs" Status Bar Item (FR30).
 * Displays real-time session cost, file count, and loading status.
 */
export class VitalSignsBar {
    private static instance: VitalSignsBar;
    private statusBarItem: vscode.StatusBarItem;
    private isLoading: boolean = false;
    private loadingText: string = '';

    private constructor() {
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.statusBarItem.command = 'ai-101-ts.showBudgetDetails';
        this.statusBarItem.tooltip = 'Click to see budget details';
        this.update();
        this.statusBarItem.show();
    }

    public static getInstance(): VitalSignsBar {
        if (!VitalSignsBar.instance) {
            VitalSignsBar.instance = new VitalSignsBar();
        }
        return VitalSignsBar.instance;
    }

    /**
     * Updates the display with latest cost and context data.
     */
    public update(): void {
        if (this.isLoading) {
            this.statusBarItem.text = `$(sync~spin) ${this.loadingText}`;
            this.statusBarItem.tooltip = 'Loading context files...';
            return;
        }

        const formattedCost = CostTracker.getInstance().getFormattedSessionCost();
        const metrics = MetricsProvider.getInstance();
        const fileCount = metrics.getCurrentFiles();
        const tokenCount = metrics.getCurrentTokens();

        this.statusBarItem.text = `$(credit-card) Session: ${formattedCost} | $(file) ${fileCount} files | $(symbol-keyword) ${tokenCount} tokens`;
        this.statusBarItem.tooltip = `Session cost: ${formattedCost}\nFiles loaded: ${fileCount}\nTokens used: ${tokenCount}\n\nClick to see budget details`;

        // Change color if approaching limit (80%)
        const stats = CostTracker.getInstance().getCurrentSessionCost();
        // Since we don't have the limit easily here without repeating logic,
        // we'll just keep it simple for now or fetch it from RateLimiter
    }

    /**
     * Sets the loading status with a custom message.
     */
    public setLoading(message: string): void {
        this.isLoading = true;
        this.loadingText = message;
        this.update();
    }

    /**
     * Clears the loading status.
     */
    public clearLoading(): void {
        this.isLoading = false;
        this.loadingText = '';
        this.update();
    }

    public getDisposable(): vscode.Disposable {
        return this.statusBarItem;
    }
}
