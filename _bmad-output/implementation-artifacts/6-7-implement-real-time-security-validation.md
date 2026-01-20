# Story 6.7: Implement Real-Time Security Validation

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want code suggestions validated for security vulnerabilities automatically,
so that I don't inadvertently introduce exploitable code.

## Acceptance Criteria

1. **Given** Reviewer Agent is implemented
   **When** Reviewer validates code suggestion
   **Then** Reviewer scans for SQL injection vulnerabilities (unsanitized queries)
2. **And** Reviewer detects XSS risks (unescaped user input in HTML/DOM)
3. **And** Reviewer identifies command injection risks (shell execution with user input)
4. **And** Reviewer finds hardcoded secrets (API keys, passwords, tokens in code)
5. **And** Reviewer checks for insecure cryptography (weak algorithms, hardcoded keys)
6. **And** Reviewer detects CSRF vulnerabilities (missing token validation)
7. **And** Reviewer identifies authentication/authorization bypasses
8. **And** Security issues presented as critical or urgent alerts (highest severity)
9. **And** Each security alert includes: vulnerability type, exploit scenario, secure alternative
10. **And** Security validation uses OWASP Top 10 as baseline reference
11. **And** Unit tests verify security vulnerability detection with vulnerable code samples

## Tasks / Subtasks

- [x] 1. Define Security Data Structures
    - [x] 1.1 Create `ISecurityIssue` interface (type, description, severity, exploitScenario, secureFix, lineAnchor)
    - [x] 1.2 Update `IReviewerResult` interface to include `securityIssues: ISecurityIssue[]`
- [x] 2. Create `SecurityPromptBuilder` (src/agents/reviewer/libs/)
    - [x] 2.1 Implement prompt sections for specific vulnerability categories:
        - SQL Injection
        - XSS (Cross-Site Scripting)
        - Command Injection
        - Hardcoded Secrets
        - Insecure Cryptography
        - CSRF & Auth Weaknesses
    - [x] 2.2 Create vulnerable vs secure code examples for few-shot prompting
- [x] 3. Enhance `ReviewerAgent` Logic
    - [x] 3.1 Integrate `SecurityPromptBuilder` into validation workflow
    - [x] 3.2 Implement logic to map security issues to `IAlert` with `CRITICAL` or `URGENT` severity
    - [x] 3.3 Ensure security validation runs in parallel or sequence with edge case detection
- [x] 4. Unit Tests
    - [x] 4.1 Test `SecurityPromptBuilder` produces correct prompts with OWASP context
    - [x] 4.2 Test `ReviewerAgent` correctly parses security issues from LLM response
    - [x] 4.3 Test that simple/safe code produces NO security alerts (false positive check)

## Dev Notes

### Architecture Patterns

- **Pattern Reuse:** Follow the `PromptBuilder` pattern established in Story 6.6 (`EdgeCasePromptBuilder`). Create `SecurityPromptBuilder` in the same directory.
- **Alert Severity:** Unlike edge cases (Warning), security issues must map to **Critical** or **Urgent** alert levels to demand immediate attention.
- **Validation Scope:** The LLM prompt should explicitly reference "OWASP Top 10" principles to ground the AI's analysis.

### Project Structure Notes

- **File Location:** `src/agents/reviewer/libs/security-prompt-builder.ts`
- **Interfaces:** Update `src/agents/reviewer/reviewer.interface.ts`
- **Tests:** `src/agents/reviewer/libs/__tests__/security-prompt-builder.test.ts`

### References

- **OWASP Top 10:** Use as the standard baseline for detection categories.
- **Previous Implementation:** `src/agents/reviewer/libs/edge-case-prompt-builder.ts` (Copy structure, change content)
- **Architecture:** `_bmad-output/planning-artifacts/architecture.md` (Security NFRs)

## Dev Agent Record

### Agent Model Used

Antigravity 1.0

### Debug Log References

- Verified `SecurityPromptBuilder` output format with unit tests.
- Verified `ReviewerAgent` integration using `MockSecurityLLMManager`.
- Fixed `reviewer-agent.ts` class declaration restoration issue.
- Confirmed Security Alerts are generated with CRITICAL severity.

### Completion Notes List

- Implemented `ISecurityIssue` interface.
- Created `SecurityPromptBuilder` with OWASP Top 10 categories (SQLi, XSS, etc.).
- Refactored `EdgeCasePromptBuilder` and `SecurityPromptBuilder` to expose `getCriteria` and `getJsonFormat` for better composition.
- Updated `ReviewerAgent` to combine both analysis prompts and output a unified JSON result ensuring strict valid JSON.
- Added public `getAlerts()` to `ExtensionStateManager` for testing.
- Comprehensive tests in `reviewer-agent-security.test.ts`.

### File List

- src/agents/reviewer/libs/security-prompt-builder.ts
- src/agents/reviewer/reviewer.interface.ts
- src/agents/reviewer/reviewer-agent.ts
- src/agents/reviewer/libs/edge-case-prompt-builder.ts (Refactored)
- src/state/extension-state-manager.ts (Updated)
- src/agents/reviewer/libs/__tests__/security-prompt-builder.test.ts
- src/agents/reviewer/__tests__/reviewer-agent-security.test.ts
