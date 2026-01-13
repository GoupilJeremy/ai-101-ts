import * as assert from 'assert';
import { LLMProviderManager, AgentType } from '../provider-manager.js';
import { ILLMProvider, ILLMOptions, ILLMResponse, IModelInfo } from '../provider.interface.js';
import { ConfigurationManager } from '../../config/configuration-manager.js';
import { LLMProviderError } from '../../errors/llm-provider-error.js';
import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';

// Mock Provider
class MockProvider implements ILLMProvider {
    constructor(public readonly name: string, private available: boolean = true, private shouldFail: boolean = false) { }

    async generateCompletion(prompt: string, options?: ILLMOptions): Promise<ILLMResponse> {
        if (this.shouldFail) {
            throw new LLMProviderError(`${this.name} failed`, 'TEST_ERROR', true);
        }
        return {
            text: `Response from ${this.name}`,
            tokens: { prompt: 10, completion: 10, total: 20 },
            model: 'test-model',
            finishReason: 'stop',
            cost: 0.01
        };
    }

    async estimateTokens(text: string): Promise<number> { return text.length; }
    getModelInfo(model: string): IModelInfo { return { id: model, name: model, contextWindow: 4096 }; }
    async isAvailable(): Promise<boolean> { return this.available; }
}

// Mock ConfigurationManager
class MockConfigManager {
    public static settings = {
        llm: {
            provider: 'openai' as 'openai' | 'anthropic' | 'custom',
            agentProviders: {
                architect: 'openai' as 'openai' | 'anthropic' | 'custom',
                coder: 'openai' as 'openai' | 'anthropic' | 'custom',
                reviewer: 'openai' as 'openai' | 'anthropic' | 'custom',
                context: 'openai' as 'openai' | 'anthropic' | 'custom'
            }
        }
    };
    public static getInstance() { return { getSettings: () => this.settings }; }
}

// Intercept ConfigurationManager.getInstance
(ConfigurationManager as any).getInstance = MockConfigManager.getInstance;

suite('LLMProviderManager Test Suite', () => {
    let manager: LLMProviderManager;

    let tempDir: string;

    setup(() => {
        // Reset singleton for tests if possible, or just clear providers
        manager = LLMProviderManager.getInstance();
        (manager as any).providers.clear();

        // Initialize cache for manager
        tempDir = path.join(os.tmpdir(), `ai101-manager-test-${Date.now()}`);
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
        manager.initialize(tempDir);

        // Default settings
        MockConfigManager.settings = {
            llm: {
                provider: 'openai',
                agentProviders: {
                    architect: 'openai',
                    coder: 'openai',
                    reviewer: 'openai',
                    context: 'openai'
                }
            }
        };
    });

    teardown(() => {
        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
    });

    test('Registry should store and retrieve providers', () => {
        const provider = new MockProvider('test');
        manager.registerProvider('test', provider);
        assert.strictEqual(manager.getProvider('test'), provider);
    });

    test('callLLM should route to preferred provider', async () => {
        const openai = new MockProvider('openai');
        manager.registerProvider('openai', openai);

        const response = await manager.callLLM('coder', 'Hello');
        assert.strictEqual(response.text, 'Response from openai');
    });

    test('callLLM should use per-agent provider selection', async () => {
        const anthropic = new MockProvider('anthropic');
        manager.registerProvider('anthropic', anthropic);

        MockConfigManager.settings.llm.agentProviders.architect = 'anthropic';

        const response = await manager.callLLM('architect', 'Hello');
        assert.strictEqual(response.text, 'Response from anthropic');
    });

    test('callLLM should fallback if primary is unavailable', async () => {
        const openai = new MockProvider('openai', false); // Unavailable
        const anthropic = new MockProvider('anthropic', true);

        manager.registerProvider('openai', openai);
        manager.registerProvider('anthropic', anthropic);

        const response = await manager.callLLM('coder', 'Hello');
        assert.strictEqual(response.text, 'Response from anthropic');
    });

    test('callLLM should fallback if primary fails with transient error', async () => {
        const openai = new MockProvider('openai', true, true); // Fails
        const anthropic = new MockProvider('anthropic', true);

        manager.registerProvider('openai', openai);
        manager.registerProvider('anthropic', anthropic);

        const response = await manager.callLLM('coder', 'Hello');
        assert.strictEqual(response.text, 'Response from anthropic');
    });

    test('callLLM should throw if all providers fail', async () => {
        const openai = new MockProvider('openai', true, true);
        const anthropic = new MockProvider('anthropic', true, true);

        manager.registerProvider('openai', openai);
        manager.registerProvider('anthropic', anthropic);

        try {
            await manager.callLLM('coder', 'Hello');
            assert.fail('Should have thrown LLMProviderError');
        } catch (error: any) {
            assert.ok(error instanceof LLMProviderError);
            assert.strictEqual(error.code, 'ALL_PROVIDERS_FAILED');
        }
    });

    test('callLLM should return cached response on hit', async () => {
        let callCount = 0;
        const provider: ILLMProvider = {
            name: 'cached-provider',
            generateCompletion: async () => {
                callCount++;
                return {
                    text: 'Original Response',
                    tokens: { prompt: 10, completion: 10, total: 20 },
                    model: 'test', finishReason: 'stop', cost: 0.01
                };
            },
            estimateTokens: async () => 0,
            getModelInfo: () => ({ id: 'test', name: 'test', contextWindow: 4096 }),
            isAvailable: async () => true
        };

        manager.registerProvider('openai', provider);

        // First call - Miss
        const resp1 = await manager.callLLM('coder', 'Cache me');
        assert.strictEqual(resp1.text, 'Original Response');
        assert.strictEqual(callCount, 1);

        // Second call - Hit
        const resp2 = await manager.callLLM('coder', 'Cache me');
        assert.strictEqual(resp2.text, 'Original Response');
        assert.strictEqual(callCount, 1); // Should not have called provider again
    });
});
