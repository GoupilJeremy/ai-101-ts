import { vi } from 'vitest';

// Mock VSCode API for unit tests
export const Uri = {
    file: vi.fn((path: string) => ({ fsPath: path, path, scheme: 'file' })),
    parse: vi.fn((value: string) => ({ fsPath: value, path: value, scheme: 'file' }))
};

export const workspace = {
    fs: {
        readFile: vi.fn(async () => Buffer.from('{}')),
        writeFile: vi.fn(async () => undefined),
        createDirectory: vi.fn(async () => undefined),
        stat: vi.fn(async () => ({ type: 1, ctime: 0, mtime: 0, size: 0 }))
    },
    getConfiguration: vi.fn(() => ({
        get: vi.fn((key: string, defaultValue?: any) => defaultValue),
        has: vi.fn(() => true),
        inspect: vi.fn(() => undefined),
        update: vi.fn(async () => undefined)
    }))
};

export const window = {
    showInformationMessage: vi.fn(async () => undefined),
    showErrorMessage: vi.fn(async () => undefined),
    showWarningMessage: vi.fn(async () => undefined),
    showQuickPick: vi.fn(async () => undefined),
    showInputBox: vi.fn(async () => undefined),
    createOutputChannel: vi.fn(() => ({
        appendLine: vi.fn(),
        append: vi.fn(),
        clear: vi.fn(),
        show: vi.fn(),
        hide: vi.fn(),
        dispose: vi.fn()
    }))
};

export const ExtensionContext = class {
    subscriptions: any[] = [];
    globalState: any = {
        get: vi.fn(),
        update: vi.fn(async () => undefined)
    };
    globalStorageUri = { fsPath: '/mock/storage' };
    secrets = {
        get: vi.fn(async () => undefined),
        store: vi.fn(async () => undefined),
        delete: vi.fn(async () => undefined)
    };
};

export const FileType = {
    Unknown: 0,
    File: 1,
    Directory: 2,
    SymbolicLink: 64
};

export class Disposable {
    static from = vi.fn((...disposables: any[]) => {
        return {
            dispose: vi.fn(() => disposables.forEach(d => d.dispose?.()))
        };
    });
    dispose = vi.fn();
}

export class EventEmitter<T> {
    event: any = vi.fn((listener: any) => {
        return new Disposable();
    });
    fire = vi.fn((data: T) => { });
    dispose = vi.fn();
}

export const debug = {
    activeDebugSession: undefined
};

export const commands = {
    executeCommand: vi.fn(async () => undefined),
    registerCommand: vi.fn(() => new Disposable())
};

export const env = {
    isTelemetryEnabled: false,
    language: 'en'
};
