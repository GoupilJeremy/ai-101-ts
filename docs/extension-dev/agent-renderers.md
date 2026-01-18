# Agent Renderer Extension Guide

This guide explains how to create and register custom visual representations for AI agents in the AI-101-TS extension.

## Table of Contents

- [Overview](#overview)
- [IAgentRenderer Interface](#iagentrenderer-interface)
- [Implementing a Custom Renderer](#implementing-a-custom-renderer)
- [Renderer Lifecycle](#renderer-lifecycle)
- [Performance Guidelines](#performance-guidelines)
- [Styling & Opting Out](#styling--opting-out)
- [Semantic Versioning and Deprecation Policy](#semantic-versioning-and-deprecation-policy)

## Overview

The AI-101-TS extension allows developers to customize how agents are visually represented in the transparent HUD. By implementing the `IAgentRenderer` interface, you can create:

- Custom 2D or 3D animations for agent states
- Specialized visualizations for specific agent types
- Entirely new aesthetic styles beyond the default Sumi-e look
- Data-rich agent displays with custom metrics

All renderers must follow strict performance guidelines to maintain the 60fps requirement of the transparent HUD.

## IAgentRenderer Interface

The `IAgentRenderer` interface defines the contract that all visual representations must follow:

```typescript
export interface IAgentRenderer {
    render(context: AgentRenderContext, container: HTMLElement, options?: RenderOptions): void;
    getSize(): { width: number; height: number };
    animate(transition: RenderTransition): void;
    destroy(): void;
    onStateUpdate(callback: StateUpdateCallback): IDisposable;
}
```

### Key Methods

| Method | Purpose | Required |
|--------|---------|----------|
| `render()` | Initialize DOM structure and draw agent | ✅ Yes |
| `getSize()` | Return dimensions for layout system | ✅ Yes |
| `animate()` | Trigger state transition animations | ✅ Yes |
| `destroy()` | Clean up DOM and resources | ✅ Yes |
| `onStateUpdate()` | Subscribe to state changes | ✅ Yes |

## Implementing a Custom Renderer

### Step 1: Create Your Renderer Class

Create a new TypeScript file for your renderer. It's recommended to use SVG or GPU-accelerated CSS for best performance.

```typescript
import { IAgentRenderer, AgentRenderContext, RenderTransition, IDisposable } from 'ai-101-ts';

export class MyCustomRenderer implements IAgentRenderer {
    private element?: HTMLElement;
    private stateSubscription?: IDisposable;

    render(context: AgentRenderContext, container: HTMLElement): void {
        this.element = document.createElement('div');
        this.element.className = 'my-custom-agent';
        this.element.innerHTML = `<span class="icon">${context.icon}</span>`;
        
        container.appendChild(this.element);
        
        // Subscribe to state updates
        this.stateSubscription = this.onStateUpdate((state) => {
            this.handleStateChange(state);
        });
    }

    getSize() {
        return { width: 64, height: 64 };
    }

    animate(transition: RenderTransition): void {
        if (!this.element) return;
        this.element.classList.add(`anim--${transition}`);
    }

    destroy(): void {
        this.stateSubscription?.dispose();
        this.element?.remove();
    }

    private handleStateChange(state: IAgentState): void {
        // Update visuals based on new state
    }
}
```

### Step 2: Handle Transitions

Implement the `animate()` method to provide visual feedback for state changes:

```typescript
animate(transition: RenderTransition): void {
    const el = this.element;
    if (!el) return;

    // Use CSS classes for GPU-accelerated animations
    el.classList.remove('state-idle', 'state-thinking', 'state-working');
    
    switch (transition) {
        case 'idle-to-thinking':
            el.classList.add('state-thinking');
            break;
        // ... handle other transitions
    }
}
```

## Renderer Lifecycle

### 1. Initialization (`render`)
The `render` method is called once when the agent is first displayed. You should create your DOM elements here.

### 2. Layout (`getSize`)
The extension calls `getSize` to determine where to place the agent in the HUD without overlapping other elements.

### 3. Interaction (`animate`)
Called whenever the agent changes status (e.g., from `idle` to `thinking`).

### 4. Updates (`onStateUpdate`)
The callback you provide to `onStateUpdate` will be invoked whenever the agent's internal state changes (e.g., new `currentTask` or `anchorLine`).

### 5. Cleanup (`destroy`)
Called when the agent is removed. You **must** remove your elements from the DOM and dispose of any subscriptions.

## Performance Guidelines

To maintain **60fps** in the transparent HUD, renderers MUST follow these rules:

1. **Use CSS Transforms**: Never animate `top`, `left`, `width`, or `height`. Use `transform: translate3d()` and `scale()`.
2. **Use `will-change`**: Apply `will-change: transform, opacity` to elements that animate frequently.
3. **Minimize Reflows**: Avoid reading DOM properties (like `offsetHeight`) during animations.
4. **Use RequestAnimationFrame**: If performing manual DOM updates, always wrap them in `requestAnimationFrame()`.
5. **Batch Updates**: If updating multiple elements, do it in a single pass.

## Styling & Opting Out

By default, agents are rendered with the **Sumi-e aesthetic** (brush strokes, ink bleeds, paper textures).

### Opting Out
If your custom renderer provides its own lighting and textures, check the `options.optOutDefaultStyling` flag in the `render()` method:

```typescript
render(context: AgentRenderContext, container: HTMLElement, options?: RenderOptions): void {
    if (options?.optOutDefaultStyling) {
        // Apply your own unique style
        container.classList.add('no-sumi-e');
    }
}
```

## Semantic Versioning and Deprecation Policy

The `IAgentRenderer` interface follows **semantic versioning (semver)**:

- **Major version (X.0.0)**: Breaking changes (removing methods, changing signatures).
- **Minor version (0.X.0)**: Backward-compatible additions (new optional methods).
- **Patch version (0.0.X)**: Bug fixes and documentation updates.

### Deprecation
Deprecated methods will be marked with `@deprecated` and remain functional for at least 2 minor versions before removal in the next major version.

---

**Last Updated**: 2026-01-18  
**API Version**: 0.0.1
