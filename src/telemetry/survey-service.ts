import * as vscode from 'vscode';
import { TelemetryService } from './telemetry-service';
import { ModeManager } from '../modes/mode-manager';

/**
 * Session statistics tracked during extension usage
 */
interface ISessionStats {
    startTime: number;
    interactionCount: number;
    featureUsage: Record<string, number>;
}

/**
 * SurveyService manages post-session comprehension surveys
 * Implements 20% sampling rate and non-blocking UI flow
 */
export class SurveyService {
    private static readonly SAMPLING_RATE = 0.2; // 20%
    private static readonly MIN_INTERACTIONS = 3; // Minimum interactions to trigger survey
    private static readonly MIN_SESSION_DURATION = 300000; // 5 minutes in ms

    private currentSession: ISessionStats | null = null;
    private telemetryService: TelemetryService;

    constructor(
        private context: vscode.ExtensionContext,
        telemetryService?: TelemetryService
    ) {
        this.telemetryService = telemetryService || TelemetryService.getInstance(context);
    }

    /**
     * Start tracking a new session
     */
    public startSession(): void {
        this.currentSession = {
            startTime: Date.now(),
            interactionCount: 0,
            featureUsage: {},
        };
    }

    /**
     * Record a user interaction (suggestion, command, etc.)
     */
    public recordInteraction(): void {
        if (this.currentSession) {
            this.currentSession.interactionCount++;
        }
    }

    /**
     * Record usage of a specific feature/agent
     */
    public recordFeatureUsage(feature: string): void {
        if (this.currentSession) {
            this.currentSession.featureUsage[feature] =
                (this.currentSession.featureUsage[feature] || 0) + 1;
        }
    }

    /**
     * End the current session and determine if survey should be shown
     * Called during extension deactivate
     */
    public async endSession(): Promise<void> {
        if (!this.currentSession) {
            return;
        }

        const sessionStats = this.getCurrentSessionStats();
        const sessionDuration = Date.now() - sessionStats.startTime;

        // Check if session meets minimum criteria
        const meetsMinimumCriteria =
            sessionStats.interactionCount >= SurveyService.MIN_INTERACTIONS &&
            sessionDuration >= SurveyService.MIN_SESSION_DURATION;

        if (meetsMinimumCriteria && this.shouldShowSurvey()) {
            // Mark survey as pending for next activation
            await this.context.globalState.update('survey.pendingSurvey', true);
            await this.context.globalState.update('survey.lastShownDate', Date.now());
            await this.context.globalState.update('session.stats', sessionStats);
        }

        // Reset current session
        this.currentSession = null;
    }

    /**
     * Check if there's a pending survey and show it
     * Called during extension activation
     */
    public async checkAndPrompt(): Promise<void> {
        const hasPending = await this.hasPendingSurvey();

        if (!hasPending) {
            return;
        }

        // Check if telemetry is enabled
        if (!this.telemetryService.isEnabled()) {
            // Clear pending state if telemetry is disabled
            await this.context.globalState.update('survey.pendingSurvey', false);
            return;
        }

        // Get previous session stats
        const sessionStats = await this.context.globalState.get<ISessionStats>('session.stats');

        if (!sessionStats) {
            await this.context.globalState.update('survey.pendingSurvey', false);
            return;
        }

        // Show survey
        await this.showComprehensionSurvey(sessionStats);

        // Clear pending state
        await this.context.globalState.update('survey.pendingSurvey', false);
    }

