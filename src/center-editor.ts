import * as vscode from 'vscode';

export class CenterEditor {
    activate(context: vscode.ExtensionContext) {
        let disposable = vscode.commands.registerCommand('extension.metaGo.centerEditor', () => {
            const editor = vscode.window.activeTextEditor;
            const selection = editor.selection;
            const range = new vscode.Range(selection.start, selection.end);
            editor.revealRange(range, vscode.TextEditorRevealType.InCenter);
        });

        context.subscriptions.push(disposable);
    }
}