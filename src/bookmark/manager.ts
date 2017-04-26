import * as vscode from "vscode";
import fs = require("fs");
import { Document } from "./document";
import { BookmarkConfig } from './config';
import { Bookmark } from './bookmark';
import { History } from './history';

export class BookmarkModel {
    constructor(document: Document, bookmark: Bookmark) { }
}

export enum JumpDirection { FORWARD, BACKWARD };

export class BookmarkManager {
    public documents = new Map<string, Document>();
    public history = new History();
    public activeDocument: Document = undefined;


    public dispose() {
        this.zip();
    }

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
        // fix issue emptyAtLaunch
        if (!this.activeDocument) {
            let doc = this.addDocumentIfNotExist(vscode.window.activeTextEditor.document.uri.fsPath);
            this.activeDocument = doc;
        }

        this.activeDocument.toggleBookmark(new Bookmark(line, char));
    }

    public nextDocumentWithBookmarks(active: Document, direction: JumpDirection = JumpDirection.FORWARD): Promise<string> {
        let currentBookmark: Document = active;
        let currentBookmarkIndex: number;
        for (let index = 0; index < this.documents.length; index++) {
            let element = this.documents[index];
            if (element === active) {
                currentBookmarkIndex = index;
            }
        }

        return new Promise((resolve, reject) => {
            if (direction === JumpDirection.FORWARD) {
                currentBookmarkIndex++;
                if (currentBookmarkIndex === this.documents.length) {
                    currentBookmarkIndex = 0;
                }
            } else {
                currentBookmarkIndex--;
                if (currentBookmarkIndex === -1) {
                    currentBookmarkIndex = this.documents.length - 1;
                }
            }

            currentBookmark = this.documents[currentBookmarkIndex];

            if (currentBookmark.bookmarks.length === 0) {
                if (currentBookmark === this.activeDocument) {
                    resolve('');
                    return;
                } else {
                    this.nextDocumentWithBookmarks(currentBookmark, direction)
                        .then((nextDocument) => {
                            resolve(nextDocument);
                            return;
                        })
                        .catch((error) => {
                            reject(error);
                            return;
                        });
                }
            } else {
                if (fs.existsSync(currentBookmark.key)) {
                    resolve(currentBookmark.key);
                    return;
                } else {
                    this.nextDocumentWithBookmarks(currentBookmark, direction)
                        .then((nextDocument) => {
                            resolve(nextDocument);
                            return;
                        })
                        .catch((error) => {
                            reject(error);
                            return;
                        });
                }
            }

        });

    }

    public nextBookmark(direction: JumpDirection = JumpDirection.FORWARD): Promise<BookmarkModel> {
        return new Promise<BookmarkModel>((resolve, reject) => {
            const bm = direction === JumpDirection.FORWARD ? this.history.next() : this.history.previous();
            if (bm === null) {
                resolve(Bookmark.NO_BOOKMARKS);
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
            return resolve(new BookmarkModel(doc, doc.bookmarks[bm.bookmarkKey]));
        });
    }


}
