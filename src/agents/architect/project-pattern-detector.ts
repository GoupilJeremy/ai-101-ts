import { IProjectArchitecture } from './interfaces/project-architecture.interface.js';

export class ProjectPatternDetector {
    public detectTechStack(packageJson: any): IProjectArchitecture {
        const techStack: IProjectArchitecture['techStack'] = {
            frontend: 'unknown',
            backend: 'none',
            build: 'unknown',
            testing: 'none'
        };

        const patterns: IProjectArchitecture['patterns'] = {
            stateManagement: [],
            apiStyle: []
        };

        const deps = { ...(packageJson.dependencies || {}), ...(packageJson.devDependencies || {}) };

        // Frontend
        if (deps['react']) {techStack.frontend = 'react';}
        else if (deps['vue']) {techStack.frontend = 'vue';}
        else if (deps['@angular/core']) {techStack.frontend = 'angular';}
        else if (deps['svelte']) {techStack.frontend = 'svelte';}

        // Backend
        if (deps['express']) {techStack.backend = 'express';}
        else if (deps['@nestjs/core']) {techStack.backend = 'nest';}
        else if (deps['fastify']) {techStack.backend = 'fastify';}

        // Build tools
        if (deps['vite']) {techStack.build = 'vite';}
        else if (deps['webpack']) {techStack.build = 'webpack';}
        else if (deps['esbuild']) {techStack.build = 'esbuild';}
        else if (deps['rollup']) {techStack.build = 'rollup';}

        // Testing
        if (deps['jest']) {techStack.testing = 'jest';}
        else if (deps['mocha']) {techStack.testing = 'mocha';}
        else if (deps['vitest']) {techStack.testing = 'vitest';}

        // State Management
        if (deps['redux'] || deps['@reduxjs/toolkit']) {patterns.stateManagement?.push('redux');}
        if (deps['mobx']) {patterns.stateManagement?.push('mobx');}
        if (deps['recoil']) {patterns.stateManagement?.push('recoil');}
        if (deps['zustand']) {patterns.stateManagement?.push('zustand');}

        // API Style
        if (deps['graphql'] || deps['@apollo/client']) {patterns.apiStyle?.push('graphql');}
        if (deps['@trpc/server']) {patterns.apiStyle?.push('trpc');}

        if ((deps['axios'] || deps['node-fetch']) && patterns.apiStyle?.length === 0) {
            patterns.apiStyle?.push('rest');
        }

        return {
            techStack,
            patterns,
            conventions: {
                naming: 'camelCase',
                testLocation: 'co-located'
            },
            timestamp: Date.now()
        };
    }

    public async detectFileStructure(rootPath: string): Promise<Partial<IProjectArchitecture['conventions']>> {
        // Placeholder for now, will be implemented in Step 3/4 if needed
        return {
            naming: 'camelCase',
            testLocation: 'co-located'
        };
    }
}
