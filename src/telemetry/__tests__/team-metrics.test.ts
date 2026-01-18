import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TeamMetricsService } from '../team-metrics-service';
import { MetricsService } from '../metrics-service';
import { SurveyService } from '../survey-service';

describe('TeamMetricsService', () => {
    let context: any;
    let teamMetricsService: TeamMetricsService;
    let metricsService: MetricsService;
    let surveyService: SurveyService;

    beforeEach(async () => {
        // Create mock extension context with working globalState
        const globalStateData = new Map<string, any>();
        context = {
            globalState: {
                get: vi.fn((key: string, defaultValue?: any) => globalStateData.get(key) ?? defaultValue),
                update: vi.fn(async (key: string, value: any) => {
                    globalStateData.set(key, value);
                }),
                keys: vi.fn(() => Array.from(globalStateData.keys()))
            },
            subscriptions: [],
            extensionPath: '/test/path',
            storagePath: '/test/storage',
            globalStoragePath: '/test/global-storage',
            globalStorageUri: { fsPath: '/test/global-storage' },
            logPath: '/test/logs'
        };

        // Initialize services
        metricsService = MetricsService.getInstance(context);
        // Note: initialize() is private, but getInstance handles initialization

        surveyService = new SurveyService(context);

        teamMetricsService = new TeamMetricsService(context, metricsService, surveyService);
    });

    afterEach(() => {
        metricsService.dispose();
    });

    describe('calculateAdoptionScore', () => {
        it('should return 0 for no sessions', async () => {
            const score = await teamMetricsService.calculateAdoptionScore();
            expect(score).toBe(0);
        });

        it('should calculate score based on sessions per week', async () => {
            // Record some sessions using public methods
            const metrics = await metricsService.getMetrics();
            // Simulate session data by updating metrics directly through globalState
            await context.globalState.update('metrics.firstSessionDate', Date.now() - 7 * 24 * 60 * 60 * 1000);

            const score = await teamMetricsService.calculateAdoptionScore();
            expect(score).toBeGreaterThanOrEqual(0);
            expect(score).toBeLessThanOrEqual(100);
        });
    });

    describe('calculateComprehensionTrend', () => {
        it('should return empty array for no survey data', async () => {
            const trend = await teamMetricsService.calculateComprehensionTrend();
            expect(trend.length).toBe(0);
        });

        it('should calculate moving average of survey scores', async () => {
            // Mock survey data in globalState
            const surveyHistory = [
                { score: 4, timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000 },
                { score: 5, timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000 },
                { score: 3, timestamp: Date.now() }
            ];

            await context.globalState.update('survey.history', surveyHistory);

            const trend = await teamMetricsService.calculateComprehensionTrend();
            expect(trend.length).toBeGreaterThan(0);
            expect(trend.every((point: any) => point.average >= 0 && point.average <= 5)).toBe(true);
        });
    });

    describe('calculateQualityImpact', () => {
        it('should return 0 for no data', async () => {
            const impact = await teamMetricsService.calculateQualityImpact();
            expect(impact).toBe(0);
        });
    });

    describe('trackTeamModeSession', () => {
        it('should track Team Mode session duration', async () => {
            const duration = 3600000; // 1 hour in ms
            await teamMetricsService.trackTeamModeSession(duration);

            const metrics = await teamMetricsService.getTeamMetrics();
            expect(metrics.teamModeUsage).toBeDefined();
            expect(metrics.teamModeUsage.totalDuration).toBeGreaterThanOrEqual(duration);
        });

        it('should track multiple Team Mode sessions', async () => {
            await teamMetricsService.trackTeamModeSession(1800000); // 30 min
            await teamMetricsService.trackTeamModeSession(2700000); // 45 min

            const metrics = await teamMetricsService.getTeamMetrics();
            expect(metrics.teamModeUsage.sessionCount).toBe(2);
            expect(metrics.teamModeUsage.totalDuration).toBe(4500000);
        });
    });

    describe('getTeamMetrics', () => {
        it('should return comprehensive team metrics', async () => {
            const metrics = await teamMetricsService.getTeamMetrics();

            expect(metrics.adoptionScore).toBeDefined();
            expect(metrics.comprehensionTrend).toBeDefined();
            expect(metrics.qualityImpact).toBeDefined();
            expect(metrics.teamModeUsage).toBeDefined();
        });
    });
});
