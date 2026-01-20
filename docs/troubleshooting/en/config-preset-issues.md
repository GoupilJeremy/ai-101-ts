---
id: config-preset-issues
title: Configuration Preset Problems
category: Configuration
symptoms:
  - preset not working
  - settings not applied
  - configuration error
  - preset failed
errorCodes:
  - AI101-CFG-001
relatedDocs:
  - docs/configuration.md#presets
---

## Symptom Description

Configuration presets (Solo, Team, Enterprise) don't apply correctly. Settings remain unchanged after applying a preset, or error messages appear during preset application.

## Diagnosis Steps

1. **Verify preset exists**
   - Check available presets: Solo, Team, Enterprise
   
2. **Check current settings**
   ```
   Settings > Search "ai101"
   ```
   Compare with expected preset values
   
3. **Look for error messages**
   - Check Output panel: "Suika" channel
   - Look for configuration errors

## Solutions

### Solution 1: Reapply Preset

```
1. Open Command Palette
2. Run "Suika: Apply Configuration Preset"
3. Select desired preset (Solo/Team/Enterprise)
4. Reload window if prompted
```

### Solution 2: Manual Configuration

If preset fails, configure manually:

**Solo Developer Preset:**
```json
{
  "suika.ui.mode": "learning",
  "suika.ui.transparency": "medium",
  "suika.telemetry.enabled": true,
  "suika.teamMode.largeText": false
}
```

**Team Mode Preset:**
```json
{
  "suika.ui.mode": "team",
  "suika.ui.transparency": "full",
  "suika.teamMode.largeText": true,
  "suika.teamMode.surveyEnabled": true
}
```

**Enterprise Preset:**
```json
{
  "suika.ui.mode": "expert",
  "suika.telemetry.enabled": false,
  "suika.performanceMode.autoActivate": true
}
```

### Solution 3: Reset to Defaults

Clear all settings and start fresh:

```
1. Open Command Palette
2. Run "Suika: Reset Configuration"
3. Confirm reset
4. Reapply desired preset
```

### Solution 4: Check Workspace vs User Settings

Presets may be overridden by workspace settings:

```
1. Open Settings (Ctrl+, / Cmd+,)
2. Switch between "User" and "Workspace" tabs
3. Check for conflicting settings
4. Remove workspace overrides if needed
```

### Solution 5: Verify Permissions

Ensure VSCode can write to settings:

- Check file permissions on `settings.json`
- Verify workspace is trusted
- Check if settings file is read-only

## Prevention

- **Apply presets from User settings** - Not workspace-specific
- **Document custom settings** - Know which settings you've customized
- **Test after applying preset** - Verify settings changed
- **Use workspace settings sparingly** - Can override presets
- **Regular configuration backups** - Export config periodically

## Related Documentation

- [Configuration Guide: Presets](docs/configuration.md#presets)
- [User Guide: Modes](docs/user-guide.md#modes)
- [Setup: Team Mode](docs/setup.md#team-mode)
