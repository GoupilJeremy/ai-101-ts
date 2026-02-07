import { describe, test, suite, beforeEach, afterEach, vi } from 'vitest';
import * as assert from 'assert';
import * as vscode from 'vscode';
import { ConfigurationManager } from '../configuration-manager.js';
import { UIMode } from '../../api/configuration-types.js';

// Mock vscode
vi.mock('vscode', () => {
    let mockStore: Record<string, any> = {
        'ui.mode': 'learning',
        'performance.maxTokens': 4096,
        'llm.provider': 'openai'
    };

    const mockConfig = {
        get: vi.fn((key, defaultValue) => {
            return mockStore[key] !== undefined ? mockStore[key] : defaultValue;
        }),
        update: vi.fn((key, value) => {
            mockStore[key] = value;
            return Promise.resolve();
        })
    };

    return {
        ConfigurationTarget: {
            Global: 1,
            Workspace: 2,
            WorkspaceFolder: 3
        },
        workspace: {
            getConfiguration: vi.fn(() => mockConfig)
        }
    };
});

suite('ConfigurationManager Suite', () => {

    test('getSettings returns default valid configuration', () => {
        const manager = ConfigurationManager.getInstance();
        const settings = manager.getSettings();

        assert.strictEqual(settings.llm.provider, 'openai');
        assert.strictEqual(settings.ui.transparency, 'medium');
        assert.strictEqual(settings.ui.mode, 'learning');
        assert.strictEqual(settings.telemetry.enabled, true);
    });

    test('getConfig returns correct default value', () => {
        const manager = ConfigurationManager.getInstance();
        const mode = manager.getConfig('ui.mode');
        assert.strictEqual(mode, UIMode.Learning);
    });

    test('setConfig updates value in workspace scope', async () => {
        const manager = ConfigurationManager.getInstance();
        await manager.setConfig('ui.mode', UIMode.Expert, 'workspace');
        assert.strictEqual(manager.getConfig('ui.mode'), UIMode.Expert);

        // Reset to default
        await manager.setConfig('ui.mode', UIMode.Learning, 'workspace');
    });

    test('updateConfig updates multiple values in workspace scope', async () => {
        const manager = ConfigurationManager.getInstance();
        await manager.updateConfig({
            'ui.mode': UIMode.Focus,
            'performance.maxTokens': 2048
        }, 'workspace');

        assert.strictEqual(manager.getConfig('ui.mode'), UIMode.Focus);
        assert.strictEqual(manager.getConfig('performance.maxTokens'), 2048);

        // Reset to defaults
        await manager.updateConfig({
            'ui.mode': UIMode.Learning,
            'performance.maxTokens': 4096
        }, 'workspace');
    });

    test('setConfig throws ConfigurationError for invalid value', async () => {
        const manager = ConfigurationManager.getInstance();
        await assert.rejects(async () => {
            // @ts-ignore
            await manager.setConfig('ui.mode', 'invalid-mode');
        }, {
            name: 'ConfigurationError',
            message: /Configuration Error: ui.mode/
        });
    });

    test('setConfig throws ConfigurationError for non-positive number', async () => {
        const manager = ConfigurationManager.getInstance();
        await assert.rejects(async () => {
            // @ts-ignore
            await manager.setConfig('performance.maxTokens', -1);
        }, {
            name: 'ConfigurationError',
            message: /Configuration Error: performance.maxTokens/
        });
    });

});
