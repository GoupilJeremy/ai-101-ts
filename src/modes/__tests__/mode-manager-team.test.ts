import * as assert from 'assert';
import { AgentMode, ModeConfigs, IModeConfig } from '../mode-types';

suite('Mode Manager - Team Mode Tests', () => {
    test('Team Mode config exists in ModeConfigs', () => {
        const teamConfig = ModeConfigs[AgentMode.Team];
        assert.ok(teamConfig, 'Team Mode config should exist');
    });

    test('Team Mode has correct showLabels setting', () => {
        const teamConfig = ModeConfigs[AgentMode.Team];
        assert.strictEqual(teamConfig.showLabels, true, 'Team Mode MUST have showLabels: true');
    });

    test('Team Mode has correct animationComplexity setting', () => {
        const teamConfig = ModeConfigs[AgentMode.Team];
        assert.strictEqual(teamConfig.animationComplexity, 'full', 'Team Mode should have full animations for visibility');
    });

    test('Team Mode has correct explanationVerbositiy setting', () => {
        const teamConfig = ModeConfigs[AgentMode.Team];
        assert.strictEqual(teamConfig.explanationVerbositiy, 'high', 'Team Mode should have high verbosity for team understanding');
    });

    test('Team Mode has correct hudOpacity setting', () => {
        const teamConfig = ModeConfigs[AgentMode.Team];
        assert.strictEqual(teamConfig.hudOpacity, 0.95, 'Team Mode should have 0.95 opacity for screen sharing');
    });

    test('Team Mode config structure matches IModeConfig interface', () => {
        const teamConfig = ModeConfigs[AgentMode.Team];
        assert.strictEqual(teamConfig.mode, AgentMode.Team);
        assert.strictEqual(typeof teamConfig.showLabels, 'boolean');
        assert.ok(['full', 'reduced', 'none'].includes(teamConfig.animationComplexity));
        assert.ok(['low', 'high'].includes(teamConfig.explanationVerbositiy));
        assert.strictEqual(typeof teamConfig.hudOpacity, 'number');
    });

    test('AgentMode enum contains Team mode', () => {
        assert.ok(Object.values(AgentMode).includes(AgentMode.Team), 'AgentMode enum should include Team');
        assert.strictEqual(AgentMode.Team, 'team', 'AgentMode.Team value should be "team"');
    });

    test('ModeConfigs can retrieve Team config by enum key', () => {
        const retrievedConfig = ModeConfigs[AgentMode.Team];
        assert.ok(retrievedConfig, 'Should be able to retrieve Team config from ModeConfigs');
        assert.strictEqual(retrievedConfig.mode, AgentMode.Team);
    });
});

