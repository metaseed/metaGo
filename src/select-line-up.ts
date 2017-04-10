import * as vscode from 'vscode';

export class SelectLineUp {
    activate(context: vscode.ExtensionContext) {
        let disposable = vscode.commands.registerCommand('extension.metaGo.selectLineUp', () => {
            const editor = vscode.window.activeTextEditor;
            const line =editor.selection.active.line;
//todo
        });

        context.subscriptions.push(disposable);
    }
}