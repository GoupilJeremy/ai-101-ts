
import { AlertSeverity } from '../../shared/agent.interface';
import { IReviewerResult, ISecurityIssue } from '../reviewer.interface';

describe('Security Data Structures', () => {
    it('should support ISecurityIssue structure', () => {
        const issue: ISecurityIssue = {
            id: 'sec-1',
            type: 'sql_injection',
            description: 'Unsanitized query detected',
            severity: 'critical' as AlertSeverity,
            exploitScenario: 'Attacker drops table',
            secureFix: 'Use parameterized queries',
            lineAnchor: 10
        };

        expect(issue).toBeDefined();
        expect(issue.type).toBe('sql_injection');
        expect(issue.severity).toBe('critical');
    });

    it('should include securityIssues in IReviewerResult', () => {
        const result: IReviewerResult = {
            status: 'FAIL',
            risks: 'Security risks detected',
            recommendations: 'Fix vulnerabilities',
            edgeCases: [],
            securityIssues: [
                {
                    id: 'sec-1',
                    type: 'xss',
                    description: 'XSS vulnerability',
                    severity: 'urgent' as AlertSeverity,
                    exploitScenario: 'Script injection',
                    secureFix: 'Escape output',
                    lineAnchor: 20
                }
            ]
        };

        expect(result.securityIssues).toBeDefined();
        expect(result.securityIssues!.length).toBe(1);
        expect(result.securityIssues![0].type).toBe('xss');
    });
});
