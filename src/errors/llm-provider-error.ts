import { AI101Error } from './configuration-error.js';

export class LLMProviderError extends AI101Error {
    constructor(message: string, code: string, isTransient: boolean = false) {
        super(message, code, isTransient);
        this.name = 'LLMProviderError';
    }
}
