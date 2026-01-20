---
id: connectivity-llm-timeout
title: LLM API Timeouts
category: Connectivity
symptoms:
  - timeout
  - slow response
  - waiting
  - not responding
  - hanging
errorCodes:
  - AI101-LLM-001
  - AI101-LLM-002
relatedDocs:
  - _bmad-output/planning-artifacts/architecture.md#llm-providers
---

## Symptom Description

Agents appear stuck in "thinking" state for extended periods. LLM API calls timeout or take longer than 30 seconds to respond. Error messages indicate connection timeouts.

## Diagnosis Steps

1. **Check internet connection**
   - Verify you can access external websites
   - Test with `ping api.openai.com` or `ping api.anthropic.com`
   
2. **Check API provider status**
   - OpenAI: https://status.openai.com
   - Anthropic: https://status.anthropic.com
   
3. **Verify API key configuration**
   - Run "Suika: Configure API Keys"
   - Ensure key is valid and not expired
   
4. **Check proxy/firewall settings**
   - Corporate networks may block LLM APIs
   - Check with IT department

## Solutions

### Solution 1: Increase Timeout Duration

Extend the timeout for slow connections.

```json
{
  "suika.llm.timeoutMs": 60000  // 60 seconds instead of default 30s
}
```

### Solution 2: Switch LLM Provider

Try an alternative provider if one is experiencing issues.

```
1. Open Settings
2. Search for "suika.llm.provider"
3. Switch from "openai" to "anthropic" (or vice versa)
4. Configure API key for new provider
```

### Solution 3: Configure Proxy Settings

If behind a corporate proxy:

```json
{
  "http.proxy": "http://proxy.company.com:8080",
  "http.proxyStrictSSL": false
}
```

### Solution 4: Use Fallback Provider

Enable automatic fallback to secondary provider.

```json
{
  "suika.llm.enableFallback": true,
  "suika.llm.fallbackProvider": "anthropic"
}
```

### Solution 5: Retry Failed Requests

The extension automatically retries failed requests up to 3 times. Check retry settings:

```json
{
  "suika.llm.maxRetries": 3,
  "suika.llm.retryDelayMs": 1000
}
```

## Prevention

- **Monitor provider status** - Subscribe to status pages for notifications
- **Configure fallback provider** - Always have a backup LLM configured
- **Use cache effectively** - Reduces need for repeated API calls
- **Check network before long sessions** - Ensure stable connection
- **Avoid peak hours** - LLM providers may be slower during high-traffic periods

## Related Documentation

- [Architecture: LLM Provider Abstraction](_bmad-output/planning-artifacts/architecture.md#llm-providers)
- [Configuration: LLM Settings](docs/configuration.md#llm-settings)
- [API Keys Setup Guide](docs/setup.md#api-keys)
