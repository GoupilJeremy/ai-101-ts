// Mock VSCode API for unit tests
export const Uri = {
    file: (path: string) => ({ fsPath: path, path, scheme: 'file' }),
    parse: (value: string) => ({ fsPath: value, path: value, scheme: 'file' })
};

export const workspace = {
    fs: {
        readFile: async () => Buffer.from('{}'),
        writeFile: async () => undefined,
        createDirectory: async () => undefined,
        stat: async () => ({ type: 1, ctime: 0, mtime: 0, size: 0 })
    },
    getConfiguration: () => ({
        get: (key: string, defaultValue?: any) => defaultValue,
        has: () => true,
        inspect: () => undefined,
        update: async () => undefined
    })
};

export const window = {
    showInformationMessage: async () => undefined,
    showErrorMessage: async () => undefined,
    showWarningMessage: async () => undefined,
    showQuickPick: async () => undefined,
    showInputBox: async () => undefined,
    createOutputChannel: () => ({
        appendLine: () => undefined,
        append: () => undefined,
        clear: () => undefined,
        show: () => undefined,
        hide: () => undefined,
        dispose: () => undefined
    })
};

export const ExtensionContext = class {
    subscriptions: any[] = [];
    globalState: any = {
        get: () => undefined,
        update: async () => undefined
    };
    globalStorageUri = Uri.file('/mock/storage');
    secrets = {
        get: async () => undefined,
        store: async () => undefined,
        delete: async () => undefined
    };
};

export const FileType = {
    Unknown: 0,
    File: 1,
    Directory: 2,
    SymbolicLink: 64
};

export const Disposable = class {
    static from(...disposables: any[]) {
        return {
            dispose: () => disposables.forEach(d => d.dispose?.())
        };
    }
};
