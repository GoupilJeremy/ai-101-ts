# Story 5.7: Implement High Contrast Mode for Accessibility

Status: in-progress

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer with visual impairments,
I want High Contrast Mode that maintains 60% minimum opacity and strong colors,
So that I can clearly see the HUD elements without straining.

## Acceptance Criteria

1. **Given** Visual system is implemented (Epic 4)
2. **When** High Contrast Mode is enabled (via VSCode accessibility settings integration)
3. **Then** All HUD elements use minimum 60% opacity (NFR8 requirement)
4. **And** Sumi-e aesthetic maintained with stronger, bolder brush strokes
5. **And** Color contrast ratios meet WCAG AAA standards (7:1 minimum)
6. **And** Accent color adjusted to high-contrast alternative
7. **And** Text readability enhanced: larger font sizes, stronger weights
8. **And** Agent state indicators use both color AND shape (redundant coding)
9. **And** Alert severity visible without color dependence (icons, borders, patterns)
10. **And** High Contrast Mode activates automatically when VSCode High Contrast theme detected
11. **And** User can manually toggle High Contrast Mode independent of VSCode theme
12. **And** Unit tests verify contrast ratios and opacity values

## Tasks / Subtasks

- [ ] Task 1: High Contrast Mode Infrastructure (AC: 1, 2)
  - [ ] 1.1: Add 'highContrast' to AgentMode enum or create separate accessibility setting
  - [ ] 1.2: Create IHighContrastConfig interface with opacity, colors, fonts
  - [ ] 1.3: Integrate with VSCode accessibility settings API
  - [ ] 1.4: Create high-contrast-manager.ts for mode coordination

- [ ] Task 2: Minimum 60% Opacity Enforcement (AC: 3)
  - [ ] 2.1: Create mode-high-contrast.css with opacity overrides
  - [ ] 2.2: Set all HUD elements to minimum opacity: 0.6
  - [ ] 2.3: Override Performance Mode opacity settings when High Contrast enabled
  - [ ] 2.4: Apply to: agent icons, alerts, vital signs bar, labels

- [ ] Task 3: Bold Sumi-e Aesthetic (AC: 4)
  - [ ] 3.1: Create high-contrast brush stroke SVG variants (thicker strokes)
  - [ ] 3.2: Increase border-width from 1px to 2px for all elements
  - [ ] 3.3: Add stronger text-shadow for ideogram readability
  - [ ] 3.4: Maintain minimalist aesthetic while improving visibility

