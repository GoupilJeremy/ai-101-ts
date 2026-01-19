
import { describe, it, expect } from 'vitest';
import { ErrorRegistry, ERROR_REGISTRY, DOCS_BASE_URL } from '../error-registry';
import { ErrorHandler } from '../error-handler';
import * as vscode from 'vscode';

// Mock vscode
vi.mock('vscode', () => ({
    workspace: {
        getConfiguration: vi.fn(() => ({
            get: vi.fn((key) => {
                if (key === 'errors.openLinksIn') return 'SimpleBrowser';
                return undefined;
            })
        }))
    },
    window: {
        createOutputChannel: vi.fn(() => ({
            appendLine: vi.fn(),
            show: vi.fn()
        })),
        showErrorMessage: vi.fn(() => Promise.resolve('Open Logs')),
        showWarningMessage: vi.fn(() => Promise.resolve('Read Documentation')),
        showInformationMessage: vi.fn(() => Promise.resolve())
    },
    env: {
        openExternal: vi.fn(() => Promise.resolve(true))
    },
    Uri: {
        parse: vi.fn((url) => url)
    },
    commands: {
        executeCommand: vi.fn(() => Promise.resolve())
    }
}));

describe('ErrorRegistry', () => {
    it('should have unique error codes', () => {
        const codes = Object.keys(ERROR_REGISTRY);
        const uniqueCodes = new Set(codes);
        expect(codes.length).toBe(uniqueCodes.size);
    });

    it('should have valid documentation links', () => {
        const errors = ErrorRegistry.getAllErrors();
        const urlRegex = /^https?:\/\/[^\s$.?#].[^\s]*$/;
        errors.forEach(error => {
            expect(error.documentationLink).toMatch(urlRegex);
            expect(error.documentationLink).toContain(DOCS_BASE_URL);
        });
    });

    it('should retrieve error by code', () => {
        const error = ErrorRegistry.getError('AI101-AUTH-001');
        expect(error).toBeDefined();
        expect(error?.code).toBe('AI101-AUTH-001');
    });

    it('should return undefined for non-existent code', () => {
        const error = ErrorRegistry.getError('NON-EXISTENT');
        expect(error).toBeUndefined();
    });
});

describe('ErrorHandler Template Formatting', () => {
    it('should correctly format message templates', () => {
        // Accessing private method for testing
        const formatTemplate = (ErrorHandler as any).formatTemplate;
        const template = 'Failed to connect to {{provider}} at {{url}}.';
        const data = { provider: 'OpenAI', url: 'https://api.openai.com' };

        const result = formatTemplate(template, data);
        expect(result).toBe('Failed to connect to OpenAI at https://api.openai.com.');
    });

    it('should leave unknown placeholders unchanged if not provided in data', () => {
        const formatTemplate = (ErrorHandler as any).formatTemplate;
        const template = 'Hello {{name}}!';
        const data = {};

        const result = formatTemplate(template, data);
        expect(result).toBe('Hello {{name}}!');
    });
});
