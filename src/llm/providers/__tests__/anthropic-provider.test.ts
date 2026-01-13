import * as assert from 'assert';
import { AnthropicProvider } from '../anthropic-provider.js';
import { SecretManager } from '../../../config/secret-manager.js';
import { LLMProviderError } from '../../../errors/llm-provider-error.js';

// Mock types
class MockSecretManager {
    private static instance: MockSecretManager;
    public getApiKey = async (provider: string) => (provider === 'anthropic' ? 'test-key' : undefined);
    public static getInstance() {
        if (!this.instance) this.instance = new MockSecretManager();
        return this.instance;
    }
}

// Intercept SecretManager.getInstance
(SecretManager as any).getInstance = MockSecretManager.getInstance;

// Mock Anthropic
const mockCreate = async () => ({
    content: [{ type: 'text', text: 'Test response from Claude' }],
    usage: { input_tokens: 15, output_tokens: 25 },
    model: 'claude-3-haiku-20240307',
    stop_reason: 'end_turn'
});

suite('AnthropicProvider Test Suite', () => {
    let provider: AnthropicProvider;

    setup(() => {
        provider = new AnthropicProvider();
    });

    test('Provider name should be anthropic', () => {
        assert.strictEqual(provider.name, 'anthropic');
    });

    test('estimateTokens should approximate tokens (chars / 4)', async () => {
        const text = 'Hello world'; // 11 chars
        const count = await provider.estimateTokens(text);
        assert.strictEqual(count, 3); // ceil(11/4) = 3
    });

    test('getModelInfo should return info for supported models', () => {
        const info = provider.getModelInfo('claude-3-opus');
        assert.strictEqual(info.id, 'claude-3-opus-20240229');
        assert.strictEqual(info.contextWindow, 200000);
    });

    test('isAvailable should return true if API key exists', async () => {
        const available = await provider.isAvailable();
        assert.strictEqual(available, true);
    });

    test('generateCompletion should return valid response (mocked)', async () => {
        (provider as any).client = {
            messages: {
                create: mockCreate
            }
        };

        const response = await provider.generateCompletion('Hello');
        assert.strictEqual(response.text, 'Test response from Claude');
        assert.strictEqual(response.tokens.prompt, 15);
        assert.strictEqual(response.tokens.completion, 25);
    });

    test('generateCompletion should wrap Anthropic errors', async () => {
        (provider as any).client = {
            messages: {
                create: async () => {
                    const error: any = new Error('Rate limit exceeded');
                    error.status = 429;
                    error.type = 'rate_limit_error';
                    throw error;
                }
            }
        };

        try {
            await provider.generateCompletion('Hello');
            assert.fail('Should have thrown LLMProviderError');
        } catch (error: any) {
            assert.ok(error instanceof LLMProviderError);
            assert.strictEqual(error.isTransient, true);
            assert.strictEqual(error.code, 'rate_limit_error');
        }
    });
});
