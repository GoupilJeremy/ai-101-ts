import { RateLimiter } from './rate-limiter.js';

/**
 * Handles LLM cost tracking and formatting for the UI.
 * Relies on RateLimiter for session-wide aggregation.
 */
export class CostTracker {
    private static instance: CostTracker;

    private constructor() { }

    public static getInstance(): CostTracker {
        if (!CostTracker.instance) {
            CostTracker.instance = new CostTracker();
        }
        return CostTracker.instance;
    }

    /**
     * Returns the formatted current session cost (e.g., "$0.05").
     */
    public getFormattedSessionCost(): string {
        const cost = this.getCurrentSessionCost();
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 4 // Allow more precision if very small
        }).format(cost);
    }

    /**
     * Returns the raw session cost in USD.
     */
    public getCurrentSessionCost(): number {
        return RateLimiter.getInstance().getStats().cost;
    }

    /**
     * Resets the cost for a new session.
     */
    public reset(): void {
        RateLimiter.getInstance().reset();
    }
}
