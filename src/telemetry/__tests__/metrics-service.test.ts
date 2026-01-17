import * as assert from 'assert';
import { vi, suite, test, beforeEach } from 'vitest';
import * as vscode from 'vscode';
import { MetricsService } from '../metrics-service';
import { DEFAULT_METRICS } from '../metrics.interface';

// Mock vscode
vi.mock('vscode', () => {
    const FileSystemError = class extends Error {
        static FileNotFound = () => new FileSystemError('FileNotFound', 'FileNotFound');
        constructor(message: string, public code: string) {
            super(message);
        }
    };

    return {
        workspace: {
            fs: {
                readFile: vi.fn(),
                writeFile: vi.fn()
            }
        },
        Uri: {
            joinPath: vi.fn().mockReturnValue({ fsPath: '/test/path/metrics.json' }),
            file: vi.fn().mockReturnValue({ fsPath: '/test/path' })
        },
        FileSystemError,
        EventEmitter: class {
            event = vi.fn();
            fire = vi.fn();
        }
    };
});

suite('MetricsService Test Suite', () => {
    let mockContext: any;
    let service: MetricsService;

    beforeEach(async () => {
        mockContext = {
            globalStorageUri: { fsPath: '/test/storage' },
            subscriptions: []
        };

        // Reset singleton
        (MetricsService as any).instance = undefined;

        // Mock readFile to return default metrics or throw FileNotFound
        (vscode.workspace.fs.readFile as any).mockRejectedValue(new (vscode as any).FileSystemError('File not found', 'FileNotFound'));
        (vscode.workspace.fs.writeFile as any).mockClear();

        service = MetricsService.getInstance(mockContext);
    });

    test('Should initialize with default metrics if no file exists', async () => {
        const metrics = await service.getMetrics();
        assert.strictEqual(metrics.totalSessions, 1); // Incremented on start
        assert.strictEqual(metrics.suggestionsRequested, 0);
    });

    test('Should record suggestion requested', async () => {
        service.recordSuggestionRequested();
        const metrics = await service.getMetrics();
        assert.strictEqual(metrics.suggestionsRequested, 1);

        const today = new Date().toISOString().split('T')[0];
        assert.strictEqual(metrics.dailyStats[today].suggestionsRequested, 1);
    });

    test('Should record suggestion accepted and calculate time saved', async () => {
        const lines = 10;
        service.recordSuggestionAccepted(lines);
        const metrics = await service.getMetrics();

        assert.strictEqual(metrics.suggestionsAccepted, 1);
        assert.strictEqual(metrics.linesAccepted, lines);
        // 10 lines * 10000ms = 100000ms
        assert.strictEqual(metrics.timeSavedMs, 100000);
    });

    test('Should record suggestion rejected', async () => {
        service.recordSuggestionRejected();
        const metrics = await service.getMetrics();
        assert.strictEqual(metrics.suggestionsRejected, 1);
    });

    test('Should persist metrics after updates', async () => {
        service.recordSuggestionRequested();
        assert.strictEqual((vscode.workspace.fs.writeFile as any).mock.calls.length, 2); // Start + Request
    });
});