    /**
     * Show the comprehension survey using VSCode native UI
     */
    private async showComprehensionSurvey(sessionStats: ISessionStats): Promise<void> {
        // Step 1: Ask if user wants to participate
        const participate = await vscode.window.showInformationMessage(
            'AI-101: How well did you understand the AI\'s suggestions in your last session?',
            { modal: false },
            'Yes, I\'ll answer',
            'No, thanks'
        );

        if (participate !== 'Yes, I\'ll answer') {
            return;
        }

        // Step 2: Get comprehension score (1-10)
        const scoreOptions = [
            { label: '10 (Excellent)', value: 10 },
            { label: '9', value: 9 },
            { label: '8', value: 8 },
            { label: '7', value: 7 },
            { label: '6', value: 6 },
            { label: '5', value: 5 },
            { label: '4', value: 4 },
            { label: '3', value: 3 },
            { label: '2', value: 2 },
            { label: '1 (Poor)', value: 1 },
        ];

        const selectedScore = await vscode.window.showQuickPick(scoreOptions, {
            placeHolder: 'Rate your comprehension (1-10)',
            title: 'AI-101 Comprehension Survey',
        });

        if (!selectedScore) {
            return;
        }

        // Step 3: Get optional feedback
        const feedback = await vscode.window.showInputBox({
            prompt: 'What was unclear or confusing? (Optional)',
            placeHolder: 'Please do not include personal data or code snippets',
            ignoreFocusOut: true,
        });

        // Send telemetry
        const payload = this.buildTelemetryPayload(
            selectedScore.value,
            feedback || '',
            sessionStats
        );

        this.telemetryService.trackEvent(
            'survey.comprehension',
            payload.properties,
            payload.measurements
        );

        // Show thank you message
        vscode.window.showInformationMessage('AI-101: Thank you for your feedback!');
    }

    /**
     * Build telemetry payload with session metadata
     */
    private buildTelemetryPayload(
        score: number,
        feedback: string,
        sessionStats: ISessionStats
    ): { properties: Record<string, string>; measurements: Record<string, number> } {
        const sessionDuration = Date.now() - sessionStats.startTime;
        const activeMode = ModeManager.getInstance().getCurrentMode();

        // Sanitize feedback to remove potential PII
        const sanitizedFeedback = this.sanitizeFeedback(feedback);

        // Build agent usage string
        const agentUsage = Object.entries(sessionStats.featureUsage)
            .map(([agent, count]) => `${agent}:${count}`)
            .join(', ');

        return {
            properties: {
                comprehensionScore: score.toString(),
                feedback: sanitizedFeedback,
                activeMode: activeMode,
                agentUsage: agentUsage,
            },
            measurements: {
                sessionDuration: sessionDuration,
                interactionCount: sessionStats.interactionCount,
                contextSize: 0, // TODO: Get actual context size from MetricsService
            },
        };
    }

    /**
     * Sanitize freeform text to prevent PII leakage
     */
    private sanitizeFeedback(text: string): string {
        if (!text) {
            return '';
        }

        // Remove email addresses
        let sanitized = text.replace(/[\w.-]+@[\w.-]+\.\w+/g, '[EMAIL_REDACTED]');

        // Remove API keys (common patterns)
        sanitized = sanitized.replace(/sk-[a-zA-Z0-9]+/g, '[API_KEY_REDACTED]');
        sanitized = sanitized.replace(/Bearer\s+[a-zA-Z0-9_-]+/g, '[TOKEN_REDACTED]');

        // Remove potential file paths
        sanitized = sanitized.replace(/[A-Za-z]:\\[\w\\.-]+/g, '[PATH_REDACTED]');
        sanitized = sanitized.replace(/\/[\w\/.-]+/g, '[PATH_REDACTED]');

        return sanitized;
    }

    /**
     * Determine if survey should be shown based on sampling rate
     */
    private shouldShowSurvey(): boolean {
        return Math.random() < SurveyService.SAMPLING_RATE;
    }

    /**
     * Check if there's a pending survey
     */
    private async hasPendingSurvey(): Promise<boolean> {
        const pending = await this.context.globalState.get<boolean>('survey.pendingSurvey');
        return pending === true;
    }

    /**
     * Get current session statistics
     */
    private getCurrentSessionStats(): ISessionStats {
        if (!this.currentSession) {
            return {
                startTime: Date.now(),
                interactionCount: 0,
                featureUsage: {},
            };
        }
        return { ...this.currentSession };
    }
}
