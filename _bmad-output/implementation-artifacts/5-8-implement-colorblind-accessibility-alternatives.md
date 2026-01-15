# Story 5.8: Implement Colorblind Accessibility Alternatives

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a colorblind developer,
I want alternative visual encodings using patterns and shapes,
so that I can distinguish alert levels and agent states without relying on color.

## Acceptance Criteria

1. **Given** Alert system and agent visualizations are implemented
2. **When** Colorblind mode is enabled
3. **Then** Alert severity levels use distinct stroke patterns (solid, dashed, dotted, double)
4. **And** Agent states use distinct shape variations (circle, square, triangle, diamond)
5. **And** Icon ideograms include texture patterns in addition to color
6. **And** Vital Signs Bar metrics use pattern fills instead of color coding
7. **And** Color palette adjusted to colorblind-safe alternatives (tested with simulators)
8. **And** Supports deuteranopia, protanopia, and tritanopia color blindness types
9. **And** User selects colorblind type in settings for optimized palette
10. **And** Colorblind mode combines with High Contrast mode gracefully
11. **And** Documentation includes colorblind-safe screenshots and descriptions
12. **And** Unit tests verify pattern rendering and alternative visual encodings

## Tasks / Subtasks

- [ ] Task 1: Colorblind Mode Infrastructure (AC: 1, 2)
  - [ ] 1.1: Add 'colorblind' to AgentMode enum or create separate accessibility setting
  - [ ] 1.2: Create IColorblindConfig interface with colorblind types and pattern mappings
  - [ ] 1.3: Integrate with VSCode accessibility settings API
  - [ ] 1.4: Create colorblind-manager.ts for mode coordination
  - [ ] 1.5: Add colorblind type selection to settings (deuteranopia, protanopia, tritanopia)

- [ ] Task 2: Alert Severity Pattern Encoding (AC: 3)
  - [ ] 2.1: Create CSS pattern classes for alert severities (solid, dashed, dotted, double)
  - [ ] 2.2: Implement stroke pattern variations in mode-colorblind.css
  - [ ] 2.3: Add pattern overlays to alert components
  - [ ] 2.4: Ensure patterns are visible independent of color perception

- [ ] Task 3: Agent State Shape Variations (AC: 4)
  - [ ] 3.1: Define shape mappings for agent states (circle=idle, square=thinking, triangle=working, diamond=alert)
  - [ ] 3.2: Create CSS shape indicators using ::before pseudo-elements
  - [ ] 3.3: Implement shape variations in agent component styles
  - [ ] 3.4: Add shape indicators to agent icons and status displays

- [ ] Task 4: Icon Ideogram Texture Patterns (AC: 5)
  - [ ] 4.1: Design texture patterns for ideograms (dots, stripes, crosshatch, waves)
  - [ ] 4.2: Create SVG texture overlays for agent icons
  - [ ] 4.3: Implement texture pattern CSS classes
  - [ ] 4.4: Add texture patterns to icon rendering

- [ ] Task 5: Vital Signs Pattern Fills (AC: 6)
  - [ ] 5.1: Create pattern fill CSS for vital signs metrics
  - [ ] 5.2: Implement pattern variations for different metric types
  - [ ] 5.3: Add pattern fills to vital signs bar components
  - [ ] 5.4: Ensure patterns distinguish metrics without color dependence

- [ ] Task 6: Colorblind-Safe Color Palette (AC: 7, 8, 9)
  - [ ] 6.1: Research and implement colorblind-safe color palettes
  - [ ] 6.2: Create palette variations for deuteranopia, protanopia, tritanopia
  - [ ] 6.3: Implement colorblind type detection and palette switching
  - [ ] 6.4: Test palettes with colorblind simulators
  - [ ] 6.5: Add colorblind type selection to VSCode settings

