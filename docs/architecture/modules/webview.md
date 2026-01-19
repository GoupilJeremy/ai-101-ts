# Webview Module

## Overview

The **Webview Module** (`src/webview/`, `src/ui/`) implements the transparent HUD overlay with GPU-accelerated animations.

## Module Structure

```
src/webview/
├── main.js                    # Browser entry point
├── hud-renderer.ts
├── components/
│   ├── agent-visualizations.ts
│   ├── vital-signs-bar.ts
│   └── alert-system.ts
├── animation-engine.ts
└── state/
    └── webview-state-manager.ts
```

## Components

### HUDRenderer

**Purpose**: Main rendering coordinator for the transparent overlay.

**Responsibilities**:
- Render agent visualizations (Sumi-e aesthetic)
- Display vital signs bar
- Show alert system
- Coordinate animations

### AgentVisualizations

**Purpose**: Visual representation of the four agents.

**Features**:
- Sumi-e ink wash aesthetic
- Pulsing animations when active
- Spatial anti-collision positioning

### VitalSignsBar

**Purpose**: Display real-time metrics (cache hit rate, cost, response time).

### AlertSystem

**Purpose**: 4-level alert system (info, warning, error, critical) with code anchoring.

### AnimationEngine

**Purpose**: GPU-accelerated 60fps animations.

**Techniques**:
- CSS transforms (GPU-accelerated)
- RequestAnimationFrame for smooth updates
- Spatial anti-collision algorithm

## Performance Targets

- **Frame Rate**: 60fps (16.67ms per frame)
- **Animation Latency**: <50ms
- **State Sync**: <16ms

## Related Documentation

- [System Overview](../diagrams/system-overview.md)
- [Dual State Pattern](../patterns/dual-state.md)
