import * as vscode from 'vscode';
import { AgentMode } from '../modes/mode-types.js';

/**
 * Survey response data.
 */
export interface ISurveyResponse {
    timestamp: number;
    comprehensionScore: number; // 1-10 scale
    sessionDuration: number;    // Duration in seconds
}

/**
 * Manages team comprehension surveys for Team Mode.
 * Surveys are opt-in only (NFR-SEC-2 compliance).
 */
export class SurveyManager {
    private static instance: SurveyManager;
    private surveyEnabled: boolean = false;
    private sessionStartTime: number = Date.now();
    private minSessionDurationMs = 5 * 60 * 1000; // 5 minutes minimum for survey
    private idleTimeoutMs = 10 * 60 * 1000; // 10 minutes idle = session end
    private lastActivityTime: number = Date.now();
    private idleCheckInterval: NodeJS.Timeout | undefined;
    private currentMode: AgentMode = AgentMode.Learning;

    private constructor() {
        this.loadConfiguration();
        this.startIdleDetection();
    }

    public static getInstance(): SurveyManager {
        if (!SurveyManager.instance) {
            SurveyManager.instance = new SurveyManager();
        }
        return SurveyManager.instance;
    }

    /**
     * Load survey configuration from VSCode settings.
     */
    private loadConfiguration(): void {
        const config = vscode.workspace.getConfiguration('ai101.teamMode');
        this.surveyEnabled = config.get<boolean>('surveyEnabled', false); // Default: disabled (opt-in)
        console.log(`SurveyManager: Survey enabled = ${this.surveyEnabled}`);
    }

    /**
     * Update current mode (tracks when Team Mode is active).
     */
    public updateMode(mode: AgentMode): void {
        const wasTeamMode = this.currentMode === AgentMode.Team;
        const isTeamMode = mode === AgentMode.Team;

        this.currentMode = mode;

        // Session starts when entering Team Mode
        if (isTeamMode && !wasTeamMode) {
            this.startSession();
        }

        // Session ends when leaving Team Mode
        if (wasTeamMode && !isTeamMode) {
            this.endSession();
        }
    }

    /**
     * Record user activity (resets idle timer).
     */
    public recordActivity(): void {
        this.lastActivityTime = Date.now();
    }

    /**
     * Start a new Team Mode session.
     */
    private startSession(): void {
        this.sessionStartTime = Date.now();
        this.lastActivityTime = Date.now();
        console.log('SurveyManager: Team Mode session started');
    }

    /**
     * End current Team Mode session and potentially show survey.
     */
    private endSession(): void {
        if (!this.surveyEnabled) return;

        const sessionDuration = Date.now() - this.sessionStartTime;

        // Only show survey if session was long enough
        if (sessionDuration >= this.minSessionDurationMs) {
            this.showSurveyPrompt(sessionDuration);
        } else {
            console.log(`SurveyManager: Session too short (${Math.floor(sessionDuration / 1000)}s), skipping survey`);
        }
    }

    /**
     * Start idle detection (checks every 30 seconds).
     */
    private startIdleDetection(): void {
        this.idleCheckInterval = setInterval(() => {
            if (this.currentMode === AgentMode.Team) {
                const idleTime = Date.now() - this.lastActivityTime;
                if (idleTime >= this.idleTimeoutMs) {
                    console.log('SurveyManager: Idle timeout detected, ending session');
                    this.endSession();
                    this.updateMode(AgentMode.Learning); // Reset to Learning mode
                }
            }
        }, 30000); // Check every 30 seconds
    }

    /**
     * Show survey prompt to user.
     */
    private async showSurveyPrompt(sessionDuration: number): Promise<void> {
        const sessionMinutes = Math.floor(sessionDuration / 60000);

        const response = await vscode.window.showInformationMessage(
            `Team Mode session complete (${sessionMinutes}m). How well did your team understand the AI actions? (1-10)`,
            '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Skip'
        );

        if (response && response !== 'Skip') {
            const score = parseInt(response);
            await this.storeSurveyResponse({
                timestamp: Date.now(),
                comprehensionScore: score,
                sessionDuration: Math.floor(sessionDuration / 1000)
            });

            vscode.window.showInformationMessage(
                `Thank you for your feedback! Score: ${score}/10`
            );
        }
    }

    /**
     * Store survey response in workspace state (anonymized).
     */
    private async storeSurveyResponse(response: ISurveyResponse): Promise<void> {
        const config = vscode.workspace.getConfiguration('ai101.teamMode');
        const existingResponses = config.get<ISurveyResponse[]>('surveyResponses', []);

        existingResponses.push(response);

        // Keep only last 20 responses to avoid bloat
        const recentResponses = existingResponses.slice(-20);

        await config.update('surveyResponses', recentResponses, vscode.ConfigurationTarget.Workspace);

        console.log(`SurveyManager: Survey response stored (score: ${response.comprehensionScore})`);
    }

    /**
     * Get average comprehension score from stored responses.
     */
    public getAverageComprehensionScore(): number {
        const config = vscode.workspace.getConfiguration('ai101.teamMode');
        const responses = config.get<ISurveyResponse[]>('surveyResponses', []);

        if (responses.length === 0) return 0;

        const total = responses.reduce((sum, r) => sum + r.comprehensionScore, 0);
        return Math.round((total / responses.length) * 10) / 10; // Round to 1 decimal
    }

    /**
     * Stop idle detection (cleanup).
     */
    public stop(): void {
        if (this.idleCheckInterval) {
            clearInterval(this.idleCheckInterval);
            this.idleCheckInterval = undefined;
        }
    }
}
