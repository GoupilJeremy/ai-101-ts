import { AI101Error } from './base-error.js';

export class AuthenticationError extends AI101Error {
    constructor(code: 'AI101-AUTH-001' | 'AI101-AUTH-002', data: Record<string, string> = {}) {
        super('Authentication Error', code, false, data);
        this.name = 'AuthenticationError';
    }
}
