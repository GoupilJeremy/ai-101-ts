import * as assert from 'assert';
import * as vscode from 'vscode';
import { ExtensionStateManager } from '../../state/extension-state-manager';
import { forceAgentStateCommand } from '../force-agent-state.command';

suite('Force Agent State Command Test Suite', () => {
    const stateManager = ExtensionStateManager.getInstance();

    test('Should update agent state programmatically', async () => {
        // Arrange
        const agentId = 'architect';
        const targetStatus = 'thinking';
        const targetTask = 'Analyzing patterns';

        // Act
        await forceAgentStateCommand(agentId, targetStatus, targetTask);

        // Assert
        const state = stateManager.getAgentState(agentId);
        assert.strictEqual(state.status, targetStatus);
        assert.strictEqual(state.currentTask, targetTask);
    });

    test('Should handle invalid agent programmatically by defaulting (or not updating if invalid)', async () => {
        // Arrange
        const agentId = 'invalid-agent' as any;
        const targetStatus = 'thinking';

        // Act
        // Note: This will trigger a vscode.window.showErrorMessage which we aren't mocking,
        // but it should still function and return (falling back to interactive if possible, or failing gracefully).
        await forceAgentStateCommand(agentId, targetStatus);

        // Assert - The state of a valid agent should not be affected by an invalid one
        const architectState = stateManager.getAgentState('architect');
        // We don't assert specific results for invalid-agent as it's not a real AgentType
    });

    test('Should handle invalid state programmatically', async () => {
        // Arrange
        const agentId = 'coder';
        const targetStatus = 'invalid-status' as any;

        // Act
        await forceAgentStateCommand(agentId, targetStatus);

        // Assert - Coder state should remain unchanged (previous value from initialization or previous tests)
        // Since we don't know the exact previous state, we just test it's not 'invalid-status'
        const state = stateManager.getAgentState('coder');
        assert.notStrictEqual(state.status, targetStatus);
    });
});
