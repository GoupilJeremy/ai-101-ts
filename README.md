# 🍉 Suika - See How AI Thinks

<p align="center">
  <!-- <img src="media/suika-logo.svg" alt="Suika Logo" width="200"> -->
</p>

<p align="center">
  <strong>Transparent AI assistant for VSCode with sumi-e inspired HUD</strong>
</p>

<p align="center">
  <em>"La transparence n'est pas un bug, c'est une feature"</em>
</p>

---

**Suika** transforms the developer-AI interaction by making the AI reasoning process **visible and understandable**. Through a HUD (Heads-Up Display) inspired by Japanese sumi-e (墨絵) aesthetics, four specialized AI agents collaborate transparently above your code.

## ✨ Philosophy

While other AI tools treat intelligence as a black box, Suika believes that **transparency creates trust**. See exactly:

- 🏗️ **Architect** analyzing your project structure
- 💻 **Coder** generating suggestions aligned with your patterns
- 🔍 **Reviewer** catching edge cases before you accept
- 📚 **Context** managing which files the AI sees

## 🎨 Design Aesthetic

Inspired by Japanese minimalism:
- **Ma (間)** - Negative space that respects your code
- **Wabi-sabi** - Beauty in imperfection and simplicity
- **Kanso (簡素)** - Elegant simplicity in every interaction

## 🚀 Quick Start

1. Install from VSCode Marketplace
2. Configure your API keys: `Suika: Configure API Keys`
3. Start coding - watch the agents come alive!

## ⌨️ Default Hotkeys

| Action | Windows/Linux | macOS |
|--------|---------------|-------|
| Toggle HUD | `Ctrl+Alt+H` | `Cmd+Alt+H` |
| Toggle Focus Mode | `Ctrl+Shift+Alt+F` | `Cmd+Shift+Alt+F` |
| Accept Suggestion | `Ctrl+Enter` | `Cmd+Enter` |
| Reject Suggestion | `Ctrl+Backspace` | `Cmd+Backspace` |
| Focus HUD | `Ctrl+Shift+H` | `Cmd+Shift+H` |

## 🎯 Keyboard Navigation

Suika provides comprehensive keyboard-only navigation:

- **Tab/Shift+Tab**: Cycle through interactive elements
- **Arrow Keys**: Navigate spatially between agents/alerts
- **Enter/Space**: Activate or toggle focused elements
- **Escape**: Dismiss or close panels
- **Shift+?**: Show help overlay

## 🔧 Extension Settings

```json
{
  "suika.llm.provider": "openai",
  "suika.ui.transparency": "medium",
  "suika.ui.mode": "learning",
  "suika.accessibility.highContrast": null
}
```

## ♿ Accessibility

- **High Contrast Mode**: Auto-detects VSCode theme
- **Colorblind Modes**: Deuteranopia, Protanopia, Tritanopia
- **Reduced Motion**: Respects system preferences
- **Screen Reader**: Full ARIA support

## 📖 Documentation

- [Getting Started](./docs/guides/getting-started.md)
- [Architecture](./docs/architecture/index.md)
- [API Reference](./docs/api/index.html)
- [Contributing](./CONTRIBUTING.md)

## 🛠️ Development

```bash
# Clone and install
git clone https://github.com/GoupilJeremy/suika.git
cd suika
npm install

# Run in development
npm run watch
# Press F5 in VSCode to launch Extension Development Host
```

### Debug Commands

- **Force Agent State**: `Suika: Force Agent State (Debug)` - Test UI transitions
- Hotkey: `Ctrl+Shift+Alt+S`

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## 📄 License

MIT

---

<p align="center">
  Made with 墨 (ink) and ❤️
</p>
