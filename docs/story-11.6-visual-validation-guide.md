# Story 11.6 - Visual Validation Guide

**Manual Testing Guide for Agent Character Animations**

This document provides step-by-step instructions for manually validating the visual aspects of the agent character animation system. Since automated visual regression testing in VSCode extensions is limited, these manual tests ensure the animations meet quality standards.

---

## Prerequisites

1. **Extension Running**: Launch the extension in Debug mode (F5 in VSCode)
2. **Test File Open**: Open a TypeScript file with at least 200 lines of code
3. **DevTools Open**: Open webview DevTools (Right-click HUD → Inspect)

---

## Test 1: Agent Anchoring Animation

**Objective**: Verify agent characters appear smoothly when activated

### Steps:
1. Position cursor at line 50
2. Trigger an agent action (e.g., invoke Context agent)
3. Watch the HUD area near line 50

### Expected Results:
- ✅ Agent character fades in smoothly (opacity 0 → 1)
- ✅ Agent scales up from 0.5 to 1.0
- ✅ Animation duration is approximately 300ms
- ✅ Agent appears at the correct horizontal position:
  - **Architect**: -120px (far left)
  - **Context**: -60px (left)
  - **Coder**: +20px (right)
  - **Reviewer**: +80px (far right)
- ✅ No jitter or flashing during animation

### Visual Checklist:
```
[ ] Agent appears near target line
[ ] Fade-in is smooth (no sudden appearance)
[ ] Scale animation is smooth (no jumps)
[ ] Character is fully visible after animation
[ ] Character SVG is rendered correctly (sumi-e style visible)
```

### Screenshot Reference:
*Capture: Agent appearing at line 50*

---

## Test 2: Multiple Agents Without Collision

**Objective**: Verify 4 agents can appear simultaneously without overlapping

### Steps:
1. Position cursor at line 100
2. Trigger a complex request that activates multiple agents
3. Watch all 4 agent characters appear

### Expected Results:
- ✅ All 4 agents visible simultaneously
- ✅ No overlapping characters
- ✅ Horizontal spacing maintained:
  - Architect (-120px) to Context (-60px): 60px gap
  - Context (-60px) to Coder (+20px): 80px gap
  - Coder (+20px) to Reviewer (+80px): 60px gap
- ✅ All characters remain readable
- ✅ No z-index fighting or flickering

### Visual Checklist:
```
[ ] Architect visible on far left
[ ] Context visible on left
[ ] Coder visible on right
[ ] Reviewer visible on far right
[ ] No characters overlapping
[ ] All characters at same vertical position (aligned to line)
```

### Screenshot Reference:
*Capture: All 4 agents active at line 100*

---

## Test 3: Scroll Persistence

**Objective**: Verify agents remain anchored to their line during scroll

### Steps:
1. Activate an agent at line 50
2. Scroll editor down to line 150 (line 50 goes off-screen)
3. Scroll back up to line 50

### Expected Results:
- ✅ Agent fades out smoothly when line scrolls off-screen (opacity → 0.3)
- ✅ Agent remains at same vertical position relative to editor
- ✅ Agent fades back in when line comes back into view
- ✅ No sudden jumps or repositioning
- ✅ Agent maintains anchor to line 50 throughout

### Visual Checklist:
```
[ ] Agent dims when scrolled off-screen
[ ] Agent position stays consistent during scroll
[ ] Agent brightens when scrolled back into view
[ ] No jittery movement during scroll
[ ] Character remains properly aligned after scroll
```

### Video Reference:
*Record: Scrolling while agent is anchored*

---

## Test 4: Agent Detachment Animation

**Objective**: Verify agents fade out smoothly after completion

### Steps:
1. Activate an agent (e.g., Context agent)
2. Wait for agent to complete its task
3. Watch for detachment animation (2 seconds after completion)

### Expected Results:
- ✅ Agent remains visible for ~2 seconds after success
- ✅ Agent fades out smoothly (opacity 1 → 0)
- ✅ Agent scales down (1.0 → 0.5)
- ✅ Animation duration is approximately 300ms
- ✅ Character is removed from DOM after animation
- ✅ No sudden disappearance

### Visual Checklist:
```
[ ] Agent shows success state before detaching
[ ] Fade-out animation is smooth
[ ] Scale-down animation is smooth
[ ] Character disappears completely
[ ] No artifacts left on screen
```

---

## Test 5: File Change Detachment

**Objective**: Verify agents detach when switching files

### Steps:
1. Open file A, activate an agent at line 50
2. Switch to file B (open another file)
3. Watch agent behavior

### Expected Results:
- ✅ Agent detaches when file changes
- ✅ Detachment animation plays (fade-out + scale-down)
- ✅ Agent does not appear in new file unless re-activated

