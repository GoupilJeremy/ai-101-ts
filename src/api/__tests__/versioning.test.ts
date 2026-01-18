import { describe, it, expect } from 'vitest';
import { LLMProviderManager } from '../../llm/provider-manager.js';
import { createAPI } from '../api-implementation.js';

describe('API Versioning', () => {
    const testVersion = '1.2.3';
    const api = createAPI(LLMProviderManager.getInstance(), testVersion);

    describe('apiVersion', () => {
        it('should return the correct version', () => {
            expect(api.apiVersion).toBe(testVersion);
        });
    });

    describe('checkCompatibility', () => {
        it('should return true for exact match', () => {
            expect(api.checkCompatibility('1.2.3')).toBe(true);
        });

        it('should return true for compatible minor range (^)', () => {
            expect(api.checkCompatibility('^1.0.0')).toBe(true);
            expect(api.checkCompatibility('^1.2.0')).toBe(true);
        });

        it('should return true for compatible patch range (~)', () => {
            expect(api.checkCompatibility('~1.2.0')).toBe(true);
            expect(api.checkCompatibility('~1.2.3')).toBe(true);
        });

        it('should return true for greater than or equal (>=)', () => {
            expect(api.checkCompatibility('>=1.0.0')).toBe(true);
            expect(api.checkCompatibility('>=1.2.3')).toBe(true);
        });

        it('should return false for breaking major change', () => {
            expect(api.checkCompatibility('^2.0.0')).toBe(false);
        });

        it('should return false for higher minor version in caret range', () => {
            // If current is 1.2.3, it doesn't satisfy ^1.3.0
            expect(api.checkCompatibility('^1.3.0')).toBe(false);
        });

        it('should return false for higher patch version in tilde range', () => {
            // If current is 1.2.3, it doesn't satisfy ~1.2.4
            expect(api.checkCompatibility('~1.2.4')).toBe(false);
        });

        it('should return false for invalid range', () => {
            expect(api.checkCompatibility('invalid-range')).toBe(false);
        });

        it('should handle pre-release versions if configured (by default semver.satisfies handles them strictly)', () => {
            const preReleaseApi = createAPI(LLMProviderManager.getInstance(), '1.0.0-alpha.1');
            expect(preReleaseApi.checkCompatibility('^1.0.0-alpha.0')).toBe(true);
            expect(preReleaseApi.checkCompatibility('^1.0.0')).toBe(false); // semver strictness on pre-releases
        });
    });
});
