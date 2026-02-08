# AgentCharacterComponent - Animated SVG Characters

**Story 11.4** - Agent Character Component with Movement Animations

## Overview

`AgentCharacterComponent` renders AI agents as animated SVG characters that anchor to specific code lines and move smoothly through the editor viewport. This component brings the agents to life as sumi-e brush-painted characters that interact with the code.

## Architecture

```
┌─────────────────────────────────────────────────┐
│          AgentCharacterManager                   │
│                 (Singleton)                      │
│  ┌────────────────────────────────────────────┐ │
│  │  Characters Map:                            │ │
│  │  - architect → AgentCharacterComponent      │ │
│  │  - coder     → AgentCharacterComponent      │ │
│  │  - reviewer  → AgentCharacterComponent      │ │
│  │  - context   → AgentCharacterComponent      │ │
│  └────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
         ↑                                ↓
    Messages from                   Updates to
    SpatialManager                  DOM Elements
```

## Components

### AgentCharacterComponent

Individual character component representing a single agent.

**Key Features:**
- ✅ SVG rendering with sumi-e aesthetic
- ✅ GPU-accelerated animations (`transform3d`, `will-change`)
- ✅ Smooth appear/disappear transitions
- ✅ Position anchoring to code lines
- ✅ Visibility state management
- ✅ Accessibility (ARIA attributes)

**State:**
```typescript
interface CharacterState {
    position: AgentPosition | null;
    isVisible: boolean;
    isAnimating: boolean;
}
```

### AgentCharacterManager

Singleton manager handling all character instances.

**Responsibilities:**
- Creates and initializes all 4 agent characters
- Routes position updates from SpatialManager
- Manages character lifecycle
- Provides access to individual characters

## API Reference

### AgentCharacterComponent

#### Constructor

```typescript
const architect = new AgentCharacterComponent('architect');
```

**Parameters:**
- `agentId: AgentType` - Agent ID ('architect' | 'coder' | 'reviewer' | 'context')

#### Methods

##### `render(container: HTMLElement): void`

Renders the character to the DOM.

```typescript
const container = document.getElementById('hud-container');
architect.render(container);
```

**Creates:**
- Main element: `<div id="agent-character-architect" class="agent-character">`
- SVG container with character graphics
- Accessibility attributes

##### `updatePosition(position: AgentPosition | null): void`

Updates the character's position.

```typescript
// Position update from SpatialManager
architect.updatePosition({
    x: -120,
    y: 400,
    anchorLine: 50,
    relativeY: 0.5,
    isVisible: true
});

// Detach character
architect.updatePosition(null);
```

**Behaviors:**
- **Appearing** (null → visible): Fade in with scale animation (0.4s)
- **Moving** (visible → visible): Smooth translate (0.3s)
- **Fading** (visible → invisible): Fade opacity to 0.3 (0.3s)
- **Detaching** (visible → null): Scale down and fade out (0.3s)

##### `getPosition(): AgentPosition | null`

Returns current position.

```typescript
const pos = architect.getPosition();
if (pos) {
    console.log(`Anchored to line ${pos.anchorLine}`);
}
```

##### `isVisible(): boolean`

Checks if character is visible.

```typescript
if (architect.isVisible()) {
    console.log('Architect is on screen');
}
```

##### `isAnimating(): boolean`

Checks if character is currently animating.

```typescript
if (!architect.isAnimating()) {
    // Safe to apply additional transforms
}
```

##### `dispose(): void`

Removes character from DOM and cleans up.

```typescript
architect.dispose();
```

### AgentCharacterManager

#### Singleton Access

```typescript
const manager = AgentCharacterManager.getInstance();
```

#### Methods

##### `initialize(container: HTMLElement): void`

Creates and renders all 4 agent characters.

```typescript
const hudContainer = document.getElementById('hud-container');
const manager = AgentCharacterManager.getInstance();
manager.initialize(hudContainer);
```

**Creates:**
- 4 `AgentCharacterComponent` instances
- Renders all to container
- Logs initialization

##### `handlePositionUpdate(agentId: AgentType, position: AgentPosition | null): void`

Routes position update to the appropriate character.

```typescript
// Called from message handler
manager.handlePositionUpdate('architect', {
    x: -120,
    y: 400,
    anchorLine: 50,
    relativeY: 0.5,
    isVisible: true
});
```

**Errors:**
- Warns if character not found

##### `getCharacter(agentId: AgentType): AgentCharacterComponent | undefined`

Gets character by ID.

```typescript
const architect = manager.getCharacter('architect');
if (architect) {
    console.log('Current position:', architect.getPosition());
}
```

##### `getAllCharacters(): Map<AgentType, AgentCharacterComponent>`

