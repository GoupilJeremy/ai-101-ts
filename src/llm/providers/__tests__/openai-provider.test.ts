import * as assert from 'assert';
import { OpenAIProvider } from '../openai-provider.js';
import { SecretManager } from '../../../config/secret-manager.js';
import { LLMProviderError } from '../../../errors/llm-provider-error.js';

// Mock types
class MockSecretManager {
    private static instance: MockSecretManager;
    public getApiKey = async (provider: string) => (provider === 'openai' ? 'test-key' : undefined);
    public static getInstance() {
        if (!this.instance) {this.instance = new MockSecretManager();}
        return this.instance;
    }
}

// Intercept SecretManager.getInstance
(SecretManager as any).getInstance = MockSecretManager.getInstance;

// Mock OpenAI
const mockCreate = async () => ({
    choices: [{ message: { content: 'Test response' }, finish_reason: 'stop' }],
    usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 },
    model: 'gpt-3.5-turbo'
});

suite('OpenAIProvider Test Suite', () => {
    let provider: OpenAIProvider;

    setup(() => {
        provider = new OpenAIProvider();
    });

    test('Provider name should be openai', () => {
        assert.strictEqual(provider.name, 'openai');
    });

    test('estimateTokens should count tokens correctly', async () => {
        const text = 'Hello, world!';
        const count = await provider.estimateTokens(text);
        assert.ok(count > 0);
    });

    test('getModelInfo should return info for supported models', () => {
        const info = provider.getModelInfo('gpt-4');
        assert.strictEqual(info.id, 'gpt-4');
        assert.strictEqual(info.contextWindow, 8192);
    });

    test('getModelInfo should throw for unsupported models', () => {
        assert.throws(() => provider.getModelInfo('non-existent'), /Unsupported OpenAI model/);
    });

    test('isAvailable should return true if API key exists', async () => {
        const available = await provider.isAvailable();
        assert.strictEqual(available, true);
    });

    test('generateCompletion should return valid response (mocked)', async () => {
        // We need to inject the mock client since it's private
        (provider as any).client = {
            chat: {
                completions: {
                    create: mockCreate
                }
            }
        };

        const response = await provider.generateCompletion('Hello');
        assert.strictEqual(response.text, 'Test response');
        assert.strictEqual(response.tokens.total, 30);
        assert.strictEqual(response.model, 'gpt-3.5-turbo');
    });

    test('generateCompletion should wrap OpenAI errors', async () => {
        (provider as any).client = {
            chat: {
                completions: {
                    create: async () => {
                        const error: any = new Error('API Error');
                        error.status = 429;
                        error.code = 'rate_limit_exceeded';
                        throw error;
                    }
                }
            }
        };

        try {
            await provider.generateCompletion('Hello');
            assert.fail('Should have thrown LLMProviderError');
        } catch (error: any) {
            assert.ok(error instanceof LLMProviderError);
            assert.strictEqual(error.isTransient, true);
            assert.strictEqual(error.code, 'rate_limit_exceeded');
        }
    });
});
