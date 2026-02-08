# 🎨 Suika Agent Characters - Sumi-e SVG Assets

**Story 11.1** - SVG Character Assets Created: 2026-02-08

## Overview

This directory contains the SVG character designs for Suika's four AI agents, created in the minimalist Japanese sumi-e (墨絵) brush painting style.

## Characters

### 🏗️ Architect (architect.svg)
- **Traits:** 4 (head + curved body + T-ruler + accent)
- **Posture:** Thoughtful, analytical stance
- **Symbol:** T-ruler (architectural tool)
- **Accent:** Red dot (vision/insight)
- **Role:** Analyzes project structure and design patterns

### 💻 Coder (coder.svg)
- **Traits:** 4 (head + leaning body + keyboard + active line)
- **Posture:** Focused, leaning toward work
- **Symbol:** Red line (active code line)
- **Accent:** Active code line
- **Role:** Generates code and implementations

### 🛡️ Reviewer (reviewer.svg)
- **Traits:** 4 (head + straight body + shield + eye)
- **Posture:** Upright, guardian stance
- **Symbol:** Shield (protection/validation)
- **Accent:** Red eye (vigilance)
- **Role:** Validates code quality and identifies risks

### 🔍 Context (context.svg)
- **Traits:** 5 (head + body + magnifier circle + handle + focus)
- **Posture:** Observant, searching
- **Symbol:** Magnifying glass (observation)
- **Accent:** Red dot (focus point)
- **Role:** Discovers files and manages context

## Design Principles

### Sumi-e Aesthetic (墨絵)
- **Extreme Minimalism:** 2-5 brush strokes maximum
- **Single Stroke Philosophy:** Each stroke counts, no retouching
- **Natural Asymmetry:** Wabi-sabi beauty in imperfection
- **Negative Space (Ma 間):** The void is as important as the form

### Technical Specifications
- **ViewBox:** 100x100 (fully scalable)
- **Colors:** CSS variables (`var(--ink-black)`, `var(--vermillion-red)`)
- **Stroke:** `stroke-linecap="round"` for authentic brush effect
- **Scalability:** Readable from 40px to 160px
- **Thémable:** Colors adapt to VSCode theme via CSS variables

### Color Palette
```css
--ink-black: #2C3E50      /* Primary ink color */
--vermillion-red: #E74C3C  /* Strategic accent (focus/action) */
```

## Usage

### In Components
```javascript
// Import in agent-character-component.js
const AGENT_CHARACTERS = {
  architect: `<svg viewBox="0 0 100 100">...</svg>`,
  coder: `<svg viewBox="0 0 100 100">...</svg>`,
  reviewer: `<svg viewBox="0 0 100 100">...</svg>`,
  context: `<svg viewBox="0 0 100 100">...</svg>`
};
```

### Direct Inline
```html
<div class="agent-container">
  <svg viewBox="0 0 100 100" width="80" height="80">
    <!-- Copy content from architect.svg -->
  </svg>
</div>
```

### As External File (if needed)
```html
<img src="animations/architect.svg" alt="Architect Agent" width="80">
```

## Visual Testing

Open `test-characters.html` in a browser to:
- ✅ Preview all 4 characters side-by-side
- ✅ Test scalability (40px → 160px)
- ✅ Validate sumi-e aesthetic
- ✅ Check acceptance criteria

```bash
# Open test file
xdg-open test-characters.html  # Linux
open test-characters.html      # macOS
```

## Acceptance Criteria - Story 11.1

- [x] 4 SVG files created (architect, coder, reviewer, context)
- [x] Each character has 2-5 brush strokes maximum
- [x] ViewBox 100x100 for full scalability
- [x] CSS variables for themable colors
- [x] stroke-linecap="round" for brush effect
- [x] Extreme minimalism (sumi-e philosophy)
- [x] Natural asymmetry (wabi-sabi)
- [x] Fluid strokes, single-pass
- [x] Strategic vermillion accents
- [x] Identifiable by role

## File Sizes

```
architect.svg  654 bytes
coder.svg      675 bytes
reviewer.svg   605 bytes
context.svg    755 bytes
Total:         2.7 KB
```

Extremely lightweight - perfect for inline embedding!

## Modifications

If you need to edit these characters:

### Quick Edit (Text Editor)
```bash
# Edit directly with any text editor
code architect.svg
```

### Visual Edit (Inkscape)
```bash
# Install Inkscape
sudo apt install inkscape  # Linux

# Open and edit
inkscape architect.svg
```

### Visual Edit (Figma)
1. Copy SVG code
2. Paste in Figma (auto-converts)
3. Edit visually
4. Export as SVG

## Animation States (Future Stories)

These characters will be animated in future stories:
- **Story 11.4:** Movement and positioning
- **Story 11.9:** State animations (idle, thinking, working)
- **Story 11.14:** Personality micro-animations

Current SVGs are animation-ready with proper structure.

## Credits

**Design Philosophy:** Japanese sumi-e (墨絵) minimalism
**Created:** Story 11.1 (2026-02-08)
**Style Influences:**
- Ma (間) - Negative space
- Wabi-sabi (侘寂) - Beauty in imperfection
- Kanso (簡素) - Elegant simplicity

---

Made with 墨 (ink) and ❤️ for Suika 🍉
