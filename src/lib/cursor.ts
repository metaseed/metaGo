import * as vscode from 'vscode';
export class Cursor {
    // https://code.visualstudio.com/api/references/commands
    // search
   static async toCenter(select = false) {
        await vscode.commands.executeCommand("cursorMove", {
            to: 'viewPortCenter',
            select: select
        });
    }

   static async toTop(select = false) {
        await vscode.commands.executeCommand("cursorMove", {
            to: 'viewPortTop',
            select: select
        });
    }

    static async toBottom(select = false) {
        await vscode.commands.executeCommand("cursorMove", {
            to: 'viewPortBottom',
            select: select
        });
    }

    static async toWrappedLineStart(select = false) {
        await vscode.commands.executeCommand("cursorMove", {
            to: 'wrappedLineStart',
            select: select
        });
    }

    static async toWrappedLineEnd(select = false) {
        await vscode.commands.executeCommand("cursorMove", {
            to: 'wrappedLineEnd',
            select: select
        });
    }
    static async toWrappedLineFirstNonWhitespaceCharacter(select = false) {
        await vscode.commands.executeCommand("cursorMove", {
            to: 'wrappedLineFirstNonWhitespaceCharacter',
            select: select
        });
    }
    static async toWrappedLineLastNonWhitespaceCharacter(select = false) {
        await vscode.commands.executeCommand("cursorMove", {
            to: 'wrappedLineLastNonWhitespaceCharacter',
            select: select
        });
    }
    static async toWrappedLineColumnCenter(select = false) {
        await vscode.commands.executeCommand("cursorMove", {
            to: 'wrappedLineColumnCenter',
            select: select
        });
    }

    static to(editor: vscode.TextEditor, lineIndex:number, charIndex:number ){
        editor.selection = new vscode.Selection(new vscode.Position(lineIndex, charIndex), new vscode.Position(lineIndex, charIndex));
    }
    
    static locations(editor: vscode.TextEditor) {
        return editor.selections;
    }
}
