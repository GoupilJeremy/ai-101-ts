---
id: api-key-not-found
title: Missing API Key Setup
category: APIKeyProblems
symptoms:
  - no api key
  - api key not configured
  - setup required
  - missing configuration
errorCodes:
  - AI101-AUTH-003
relatedDocs:
  - docs/setup.md#first-time-setup
---

## Symptom Description

Extension prompts for API key configuration. Agents cannot function because no LLM provider API key is configured.

## Diagnosis Steps

1. **Check if API key is stored**
   - Extension uses VSCode SecretStorage
   - No direct way to view stored secrets
   
2. **Verify extension activation**
   - Extension should prompt for setup on first activation
   
3. **Check configuration**
   ```
   Settings > Search "ai101.llm.provider"
   ```

## Solutions

### Solution 1: First-Time Setup

If this is your first time using AI-101:

```
1. Open Command Palette (Ctrl+Shift+P / Cmd+Shift+P)
2. Run "AI 101: Configure API Keys"
3. Select provider (OpenAI or Anthropic)
4. Paste your API key
5. Click "Save"
```

### Solution 2: Get API Key from Provider

**For OpenAI:**
1. Visit https://platform.openai.com/signup
2. Create account or sign in
3. Go to https://platform.openai.com/api-keys
4. Click "Create new secret key"
5. Copy key (shown only once!)
6. Configure in AI-101

**For Anthropic:**
1. Visit https://console.anthropic.com/signup
2. Create account or sign in
3. Go to https://console.anthropic.com/settings/keys
4. Click "Create Key"
5. Copy key
6. Configure in AI-101

### Solution 3: Switch Provider

If you have key for different provider:

```json
{
  "ai101.llm.provider": "anthropic"  // or "openai"
}
```

Then configure the corresponding API key.

### Solution 4: Use Getting Started Guide

Follow the interactive walkthrough:

```
1. Open Command Palette
2. Run "AI 101: Show Getting Started"
3. Follow setup steps
4. Configure API key when prompted
```

## Prevention

- **Save API key securely** - Extension uses VSCode SecretStorage
- **Backup API keys** - Store in password manager
- **Document provider choice** - Remember which provider you use
- **Complete setup on first activation** - Don't skip configuration
- **Test after setup** - Verify agents respond correctly

## Related Documentation

- [Setup Guide: First-Time Setup](docs/setup.md#first-time-setup)
- [Getting Started Walkthrough](docs/getting-started.md)
- [Configuration Reference](docs/configuration.md#llm-settings)
- [OpenAI Signup](https://platform.openai.com/signup)
- [Anthropic Signup](https://console.anthropic.com/signup)
