import * as vscode from "vscode";

export class ViewPort {
    private _linesInViewPort: number;

    async moveCursorToCenter(select: boolean) {
        await vscode.commands.executeCommand("cursorMove", {
            to: 'viewPortCenter',
            select: select
        });
    }

    getViewPortBoundary = () => {
        let editor = vscode.window.activeTextEditor;
        let fromLine = editor.selection.active.line;
        let fromChar = editor.selection.active.character;
        vscode.commands.executeCommand("cursorMove", {
            to: 'viewPortTop',
            select: false
        }).then(() => {
            let topLine = editor.selection.active.line;
            vscode.commands.executeCommand("cursorMove", {
                to: 'viewPortBottom',
                select: false
            })
                .then(() => {
                    let bottomLine = editor.selection.active.line;
                    let margin = bottomLine - topLine;
                    // back
                    editor.selection = new vscode.Selection(new vscode.Position(fromLine, fromChar), new vscode.Position(fromLine, fromChar));
                    this._linesInViewPort = margin;
                    return margin;
                });

        });


    }
    // private viewPortCenter():number{
    //  when getCenterLineInViewPort exposed to extension we should switch
    //  to this api
    //  cursor.cursors.primaryCursor.getCenterLineInViewPort();
    // }

}
