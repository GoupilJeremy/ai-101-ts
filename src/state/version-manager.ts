import * as vscode from 'vscode';
import * as semver from 'semver';

/**
 * Service to manage extension version tracking and update notifications.
 */
export class VersionManager {
    private static readonly LAST_KNOWN_VERSION_KEY = 'ai101.lastKnownVersion';

    constructor(private context: vscode.ExtensionContext) { }

    /**
     * Checks if the extension has been updated and shows a notification if so.
     */
    public async checkVersionUpdate() {
        const currentVersion = this.context.extension.packageJSON.version;
        const lastKnownVersion = this.context.globalState.get<string>(VersionManager.LAST_KNOWN_VERSION_KEY);

        if (!lastKnownVersion) {
            // First time running the version manager, just save the current version
            await this.context.globalState.update(VersionManager.LAST_KNOWN_VERSION_KEY, currentVersion);
            return;
        }

        if (semver.gt(currentVersion, lastKnownVersion)) {
            // Version has increased!
            this.showUpdateNotification(currentVersion);
            // Update the stored version
            await this.context.globalState.update(VersionManager.LAST_KNOWN_VERSION_KEY, currentVersion);
        }
    }

    private async showUpdateNotification(version: string) {
        const message = `AI-101 has been updated to v${version}! Check out what's new in the changelog.`;
        const action = 'View Changelog';

        const selection = await vscode.window.showInformationMessage(message, action);

        if (selection === action) {
            vscode.commands.executeCommand('ai-101-ts.viewChangelog');
        }
    }
}
