import * as assert from 'assert';
import { vi, suite, test, beforeEach } from 'vitest';

// Mock @vscode/extension-telemetry BEFORE anything else
vi.mock('@vscode/extension-telemetry', () => {
    return {
        TelemetryReporter: class {
            sendTelemetryEvent = vi.fn();
            sendTelemetryErrorEvent = vi.fn();
            dispose = vi.fn();
        }
    };
});

import { TelemetryService } from '../telemetry-service.js';
import * as vscode from 'vscode';

// Mock TelemetryReporter
class MockReporter {
    public events: { name: string, properties?: any, measurements?: any }[] = [];
    public errors: { name: string, properties?: any, measurements?: any }[] = [];
    public disposed = false;

    sendTelemetryEvent(name: string, properties?: any, measurements?: any) {
        this.events.push({ name, properties, measurements });
    }

    sendTelemetryErrorEvent(name: string, properties?: any, measurements?: any) {
        this.errors.push({ name, properties, measurements });
    }

    dispose() {
        this.disposed = true;
    }
}

// We need to inject the mock reporter into the service.
// Since it's a singleton and private, we'll use a bit of trickery for testing.

suite('TelemetryService Test Suite', () => {
    let mockContext: any;
    let service: TelemetryService;

    beforeEach(() => {
        mockContext = {
            globalState: {
                get: (key: string, defaultValue: any) => defaultValue,
                update: (key: string, value: any) => Promise.resolve()
            },
            subscriptions: [],
            extension: {
                id: 'test-extension',
                packageJSON: { version: '1.0.0' }
            }
        };

        // Reset singleton
        (TelemetryService as any).instance = undefined;
        service = TelemetryService.getInstance(mockContext);
    });

    test('Should NOT send events when opted out by default', () => {
        const reporter = new MockReporter();
        (service as any).reporter = reporter;
        (service as any).isOptedIn = false;

        service.sendEvent('testEvent');
        assert.strictEqual(reporter.events.length, 0);
    });

    test('Should send events when opted in', () => {
        const reporter = new MockReporter();
        (service as any).reporter = reporter;
        (service as any).isOptedIn = true;

        service.sendEvent('testEvent', { foo: 'bar' });
        assert.strictEqual(reporter.events.length, 1);
        assert.strictEqual(reporter.events[0].name, 'testEvent');
        assert.strictEqual(reporter.events[0].properties.foo, 'bar');
    });

    test('Should sanitize properties to remove PII', () => {
        const reporter = new MockReporter();
        (service as any).reporter = reporter;
        (service as any).isOptedIn = true;

        const piiProps = {
            email: 'user@example.com',
            apiKey: 'sk-1234567890abcdef1234567890abcdef',
            path: '/home/user/project/secret.ts',
            normal: 'safe-value'
        };

        service.sendEvent('piiEvent', piiProps);

        const sentProps = reporter.events[0].properties;
        assert.strictEqual(sentProps.email, '[REDACTED]');
        assert.strictEqual(sentProps.apiKey, '[REDACTED]');
        assert.strictEqual(sentProps.path.includes('/home/user'), false);
        assert.strictEqual(sentProps.normal, 'safe-value');
    });

    test('Should sanitize error messages and stacks', () => {
        const reporter = new MockReporter();
        (service as any).reporter = reporter;
        (service as any).isOptedIn = true;

        const error = new Error('Failed to connect to user@example.com');
        error.stack = 'at /home/user/secret.ts:10:5';

        service.sendError(error);

        const sentProps = reporter.errors[0].properties;
        assert.strictEqual(sentProps.errorMessage.includes('user@example.com'), false);
        assert.strictEqual(sentProps.stack.includes('/home/user'), false);
    });

    test('updateConsentStatus should respect VSCode and extension settings', () => {
        // Mock vscode.env.isTelemetryEnabled
        const originalStatus = vscode.env.isTelemetryEnabled;
        (vscode.env as any).isTelemetryEnabled = true;

        // Extension opted out
        mockContext.globalState.get = () => false;
        service.updateConsentStatus();
        assert.strictEqual((service as any).isOptedIn, false);

        // Extension opted in
        mockContext.globalState.get = () => true;
        service.updateConsentStatus();
        assert.strictEqual((service as any).isOptedIn, true);

        // VSCode opted out
        (vscode.env as any).isTelemetryEnabled = false;
        service.updateConsentStatus();
        assert.strictEqual((service as any).isOptedIn, false);

        // Cleanup
        (vscode.env as any).isTelemetryEnabled = originalStatus;
    });
});
