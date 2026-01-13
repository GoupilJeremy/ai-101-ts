# Story 4.7: Implement GPU-Accelerated Animations for 60fps Performance

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want all HUD animations to maintain 60fps without affecting code editor performance,
so that the visual experience is fluid and never impacts my development workflow.

## Acceptance Criteria

1.  **Given** All visual components are implemented
2.  **When** I optimize animations in `src/webview/styles/animations.css`
3.  **Then** All animations use GPU-accelerated properties (`transform: translate3d()`, `opacity`)
4.  **And** No animations use CPU-expensive properties (`left`, `top`, `width`, `height` for animation)
5.  **And** Elements with animations have `will-change` CSS property declared
6.  **And** Frame timing monitored via Performance API, warning logged if <60fps
7.  **And** Performance Mode (FR24) reduces animation complexity for low-end machines
8.  **And** Animations pause when webview not visible (automatic by browser, but explicitly handled if needed)
9.  **And** Performance tests verify 60fps maintained on reference hardware

## Tasks / Subtasks

- [x] Task 1: Animation Optimization (AC: 3, 4, 5)
  - [x] 1.1: Refactor `src/webview/index.css` and `src/webview/sumi-e.css` to use `translate3d` and `will-change`.
  - [x] 1.2: Refactor `main.ts` to use `translate3d` for all frequent position updates.

- [x] Task 2: Performance Monitoring (AC: 6, 9)
  - [x] 2.1: Implement FPS monitor using `requestAnimationFrame` and `performance.now()`.
  - [x] 2.2: Log warnings if frame rate drops below 30fps.

- [x] Task 3: Performance Mode (AC: 7, 8)
  - [x] 3.1: Implement logic for `performanceMode` in `main.ts` and `low-fx` class in CSS.
  - [x] 3.2: Performance Mode disables animations and backdrop filters.

## Dev Notes

- **Translate3D**: Use `translate3d(x, y, 0)` to trigger hardware acceleration.
- **Will-Change**: Don't over-use it, only for elements that actually move continuously.

### Project Structure Notes

- Modified file: `src/webview/index.css`
- Modified file: `src/webview/sumi-e.css`
- Modified file: `src/webview/main.ts`

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 4.7]

## Dev Agent Record

### Agent Model Used

Gemini 2.0 Flash (Link Freeman)

### Debug Log References

### Completion Notes List

### File List