- [ ] Task 7: High Contrast + Colorblind Integration (AC: 10)
  - [ ] 7.1: Ensure colorblind patterns work with high contrast mode
  - [ ] 7.2: Test pattern visibility in high contrast scenarios
  - [ ] 7.3: Implement graceful combination of both accessibility modes
  - [ ] 7.4: Verify WCAG compliance with combined modes

- [ ] Task 8: Documentation and Testing (AC: 11, 12)
  - [ ] 8.1: Create colorblind-safe screenshots for documentation
  - [ ] 8.2: Document colorblind mode usage and benefits
  - [ ] 8.3: Write unit tests for pattern rendering
  - [ ] 8.4: Write unit tests for colorblind palette application
  - [ ] 8.5: Write integration tests for mode switching

## Dev Notes

### Critical Implementation Context

**🔥 PREVENT THESE MISTAKES:**
- ❌ Do NOT rely on color alone for any visual distinction - must use patterns/shapes
- ❌ Do NOT use colorblind-unsafe color combinations (red/green, blue/purple)
- ❌ Do NOT implement patterns that are too subtle or hard to distinguish
- ❌ Do NOT forget to test with actual colorblind simulators
- ❌ Do NOT break existing functionality when adding colorblind mode

**✅ SUCCESS PATTERNS FROM PREVIOUS STORIES:**
- Story 5.1: ModeManager.getInstance() for mode coordination
- Story 5.4: CSS data-mode attributes for styling
- Story 5.5: data-large-text pattern for conditional styles
- Story 5.6: VSCode configuration settings pattern
- Story 5.7: Accessibility manager pattern with WCAG compliance

### Architecture Requirements (MUST FOLLOW)

**File Structure:**
- `src/accessibility/colorblind-manager.ts` - NEW: Colorblind mode coordination
- `src/webview/styles/components/mode-colorblind.css` - NEW: Colorblind styles
- `src/webview/main.ts` - Add colorblind mode class toggling
- `package.json` - Add colorblind settings
- `src/webview/webview-provider.ts` - Send colorblind state to webview

**Colorblind Configuration:**
```typescript
interface IColorblindConfig {
  enabled: boolean;
  type: 'deuteranopia' | 'protanopia' | 'tritanopia' | 'none';
  patterns: {
    alertInfo: 'solid';
    alertWarning: 'dashed';
    alertCritical: 'dotted';
    alertUrgent: 'double';
  };
  shapes: {
    agentIdle: 'circle';
    agentThinking: 'square';
    agentWorking: 'triangle';
    agentAlert: 'diamond';
  };
}
```

**Colorblind-Safe Color Palettes:**
```css
/* Deuteranopia (red-green color blindness) */
.colorblind-deuteranopia {
  --agent-color-architect: #0072B2;  /* Blue instead of red */
  --agent-color-coder: #009E73;     /* Green safe */
  --agent-color-reviewer: #D55E00;  /* Orange instead of red */
  --agent-color-context: #CC79A7;   /* Pink instead of purple */
}

/* Protanopia (red color blindness) */
.colorblind-protanopia {
  --agent-color-architect: #56B4E9;  /* Light blue */
  --agent-color-coder: #009E73;     /* Green */
  --agent-color-reviewer: #E69F00;  /* Yellow-orange */
  --agent-color-context: #0072B2;   /* Blue */
}

/* Tritanopia (blue color blindness) */
.colorblind-tritanopia {
  --agent-color-architect: #D55E00;  /* Orange */
  --agent-color-coder: #E69F00;     /* Yellow */
  --agent-color-reviewer: #009E73;  /* Green */
  --agent-color-context: #56B4E9;   /* Light blue */
}
```

