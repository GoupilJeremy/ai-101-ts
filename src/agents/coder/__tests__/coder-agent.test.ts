import * as assert from 'assert';
import { CoderAgent } from '../coder-agent.js';
import { LLMProviderManager } from '../../../llm/provider-manager.js';

// Mock LLMProviderManager
class MockLLMManager {
    public async callLLM(agent: string, prompt: string) {
        return {
            text: '[REASONING]\nI am using a singleton.\n[CODE]\nexport class Test {}\n[ALTERNATIVES]\nUse a factory.',
            tokens: { prompt: 10, completion: 10, total: 20 },
            model: 'test',
            finishReason: 'stop',
            cost: 0.01
        };
    }
}

suite('CoderAgent Test Suite', () => {
    let agent: CoderAgent;
    let mockLLM: any;

    setup(() => {
        agent = new CoderAgent();
        mockLLM = new MockLLMManager();
        agent.initialize(mockLLM as any);
    });

    test('Should identify itself correctly', () => {
        assert.strictEqual(agent.name, 'coder');
        assert.strictEqual(agent.displayName, 'Coder Agent');
    });

    test('Should parse LLM response correctly', async () => {
        const response = await agent.execute({ prompt: 'Create a class' });
        assert.strictEqual(response.result, 'export class Test {}');
        assert.strictEqual(response.reasoning, 'I am using a singleton.');
        assert.deepStrictEqual(response.alternatives, ['Use a factory.']);
    });

    test('Should throw error if not initialized', async () => {
        const uninitializedAgent = new CoderAgent();
        try {
            await uninitializedAgent.execute({ prompt: 'test' });
            assert.fail('Should have thrown error');
        } catch (error: any) {
            assert.ok(error.message.includes('not initialized'));
        }
    });
});
