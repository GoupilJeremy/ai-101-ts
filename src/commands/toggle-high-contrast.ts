/**
 * Toggle High Contrast Mode Command
 * Story 5.7: Implement High Contrast Mode for Accessibility
 */

import { HighContrastManager } from '../accessibility/high-contrast-manager.js';

/**
 * Command handler for toggling High Contrast Mode.
 * Sets a manual override that takes precedence over VSCode theme auto-detection.
 */
export async function toggleHighContrastCommand(): Promise<void> {
    await HighContrastManager.getInstance().toggleManual();
}
