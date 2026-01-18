import * as vscode from 'vscode';
import { MetricsService } from './metrics-service';
import { SurveyService } from './survey-service';

/**
 * Team mode usage statistics
 */
export interface ITeamModeUsage {
    sessionCount: number;
    totalDuration: number; // in milliseconds
    averageDuration: number; // in milliseconds
    lastUsed?: number; // timestamp
}

/**
 * Comprehension trend data point
 */
export interface IComprehensionTrendPoint {
    timestamp: number;
    average: number;
    count: number;
}

/**
 * Comprehensive team metrics
 */
export interface ITeamMetrics {
    adoptionScore: number; // 0-100
    comprehensionTrend: IComprehensionTrendPoint[];
    qualityImpact: number; // 0-100
    teamModeUsage: ITeamModeUsage;
    usageFrequency: {
        sessionsPerWeek: number;
        totalSessions: number;
    };
    modeDistribution: {
        [mode: string]: number; // percentage
    };
}

/**
 * Service for aggregating team-level metrics and generating reports.
 * Focuses on adoption, comprehension, and quality impact tracking.
 */
export class TeamMetricsService {
    private static readonly STORAGE_KEY_TEAM_MODE = 'team.mode.usage';
    private static readonly DAYS_IN_WEEK = 7;
    private static readonly MS_PER_DAY = 24 * 60 * 60 * 1000;

    constructor(
        private context: vscode.ExtensionContext,
        private metricsService: MetricsService,
        private surveyService: SurveyService
    ) { }

    /**
     * Calculate adoption score based on frequency of sessions and feature utilization breadth
     * Score is 0-100, where:
     * - 50% weight: Sessions per week (normalized to 5 sessions/week = 50 points)
     * - 50% weight: Feature breadth (number of different features used)
     */
    async calculateAdoptionScore(): Promise<number> {
        const metrics = await this.metricsService.getMetrics();

        // Get first session date from globalState or estimate from dailyStats
        let firstSessionDate = this.context.globalState.get<number>('metrics.firstSessionDate');
        if (!firstSessionDate) {
            // Estimate from dailyStats if available
            const dates = Object.keys(metrics.dailyStats);
            if (dates.length > 0) {
                const earliestDate = dates.sort()[0];
                firstSessionDate = new Date(earliestDate).getTime();
            } else {
                firstSessionDate = Date.now();
            }
            // Store for future use
            await this.context.globalState.update('metrics.firstSessionDate', firstSessionDate);
        }

        // Calculate sessions per week
        const totalSessions = metrics.totalSessions;
        const daysSinceFirst = Math.max(1, (Date.now() - firstSessionDate) / TeamMetricsService.MS_PER_DAY);
        const weeksActive = Math.max(1, daysSinceFirst / TeamMetricsService.DAYS_IN_WEEK);
        const sessionsPerWeek = totalSessions / weeksActive;

        // Frequency score (0-50): 5 sessions/week = 50 points, linear scaling
        const frequencyScore = Math.min(50, (sessionsPerWeek / 5) * 50);

        // Feature breadth score (0-50): based on number of different agents/modes used
        const dimensionalBreakdown = await this.metricsService.getDimensionalBreakdown('agent');
        const agentCount = Object.keys(dimensionalBreakdown).length;
        const breadthScore = Math.min(50, (agentCount / 4) * 50); // 4 agents = full score

        return Math.round(frequencyScore + breadthScore);
    }

    /**
     * Calculate comprehension trend as moving average of survey scores
     * Returns array of data points with timestamp, average, and count
     */
    async calculateComprehensionTrend(): Promise<IComprehensionTrendPoint[]> {
        // Get survey history from globalState
        const surveyHistory = this.context.globalState.get<Array<{ score: number; timestamp: number }>>('survey.history', []);

        if (surveyHistory.length === 0) {
            return [];
        }

        // Group by week and calculate averages
        const weeklyData = new Map<number, { sum: number; count: number }>();

        surveyHistory.forEach(entry => {
            const weekKey = Math.floor(entry.timestamp / (TeamMetricsService.DAYS_IN_WEEK * TeamMetricsService.MS_PER_DAY));
            const existing = weeklyData.get(weekKey) || { sum: 0, count: 0 };
            weeklyData.set(weekKey, {
                sum: existing.sum + entry.score,
                count: existing.count + 1
            });
        });

        // Convert to trend points
        const trendPoints: IComprehensionTrendPoint[] = [];
        weeklyData.forEach((data, weekKey) => {
            trendPoints.push({
                timestamp: weekKey * TeamMetricsService.DAYS_IN_WEEK * TeamMetricsService.MS_PER_DAY,
                average: data.sum / data.count,
                count: data.count
            });
        });

        // Sort by timestamp
        return trendPoints.sort((a, b) => a.timestamp - b.timestamp);
    }

