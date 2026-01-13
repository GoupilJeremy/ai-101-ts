# Story 4.2: Implement Sumi-e Aesthetic Visual Language

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want the HUD to use minimalist Japanese sumi-e brush aesthetics,
so that the interface is beautiful, calming, and philosophically aligned with transparency.

## Acceptance Criteria

1.  **Given** Webview overlay is implemented
2.  **When** I create `src/webview/styles/sumi-e.css` and SVG brush assets
3.  **Then** Visual design uses 2-5 brush strokes maximum per element (FR10)
4.  **And** Color palette is monochrome (black/gray/white) + single accent color
5.  **And** Ma (間) intentional negative space is prominent in layout
6.  **And** Agent icons are rendered as simple brush stroke ideograms
7.  **And** SVG brush textures have organic, hand-drawn imperfection
8.  **And** Typography uses elegant sans-serif optimized for readability
9.  **And** No gradients, shadows, or visual clutter (strict minimalism)
10. **And** Design system documented with visual guidelines

## Tasks / Subtasks

- [x] Task 1: Aesthetic Definition (AC: 4, 5, 8, 9)
  - [x] 1.1: Define Sumi-e design tokens (colors, spacing, typography)
  - [x] 1.2: Implement `src/webview/sumi-e.css`

- [x] Task 2: Brush Assets (AC: 3, 6, 7)
  - [x] 2.1: Create SVG brush stroke templates (as inline SVG or separate files)
  - [x] 2.2: Apply brush masks to agent containers

- [x] Task 3: Documentation (AC: 10)
  - [x] 3.1: Create `docs/design-system.md` summarizing the Sumi-e HUD guidelines

## Dev Notes

- **Ma (Space)**: Focus on keeping the HUD extremely light.
- **Brush Strokes**: Use SVG filters or masks to simulate ink bleeding and organic textures.
- **Monochrome**: Use `#1a1a1a` (Sumi ink) and `#ffffff` (Washi paper) as primary colors.

### Project Structure Notes

- New file: `src/webview/styles/sumi-e.css`
- New file: `docs/design-system.md`

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 4.2]

## Dev Agent Record

### Agent Model Used

Gemini 2.0 Flash (Link Freeman)

### Debug Log References

### Completion Notes List

### File List
