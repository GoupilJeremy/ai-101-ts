import { DevelopmentPhase } from '../../state/types.js';

/**
 * Builds phase-specific instructions for agent prompts.
 */
export class PhasePromptBuilder {
    /**
     * Generates a prompt snippet based on the current development phase.
     */
    public static buildSystemPrompt(phase: DevelopmentPhase): string {
        switch (phase) {
            case 'debug':
                return `
[DEBUG PHASE ACTIVE]
Prioritize diagnostic capabilities and runtime visibility:
- Include comprehensive logging (debug/trace levels).
- Implement robust error catching with detailed context.
- Add diagnostic output or internal state inspection mechanisms.
- Focus on helping the developer understand execution flow and state transitions.`;

            case 'production':
                return `
[PRODUCTION PHASE ACTIVE]
Prioritize enterprise-grade reliability, security, and maintainability:
- Enforce strict typing and exhaustive error handling for all edge cases.
- Focus on performance optimizations and resource efficiency.
- Follow security best practices (input validation, least privilege, data protection).
- Include comprehensive TSDoc/JSDoc documentation and clear code comments.`;

            case 'prototype':
                return `
[PROTOTYPE PHASE ACTIVE]
Prioritize development velocity and rapid functional validation:
- Focus on speed, conciseness, and "happy path" implementation.
- Use scaffolding and common industry boilerplates where appropriate.
- Prefer simple, readable solutions over complex, highly-optimized ones.
- Prioritize getting core logic working quickly to enable testing and feedback.`;

            default:
                return '';
        }
    }
}
