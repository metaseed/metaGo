import * as vscode from 'vscode';

export class Selection {
    constructor(context: vscode.ExtensionContext) {
        context.subscriptions.push(vscode.commands.registerTextEditorCommand('metaGo.selectionSwitchActiveWithAnchor',
            (editor, edit)=>{
                const selections =editor.selections.map(
                    (selection, i, a) => {
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