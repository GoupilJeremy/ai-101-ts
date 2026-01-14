import * as assert from 'assert';
import { TeamMetricsTracker, ISuggestionMetrics, SuggestionComplexity } from '../team-metrics-tracker.js';

describe('TeamMetricsTracker', () => {
    let tracker: TeamMetricsTracker;

    beforeEach(() => {
        tracker = TeamMetricsTracker.getInstance();
        tracker.resetMetrics();
    });

    describe('Singleton Pattern', () => {
        it('should return the same instance', () => {
            const instance1 = TeamMetricsTracker.getInstance();
            const instance2 = TeamMetricsTracker.getInstance();
            assert.strictEqual(instance1, instance2);
        });
    });

    describe('recordSuggestionAction', () => {
        it('should increment accepted count for agent', () => {
            tracker.recordSuggestionAction('architect', 'accepted');
            const metrics = tracker.getMetrics();
            assert.strictEqual(metrics.architect.accepted, 1);
            assert.strictEqual(metrics.architect.rejected, 0);
        });

        it('should increment rejected count for agent', () => {
            tracker.recordSuggestionAction('coder', 'rejected');
            const metrics = tracker.getMetrics();
            assert.strictEqual(metrics.coder.accepted, 0);
            assert.strictEqual(metrics.coder.rejected, 1);
        });

        it('should track multiple actions for same agent', () => {
            tracker.recordSuggestionAction('reviewer', 'accepted');
            tracker.recordSuggestionAction('reviewer', 'accepted');
            tracker.recordSuggestionAction('reviewer', 'rejected');

            const metrics = tracker.getMetrics();
            assert.strictEqual(metrics.reviewer.accepted, 2);
            assert.strictEqual(metrics.reviewer.rejected, 1);
        });

        it('should track actions across multiple agents', () => {
            tracker.recordSuggestionAction('architect', 'accepted');
            tracker.recordSuggestionAction('coder', 'accepted');
            tracker.recordSuggestionAction('reviewer', 'rejected');
            tracker.recordSuggestionAction('context', 'accepted');

            const metrics = tracker.getMetrics();
            assert.strictEqual(metrics.architect.accepted, 1);
            assert.strictEqual(metrics.coder.accepted, 1);
            assert.strictEqual(metrics.reviewer.rejected, 1);
            assert.strictEqual(metrics.context.accepted, 1);
        });
    });

    describe('Time Saved Calculation (Task 4.4)', () => {
        it('should add 5 minutes for simple accepted suggestions', () => {
            tracker.recordSuggestionAction('architect', 'accepted', 'simple');
            const metrics = tracker.getMetrics();
            assert.strictEqual(metrics.totalTimeSaved, 5);
        });

        it('should add 15 minutes for medium accepted suggestions', () => {
            tracker.recordSuggestionAction('coder', 'accepted', 'medium');
            const metrics = tracker.getMetrics();
            assert.strictEqual(metrics.totalTimeSaved, 15);
        });

        it('should add 30 minutes for complex accepted suggestions', () => {
            tracker.recordSuggestionAction('reviewer', 'accepted', 'complex');
            const metrics = tracker.getMetrics();
            assert.strictEqual(metrics.totalTimeSaved, 30);
        });

        it('should NOT add time for rejected suggestions', () => {
            tracker.recordSuggestionAction('architect', 'rejected', 'complex');
            const metrics = tracker.getMetrics();
            assert.strictEqual(metrics.totalTimeSaved, 0);
        });

        it('should accumulate time saved across multiple accepted suggestions', () => {
            tracker.recordSuggestionAction('architect', 'accepted', 'simple');  // +5
            tracker.recordSuggestionAction('coder', 'accepted', 'medium');      // +15
            tracker.recordSuggestionAction('reviewer', 'accepted', 'complex');  // +30
            tracker.recordSuggestionAction('context', 'rejected', 'complex');   // +0

            const metrics = tracker.getMetrics();
            assert.strictEqual(metrics.totalTimeSaved, 50); // 5+15+30 = 50
        });

        it('should default to medium complexity when not specified', () => {
            tracker.recordSuggestionAction('architect', 'accepted');
            const metrics = tracker.getMetrics();
            assert.strictEqual(metrics.totalTimeSaved, 15); // medium = 15 minutes
        });
    });

    describe('getAcceptanceRate', () => {
        it('should return 0 when no suggestions recorded', () => {
            const rate = tracker.getAcceptanceRate('architect');
            assert.strictEqual(rate, 0);
        });

        it('should calculate correct acceptance rate', () => {
            tracker.recordSuggestionAction('coder', 'accepted');
            tracker.recordSuggestionAction('coder', 'accepted');
            tracker.recordSuggestionAction('coder', 'rejected');

            const rate = tracker.getAcceptanceRate('coder');
            assert.strictEqual(rate, 67); // 2/3 = 66.67% rounded to 67%
        });

        it('should return 100% when all accepted', () => {
            tracker.recordSuggestionAction('reviewer', 'accepted');
            tracker.recordSuggestionAction('reviewer', 'accepted');

            const rate = tracker.getAcceptanceRate('reviewer');
            assert.strictEqual(rate, 100);
        });

        it('should return 0% when all rejected', () => {
            tracker.recordSuggestionAction('context', 'rejected');
            tracker.recordSuggestionAction('context', 'rejected');

            const rate = tracker.getAcceptanceRate('context');
            assert.strictEqual(rate, 0);
        });
    });

    describe('getOverallAcceptanceRate', () => {
        it('should return 0 when no suggestions recorded', () => {
            const rate = tracker.getOverallAcceptanceRate();
            assert.strictEqual(rate, 0);
        });

        it('should calculate rate across all agents', () => {
            tracker.recordSuggestionAction('architect', 'accepted');
            tracker.recordSuggestionAction('coder', 'accepted');
            tracker.recordSuggestionAction('reviewer', 'rejected');
            tracker.recordSuggestionAction('context', 'accepted');

            const rate = tracker.getOverallAcceptanceRate();
            assert.strictEqual(rate, 75); // 3/4 = 75%
        });
    });

    describe('getMetricsSummary', () => {
        it('should return formatted summary', () => {
            tracker.recordSuggestionAction('architect', 'accepted', 'complex'); // +30 min
            tracker.recordSuggestionAction('coder', 'accepted', 'medium');      // +15 min

            const summary = tracker.getMetricsSummary();
            assert.ok(summary.includes('Acceptance: 100%'));
            assert.ok(summary.includes('Time Saved: 0h 45m'));
        });

        it('should format hours correctly when over 60 minutes', () => {
            // Add 5 complex suggestions = 150 minutes = 2h 30m
            for (let i = 0; i < 5; i++) {
                tracker.recordSuggestionAction('architect', 'accepted', 'complex');
            }

            const summary = tracker.getMetricsSummary();
            assert.ok(summary.includes('Time Saved: 2h 30m'));
        });
    });

    describe('getMetrics (immutability)', () => {
        it('should return immutable copy of metrics', () => {
            tracker.recordSuggestionAction('architect', 'accepted');
            const metrics1 = tracker.getMetrics();
            metrics1.architect.accepted = 999;

            const metrics2 = tracker.getMetrics();
            assert.strictEqual(metrics2.architect.accepted, 1);
        });
    });

    describe('resetMetrics', () => {
        it('should reset all metrics to zero', () => {
            tracker.recordSuggestionAction('architect', 'accepted', 'complex');
            tracker.recordSuggestionAction('coder', 'rejected');

            tracker.resetMetrics();

            const metrics = tracker.getMetrics();
            assert.strictEqual(metrics.architect.accepted, 0);
            assert.strictEqual(metrics.architect.rejected, 0);
            assert.strictEqual(metrics.coder.accepted, 0);
            assert.strictEqual(metrics.coder.rejected, 0);
            assert.strictEqual(metrics.totalTimeSaved, 0);
        });
    });
});
