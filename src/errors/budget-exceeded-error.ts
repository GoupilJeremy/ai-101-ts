import { AI101Error } from './configuration-error.js';

/**
 * Error thrown when LLM budget (tokens or cost) is exceeded.
 */
export class BudgetExceededError extends AI101Error {
    constructor(message: string, isTransient: boolean = false) {
        super(message, 'BUDGET_EXCEEDED', isTransient);
        this.name = 'BudgetExceededError';
    }
}
