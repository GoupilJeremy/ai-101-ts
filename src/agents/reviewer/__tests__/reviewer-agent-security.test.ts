
import * as assert from 'assert';
import { ReviewerAgent } from '../reviewer-agent';
import { ExtensionStateManager } from '../../../state/extension-state-manager';
import { IReviewerResult } from '../reviewer.interface';

// Helper to mock LLM Manager
class MockSecurityLLMManager {
    public lastPrompt: string = '';

    public async callLLM(agent: string, prompt: string) {
        this.lastPrompt = prompt;

        if (prompt.includes('safe code')) {
            const result: IReviewerResult = {
                status: 'PASS',
                risks: '',
                recommendations: '',
                edgeCases: [],
                securityIssues: []
            };
            return {
                text: JSON.stringify(result),
                tokens: { prompt: 10, completion: 10, total: 20 },
                model: 'test', finishReason: 'stop', cost: 0.01
            };
        }

        // Return JSON with security issues
        const result: IReviewerResult = {
            status: 'FAIL',
            risks: 'Security Vulnerability Found',
            recommendations: 'Fix SQL Injection',
            edgeCases: [],
            securityIssues: [
                {
                    id: 'sec-1',
                    type: 'sql_injection',
                    description: 'Unsanitized query detected',
                    severity: 'critical',
                    exploitScenario: 'Drop table',
                    secureFix: 'Use params',
                    lineAnchor: 5
                }
            ]
        };

        return {
            text: JSON.stringify(result),
            tokens: { prompt: 10, completion: 10, total: 20 },
            model: 'test', finishReason: 'stop', cost: 0.01
        };
    }
}

describe('ReviewerAgent Security Tests', () => {
    let agent: ReviewerAgent;
    let mockLLM: MockSecurityLLMManager;
    let stateManager: ExtensionStateManager;

    beforeEach(() => {
        agent = new ReviewerAgent();
        mockLLM = new MockSecurityLLMManager();
        agent.initialize(mockLLM as any);
        stateManager = ExtensionStateManager.getInstance();
    });

    it('should include Security analysis instructions in system prompt', async () => {
        await agent.execute({ prompt: 'some code' });

        assert.ok(mockLLM.lastPrompt.includes('SECURITY ANALYSIS'), 'Prompt should include Security Analysis section');
        assert.ok(mockLLM.lastPrompt.includes('SQL Injection'), 'Prompt should mention SQL Injection');
        assert.ok(mockLLM.lastPrompt.includes('securityIssues'), 'Prompt should request securityIssues in JSON');
    });

    it('should parse security issues from LLM response', async () => {
        const response = await agent.execute({ prompt: 'vulnerable code' });

        assert.equal(response.data.securityIssues.length, 1);
        assert.equal(response.data.securityIssues[0].type, 'sql_injection');
    });

    it('should create alerts for security issues', async () => {
        const initialAlertCount = stateManager.getAlerts().length;
        await agent.execute({ prompt: 'vulnerable code' });
        const alerts = stateManager.getAlerts();

        assert.ok(alerts.length > initialAlertCount);
        const securityAlert = alerts.find(a => a.message.includes('sql_injection'));
        assert.ok(securityAlert, 'Should produce an alert for SQL Injection');
        assert.equal(securityAlert?.severity, 'critical');
    });

    it('should not detect security issues in safe code', async () => {
        const response = await agent.execute({ prompt: 'safe code' });
        assert.equal(response.data.securityIssues.length, 0);
        assert.equal(response.data.status, 'PASS');

        // Ensure no NEW security alerts
        // (Note: previous tests might have added alerts, so cannot check for empty, but check for NEW ones if we could)
        // But since mocked LLM returns NO risks for 'safe code', we expect NO alerts triggered in THIS execution.

        // We can check if top-level status is success
        assert.strictEqual(agent.getState().status, 'success');
    });
});
