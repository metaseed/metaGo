import * as vscode from 'vscode';

export class Utilities {
    public static goto(editor: vscode.TextEditor, line: number = -1, character: number = -1, addCursor = false) {
        line = line === -1 ? editor.selection.active.line: line;
        character = character === -1 ? editor.selection.active.character: character;
        this.select(editor, line, character, line, character, addCursor);
    }

    public static select(editor: vscode.TextEditor, fromLine: number, fromCharacter: number, toLine: number, toCharacter: number, addCursor =false) {
        const startRange = new vscode.Position(fromLine, fromCharacter);
        const endRange = new vscode.Position(toLine, toCharacter);
        if(addCursor){
            editor.selections = [...editor.selections, new vscode.Selection(startRange, endRange)];
        } else {
            editor.selection = new vscode.Selection(startRange, endRange);
        }
        const range = new vscode.Range(startRange, endRange);
        editor.revealRange(range, vscode.TextEditorRevealType.InCenterIfOutsideViewport);
        this.focusColumn(editor.viewColumn)
    }
    
    private static focusColumn(i: number): void {
        let exec = vscode.commands.executeCommand
        if (i === 1) exec('workbench.action.focusFirstEditorGroup')
        else if (i === 2) exec('workbench.action.focusSecondEditorGroup')
        else if (i === 3) exec('workbench.action.focusThirdEditorGroup')
        else if (i === 4) exec('workbench.action.focusFourthEditorGroup')
        else if (i === 5) exec('workbench.action.focusFifthEditorGroup')
        else if (i === 6) exec('workbench.action.focusSixthEditorGroup')
        else if (i === 7) exec('workbench.action.focusSeventhEditorGroup')
        else if (i === 8) exec('workbench.action.focusEighthEditorGroup')
      }
    public static wait = m => new Promise(r => setTimeout(r, m))
}