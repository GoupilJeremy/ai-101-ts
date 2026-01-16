export interface IProjectArchitecture {
    techStack: {
        frontend?: 'react' | 'vue' | 'angular' | 'vanilla' | 'svelte' | 'unknown';
        backend?: 'express' | 'nest' | 'fastify' | 'none' | 'unknown';
        build?: 'esbuild' | 'webpack' | 'vite' | 'rollup' | 'unknown';
        testing?: 'jest' | 'mocha' | 'vitest' | 'none' | 'unknown';
    };
    patterns: {
        stateManagement?: string[]; // e.g., ['redux', 'context']
        apiStyle?: string[]; // e.g., ['rest', 'graphql']
    };
    conventions: {
        naming: 'camelCase' | 'kebab-case' | 'snake_case' | 'mixed';
        testLocation: 'co-located' | 'separate-folder';
    };
    timestamp: number;
}
