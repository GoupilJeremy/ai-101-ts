import * as assert from 'assert';
import { AgentOrchestrator } from '../orchestrator.js';
import { IAgent, AgentType, IAgentRequest, IAgentResponse, IAgentState } from '../shared/agent.interface.js';
import { LLMProviderManager } from '../../llm/provider-manager.js';
import { ExtensionStateManager } from '../../state/extension-state-manager.js';

class MockAgent implements IAgent {
    constructor(
        public readonly name: AgentType,
        public readonly displayName: string,
        public readonly icon: string = '🤖'
    ) { }

    async initialize(llmManager: LLMProviderManager): Promise<void> { }

    async execute(request: IAgentRequest): Promise<IAgentResponse> {
        return {
            result: `Response from ${this.name}`,
            reasoning: `Reasoning from ${this.name}`,
            confidence: 0.9
        };
    }

    getState(): IAgentState {
        return { status: 'idle', lastUpdate: Date.now() };
    }
}

describe('AgentOrchestrator Test Suite', () => {
    let orchestrator: AgentOrchestrator;

    beforeEach(() => {
        orchestrator = AgentOrchestrator.getInstance();
        // Clear registered agents if necessary (singleton reset)
        (orchestrator as any).agents.clear();
    });

    it('Should register and coordinate agents in sequence', async () => {
        const context = new MockAgent('context', 'Context Agent');
        const coder = new MockAgent('coder', 'Coder Agent');
        const reviewer = new MockAgent('reviewer', 'Reviewer Agent');

        orchestrator.registerAgent(context);
        orchestrator.registerAgent(coder);
        orchestrator.registerAgent(reviewer);

        const response = await orchestrator.processUserRequest('Fix the bug');

        assert.strictEqual(response.result, 'Response from coder');
        assert.ok(response.reasoning.includes('Coder: Reasoning from coder'));
        assert.ok(response.reasoning.includes('Reviewer: Reasoning from reviewer'));
    });

    it('Should involve architect when keywords are present', async () => {
        const context = new MockAgent('context', 'Context Agent');
        const architect = new MockAgent('architect', 'Architect Agent');
        const coder = new MockAgent('coder', 'Coder Agent');
        const reviewer = new MockAgent('reviewer', 'Reviewer Agent');

        orchestrator.registerAgent(context);
        orchestrator.registerAgent(architect);
        orchestrator.registerAgent(coder);
        orchestrator.registerAgent(reviewer);

        const response = await orchestrator.processUserRequest('Refactor the architecture');

        assert.ok(response.reasoning.includes('Architect: Reasoning from architect'));
    });

    it('Should handle missing agents gracefully', async () => {
        const coder = new MockAgent('coder', 'Coder Agent');
        orchestrator.registerAgent(coder);

        const response = await orchestrator.processUserRequest('Simple task');
        assert.strictEqual(response.result, 'Response from coder');
    });
    it('Should record decision history in ExtensionStateManager', async () => {
        const coder = new MockAgent('coder', 'Coder Agent');
        const reviewer = new MockAgent('reviewer', 'Reviewer Agent');

        orchestrator.registerAgent(coder);
        orchestrator.registerAgent(reviewer);

        const stateManager = ExtensionStateManager.getInstance();
        const initialCount = stateManager.getHistory().length;

        await orchestrator.processUserRequest('Test history recording');

        const finalHistory = stateManager.getHistory();
        assert.strictEqual(finalHistory.length, initialCount + 1);
        assert.ok(finalHistory[finalHistory.length - 1].summary.includes('Test history recording'));
    });
});
