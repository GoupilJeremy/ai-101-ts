---
id: display-blank-webview
title: Blank Webview Screen
category: DisplayIssues
symptoms:
  - blank screen
  - white screen
  - empty
  - nothing loads
  - webview blank
errorCodes:
  - AI101-UI-002
relatedDocs:
  - _bmad-output/planning-artifacts/architecture.md#webview
---

## Symptom Description

The HUD webview panel opens but displays only a blank/white screen. No agents, vital signs, or UI elements are visible.

## Diagnosis Steps

1. **Check browser console for errors**
   - Help > Toggle Developer Tools
   - Check Console tab for JavaScript errors
   
2. **Verify webview resources loaded**
   - Network tab in Developer Tools
   - Look for failed resource loads (404 errors)
   
3. **Check Content Security Policy**
   - CSP errors in console indicate blocked resources
   
4. **Test in different VSCode window**
   - Open new window and activate extension

## Solutions

### Solution 1: Reload Webview

```
1. Close the webview panel
2. Open Command Palette
3. Run "Suika: Toggle HUD"
4. Or reload VSCode window (Ctrl+R / Cmd+R)
```

### Solution 2: Clear Extension Cache

```bash
# Clear webview cache
rm -rf ~/.vscode/extensions/suika/dist/webview/*
```

Then reload VSCode.

### Solution 3: Check Extension Installation

Verify extension files are intact:

```
1. Open Extensions view
2. Right-click Suika extension
3. Select "Reinstall Extension"
4. Reload window
```

### Solution 4: Disable Conflicting Extensions

Some extensions may interfere with webviews:

```
1. Disable all other extensions
2. Reload window
3. Test if HUD loads
4. Re-enable extensions one by one to find conflict
```

### Solution 5: Update VSCode

Older VSCode versions may have webview bugs:

```
1. Help > Check for Updates
2. Install latest VSCode version
3. Restart VSCode
```

### Solution 6: Check Developer Tools Console

Look for specific errors:

```
Common errors:
- "Failed to load resource" → Missing files
- "CSP violation" → Content Security Policy issue
- "Uncaught ReferenceError" → JavaScript error
```

## Prevention

- **Keep VSCode updated** - Latest version has webview fixes
- **Avoid modifying extension files** - Can break webview loading
- **Regular extension updates** - Bug fixes and improvements
- **Test after extension updates** - Verify HUD loads correctly
- **Report blank screen issues** - Help improve extension stability

## Related Documentation

- [Architecture: Webview Implementation](_bmad-output/planning-artifacts/architecture.md#webview)
- [Troubleshooting: Developer Tools](docs/troubleshooting.md#developer-tools)