**Pattern CSS Implementation:**
```css
/* Alert severity patterns */
.colorblind-mode .alert-info {
  border-style: solid;
  border-width: 2px;
}

.colorblind-mode .alert-warning {
  border-style: dashed;
  border-width: 2px;
}

.colorblind-mode .alert-critical {
  border-style: dotted;
  border-width: 2px;
}

.colorblind-mode .alert-urgent {
  border-style: double;
  border-width: 4px;
}

/* Agent state shapes */
.colorblind-mode .agent-icon.idle::before {
  content: '○'; /* Circle */
  position: absolute;
  top: -8px;
  font-size: 10px;
}

.colorblind-mode .agent-icon.thinking::before {
  content: '□'; /* Square */
}

.colorblind-mode .agent-icon.working::before {
  content: '△'; /* Triangle */
}

.colorblind-mode .agent-icon.alert::before {
  content: '◆'; /* Diamond */
}
```

### Learnings from Previous Stories

**From Story 5.7 (High Contrast Mode):**
- Accessibility manager pattern with centralized coordination
- WCAG compliance verification with programmatic checks
- Integration with VSCode accessibility settings
- Combination with other modes (Performance + High Contrast)
- CSS variable overrides for theme switching

**From Story 5.5 (Team Mode):**
- Settings-based configuration for user preferences
- CSS class toggling for mode-specific styling
- Documentation requirements for accessibility features

**From Story 5.4 (Focus Mode):**
- Mode state persistence and restoration
- User preference override of automatic detection

### Testing Strategy

**Unit Tests Required:**
- Colorblind mode activation and config verification
- Pattern rendering for alerts and agents
- Colorblind palette application and color safety
- Shape indicator visibility and positioning
- Integration with High Contrast mode
- VSCode settings integration

**Test Files:**
- `src/accessibility/__tests__/colorblind-manager.test.ts` - Manager tests
- `src/webview/__tests__/colorblind-mode.test.ts` - CSS/UI tests
- `src/accessibility/__tests__/colorblind-palettes.test.ts` - Palette tests

### Project Structure Notes

**New Files:**
- `src/accessibility/colorblind-manager.ts` - Colorblind mode coordination
- `src/accessibility/colorblind-palettes.ts` - Colorblind-safe color definitions
- `src/webview/styles/components/mode-colorblind.css` - Colorblind styles
- Test files for all new modules

**Modified Files:**
- `src/webview/main.ts` - Add colorblind mode class toggling
- `src/extension.ts` - Register colorblind settings
- `package.json` - Add colorblind configuration settings
- `src/webview/webview-provider.ts` - Send colorblind state to webview

**Package.json Settings to Add:**
```json
{
  "ai101.accessibility.colorblind": {
    "type": "object",
    "properties": {
      "enabled": {
        "type": "boolean",
        "default": false,
        "description": "Enable Colorblind Accessibility Mode"
      },
      "type": {
        "type": "string",
        "enum": ["none", "deuteranopia", "protanopia", "tritanopia"],
        "default": "none",
        "description": "Type of color blindness to optimize for"
      }
    },
    "description": "Colorblind accessibility settings"
  }
}
```

### Performance Requirements

- Colorblind CSS should have minimal performance impact
- Pattern rendering uses CSS only (no JavaScript overhead)
- Palette switching is instant (CSS variable changes)
- Compatible with High Contrast and Performance modes

### Accessibility Requirements (CRITICAL)

- **Colorblind-safe colors** - Tested with simulators for all 3 types
- **Pattern redundancy** - Never rely on color alone
- **Shape indicators** - Clear geometric shapes for state communication
- **Texture patterns** - Additional visual cues for icons
- **User selection** - Allow users to choose their specific colorblind type
- **Documentation** - Clear instructions and visual examples

### References

- [Source: _bmad-output/planning-artifacts/epics-stories-part3.md#Story 5.8]
- [Architecture: _bmad-output/planning-artifacts/architecture.md - Accessibility NFRs]
- [Previous Story: _bmad-output/implementation-artifacts/5-7-implement-high-contrast-mode-for-accessibility.md]
- [Project Context: _bmad-output/project-context.md]
- [WCAG Guidelines: https://www.w3.org/WAI/WCAG21/Understanding/use-of-color.html]
- [Colorblind Simulators: https://www.color-blindness.com/coblis-color-blindness-simulator/]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List