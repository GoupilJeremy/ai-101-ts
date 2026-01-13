import * as assert from 'assert';
import { AgentOrchestrator } from '../orchestrator.js';
import { ExtensionStateManager } from '../../state/extension-state-manager.js';
import { IAgent, AgentType, IAgentRequest, IAgentResponse, IAgentState } from '../shared/agent.interface.js';

class MockAgent implements IAgent {
    constructor(
        public readonly name: AgentType,
        public readonly displayName: string,
        public readonly icon: string = '🤖'
    ) { }

    async initialize(): Promise<void> { }

    async execute(request: IAgentRequest): Promise<IAgentResponse> {
        return {
            result: `Result from ${this.name}`,
            reasoning: `Reasoning from ${this.name}`,
            confidence: 0.9
        };
    }

    getState(): IAgentState {
        return { status: 'idle', lastUpdate: Date.now() };
    }
}

suite('Multi-Agent Sync Integration Test', () => {
    let orchestrator: AgentOrchestrator;
    let stateManager: ExtensionStateManager;
    let receivedMessages: any[] = [];

    const mockWebview = {
        postMessage: async (msg: any) => {
            receivedMessages.push(msg);
            return true;
        }
    };

    setup(() => {
        receivedMessages = [];
        orchestrator = AgentOrchestrator.getInstance();
        stateManager = ExtensionStateManager.getInstance();
        stateManager.setWebview(mockWebview as any);

        // Clear and register mock agents
        (orchestrator as any).agents.clear();
        orchestrator.registerAgent(new MockAgent('context', 'Context Agent'));
        orchestrator.registerAgent(new MockAgent('architect', 'Architect Agent'));
        orchestrator.registerAgent(new MockAgent('coder', 'Coder Agent'));
        orchestrator.registerAgent(new MockAgent('reviewer', 'Reviewer Agent'));
    });

    test('Should sync all state transitions during a full orchestration flow', async () => {
        // Trigger a request that involves the architect
        await orchestrator.processUserRequest('Refactor the architecture of this module');

        // Filter messages related to agent updates
        const updateMessages = receivedMessages.filter(m => m.type === 'toWebview:agentStateUpdate');

        // Plan:
        // context: thinking -> context: success
        // architect: thinking -> architect: success
        // coder: thinking -> coder: success
        // reviewer: thinking -> reviewer: success

        const expectedSequence = [
            { agent: 'context', status: 'thinking' },
            { agent: 'context', status: 'success' },
            { agent: 'architect', status: 'thinking' },
            { agent: 'architect', status: 'success' },
            { agent: 'coder', status: 'thinking' },
            { agent: 'coder', status: 'success' },
            { agent: 'reviewer', status: 'thinking' },
            { agent: 'reviewer', status: 'success' }
        ];

        assert.strictEqual(updateMessages.length, expectedSequence.length, 'Should have sent exactly 8 state update messages');

        expectedSequence.forEach((expected, index) => {
            const actual = updateMessages[index];
            assert.strictEqual(actual.agent, expected.agent, `Message ${index} should be for agent ${expected.agent}`);
            assert.strictEqual(actual.state.status, expected.status, `Message ${index} for agent ${expected.agent} should have status ${expected.status}`);
        });
    });

    test('Should skip architect and still sync correctly for simple requests', async () => {
        receivedMessages = [];
        await orchestrator.processUserRequest('Fix a small typo');

        const updateMessages = receivedMessages.filter(m => m.type === 'toWebview:agentStateUpdate');

        // Sequence should exclude architect
        const expectedSequence = [
            { agent: 'context', status: 'thinking' },
            { agent: 'context', status: 'success' },
            { agent: 'coder', status: 'thinking' },
            { agent: 'coder', status: 'success' },
            { agent: 'reviewer', status: 'thinking' },
            { agent: 'reviewer', status: 'success' }
        ];

        assert.strictEqual(updateMessages.length, expectedSequence.length);

        expectedSequence.forEach((expected, index) => {
            const actual = updateMessages[index];
            assert.strictEqual(actual.agent, expected.agent);
            assert.strictEqual(actual.state.status, expected.status);
        });
    });
});
