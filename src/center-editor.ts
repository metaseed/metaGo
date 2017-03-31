import * as vscode from 'vscode';

export
    class CenterEditor {
    activate(context: vscode.ExtensionContext) {
        let disposable = vscode.commands.registerCommand('center-editor-window.center', () => {
            // The code you place here will be executed every time your command is executed
            const editor = vscode.window.activeTextEditor;
            const selection = editor.selection;
            const range = new vscode.Range(selection.start, selection.end);
            editor.revealRange(range, vscode.TextEditorRevealType.InCenter);
        });

        context.subscriptions.push(disposable);
    }
}