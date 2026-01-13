import * as assert from 'assert';
import * as vscode from 'vscode';
import { RateLimiter } from '../rate-limiter.js';
import { ConfigurationManager } from '../../config/configuration-manager.js';
import { BudgetExceededError } from '../../errors/budget-exceeded-error.js';

// Mock ConfigurationManager
class MockConfigManager {
    public static settings = {
        performance: {
            tokenBudget: 100,
            costBudget: 1.00,
            maxTokens: 4096
        }
    };
    public static getInstance() { return { getSettings: () => this.settings }; }
}

// Intercept ConfigurationManager.getInstance
(ConfigurationManager as any).getInstance = MockConfigManager.getInstance;

// Mock vscode.window.showWarningMessage
const warnings: string[] = [];
(vscode.window as any).showWarningMessage = async (msg: string) => {
    warnings.push(msg);
    return undefined;
};

suite('RateLimiter Test Suite', () => {
    let limiter: RateLimiter;

    setup(() => {
        limiter = RateLimiter.getInstance();
        limiter.reset();
        warnings.length = 0;
        MockConfigManager.settings.performance.tokenBudget = 100;
        MockConfigManager.settings.performance.costBudget = 1.00;
    });

    test('Should record usage and return stats', () => {
        limiter.recordUsage(50, 0.50);
        const stats = limiter.getStats();
        assert.strictEqual(stats.tokens, 50);
        assert.strictEqual(stats.cost, 0.50);
        assert.strictEqual(stats.tokenPercent, 50);
    });

    test('checkBudget should pass if under limit', () => {
        limiter.recordUsage(90, 0.90);
        assert.doesNotThrow(() => limiter.checkBudget());
    });

    test('checkBudget should throw if token budget exceeded', () => {
        limiter.recordUsage(101, 0.50);
        assert.throws(() => limiter.checkBudget(), BudgetExceededError);
    });

    test('checkBudget should throw if cost budget exceeded', () => {
        limiter.recordUsage(50, 1.01);
        assert.throws(() => limiter.checkBudget(), BudgetExceededError);
    });

    test('Should trigger warning at 80% usage', () => {
        limiter.recordUsage(81, 0.10);
        assert.strictEqual(warnings.length, 1);
        assert.ok(warnings[0].includes('80%'));
    });

    test('Should not trigger warning twice', () => {
        limiter.recordUsage(81, 0.10);
        limiter.recordUsage(5, 0.05);
        assert.strictEqual(warnings.length, 1);
    });

    test('Reset should clear usage', () => {
        limiter.recordUsage(50, 0.50);
        limiter.reset();
        const stats = limiter.getStats();
        assert.strictEqual(stats.tokens, 0);
        assert.strictEqual(stats.cost, 0);
    });
});
