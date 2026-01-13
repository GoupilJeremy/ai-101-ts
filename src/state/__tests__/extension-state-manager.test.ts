import * as assert from 'assert';
import { ExtensionStateManager } from '../extension-state-manager.js';

suite('ExtensionStateManager Test Suite', () => {
    let stateManager: ExtensionStateManager;

    setup(() => {
        stateManager = ExtensionStateManager.getInstance();
    });

    test('Should initialize with default idle states', () => {
        const states = stateManager.getAllAgentStates();
        assert.strictEqual(states.architect.status, 'idle');
        assert.strictEqual(states.coder.status, 'idle');
        assert.strictEqual(states.reviewer.status, 'idle');
        assert.strictEqual(states.context.status, 'idle');
    });

    test('Should update agent state correctly', () => {
        stateManager.updateAgentState('coder', 'working', 'Writing tests');
        const state = stateManager.getAgentState('coder');
        assert.strictEqual(state.status, 'working');
        assert.strictEqual(state.currentTask, 'Writing tests');
        assert.ok(state.lastUpdate > 0);
    });

    test('Should return immutable snapshot', () => {
        const statesBefore = stateManager.getAllAgentStates();
        statesBefore.coder.status = 'alert'; // Attempt mutation on snapshot

        const statesAfter = stateManager.getAllAgentStates();
        assert.notStrictEqual(statesAfter.coder.status, 'alert');
    });

    test('Should send postMessage when state updates', async () => {
        let lastMessage: any;
        const mockWebview = {
            postMessage: async (msg: any) => {
                lastMessage = msg;
                return true;
            }
        };

        stateManager.setWebview(mockWebview as any);

        // Check full state sync upon registration
        assert.strictEqual(lastMessage.type, 'toWebview:fullStateUpdate');

        // Check incremental update
        stateManager.updateAgentState('context', 'working', 'Loading files');
        assert.strictEqual(lastMessage.type, 'toWebview:agentStateUpdate');
        assert.strictEqual(lastMessage.agent, 'context');
        assert.strictEqual(lastMessage.state.status, 'working');
    });
});
