import * as vscode from 'vscode';

export class SelectLines {

    constructor(context: vscode.ExtensionContext) {
        let disposable = vscode.commands.registerCommand('metaGo.selectLineUp', () => {
            const editor = vscode.window.activeTextEditor;
            const aboveLine = editor.selection.active.line - 1;
            const toLine = aboveLine >= 0 ? aboveLine : 0;
            const selection = editor.selection;
            let anchor = selection.anchor;
            if (selection.isEmpty)
                anchor = new vscode.Position(anchor.line + 1, 0);

            editor.selection = new vscode.Selection(anchor, new vscode.Position(toLine, 0));
            editor.revealRange(new vscode.Range(editor.selection.start, editor.selection.end));
        });

        context.subscriptions.push(disposable);

        let disposableDown = vscode.commands.registerCommand('metaGo.selectLineDown', () => {
            const editor = vscode.window.activeTextEditor;
            const belowLine = editor.selection.active.line + 1;
            const boundary = editor.document.lineCount;
            const toLine = belowLine <= boundary ? belowLine : boundary;
            const selection = editor.selection;
            let anchor = selection.anchor;
            if (selection.isEmpty)
                anchor = new vscode.Position(anchor.line, 0);
                
            editor.selection = new vscode.Selection(anchor, new vscode.Position(toLine, 0));
            editor.revealRange(new vscode.Range(editor.selection.start, editor.selection.end));
        });

        context.subscriptions.push(disposableDown);
    }

}