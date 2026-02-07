---
id: agents-not-responding
title: Agents Not Responding
category: Agents
symptoms:
  - agents stuck
  - not responding
  - frozen
  - idle forever
  - no suggestions
errorCodes:
  - AI101-AGENT-001
  - AI101-AGENT-002
relatedDocs:
  - _bmad-output/planning-artifacts/architecture.md#agents
---

## Symptom Description

AI agents remain in "idle" state and never transition to "thinking" or "working". No suggestions are generated. Agents appear frozen or unresponsive.

## Diagnosis Steps

1. **Check agent state**
   - Hover over agents in HUD
   - Look for error indicators
   
2. **Verify LLM connectivity**
   - Check if API key is configured
   - Test LLM provider connection
   
3. **Check Output panel**
   - View > Output
   - Select "AI-101" channel
   - Look for error messages
   
4. **Monitor Developer Tools**
   - Help > Toggle Developer Tools
   - Check Console for errors

## Solutions

### Solution 1: Force Agent State Reset

```
1. Open Command Palette
2. Run "AI 101: Force Agent State (Debug)"
3. Select agent to reset
4. Choose "Reset to Idle"
```

### Solution 2: Reload Extension

```
1. Open Command Palette
2. Run "Developer: Reload Window"
3. Or use keyboard shortcut: Ctrl+R (Cmd+R on Mac)
```

### Solution 3: Check LLM Configuration

Verify LLM provider is configured:

```
1. Open Settings
2. Search "ai101.llm.provider"
3. Ensure valid provider selected
4. Run "AI 101: Configure API Keys"
5. Test connection
```

### Solution 4: Clear Agent State

Reset extension state:

```
1. Open Command Palette
2. Run "AI 101: Reset Configuration"
3. Reconfigure API keys
4. Reload window
```

### Solution 5: Check Context Files

Agents need context to work:

```
1. Open a code file
2. Make a code change
3. Wait for agents to activate
4. Or manually add context:
   - Run "AI 101: Add File to Context"
```

### Solution 6: Verify Development Phase

Agents behave differently based on phase:

```
1. Run "AI 101: Set Development Phase"
2. Select appropriate phase (Planning/Implementation/Review)
3. Test agent responsiveness
```

## Prevention

- **Keep files open** - Agents need context from active files
- **Make code changes** - Triggers agent analysis
- **Use appropriate mode** - Learning/Expert/Team modes affect behavior
- **Monitor agent status** - Check HUD regularly
- **Regular extension updates** - Bug fixes and improvements
- **Avoid rapid mode switching** - Give agents time to initialize

## Related Documentation

- [Architecture: Agent System](_bmad-output/planning-artifacts/architecture.md#agents)
- [User Guide: Understanding Agents](docs/user-guide.md#agents)
- [Configuration: Agent Settings](docs/configuration.md#agent-settings)
- [Troubleshooting: LLM Issues](./connectivity-llm-timeout.md)
