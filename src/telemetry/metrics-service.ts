import * as vscode from 'vscode';
import { IUsageMetrics, IDailyMetrics, DEFAULT_METRICS } from './metrics.interface';
import { MetricsStorage } from './metrics-storage';

/**
 * Service for tracking extension usage metrics locally.
 * Focuses on user-facing value like "Time Saved".
 */
export class MetricsService implements vscode.Disposable {
    private static instance: MetricsService;
    private storage: MetricsStorage;
    private currentMetrics: IUsageMetrics = { ...DEFAULT_METRICS };
    private sessionStartTime: number = Date.now();

    // Constant for time saved calculation: 10 seconds per line of code
    private readonly TYPING_SPEED_MS_PER_LINE = 10000;

    private constructor(context: vscode.ExtensionContext) {
        this.storage = new MetricsStorage(context);
        this.initialize();
    }

    public static getInstance(context?: vscode.ExtensionContext): MetricsService {
        if (!MetricsService.instance) {
            if (!context) {
                throw new Error('MetricsService must be initialized with context before first use.');
            }
            MetricsService.instance = new MetricsService(context);
        }
        return MetricsService.instance;
    }

    private async initialize(): Promise<void> {
        this.currentMetrics = await this.storage.loadMetrics();
        this.recordSessionStart();
    }

    private recordSessionStart(): void {
        this.currentMetrics.totalSessions++;
        this.sessionStartTime = Date.now();
        this.save();
    }

    public recordSessionEnd(): void {
        const duration = Date.now() - this.sessionStartTime;
        this.currentMetrics.totalSessionDurationMs += duration;
        this.save();
    }

    public recordSuggestionRequested(): void {
        this.currentMetrics.suggestionsRequested++;
        this.getTodayStats().suggestionsRequested++;
        this.save();
    }

    public recordSuggestionAccepted(linesCount: number): void {
        this.currentMetrics.suggestionsAccepted++;
        this.currentMetrics.linesAccepted += linesCount;

        const timeSaved = linesCount * this.TYPING_SPEED_MS_PER_LINE;
        this.currentMetrics.timeSavedMs += timeSaved;

        const today = this.getTodayStats();
        today.suggestionsAccepted++;
        today.linesAccepted += linesCount;
        today.timeSavedMs += timeSaved;

        this.save();
    }

    public recordSuggestionRejected(): void {
        this.currentMetrics.suggestionsRejected++;
        this.getTodayStats().suggestionsRejected++;
        this.save();
    }

    public async getMetrics(): Promise<IUsageMetrics> {
        // Update session duration before returning
        const currentDuration = Date.now() - this.sessionStartTime;
        return {
            ...this.currentMetrics,
            totalSessionDurationMs: this.currentMetrics.totalSessionDurationMs + currentDuration
        };
    }

    public async exportMetrics(): Promise<void> {
        await this.storage.exportMetrics();
    }

    private getTodayStats(): IDailyMetrics {
        const today = new Date().toISOString().split('T')[0];
        if (!this.currentMetrics.dailyStats[today]) {
            this.currentMetrics.dailyStats[today] = {
                suggestionsRequested: 0,
                suggestionsAccepted: 0,
                suggestionsRejected: 0,
                linesAccepted: 0,
                timeSavedMs: 0
            };
        }
        return this.currentMetrics.dailyStats[today];
    }

    private async save(): Promise<void> {
        this.currentMetrics.lastUpdated = Date.now();
        await this.storage.saveMetrics(this.currentMetrics);
    }

    public dispose(): void {
        this.recordSessionEnd();
    }
}
