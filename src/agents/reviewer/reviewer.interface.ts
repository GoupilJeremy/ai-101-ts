import { AlertSeverity } from '../shared/agent.interface';

/**
 * Represents a specific edge case identified during code review.
 */
export interface IEdgeCase {
    id: string;
    type: 'null_undefined' | 'async_error' | 'boundary' | 'input_validation' | 'race_condition' | 'ui_state' | 'i18n';
    description: string;
    example: string;
    fix: string;
    severity: AlertSeverity;
    lineAnchor?: number;
}

/**
 * Structured result from the Reviewer Agent.
 */
export interface IReviewerResult {
    status: 'PASS' | 'FAIL';
    risks: string;
    recommendations: string;
    edgeCases: IEdgeCase[];
}
