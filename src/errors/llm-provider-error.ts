import { AI101Error } from './base-error.js';

export class LLMProviderError extends AI101Error {
    constructor(message: string, code: string, isTransient: boolean = false, data: Record<string, string> = {}) {
        super(message, code, isTransient, data);
        this.name = 'LLMProviderError';
    }
}
