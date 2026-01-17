import * as assert from 'assert';
import { toggleHUDCommand } from '../commands/toggle-hud.js';
import { forceAgentStateCommand } from '../commands/force-agent-state.js';
import { ExtensionStateManager } from '../state/index.js';
import { AgentType, AgentStatus } from '../agents/shared/agent.interface.js';

describe('Hotkey Commands Test Suite', () => {
    let stateManager: ExtensionStateManager;

    beforeEach(() => {
        stateManager = ExtensionStateManager.getInstance();
    });

    it('Should toggle HUD visibility in state manager', async () => {
        const initialVisibility = stateManager.isHUDVisible();

        await toggleHUDCommand();
        assert.strictEqual(stateManager.isHUDVisible(), !initialVisibility);

        await toggleHUDCommand();
        assert.strictEqual(stateManager.isHUDVisible(), initialVisibility);
    });

    it('Should update agent state when forced', async () => {
        // Since forceAgentStateCommand uses showQuickPick, we can't easily test the interactive part
        // without heavy mocking of vscode.window.
        // However, we can test that ExtensionStateManager handles the update correctly.

        const agent: AgentType = 'architect';
        const status: AgentStatus = 'working';
        const task = 'Manually forced state';

        stateManager.updateAgentState(agent, status, task);

        const state = stateManager.getAgentState(agent);
        assert.strictEqual(state.status, status);
        assert.strictEqual(state.currentTask, task);
    });
});
