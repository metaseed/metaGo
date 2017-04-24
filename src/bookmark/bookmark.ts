import * as vscode from "vscode";

export class Bookmark {
    public static NO_MORE_BOOKMARKS = new Bookmark(-2, 0);
    public static NO_BOOKMARKS = new Bookmark(-1, 0);

    constructor(public line: number, public char: number) { }

    static GetFrom(position: vscode.Position) {
        return new Bookmark(position.line, position.character);
    }

    getPosition(): vscode.Position {
        return new vscode.Position(this.line, this.char);
    }
}
