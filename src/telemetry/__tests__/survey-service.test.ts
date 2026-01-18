import { describe, it, expect, beforeEach, vi } from 'vitest';
import type * as vscode from 'vscode';

// Mock TelemetryService BEFORE importing SurveyService
vi.mock('../telemetry-service', () => ({
    TelemetryService: {
        getInstance: vi.fn(() => ({
            isEnabled: vi.fn(() => true),
            trackEvent: vi.fn(),
        })),
    },
}));

// Mock ModeManager BEFORE importing SurveyService
vi.mock('../../modes/mode-manager', () => ({
    ModeManager: {
        getInstance: vi.fn(() => ({
            getCurrentMode: vi.fn(() => 'learning'),
        })),
    },
}));

// Now import SurveyService after mocks are set up
import { SurveyService } from '../survey-service';

// Mock VSCode API
const mockContext = {
    globalState: {
        get: vi.fn(),
        update: vi.fn(),
    },
    subscriptions: [],
} as unknown as vscode.ExtensionContext;

const mockTelemetryService = {
    isEnabled: vi.fn(),
    trackEvent: vi.fn(),
};

describe('SurveyService', () => {
    let surveyService: SurveyService;

    beforeEach(() => {
        vi.clearAllMocks();
        surveyService = new SurveyService(mockContext, mockTelemetryService as any);
    });

    describe('Sampling Logic', () => {
        it('should trigger survey 20% of the time', () => {
            // Mock Math.random to return values that test the 20% threshold
            const randomSpy = vi.spyOn(Math, 'random');

            // Test below threshold (should trigger)
            randomSpy.mockReturnValue(0.15); // 15% < 20%
            expect(surveyService['shouldShowSurvey']()).toBe(true);

            // Test at threshold (should trigger)
            randomSpy.mockReturnValue(0.19); // 19% < 20%
            expect(surveyService['shouldShowSurvey']()).toBe(true);

            // Test above threshold (should not trigger)
            randomSpy.mockReturnValue(0.25); // 25% > 20%
            expect(surveyService['shouldShowSurvey']()).toBe(false);

            randomSpy.mockRestore();
        });
    });

    describe('Session Tracking', () => {
        it('should track session start time', () => {
            const startTime = Date.now();
            surveyService.startSession();

            const sessionStats = surveyService['getCurrentSessionStats']();
            expect(sessionStats.startTime).toBeGreaterThanOrEqual(startTime);
            expect(sessionStats.startTime).toBeLessThanOrEqual(Date.now());
        });

        it('should track interaction count', () => {
            surveyService.startSession();
            surveyService.recordInteraction();
            surveyService.recordInteraction();
            surveyService.recordInteraction();

            const sessionStats = surveyService['getCurrentSessionStats']();
            expect(sessionStats.interactionCount).toBe(3);
        });

        it('should track feature usage', () => {
            surveyService.startSession();
            surveyService.recordFeatureUsage('coder');
            surveyService.recordFeatureUsage('architect');
            surveyService.recordFeatureUsage('coder');

            const sessionStats = surveyService['getCurrentSessionStats']();
            expect(sessionStats.featureUsage).toEqual({
                coder: 2,
                architect: 1,
            });
        });
    });

    describe('State Persistence', () => {
        it('should save pending survey state on session end', async () => {
            const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.15); // Trigger survey
            const now = Date.now();
            const dateNowSpy = vi.spyOn(Date, 'now');

            // Start session at time T
            dateNowSpy.mockReturnValue(now);
            surveyService.startSession();

            surveyService.recordInteraction();
            surveyService.recordInteraction();
            surveyService.recordInteraction();
            surveyService.recordInteraction();
            surveyService.recordInteraction();

            // End session 6 minutes later (> 5 min minimum)
            dateNowSpy.mockReturnValue(now + 360000); // 6 minutes in ms
            await surveyService.endSession();

            expect(mockContext.globalState.update).toHaveBeenCalledWith(
                'survey.pendingSurvey',
                true
            );
            expect(mockContext.globalState.update).toHaveBeenCalledWith(
                'survey.lastShownDate',
                expect.any(Number)
            );
            expect(mockContext.globalState.update).toHaveBeenCalledWith(
                'session.stats',
                expect.objectContaining({
                    interactionCount: 5,
                    featureUsage: expect.any(Object),
                })
            );

            randomSpy.mockRestore();
            dateNowSpy.mockRestore();
        });

        it('should not save pending survey if sampling fails', async () => {
            const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.95); // Don't trigger

            surveyService.startSession();
            surveyService.recordInteraction();

            await surveyService.endSession();

            expect(mockContext.globalState.update).not.toHaveBeenCalledWith(
                'survey.pendingSurvey',
                true
            );

            randomSpy.mockRestore();
        });

        it('should not trigger survey if session has insufficient interactions', async () => {
            const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.15);

            surveyService.startSession();
            surveyService.recordInteraction(); // Only 1 interaction (< 3 minimum)

            await surveyService.endSession();

            expect(mockContext.globalState.update).not.toHaveBeenCalledWith(
                'survey.pendingSurvey',
                true
            );

            randomSpy.mockRestore();
        });
    });

    describe('Survey Prompt Check', () => {
        it('should detect pending survey on activation', async () => {
            (mockContext.globalState.get as any).mockImplementation((key: string) => {
                if (key === 'survey.pendingSurvey') return true;
                if (key === 'session.stats') return {
                    startTime: Date.now() - 600000,
                    interactionCount: 10,
                    featureUsage: { coder: 5 },
                };
                return undefined;
            });

            const hasPending = await surveyService['hasPendingSurvey']();
            expect(hasPending).toBe(true);
        });

        it('should return false if no pending survey', async () => {
            (mockContext.globalState.get as any).mockReturnValue(undefined);

            const hasPending = await surveyService['hasPendingSurvey']();
            expect(hasPending).toBe(false);
        });
    });

    describe('Telemetry Payload Construction', () => {
        it('should construct proper telemetry payload with session metadata', () => {
            const sessionStats = {
                startTime: Date.now() - 600000,
                interactionCount: 15,
                featureUsage: { coder: 8, architect: 7 },
            };

            const payload = surveyService['buildTelemetryPayload'](8, 'Great experience!', sessionStats);

            expect(payload.properties).toEqual({
                comprehensionScore: '8',
                feedback: 'Great experience!',
                activeMode: expect.any(String),
                agentUsage: expect.stringContaining('coder'),
            });

            expect(payload.measurements).toEqual({
                sessionDuration: expect.any(Number),
                interactionCount: 15,
                contextSize: expect.any(Number),
            });
        });

        it('should sanitize freeform text to prevent PII leakage', () => {
            const sessionStats = {
                startTime: Date.now(),
                interactionCount: 5,
                featureUsage: {},
            };

            const unsafeText = 'My email is john@example.com and my API key is sk-1234567890';
            const payload = surveyService['buildTelemetryPayload'](7, unsafeText, sessionStats);

            // Should sanitize or warn about PII
            expect(payload.properties.feedback).not.toContain('@example.com');
            expect(payload.properties.feedback).not.toContain('sk-1234567890');
        });
    });

    describe('Weekly Survey Eligibility', () => {
        it('should not be eligible if user has used extension for less than 7 days', async () => {
            const now = Date.now();
            const sixDaysAgo = now - (6 * 24 * 60 * 60 * 1000); // 6 days

            (mockContext.globalState.get as any).mockImplementation((key: string) => {
                if (key === 'survey.firstUsageDate') return sixDaysAgo;
                return undefined;
            });

            const isEligible = await surveyService['checkWeeklySurveyEligibility']();
            expect(isEligible).toBe(false);
        });

        it('should be eligible if user has used extension for at least 7 days', async () => {
            const now = Date.now();
            const eightDaysAgo = now - (8 * 24 * 60 * 60 * 1000); // 8 days

            (mockContext.globalState.get as any).mockImplementation((key: string) => {
                if (key === 'survey.firstUsageDate') return eightDaysAgo;
                return undefined;
            });

            const isEligible = await surveyService['checkWeeklySurveyEligibility']();
            expect(isEligible).toBe(true);
        });

        it('should not be eligible if less than 7 days since last survey', async () => {
            const now = Date.now();
            const eightDaysAgo = now - (8 * 24 * 60 * 60 * 1000);
            const fiveDaysAgo = now - (5 * 24 * 60 * 60 * 1000);

            (mockContext.globalState.get as any).mockImplementation((key: string) => {
                if (key === 'survey.firstUsageDate') return eightDaysAgo;
                if (key === 'survey.weekly.lastShown') return fiveDaysAgo;
                return undefined;
            });

            const isEligible = await surveyService['checkWeeklySurveyEligibility']();
            expect(isEligible).toBe(false);
        });

        it('should be eligible if at least 7 days since last survey', async () => {
            const now = Date.now();
            const fifteenDaysAgo = now - (15 * 24 * 60 * 60 * 1000);
            const eightDaysAgo = now - (8 * 24 * 60 * 60 * 1000);

            (mockContext.globalState.get as any).mockImplementation((key: string) => {
                if (key === 'survey.firstUsageDate') return fifteenDaysAgo;
                if (key === 'survey.weekly.lastShown') return eightDaysAgo;
                return undefined;
            });

            const isEligible = await surveyService['checkWeeklySurveyEligibility']();
            expect(isEligible).toBe(true);
        });

        it('should not be eligible if survey is snoozed', async () => {
            const now = Date.now();
            const eightDaysAgo = now - (8 * 24 * 60 * 60 * 1000);
            const futureTime = now + (12 * 60 * 60 * 1000); // 12 hours from now

            (mockContext.globalState.get as any).mockImplementation((key: string) => {
                if (key === 'survey.firstUsageDate') return eightDaysAgo;
                if (key === 'survey.weekly.snoozedUntil') return futureTime;
                return undefined;
            });

            const isEligible = await surveyService['checkWeeklySurveyEligibility']();
            expect(isEligible).toBe(false);
        });

        it('should be eligible if snooze period has passed', async () => {
            const now = Date.now();
            const eightDaysAgo = now - (8 * 24 * 60 * 60 * 1000);
            const pastTime = now - (1 * 60 * 60 * 1000); // 1 hour ago

            (mockContext.globalState.get as any).mockImplementation((key: string) => {
                if (key === 'survey.firstUsageDate') return eightDaysAgo;
                if (key === 'survey.weekly.snoozedUntil') return pastTime;
                return undefined;
            });

            const isEligible = await surveyService['checkWeeklySurveyEligibility']();
            expect(isEligible).toBe(true);
        });
    });

    describe('Feature Discovery', () => {
        it('should return a tip for unused features', async () => {
            (mockContext.globalState.get as any).mockImplementation((key: string) => {
                if (key === 'survey.featuresUsed') return { 'mode:learning': true };
                return undefined;
            });

            const tip = await surveyService['getUnusedFeatureTip']();
            expect(tip).toBeTruthy();
            expect(tip).not.toContain('Learning Mode'); // Should not suggest already used feature
        });

        it('should return null if all features have been used', async () => {
            (mockContext.globalState.get as any).mockImplementation((key: string) => {
                if (key === 'survey.featuresUsed') return {
                    'mode:learning': true,
                    'mode:expert': true,
                    'command:explain': true,
                    'command:refactor': true,
                    'agent:reviewer': true,
                };
                return undefined;
            });

            const tip = await surveyService['getUnusedFeatureTip']();
            expect(tip).toBeNull();
        });

        it('should mark features as used', async () => {
            await surveyService.markFeatureUsed('mode:learning');

            expect(mockContext.globalState.update).toHaveBeenCalledWith(
                'survey.featuresUsed',
                expect.objectContaining({ 'mode:learning': true })
            );
        });
    });

    describe('Survey Priority', () => {
        it('should prioritize weekly survey over post-session survey', async () => {
            const now = Date.now();
            const eightDaysAgo = now - (8 * 24 * 60 * 60 * 1000);

            (mockContext.globalState.get as any).mockImplementation((key: string) => {
                if (key === 'survey.firstUsageDate') return eightDaysAgo;
                if (key === 'survey.pendingSurvey') return true; // Post-session pending
                return undefined;
            });

            mockTelemetryService.isEnabled.mockReturnValue(true);

            // Mock showWeeklyLearningSurvey to track if it was called
            const showWeeklySpy = vi.spyOn(surveyService as any, 'showWeeklyLearningSurvey').mockResolvedValue(undefined);

            await surveyService.checkAndPrompt();

            // Weekly survey should be called
            expect(showWeeklySpy).toHaveBeenCalled();

            showWeeklySpy.mockRestore();
        });
    });
});
