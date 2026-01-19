import * as vscode from 'vscode';
import { ConfigurationManager } from '../config/configuration-manager.js';
import { BudgetExceededError } from '../errors/budget-exceeded-error.js';

/**
 * Tracks and enforces LLM token and cost budgets per session.
 */
export class RateLimiter {
    private static instance: RateLimiter;

    private totalTokens: number = 0;
    private totalCost: number = 0;
    private hasWarned80: boolean = false;

    private constructor() { }

    public static getInstance(): RateLimiter {
        if (!RateLimiter.instance) {
            RateLimiter.instance = new RateLimiter();
        }
        return RateLimiter.instance;
    }

    /**
     * Resets the session budget.
     */
    public reset(): void {
        this.totalTokens = 0;
        this.totalCost = 0;
        this.hasWarned80 = false;
    }

    /**
     * Checks if the next call would exceed the budget.
     * Throws BudgetExceededError if limit reached.
     */
    public checkBudget(): void {
        const settings = ConfigurationManager.getInstance().getSettings();
        const tokenLimit = settings.performance.tokenBudget;
        const costLimit = settings.performance.costBudget;

        if (this.totalTokens >= tokenLimit) {
            throw new BudgetExceededError({ type: 'tokens' });
        }

        if (this.totalCost >= costLimit) {
            throw new BudgetExceededError({ type: 'cost' });
        }
    }

    /**
     * Records consumption of tokens and cost.
     * Triggers warning at 80% usage.
     */
    public recordUsage(tokens: number, cost: number): void {
        this.totalTokens += tokens;
        this.totalCost += cost;

        this.checkWarnings();
    }

    /**
     * Returns current session statistics.
     */
    public getStats() {
        const settings = ConfigurationManager.getInstance().getSettings();
        return {
            tokens: this.totalTokens,
            cost: this.totalCost,
            tokenLimit: settings.performance.tokenBudget,
            costLimit: settings.performance.costBudget,
            tokenPercent: (this.totalTokens / settings.performance.tokenBudget) * 100,
            costPercent: (this.totalCost / settings.performance.costBudget) * 100
        };
    }

    private checkWarnings(): void {
        if (this.hasWarned80) {return;}

        const stats = this.getStats();
        if (stats.tokenPercent >= 80 || stats.costPercent >= 80) {
            this.hasWarned80 = true;
            vscode.window.showWarningMessage(
                `AI-101: You have reached 80% of your session budget ($${this.totalCost.toFixed(2)} / $${stats.costLimit.toFixed(2)}).`
            );
        }
    }
}
