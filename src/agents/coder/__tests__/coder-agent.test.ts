import * as assert from 'assert';
import { CoderAgent } from '../coder-agent.js';
import { LLMProviderManager } from '../../../llm/provider-manager.js';
import { ModeManager } from '../../../modes/mode-manager.js';
import { AgentMode } from '../../../modes/mode-types.js';

// Mock LLMProviderManager
class MockLLMManager {
    public lastPrompt: string = '';

    public async callLLM(agent: string, prompt: string) {
        this.lastPrompt = prompt; // Store for verification
        return {
            text: '[REASONING]\nI am using a singleton.\n[CODE]\nexport class Test {}\n[ALTERNATIVES]\nUse a factory.',
            tokens: { prompt: 10, completion: 10, total: 20 },
            model: 'test',
            finishReason: 'stop',
            cost: 0.01
        };
    }
}

describe('CoderAgent Test Suite', () => {
    let agent: CoderAgent;
    let mockLLM: any;

    beforeEach(() => {
        agent = new CoderAgent();
        mockLLM = new MockLLMManager();
        agent.initialize(mockLLM as any);
    });

    it('Should identify itself correctly', () => {
        assert.strictEqual(agent.name, 'coder');
        assert.strictEqual(agent.displayName, 'Coder Agent');
    });

    it('Should parse LLM response correctly', async () => {
        const response = await agent.execute({ prompt: 'Create a class' });
        assert.strictEqual(response.result, 'export class Test {}');
        assert.strictEqual(response.reasoning, 'I am using a singleton.');
        assert.deepStrictEqual(response.alternatives, ['Use a factory.']);
    });

    it('Should throw error if not initialized', async () => {
        const uninitializedAgent = new CoderAgent();
        try {
            await uninitializedAgent.execute({ prompt: 'test' });
            assert.fail('Should have thrown error');
        } catch (error: any) {
            assert.ok(error.message.includes('not initialized'));
        }
    });

    it('Expert Mode - Should include [TECH DEBT] and [COMPLEXITY] sections in prompt', async () => {
        // Mock ModeManager to return Expert mode
        const modeManager = ModeManager.getInstance();
        const originalGetMode = modeManager.getCurrentMode;
        modeManager.getCurrentMode = () => AgentMode.Expert;

        try {
            const mockLLMWithCapture = mockLLM as MockLLMManager;
            await agent.execute({ prompt: 'Create an async function' });

            // Verify that prompt includes Expert mode instructions
            assert.ok(mockLLMWithCapture.lastPrompt.includes('[EXPERT MODE ACTIVE]'), 'Prompt should include [EXPERT MODE ACTIVE]');
            assert.ok(mockLLMWithCapture.lastPrompt.includes('[TECH DEBT]'), 'Prompt should include [TECH DEBT] section');
            assert.ok(mockLLMWithCapture.lastPrompt.includes('[COMPLEXITY]'), 'Prompt should include [COMPLEXITY] section');
        } finally {
            // Restore original method
            modeManager.getCurrentMode = originalGetMode;
        }
    });

    it('Expert Mode - Should request time/space complexity analysis', async () => {
        const modeManager = ModeManager.getInstance();
        const originalGetMode = modeManager.getCurrentMode;
        modeManager.getCurrentMode = () => AgentMode.Expert;

        try {
            const mockLLMWithCapture = mockLLM as MockLLMManager;
            await agent.execute({ prompt: 'Sort an array' });

            // Verify complexity analysis is requested
            assert.ok(mockLLMWithCapture.lastPrompt.includes('time') || mockLLMWithCapture.lastPrompt.includes('space') || mockLLMWithCapture.lastPrompt.includes('complexity'), 'Prompt should request complexity analysis');
        } finally {
            modeManager.getCurrentMode = originalGetMode;
        }
    });

    it('Expert Mode - Should request trade-off analysis', async () => {
        const modeManager = ModeManager.getInstance();
        const originalGetMode = modeManager.getCurrentMode;
        modeManager.getCurrentMode = () => AgentMode.Expert;

        try {
            const mockLLMWithCapture = mockLLM as MockLLMManager;
            await agent.execute({ prompt: 'Design a cache' });

            // Verify trade-off analysis is requested
            assert.ok(mockLLMWithCapture.lastPrompt.includes('trade-off') || mockLLMWithCapture.lastPrompt.includes('tradeoff'), 'Prompt should request trade-off analysis');
        } finally {
            modeManager.getCurrentMode = originalGetMode;
        }
    });

    it('Expert Mode - Should NOT include [PEDAGOGY] section', async () => {
        const modeManager = ModeManager.getInstance();
        const originalGetMode = modeManager.getCurrentMode;
        modeManager.getCurrentMode = () => AgentMode.Expert;

        try {
            const mockLLMWithCapture = mockLLM as MockLLMManager;
            await agent.execute({ prompt: 'Write a function' });

            // Verify PEDAGOGY is NOT mentioned (experts don't need educational content)
            assert.ok(!mockLLMWithCapture.lastPrompt.includes('[PEDAGOGY]'), 'Expert mode should not include [PEDAGOGY] section');
            assert.ok(!mockLLMWithCapture.lastPrompt.includes('LEARNING MODE'), 'Expert mode should not include LEARNING MODE');
        } finally {
            modeManager.getCurrentMode = originalGetMode;
        }
    });

    it('Should include architectural guidance in prompt when provided', async () => {
        const architecture = {
            techStack: { frontend: 'react' },
            patterns: { stateManagement: ['redux'] },
            conventions: { naming: 'camelCase' }
        };
        const mockLLMWithCapture = mockLLM as MockLLMManager;

        await agent.execute({
            prompt: 'Create component',
            data: { architecture }
        });

        assert.ok(mockLLMWithCapture.lastPrompt.includes('[PROJECT ARCHITECTURE & PATTERNS]'), 'Prompt should include architecture section');
        assert.ok(mockLLMWithCapture.lastPrompt.includes('Frontend: react'), 'Prompt should include frontend tech stack');
        assert.ok(mockLLMWithCapture.lastPrompt.includes('State Management: redux'), 'Prompt should include state management pattern');
    });

    it('Should include phase-specific instructions in prompt', async () => {
        const mockLLMWithCapture = mockLLM as MockLLMManager;

        // Test Production Phase
        await agent.execute({
            prompt: 'Update API',
            data: { currentPhase: 'production' }
        });
        assert.ok(mockLLMWithCapture.lastPrompt.includes('[PRODUCTION PHASE ACTIVE]'), 'Prompt should include production phase instructions');
        assert.ok(mockLLMWithCapture.lastPrompt.includes('security'), 'Production prompt should mention security');

        // Test Debug Phase
        await agent.execute({
            prompt: 'Fix crash',
            data: { currentPhase: 'debug' }
        });
        assert.ok(mockLLMWithCapture.lastPrompt.includes('[DEBUG PHASE ACTIVE]'), 'Prompt should include debug phase instructions');
        assert.ok(mockLLMWithCapture.lastPrompt.includes('logging'), 'Debug prompt should mention logging');

        // Test Prototype Phase
        await agent.execute({
            prompt: 'Add button',
            data: { currentPhase: 'prototype' }
        });
        assert.ok(mockLLMWithCapture.lastPrompt.includes('[PROTOTYPE PHASE ACTIVE]'), 'Prompt should include prototype phase instructions');
        assert.ok(mockLLMWithCapture.lastPrompt.includes('velocity'), 'Prototype prompt should mention velocity');
    });
});
