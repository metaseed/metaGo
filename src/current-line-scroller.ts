import * as vscode from 'vscode';

export class CurrentLineScroller {
    activate(context: vscode.ExtensionContext) {
        let disposable = vscode.commands.registerCommand('extension.metaGo.currentLineToCenter', () => {
            const editor = vscode.window.activeTextEditor;
            const selection = editor.selection;
            const range = new vscode.Range(selection.start, selection.end);
            editor.revealRange(range, vscode.TextEditorRevealType.InCenter);
        });
        let disposableToTop = vscode.commands.registerCommand('extension.metaGo.currentLineToTop', () => {
            const editor = vscode.window.activeTextEditor;
            const selection = editor.selection;
            const range = new vscode.Range(selection.start, selection.end);
            editor.revealRange(range, vscode.TextEditorRevealType.AtTop);
        });

        context.subscriptions.push(disposable);
    }
}