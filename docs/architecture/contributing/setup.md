# Development Setup

## Prerequisites

- **Node.js**: 16.0.0 or higher
- **VSCode**: 1.75.0 or higher
- **Git**: For version control

## Installation Steps

### 1. Clone Repository

```bash
git clone https://github.com/your-org/suika.git
cd suika
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure API Keys (Optional)

For LLM provider testing:

1. Open VSCode Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`)
2. Run "Suika: Configure API Keys"
3. Enter your OpenAI or Anthropic API key

Keys are stored securely in VSCode SecretStorage.

### 4. Build Extension

```bash
npm run compile
```

This builds both the extension and webview bundles.

### 5. Run Extension

Press `F5` in VSCode to launch Extension Development Host with the extension loaded.

## Verify Installation

1. Extension should activate automatically
2. Check Output panel for "Suika" logs
3. Try running "Suika: Get Suggestion" command

## Troubleshooting

### Build Errors

```bash
# Clean and rebuild
npm run clean
npm install
npm run compile
```

### Extension Not Loading

- Check VSCode version (must be 1.75.0+)
- Check for errors in Output panel
- Try reloading window (`Cmd+R` / `Ctrl+R`)

## Next Steps

- [Development Workflow](./development.md)
- [Build System](../workflow/build.md)
- [Debugging](../workflow/debug.md)
