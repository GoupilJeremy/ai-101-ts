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
 * Represents a security vulnerability identified during code review.
 */
export interface ISecurityIssue {
    id: string;
    type: 'sql_injection' | 'xss' | 'command_injection' | 'hardcoded_secret' | 'insecure_cryptography' | 'csrf' | 'auth_bypass';
    description: string;
    severity: AlertSeverity;
    exploitScenario: string;
    secureFix: string;
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
    securityIssues: ISecurityIssue[];
}
