# API Versioning and Compatibility

Suika uses [Semantic Versioning 2.0.0](https://semver.org/) for its public API. This ensures that extension developers can rely on a stable interface and gracefully handle updates.

## Version Format

The API version follows the format `MAJOR.MINOR.PATCH`:

-   **MAJOR**: Breaking changes to the API. Extensions built for version 1.x.x may not work with 2.x.x without code changes.
-   **MINOR**: New features or additions to the API that are backwards-compatible.
-   **PATCH**: Backwards-compatible bug fixes.

## Checking Compatibility

The Suika API provides a `checkCompatibility` method that allows your extension to verify if the currently installed version of Suika satisfies your requirements.

### Usage Example

It is recommended to check compatibility during your extension's activation phase:

```typescript
import * as vscode from 'vscode';
import { IAI101API } from './api/extension-api';

export async function activate(context: vscode.ExtensionContext) {
    const ai101Extension = vscode.extensions.getExtension('GoupilJeremy.suika');
    
    if (!ai101Extension) {
        vscode.window.showErrorMessage('Suika extension is required for this extension to work.');
        return;
    }

    const api: IAI101API = ai101Extension.exports;

    // Guard against breaking changes (requires version 1.x.x)
    if (!api.checkCompatibility('^1.0.0')) {
        vscode.window.showErrorMessage(
            `Incompatible Suika version detected (${api.apiVersion}). ` +
            `This extension requires version 1.x.x.`
        );
        return;
    }

    // Ensure a specific feature introduced in 1.2.0 is available
    if (!api.checkCompatibility('>=1.2.0')) {
        console.warn('Some advanced features might be disabled (requires Suika >= 1.2.0)');
    }

    // Your extension logic here...
}
```

## Deprecation Policy

When an API feature is planned for removal:

1.  **Marked Deprecated**: The feature will be marked with JSDoc `@deprecated` in a **Minor** release. It will remain functional but may log warnings.
2.  **Removal**: The feature will be removed in a **Major** release.

Always check for `@deprecated` tags in your IDE when updating the Suika types/dependencies.

## Accessing current version

You can access the current API version string via `api.apiVersion`:

```typescript
console.log(`Running with Suika API version: ${api.apiVersion}`);
```
