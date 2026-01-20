# Story 2.1: Define ILLMProvider Interface with Adapter Pattern

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want a common interface for all LLM providers,
So that the system can work with multiple providers interchangeably without code changes.

## Acceptance Criteria

1.  **Given** The project structure exists
2.  **When** I create `src/llm/provider.interface.ts`
3.  **Then** ILLMProvider interface defines:
    - `readonly name: string` property
    - `generateCompletion(prompt: string, options?: ILLMOptions): Promise<ILLMResponse>` method
    - `estimateTokens(text: string): number` method
    - `getModelInfo(model: string): IModelInfo` method
    - `isAvailable(): Promise<boolean>` method
4.  **And** ILLMOptions interface includes: model, temperature, maxTokens, timeout
5.  **And** ILLMResponse interface includes: text, tokens, model, finishReason, cost
6.  **And** All interfaces use TypeScript strict mode with no `any` types
7.  **And** JSDoc comments document all interface members with examples
8.  **And** Interfaces are exported for extensibility (FR60 - custom providers)

## Tasks / Subtasks

- [x] Task 1: Define LLM Interfaces (AC: 3, 4, 5, 8)
  - [x] 1.1: Create `src/llm/provider.interface.ts`
  - [x] 1.2: Define `IModelInfo` interface
  - [x] 1.3: Define `ILLMOptions` interface
  - [x] 1.4: Define `ILLMResponse` interface
  - [x] 1.5: Define `ILLMProvider` interface

- [x] Task 2: Documentation (AC: 7)
  - [x] 2.1: Add JSDoc comments to all interfaces and members

- [x] Task 3: Quality Check (AC: 6)
  - [x] 3.1: Ensure no `any` types are used
  - [x] 3.2: Verify strict mode compliance (npm run compile)

## Dev Notes

### Architecture Patterns & Constraints
- **Adapter Pattern**: This interface follows the adapter pattern to normalize different LLM SDKs.
- **Strict Typing**: Essential for maintaining reliability across multiple providers.

### Source Tree Components
- `src/llm/provider.interface.ts` (New)

### Testing Standards
- Interface definitions are verified via compilation.

## Dev Agent Record

### Agent Model Used

Gemini 2.0 Flash

### Debug Log References

- Code compiled successfully.
- No `any` types found in `src/llm/provider.interface.ts`.

### Completion Notes List

- Defined all necessary interfaces for LLM interaction.
- Adhered to the adapter pattern.
- Included JSDoc documentation.

### File List

- src/llm/provider.interface.ts
