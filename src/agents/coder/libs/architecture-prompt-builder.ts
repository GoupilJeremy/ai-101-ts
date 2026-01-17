
import { IProjectArchitecture } from '../../architect/interfaces/project-architecture.interface.js';

/**
 * Helper class to construct prompt sections based on project architecture.
 */
export class ArchitecturePromptBuilder {
    /**
     * Builds a formatted system prompt section based on the project architecture.
     */
    public static buildSystemPrompt(architecture: IProjectArchitecture): string {
        const lines: string[] = ['[PROJECT ARCHITECTURE & PATTERNS]'];

        // Tech Stack
        const { techStack } = architecture;
        if (techStack) {
            if (techStack.frontend && techStack.frontend !== 'unknown') lines.push(`- Frontend: ${techStack.frontend}`);
            if (techStack.backend && techStack.backend !== 'unknown') lines.push(`- Backend: ${techStack.backend}`);
            if (techStack.build && techStack.build !== 'unknown') lines.push(`- Build: ${techStack.build}`);
            if (techStack.testing && techStack.testing !== 'unknown') lines.push(`- Testing: ${techStack.testing}`);
        }

        // Patterns
        const { patterns } = architecture;
        if (patterns) {
            if (patterns.stateManagement && patterns.stateManagement.length > 0) {
                lines.push(`- State Management: ${patterns.stateManagement.join(', ')}`);
            }
            if (patterns.apiStyle && patterns.apiStyle.length > 0) {
                lines.push(`- API Style: ${patterns.apiStyle.join(', ')}`);
            }
        }

        // Conventions
        const { conventions } = architecture;
        if (conventions) {
            if (conventions.naming) lines.push(`- Naming Convention: ${conventions.naming}`);
            if (conventions.testLocation) lines.push(`- Test Location: ${conventions.testLocation}`);
        }

        lines.push('');
        lines.push('CRITICAL INSTRUCTION: All generated code MUST strictly follow the above patterns and conventions.');

        return lines.join('\n');
    }
}
