import { AI101Error } from './base-error.js';

/**
 * Error thrown when LLM budget (tokens or cost) is exceeded.
 */
export class BudgetExceededError extends AI101Error {
    constructor(data: { type: string }, isTransient: boolean = false) {
        super('Budget Exceeded', 'AI101-BUD-001', isTransient, data as any);
        this.name = 'BudgetExceededError';
    }
}
