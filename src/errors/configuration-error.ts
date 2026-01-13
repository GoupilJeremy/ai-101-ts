export class AI101Error extends Error {
    constructor(
        message: string,
        public readonly code: string,
        public readonly isTransient: boolean = false
    ) {
        super(message);
        this.name = 'AI101Error';
    }
}

export class ConfigurationError extends AI101Error {
    constructor(message: string) {
        super(message, 'CONFIGURATION_ERROR', false);
        this.name = 'ConfigurationError';
    }
}
