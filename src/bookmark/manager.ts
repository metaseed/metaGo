import * as vscode from "vscode";
import fs = require("fs");
import { Document } from "./model/document";
import { Bookmark } from './model/bookmark';
import { History } from './model/history';
import { BookmarkLocation, JumpDirection } from './model/location';

export class BookmarkManager {
    public documents = new Map<string, Document>();
    public history = new History();
    private _activeDocument: Document = undefined;

    public get activeDocument() {
        return this._activeDocument;
    }
    public set activeDocument(doc: Document) {
        this._activeDocument = doc;
        if (!this.documents.has(doc.key)) {
            this.documents.set(doc.key, doc);
        }
    }

    public addDocumentIfNotExist = (uri: string, document?: Document): Document => {
        uri = Document.normalize(uri);

        if (!this.documents.has(uri)) {
            let doc: Document;
            if (document) {
                doc = document;
            } else {
                doc = new Document(uri, this.history);
            }
            this.documents.set(uri, doc);
            return doc;
        }
        return this.documents.get(uri);
    }

    public tidyBookmarks = async () => {
        for (let [key, doc] of this.documents) {
            await doc.getBookmarkItems();
            if (doc.bookmarks.size === 0) {
                this.documents.delete(key);
            }
        }
    }

    public toggleBookmark = () => {
        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage("Put the cursor to the text editor to toggle bookmarks");
            return;
        }

        let line = editor.selection.active.line;
        let char = editor.selection.active.character;

        let doc = this.addDocumentIfNotExist(vscode.window.activeTextEditor.document.uri.fsPath);
        this.activeDocument = doc;

        this.activeDocument.toggleBookmark(new Bookmark(line, char));
    }

    public nextBookmark = (direction: JumpDirection = JumpDirection.FORWARD): Promise<BookmarkLocation> => {
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

            if (!this.documents.get(bm.documentKey).bookmarks.has(bm.bookmarkKey)) {
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

            const doc = this.documents.get(bm.documentKey);
            return resolve(new BookmarkLocation(doc, doc.bookmarks.get(bm.bookmarkKey)));
        });
    }

    public get size(): number {
        let counter = 0;
        let func = () => {
            for (let [key, doc] of this.documents) {
                counter += doc.bookmarks.size;
            }
        };
        func();
        return counter;
    }

    public clear = () => {
        for (let [key, doc] of this.documents) {
            doc.clear();
        }
    }

}
