import * as vscode from 'vscode';

export class Utilities {
    public static goto(line: number, character: number) {
        this.select(line, character, line, character);
    }

    public static select(fromLine: number, fromCharacter: number, toLine: number, toCharacter: number) {
        let editor = vscode.window.activeTextEditor;
        const startRange = new vscode.Position(fromLine, fromCharacter);
        const endRange = new vscode.Position(toLine, toCharacter);
        editor.selection = new vscode.Selection(startRange, endRange);
        const range = new vscode.Range(startRange, endRange);
        editor.revealRange(range, vscode.TextEditorRevealType.InCenterIfOutsideViewport);
    }

    public static anchorPosition(selection: vscode.Selection) {
        return selection.active.line === selection.end.line ? selection.start : selection.end
    }

    public static wait = m => new Promise(r => setTimeout(r, m))
}