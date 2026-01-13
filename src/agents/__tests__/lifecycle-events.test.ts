import * as assert from 'assert';
import { AgentOrchestrator, AgentLifecycleEvent } from '../orchestrator.js';
import { IAgent, AgentType, IAgentRequest, IAgentResponse, IAgentState } from '../shared/agent.interface.js';

class MockAgent implements IAgent {
    constructor(
        public readonly name: AgentType,
        public readonly displayName: string,
        public readonly icon: string = '🤖'
    ) { }

    async initialize(): Promise<void> { }

    async execute(request: IAgentRequest): Promise<IAgentResponse> {
        if (request.prompt === 'FAIL') {
            throw new Error('Planned Failure');
        }
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

suite('Agent Lifecycle Events Test Suite', () => {
    let orchestrator: AgentOrchestrator;
    let startEvents: AgentLifecycleEvent[] = [];
    let completeEvents: AgentLifecycleEvent[] = [];
    let errorEvents: AgentLifecycleEvent[] = [];

    setup(() => {
        orchestrator = AgentOrchestrator.getInstance();
        (orchestrator as any).agents.clear();

        startEvents = [];
        completeEvents = [];
        errorEvents = [];

        orchestrator.onAgentStart(e => startEvents.push(e));
        orchestrator.onAgentComplete(e => completeEvents.push(e));
        orchestrator.onAgentError(e => errorEvents.push(e));

        orchestrator.registerAgent(new MockAgent('coder', 'Coder Agent'));
    });

    test('Should emit start and complete events', async () => {
        await (orchestrator as any).runAgent('coder', { prompt: 'Hello' });

        assert.strictEqual(startEvents.length, 1);
        assert.strictEqual(startEvents[0].agent, 'coder');
        assert.ok(startEvents[0].data.request);

        assert.strictEqual(completeEvents.length, 1);
        assert.strictEqual(completeEvents[0].agent, 'coder');
        assert.ok(completeEvents[0].data.response);
    });

    test('Should emit error events on failure', async () => {
        try {
            await (orchestrator as any).runAgent('coder', { prompt: 'FAIL' });
        } catch (e) {
            // Expected
        }

        assert.strictEqual(startEvents.length, 1);
        assert.strictEqual(errorEvents.length, 1);
        assert.strictEqual(errorEvents[0].agent, 'coder');
        assert.strictEqual(errorEvents[0].data.error, 'Planned Failure');
    });
});
