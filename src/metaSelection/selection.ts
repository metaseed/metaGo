import * as vscode from 'vscode';

export class Selection {
    constructor(context: vscode.ExtensionContext) {
        context.subscriptions.push(vscode.commands.registerTextEditorCommand('metaGo.selectionSwitchActiveWithAnchor',
            editor => {
                const selections = editor.selections.map(
                    selection => {
                        const active = selection.active;
                        const anchor = selection.anchor;
                        return new vscode.Selection(active, anchor);
                    }
                );
                editor.selections = selections;
            }
        ));
    }
}