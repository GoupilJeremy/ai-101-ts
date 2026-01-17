# ai-101-ts README

This is the README for your extension "ai-101-ts". After writing up a brief description, we recommend including the following sections.

## Features

Describe specific features of your extension including screenshots of your extension in action. Image paths are relative to this README file.

For example if there is an image subfolder under your extension project workspace:

\!\[feature X\]\(images/feature-x.png\)

> Tip: Many popular extensions utilize animations. This is an excellent way to show off your extension! We recommend short, focused animations that are easy to follow.

## Requirements

If you have any requirements or dependencies, add a section describing those and how to install and configure them.

## Default Hotkeys

The following hotkeys are available by default (configurable in VSCode Keyboard Shortcuts):

### Global Hotkeys
* **Toggle HUD Visibility**: `Ctrl+Alt+H` (`Cmd+Alt+H` on macOS)
* **Toggle Focus Mode**: `Ctrl+Shift+Alt+F` (`Cmd+Shift+Alt+F` on macOS)
* **Accept AI Suggestion**: `Ctrl+Enter` (`Cmd+Enter` on macOS)
* **Reject AI Suggestion**: `Ctrl+Backspace` (`Cmd+Backspace` on macOS)
* **Force Agent State (Debug)**: `Ctrl+Shift+Alt+S` (`Cmd+Shift+Alt+S` on macOS)
* **Focus HUD for Navigation**: `Ctrl+Shift+H` (`Cmd+Shift+H` on macOS)

### Keyboard-Only Navigation

The AI-101 extension provides comprehensive keyboard navigation for all interactive elements in the HUD:

#### Navigation Keys
* **Tab**: Cycle forward through all interactive elements (agents, alerts, suggestions, vital signs, panels)
* **Shift+Tab**: Cycle backward through interactive elements
* **Arrow Left/Right**: Navigate spatially between agents (horizontal navigation)
* **Arrow Up/Down**: Navigate spatially between alerts (vertical navigation)

#### Action Keys
* **Enter**: Activate the currently focused element (expand agent, accept suggestion, etc.)
* **Space**: Toggle the currently focused element state (expand/collapse, select/deselect)
* **Escape**: Close expanded panels or dismiss the currently focused alert

#### Skip Links
* **Skip to Agents**: Quickly jump to the first agent
* **Skip to Alerts**: Quickly jump to the first alert
* **Skip to Suggestions**: Quickly jump to the first suggestion

#### Help
* **Shift+?**: Show keyboard shortcuts help overlay

### Accessibility Features

* **Focus Indicators**: Clear visual focus indicators with Sumi-e aesthetic (ink stroke glow effect)
* **Screen Reader Support**: ARIA live regions announce focus changes and element states
* **Focus Trap**: Modal panels trap focus for keyboard navigation (Tab cycles within panel, Escape to close)
* **High Contrast Mode**: Enhanced focus indicators for better visibility
* **Colorblind Mode**: Pattern-based focus indicators for colorblind users
* **Reduced Motion**: Respects `prefers-reduced-motion` setting

## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

* `myExtension.enable`: Enable/disable this extension.
* `myExtension.thing`: Set to `blah` to do something.

## Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension.

## Release Notes

Users appreciate release notes as you update your extension.

### 1.0.0

Initial release of ...

### 1.0.1

Fixed issue #.

### 1.1.0

Added features X, Y, and Z.

---

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## Working with Markdown

You can author your README using Visual Studio Code. Here are some useful editor keyboard shortcuts:

* Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux).
* Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux).
* Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets.

## For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**
