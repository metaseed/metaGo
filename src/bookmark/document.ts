import * as vscode from "vscode";
import fs = require("fs");

import { BookmarkConfig } from './config';
import { Bookmark } from './bookmark';
import { History } from './history';



export class BookmarkItem {
    constructor(public label: string,
        public description: string,
        public detail?: string,
        public commandId?: string,
        public location?: Bookmark) { }
}

export class Document {
    public bookmarks = new Map<string, Bookmark>();

    constructor(public key: string, private history: History) { }

    public static normalize(uri: string): string {
        // a simple workaround for what appears to be a vscode.Uri bug
        // (inconsistent fsPath values for the same document, ex. ///foo/x.cpp and /foo/x.cpp)
        return uri.replace("///", "/");
    }

    public addBookmark(bookmark: Bookmark) {
        let key = bookmark.toString();
        if (this.bookmarks.has(key)) {
            return;
        }
        this.bookmarks.set(key, bookmark);
        this.history.add(this.key, bookmark.key);
    }

    public removeBookmark(bookmark: Bookmark) {
        let key = bookmark.toString();
        if (!this.bookmarks.has(key)) {
            return;
        }
        this.bookmarks.delete(key);
        this.history.remove(this.key, bookmark.key);
    }

    public toggleBookmark(bookmark: Bookmark) {
        if (this.bookmarks.has(bookmark.key)) {
            this.addBookmark(bookmark);
        } else {
            this.removeBookmark(bookmark);
        }
    }

    public listBookmarks(): Promise<Array<BookmarkItem>> {
        return new Promise((resolve, reject) => {
            if (this.bookmarks.size === 0) {
                this.history.clear();
                resolve([]);
                return;
            }

            if (!fs.existsSync(this.key)) {
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
                            lineNumber.toString(),
                            lineText,
                            normalizedPath, null, value
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

    public clear() {
        this.bookmarks.clear();
        this.history.removeDoc(this.key);
    }

}
