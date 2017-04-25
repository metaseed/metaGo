import * as vscode from "vscode";
import fs = require("fs");
import { Document, JumpDirection } from "./document";
import { BookmarkConfig } from './config';
import { Bookmark } from './bookmark';
import { History } from './history';

export class BookmarkManager {
    public documents = new Map<string, Document>();
    public history = new History();
    public activeDocument: Document = undefined;

    constructor() { }

    public dispose() {
        this.zip();
    }

    public loadFrom(jsonObject, relativePath?: boolean) {
        if (jsonObject === "") {
            return;
        }

        let jsonBookmarks = jsonObject.bookmarks;
        for (let idx = 0; idx < jsonBookmarks.length; idx++) {
            let jsonBookmark = jsonBookmarks[idx];

            // each bookmark (line)
            this.addDocumentIfNotExist(jsonBookmark.fsPath);
            for (let element of jsonBookmark.bookmarks) {
                this.documents[idx].bookmarks.push(element);
            }
        }

        if (relativePath) {
            for (let element of this.documents) {
                element.key = element.key.replace("$ROOTPATH$", vscode.workspace.rootPath);
            }
        }
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

    public nextBookmark(active: Document, position: vscode.Position) {
        let currentLine: number = position.line;
        let currentDoc: Document = active;
        let currentBookmarkId: number;
        for (let index = 0; index < this.documents.length; index++) {
            let element = this.documents[index];
            if (element === active) {
                currentBookmarkId = index;
            }
        }

        return new Promise((resolve, reject) => {
            currentDoc.nextBookmark(position)
                .then((bookmark) => {
                    resolve(bookmark);
                    return;
                })
                .catch((error) => {
                    // next document
                    currentBookmarkId++;
                    if (currentBookmarkId === this.documents.length) {
                        currentBookmarkId = 0;
                    }
                    currentDoc = this.documents[currentBookmarkId];

                });

        });
    }

    public zip(relativePath?: boolean): BookmarkManager {
        function isNotEmpty(book: Document): boolean {
            return book.bookmarks.length > 0;
        }

        let newBookmarks: BookmarkManager = new BookmarkManager();
        newBookmarks.documents = JSON.parse(JSON.stringify(this.documents)).filter(isNotEmpty);

        if (!relativePath) {
            return newBookmarks;
        }

        for (let element of newBookmarks.documents) {
            element.key = element.key.replace(vscode.workspace.rootPath, "$ROOTPATH$");
        }
        return newBookmarks;
    }
}
