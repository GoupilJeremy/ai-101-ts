import * as assert from 'assert';
import { CostTracker } from '../cost-tracker.js';
import { RateLimiter } from '../rate-limiter.js';
import { ConfigurationManager } from '../../config/configuration-manager.js';

// Mock ConfigurationManager
class MockConfigManager {
    public static settings = {
        performance: {
            tokenBudget: 1000,
            costBudget: 1.00,
            maxTokens: 4096
        }
    };
    public static getInstance() { return { getSettings: () => this.settings }; }
}

// Intercept ConfigurationManager.getInstance
(ConfigurationManager as any).getInstance = MockConfigManager.getInstance;

suite('CostTracker Test Suite', () => {
    let tracker: CostTracker;

    setup(() => {
        tracker = CostTracker.getInstance();
        RateLimiter.getInstance().reset();
    });

    test('Should return correct current session cost', () => {
        RateLimiter.getInstance().recordUsage(100, 0.05);
        assert.strictEqual(tracker.getCurrentSessionCost(), 0.05);
    });

    test('Should return formatted cost string', () => {
        RateLimiter.getInstance().recordUsage(100, 0.052);
        const formatted = tracker.getFormattedSessionCost();
        // Intl.NumberFormat might use non-breaking space depending on environment
        assert.ok(formatted.includes('$0.052') || formatted.includes('$0.05'));
    });

    test('Should accumulate cost correctly across calls', () => {
        RateLimiter.getInstance().recordUsage(100, 0.05);
        RateLimiter.getInstance().recordUsage(200, 0.10);
        assert.strictEqual(tracker.getCurrentSessionCost(), 0.15);
    });
});
