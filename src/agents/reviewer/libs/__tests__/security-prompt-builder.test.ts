
import { SecurityPromptBuilder } from '../security-prompt-builder';

describe('SecurityPromptBuilder', () => {
    it('should generate security analysis prompt', () => {
        const prompt = SecurityPromptBuilder.buildSystemPrompt();

        expect(prompt).toContain('### SECURITY ANALYSIS');
        expect(prompt).toContain('OWASP Top 10');
        expect(prompt).toContain('SQL Injection');
        expect(prompt).toContain('XSS (Cross-Site Scripting)');
        expect(prompt).toContain('Command Injection');
        expect(prompt).toContain('Hardcoded Secrets');

        expect(prompt).toContain('securityIssues'); // JSON structure check
        expect(prompt).toContain('"type": "sql_injection"');
    });

    it('should include secure vs vulnerable examples', () => {
        const prompt = SecurityPromptBuilder.buildSystemPrompt();
        expect(prompt).toContain('Vulnerable Example:');
        expect(prompt).toContain('Secure Fix:');
    });
});
