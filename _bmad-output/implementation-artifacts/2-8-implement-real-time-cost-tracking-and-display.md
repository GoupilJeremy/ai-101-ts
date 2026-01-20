# Story 2.8: Implement Real-Time Cost Tracking and Display

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want real-time LLM cost tracking visible to users,
so that users understand the cost impact of their AI usage session.

## Acceptance Criteria

1.  **Given** LLM provider integration and rate limiting are complete
2.  **When** I create `src/llm/cost-tracker.ts`
3.  **Then** CostTracker accumulates cost per LLM call based on token count and provider pricing
4.  **And** Pricing data for OpenAI and Anthropic models is configured
5.  **And** Cost calculation includes: prompt tokens × input_price + completion tokens × output_price
6.  **And** Current session cost is accessible via `getCurrentSessionCost()`
7.  **And** Cost is formatted for display: "$0.05" with 2 decimal precision
8.  **And** Cost tracking integrates with Vital Signs Bar for display (FR30)
9.  **And** Cache hits show $0.00 cost (demonstrating cache value)
10. **And** Unit tests verify cost calculations for different models

## Tasks / Subtasks

- [x] Task 1: Foundation (AC: 2, 3, 4, 5, 6)
  - [x] 1.1: Create `src/llm/cost-tracker.ts`
  - [x] 1.2: Implement cost accumulation and session retrieval

- [x] Task 2: Display & Formatting (AC: 7, 8)
  - [x] 2.1: Implement cost formatting logic
  - [x] 2.2: Create a basic VSCode Status Bar Item for "Vital Signs" (FR30)

- [x] Task 3: Integration (AC: 9)
  - [x] 3.1: Integrate `CostTracker` into `LLMProviderManager`
  - [x] 3.2: Verify cache hits record $0.00 cost

- [x] Task 4: Testing (AC: 10)
  - [x] 4.1: Create `src/llm/__tests__/cost-tracker.test.ts`
  - [x] 4.2: Verify cost calculation accuracy for various models

## Dev Notes

- **Pricing**: Although providers return cost, `CostTracker` should be able to recalculate or at least aggregate it reliably. I'll rely on the cost returned by the providers for consistency.
- **Status Bar**: Use `vscode.window.createStatusBarItem`.
- **Formatting**: `new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cost)`.

### Project Structure Notes

- New file: `src/llm/cost-tracker.ts`
- New test file: `src/llm/__tests__/cost-tracker.test.ts`

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.8]

## Dev Agent Record

### Agent Model Used

Gemini 2.0 Flash (Link Freeman)

### Debug Log References

### Completion Notes List

### File List
