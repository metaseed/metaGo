import * as vscode from "vscode";
import fs = require("fs");

import { BookmarkConfig } from './config';
export const NO_BOOKMARKS = -1;
export const NO_MORE_BOOKMARKS = -2;

export const JUMP_FORWARD = 1;
export const JUMP_BACKWARD = -1;
export enum JUMP_DIRECTION { JUMP_FORWARD, JUMP_BACKWARD };

export class BookmarkItem {
    constructor(public label: string, public description: string, public detail?: string,
        public commandId?: string) { }
}

export class BookmarkLocation {
    constructor(public line: number, public char: number) { }
}

export class Bookmark {

    public fsPath: string;
    public bookmarks: BookmarkLocation[];

    constructor(fsPath: string) {
        this.fsPath = fsPath;
        this.bookmarks = [];

    }

    public nextBookmark(currentLine: number, direction: JUMP_DIRECTION = JUMP_FORWARD) {

        let navigateThroughAllFiles = vscode.workspace.getConfiguration("metaGo")
            .get("bookmark.navigateThroughAllFiles", true);

        return new Promise((resolve, reject) => {

            if (typeof this.bookmarks === "undefined") {
                reject('typeof this.bookmarks == "undefined"');
                return;
            }

            if (this.bookmarks.length === 0) {
                if (navigateThroughAllFiles) {
                    resolve(NO_BOOKMARKS);
                    return;
                } else {
                    resolve(currentLine);
                    return;
                }
            }

            let nextBookmark: number;

            if (direction === JUMP_FORWARD) {
                for (let location of this.bookmarks) {
                    if (location.line > currentLine) {
                        nextBookmark = location.line;
                        break;
                    }
                }

                if (typeof nextBookmark === "undefined") {
                    if (navigateThroughAllFiles) {
                        resolve(NO_MORE_BOOKMARKS);
                        return;
                    } else {
                        resolve(this.bookmarks[0].line);
                        return;
                    }
                } else {
                    resolve(nextBookmark);
                    return;
                }
            } else { // JUMP_BACKWARD
                for (let index = this.bookmarks.length - 1; index >= 0; --index) {
                    let location = this.bookmarks[index];
                    if (location.line < currentLine) {
                        nextBookmark = location.line;
                        break;
                    }
                }
                if (typeof nextBookmark === "undefined") {
                    if (navigateThroughAllFiles) {
                        resolve(NO_MORE_BOOKMARKS);
                        return;
                    } else {
                        resolve(this.bookmarks[this.bookmarks.length - 1].line);
                        return;
                    }
                } else {
                    resolve(nextBookmark);
                    return;
                }
            }
        });
    }

    public listBookmarks() {

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
                    let element = this.bookmarks[index].line + 1;
                    // check for 'invalidated' bookmarks, when its outside the document length
                    if (element <= doc.lineCount) {
                        let lineText = doc.lineAt(element - 1).text;
                        let normalizedPath = doc.uri.fsPath;
                        items.push(new BookmarkItem(
                            element.toString(),
                            lineText,
                            normalizedPath
                        ));
                    } else {
                        invalids.push(element);
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
