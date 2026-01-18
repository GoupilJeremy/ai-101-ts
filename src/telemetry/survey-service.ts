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

    // Weekly survey constants
    private static readonly WEEKLY_INTERVAL = 7 * 24 * 60 * 60 * 1000; // 7 days in ms
    private static readonly SNOOZE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in ms
    private static readonly MIN_USAGE_DAYS = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

    private currentSession: ISessionStats | null = null;
    private telemetryService: TelemetryService;

    constructor(
        private context: vscode.ExtensionContext,
        telemetryService?: TelemetryService
    ) {
        this.telemetryService = telemetryService || TelemetryService.getInstance(context);
        // Initialize first usage date if not set
        this.initializeFirstUsageDate();
    }

    /**
     * Initialize first usage date if not already set
     */
    private async initializeFirstUsageDate(): Promise<void> {
        const firstUsageDate = await this.context.globalState.get<number>('survey.firstUsageDate');
        if (!firstUsageDate) {
            await this.context.globalState.update('survey.firstUsageDate', Date.now());
        }
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
     * Checks both post-session and weekly surveys (weekly takes priority)
     */
    public async checkAndPrompt(): Promise<void> {
        // Check if telemetry is enabled first
        if (!this.telemetryService.isEnabled()) {
            // Clear any pending states if telemetry is disabled
            await this.context.globalState.update('survey.pendingSurvey', false);
            return;
        }

        // Check weekly survey first (higher priority as it's rarer)
        const isWeeklyEligible = await this.checkWeeklySurveyEligibility();
        if (isWeeklyEligible) {
            await this.showWeeklyLearningSurvey();
            return; // Don't show post-session survey if weekly was shown
        }

        // Check post-session survey
        const hasPending = await this.hasPendingSurvey();
        if (!hasPending) {
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
     * Check if user is eligible for weekly learning survey
     */
    private async checkWeeklySurveyEligibility(): Promise<boolean> {
        const firstUsageDate = await this.context.globalState.get<number>('survey.firstUsageDate');
        const lastShown = await this.context.globalState.get<number>('survey.weekly.lastShown') || 0;
        const snoozedUntil = await this.context.globalState.get<number>('survey.weekly.snoozedUntil') || 0;

        const now = Date.now();

        // Check if user has been using the extension for at least 7 days
        if (!firstUsageDate || (now - firstUsageDate) < SurveyService.MIN_USAGE_DAYS) {
            return false;
        }

        // Check if at least 7 days have passed since last survey
        if (lastShown && (now - lastShown) < SurveyService.WEEKLY_INTERVAL) {
            return false;
        }

        // Check if survey is snoozed
        if (snoozedUntil && now < snoozedUntil) {
            return false;
        }

        return true;
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
     * Show the weekly learning progress survey
     */
    private async showWeeklyLearningSurvey(): Promise<void> {
        // Step 1: Ask if user wants to participate
        const participate = await vscode.window.showInformationMessage(
            'AI-101: Quick check-in: How\'s your learning progress this week?',
            { modal: false },
            'Start Survey',
            'Snooze 24h',
            'Skip'
        );

        const now = Date.now();

        if (participate === 'Snooze 24h') {
            await this.context.globalState.update(
                'survey.weekly.snoozedUntil',
                now + SurveyService.SNOOZE_DURATION
            );
            return;
        }

        if (participate === 'Skip' || !participate) {
            // Mark as shown so we don't pester until next week
            await this.context.globalState.update('survey.weekly.lastShown', now);
            return;
        }

        // Step 2: Get improvement score (1-10)
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
            placeHolder: 'This week, how much did AI-101 improve your understanding? (1-10)',
            title: 'AI-101 Learning Progress Survey',
        });

        if (!selectedScore) {
            return;
        }

        // Step 3: Get optional learnings
        const learnings = await vscode.window.showInputBox({
            prompt: 'What patterns or concepts did you learn? (Optional)',
            placeHolder: 'e.g., "Learned about async/await patterns"',
            ignoreFocusOut: true,
        });

        // Calculate weeks active
        const firstUsageDate = await this.context.globalState.get<number>('survey.firstUsageDate') || now;
        const weeksActive = Math.floor((now - firstUsageDate) / SurveyService.WEEKLY_INTERVAL);

        // Send telemetry
        const sanitizedLearnings = this.sanitizeFeedback(learnings || '');
        this.telemetryService.trackEvent(
            'survey.weekly_learning',
            {
                improvement_score: selectedScore.value.toString(),
                learning_concepts: sanitizedLearnings,
            },
            {
                weeks_active: weeksActive,
            }
        );

        // Update last shown timestamp
        await this.context.globalState.update('survey.weekly.lastShown', now);

        // Show feature discovery tip
        const featureTip = await this.getUnusedFeatureTip();
        if (featureTip) {
            await vscode.window.showInformationMessage(
                `AI-101: ${featureTip}`,
                { modal: false }
            );
        }

        // Show thank you message
        vscode.window.showInformationMessage('AI-101: Thank you for sharing your progress!');
    }

    /**
     * Get a tip for an unused feature (Smart Feature Discovery)
     */
    private async getUnusedFeatureTip(): Promise<string | null> {
        // Track which features have been used
        const usedFeatures = await this.context.globalState.get<Record<string, boolean>>('survey.featuresUsed') || {};

        // Define feature tips
        const featureTips = [
            {
                key: 'mode:learning',
                tip: 'Tip: Try Learning Mode for detailed explanations of AI suggestions!',
            },
            {
                key: 'mode:expert',
                tip: 'Tip: Try Expert Mode for in-depth technical details and advanced insights!',
            },
            {
                key: 'command:explain',
                tip: 'Tip: Use the Explain command to understand complex code patterns!',
            },
            {
                key: 'command:refactor',
                tip: 'Tip: Try the Refactor command to improve your code quality!',
            },
            {
                key: 'agent:reviewer',
                tip: 'Tip: The Reviewer agent can proactively identify risks in your code!',
            },
        ];

        // Find unused features
        const unusedFeatures = featureTips.filter(feature => !usedFeatures[feature.key]);

        if (unusedFeatures.length === 0) {
            return null;
        }

        // Return a random unused feature tip
        const randomIndex = Math.floor(Math.random() * unusedFeatures.length);
        return unusedFeatures[randomIndex].tip;
    }

    /**
     * Mark a feature as used for Smart Feature Discovery
     */
    public async markFeatureUsed(featureKey: string): Promise<void> {
        const usedFeatures = await this.context.globalState.get<Record<string, boolean>>('survey.featuresUsed') || {};
        usedFeatures[featureKey] = true;
        await this.context.globalState.update('survey.featuresUsed', usedFeatures);
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
