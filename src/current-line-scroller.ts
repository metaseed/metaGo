import * as vscode from 'vscode';
import { ViewPort } from './lib/viewport';
export class CurrentLineScroller {
    private _viewPort = new ViewPort();
    constructor(context: vscode.ExtensionContext) {
        let disposable = vscode.commands.registerCommand('metaGo.currentLineToCenter', () => {
            const editor = vscode.window.activeTextEditor;
            const selection = editor.selection;
            const range = new vscode.Range(selection.start, selection.end);
            editor.revealRange(range, vscode.TextEditorRevealType.InCenter);
        });
        context.subscriptions.push(disposable);

        let disposableToTop = vscode.commands.registerCommand('metaGo.currentLineToTop', () => {
            const editor = vscode.window.activeTextEditor;
            const selection = editor.selection;
            const range = new vscode.Range(selection.start, selection.end);
            editor.revealRange(range, (vscode.TextEditorRevealType as any).AtTop);
        });
        context.subscriptions.push(disposableToTop);

        let disposableToBottom = vscode.commands.registerCommand('metaGo.currentLineToBottom', () => {
            const editor = vscode.window.activeTextEditor;
            const selection = editor.selection;
            let currentLine = editor.selection.active.line;
            this._viewPort.getViewPortBoundary()
                .then((boundary) => {
                    let line = currentLine - Math.trunc(boundary / 2);
                    line = Math.max(0, line);
                    let p = new vscode.Position(line, 0)
                    const range = new vscode.Range(p, p);

                    editor.revealRange(range, vscode.TextEditorRevealType.InCenter);
                });
        });
        context.subscriptions.push(disposableToBottom);

    }
}