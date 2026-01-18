import * as vscode from 'vscode';
import { IUsageMetrics, IDailyMetrics, DEFAULT_METRICS, ISuggestionContext, IDimensionalMetrics } from './metrics.interface';
import { MetricsStorage } from './metrics-storage';
import { TelemetryService } from './telemetry-service';

/**
 * Service for tracking extension usage metrics locally.
 * Focuses on user-facing value like "Time Saved" and acceptance rates.
 */
export class MetricsService implements vscode.Disposable {
    private static instance: MetricsService;
    private storage: MetricsStorage;
    private telemetryService: TelemetryService | undefined;
    private currentMetrics: IUsageMetrics = { ...DEFAULT_METRICS };
    private sessionStartTime: number = Date.now();

    // Constant for time saved calculation: 10 seconds per line of code
    private readonly TYPING_SPEED_MS_PER_LINE = 10000;

    private constructor(context: vscode.ExtensionContext) {
        this.storage = new MetricsStorage(context);
        // Initialize telemetry service (will only send if opted in)
        this.telemetryService = TelemetryService.getInstance(context);
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

    public recordSuggestionAccepted(linesCount: number, context?: ISuggestionContext): void {
        this.currentMetrics.suggestionsAccepted++;
        this.currentMetrics.linesAccepted += linesCount;

        const timeSaved = linesCount * this.TYPING_SPEED_MS_PER_LINE;
        this.currentMetrics.timeSavedMs += timeSaved;

        const today = this.getTodayStats();
        today.suggestionsAccepted++;
        today.linesAccepted += linesCount;
        today.timeSavedMs += timeSaved;

        // Track dimensional stats if context provided
        if (context) {
            this.updateDimensionalStats(context, 'accepted', linesCount);

            // Send telemetry event if opted in (NO user code, only metadata)
            this.telemetryService?.sendEvent('suggestion.accepted', {
                agent: context.agent,
                mode: context.mode,
                type: context.type
            }, {
                linesCount: linesCount,
                timeSavedMs: timeSaved
            });
        }

        this.save();
    }

    public recordSuggestionRejected(context?: ISuggestionContext): void {
        this.currentMetrics.suggestionsRejected++;
        this.getTodayStats().suggestionsRejected++;

        // Track dimensional stats if context provided
        if (context) {
            this.updateDimensionalStats(context, 'rejected', 0);

            // Send telemetry event if opted in (NO user code, only metadata)
            this.telemetryService?.sendEvent('suggestion.rejected', {
                agent: context.agent,
                mode: context.mode,
                type: context.type
            });
        }

        this.save();
    }

    private updateDimensionalStats(context: ISuggestionContext, action: 'accepted' | 'rejected', linesCount: number): void {
        const { agent, mode, type } = context;

        // Initialize if not exists
        if (!this.currentMetrics.dimensionalStats.byAgent[agent]) {
            this.currentMetrics.dimensionalStats.byAgent[agent] = { accepted: 0, rejected: 0, linesAccepted: 0 };
        }
        if (!this.currentMetrics.dimensionalStats.byMode[mode]) {
            this.currentMetrics.dimensionalStats.byMode[mode] = { accepted: 0, rejected: 0, linesAccepted: 0 };
        }
        if (!this.currentMetrics.dimensionalStats.byType[type]) {
            this.currentMetrics.dimensionalStats.byType[type] = { accepted: 0, rejected: 0, linesAccepted: 0 };
        }

        // Update counts
        if (action === 'accepted') {
            this.currentMetrics.dimensionalStats.byAgent[agent].accepted++;
            this.currentMetrics.dimensionalStats.byAgent[agent].linesAccepted += linesCount;
            this.currentMetrics.dimensionalStats.byMode[mode].accepted++;
            this.currentMetrics.dimensionalStats.byMode[mode].linesAccepted += linesCount;
            this.currentMetrics.dimensionalStats.byType[type].accepted++;
            this.currentMetrics.dimensionalStats.byType[type].linesAccepted += linesCount;
        } else {
            this.currentMetrics.dimensionalStats.byAgent[agent].rejected++;
            this.currentMetrics.dimensionalStats.byMode[mode].rejected++;
            this.currentMetrics.dimensionalStats.byType[type].rejected++;
        }
    }

    /**
     * Calculate acceptance rate: accepted / (accepted + rejected) × 100
     * @param filter Optional filter for specific dimension
     * @returns Acceptance rate as percentage (0-100), or 0 if no data
     */
    public async getAcceptanceRate(filter?: { dimension: 'agent' | 'mode' | 'type'; value: string }): Promise<number> {
        let accepted: number;
        let rejected: number;

        if (filter) {
            const dimensionKey = `by${filter.dimension.charAt(0).toUpperCase() + filter.dimension.slice(1)}` as keyof typeof this.currentMetrics.dimensionalStats;
            const stats = this.currentMetrics.dimensionalStats[dimensionKey][filter.value] as IDimensionalMetrics | undefined;

            if (!stats) {
                return 0;
            }

            accepted = stats.accepted;
            rejected = stats.rejected;
        } else {
            accepted = this.currentMetrics.suggestionsAccepted;
            rejected = this.currentMetrics.suggestionsRejected;
        }

        const total = accepted + rejected;
        if (total === 0) {
            return 0;
        }

        return Math.round((accepted / total) * 100 * 100) / 100; // Round to 2 decimal places
    }

    /**
     * Get breakdown of acceptance rates by dimension
     * @param dimension The dimension to break down by
     * @returns Object mapping dimension values to their stats and acceptance rates
     */
    public async getDimensionalBreakdown(dimension: 'agent' | 'mode' | 'type'): Promise<{
        [key: string]: IDimensionalMetrics & { acceptanceRate: number };
    }> {
        const dimensionKey = `by${dimension.charAt(0).toUpperCase() + dimension.slice(1)}` as keyof typeof this.currentMetrics.dimensionalStats;
        const dimensionStats = this.currentMetrics.dimensionalStats[dimensionKey];

        const breakdown: { [key: string]: IDimensionalMetrics & { acceptanceRate: number } } = {};

        for (const [key, stats] of Object.entries(dimensionStats)) {
            const total = stats.accepted + stats.rejected;
            const acceptanceRate = total === 0 ? 0 : Math.round((stats.accepted / total) * 100 * 100) / 100;

            breakdown[key] = {
                ...stats,
                acceptanceRate
            };
        }

        return breakdown;
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

