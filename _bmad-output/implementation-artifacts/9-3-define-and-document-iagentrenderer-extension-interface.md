# Story 9.3: Define and Document IAgentRenderer Extension Interface

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As an extension developer,
I want a stable IAgentRenderer interface with documentation and examples,
So that I can create custom agent visual representations for specialized workflows.

## Acceptance Criteria

1. **IAgentRenderer interface defined** with core methods: `render(agent, state, container)`, `getSize()`, `animate(transition)`, `destroy()`.
2. **Interface marked as public API** with semver guarantees (following ILLMProvider precedent from Story 9.1).
3. **Documentation includes interface purpose**, method signatures, return types, and error handling.
4. **Documentation includes a complete example** implementation (e.g., custom 3D agent renderer using Three.js or custom SVG renderer).
5. **Example demonstrates** DOM integration, animation coordination, state update handling, and cleanup.
6. **Renderer receives agent state updates** via callback mechanism.
7. **Custom renderers can opt out** of default sumi-e styling.
8. **Performance guidelines documented** (must maintain 60fps, GPU-accelerated patterns).
9. **API documentation auto-generated** via TypeDoc with JSDoc comments.
10. **Unit tests for example renderer** included and passing.
11. **Interface exported** from `src/api/index.ts` barrel file.

## Tasks / Subtasks

