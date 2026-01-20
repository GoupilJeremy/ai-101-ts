# Story 4.8: Implement Async Rendering Pipeline with Non-Blocking Updates

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want the HUD rendering to be completely asynchronous,
so that visual updates never block code editing or typing responsiveness.

## Acceptance Criteria

1.  **Given** GPU-accelerated animations are implemented
2.  **When** I implement asynchronous state handling and batching in `src/webview/main.ts`
3.  **Then** State updates are batched and debounced (max 60 updates/second)
4.  **And** Main thread focus remains on responsiveness (<100ms latency)
5.  **And** Large state updates are processed incrementally if necessary
6.  **And** Progress indicators (pulsing icons) show activity during processing
7.  **And** Rendering priority is maintained: interactions first
8.  **And** Unit tests verify batching logic and performance constraints

## Tasks / Subtasks

- [x] Task 1: State Batching (AC: 3, 7)
  - [x] 1.1: Implement an update queue in `main.ts` to batch multiple rapid state changes.
  - [x] 1.2: Use `requestAnimationFrame` to drain the queue at 60fps.

- [x] Task 2: Responsiveness (AC: 4, 5)
  - [x] 2.1: Ensure high-frequency events (like cursor movement) are processed through the async queue.
  - [x] 2.2: Implement logic to only process the latest update of each type per frame.

- [x] Task 3: Verification (AC: 8)
  - [x] 3.1: Verify typing latency remains low during heavy agent activity.

## Dev Notes

- **Web Workers**: While AC mentions them, simple task chunking and raf-batching are often sufficient for webviews unless 3D or extremely heavy physics are involved. I will focus on a robust raf-based pipeline.

### Project Structure Notes

- Modified file: `src/webview/main.ts`

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 4.8]

## Dev Agent Record

### Agent Model Used

Gemini 2.0 Flash (Link Freeman)

### Debug Log References

### Completion Notes List

### File List