Returns immutable copy of all characters.

```typescript
const characters = manager.getAllCharacters();
console.log(`Total characters: ${characters.size}`);
```

##### `dispose(): void`

Disposes all characters and cleans up.

```typescript
manager.dispose();
```

## Integration

### In main.ts

```typescript
import { AgentCharacterManager } from './components/agent-character.js';

let agentCharacterManager: AgentCharacterManager;

function initializeComponents() {
    // ... other initializations

    // Story 11.4: Initialize Agent Character Manager
    agentCharacterManager = AgentCharacterManager.getInstance();
    const hudContainer = document.getElementById('hud-container');
    if (hudContainer) {
        agentCharacterManager.initialize(hudContainer);
    }
}

// Message handler
window.addEventListener('message', event => {
    const message = event.data;

    switch (message.type) {
        case 'toWebview:agentPositionUpdate':
            if (agentCharacterManager) {
                agentCharacterManager.handlePositionUpdate(
                    message.agentId,
                    message.position
                );
            }
            break;
    }
});
```

### Message Protocol

**Type:** `toWebview:agentPositionUpdate`

**Payload:**
```typescript
{
    type: 'toWebview:agentPositionUpdate',
    agentId: 'architect',
    position: {
        x: -120,              // Absolute X position
        y: 400,               // Absolute Y position
        anchorLine: 50,       // Target line (0-based)
        relativeY: 0.5,       // Relative position (0-1)
        isVisible: true       // Is line visible in viewport?
    } | null  // null = detach
}
```

## SVG Characters

Each agent has a unique sumi-e SVG character (from Story 11.1):

### Architect 🏗️
- Thoughtful posture with T-ruler tool
- 4 brush strokes
- Vermillion red accent (思考 - thinking)

### Coder 💻
- Leaning posture with active code line
- 4 brush strokes
- Pine green accent (活発 - active)

### Reviewer 🛡️
- Upright guardian with shield
- 4 brush strokes
- Gold yellow accent (守護 - guardian)

### Context 🔍
- Observant with magnifying glass
- 5 brush strokes
- Bamboo green accent (観察 - observation)

## Animations

### Appear Animation

**Trigger:** First position update with `isVisible: true`

```css
@keyframes agentAppear {
    from {
        opacity: 0;
        transform: translate3d(0, -20px, 0) scale(0.5);
    }
    to {
        opacity: 1;
        transform: translate3d(0, 0, 0) scale(1);
    }
}
```

**Duration:** 0.4s
**Easing:** `cubic-bezier(0.34, 1.56, 0.64, 1)` (bounce)

### Move Animation

**Trigger:** Position change while visible

**Properties:**
- `left` and `top` transitions
- GPU-accelerated (`transform3d` base)

**Duration:** 0.3s
**Easing:** `ease-out`

### Fade Animation

**Trigger:** Line scrolls out of view (`isVisible: false`)

**Effect:** Opacity reduces to 0.3

**Duration:** 0.3s
**Easing:** `ease-out`

### Disappear Animation

**Trigger:** Detachment (position = null)

**Effect:**
- Scale down to 0.5
- Translate up 20px
- Fade to opacity 0

**Duration:** 0.3s
**Easing:** `ease-in`

### Idle Breathing

**Trigger:** Not moving, not appearing/disappearing

**Effect:** Subtle scale pulse (1.0 → 1.02 → 1.0)

**Duration:** 3s
**Easing:** `ease-in-out`

## Performance Optimizations

### GPU Acceleration

All transforms use `transform3d` and `will-change`:

```css
.agent-character {
    will-change: transform, opacity;
    transform: translate3d(0, 0, 0);
}
```

### Performance Mode

When `body.performance-mode` is active:

```css
body.performance-mode .agent-character {
    transition: none !important;
    animation: none !important;
    will-change: auto;
}

body.performance-mode .agent-character__container {
    filter: none; /* Remove drop-shadow */
}
```

### Reduced Motion

Respects user preference:

```css
@media (prefers-reduced-motion: reduce) {
    .agent-character {
        transition: opacity 0.1s linear !important;
        animation: none !important;
    }
}
```

## Accessibility

### ARIA Attributes

```html
<div
    id="agent-character-architect"
    class="agent-character"
    role="img"
    aria-label="Architect agent"
    data-agent-id="architect"
>
```

### High Contrast Mode

```css
body.high-contrast-mode .agent-character__container {
    filter: drop-shadow(0 3px 12px rgba(0, 0, 0, 0.8));
}

body.high-contrast-mode .agent-character__svg {
    stroke-width: 4 !important; /* Thicker strokes */
}
```

