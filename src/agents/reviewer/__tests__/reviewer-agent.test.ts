import * as assert from 'assert';
import { ReviewerAgent } from '../reviewer-agent.js';
import { LLMProviderManager } from '../../../llm/provider-manager.js';

// Mock LLMProviderManager
class MockLLMManager {
    public async callLLM(agent: string, prompt: string) {
        if (prompt.includes('HARDCODED_KEY')) {
            return {
                text: '[STATUS]\nFAIL\n[RISKS]\nHardcoded API key detected.\n[RECOMMENDATIONS]\nUse SecretManager.\n[REASONING]\nFound a security risk.',
                tokens: { prompt: 10, completion: 10, total: 20 },
                model: 'test', finishReason: 'stop', cost: 0.01
            };
        }
        return {
            text: '[STATUS]\nPASS\n[RISKS]\nNone.\n[RECOMMENDATIONS]\nNone.\n[REASONING]\nCode is clean.',
            tokens: { prompt: 10, completion: 10, total: 20 },
            model: 'test', finishReason: 'stop', cost: 0.01
        };
    }
}

suite('ReviewerAgent Test Suite', () => {
    let agent: ReviewerAgent;
    let mockLLM: any;

    setup(() => {
        agent = new ReviewerAgent();
        mockLLM = new MockLLMManager();
        agent.initialize(mockLLM as any);
    });

    test('Should identify itself correctly', () => {
        assert.strictEqual(agent.name, 'reviewer');
        assert.strictEqual(agent.displayName, 'Reviewer Agent');
    });

    test('Should detect risks and set state to alert', async () => {
        const response = await agent.execute({ prompt: 'const key = "HARDCODED_KEY";' });
        assert.ok(response.result.includes('FAIL'));
        assert.ok(response.result.includes('Hardcoded API key'));
        assert.strictEqual(agent.getState().status, 'alert');
    });

    test('Should pass clean code and set state to success', async () => {
        const response = await agent.execute({ prompt: 'console.log("hello");' });
        assert.ok(response.result.includes('PASS'));
        assert.strictEqual(agent.getState().status, 'success');
    });
});
