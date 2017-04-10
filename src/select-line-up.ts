import * as vscode from 'vscode';

export class SelectLineUp {
    activate(context: vscode.ExtensionContext) {
        let disposable = vscode.commands.registerCommand('extension.metaGo.selectLineUp', () => {
            const editor = vscode.window.activeTextEditor;
            const selection = editor.selection;
            const range = new vscode.Range(selection.start, selection.end);
            editor.revealRange(range, vscode.TextEditorRevealType.InCenter);
        });

        context.subscriptions.push(disposable);
    }
}