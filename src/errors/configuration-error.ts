import { AI101Error } from './base-error.js';

export class ConfigurationError extends AI101Error {
    constructor(data: Record<string, string>) {
        super(`Configuration Error: ${data.setting || 'unknown'}`, 'AI101-CFG-001', false, data);
        this.name = 'ConfigurationError';
    }
}
