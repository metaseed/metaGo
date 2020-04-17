import * as vscode from 'vscode';

export class SelectLines {

    constructor(context: vscode.ExtensionContext) {
        let disposable = vscode.commands.registerCommand('metaGo.selectLineUp', () => {
            const editor = vscode.window.activeTextEditor;
            const currentLine = editor.selection.active.line;
            const upLine= currentLine - 1;
            const isDocStart = upLine <= 0;
            const toLine =  isDocStart ? 0: upLine;
            const selection = editor.selection;
            let anchor = selection.anchor;
            let active: vscode.Position;
            const currentLineEnd = editor.document.lineAt(currentLine).text.length;
            const toLineEnd = editor.document.lineAt(toLine).text.length;

            if (selection.isEmpty) {
                active = new vscode.Position(currentLine, 0);
                anchor = new vscode.Position(currentLine, currentLineEnd);
            } else if (selection.active == selection.start) {
                if (selection.start.character !== 0)
                    active = new vscode.Position(currentLine, 0);
                else { 
                    if(isDocStart) return;
                    active = new vscode.Position(toLine, 0);
                }
            } else { // active == end
                if(selection.isSingleLine) {
                    active = new vscode.Position(toLine, 0);
                    anchor = new vscode.Position(currentLine, currentLineEnd);                        
                } else {
                    active = new vscode.Position(toLine, toLineEnd);                        
                }
            }
            editor.selection = new vscode.Selection(anchor, active);
            editor.revealRange(editor.selection);
        });

        context.subscriptions.push(disposable);

        let disposableDown = vscode.commands.registerCommand('metaGo.selectLineDown', () => {
            const editor = vscode.window.activeTextEditor;
            const currentLine = editor.selection.active.line;
            const belowLine = currentLine + 1;
            const boundary = editor.document.lineCount;
            const isDocEnd = belowLine >= boundary -1;
            const toLine =  isDocEnd ? boundary-1: belowLine;
            const selection = editor.selection;
            let anchor = selection.anchor;
            let active: vscode.Position;
            const currentLineEnd = editor.document.lineAt(currentLine).text.length;
            const toLineEnd = editor.document.lineAt(toLine).text.length;

            if (selection.isEmpty) {
                anchor = new vscode.Position(currentLine, 0);
                active = new vscode.Position(currentLine, currentLineEnd);
            } else if (selection.active == selection.end) {
                if (selection.end.character !== currentLineEnd)
                    active = new vscode.Position(currentLine, currentLineEnd);
                else { 
                    if(isDocEnd) return;
                    active = new vscode.Position(toLine, toLineEnd);
                }
            } else { // active == start
                if(selection.isSingleLine) {
                    active = new vscode.Position(toLine, currentLineEnd);                        
                    anchor = new vscode.Position(currentLine, 0);
                } else {
                    active = new vscode.Position(toLine, 0);                        
                }
            }
            editor.selection = new vscode.Selection(anchor, active);
            editor.revealRange(editor.selection);
        });

        context.subscriptions.push(disposableDown);
    }

}