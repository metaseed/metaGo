import * as vscode from "vscode";
import fs = require("fs");

import { BookmarkConfig } from '../config';
import { Bookmark } from './bookmark';
import { History } from './history';
import { BookmarkLocation } from './location';

export class BookmarkItem implements vscode.QuickPickItem {
    constructor(public label: string,
        public description: string,
        public detail?: string,
        public commandId?: string,
        public location?: BookmarkLocation) { }
}

export class Document {
    public bookmarks = new Map<string, Bookmark>();

    constructor(public key: string, public history: History) { }

    public static normalize(uri: string): string {
        // a simple workaround for what appears to be a vscode.Uri bug
        // (inconsistent fsPath values for the same document, ex. ///foo/x.cpp and /foo/x.cpp)
        return uri.replace("///", "/");
    }

    public addBookmark = (bookmark: Bookmark) => {
        let key = bookmark.key;

        if (this.bookmarks.has(key)) {
            return;
        }

        this.bookmarks.set(key, bookmark);
        this.history.add(this.key, key);
    }

    public removeBookmark = (bookmark: Bookmark | string) => {
        let key: string;

        if (typeof bookmark === 'string') {
            key = bookmark;
        } else {
            key = bookmark.key;
        }

        if (!this.bookmarks.has(key)) {
            return;
        }
        this.bookmarks.delete(key);
        this.history.remove(this.key, key);
    }

    public toggleBookmark = (bookmark: Bookmark) => {
        if (this.bookmarks.has(bookmark.key)) {
            this.removeBookmark(bookmark);
        } else {
            this.addBookmark(bookmark);
        }
    }

    public getBookmarkKeys(line: number, char: number = -1) {
        const bms = [];
        for (let [key, bm] of this.bookmarks) {
            let charEqual = true;
            if (char !== -1) {
                charEqual = bm.char === char;
            }
            if (bm.line === line && charEqual) {
                bms.push(key);
            }
        }
        return bms;
    }

    public getBookmarks(line: number, char: number = -1) {
        const bms = [];
        for (let [key, bm] of this.bookmarks) {
            let charEqual = true;
            if (char !== -1) {
                charEqual = bm.char === char;
            }
            if (bm.line === line && charEqual) {
                bms.push(bm);
            }
        }
        return bms;
    }

    public modifyBookmark(bookmark: Bookmark, toLine: number, toChar: number = -1) {
        const keyBackup = bookmark.key;
        if (bookmark.line === toLine && (toChar === -1 || bookmark.char === toChar)) return;

        this.bookmarks.delete(keyBackup);
        bookmark.line = toLine;
        if (toChar != -1) bookmark.char = toChar;

        let bmReturn: Bookmark = null;
        if (this.bookmarks.has(bookmark.key)) {
            bmReturn = this.bookmarks.get(bookmark.key);
            this.bookmarks.delete(bookmark.key);
        }

        this.bookmarks.set(bookmark.key, bookmark);
        this.history.modify(this.key, keyBackup, bookmark.key);
        return bmReturn;
    }

    public modifyBookmarkByLine(line: number, toLine: number, char: number = -1, toChar: number = -1) {

    }

    public removeBookmarks(line: number): boolean {
        const bms = this.getBookmarkKeys(line);
        bms.forEach(key => this.removeBookmark(key));
        return bms.length > 0;
    }

    public getBookmarkItems = (): Promise<Array<BookmarkItem>> => {
        return new Promise((resolve, reject) => {
            if (this.bookmarks.size === 0 || !fs.existsSync(this.key)) {
                this.history.removeDoc(this.key);
                resolve([]);
                return;
            }

            let uriDocBookmark: vscode.Uri = vscode.Uri.file(this.key);
            vscode.workspace.openTextDocument(uriDocBookmark).then(doc => {
                let items = [];
                let invalids = [];

                for (let [key, value] of this.bookmarks) {
                    let lineNumber = value.line + 1;
                    if (lineNumber <= doc.lineCount) {
                        let lineText = doc.lineAt(lineNumber - 1).text;
                        let normalizedPath = Document.normalize(doc.uri.fsPath);
                        items.push(new BookmarkItem(
                            `${lineNumber}`,
                            lineText,
                            normalizedPath, null, new BookmarkLocation(this, value)
                        ));
                    } else {
                        invalids.push(key);
                    }
                }
                if (invalids.length > 0) {
                    invalids.forEach((key) => {
                        this.bookmarks.delete(key)
                        this.history.remove(this.key, key)
                    });
                }

                resolve(items);
                return;
            });
        });
    }

    /**
     * clear bookmarks
     */
    public clear = () => {
        this.bookmarks.clear();
        this.history.removeDoc(this.key);
    }

}
