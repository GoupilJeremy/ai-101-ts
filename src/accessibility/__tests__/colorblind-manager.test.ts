/**
 * Colorblind Manager Tests
 * Story 5.8: Implement Colorblind Accessibility Alternatives
 */

import { ColorblindManager, DEFAULT_COLORBLIND_CONFIG } from '../colorblind-manager.js';

describe('ColorblindManager', () => {
    let manager: ColorblindManager;

    beforeEach(() => {
        // Reset singleton instance for testing
        (ColorblindManager as any).instance = undefined;
        manager = ColorblindManager.getInstance();
    });

    afterEach(() => {
        manager.dispose();
    });

    describe('Singleton Pattern', () => {
        it('should return the same instance', () => {
            const instance1 = ColorblindManager.getInstance();
            const instance2 = ColorblindManager.getInstance();
            expect(instance1).toBe(instance2);
        });
    });

    describe('Default Configuration', () => {
        it('should have correct default configuration', () => {
            const config = manager.getConfig();
            expect(config.enabled).toBe(false);
            expect(config.type).toBe('none');
            expect(config.patterns.alertInfo).toBe('solid');
            expect(config.patterns.alertWarning).toBe('dashed');
            expect(config.patterns.alertCritical).toBe('dotted');
            expect(config.patterns.alertUrgent).toBe('double');
            expect(config.shapes.agentIdle).toBe('circle');
            expect(config.shapes.agentThinking).toBe('square');
            expect(config.shapes.agentWorking).toBe('triangle');
            expect(config.shapes.agentAlert).toBe('diamond');
        });
    });

    describe('Pattern and Shape Accessors', () => {
        it('should return correct alert pattern for severity', () => {
            expect(manager.getAlertPattern('info')).toBe('solid');
            expect(manager.getAlertPattern('warning')).toBe('dashed');
            expect(manager.getAlertPattern('critical')).toBe('dotted');
            expect(manager.getAlertPattern('urgent')).toBe('double');
        });

        it('should return correct agent shape for state', () => {
            expect(manager.getAgentShape('idle')).toBe('circle');
            expect(manager.getAgentShape('thinking')).toBe('square');
            expect(manager.getAgentShape('working')).toBe('triangle');
            expect(manager.getAgentShape('alert')).toBe('diamond');
        });
    });

    describe('State Management', () => {
        it('should start disabled', () => {
            expect(manager.isEnabled()).toBe(false);
            expect(manager.getType()).toBe('none');
        });
    });
});