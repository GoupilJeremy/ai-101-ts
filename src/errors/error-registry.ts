
export type ErrorSeverity = 'Info' | 'Warning' | 'Error';

export interface IErrorDefinition {
    code: string;
    title: string;
    messageTemplate: string;
    reason: string;
    suggestion: string;
    documentationLink: string;
    severity: ErrorSeverity;
    actionLabel?: string;
    actionCommand?: string;
}

export const DOCS_BASE_URL = 'https://github.com/GoupilJeremy/ai-101-ts/wiki/Troubleshooting';

export const ERROR_REGISTRY: Record<string, IErrorDefinition> = {
    // Auth Errors
    'AI101-AUTH-001': {
        code: 'AI101-AUTH-001',
        title: 'Invalid API Key',
        messageTemplate: 'The API key for {{provider}} is invalid or expired.',
        reason: 'The service rejected the provided authentication credentials.',
        suggestion: 'Please verify your API key in the provider dashboard and update it in your settings.',
        documentationLink: `${DOCS_BASE_URL}#api-key-invalid`,
        severity: 'Error',
        actionLabel: 'Update API Key',
        actionCommand: 'ai101.settings.configureApiKey'
    },
    'AI101-AUTH-002': {
        code: 'AI101-AUTH-002',
        title: 'API Key Not Found',
        messageTemplate: 'No API key was found for {{provider}}.',
        reason: 'The extension requires an API key to communicate with the LLM provider.',
        suggestion: 'Please configure an API key for the selected provider.',
        documentationLink: `${DOCS_BASE_URL}#api-key-not-found`,
        severity: 'Error',
        actionLabel: 'Configure API Key',
        actionCommand: 'ai101.settings.configureApiKey'
    },

    // LLM Errors
    'AI101-LLM-001': {
        code: 'AI101-LLM-001',
        title: 'LLM Service Timeout',
        messageTemplate: 'The request to {{provider}} timed out.',
        reason: 'The service is taking too long to respond, possibly due to high load or network issues.',
        suggestion: 'Please try again in a moment. If the issue persists, check the provider\'s status page.',
        documentationLink: `${DOCS_BASE_URL}#connectivity-llm-timeout`,
        severity: 'Warning'
    },

    // Budget Errors
    'AI101-BUD-001': {
        code: 'AI101-BUD-001',
        title: 'Budget Exceeded',
        messageTemplate: 'The {{type}} budget has been exceeded.',
        reason: 'The session has reached its configured limit for tokens or cost.',
        suggestion: 'You can increase your budget in the settings or wait for the next reset period.',
        documentationLink: `${DOCS_BASE_URL}#budget-exceeded`,
        severity: 'Warning',
        actionLabel: 'Increase Budget',
        actionCommand: 'workbench.action.openSettings?ai101.performance.maxTokens'
    },

    // Network Errors
    'AI101-NET-001': {
        code: 'AI101-NET-001',
        title: 'Network Connection Error',
        messageTemplate: 'Unable to reach the {{provider}} server.',
        reason: 'There is a problem with your internet connection or the provider\'s server is down.',
        suggestion: 'Check your internet connection and proxy settings.',
        documentationLink: `${DOCS_BASE_URL}#connectivity-network-errors`,
        severity: 'Error'
    },

    // Configuration Errors
    'AI101-CFG-001': {
        code: 'AI101-CFG-001',
        title: 'Configuration Error',
        messageTemplate: 'The setting "{{setting}}" has an invalid value.',
        reason: 'The provided configuration value does not match the expected format or range.',
        suggestion: 'Please check your settings and correct the invalid value.',
        documentationLink: `${DOCS_BASE_URL}#config-preset-issues`,
        severity: 'Warning',
        actionLabel: 'Open Settings',
        actionCommand: 'workbench.action.openSettings?ai101'
    },

    // Agent Errors
    'AI101-AGENT-001': {
        code: 'AI101-AGENT-001',
        title: 'Agent Not Responding',
        messageTemplate: 'The {{agent}} agent failed to respond.',
        reason: 'The agent encountered an internal error while processing your request.',
        suggestion: 'Try restarting the extension or reloading the window.',
        documentationLink: `${DOCS_BASE_URL}#agents-not-responding`,
        severity: 'Error'
    }
};

export class ErrorRegistry {
    public static getError(code: string): IErrorDefinition | undefined {
        return ERROR_REGISTRY[code];
    }

    public static getAllErrors(): IErrorDefinition[] {
        return Object.values(ERROR_REGISTRY);
    }
}
