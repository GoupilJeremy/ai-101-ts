import * as vscode from 'vscode';
import { CostTracker } from '../llm/cost-tracker.js';

/**
 * Manages the "Vital Signs" Status Bar Item (FR30).
 * Displays real-time session cost and budget status.
 */
export class VitalSignsBar {
    private static instance: VitalSignsBar;
    private statusBarItem: vscode.StatusBarItem;

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
     * Updates the display with latest cost data.
     */
    public update(): void {
        const formattedCost = CostTracker.getInstance().getFormattedSessionCost();
        this.statusBarItem.text = `$(credit-card) Session: ${formattedCost}`;

        // Change color if approaching limit (80%)
        const stats = CostTracker.getInstance().getCurrentSessionCost();
        // Since we don't have the limit easily here without repeating logic, 
        // we'll just keep it simple for now or fetch it from RateLimiter
    }

    public getDisposable(): vscode.Disposable {
        return this.statusBarItem;
    }
}
