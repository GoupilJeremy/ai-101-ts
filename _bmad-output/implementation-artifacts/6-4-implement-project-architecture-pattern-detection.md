# Story 6.4: Implement Project Architecture Pattern Detection

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want the Architect Agent to analyze my project and identify architectural patterns,
so that AI suggestions align with existing codebase conventions.

## Acceptance Criteria

1. **Given** Architect Agent is implemented (Story 3.4)
2. **When** Architect analyzes project for first time (or on command)
3. **Then** Architect detects component structure patterns (React, Vue, Angular conventions)
4. **And** Architect identifies state management approach (Redux, MobX, Context API, etc.)
5. **And** Architect recognizes API conventions (REST, GraphQL, tRPC)
6. **And** Architect detects testing framework and patterns (Jest, Mocha, test structure)
7. **And** Architect identifies build tools and configuration (webpack, vite, esbuild)
8. **And** Architect recognizes code style conventions (naming, file organization, module patterns)
9. **And** Architecture analysis results cached for current workspace session
10. **And** Architecture summary accessible via command: "Suika: View Detected Architecture"
11. **And** User can override detected patterns via settings if detection incorrect
12. **And** Architecture analysis completes in <5 seconds for typical projects
13. **And** Unit tests verify pattern detection accuracy with sample projects

## Tasks / Subtasks

- [x] 1. Define `IProjectArchitecture` and pattern interfaces (AC: 3, 4, 5, 6, 7, 8)
- [x] 2. Create `ProjectPatternDetector` service in `src/agents/architect/libs/`
    - [x] 2.1 Implement `detectTechStack(packageJson)`
    - [x] 2.2 Implement `detectFileStructure(rootPath)`
    - [x] 2.3 Implement heuristic matchers for state/API/testing
- [x] 3. Enhance `ArchitectAgent` with `analyzeProject` method
    - [x] 3.1 Orchestrate detection steps
    - [x] 3.2 Implement results caching
- [x] 4. Implement "Suika: View Detected Architecture" command
    - [x] 4.1 Register command
    - [x] 4.2 Display formatted output channel or notification
- [x] 5. Implement user override settings
    - [x] 5.1 Add configuration contributes to `package.json` (`suika.architecture.overrides`)
    - [x] 5.2 Merge detected vs overridden patterns
- [x] 6. Add Unit Tests
    - [x] 6.1 Mock file system and package.json inputs
    - [x] 6.2 Verify detection logic for known stacks (React, Vue, etc.)
    - [x] 6.3 Verify caching behavior

## Dev Context

### Technical Requirements

- **File System Access:** Use `vscode.workspace.findFiles` for efficient file discovery.
- **Parsing:** Use standard `JSON.parse` for `package.json` and `tsconfig.json`.
- **Performance:**
  - Avoid scanning `node_modules`.
  - Use `maxResults` and `exclude` pattern `**​/node_modules/**` when searching.
  - Implement caching mechanism (invalidate on project config file changes).
- **Configuration:** Use `vscode.workspace.getConfiguration` for overrides.

### Architecture Compliance

- **Pattern:** `ArchitectAgent` should delegate analysis to a dedicated helper/service (`ProjectPatternDetector`) to adhere to SRP.
- **Agent Responsibility:** `ArchitectAgent` holds the *state* of the architecture, but the *detection* logic resides in the helper.
- **Interface Definition:**
  ```typescript
  interface IProjectArchitecture {
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
  ```

### Library/Framework Requirements

- **VSCode API:** `vscode.workspace` namespace for file finding and configuration.
- **No External Scanners:** Do not introduce heavy dependencies like AST parsers for this initial version (regex/heuristics are sufficient for acceptance criteria).

### File Structure Requirements

- `src/agents/architect/classes/project-pattern-detector.ts` - New service class.
- `src/agents/architect/interfaces/project-architecture.interface.ts` - New interface.
- `src/agents/architect/__tests__/project-pattern-detector.test.ts` - Tests.

### Testing Requirements

- **Unit Tests:**
  - `ProjectPatternDetector`: detailed tests with mock `package.json` contents.
  - Test detection of React vs Vue.
  - Test detection of Mocha vs Jest.
  - Test `ArchitectAgent.analyzeProject` caching mechanism.

## Previous Story Intelligence (Story 6.3)

Story 6.3 focused on `ContextAgent` and UI visualization.
- **Learnings:**
  - State management reliability is key. Ensure `ArchitectAgent` state updates (e.g. `analyzing`) are propogated correctly if we visualize this in the future (though this story is mostly backend).
  - Use `IO/Utils` properly. 6.3 likely refined file reading utilities. Reuse them if available/shared.

## Git Intelligence

Recent work has focused on:
- `src/agents/context/` implementation.
- `src/webview/` enhancements.
**Relevance:**
- Ensure `ArchitectAgent` follows the same folder/export structure as `ContextAgent` (`src/agents/architect/`).
- Use the established `LLMProviderManager` pattern if the Architect needs to consult LLM for ambiguous patterns (though AC emphasizes heuristic detection first).

## Project Context Reference

- **Architecture Decision 1:** Orchestrator Central Pattern. `ArchitectAgent` does not act autonomously; it responds to Orchestrator or User Commands.
- **Naming Conventions:** Use `kebab-case` for files (`project-pattern-detector.ts`).
- **Performance:** "Architecture analysis completes in <5 seconds" is a hard requirement. Avoid deep file content scanning.

## Dev Agent Record (AI)
### Implementation Plan
- Defined `IProjectArchitecture` interface for structured architecture data.
- Created `ProjectPatternDetector` service to handle heuristic detection of tech stack from `package.json`.
- Enhanced `ArchitectAgent` with `analyzeProject` method, integrating the detector and session caching.
- Registered `ArchitectAgent` in `AgentOrchestrator` via `extension.ts`.
- Implemented `suika.viewArchitecture` command to display detected patterns in an output channel.
- Added support for user overrides in `suika.architecture.overrides` settings.

### Completion Notes
- Architecture detection covers Frontend (React, Vue, Angular, Svelte), Backend (Express, NestJS, Fastify), Build tools (Vite, Webpack, esbuild, Rollup), and Testing (Jest, Mocha, Vitest).
- Patterns like Redux, Pinia, GraphQL, and REST are detected via heuristics.
- Unit tests verify detection logic and caching behavior using Vitest mocks.
- Command "View Detected Architecture" successfully outputs to VSCode Output Channel.

## File List
- `src/agents/architect/interfaces/project-architecture.interface.ts` (New)
- `src/agents/architect/project-pattern-detector.ts` (New)
- `src/agents/architect/architect-agent.ts` (Modified)
- `src/agents/architect/__tests__/project-pattern-detector.test.ts` (New)
- `src/agents/architect/__tests__/architect-agent-logic.test.ts` (New)
- `src/extension.ts` (Modified)
- `package.json` (Modified)

## Change Log
- 2026-01-16: Initial implementation of project architecture pattern detection.
- 2026-01-16: Added View Architecture command and settings overrides.

## Story Completion Status

- **Status:** review
- **Validation:** Criteria based on `epics.md` Story 6.4. Completed on 2026-01-16.

