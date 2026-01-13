import * as assert from 'assert';
import { ReviewerAgent } from '../reviewer-agent.js';
import { LLMProviderManager } from '../../../llm/provider-manager.js';
import { ModeManager } from '../../../modes/mode-manager.js';
import { AgentMode } from '../../../modes/mode-types.js';

// Mock LLMProviderManager
class MockLLMManager {
    public lastPrompt: string = '';

    public async callLLM(agent: string, prompt: string) {
        this.lastPrompt = prompt; // Store for verification
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

    test('Expert Mode - Should include OWASP security analysis in prompt', async () => {
        const modeManager = ModeManager.getInstance();
        const originalGetMode = modeManager.getCurrentMode;
        modeManager.getCurrentMode = () => AgentMode.Expert;

        try {
            const mockLLMWithCapture = mockLLM as MockLLMManager;
            await agent.execute({ prompt: 'function authenticate(user) {}' });

            // Verify OWASP references are requested
            assert.ok(mockLLMWithCapture.lastPrompt.includes('OWASP') || mockLLMWithCapture.lastPrompt.includes('security'), 'Prompt should include OWASP or security references');
        } finally {
            modeManager.getCurrentMode = originalGetMode;
        }
    });

    test('Expert Mode - Should request explicit edge case analysis', async () => {
        const modeManager = ModeManager.getInstance();
        const originalGetMode = modeManager.getCurrentMode;
        modeManager.getCurrentMode = () => AgentMode.Expert;

        try {
            const mockLLMWithCapture = mockLLM as MockLLMManager;
            await agent.execute({ prompt: 'function divide(a, b) { return a / b; }' });

            // Verify edge cases are requested
            assert.ok(mockLLMWithCapture.lastPrompt.includes('edge case') || mockLLMWithCapture.lastPrompt.includes('boundary'), 'Prompt should request edge case analysis');
        } finally {
            modeManager.getCurrentMode = originalGetMode;
        }
    });

    test('Expert Mode - Should include [EXPERT MODE ACTIVE] marker', async () => {
        const modeManager = ModeManager.getInstance();
        const originalGetMode = modeManager.getCurrentMode;
        modeManager.getCurrentMode = () => AgentMode.Expert;

        try {
            const mockLLMWithCapture = mockLLM as MockLLMManager;
            await agent.execute({ prompt: 'const x = 42;' });

            // Verify Expert mode marker exists
            assert.ok(mockLLMWithCapture.lastPrompt.includes('[EXPERT MODE ACTIVE]'), 'Prompt should include [EXPERT MODE ACTIVE] marker');
        } finally {
            modeManager.getCurrentMode = originalGetMode;
        }
    });

    test('Expert Mode - Should request condensed, signal-over-noise output', async () => {
        const modeManager = ModeManager.getInstance();
        const originalGetMode = modeManager.getCurrentMode;
        modeManager.getCurrentMode = () => AgentMode.Expert;

        try {
            const mockLLMWithCapture = mockLLM as MockLLMManager;
            await agent.execute({ prompt: 'function process() {}' });

            // Verify condensed output is requested
            assert.ok(
                mockLLMWithCapture.lastPrompt.includes('concise') ||
                mockLLMWithCapture.lastPrompt.includes('condensed') ||
                mockLLMWithCapture.lastPrompt.includes('signal'),
                'Prompt should request condensed/concise output'
            );
        } finally {
            modeManager.getCurrentMode = originalGetMode;
        }
    });
});
