import * as vscode from "vscode";

export class Bookmark {
    constructor(public line: number, public char: number) { }

    static GetFrom(position: vscode.Position) {
        return new Bookmark(position.line, position.character);
    }

    getPosition(): vscode.Position {
        return new vscode.Position(this.line, this.char);
    }

    public get key(): string {
        return this.line + ':' + this.char;
    }
}
