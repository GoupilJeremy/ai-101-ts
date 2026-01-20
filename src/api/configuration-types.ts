/**
 * All valid configuration scopes in VSCode.
 * @public
 */
export type ConfigurationScope = 'user' | 'workspace' | 'workspaceFolder';

/**
 * Valid values for the LLM provider setting.
 * @public
 */
export enum LLMProvider {
    OpenAI = 'openai',
    Anthropic = 'anthropic',
    Custom = 'custom'
}

/**
 * Valid values for the UI transparency setting.
 * @public
 */
export enum UITransparency {
    Minimal = 'minimal',
    Medium = 'medium',
    Full = 'full'
}

/**
 * Valid values for the operating mode setting.
 * @public
 */
export enum UIMode {
    Learning = 'learning',
    Expert = 'expert',
    Focus = 'focus',
    Team = 'team',
    Performance = 'performance'
}

/**
 * Valid values for the colorblind accessibility mode setting.
 * @public
 */
export enum ColorblindType {
    None = 'none',
    Deuteranopia = 'deuteranopia',
    Protanopia = 'protanopia',
    Tritanopia = 'tritanopia'
}

/**
 * Interface representing the colorblind settings object.
 * @public
 */
export interface IColorblindSettings {
    enabled: boolean;
    type: ColorblindType;
}

/**
 * Interface representing the keyboard shortcuts object.
 * @public
 */
export interface IKeyboardShortcuts {
    enableHudNavigation: boolean;
    tabNavigation: string;
    shiftTabNavigation: string;
    activateElement: string;
    dismissElement: string;
    agentNavigation: string;
    alertNavigation: string;
}

/**
 * Comprehensive interface for all Suika configuration settings.
 * This represents the internal schema of settings under the 'ai101' namespace.
 * Keys match the property names in package.json (without the 'suika.' prefix).
 * 
 * @public
 * @category Configuration
 * @since 0.0.1
 * 
 * @example
 * ```typescript
 * // Get configuration values
 * const currentMode = api.getConfig('ui.mode');
 * const maxTokens = api.getConfig('performance.maxTokens');
 * 
 * // Set a single configuration value
 * await api.setConfig('ui.mode', UIMode.Expert, 'user');
 * 
 * // Update multiple configuration values at once
 * await api.updateConfig({
 *   'ui.mode': UIMode.Learning,
 *   'ui.transparency': UITransparency.Medium,
 *   'telemetry.enabled': true
 * }, 'workspace');
 * ```
 */
export interface IAI101Config {
    'llm.provider': LLMProvider | string;
    'ui.transparency': UITransparency;
    'ui.mode': UIMode;
    'performance.maxTokens': number;
    'telemetry.enabled': boolean;
    'teamMode.largeText': boolean;
    'teamMode.surveyEnabled': boolean;
    'performanceMode.autoActivate': boolean;
    'performanceMode.autoSuggest': boolean;
    'performanceMode.collisionThrottleMs': number;
    'performanceMode.metricsThrottleMs': number;
    'accessibility.highContrast': boolean | null;
    'accessibility.autoDetectHighContrast': boolean;
    'accessibility.colorblind': IColorblindSettings;
    'keyboard.shortcuts': IKeyboardShortcuts;
    'architecture.overrides': Record<string, any>;
}
