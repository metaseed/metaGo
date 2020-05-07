import * as vscode from 'vscode';
import { Utilities } from './metago.core';

class bracket {
    constructor(public start: string, public end: string) { }
    public counter: number = 0;
}

export class BracketJumper {
    private bracketPairs = [new bracket('[', ']'), new bracket('{', '}'), new bracket('(', ')'), new bracket('<','>')];

    constructor(context: vscode.ExtensionContext) {
        let disposable = vscode.commands.registerCommand('metaGo.jumpToBracket', async () => {
            const editor = vscode.window.activeTextEditor;
            const selection = editor.selection;
            let fromLine = selection.active.line;
            let fromChar = selection.active.character;
            let line = editor.document.lineAt(fromLine);
            this.clearBracketsCounter();

            /// default command always put cursor before the bracket, we want it after start bracket and before end bracket
            if (this.isBracketStart(line.text[fromChar]) || this.isBracketStart(line.text[fromChar - 1])) {
                vscode.commands.executeCommand('editor.action.jumpToBracket');
                return;
            } else if (this.isBracketEnd(line.text[fromChar]) || this.isBracketEnd(line.text[fromChar - 1])) {
                await vscode.commands.executeCommand('editor.action.jumpToBracket');
                const selection = editor.selection;
                const position = new vscode.Position(selection.active.line, selection.active.character +1);
                const selections = editor.selections.slice(0, editor.selections.length -1);
                editor.selections = [...selections, new vscode.Selection(position,position)];
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

                    Utilities.goto(editor, lineN, i+1);
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
        return this.isBracketStart(char) || this.isBracketEnd(char);
    }

    private isBracketStart(char: string) {
        return this.bracketPairs.some(c => c.start === char);
    }

    private isBracketEnd(char: string) {
        return this.bracketPairs.some(c => c.end === char);
    }

    private clearBracketsCounter() {
        this.bracketPairs.forEach(c => c.counter = 0)
    }

}

// note the default bracketjump command also work for current implementation. 
// search bracket in extension
// https://marketplace.visualstudio.com/items?itemName=sashaweiss.bracket-jumper
// https://marketplace.visualstudio.com/items?itemName=jomeinaster.bracket-peek