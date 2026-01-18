# API Versioning and Compatibility

AI-101 uses [Semantic Versioning 2.0.0](https://semver.org/) for its public API. This ensures that extension developers can rely on a stable interface and gracefully handle updates.

## Version Format

The API version follows the format `MAJOR.MINOR.PATCH`:

-   **MAJOR**: Breaking changes to the API. Extensions built for version 1.x.x may not work with 2.x.x without code changes.
-   **MINOR**: New features or additions to the API that are backwards-compatible.
-   **PATCH**: Backwards-compatible bug fixes.

## Checking Compatibility

The AI-101 API provides a `checkCompatibility` method that allows your extension to verify if the currently installed version of AI-101 satisfies your requirements.

### Usage Example

It is recommended to check compatibility during your extension's activation phase:

```typescript
import * as vscode from 'vscode';
import { IAI101API } from './api/extension-api';

export async function activate(context: vscode.ExtensionContext) {
    const ai101Extension = vscode.extensions.getExtension('GoupilJeremy.ai-101-ts');
    
    if (!ai101Extension) {
        vscode.window.showErrorMessage('AI-101 extension is required for this extension to work.');
        return;
    }

    const api: IAI101API = ai101Extension.exports;

    // Guard against breaking changes (requires version 1.x.x)
    if (!api.checkCompatibility('^1.0.0')) {
        vscode.window.showErrorMessage(
            `Incompatible AI-101 version detected (${api.apiVersion}). ` +
            `This extension requires version 1.x.x.`
        );
        return;
    }

    // Ensure a specific feature introduced in 1.2.0 is available
    if (!api.checkCompatibility('>=1.2.0')) {
        console.warn('Some advanced features might be disabled (requires AI-101 >= 1.2.0)');
    }

    // Your extension logic here...
}
```

## Deprecation Policy

When an API feature is planned for removal:

1.  **Marked Deprecated**: The feature will be marked with JSDoc `@deprecated` in a **Minor** release. It will remain functional but may log warnings.
2.  **Removal**: The feature will be removed in a **Major** release.

Always check for `@deprecated` tags in your IDE when updating the AI-101 types/dependencies.

## Accessing current version

You can access the current API version string via `api.apiVersion`:

```typescript
console.log(`Running with AI-101 API version: ${api.apiVersion}`);
```
