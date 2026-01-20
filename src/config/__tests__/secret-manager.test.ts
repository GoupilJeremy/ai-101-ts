import { describe, test, suite, beforeEach, afterEach, vi } from 'vitest';
import * as assert from 'assert';
import { SecretManager, LLMProvider } from '../secret-manager';
// Mocking vscode types for the test environment
// In a real environment, we'd use 'vscode' directly via the test runner.
// For unit tests logic, we mock the dependency.

class MockSecretStorage {
    private storage = new Map<string, string>();

    // Conforming to vscode.SecretStorage partial interface needed
    get(key: string): Thenable<string | undefined> {
        return Promise.resolve(this.storage.get(key));
    }
    store(key: string, value: string): Thenable<void> {
        this.storage.set(key, value);
        return Promise.resolve();
    }
    delete(key: string): Thenable<void> {
        this.storage.delete(key);
        return Promise.resolve();
    }
    onDidChange = (() => { return { dispose: () => { } }; }) as any;
}

suite('SecretManager Suite', () => {
    let mockSecrets: MockSecretStorage;
    let contextMock: any;

    beforeEach(() => {
        mockSecrets = new MockSecretStorage();
        contextMock = {
            secrets: mockSecrets
        };
        // Reset singleton for testing (requires loosening visibility or creating fresh instances if logic allows, 
        // but since singleton is private, we will just Initialize it.
        // JS/TS private is soft, but cleaner to just Initialize if it throws when already init. 
        // Our implementation checks !instance, so we might need a way to reset it or just run tests assuming cleanliness.
        // For this test file, we'll try to re-initialize or mock the static getInstance if we were using Sinon.
        // Given constraint: Simple mocks. We'll bypass static init check by modifying the prototype or just 
        // accepting that we run once.
        // Actually, we can just cast to any to modify private instance if needed, or better, 
        // redesign SecretManager to allow testing instances.

        // Hack for testing singleton:
        (SecretManager as any).instance = undefined;
        SecretManager.initialize(contextMock);
    });

    test('storeApiKey stores key correctly', async () => {
        const manager = SecretManager.getInstance();
        await manager.storeApiKey('openai', 'test-key-123');

        const stored = await mockSecrets.get('suika.openai.apiKey');
        assert.strictEqual(stored, 'test-key-123');
    });

    test('getApiKey retrieves correct key', async () => {
        const manager = SecretManager.getInstance();
        await mockSecrets.store('suika.anthropic.apiKey', 'anthropic-key-456');

        const retrieved = await manager.getApiKey('anthropic');
        assert.strictEqual(retrieved, 'anthropic-key-456');
    });

    test('deleteApiKey removes key', async () => {
        const manager = SecretManager.getInstance();
        await mockSecrets.store('suika.custom.apiKey', 'custom-key-789');

        await manager.deleteApiKey('custom');
        const retrieved = await mockSecrets.get('suika.custom.apiKey');
        assert.strictEqual(retrieved, undefined);
    });
});
