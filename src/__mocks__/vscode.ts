// Mock VS Code API for unit tests
export const window = {
    activeTextEditor: undefined,
    showInformationMessage: () => { },
    showErrorMessage: () => { },
    showWarningMessage: () => { },
    createOutputChannel: () => ({ appendLine: () => { } }),
    createStatusBarItem: () => ({ show: () => { } }),
};

export const workspace = {
    workspaceFolders: [],
    fs: {
        readFile: async () => Buffer.from(''),
        stat: async () => ({})
    },
    getConfiguration: () => ({
        get: () => undefined,
        update: async () => { }
    }),
    findFiles: async () => [],
    textDocuments: []
};

export const Uri = {
    file: (path: string) => ({ fsPath: path, path, scheme: 'file' }),
    parse: (path: string) => ({ fsPath: path, path, scheme: 'file' }),
    joinPath: (...args: any[]) => ({ fsPath: args.join('/') })
};

export class Range {
    constructor(public start: any, public end: any) { }
}

export class Position {
    constructor(public line: number, public character: number) { }
}

export enum StatusBarAlignment {
    Left = 1,
    Right = 2
}

export const commands = {
    registerCommand: () => ({ dispose: () => { } }),
    executeCommand: async () => { }
};

export const env = {
    isTelemetryEnabled: true
};

export class EventEmitter {
    event = () => { };
    fire() { }
}

export const ExtensionContext = {};

export default {
    window,
    workspace,
    Uri,
    Range,
    Position,
    StatusBarAlignment,
    commands,
    EventEmitter,
    env: {
        isTelemetryEnabled: true
    }
};
