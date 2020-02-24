import * as vscode from 'vscode';
import { Utilities } from './lib';

class bracket {
    constructor(public start: string, public end: string) { }
    public counter: number = 0;
}

export class BracketJumper {
    private bracketPairs = [new bracket('[', ']'), new bracket('{', '}'), new bracket('(', ')')];

    constructor(context: vscode.ExtensionContext) {
        let disposable = vscode.commands.registerCommand('metaGo.jumpToBracket', () => {
            const editor = vscode.window.activeTextEditor;
            const selection = editor.selection;

            let fromLine = editor.selection.active.line;
            let fromChar = editor.selection.active.character;
            let line = editor.document.lineAt(fromLine);
            this.clearBracketsCounter();
            if (this.isBracket(line.text[fromChar]) || this.isBracket(line.text[fromChar - 1])) {
                vscode.commands.executeCommand('editor.action.jumpToBracket');
                return;
            }
            if (this.testLine(line, fromChar)) return;

            while (--fromLine >= 0) {
                let line = editor.document.lineAt(fromLine);
                if (this.testLine(line)) return;

            }

        });
        context.subscriptions.push(disposable);
    }

    private testLine(line: vscode.TextLine, tillIndex: number = -1) {
        if (tillIndex === -1) {
            tillIndex = line.text.length;
        }
        let editor = vscode.window.activeTextEditor;
        for (let i = tillIndex - 1; i >= line.firstNonWhitespaceCharacterIndex; --i) {
            let char = line.text[i];
            let index = -1;
            if (this.bracketPairs.some((c, i) => { index = i; return c.end === char })) {
                this.bracketPairs[index].counter++;
            } else if (this.bracketPairs.some((c, i) => { index = i; return c.start === char })) {
                if (this.bracketPairs[index].counter === 0) {
                    let lineN = line.lineNumber;
                    Utilities.goto(editor, lineN, i);
                    let position = new vscode.Position(lineN, i);
                    let range = new vscode.Range(position, position);
                    vscode.window.activeTextEditor.revealRange(range);
                    return true;
                }
                this.bracketPairs[index].counter--;
            }
        }
        return false;
    }
    private isBracket(char: string) {
        return this.bracketPairs.some((c) => c.start === char || c.end === char);
    }
    private isBracketStart(char: string) {
        return this.bracketPairs.some((c) => c.start === char);
    }
    private isBracketEnd(char: string) {
        return this.bracketPairs.some((c, i) => c.end === char);
    }

    private clearBracketsCounter() {
        this.bracketPairs.forEach((c) => c.counter = 0)
    }

}