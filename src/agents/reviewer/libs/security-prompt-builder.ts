
export class SecurityPromptBuilder {
    static getCriteria(): string {
        return `
### SECURITY ANALYSIS (OWASP Top 10)

As the Reviewer Agent, you must rigorously analyze the code for security vulnerabilities, using the **OWASP Top 10** as a baseline.
Identify any issues that could lead to exploitation.

Target Categories:

1. **SQL Injection**
   - Unsanitized database queries
   - String concatenation in SQL statements
   - Vulnerable Example: \`query("SELECT * FROM users WHERE name = '" + name + "'");\`
   - Secure Fix: Use parameterized queries: \`query("SELECT * FROM users WHERE name = ?", name);\`

2. **XSS (Cross-Site Scripting)**
   - Unescaped user input rendered in HTML/DOM
   - Dangerous APIs (innerHTML, dangerouslySetInnerHTML) without sanitization
   - Vulnerable Example: \`div.innerHTML = userComment;\`
   - Secure Fix: Use \`textContent\` or sanitization libraries (e.g., DOMPurify)

3. **Command Injection**
   - User input executed as shell commands
   - Vulnerable Example: \`exec("ping " + host);\`
   - Secure Fix: Validate input against allowlist or use APIs that don't invoke shell

4. **Hardcoded Secrets**
   - API Keys, passwords, tokens, or private keys directly in code
   - Vulnerable Example: \`const apiKey = "sk-12345...";\`
   - Secure Fix: Use environment variables or Secret Storage

5. **Insecure Cryptography**
   - Weak algorithms (MD5, SHA1, DES)
   - Hardcoded cryptographic keys
   - Weak random number generation (Math.random for security)
   - Secure Fix: Use crypto standard libraries, strong algorithms (AES-256, Argon2)

6. **CSRF & Auth Weaknesses**
   - Missing CSRF tokens on state-changing requests
   - Missing authentication/authorization checks on sensitive endpoints
   - Insecure session management

7. **Auth Bypass**
   - Logic flaws allowing privilege escalation`;
    }

    static getJsonFormat(): string {
        return `
{
  "status": "PASS" | "FAIL",
  "risks": "Summary string...",
  "recommendations": "Summary string...",
  "securityIssues": [
    {
      "id": "sec-1",
      "type": "sql_injection" | "xss" | "command_injection" | "hardcoded_secret" | "insecure_cryptography" | "csrf" | "auth_bypass",
      "description": "Description of the vulnerability...",
      "exploitScenario": "How an attacker could exploit this...",
      "secureFix": "Recommended secure implementation...",
      "severity": "critical" | "urgent",
      "lineAnchor": 0
    }
  ]
}`;
    }

    static buildSystemPrompt(userPrompt: string = ''): string {
        return `${this.getCriteria()}

### JSON OUTPUT FORMAT

You must output the results in a strict JSON format embedded within your response.
Include specific instances of security issues found.

Expected JSON Structure:
\`\`\`json
${this.getJsonFormat()}
\`\`\`

If no security issues are found, return an empty "securityIssues" array.
`;
    }
}
