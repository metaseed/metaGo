import * as vscode from 'vscode';

export class LineSelection {

    constructor(context: vscode.ExtensionContext) {
        let disposable = vscode.commands.registerCommand('metaGo.selectLineUp', () => {
            const editor = vscode.window.activeTextEditor;

            const selections = editor.selections.map(selection => {
                const activeLine = selection.active.line;
                const aboveLine = activeLine - 1;
                const isDocStart = aboveLine <= 0;
                const toLine = isDocStart ? 0 : aboveLine;
                let anchor = selection.anchor;
                let active: vscode.Position;
                const currentLineEnd = editor.document.lineAt(activeLine).text.length;
                const toLineEnd = editor.document.lineAt(toLine).text.length;

                if (selection.isEmpty) {
                    active = new vscode.Position(activeLine, 0);
                    anchor = new vscode.Position(activeLine, currentLineEnd);
                } else if (selection.isReversed) {
                    if (selection.start.character !== 0)
                        active = new vscode.Position(activeLine, 0);
                    else {
                        if (isDocStart) return selection;
                        active = new vscode.Position(toLine, 0);
                    }
                } else { // active == end
                    if (selection.isSingleLine) {
                        active = new vscode.Position(toLine, 0);
                        anchor = new vscode.Position(activeLine, currentLineEnd);
                    } else {
                        active = new vscode.Position(toLine, toLineEnd);
                    }
                }
                return new vscode.Selection(anchor, active);
            });

            editor.selections = selections;

            const range = (<vscode.Range[]>selections).reduce((a, c) => a.union(c))
            editor.revealRange(range);
        });

        context.subscriptions.push(disposable);

        let disposableDown = vscode.commands.registerCommand('metaGo.selectLineDown', () => {
            const editor = vscode.window.activeTextEditor;

            const selections = editor.selections.map(selection => {
                const activeLine = selection.active.line;
                const belowLine = activeLine + 1;
                const boundary = editor.document.lineCount;
                const isDocEnd = belowLine >= boundary - 1;
                const toLine = isDocEnd ? boundary - 1 : belowLine;
                let anchor = selection.anchor;
                let active: vscode.Position;
                const currentLineEnd = editor.document.lineAt(activeLine).text.length;
                const toLineEnd = editor.document.lineAt(toLine).text.length;

                if (selection.isEmpty) {
                    anchor = new vscode.Position(activeLine, 0);
                    active = new vscode.Position(activeLine, currentLineEnd);
                } else if (!selection.isReversed) {
                    if (selection.end.character !== currentLineEnd)
                        active = new vscode.Position(activeLine, currentLineEnd);
                    else {
                        if (isDocEnd) return selection;
                        active = new vscode.Position(toLine, toLineEnd);
                    }
                } else { // active == start
                    if (selection.isSingleLine) {
                        active = new vscode.Position(toLine, currentLineEnd);
                        anchor = new vscode.Position(activeLine, 0);
                    } else {
                        active = new vscode.Position(toLine, 0);
                    }
                }
                return new vscode.Selection(anchor, active);
            });

            editor.selections = selections;

            const range = (<vscode.Range[]>selections).reduce((a, c) => a.union(c))
            editor.revealRange(range);
        });

        context.subscriptions.push(disposableDown);
    }

}