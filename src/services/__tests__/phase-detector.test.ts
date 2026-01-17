import * as assert from 'assert';
import { PhaseDetector } from '../phase-detector.js';
import { ExtensionStateManager } from '../../state/extension-state-manager.js';

describe('PhaseDetector Test Suite', () => {
    let phaseDetector: PhaseDetector;
    let stateManager: ExtensionStateManager;

    beforeEach(() => {
        phaseDetector = PhaseDetector.getInstance();
        stateManager = ExtensionStateManager.getInstance();
    });

    it('Should handle manual override correctly', async () => {
        // Test production override
        phaseDetector.setManualOverride('production');
        assert.strictEqual(stateManager.getPhase(), 'production', 'Phase should be production after manual override');

        // Test debug override
        phaseDetector.setManualOverride('debug');
        assert.strictEqual(stateManager.getPhase(), 'debug', 'Phase should be debug after manual override');

        // Reset override
        phaseDetector.setManualOverride(null);
    });

    it('Should version compare correctly (isGreaterOrEqual)', () => {
        // @ts-ignore - accessing private method for test
        const detector = phaseDetector as any;

        assert.ok(detector.isGreaterOrEqual('1.0.0', '1.0.0'), '1.0.0 >= 1.0.0');
        assert.ok(detector.isGreaterOrEqual('1.2.3', '1.0.0'), '1.2.3 >= 1.0.0');
        assert.ok(detector.isGreaterOrEqual('2.0.0', '1.9.9'), '2.0.0 >= 1.9.9');
        assert.ok(detector.isGreaterOrEqual('v1.0.0', '1.0.0'), 'v1.0.0 >= 1.0.0');
        assert.ok(detector.isGreaterOrEqual('1.1.0', '1.0.9'), '1.1.0 >= 1.0.9');

        assert.ok(!detector.isGreaterOrEqual('0.9.9', '1.0.0'), '0.9.9 < 1.0.0');
        assert.ok(!detector.isGreaterOrEqual('1.0.0', '1.0.1'), '1.0.0 < 1.0.1');
    });
});
