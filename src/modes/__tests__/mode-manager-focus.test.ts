import * as assert from 'assert';
import { ModeManager } from '../mode-manager.js';
import { AgentMode } from '../mode-types.js';

suite('ModeManager - Focus Mode Test Suite', () => {
    let modeManager: ModeManager;

    setup(() => {
        modeManager = ModeManager.getInstance();
    });

    test('Should switch to Focus Mode', async () => {
        await modeManager.setMode(AgentMode.Learning);
        await modeManager.setMode(AgentMode.Focus);

        assert.strictEqual(modeManager.getCurrentMode(), AgentMode.Focus);
    });

    test('Should store previous mode when entering Focus Mode', async () => {
        await modeManager.setMode(AgentMode.Expert);
        await modeManager.setMode(AgentMode.Focus);

        // Restore previous mode
        await modeManager.restorePreviousMode();

        assert.strictEqual(modeManager.getCurrentMode(), AgentMode.Expert);
    });

    test('Should restore to Learning mode by default if no previous mode', async () => {
        await modeManager.setMode(AgentMode.Focus);
        await modeManager.restorePreviousMode();

        assert.strictEqual(modeManager.getCurrentMode(), AgentMode.Learning);
    });

    test('Focus Mode config should have hudOpacity 0', () => {
        const config = modeManager.getConfig();
        modeManager.setMode(AgentMode.Focus);

        const focusConfig = modeManager.getConfig();
        assert.strictEqual(focusConfig.hudOpacity, 0.0);
        assert.strictEqual(focusConfig.animationComplexity, 'none');
        assert.strictEqual(focusConfig.showLabels, false);
    });

    test('Should not store Focus as previous mode when switching between other modes', async () => {
        await modeManager.setMode(AgentMode.Learning);
        await modeManager.setMode(AgentMode.Focus);
        await modeManager.restorePreviousMode(); // Should restore to Learning

        await modeManager.setMode(AgentMode.Expert); // Switch to Expert from Learning

        // Now entering Focus again should store Expert, not Learning
        await modeManager.setMode(AgentMode.Focus);
        await modeManager.restorePreviousMode();

        assert.strictEqual(modeManager.getCurrentMode(), AgentMode.Expert);
    });

    test('Toggle Focus Mode simulation', async () => {
        // Simulate toggle behavior
        await modeManager.setMode(AgentMode.Expert);

        const currentMode = modeManager.getCurrentMode();
        if (currentMode !== AgentMode.Focus) {
            await modeManager.setMode(AgentMode.Focus);
        } else {
            await modeManager.restorePreviousMode();
        }

        assert.strictEqual(modeManager.getCurrentMode(), AgentMode.Focus);

        // Toggle off
        await modeManager.restorePreviousMode();
        assert.strictEqual(modeManager.getCurrentMode(), AgentMode.Expert);
    });
});
