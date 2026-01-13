# AI-101 Sumi-e HUD Design System

## Philosophy
The visual language of AI-101 is inspired by **Sumi-e** (Japanese ink wash painting). It emphasizes simplicity, spontaneity, and the beauty of imperfection.

### Core Principles
- **Ma (間)**: Negative space is as important as the content. We prioritize empty space to avoid visual clutter and maintain focus.
- **Wabi-sabi**: Embracing the organic, hand-drawn look of brush strokes over perfect geometric shapes.
- **Transparency**: The UI should feel like vapor—visible but not obstructive.

## Color Palette
- **Sumi Ink (`#1a1a1a`)**: Used for text and primary brush strokes.
- **Washi White (`rgba(255, 255, 255, 0.9)`)**: Used for subtle backgrounds and containers.
- **Vermilion (`#c0392b`)**: The single accent color for urgent alerts and critical markers.

## Typography
- **Primary Font**: Outfit / Inter (Clean sans-serif).
- **Style**: Light weights (300/400) to maintain a delicate feel.

## Visual Elements
- **Brush Strokes**: Every container or icon should look like it was created with 2-5 brush strokes maximum.
- **Animations**: Easing should be organic. Use pulse and fade transitions to simulate the flow of ink.
- **HUD Layout**: Floating elements that automatically avoid the cursor to respect the developer's space.

## Implementation Details
- Styles are defined in `src/webview/sumi-e.css`.
- Transparency is achieved via absolute positioning and low-alpha colors (`rgba`).
- PostMessage synchronization ensures the UI state reflects the backend "single source of truth".