### Colorblind Support

CSS variables adapt colors:

```css
/* Protanopia/Deuteranopia (red-green) */
body.colorblind-mode[data-colorblind-type="protanopia"] {
    --vermillion-red: #E67E22;  /* Orange instead */
    --pine-green: #3498DB;      /* Blue instead */
}

/* Tritanopia (blue-yellow) */
body.colorblind-mode[data-colorblind-type="tritanopia"] {
    --gold-yellow: #E74C3C;  /* Red instead */
}
```

## Testing

**Test Suite:** `src/webview/components/__tests__/agent-character.test.ts`

**Coverage:** 31 tests covering:
- ✅ Rendering (all 4 agent types)
- ✅ SVG content presence
- ✅ Accessibility attributes
- ✅ Position updates (visible/invisible/null)
- ✅ Animation states
- ✅ Disposal
- ✅ Edge cases (rapid updates, negative coords, viewport edges)
- ✅ Manager singleton
- ✅ Manager initialization
- ✅ Position routing
- ✅ Character retrieval

**Run Tests:**
```bash
npm run test:unit -- agent-character
```

**Results:**
```
✓ 31 tests passed in 96ms
```

**Environment:** jsdom (DOM required)

## Styling

**Stylesheet:** `src/webview/styles/agent-character.css`

**Loaded in:** `index.html`

```html
<link rel="stylesheet" href="${agentCharacterUri}">
```

**CSS Structure:**
- Base styles (`.agent-character`, `.agent-character__container`)
- Agent-specific identity (`.agent-character[data-agent-id="..."]`)
- Animation states (`.moving`, `.appearing`, `.disappearing`, `.faded`)
- Idle breathing animation
- Performance mode overrides
- Focus mode (hide all)
- High contrast mode
- Reduced motion support
- Colorblind mode adjustments
- Dark theme support
- Print styles

## Example Usage

### Basic Setup

```typescript
import { AgentCharacterManager } from './components/agent-character.js';

// Initialize on page load
const manager = AgentCharacterManager.getInstance();
const container = document.getElementById('hud-container')!;
manager.initialize(container);

// Characters are now rendered (hidden)
```

### Position Update Flow

```typescript
// 1. Backend: SpatialManager anchors agent to line
spatialManager.attachAgentToLine('architect', 50);

// 2. SpatialManager sends message to webview
webview.postMessage({
    type: 'toWebview:agentPositionUpdate',
    agentId: 'architect',
    position: { x: -120, y: 400, anchorLine: 50, relativeY: 0.5, isVisible: true }
});

// 3. Webview receives and routes to manager
window.addEventListener('message', event => {
    if (event.data.type === 'toWebview:agentPositionUpdate') {
        agentCharacterManager.handlePositionUpdate(
            event.data.agentId,
            event.data.position
        );
    }
});

// 4. Manager routes to character
const architect = this.characters.get('architect');
architect.updatePosition(position);

// 5. Character animates to new position
// - Fades in with bounce
// - Positions at x: -120px, y: 400px
// - Visible on screen
```

### Detachment Flow

```typescript
// Backend detaches agent
spatialManager.detachAgent('architect');

// Message sent with null position
webview.postMessage({
    type: 'toWebview:agentPositionUpdate',
    agentId: 'architect',
    position: null
});

// Character animates out
// - Scales down to 0.5
// - Moves up 20px
// - Fades to opacity 0
// - State: isVisible = false, position = null
```

## Future Enhancements (Story 11.7+)

### Inter-Agent Interactions (Story 11.7)

Visual communication between agents:
- Ink strokes connecting agents
- Collaborative work visualization
- Message passing animations

### Collective Enso Fusion (Story 11.10)

All agents merge into single Enso circle:
- Triggers on collaborative tasks
- Circular formation animation
- Unified thinking visualization

### Micro-Animations (Story 11.14)

Personality expressions:
- Idle gestures
- Thinking bobbles
- Success celebrations
- Error reactions

## Acceptance Criteria ✅

- [x] AgentCharacterComponent class created
- [x] Renders SVG characters from Story 11.1
- [x] Receives position updates from messages
- [x] Animates movement with GPU acceleration
- [x] Handles visibility states (visible/hidden/detached)
- [x] AgentCharacterManager singleton implemented
- [x] Initializes all 4 characters
- [x] Routes position updates correctly
- [x] 31 unit tests passing
- [x] CSS animations optimized for 60fps
- [x] Accessibility support (ARIA, high contrast, reduced motion)
- [x] Performance mode optimizations
- [x] Documentation complete

**Story 11.4: COMPLETE** ✅

---

Made with 墨 (ink) and ❤️ for Suika 🍉
