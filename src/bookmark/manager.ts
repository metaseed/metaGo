import * as vscode from "vscode";
import fs = require("fs");
import { Document } from "./model/document";
import { BookmarkConfig } from './config';
import { Bookmark } from './model/bookmark';
import { History } from './model/history';
import { BookmarkLocation, JumpDirection } from './model/location';

export class BookmarkManager {
    public documents = new Map<string, Document>();
    public history = new History();
    public activeDocument: Document = undefined;

    public addDocumentIfNotExist(uri: string): Document {
        uri = Document.normalize(uri);
        let existing: Document = this.documents[uri];

        if (typeof existing === "undefined") {
            let doc = new Document(uri, this.history);
            this.documents[uri] = doc;
            return doc;
        }
        return existing;
    }

    public toggleBookmark() {
        if (!vscode.window.activeTextEditor) {
            vscode.window.showInformationMessage("Open a file first to toggle bookmarks");
            return;
        }

        let line = vscode.window.activeTextEditor.selection.active.line;
        let char = vscode.window.activeTextEditor.selection.active.character;

        if (!this.activeDocument) {
            let doc = this.addDocumentIfNotExist(vscode.window.activeTextEditor.document.uri.fsPath);
            this.activeDocument = doc;
        }

        this.activeDocument.toggleBookmark(new Bookmark(line, char));
    }

    public nextBookmark(direction: JumpDirection = JumpDirection.FORWARD): Promise<BookmarkLocation> {
        return new Promise<BookmarkLocation>((resolve, reject) => {
            const bm = direction === JumpDirection.FORWARD ? this.history.next() : this.history.previous();
            if (bm === null) {
                resolve(BookmarkLocation.NO_BOOKMARKS);
                return;
            }

            if (!this.documents.has(bm.documentKey)) {
                this.history.removeDoc(bm.documentKey);
                this.nextBookmark().then((bm) => resolve(bm)).catch((e) => reject(e));
                return;
            }

            if (!this.documents[bm.documentKey].bookmarks.has(bm.bookmarkKey)) {
                this.history.remove(bm.documentKey, bm.bookmarkKey);
                this.nextBookmark().then((bm) => resolve(bm)).catch((e) => reject(e));
                return;
            }

            if (!fs.existsSync(bm.documentKey)) {
                this.documents.delete(bm.documentKey);
                this.history.removeDoc(bm.documentKey);
                this.nextBookmark().then((bm) => resolve(bm)).catch((e) => reject(e));
                return;
            }

            const doc = this.documents[bm.documentKey];
            return resolve(new BookmarkLocation(doc, doc.bookmarks[bm.bookmarkKey]));
        });
    }

    public get size(): number {
        let counter = 0;
        for (let [key, doc] of this.documents) {
            counter += doc.bookmarks.size;
        }
        return counter;
    }

    public clear() {
        for (let [key, doc] of this.documents) {
            doc.clear();
        }
    }

}
