import * as assert from 'assert';
import { AgentMode, ModeConfigs, IModeConfig } from '../mode-types';

suite('Mode Manager - Performance Mode Tests', () => {
    test('Performance Mode config exists in ModeConfigs', () => {
        const performanceConfig = ModeConfigs[AgentMode.Performance];
        assert.ok(performanceConfig, 'Performance Mode config should exist');
    });

    test('Performance Mode has correct animationComplexity setting', () => {
        const performanceConfig = ModeConfigs[AgentMode.Performance];
        assert.strictEqual(
            performanceConfig.animationComplexity,
            'none',
            'Performance Mode MUST have animationComplexity: none'
        );
    });

    test('Performance Mode has correct showLabels setting', () => {
        const performanceConfig = ModeConfigs[AgentMode.Performance];
        assert.strictEqual(
            performanceConfig.showLabels,
            false,
            'Performance Mode should have showLabels: false for performance'
        );
    });

    test('Performance Mode has correct explanationVerbositiy setting', () => {
        const performanceConfig = ModeConfigs[AgentMode.Performance];
        assert.strictEqual(
            performanceConfig.explanationVerbositiy,
            'low',
            'Performance Mode should have explanationVerbositiy: low for performance'
        );
    });

    test('Performance Mode has correct hudOpacity setting', () => {
        const performanceConfig = ModeConfigs[AgentMode.Performance];
        assert.strictEqual(
            performanceConfig.hudOpacity,
            0.8,
            'Performance Mode should have hudOpacity: 0.8'
        );
    });

    test('Performance Mode config has all required properties', () => {
        const performanceConfig = ModeConfigs[AgentMode.Performance];

        assert.ok(performanceConfig.mode !== undefined, 'mode property should exist');
        assert.ok(performanceConfig.showLabels !== undefined, 'showLabels property should exist');
        assert.ok(performanceConfig.animationComplexity !== undefined, 'animationComplexity property should exist');
        assert.ok(performanceConfig.explanationVerbositiy !== undefined, 'explanationVerbositiy property should exist');
        assert.ok(performanceConfig.hudOpacity !== undefined, 'hudOpacity property should exist');
    });

    test('Performance Mode enum value is correct', () => {
        assert.strictEqual(AgentMode.Performance, 'performance', 'AgentMode.Performance should equal "performance"');
    });

    test('Performance Mode config mode matches enum', () => {
        const performanceConfig = ModeConfigs[AgentMode.Performance];
        assert.strictEqual(
            performanceConfig.mode,
            AgentMode.Performance,
            'Config mode should match AgentMode.Performance'
        );
    });

    test('Performance Mode hudOpacity is less than normal modes', () => {
        const performanceConfig = ModeConfigs[AgentMode.Performance];
        const learningConfig = ModeConfigs[AgentMode.Learning];
        const teamConfig = ModeConfigs[AgentMode.Team];

        assert.ok(
            performanceConfig.hudOpacity < learningConfig.hudOpacity,
            'Performance Mode hudOpacity should be less than Learning Mode'
        );
        assert.ok(
            performanceConfig.hudOpacity < teamConfig.hudOpacity,
            'Performance Mode hudOpacity should be less than Team Mode'
        );
    });

    test('Performance Mode has stricter animation settings than Learning Mode', () => {
        const performanceConfig = ModeConfigs[AgentMode.Performance];
        const learningConfig = ModeConfigs[AgentMode.Learning];

        assert.strictEqual(performanceConfig.animationComplexity, 'none', 'Performance should have no animations');
        assert.strictEqual(learningConfig.animationComplexity, 'full', 'Learning should have full animations');
    });
});