- [x] **Task 1: Define IAgentRenderer Interface** (AC: #1, #2)
  - [x] 1.1 Create `src/ui/renderer.interface.ts` with `IAgentRenderer` interface
  - [x] 1.2 Define `render(agent: AgentRenderContext, container: HTMLElement): void` method
  - [x] 1.3 Define `getSize(): { width: number; height: number }` method
  - [x] 1.4 Define `animate(transition: RenderTransition): void` method for GPU-accelerated animations
  - [x] 1.5 Define `destroy(): void` lifecycle method for cleanup
  - [x] 1.6 Define `onStateUpdate(callback: StateUpdateCallback): Disposable` for state subscriptions
  - [x] 1.7 Add comprehensive JSDoc comments with `@public`, `@since`, `@remarks` tags
  - [x] 1.8 Export interface from `src/api/index.ts`

- [x] **Task 2: Define Supporting Types** (AC: #1, #5)
  - [x] 2.1 Create `AgentRenderContext` interface with agent type, state, anchorLine, displayName, icon
  - [x] 2.2 Create `RenderTransition` type for animation transitions (idle→thinking, thinking→working, etc.)
  - [x] 2.3 Create `RenderOptions` interface for customization (optOutDefaultStyling, performanceMode)
  - [x] 2.4 Create `StateUpdateCallback` type signature
  - [x] 2.5 Export all supporting types from `src/api/index.ts`

- [x] **Task 3: Create Documentation** (AC: #3, #7, #8, #9)
  - [x] 3.1 Create `docs/extension-dev/agent-renderers.md` comprehensive guide
  - [x] 3.2 Document interface overview and purpose (custom agent visualization)
  - [x] 3.3 Document each method with parameters, return types, examples
  - [x] 3.4 Document renderer lifecycle: creation, state updates, cleanup
  - [x] 3.5 Document how to opt out of default sumi-e styling
  - [x] 3.6 Document 60fps performance requirements and GPU-accelerated CSS patterns
  - [x] 3.7 Document semantic versioning and deprecation policy (same as ILLMProvider)
  - [x] 3.8 Verify TypeDoc generates API docs correctly

- [x] **Task 4: Create Example Implementation** (AC: #4, #5, #6)
  - [x] 4.1 Create `docs/extension-dev/custom-renderer-example.ts` with complete example
  - [x] 4.2 Implement example using SVG for custom agent visualization
  - [x] 4.3 Demonstrate DOM integration (create elements, append to container)
  - [x] 4.4 Demonstrate animation coordination (CSS transforms, requestAnimationFrame)
  - [x] 4.4 Demonstrate state update subscription and handling
  - [x] 4.5 Demonstrate proper cleanup in destroy() method
  - [x] 4.6 Add inline comments explaining each pattern

- [x] **Task 5: Write Tests** (AC: #10)
  - [x] 5.1 Create `src/ui/__tests__/renderer.interface.test.ts` for interface contract tests
  - [x] 5.2 Create `docs/extension-dev/__tests__/custom-renderer-example.test.ts` for example tests
  - [x] 5.3 Test render() creates proper DOM elements
  - [x] 5.4 Test getSize() returns valid dimensions
  - [x] 5.5 Test animate() applies correct CSS classes/transforms
  - [x] 5.6 Test destroy() cleans up resources
  - [x] 5.7 Test onStateUpdate() callback invocation

## Dev Notes

### Technical Requirements

- **Interface Location**: `src/ui/renderer.interface.ts` (consistent with agent-related UI code in webview)
- **Export Pattern**: Follow existing barrel export pattern in `src/api/index.ts` (Story 9.2 precedent)
- **Naming Convention**: Use "I" prefix for public interfaces per architecture naming conventions
- **JSDoc Style**: Match the comprehensive documentation style established in Story 9.1 for `ILLMProvider`

### Architecture Compliance

- **Layering**: The renderer interface belongs in the UI layer (`src/ui/` or `src/webview/`)
- **Public API Surface**: Export through `src/api/index.ts` for consumer access
- **Semver Guarantees**: Interface is part of public API with breaking change = major version bump
- **Decoupling**: Renderers must not directly access internal agent state; use callbacks

### Library / Framework Requirements

- **No New Dependencies**: Interface definition requires no new dependencies
- **Example May Use Three.js**: Documentation example can reference Three.js but should also show simpler SVG example
- **GPU-Accelerated CSS**: Examples must demonstrate `transform: translate3d()`, `will-change: transform` patterns

### File Structure Requirements

```
src/
  ui/
    renderer.interface.ts          # NEW: IAgentRenderer interface + supporting types
    __tests__/
      renderer.interface.test.ts   # NEW: Interface contract tests
  api/
    index.ts                       # MODIFY: Add IAgentRenderer exports
docs/
  extension-dev/
    agent-renderers.md             # NEW: Comprehensive guide
    custom-renderer-example.ts     # NEW: Complete example implementation
    __tests__/
      custom-renderer-example.test.ts  # NEW: Example tests
```

### Testing Requirements

- **Interface Contract Tests**: Verify that example implementation satisfies all interface methods
- **DOM Manipulation Tests**: Use jsdom or similar for testing render() DOM creation
- **Animation Tests**: Verify CSS classes applied correctly during transitions
- **Cleanup Tests**: Verify destroy() removes elements and cancels animations
- **Coverage Target**: >70% for new code

### Project Structure Notes

- Interface follows existing `IAgent` pattern from `src/agents/shared/agent.interface.ts`
- Export pattern follows `ILLMProvider` from `src/llm/provider.interface.ts`
- Documentation follows established style in `docs/extension-dev/llm-providers.md`

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-9.3] - Story requirements and acceptance criteria
- [Source: _bmad-output/planning-artifacts/architecture.md#6.5] - "I" prefix naming convention for public interfaces
- [Source: _bmad-output/planning-artifacts/architecture.md#7.1-7.5] - CSS/Webview patterns for rendering
- [Source: src/agents/shared/agent.interface.ts] - AgentType, AgentStatus, IAgentState definitions
- [Source: src/api/extension-api.ts] - JSDoc documentation style precedent
- [Source: docs/extension-dev/llm-providers.md] - Documentation structure precedent

## Previous Story Intelligence

### Story 9.1 Learnings (ILLMProvider Documentation)
- **JSDoc Pattern**: Use `@public`, `@since 0.0.1`, `@remarks` for all public interfaces
- **Documentation Structure**: Overview → Interface → Implementation → Registration → Lifecycle → Error Handling → Best Practices → Semver Policy
- **Example Pattern**: Complete working example with inline comments

### Story 9.2 Learnings (LLM Provider Registration API)
- **API Implementation Pattern**: Factory function (`createAPI`) for clean dependency injection
- **Validation Pattern**: Multi-layered validation (name, structure, reserved names, duplicates)
- **Export Pattern**: Barrel export in `src/api/index.ts` with re-exports for convenience
- **Test Pattern**: Interface contract tests + implementation tests + integration tests

### Files from Previous Stories
- `src/api/extension-api.ts` - API interface pattern to follow
- `src/api/api-implementation.ts` - Validation pattern to follow
- `src/api/index.ts` - Export barrel to extend
- `docs/extension-dev/llm-providers.md` - Documentation structure to mirror

## Git Intelligence

### Recent Commits
- `ca92f0d0` - story 9.2: Implemented LLM Provider Registration API
- `be2148d7` - story 9.1: Defined and documented ILLMProvider extension interface
- `425495c1` - story 8.8: Team adoption tracking

### Patterns from Recent Work
- Interface-first design with comprehensive JSDoc
- Co-located tests in `__tests__/` directories
- Kebab-case file naming
- Separate interface files from implementation

## Latest Tech Information

### Webview Rendering in VSCode
- VSCode webviews use Chromium-based rendering
- CSS GPU acceleration fully supported (`transform: translate3d()`, `will-change`)
- `requestAnimationFrame` available for smooth 60fps animations
- DOM API fully available within webview context

### Performance Best Practices for Renderers
- Use CSS transforms instead of positional properties (top/left)
- Batch DOM operations to minimize reflows
- Use `will-change` sparingly (only on animated elements)
- Cancel animation frames in destroy() to prevent memory leaks

### TypeDoc Configuration
- Ensure `@public` tag on interfaces for API documentation generation
- Use `@example` blocks for code samples in generated docs
- TypeDoc respects `@since` tags for versioning display

## Dev Agent Record

### Agent Model Used
### Implementation Plan
The IAgentRenderer interface was implemented following the established public API patterns. Supporting types (AgentRenderContext, RenderTransition, etc.) were defined in the same file to keep the interface self-contained. Comprehensive documentation was created, and a complete SVG-based example was implemented and verified with tests.

### Completion Notes List
- Defined `IAgentRenderer` interface in `src/ui/renderer.interface.ts`.
- Exported all renderer-related types through `src/api/index.ts`.
- Created `docs/extension-dev/agent-renderers.md` guide.
- Created `docs/extension-dev/custom-renderer-example.ts` example.
- Added unit tests for the interface and example using Vitest and JSDOM.
- Verified documentation generation with TypeDoc.

### File List
- `src/ui/renderer.interface.ts`
- `src/ui/__tests__/renderer.interface.test.ts`
- `src/api/index.ts` (modified)
- `docs/extension-dev/agent-renderers.md`
- `docs/extension-dev/custom-renderer-example.ts`
- `docs/extension-dev/__tests__/custom-renderer-example.test.ts`
- `vitest.config.mts` (modified)

## Change Log

- **2026-01-18**: Story 9.3 created via create-story workflow - ready for development
