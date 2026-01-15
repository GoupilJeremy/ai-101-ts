/**
 * Toggle Colorblind Mode Command
 * Story 5.8: Implement Colorblind Accessibility Alternatives
 */

import { ColorblindManager } from '../accessibility/colorblind-manager.js';

/**
 * Command handler for toggling Colorblind Mode.
 */
export async function toggleColorblind(): Promise<void> {
    const colorblindManager = ColorblindManager.getInstance();
    await colorblindManager.toggle();
}