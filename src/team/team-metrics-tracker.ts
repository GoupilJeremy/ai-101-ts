import { AgentType } from '../agents/shared/agent.interface.js';

/**
 * Suggestion metrics per agent for team visibility.
 */
export interface ISuggestionMetrics {
    architect: { accepted: number; rejected: number };
    coder: { accepted: number; rejected: number };
    reviewer: { accepted: number; rejected: number };
    context: { accepted: number; rejected: number };
    totalTimeSaved: number; // Estimated time saved in minutes
}

/**
 * Complexity level for time estimation.
 */
export type SuggestionComplexity = 'simple' | 'medium' | 'complex';

/**
 * Tracks suggestion acceptance/rejection by agent role for Team Mode.
 * Provides metrics for team visibility and comprehension.
 */
export class TeamMetricsTracker {
    private static instance: TeamMetricsTracker;
    private metrics: ISuggestionMetrics = {
        architect: { accepted: 0, rejected: 0 },
        coder: { accepted: 0, rejected: 0 },
        reviewer: { accepted: 0, rejected: 0 },
        context: { accepted: 0, rejected: 0 },
        totalTimeSaved: 0
    };

    private constructor() {
        // Private constructor for singleton
    }

    public static getInstance(): TeamMetricsTracker {
        if (!TeamMetricsTracker.instance) {
            TeamMetricsTracker.instance = new TeamMetricsTracker();
        }
        return TeamMetricsTracker.instance;
    }

    /**
     * Record a suggestion action (accepted or rejected) by agent.
     */
    public recordSuggestionAction(
        agent: AgentType,
        action: 'accepted' | 'rejected',
        complexity: SuggestionComplexity = 'medium'
    ): void {
        this.metrics[agent][action]++;

        // Estimate time saved (only for accepted suggestions)
        if (action === 'accepted') {
            const timeSaved = this.estimateTimeSaved(complexity);
            this.metrics.totalTimeSaved += timeSaved;
        }

        console.log(`TeamMetrics: ${agent} suggestion ${action} (complexity: ${complexity})`);
    }

    /**
     * Estimate time saved based on suggestion complexity.
     * @returns Time saved in minutes
     */
    private estimateTimeSaved(complexity: SuggestionComplexity): number {
        const timeMap: Record<SuggestionComplexity, number> = {
            simple: 5,   // 5 minutes for simple suggestions
            medium: 15,  // 15 minutes for medium suggestions
            complex: 30  // 30 minutes for complex suggestions
        };
        return timeMap[complexity];
    }

    /**
     * Get current suggestion metrics (immutable copy).
     */
    public getMetrics(): ISuggestionMetrics {
        return {
            architect: { ...this.metrics.architect },
            coder: { ...this.metrics.coder },
            reviewer: { ...this.metrics.reviewer },
            context: { ...this.metrics.context },
            totalTimeSaved: this.metrics.totalTimeSaved
        };
    }

    /**
     * Reset all metrics (for new session or testing).
     */
    public resetMetrics(): void {
        this.metrics = {
            architect: { accepted: 0, rejected: 0 },
            coder: { accepted: 0, rejected: 0 },
            reviewer: { accepted: 0, rejected: 0 },
            context: { accepted: 0, rejected: 0 },
            totalTimeSaved: 0
        };
    }

    /**
     * Get acceptance rate for a specific agent.
     * @returns Percentage (0-100)
     */
    public getAcceptanceRate(agent: AgentType): number {
        const agentMetrics = this.metrics[agent];
        const total = agentMetrics.accepted + agentMetrics.rejected;
        if (total === 0) {return 0;}
        return Math.round((agentMetrics.accepted / total) * 100);
    }

    /**
     * Get overall acceptance rate across all agents.
     * @returns Percentage (0-100)
     */
    public getOverallAcceptanceRate(): number {
        let totalAccepted = 0;
        let totalRejected = 0;

        const agents: AgentType[] = ['architect', 'coder', 'reviewer', 'context'];
        agents.forEach(agent => {
            totalAccepted += this.metrics[agent].accepted;
            totalRejected += this.metrics[agent].rejected;
        });

        const total = totalAccepted + totalRejected;
        if (total === 0) {return 0;}
        return Math.round((totalAccepted / total) * 100);
    }

    /**
     * Get formatted metrics summary for display.
     */
    public getMetricsSummary(): string {
        const rate = this.getOverallAcceptanceRate();
        const timeSaved = this.metrics.totalTimeSaved;
        const hours = Math.floor(timeSaved / 60);
        const minutes = timeSaved % 60;

        return `Acceptance: ${rate}% | Time Saved: ${hours}h ${minutes}m`;
    }
}
