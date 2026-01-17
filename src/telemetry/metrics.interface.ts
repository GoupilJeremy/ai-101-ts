export interface IDailyMetrics {
    suggestionsRequested: number;
    suggestionsAccepted: number;
    suggestionsRejected: number;
    linesAccepted: number;
    timeSavedMs: number;
}

export interface IUsageMetrics {
    totalSessions: number;
    totalSessionDurationMs: number;
    suggestionsRequested: number;
    suggestionsAccepted: number;
    suggestionsRejected: number;
    linesAccepted: number;
    timeSavedMs: number;
    lastUpdated: number;
    dailyStats: { [date: string]: IDailyMetrics };
}

export const DEFAULT_METRICS: IUsageMetrics = {
    totalSessions: 0,
    totalSessionDurationMs: 0,
    suggestionsRequested: 0,
    suggestionsAccepted: 0,
    suggestionsRejected: 0,
    linesAccepted: 0,
    timeSavedMs: 0,
    lastUpdated: Date.now(),
    dailyStats: {}
};