- [ ] Task 4: WCAG AAA Color Contrast (AC: 5, 6)
  - [ ] 4.1: Define high-contrast color palette with 7:1 minimum ratio
  - [ ] 4.2: Replace --sumi-ink (#1a1a1a) with pure black (#000000)
  - [ ] 4.3: Replace --washi-white with pure white (#ffffff)
  - [ ] 4.4: Replace --sumi-accent with high-contrast vermilion (#ff0000)
  - [ ] 4.5: Verify contrast ratios using WebAIM contrast checker algorithm

- [ ] Task 5: Enhanced Text Readability (AC: 7)
  - [ ] 5.1: Increase base font size from 10px to 14px in High Contrast
  - [ ] 5.2: Apply font-weight: 600 (semi-bold) to all text
  - [ ] 5.3: Increase letter-spacing for improved readability
  - [ ] 5.4: Ensure all text meets WCAG AAA large text standards

- [ ] Task 6: Redundant Coding for Agent States (AC: 8)
  - [ ] 6.1: Add shape indicators to agent status (circle=idle, triangle=thinking, square=working)
  - [ ] 6.2: Use both color AND shape for state communication
  - [ ] 6.3: Add visual indicator shapes via CSS ::before pseudo-elements
  - [ ] 6.4: Ensure shapes are visible independent of color perception

- [ ] Task 7: Alert Severity Without Color Dependence (AC: 9)
  - [ ] 7.1: Add distinct border patterns: solid (info), dashed (warning), double (critical), dotted (urgent)
  - [ ] 7.2: Add icon differentiation: ℹ (info), ⚠ (warning), ⛔ (critical), 🔥 (urgent)
  - [ ] 7.3: Add size variation: progressively larger for higher severity
  - [ ] 7.4: Ensure severity distinguishable without color

- [ ] Task 8: VSCode Theme Detection (AC: 10)
  - [ ] 8.1: Listen for vscode.window.activeColorTheme changes
  - [ ] 8.2: Detect High Contrast theme via colorTheme.kind === ColorThemeKind.HighContrast
  - [ ] 8.3: Auto-enable High Contrast Mode when VSCode HC theme detected
  - [ ] 8.4: Auto-disable when switching to non-HC theme (user can override)

- [ ] Task 9: Manual Toggle Command (AC: 11)
  - [ ] 9.1: Add 'ai-101-ts.toggleHighContrast' command to package.json
  - [ ] 9.2: Create toggle-high-contrast.ts command handler
  - [ ] 9.3: Store manual override preference in workspace settings
  - [ ] 9.4: Manual setting takes precedence over auto-detection

- [ ] Task 10: Unit Tests (AC: 12)
  - [ ] 10.1: Test opacity values are >= 0.6 in High Contrast Mode
  - [ ] 10.2: Test color contrast ratios meet 7:1 minimum
  - [ ] 10.3: Test VSCode HC theme auto-detection
  - [ ] 10.4: Test manual toggle overrides auto-detection
  - [ ] 10.5: Test redundant coding (shape + color) for agent states

## Dev Notes

### Critical Implementation Context

**🔥 PREVENT THESE MISTAKES:**
- ❌ Do NOT use opacity < 0.6 in High Contrast Mode - NFR8 requirement
- ❌ Do NOT rely on color alone for state/severity - must use redundant coding
- ❌ Do NOT use contrast ratio < 7:1 - WCAG AAA requirement
- ❌ Do NOT override user's manual HC preference with auto-detection
- ❌ Do NOT break Performance Mode optimizations when HC is enabled

**✅ SUCCESS PATTERNS FROM PREVIOUS STORIES:**
- Story 5.1: ModeManager.getInstance() for mode coordination
- Story 5.4: CSS data-mode attributes for styling
- Story 5.5: data-large-text pattern for conditional styles
- Story 5.6: VSCode configuration settings pattern

### Architecture Requirements (MUST FOLLOW)

**File Structure:**
- `src/accessibility/high-contrast-manager.ts` - NEW: HC mode coordination
- `src/commands/toggle-high-contrast.ts` - NEW: Manual toggle command
- `src/webview/styles/components/mode-high-contrast.css` - NEW: HC styles
- `src/webview/main.ts` - Add HC mode handling
- `package.json` - Add toggleHighContrast command and settings

**High Contrast Configuration:**
```typescript
interface IHighContrastConfig {
  enabled: boolean;
  minOpacity: 0.6;
  colorPalette: {
    ink: '#000000';      // Pure black
    paper: '#ffffff';    // Pure white
    accent: '#ff0000';   // High-contrast red
  };
  fontSize: 14;          // Larger base font
  fontWeight: 600;       // Semi-bold
  borderWidth: 2;        // Thicker borders
}
```

**VSCode Theme Detection Pattern:**
```typescript
import * as vscode from 'vscode';

class HighContrastManager {
  private autoDetectionEnabled = true;
  private manualOverride: boolean | undefined;

  constructor() {
    // Listen for theme changes
    vscode.window.onDidChangeActiveColorTheme(this.handleThemeChange.bind(this));
  }

  private handleThemeChange(theme: vscode.ColorTheme): void {
    if (this.manualOverride !== undefined) {
      // User has manually set preference, don't auto-change
      return;
    }

    const isHighContrast = theme.kind === vscode.ColorThemeKind.HighContrast ||
                           theme.kind === vscode.ColorThemeKind.HighContrastLight;

    this.setHighContrastMode(isHighContrast);
  }

  public toggleManual(): void {
    const currentState = this.isHighContrastEnabled();
    this.manualOverride = !currentState;
    this.setHighContrastMode(this.manualOverride);
  }
}
```

**High Contrast CSS Pattern:**
```css
/* High Contrast Mode Styles */
.high-contrast-mode {
  --sumi-ink: #000000;
  --washi-white: #ffffff;
  --sumi-accent: #ff0000;
}

.high-contrast-mode * {
  opacity: 1 !important; /* Override any lower opacity */
}

.high-contrast-mode .agent-icon,
.high-contrast-mode .alert-component,
.high-contrast-mode #vital-signs-bar {
  min-opacity: 0.6;
  opacity: 0.9 !important;
  border-width: 2px;
  font-weight: 600;
}

/* Larger text for readability */
.high-contrast-mode {
  font-size: 14px;
  letter-spacing: 0.05em;
}

/* Redundant coding: Shape indicators for agent states */
.high-contrast-mode .agent-icon.idle::before {
  content: '○'; /* Circle = idle */
  position: absolute;
  top: -8px;
  font-size: 10px;
}

.high-contrast-mode .agent-icon.thinking::before {
  content: '△'; /* Triangle = thinking */
}

.high-contrast-mode .agent-icon.working::before {
  content: '□'; /* Square = working */
}

.high-contrast-mode .agent-icon.success::before {
  content: '✓'; /* Checkmark = success */
}

/* Alert severity patterns (not color-dependent) */
.high-contrast-mode .alert-info {
  border-style: solid;
  border-width: 2px;
}

.high-contrast-mode .alert-warning {
  border-style: dashed;
  border-width: 2px;
}

.high-contrast-mode .alert-critical {
  border-style: double;
  border-width: 4px;
}

.high-contrast-mode .alert-urgent {
  border-style: dotted;
  border-width: 3px;
}
```

**WCAG AAA Contrast Verification:**
```typescript
function calculateContrastRatio(foreground: string, background: string): number {
  const getLuminance = (hex: string): number => {
    const rgb = hexToRgb(hex);
    const [r, g, b] = rgb.map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

// WCAG AAA requires 7:1 for normal text, 4.5:1 for large text
const WCAG_AAA_RATIO = 7;
```

### Learnings from Previous Stories

**From Story 5.1 (Mode Infrastructure):**
- ModeManager singleton pattern for coordination
- Mode persistence via VSCode workspace config
- Event emitter for mode change notifications

**From Story 5.4 (Focus Mode):**
- CSS data-mode attributes for conditional styling
- Smooth transitions between modes
- Integration with VSCode theme system

**From Story 5.5 (Team Mode):**
- data-large-text attribute pattern for conditional scaling
- Command registration pattern in extension.ts

**From Story 5.6 (Performance Mode):**
- CSS-only approach works well for mode styling
- Graceful degradation pattern (HC + Performance should coexist)
- Configuration settings in package.json

### Testing Strategy

**Unit Tests Required:**
- High Contrast Mode activation and config verification
- Opacity values >= 0.6 in all HC elements
- Color contrast ratios meet 7:1 minimum (calculated programmatically)
- VSCode HC theme auto-detection
- Manual toggle command functionality
- Redundant coding (shape indicators present)
- Alert severity distinguishable without color

**Test Files:**
- `src/accessibility/__tests__/high-contrast-manager.test.ts` - Manager tests
- `src/accessibility/__tests__/contrast-calculator.test.ts` - WCAG ratio tests
- `src/webview/__tests__/high-contrast-mode.test.ts` - CSS/UI tests

### Project Structure Notes

**New Files:**
- `src/accessibility/high-contrast-manager.ts` - HC mode coordination
- `src/accessibility/contrast-calculator.ts` - WCAG contrast verification
- `src/commands/toggle-high-contrast.ts` - Manual toggle command
- `src/webview/styles/components/mode-high-contrast.css` - HC styles
- Test files for all new modules

**Modified Files:**
- `src/webview/main.ts` - Add HC mode class toggling
- `src/extension.ts` - Register HC command and theme listener
- `package.json` - Add command and configuration settings
- `src/webview/webview-provider.ts` - Send HC state to webview

**Package.json Settings to Add:**
```json
{
  "ai101.accessibility.highContrast": {
    "type": "boolean",
    "default": null,
    "description": "Enable High Contrast Mode. Set to null for auto-detection based on VSCode theme."
  },
  "ai101.accessibility.autoDetectHighContrast": {
    "type": "boolean",
    "default": true,
    "description": "Automatically enable High Contrast Mode when VSCode High Contrast theme is active."
  }
}
```

### Performance Requirements

- High Contrast CSS should have minimal performance impact
- Shape indicators use CSS pseudo-elements (no JS overhead)
- Theme detection uses VSCode API (event-driven, not polling)
- Coexist with Performance Mode without conflicts

### Accessibility Requirements (CRITICAL)

- **WCAG AAA compliance** for all text (7:1 contrast ratio)
- **Redundant coding** - never rely on color alone
- **Minimum 60% opacity** (NFR8) for all interactive elements
- **Keyboard accessible** - HC toggle must be keyboard-triggerable
- **Screen reader friendly** - state changes announced via ARIA

### References

- [Source: _bmad-output/planning-artifacts/epics-stories-part3.md#Story 5.7]
- [Architecture: _bmad-output/planning-artifacts/architecture.md - Accessibility NFRs]
- [Previous Story: _bmad-output/implementation-artifacts/5-6-implement-performance-mode-for-low-end-machines.md]
- [Project Context: _bmad-output/project-context.md]
- [WCAG AAA Guidelines: https://www.w3.org/WAI/WCAG21/Understanding/contrast-enhanced.html]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

