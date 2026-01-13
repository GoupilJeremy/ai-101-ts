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
});
