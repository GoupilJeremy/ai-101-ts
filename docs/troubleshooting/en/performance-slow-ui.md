---
id: performance-slow-ui
title: UI Performance Issues
category: Performance
symptoms:
  - slow
  - lag
  - choppy
  - fps
  - stuttering
  - janky
errorCodes:
  - AI101-PERF-001
relatedDocs:
  - _bmad-output/planning-artifacts/architecture.md#performance
---

## Symptom Description

The HUD animations appear choppy, the UI responds slowly, or you notice stuttering when agents update their status. The extension may feel sluggish or unresponsive.

## Diagnosis Steps

1. **Check CPU usage** in VSCode Developer Tools (Help > Toggle Developer Tools)
   - Look for high CPU usage (>80%) when AI-101 is active
   
2. **Check FPS counter** (if available in debug mode)
   - Target is 60fps for smooth animations
   
3. **Count active extensions**
   - Too many extensions can impact performance
   - Run `Extensions: Show Installed Extensions` command
   
4. **Check system resources**
   - Open Task Manager (Windows) or Activity Monitor (Mac)
   - Verify available RAM and CPU capacity

## Solutions

### Solution 1: Enable Performance Mode

Performance Mode reduces animation complexity and throttles updates.

```
1. Open Command Palette (Ctrl+Shift+P / Cmd+Shift+P)
2. Run "AI 101: Toggle Performance Mode"
3. Restart VSCode if issues persist
```

**Settings:**
```json
{
  "ai101.performanceMode.autoActivate": true,
  "ai101.performanceMode.collisionThrottleMs": 500,
  "ai101.performanceMode.metricsThrottleMs": 1000
}
```

### Solution 2: Reduce Transparency

Lower transparency levels reduce GPU load.

```
1. Open Settings (Ctrl+, / Cmd+,)
2. Search for "ai101.ui.transparency"
3. Set to "minimal" instead of "full"
```

### Solution 3: Disable Other Extensions

Temporarily disable other extensions to identify conflicts.

```
1. Open Extensions view (Ctrl+Shift+X / Cmd+Shift+X)
2. Disable extensions one by one
3. Reload window after each change
4. Identify which extension causes the issue
```

### Solution 4: Update Graphics Drivers

Outdated graphics drivers can cause rendering issues.

- **Windows:** Update via Device Manager or manufacturer website
- **Mac:** Update via System Preferences > Software Update
- **Linux:** Update via package manager (varies by distribution)

## Prevention

- **Keep extensions count low** - Only install extensions you actively use
- **Enable auto Performance Mode** - Set `ai101.performanceMode.autoActivate: true`
- **Use Focus Mode when coding** - Hides agents to reduce visual complexity
- **Close unused VSCode windows** - Each window consumes resources
- **Restart VSCode daily** - Clears memory leaks from long-running sessions

## Related Documentation

- [Architecture: Performance Requirements](_bmad-output/planning-artifacts/architecture.md#performance)
- [User Guide: Performance Mode](docs/user-guide.md#performance-mode)
- [Configuration Reference](docs/configuration.md#performance-settings)
