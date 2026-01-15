/**
 * WCAG AAA Contrast Ratio Calculator
 * Verifies color contrast meets 7:1 minimum requirement
 * Story 5.7: Implement High Contrast Mode for Accessibility
 */

export function calculateContrastRatio(foreground: string, background: string): number {
    const getLuminance = (hex: string): number => {
        // Convert hex to RGB
        const hexToRgb = (h: string): [number, number, number] => {
            const r = parseInt(h.substring(1, 3), 16) / 255;
            const g = parseInt(h.substring(3, 5), 16) / 255;
            const b = parseInt(h.substring(5, 7), 16) / 255;
            return [r, g, b];
        };

        const [r, g, b] = hexToRgb(hex);

        // Apply gamma correction
        const gammaCorrect = (c: number): number => {
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        };

        const rLinear = gammaCorrect(r);
        const gLinear = gammaCorrect(g);
        const bLinear = gammaCorrect(b);

        // Calculate relative luminance
        return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
    };

    const l1 = getLuminance(foreground);
    const l2 = getLuminance(background);

    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    // Calculate contrast ratio
    return (lighter + 0.05) / (darker + 0.05);
}

// WCAG AAA requires 7:1 for normal text, 4.5:1 for large text
export const WCAG_AAA_RATIO = 7;

export function meetsWCAGAAA(foreground: string, background: string): boolean {
    const ratio = calculateContrastRatio(foreground, background);
    return ratio >= WCAG_AAA_RATIO;
}