
import * as vscode from 'vscode';
import { AgentType } from '../agents/shared/agent.interface.js';

interface ILaunchArgs {
    agent: AgentType | 'suika';
    prompt: string;
    range: vscode.Range;
}

export class AgentCodeLensProvider implements vscode.CodeLensProvider {
    private regex: RegExp;
    private _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
    public readonly onDidChangeCodeLenses: vscode.Event<void> = this._onDidChangeCodeLenses.event;

    constructor() {
        // Matches comments like: // @suika refactor this function
        // or: // @architect review this class
        this.regex = /\/\/\s*@(suika|architect|coder|reviewer|context)\s+(.+)/g;
    }

    public provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.CodeLens[] | Thenable<vscode.CodeLens[]> {
        const codeLenses: vscode.CodeLens[] = [];
        const text = document.getText();
        let match;

        // Reset lastIndex for global regex
        this.regex.lastIndex = 0;

        while ((match = this.regex.exec(text)) !== null) {
            const startPos = document.positionAt(match.index);
            const line = document.lineAt(startPos.line);
            const range = line.range;

            const target = match[1].toLowerCase();
            const prompt = match[2].trim();

            const agent = this.mapTargetToAgent(target);

            if (agent) {
                const args: ILaunchArgs = { agent, prompt, range };
                const command: vscode.Command = {
                    title: `$(hubot) Ask ${agent === 'suika' ? 'Suika' : agent}: "${prompt}"`,
                    tooltip: `Launch ${agent} agent with this prompt`,
                    command: 'suika.launchAgentFromCodeLens',
                    arguments: [args]
                };
                codeLenses.push(new vscode.CodeLens(range, command));
            }
        }

        return codeLenses;
    }

    private mapTargetToAgent(target: string): AgentType | 'suika' | null {
        switch (target) {
            case 'architect': return 'architect';
            case 'coder': return 'coder';
            case 'reviewer': return 'reviewer';
            case 'context': return 'context';
            case 'suika': return 'suika';
            default: return null;
        }
    }
}
