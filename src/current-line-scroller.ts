import * as vscode from 'vscode';
import { ViewPort } from './lib/viewport';

// todo: test revealLine command: 
// https://code.visualstudio.com/api/references/commands
export class CurrentLineScroller {
    private _viewPort = new ViewPort();
    constructor(context: vscode.ExtensionContext) {
        let disposable = vscode.commands.registerCommand('metaGo.scrollCurrentLineToMiddle', () => {
            const editor = vscode.window.activeTextEditor;
            const selection = editor.selection;
            const range = new vscode.Range(selection.start, selection.end);
            editor.revealRange(range, vscode.TextEditorRevealType.InCenter);
        });
        context.subscriptions.push(disposable);

        let disposableToTop = vscode.commands.registerCommand('metaGo.scrollCurrentLineToTop', () => {
            const editor = vscode.window.activeTextEditor;
            const selection = editor.selection;
            const range = new vscode.Range(selection.start, selection.end);
            editor.revealRange(range, vscode.TextEditorRevealType.AtTop);
        });
        context.subscriptions.push(disposableToTop);

        let disposableToBottom = vscode.commands.registerCommand('metaGo.scrollCurrentLineToBottom', async () => {
            const editor = vscode.window.activeTextEditor;
            const selection = editor.selection;
            let currentLine = selection.active.line;
            await vscode.commands.executeCommand("revealLine", {
                at: 'bottom', // we also have top and center
                lineNumber: currentLine
            });
            // bellow is another way to caculate the bottom(note: not support fold):(not used because we have internal command revealLine.bottom)
            // let boundary = await this._viewPort.getViewPortBoundary(editor);// not support folder
            // let line = currentLine - Math.trunc(boundary / 2);
            // line = Math.max(0, line);
            // let p = new vscode.Position(line, 0)
            // const range = new vscode.Range(p, p);
            // editor.revealRange(range, vscode.TextEditorRevealType.InCenter);
        });
        context.subscriptions.push(disposableToBottom);

    }
}