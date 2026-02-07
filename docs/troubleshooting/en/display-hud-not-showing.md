---
id: display-hud-not-showing
title: HUD Not Showing
category: DisplayIssues
symptoms:
  - hud not visible
  - agents missing
  - nothing showing
  - invisible
  - hidden
errorCodes:
  - AI101-UI-001
relatedDocs:
  - _bmad-output/planning-artifacts/architecture.md#webview
---

## Symptom Description

The transparent HUD with AI agents is not visible in the editor. The extension appears to be active, but no visual elements are displayed.

## Diagnosis Steps

1. **Check if extension is activated**
   - Look for "AI-101" in status bar
   - Run "AI 101: Toggle HUD" command
   
2. **Check Focus Mode status**
   - Focus Mode hides agents intentionally
   - Run "AI 101: Toggle Focus Mode"
   
3. **Verify webview panel exists**
   - Help > Toggle Developer Tools
   - Check for webview in Elements tab
   
4. **Check transparency settings**
   - HUD may be too transparent to see
   - Temporarily increase opacity

## Solutions

### Solution 1: Toggle HUD Visibility

```
1. Open Command Palette (Ctrl+Shift+P / Cmd+Shift+P)
2. Run "AI 101: Toggle HUD"
3. Or use keyboard shortcut: Ctrl+Alt+H (Cmd+Alt+H on Mac)
```

### Solution 2: Disable Focus Mode

Focus Mode intentionally hides agents.

```
1. Open Command Palette
2. Run "AI 101: Toggle Focus Mode"
3. Or use keyboard shortcut: Ctrl+Shift+Alt+F
```

### Solution 3: Increase Transparency Level

Make HUD more visible:

```json
{
  "ai101.ui.transparency": "full"  // Instead of "minimal"
}
```

### Solution 4: Reset Extension State

Clear extension state and restart:

```
1. Open Command Palette
2. Run "AI 101: Reset Configuration"
3. Reload VSCode window (Ctrl+R / Cmd+R)
```

### Solution 5: Check Webview Permissions

Ensure webviews are enabled:

```json
{
  "security.workspace.trust.enabled": true
}
```

### Solution 6: Reinstall Extension

If all else fails:

```
1. Uninstall AI-101 extension
2. Reload VSCode window
3. Reinstall extension from marketplace
4. Reload window again
```

## Prevention

- **Use keyboard shortcuts** - Ctrl+Alt+H to quickly toggle HUD
- **Avoid accidental Focus Mode** - Be aware of Ctrl+Shift+Alt+F shortcut
- **Set transparency to "medium"** - Balance between subtle and visible
- **Check status bar** - Verify extension is active
- **Regular extension updates** - Keep extension up to date

## Related Documentation

- [User Guide: HUD Overview](docs/user-guide.md#hud-overview)
- [Configuration: UI Settings](docs/configuration.md#ui-settings)
- [Architecture: Webview System](_bmad-output/planning-artifacts/architecture.md#webview)
