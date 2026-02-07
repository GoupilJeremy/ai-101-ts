---
id: api-key-invalid
title: Invalid API Key Error
category: APIKeyProblems
symptoms:
  - invalid api key
  - authentication failed
  - unauthorized
  - 401 error
  - api key rejected
errorCodes:
  - AI101-AUTH-001
  - AI101-AUTH-002
relatedDocs:
  - docs/setup.md#api-keys
---

## Symptom Description

Extension shows "Invalid API Key" or "Authentication Failed" errors. LLM providers reject API calls with 401 Unauthorized errors.

## Diagnosis Steps

1. **Verify API key format**
   - OpenAI keys start with `sk-`
   - Anthropic keys start with `sk-ant-`
   
2. **Check key expiration**
   - Log into provider dashboard
   - Verify key is still active
   
3. **Test key directly**
   ```bash
   # OpenAI
   curl https://api.openai.com/v1/models \
     -H "Authorization: Bearer YOUR_API_KEY"
   
   # Anthropic
   curl https://api.anthropic.com/v1/messages \
     -H "x-api-key: YOUR_API_KEY"
   ```
   
4. **Check for whitespace**
   - API keys should have no spaces or newlines
   - Copy-paste errors common

## Solutions

### Solution 1: Reconfigure API Key

```
1. Open Command Palette
2. Run "AI 101: Configure API Keys"
3. Paste API key carefully (no extra spaces)
4. Save and test
```

### Solution 2: Generate New API Key

If key is compromised or expired:

**OpenAI:**
1. Visit https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy key immediately (shown only once)
4. Configure in AI-101

**Anthropic:**
1. Visit https://console.anthropic.com/settings/keys
2. Click "Create Key"
3. Copy key
4. Configure in AI-101

### Solution 3: Check Key Permissions

Ensure key has required permissions:

- **OpenAI:** Key must have access to GPT models
- **Anthropic:** Key must have access to Claude models

### Solution 4: Verify Account Status

Check provider account:

- **Billing:** Ensure payment method is valid
- **Credits:** Verify you have available credits
- **Limits:** Check if rate limits are exceeded

### Solution 5: Clear Stored Secrets

Remove and re-add API key:

```
1. Open Command Palette
2. Run "AI 101: Reset Configuration"
3. Reconfigure API key
4. Test connection
```

## Prevention

- **Store keys securely** - Never commit to version control
- **Use environment-specific keys** - Different keys for dev/prod
- **Monitor key usage** - Check provider dashboards regularly
- **Rotate keys periodically** - Generate new keys every 90 days
- **Set spending limits** - Prevent unexpected charges
- **Enable notifications** - Get alerts for auth failures

## Related Documentation

- [Setup Guide: API Key Configuration](docs/setup.md#api-keys)
- [Security: API Key Best Practices](docs/security.md#api-keys)
- [OpenAI API Keys](https://platform.openai.com/api-keys)
- [Anthropic API Keys](https://console.anthropic.com/settings/keys)
