import * as vscode from "vscode";
import fs = require("fs");
import { Document, JumpDirection } from "./document";
import { BookmarkConfig } from './config';
import { Bookmark } from './bookmark';
import { History } from './history';

export class BookmarkManager {

    public static normalize(uri: string): string {
        // a simple workaround for what appears to be a vscode.Uri bug
        // (inconsistent fsPath values for the same document, ex. ///foo/x.cpp and /foo/x.cpp)
        return uri.replace("///", "/");
    }

    public documents: Document[];
    public history: History = new History();
    public activeDocument: Document = undefined;

    constructor() {
        this.documents = [];
        this.history = [];
    }

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
                element.fsPath = element.fsPath.replace("$ROOTPATH$", vscode.workspace.rootPath);
            }
        }
    }

    public findDocument(uri: string) {
        uri = BookmarkManager.normalize(uri);
        return this.documents.find((doc) => doc.fsPath === uri);
    }

    public addBookmark(lineIndex: number, charIndex: number, doc: Document = this.activeDocument) {
        let bookmarkIndex = doc.bookmarks.findIndex((bk) => bk.line > lineIndex);
        if (bookmarkIndex === -1) { bookmarkIndex = doc.bookmarks.length; }
        doc.bookmarks.splice(bookmarkIndex, 0, new Bookmark(lineIndex, charIndex));
        const docIndex = this.documents.indexOf(doc);
        this.history.add(docIndex, bookmarkIndex);
    }

    public removeBookmark(lineIndex: number, charIndex: number = -1, doc: Document = this.activeDocument) {
        let bkIndex = doc.findIndex(lineIndex, charIndex);
        doc.bookmarks.splice(bkIndex, 1);
        const docIndex = this.documents.indexOf(doc);
        this.history.remove(docIndex, bkIndex);
    }

    public toggleBookmark(lineIndex: number, charIndex: number = -1, doc: Document = this.activeDocument) {
        const bkIndex = doc.findIndex(lineIndex, charIndex);
        if (bkIndex === -1) {
            this.addBookmark(lineIndex, charIndex, doc);
        } else {
            this.removeBookmark(lineIndex, charIndex, doc);
        }
    }

    public addDocumentIfNotExist(uri: string): Document {
        uri = BookmarkManager.normalize(uri);
        let existing: Document = this.findDocument(uri);

        if (typeof existing === "undefined") {
            let doc = new Document(uri);
            this.documents.push(doc);
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
                if (fs.existsSync(currentBookmark.fsPath)) {
                    resolve(currentBookmark.fsPath);
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
            element.fsPath = element.fsPath.replace(vscode.workspace.rootPath, "$ROOTPATH$");
        }
        return newBookmarks;
    }
}
