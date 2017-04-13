import * as vscode from 'vscode';

export class SelectLineUp {
    constructor(context: vscode.ExtensionContext) {
        let disposable = vscode.commands.registerCommand('extension.metaGo.selectLineUp', () => {
            const editor = vscode.window.activeTextEditor;
            const line = editor.selection.active.line - 1;
            const selection = editor.selection;
            let anchor = selection.active.line === selection.start.line ? selection.end : selection.start;
            if (selection.isEmpty)
                anchor = new vscode.Position(anchor.line, 0);
            const toLine = line >= 0 ? line : 0;
            editor.selection = new vscode.Selection(
                anchor,
                new vscode.Position(toLine, 0));
            editor.revealRange(new vscode.Range(editor.selection.start, editor.selection.end));

        });

        context.subscriptions.push(disposable);

        let disposableD = vscode.commands.registerCommand('extension.metaGo.selectLineDown', () => {
            const editor = vscode.window.activeTextEditor;
            const line = editor.selection.active.line + 1;
            const selection = editor.selection;
            let anchor = selection.active.line === selection.end.line ? selection.start : selection.end;
            if (selection.isEmpty)
                anchor = new vscode.Position(anchor.line, 0);
            const boundary = editor.document.lineCount;
            const toLine = line <= boundary ? line : boundary;
            editor.selection = new vscode.Selection(
                anchor,
                new vscode.Position(toLine, 0));
            editor.revealRange(new vscode.Range(editor.selection.start, editor.selection.end));

        });

        context.subscriptions.push(disposableD);
    }
}