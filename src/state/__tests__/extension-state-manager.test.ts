import * as assert from 'assert';
import { ExtensionStateManager } from '../extension-state-manager.js';

describe('ExtensionStateManager Test Suite', () => {
    let stateManager: ExtensionStateManager;

    beforeEach(() => {
        stateManager = ExtensionStateManager.getInstance();
    });

    it('Should initialize with default idle states', () => {
        const states = stateManager.getAllAgentStates();
        assert.strictEqual(states.architect.status, 'idle');
        assert.strictEqual(states.coder.status, 'idle');
        assert.strictEqual(states.reviewer.status, 'idle');
        assert.strictEqual(states.context.status, 'idle');
    });

    it('Should update agent state correctly', () => {
        stateManager.updateAgentState('coder', 'working', 'Writing tests');
        const state = stateManager.getAgentState('coder');
        assert.strictEqual(state.status, 'working');
        assert.strictEqual(state.currentTask, 'Writing tests');
        assert.ok(state.lastUpdate > 0);
    });

    it('Should return immutable snapshot', () => {
        const statesBefore = stateManager.getAllAgentStates();
        statesBefore.coder.status = 'alert'; // Attempt mutation on snapshot

        const statesAfter = stateManager.getAllAgentStates();
        assert.notStrictEqual(statesAfter.coder.status, 'alert');
    });

    it('Should send postMessage when state updates', async () => {
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

    it('Should manage history entries', () => {
        const entry: any = {
            id: 'test-h1',
            timestamp: Date.now(),
            type: 'suggestion',
            summary: 'Test decision',
            agent: 'coder',
            status: 'pending',
            details: { reasoning: 'Because tests' }
        };

        stateManager.addHistoryEntry(entry);
        const history = stateManager.getHistory();
        const addedEntry = history.find(e => e.id === 'test-h1');
        assert.ok(addedEntry);
        assert.strictEqual(addedEntry?.summary, 'Test decision');

        stateManager.updateHistoryEntryStatus('test-h1', 'accepted');
        const updatedHistory = stateManager.getHistory();
        const updatedEntry = updatedHistory.find(e => e.id === 'test-h1');
        assert.strictEqual(updatedEntry?.status, 'accepted');
    });
});
