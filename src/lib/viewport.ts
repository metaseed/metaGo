import * as vscode from "vscode";
import { Cursor } from "./cursor";

export class ViewPort {
    private _linesInViewPort: number;

    getVisiableRanges = (editor: vscode.TextEditor) => editor.visibleRanges;

    // not support fold
    getViewPortBoundary = async (editor: vscode.TextEditor) => {
        let fromLine = editor.selection.active.line;
        let fromChar = editor.selection.active.character;
        await Cursor.toTop();
        let topLine = editor.selection.active.line;
        let bottom = await Cursor.toBottom();
        let bottomLine = editor.selection.active.line;
        let margin = bottomLine - topLine;
        // back
        editor.selection = new vscode.Selection(new vscode.Position(fromLine, fromChar), new vscode.Position(fromLine, fromChar));
        return margin;
    }
    // private viewPortCenter():number{
    //  when getCenterLineInViewPort exposed to extension we should switch
    //  to this api
    //  cursor.cursors.primaryCursor.getCenterLineInViewPort();
    // }

}
