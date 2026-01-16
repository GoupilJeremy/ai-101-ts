import * as assert from 'assert';
import { ProjectPatternDetector } from '../project-pattern-detector.js';

describe('ProjectPatternDetector Test Suite', () => {
    let detector: ProjectPatternDetector;

    beforeEach(() => {
        detector = new ProjectPatternDetector();
    });

    it('Should detect React and Redux from package.json', () => {
        const packageJson = {
            dependencies: {
                'react': '^18.0.0',
                'redux': '^4.0.0'
            },
            devDependencies: {
                'jest': '^29.0.0'
            }
        };

        const result = detector.detectTechStack(packageJson);
        assert.strictEqual(result.techStack.frontend, 'react');
        assert.strictEqual(result.techStack.testing, 'jest');
        assert.ok(result.patterns.stateManagement?.includes('redux'));
    });

    it('Should detect Vue and Pinia', () => {
        const packageJson = {
            dependencies: {
                'vue': '^3.0.0',
                'pinia': '^2.0.0'
            }
        };

        const result = detector.detectTechStack(packageJson);
        assert.strictEqual(result.techStack.frontend, 'vue');
    });

    it('Should detect Mocha as testing framework', () => {
        const packageJson = {
            devDependencies: {
                'mocha': '^10.0.0'
            }
        };

        const result = detector.detectTechStack(packageJson);
        assert.strictEqual(result.techStack.testing, 'mocha');
    });

    it('Should detect NestJS and GraphQL', () => {
        const packageJson = {
            dependencies: {
                '@nestjs/core': '^10.0.0',
                'graphql': '^16.0.0'
            }
        };

        const result = detector.detectTechStack(packageJson);
        assert.strictEqual(result.techStack.backend, 'nest');
        assert.ok(result.patterns.apiStyle?.includes('graphql'));
    });
});
