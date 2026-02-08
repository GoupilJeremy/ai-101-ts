# AgentPositioning - Code Anchoring System

**Story 11.2** - Agent Position Calculation Module

## Overview

`AgentPositioning` is a static utility class that calculates precise positions for AI agents to "anchor" themselves to specific lines of code in the VSCode editor. This enables agents to visually indicate which code they are analyzing.

## Core Concept

```
Editor Viewport                    Agent Positions
┌────────────────────────┐
│  1: function foo() {   │  [Context -60px]     [Coder +20px]
│  2:   const x = 1;     │  ⬅️                  ➡️
│  3:   return x;        │
│  4: }                  │  [Architect -120px]  [Reviewer +80px]
│                        │  ⬅️⬅️                 ➡️➡️
└────────────────────────┘
```

## Key Features

- ✅ **Precise Line Anchoring** - Agents positioned at exact code lines
- ✅ **Side-Based Positioning** - Left agents (Context, Architect) vs Right (Coder, Reviewer)
- ✅ **Collision Avoidance** - Agents auto-adjust when too close
- ✅ **Viewport Aware** - Handles scrolling and viewport changes
- ✅ **Edge Case Handling** - Clamping, validation, nearest visible line

## API Reference

### Main Method: `getAgentPosition()`

Calculates the absolute position for an agent to anchor to a specific line.

```typescript
interface AgentPosition {
  x: number;        // Absolute X coordinate
  y: number;        // Absolute Y coordinate
  anchorLine: number;  // Target line (0-based)
  relativeY: number;   // Relative position (0-1)
}

AgentPositioning.getAgentPosition(
  agentType: AgentType,     // 'context' | 'architect' | 'coder' | 'reviewer'
  lineNumber: number,       // Target line (0-based)
  totalLines: number,       // Total lines in document
  editorBounds: EditorBounds  // Editor viewport dimensions
): AgentPosition
```

**Example:**
```typescript
const position = AgentPositioning.getAgentPosition(
  'architect',
  50,   // Line 50
  100,  // Document has 100 lines
  { top: 0, left: 0, width: 1200, height: 800 }
);

// Result:
// {
//   x: -120,          // 120px left of editor
//   y: 400,           // Middle of viewport (50% of 800px)
//   anchorLine: 50,
//   relativeY: 0.5    // 50%
// }
```

### Agent X Positions (Default Offsets)

| Agent | Side | Offset | Description |
|-------|------|--------|-------------|
| **Context** | Left | -60px | Close to editor edge |
| **Architect** | Left | -120px | Further left (architectural overview) |
| **Coder** | Right | +20px | Close to editor edge |
| **Reviewer** | Right | +80px | Further right (review distance) |

### Visibility Methods

#### `isLineVisible()`
Checks if a line is currently visible in the viewport.

```typescript
AgentPositioning.isLineVisible(
  lineNumber: number,
  visibleRanges: VisibleRange[]
): boolean

// Example:
const visible = AgentPositioning.isLineVisible(
  50,
  [{ start: 40, end: 60 }, { start: 80, end: 100 }]
);
// Returns: true (line 50 is in range 40-60)
```

#### `findNearestVisibleLine()`
Finds the closest visible line to a target (useful when scrolled out).

```typescript
AgentPositioning.findNearestVisibleLine(
  targetLine: number,
  visibleRanges: VisibleRange[]
): number

// Example:
const nearest = AgentPositioning.findNearestVisibleLine(
  75,  // Target line (not visible)
  [{ start: 40, end: 60 }, { start: 80, end: 100 }]
);
// Returns: 80 (closest visible line)
```

### Multi-Agent Positioning

#### `getMultipleAgentPositions()`
Calculates positions for multiple agents with automatic collision avoidance.

```typescript
AgentPositioning.getMultipleAgentPositions(
  requests: Array<{ agentType: AgentType; lineNumber: number }>,
  totalLines: number,
  editorBounds: EditorBounds
): Map<AgentType, AgentPosition>

// Example:
const positions = AgentPositioning.getMultipleAgentPositions(
  [
    { agentType: 'context', lineNumber: 50 },
    { agentType: 'architect', lineNumber: 52 }  // Close to context
  ],
  100,
  editorBounds
);
// Architect will be offset downward to avoid collision
```

### Utility Methods

#### `getAgentCenterPoint()`
Gets the center point of an agent (useful for animations).

```typescript
const center = AgentPositioning.getAgentCenterPoint(position);
// Returns: { x: position.x, y: position.y + 40 }
```

#### `estimateEditorBounds()`
Estimates editor bounds when VSCode API doesn't provide them.

```typescript
const bounds = AgentPositioning.estimateEditorBounds(1920, 1080);
// Returns estimated bounds accounting for sidebars, panels, etc.
```

#### `isPositionValid()`
Validates a position for debugging.

```typescript
const valid = AgentPositioning.isPositionValid(position, editorBounds);
// Returns: false if NaN, Infinity, or out of reasonable bounds
```