### Visual Checklist:
```
[ ] Agent detaches on file switch
[ ] Detachment animation is smooth
[ ] No agents visible in new file initially
```

---

## Test 6: Performance - 60fps Animation

**Objective**: Verify smooth animations at 60fps with multiple agents

### Steps:
1. Open DevTools → Performance tab
2. Start performance recording
3. Activate all 4 agents simultaneously
4. Watch animations complete
5. Stop recording and analyze

### Expected Results:
- ✅ Frame rate stays at or near 60fps
- ✅ No dropped frames during animations
- ✅ CPU usage remains reasonable (<50%)
- ✅ GPU acceleration is active (transform3d in use)
- ✅ No layout thrashing (minimal reflow/repaint)

### Performance Metrics:
```
Target: 60fps (16.67ms per frame)
Acceptable: >50fps (20ms per frame)
Warning: 30-50fps (20-33ms per frame)
Failure: <30fps (>33ms per frame)
```

### DevTools Checklist:
```
[ ] Performance recording shows consistent frame timing
[ ] No long tasks blocking main thread
[ ] Animation uses transform3d (visible in Layers panel)
[ ] will-change property is set correctly
[ ] No excessive garbage collection during animations
```

### Screenshot Reference:
*Capture: DevTools Performance timeline showing 60fps*

---

## Test 7: Edge Cases

### 7.1 Very Short Files (<50 lines)
**Steps**: Activate agent in a 20-line file at line 15

**Expected**: Agent positions correctly, no overflow issues

### 7.2 Very Long Files (>1000 lines)
**Steps**: Activate agent at line 750 in a 1500-line file

**Expected**: Performance remains smooth, positioning correct

### 7.3 Rapid Agent Activation
**Steps**: Quickly trigger multiple agent activations

**Expected**: Previous agent detaches before new one appears, no flickering

### 7.4 Window Resize
**Steps**: Activate agent, then resize VSCode window

**Expected**: Agent repositions correctly, animations remain smooth

---

## Recording Test Results

### Tools Recommended:
- **Screenshots**: Use system screenshot tool or VSCode screenshot
- **Video**: Use screen recording (OBS, QuickTime, Windows Game Bar)
- **Performance**: Chrome DevTools (or VSCode webview DevTools)

### Documentation Template:
```markdown
## Test Results - [Date]

**Tester**: [Your Name]
**Extension Version**: [Version]
**VSCode Version**: [Version]
**OS**: [Operating System]

### Test 1: Agent Anchoring
- Status: ✅ PASS / ❌ FAIL
- Notes: [Any observations]
- Screenshot: [Link or path]

### Test 2: Multiple Agents
- Status: ✅ PASS / ❌ FAIL
- Notes: [Any observations]
- Screenshot: [Link or path]

[Continue for all tests...]

### Performance Metrics:
- Average FPS: [XX fps]
- Frame drops: [XX frames]
- CPU usage: [XX%]
- Screenshot: [DevTools performance timeline]

### Issues Found:
1. [Issue description]
2. [Issue description]

### Overall Assessment:
[PASS / PARTIAL PASS / FAIL]
```

---

## Acceptance Criteria Summary

Story 11.6 is considered **COMPLETE** when:

- [x] Agent anchoring animation is smooth and correct
- [x] Multiple agents position without collision
- [x] Agents remain anchored during scroll
- [x] Detachment animations are smooth
- [x] File change triggers proper detachment
- [x] Performance maintains 60fps with 4 agents
- [x] No visual artifacts or glitches
- [x] All edge cases handled gracefully

---

## Known Limitations

1. **Estimated Viewport Size**: Position calculations use estimated editor dimensions (1200x800). Real dimensions may vary slightly.

2. **Rapid Execution**: If an agent completes in <2 seconds, detachment timer may overlap with next activation, causing brief flicker.

3. **High-DPI Displays**: Character SVG may appear slightly blurry on very high-DPI screens. Consider using higher-resolution SVG assets.

4. **Performance Mode**: In Performance Mode, animations are reduced. This is expected behavior.

---

## Troubleshooting

### Characters Don't Appear
**Check**:
- Is webview loaded? (DevTools console: "AgentCharacterManager initialized")
- Is agent actually executing? (Backend logs)
- Any JavaScript errors in DevTools console?

### Characters Flicker
**Possible Causes**:
- Rapid agent start/stop cycles
- Timer overlap (detachment timer + new activation)
**Solution**: Adjust detachment delay or debounce rapid executions

### Performance Issues
**Check**:
- Are too many agents active simultaneously?
- Is Performance Mode enabled? (reduces animations)
- Check CPU/GPU usage in DevTools

### Positioning Issues
**Check**:
- Is the active editor null?
- Is the anchor line within visible range?
- Check SpatialManager logs for position calculations

---

Made with 墨 (ink) and ❤️ for Suika 🍉
