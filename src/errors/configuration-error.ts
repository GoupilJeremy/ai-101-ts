export class AI101Error extends Error {
    constructor(message: string, public code: string) {
        super(message);
        this.name = 'AI101Error';
    }
}

export class ConfigurationError extends AI101Error {
    constructor(message: string) {
        super(message, 'CONFIGURATION_ERROR');
        this.name = 'ConfigurationError';
    }
}