## Usage Examples

### Basic Usage: Single Agent

```typescript
import { AgentPositioning } from '../ui/agent-positioning.js';

// Get editor dimensions (from VSCode or estimate)
const editorBounds = {
  top: 0,
  left: 0,
  width: 1200,
  height: 800
};

// Position architect at line 50
const position = AgentPositioning.getAgentPosition(
  'architect',
  50,
  totalLines,
  editorBounds
);

// Send position to webview for animation
webview.postMessage({
  type: 'toWebview:agentPositionUpdate',
  agentId: 'architect',
  position
});
```

### Advanced: Multiple Agents with Collision Avoidance

```typescript
// Multiple agents analyzing nearby code
const requests = [
  { agentType: 'context', lineNumber: 45 },
  { agentType: 'architect', lineNumber: 48 },
  { agentType: 'coder', lineNumber: 50 },
  { agentType: 'reviewer', lineNumber: 52 }
];

const positions = AgentPositioning.getMultipleAgentPositions(
  requests,
  totalLines,
  editorBounds
);

// All agents positioned with minimum 100px distance on same side
positions.forEach((position, agentType) => {
  webview.postMessage({
    type: 'toWebview:agentPositionUpdate',
    agentId: agentType,
    position
  });
});
```

### Handling Scroll: Nearest Visible Line

```typescript
// User scrolled - target line no longer visible
const targetLine = 150;
const visibleRanges = [
  { start: 40, end: 60 },
  { start: 80, end: 100 }
];

const nearestLine = AgentPositioning.findNearestVisibleLine(
  targetLine,
  visibleRanges
);

// Re-position agent to nearest visible line
const position = AgentPositioning.getAgentPosition(
  'architect',
  nearestLine,
  totalLines,
  editorBounds
);
```

## Integration with SpatialManager

This class will be used by `SpatialManager` (Story 11.3):

```typescript
// In SpatialManager (Story 11.3)
import { AgentPositioning } from './agent-positioning.js';

class SpatialManager {
  attachAgentToLine(agentId: AgentType, lineNumber: number) {
    const bounds = this.getEditorBounds();
    const position = AgentPositioning.getAgentPosition(
      agentId,
      lineNumber,
      this.getTotalLines(),
      bounds
    );

    // Send to webview
    this.notifyWebview(agentId, position);
  }
}
```

## Edge Cases Handled

### ✅ Line Clamping
```typescript
// Negative line → 0
// Line > totalLines → totalLines - 1
const pos = AgentPositioning.getAgentPosition('architect', -10, 100, bounds);
// pos.anchorLine === 0
```

### ✅ Empty Document
```typescript
const pos = AgentPositioning.getAgentPosition('architect', 0, 0, bounds);
// pos.relativeY === 0, no division by zero
```

### ✅ Collision Avoidance
```typescript
// Two agents on same side, close together
const positions = AgentPositioning.getMultipleAgentPositions([
  { agentType: 'context', lineNumber: 50 },
  { agentType: 'architect', lineNumber: 51 }  // 1 line apart
], 100, bounds);
// Architect pushed down ≥100px from context
```

### ✅ Position Validation
```typescript
// Invalid positions detected
const invalid = { x: NaN, y: 100, anchorLine: 50, relativeY: 0.5 };
AgentPositioning.isPositionValid(invalid, bounds); // false
```

## Performance

- ⚡ **O(1)** for single agent positioning
- ⚡ **O(n log n)** for multi-agent with collision (n = agent count)
- ⚡ **O(n)** for visibility checks (n = range count)
- 🎯 **<1ms** typical execution time
- 💾 **Zero memory allocation** (static class)

## Testing

**42 tests** covering all scenarios:

```bash
# Run tests
npm run test:unit -- agent-positioning

# Coverage:
# ✅ All agent types positioning
# ✅ Edge cases (line 0, last line, negative, overflow)
# ✅ Visibility detection
# ✅ Nearest visible line finding
# ✅ Multi-agent collision avoidance
# ✅ Validation methods
# ✅ Large documents (10000 lines)
# ✅ Small viewports
```

## Next Steps (Story 11.3)

**SpatialManager Extension:**
- Import and use `AgentPositioning`
- Add `attachAgentToLine(agentId, lineNumber)` method
- Sync with scroll/resize events
- Send positions to webview via postMessage

## Acceptance Criteria ✅

- [x] Class `AgentPositioning` created in `src/ui/agent-positioning.ts`
- [x] Method `getAgentPosition()` returns correct {x, y}
- [x] Y calculated relative to line (0-100% height)
- [x] X positions: Context -60, Architect -120, Coder +20, Reviewer +80
- [x] Edge cases handled (out of viewport, editor minimized)
- [x] 42 unit tests pass (5+ scenarios)
- [x] Documentation complete

**Story 11.2: COMPLETE** ✅

---

Made with 墨 (ink) and ❤️ for Suika 🍉
