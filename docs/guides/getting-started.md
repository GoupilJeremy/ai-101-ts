# Getting Started with Suika

Welcome to Suika, your transparent AI assistant for VSCode! This guide will help you get started with the extension and learn about its keyboard navigation features for accessibility.

## Installation

1. Install the Suika extension from the VSCode marketplace
2. Configure your LLM provider in settings (OpenAI, Anthropic, or custom)
3. Start coding with AI assistance!

## Keyboard Navigation

Suika supports full keyboard navigation for accessibility and assistive technology users. All interactive elements in the HUD can be accessed without a mouse.

### Basic Navigation

- **Tab**: Move forward through interactive elements
- **Shift+Tab**: Move backward through interactive elements
- **Enter/Space**: Activate selected element (agent or alert)
- **Escape**: Dismiss or close elements

### Spatial Navigation

- **Arrow Keys**: Navigate between agents (Left/Right) and alerts (Up/Down)
- **Ctrl+Shift+H**: Focus the HUD for keyboard navigation

### Interactive Elements

The HUD contains the following keyboard-accessible elements:

1. **Agent Icons**: Represent different AI agents (Architect, Coder, Reviewer, Context)
2. **Alert Components**: Show suggestions, warnings, and notifications
3. **Vital Signs Bar**: Displays token usage and costs

### Screen Reader Support

- All elements have proper ARIA labels and roles
- Dynamic content updates are announced via live regions
- Focus changes are clearly indicated
- Semantic HTML structure for better navigation

### Configuration

You can customize keyboard shortcuts in VSCode settings:

```json
{
  "suika.keyboard.shortcuts": {
    "enableHudNavigation": true,
    "tabNavigation": "Tab",
    "shiftTabNavigation": "Shift+Tab",
    "activateElement": "Enter",
    "dismissElement": "Escape",
    "agentNavigation": "Arrow Keys",
    "alertNavigation": "Arrow Keys"
  }
}
```

### Accessibility Features

- High contrast focus indicators
- Configurable keyboard shortcuts to avoid conflicts with assistive tools
- Screen reader compatibility tested with NVDA and JAWS
- WCAG 2.1 AA compliance for color contrast and keyboard accessibility

## Modes

Suika offers different operating modes:

- **Learning Mode**: Pedagogical explanations (default)
- **Expert Mode**: Technical details and trade-offs
- **Focus Mode**: Minimal UI with hidden agents
- **Team Mode**: Visible labels and team metrics
- **Performance Mode**: Reduced animations for better speed

## Getting Help

- Use `Ctrl+Shift+P` and search for "Suika" commands
- Check the VSCode output panel for extension logs
- Report issues on the extension's GitHub repository

Enjoy coding with AI assistance!