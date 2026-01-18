import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MetricsService } from '../metrics-service';
import { MetricsStorage } from '../metrics-storage';
import { DEFAULT_METRICS } from '../metrics.interface';

// Mock MetricsStorage
vi.mock('../metrics-storage', () => {
    return {
        MetricsStorage: vi.fn().mockImplementation(() => ({
            loadMetrics: vi.fn().mockResolvedValue({ ...DEFAULT_METRICS }),
            saveMetrics: vi.fn().mockResolvedValue(undefined),
            exportMetrics: vi.fn().mockResolvedValue(undefined)
        }))
    };
});

// Mock TelemetryService
vi.mock('../telemetry-service', () => {
    return {
        TelemetryService: {
            getInstance: vi.fn().mockReturnValue({
                sendEvent: vi.fn(),
                sendError: vi.fn(),
                dispose: vi.fn()
            })
        }
    };
});

describe('MetricsService - Acceptance Rate Tracking', () => {
    let metricsService: MetricsService;
    let mockContext: any;

    beforeEach(async () => {
        // Reset singleton instance
        (MetricsService as any).instance = undefined;

        // Create mock context
        mockContext = {
            globalStorageUri: { fsPath: '/mock/storage', path: '/mock/storage', scheme: 'file' },
            subscriptions: [],
            globalState: {
                get: vi.fn().mockReturnValue(undefined),
                update: vi.fn().mockResolvedValue(undefined)
            }
        };

        // Create a new instance
        metricsService = MetricsService.getInstance(mockContext);

        // Wait for initialization
        await new Promise(resolve => setTimeout(resolve, 100));
    });

    describe('getAcceptanceRate', () => {
        it('should calculate overall acceptance rate correctly', async () => {
            // Record some suggestions
            metricsService.recordSuggestionAccepted(5, { agent: 'coder', mode: 'learning', type: 'completion' });
            metricsService.recordSuggestionAccepted(3, { agent: 'coder', mode: 'learning', type: 'completion' });
            metricsService.recordSuggestionRejected({ agent: 'coder', mode: 'learning', type: 'completion' });
            metricsService.recordSuggestionRejected({ agent: 'coder', mode: 'learning', type: 'completion' });

            const rate = await metricsService.getAcceptanceRate();

            // 2 accepted / (2 accepted + 2 rejected) = 50%
            expect(rate).toBe(50);
        });

        it('should return 0 when no suggestions have been made', async () => {
            const rate = await metricsService.getAcceptanceRate();
            expect(rate).toBe(0);
        });

        it('should return 100 when all suggestions are accepted', async () => {
            metricsService.recordSuggestionAccepted(5, { agent: 'coder', mode: 'learning', type: 'completion' });
            metricsService.recordSuggestionAccepted(3, { agent: 'coder', mode: 'learning', type: 'completion' });

            const rate = await metricsService.getAcceptanceRate();
            expect(rate).toBe(100);
        });

        it('should calculate acceptance rate by agent', async () => {
            // Coder: 2 accepted, 1 rejected = 66.67%
            metricsService.recordSuggestionAccepted(5, { agent: 'coder', mode: 'learning', type: 'completion' });
            metricsService.recordSuggestionAccepted(3, { agent: 'coder', mode: 'learning', type: 'completion' });
            metricsService.recordSuggestionRejected({ agent: 'coder', mode: 'learning', type: 'completion' });

            // Architect: 1 accepted, 2 rejected = 33.33%
            metricsService.recordSuggestionAccepted(2, { agent: 'architect', mode: 'expert', type: 'refactor' });
            metricsService.recordSuggestionRejected({ agent: 'architect', mode: 'expert', type: 'refactor' });
            metricsService.recordSuggestionRejected({ agent: 'architect', mode: 'expert', type: 'refactor' });

            const coderRate = await metricsService.getAcceptanceRate({ dimension: 'agent', value: 'coder' });
            const architectRate = await metricsService.getAcceptanceRate({ dimension: 'agent', value: 'architect' });

            expect(coderRate).toBeCloseTo(66.67, 1);
            expect(architectRate).toBeCloseTo(33.33, 1);
        });

        it('should calculate acceptance rate by mode', async () => {
            // Learning mode: 2 accepted, 0 rejected = 100%
            metricsService.recordSuggestionAccepted(5, { agent: 'coder', mode: 'learning', type: 'completion' });
            metricsService.recordSuggestionAccepted(3, { agent: 'coder', mode: 'learning', type: 'completion' });

            // Expert mode: 0 accepted, 2 rejected = 0%
            metricsService.recordSuggestionRejected({ agent: 'architect', mode: 'expert', type: 'refactor' });
            metricsService.recordSuggestionRejected({ agent: 'architect', mode: 'expert', type: 'refactor' });

            const learningRate = await metricsService.getAcceptanceRate({ dimension: 'mode', value: 'learning' });
            const expertRate = await metricsService.getAcceptanceRate({ dimension: 'mode', value: 'expert' });

            expect(learningRate).toBe(100);
            expect(expertRate).toBe(0);
        });

        it('should calculate acceptance rate by suggestion type', async () => {
            // Completion: 3 accepted, 1 rejected = 75%
            metricsService.recordSuggestionAccepted(5, { agent: 'coder', mode: 'learning', type: 'completion' });
            metricsService.recordSuggestionAccepted(3, { agent: 'coder', mode: 'learning', type: 'completion' });
            metricsService.recordSuggestionAccepted(2, { agent: 'coder', mode: 'learning', type: 'completion' });
            metricsService.recordSuggestionRejected({ agent: 'coder', mode: 'learning', type: 'completion' });

            // Refactor: 1 accepted, 1 rejected = 50%
            metricsService.recordSuggestionAccepted(4, { agent: 'architect', mode: 'expert', type: 'refactor' });
            metricsService.recordSuggestionRejected({ agent: 'architect', mode: 'expert', type: 'refactor' });

            const completionRate = await metricsService.getAcceptanceRate({ dimension: 'type', value: 'completion' });
            const refactorRate = await metricsService.getAcceptanceRate({ dimension: 'type', value: 'refactor' });

            expect(completionRate).toBe(75);
            expect(refactorRate).toBe(50);
        });

        it('should return 0 for dimension with no data', async () => {
            const rate = await metricsService.getAcceptanceRate({ dimension: 'agent', value: 'nonexistent' });
            expect(rate).toBe(0);
        });
    });

    describe('getDimensionalBreakdown', () => {
        it('should return breakdown by all agents', async () => {
            metricsService.recordSuggestionAccepted(5, { agent: 'coder', mode: 'learning', type: 'completion' });
            metricsService.recordSuggestionRejected({ agent: 'coder', mode: 'learning', type: 'completion' });
            metricsService.recordSuggestionAccepted(3, { agent: 'architect', mode: 'expert', type: 'refactor' });

            const breakdown = await metricsService.getDimensionalBreakdown('agent');

            expect(breakdown).toHaveProperty('coder');
            expect(breakdown).toHaveProperty('architect');
            expect(breakdown.coder.acceptanceRate).toBe(50);
            expect(breakdown.architect.acceptanceRate).toBe(100);
        });

        it('should return breakdown by all modes', async () => {
            metricsService.recordSuggestionAccepted(5, { agent: 'coder', mode: 'learning', type: 'completion' });
            metricsService.recordSuggestionAccepted(3, { agent: 'coder', mode: 'expert', type: 'completion' });
            metricsService.recordSuggestionRejected({ agent: 'coder', mode: 'expert', type: 'completion' });

            const breakdown = await metricsService.getDimensionalBreakdown('mode');

            expect(breakdown).toHaveProperty('learning');
            expect(breakdown).toHaveProperty('expert');
            expect(breakdown.learning.acceptanceRate).toBe(100);
            expect(breakdown.expert.acceptanceRate).toBe(50);
        });

        it('should return breakdown by all suggestion types', async () => {
            metricsService.recordSuggestionAccepted(5, { agent: 'coder', mode: 'learning', type: 'completion' });
            metricsService.recordSuggestionAccepted(3, { agent: 'coder', mode: 'learning', type: 'refactor' });
            metricsService.recordSuggestionRejected({ agent: 'coder', mode: 'learning', type: 'fix' });

            const breakdown = await metricsService.getDimensionalBreakdown('type');

            expect(breakdown).toHaveProperty('completion');
            expect(breakdown).toHaveProperty('refactor');
            expect(breakdown).toHaveProperty('fix');
        });
    });

    describe('Telemetry Integration', () => {
        it('should send telemetry events when suggestions are accepted', async () => {
            const { TelemetryService } = await import('../telemetry-service');
            const mockTelemetryInstance = TelemetryService.getInstance(mockContext);

            metricsService.recordSuggestionAccepted(5, { agent: 'coder', mode: 'learning', type: 'completion' });

            expect(mockTelemetryInstance.sendEvent).toHaveBeenCalledWith(
                'suggestion.accepted',
                expect.objectContaining({
                    agent: 'coder',
                    mode: 'learning',
                    type: 'completion'
                }),
                expect.objectContaining({
                    linesCount: 5,
                    timeSavedMs: 50000
                })
            );
        });

        it('should send telemetry events when suggestions are rejected', async () => {
            const { TelemetryService } = await import('../telemetry-service');
            const mockTelemetryInstance = TelemetryService.getInstance(mockContext);

            metricsService.recordSuggestionRejected({ agent: 'coder', mode: 'learning', type: 'completion' });

            expect(mockTelemetryInstance.sendEvent).toHaveBeenCalledWith(
                'suggestion.rejected',
                expect.objectContaining({
                    agent: 'coder',
                    mode: 'learning',
                    type: 'completion'
                })
            );
        });

        it('should not include user code in telemetry events', async () => {
            const { TelemetryService } = await import('../telemetry-service');
            const mockTelemetryInstance = TelemetryService.getInstance(mockContext);

            metricsService.recordSuggestionAccepted(5, { agent: 'coder', mode: 'learning', type: 'completion' });

            // Verify that sendEvent was called
            expect(mockTelemetryInstance.sendEvent).toHaveBeenCalled();

            // Get the call arguments
            const callArgs = (mockTelemetryInstance.sendEvent as any).mock.calls[0];
            const properties = callArgs[1];

            // Verify no code-related properties
            expect(properties).not.toHaveProperty('code');
            expect(properties).not.toHaveProperty('content');
            expect(properties).not.toHaveProperty('text');

            // Only metadata should be present
            expect(properties).toHaveProperty('agent');
            expect(properties).toHaveProperty('mode');
            expect(properties).toHaveProperty('type');
        });
    });
});
