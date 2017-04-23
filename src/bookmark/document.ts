import * as vscode from "vscode";
import fs = require("fs");

import { BookmarkConfig } from './config';

export enum JumpDirection { FORWARD, BACKWARD };

export class BookmarkItem {
    constructor(public label: string,
        public description: string,
        public detail?: string,
        public commandId?: string,
        public location?: Bookmark) { }
}

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

export class Document {

    public fsPath: string;
    public bookmarks: Bookmark[];

    constructor(fsPath: string) {
        this.fsPath = fsPath;
        this.bookmarks = [];

    }

    public nextBookmark(position: vscode.Position,
        direction: JumpDirection = JumpDirection.FORWARD): Promise<Bookmark> {

        let currentLine: number = position.line;

        return new Promise((resolve, reject) => {
            if (this.bookmarks.length === 0) {
                resolve(Bookmark.NO_BOOKMARKS);
                return;
            }

            let nextBookmark: Bookmark;

            if (direction === JumpDirection.FORWARD) {
                for (let location of this.bookmarks) {
                    if (location.line > currentLine) {
                        nextBookmark = location;
                        break;
                    }
                }

                if (typeof nextBookmark === "undefined") {
                    resolve(Bookmark.NO_MORE_BOOKMARKS);
                    return;
                } else {
                    resolve(nextBookmark);
                    return;
                }
            } else { // JUMP_BACKWARD
                for (let index = this.bookmarks.length - 1; index >= 0; --index) {
                    let location = this.bookmarks[index];
                    if (location.line < currentLine) {
                        nextBookmark = location;
                        break;
                    }
                }
                if (typeof nextBookmark === "undefined") {
                    resolve(Bookmark.NO_MORE_BOOKMARKS);
                    return;
                } else {
                    resolve(nextBookmark);
                    return;
                }
            }
        });
    }

    public listBookmarks(): Promise<Array<BookmarkItem>> {
        return new Promise((resolve, reject) => {
            // no bookmark, returns empty
            if (this.bookmarks.length === 0) {
                resolve({});
                return;
            }

            // file does not exist, returns empty
            if (!fs.existsSync(this.fsPath)) {
                resolve({});
                return;
            }

            let uriDocBookmark: vscode.Uri = vscode.Uri.file(this.fsPath);
            vscode.workspace.openTextDocument(uriDocBookmark).then(doc => {
                let items = [];
                let invalids = [];

                // tslint:disable-next-line:prefer-for-of
                for (let index = 0; index < this.bookmarks.length; index++) {
                    let lineNumber = this.bookmarks[index].line + 1;
                    // check for 'invalidated' bookmarks, when its outside the document length
                    if (lineNumber <= doc.lineCount) {
                        let lineText = doc.lineAt(lineNumber - 1).text;
                        let normalizedPath = doc.uri.fsPath;
                        items.push(new BookmarkItem(
                            lineNumber.toString(),
                            lineText,
                            normalizedPath, null, this.bookmarks[index]
                        ));
                    } else {
                        invalids.push(lineNumber);
                    }
                }
                if (invalids.length > 0) {
                    let idxInvalid: number;
                    // tslint:disable-next-line:prefer-for-of
                    for (let indexI = 0; indexI < invalids.length; indexI++) {
                        idxInvalid = this.bookmarks.findIndex((i) => i.line === (invalids[indexI] - 1));
                        this.bookmarks.splice(idxInvalid, 1);
                    }
                }

                resolve(items);
                return;
            });
        });
    }

    public clear() {
        this.bookmarks.length = 0;
    }
}
