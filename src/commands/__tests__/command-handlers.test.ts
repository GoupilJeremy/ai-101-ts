import * as assert from 'assert';
import * as vscode from 'vscode';
import { ModeManager } from '../../modes/mode-manager';
import { AgentMode } from '../../modes/mode-types';
import { ExtensionStateManager } from '../../state/extension-state-manager';

suite('Command Handlers Test Suite', () => {

    suite('Mode Switching Commands', () => {
        test('switchToLearningMode should update mode manager', async () => {
            const modeManager = ModeManager.getInstance();
            const initialMode = modeManager.getCurrentMode();

            // Import and execute command
            const { switchToLearningModeCommand } = await import('../switch-mode');
            await switchToLearningModeCommand();

            const newMode = modeManager.getCurrentMode();
            assert.strictEqual(newMode, AgentMode.Learning);
        });

        test('switchToExpertMode should update mode manager', async () => {
            const modeManager = ModeManager.getInstance();

            const { switchToExpertModeCommand } = await import('../switch-mode');
            await switchToExpertModeCommand();

            const newMode = modeManager.getCurrentMode();
            assert.strictEqual(newMode, AgentMode.Expert);
        });

        test('switchToTeamMode should update mode manager', async () => {
            const modeManager = ModeManager.getInstance();

            const { switchToTeamModeCommand } = await import('../switch-mode');
            await switchToTeamModeCommand();

            const newMode = modeManager.getCurrentMode();
            assert.strictEqual(newMode, AgentMode.Team);
        });
    });

    suite('Agent Visibility Commands', () => {
        test('updateAgentVisibility should update state manager', () => {
            const stateManager = ExtensionStateManager.getInstance();

            // Test setting visibility to false
            stateManager.updateAgentVisibility('architect', false);
            const state = stateManager.getAgentState('architect');
            assert.strictEqual(state.visible, false);

            // Test setting visibility to true
            stateManager.updateAgentVisibility('architect', true);
            const updatedState = stateManager.getAgentState('architect');
            assert.strictEqual(updatedState.visible, true);
        });

        test('agent visibility should default to true if not set', () => {
            const stateManager = ExtensionStateManager.getInstance();
            const state = stateManager.getAgentState('coder');

            // If visible is undefined, it should be treated as true
            assert.notStrictEqual(state.visible, false);
        });
    });

    suite('Configuration Commands', () => {
        test('resetToDefaults should be callable', async () => {
            const { ConfigurationManager } = await import('../../config/configuration-manager');
            const configManager = ConfigurationManager.getInstance();

            // This test just verifies the method exists and is callable
            // In a real test environment, we would mock vscode.workspace.getConfiguration
            assert.ok(typeof configManager.resetToDefaults === 'function');
        });
    });
});
