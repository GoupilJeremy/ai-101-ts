---
id: connectivity-network-errors
title: General Network Errors
category: Connectivity
symptoms:
  - network error
  - connection failed
  - cannot connect
  - offline
  - no internet
errorCodes:
  - AI101-NET-001
  - AI101-NET-002
relatedDocs:
  - docs/setup.md#network-requirements
---

## Symptom Description

Extension shows "Network Error" messages. Agents cannot connect to LLM providers. Error messages indicate connection failures or network unavailability.

## Diagnosis Steps

1. **Verify internet connection**
   ```bash
   ping 8.8.8.8
   ping api.openai.com
   ```
   
2. **Check VSCode network settings**
   - Settings > Search "proxy"
   - Verify proxy configuration if applicable
   
3. **Test LLM provider accessibility**
   ```bash
   curl https://api.openai.com/v1/models
   curl https://api.anthropic.com/v1/messages
   ```
   
4. **Check firewall/antivirus**
   - Temporarily disable to test
   - Add VSCode to allowed applications

## Solutions

### Solution 1: Configure Proxy Settings

For corporate networks:

```json
{
  "http.proxy": "http://proxy.company.com:8080",
  "http.proxyStrictSSL": false,
  "http.proxyAuthorization": null
}
```

### Solution 2: Disable SSL Verification (Temporary)

**⚠️ Use only for testing, not recommended for production**

```json
{
  "http.proxyStrictSSL": false
}
```

### Solution 3: Add Firewall Exception

Add VSCode and extension to firewall allowed list:

- **Windows:** Windows Defender Firewall > Allow an app
- **Mac:** System Preferences > Security & Privacy > Firewall Options
- **Linux:** `sudo ufw allow` or equivalent

### Solution 4: Use VPN

If LLM providers are blocked in your region:

1. Connect to VPN
2. Restart VSCode
3. Test connection again

### Solution 5: Check DNS Resolution

DNS issues can prevent API access:

```bash
# Flush DNS cache
# Windows:
ipconfig /flushdns

# Mac:
sudo dscacheutil -flushcache

# Linux:
sudo systemd-resolve --flush-caches
```

## Prevention

- **Whitelist LLM provider domains** - Add to firewall/proxy allowlist
- **Use stable network connection** - Avoid public WiFi for sensitive work
- **Configure proxy correctly** - Test proxy settings before long sessions
- **Keep network drivers updated** - Prevents connectivity issues
- **Monitor network status** - Use network monitoring tools

## Related Documentation

- [Setup Guide: Network Requirements](docs/setup.md#network-requirements)
- [Configuration: Proxy Settings](docs/configuration.md#proxy-settings)