    /**
     * Calculate quality impact as composite of acceptance rate and reasoning view frequency
     * Score is 0-100, where:
     * - 70% weight: Suggestion acceptance rate
     * - 30% weight: Reasoning view usage (indicates thoughtful engagement)
     */
    async calculateQualityImpact(): Promise<number> {
        const acceptanceRate = await this.metricsService.getAcceptanceRate();

        // Get reasoning view count from metrics
        const metrics = await this.metricsService.getMetrics();
        const reasoningViewCount = this.context.globalState.get<number>('metrics.reasoning.views', 0);
        const totalSessions = metrics.totalSessions || 1;

        // Reasoning score: 1 view per session = 30 points
        const reasoningScore = Math.min(30, (reasoningViewCount / totalSessions) * 30);

        // Acceptance rate contributes 70%
        const acceptanceScore = (acceptanceRate / 100) * 70;

        return Math.round(acceptanceScore + reasoningScore);
    }

    /**
     * Track a Team Mode session duration
     */
    async trackTeamModeSession(duration: number): Promise<void> {
        const current = this.context.globalState.get<ITeamModeUsage>(
            TeamMetricsService.STORAGE_KEY_TEAM_MODE,
            {
                sessionCount: 0,
                totalDuration: 0,
                averageDuration: 0
            }
        );

        const updated: ITeamModeUsage = {
            sessionCount: current.sessionCount + 1,
            totalDuration: current.totalDuration + duration,
            averageDuration: 0, // Will be calculated
            lastUsed: Date.now()
        };

        updated.averageDuration = updated.totalDuration / updated.sessionCount;

        await this.context.globalState.update(TeamMetricsService.STORAGE_KEY_TEAM_MODE, updated);
    }

    /**
     * Get comprehensive team metrics
     */
    async getTeamMetrics(): Promise<ITeamMetrics> {
        const metrics = await this.metricsService.getMetrics();
        const teamModeUsage = this.context.globalState.get<ITeamModeUsage>(
            TeamMetricsService.STORAGE_KEY_TEAM_MODE,
            {
                sessionCount: 0,
                totalDuration: 0,
                averageDuration: 0
            }
        );

        // Get first session date from globalState or estimate from dailyStats
        let firstSessionDate = this.context.globalState.get<number>('metrics.firstSessionDate');
        if (!firstSessionDate) {
            // Estimate from dailyStats if available
            const dates = Object.keys(metrics.dailyStats);
            if (dates.length > 0) {
                const earliestDate = dates.sort()[0];
                firstSessionDate = new Date(earliestDate).getTime();
            } else {
                firstSessionDate = Date.now();
            }
            // Store for future use
            await this.context.globalState.update('metrics.firstSessionDate', firstSessionDate);
        }

        // Calculate sessions per week
        const daysSinceFirst = Math.max(1, (Date.now() - firstSessionDate) / TeamMetricsService.MS_PER_DAY);
        const weeksActive = Math.max(1, daysSinceFirst / TeamMetricsService.DAYS_IN_WEEK);
        const sessionsPerWeek = metrics.totalSessions / weeksActive;

        // Calculate mode distribution
        const modeBreakdown = await this.metricsService.getDimensionalBreakdown('mode');
        const totalModeUsage = Object.values(modeBreakdown).reduce((sum, data) => sum + data.accepted + data.rejected, 0);
        const modeDistribution: { [mode: string]: number } = {};

        Object.entries(modeBreakdown).forEach(([mode, data]) => {
            const usage = data.accepted + data.rejected;
            modeDistribution[mode] = totalModeUsage > 0 ? (usage / totalModeUsage) * 100 : 0;
        });

        return {
            adoptionScore: await this.calculateAdoptionScore(),
            comprehensionTrend: await this.calculateComprehensionTrend(),
            qualityImpact: await this.calculateQualityImpact(),
            teamModeUsage,
            usageFrequency: {
                sessionsPerWeek,
                totalSessions: metrics.totalSessions
            },
            modeDistribution
        };
    }
}
