
import { describe, it, expect } from 'vitest';
import { ArchitecturePromptBuilder } from '../architecture-prompt-builder.js';
import { IProjectArchitecture } from '../../../architect/interfaces/project-architecture.interface.js';

describe('ArchitecturePromptBuilder', () => {
    const mockArchitecture: IProjectArchitecture = {
        techStack: {
            frontend: 'vanilla',
            backend: 'none',
            build: 'esbuild',
            testing: 'mocha'
        },
        patterns: {
            stateManagement: ['singleton'],
            apiStyle: ['rest']
        },
        conventions: {
            naming: 'kebab-case',
            testLocation: 'co-located'
        },
        timestamp: 1234567890
    };

    it('should generate a formatted system prompt section from architecture', () => {
        const prompt = ArchitecturePromptBuilder.buildSystemPrompt(mockArchitecture);
        expect(prompt).toContain('PROJECT ARCHITECTURE & PATTERNS');
        expect(prompt).toContain('Frontend: vanilla');
        expect(prompt).toContain('Build: esbuild');
        expect(prompt).toContain('State Management: singleton');
        expect(prompt).toContain('Naming Convention: kebab-case');
    });

    it('should handle missing fields gracefully', () => {
        const partialArch: IProjectArchitecture = {
            techStack: {},
            patterns: {},
            conventions: { naming: 'mixed', testLocation: 'separate-folder' },
            timestamp: 0
        };
        const prompt = ArchitecturePromptBuilder.buildSystemPrompt(partialArch);
        expect(prompt).toContain('PROJECT ARCHITECTURE & PATTERNS');
        expect(prompt).not.toContain('undefined');
        expect(prompt).not.toContain('null');
    });
});
