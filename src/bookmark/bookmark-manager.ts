import * as vscode from "vscode";
import fs = require("fs");
import { Document, JumpDirection } from "./document";
import { BookmarkConfig } from './config';
import { Bookmark } from './bookmark';
export class BookmarkManager {

    public static normalize(uri: string): string {
        // a simple workaround for what appears to be a vscode.Uri bug
        // (inconsistent fsPath values for the same document, ex. ///foo/x.cpp and /foo/x.cpp)
        return uri.replace("///", "/");
    }

    public documents: Document[];
    public activeDocument: Document = undefined;
    public history: Array<{ docIndex: number, bookmarkIndex: number }>;

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
            this.add(jsonBookmark.fsPath);
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

    public fromUri(uri: string) {
        uri = BookmarkManager.normalize(uri);
        for (let element of this.documents) {
            if (element.fsPath === uri) {
                return element;
            }
        }
    }

    public add(uri: string) {
        uri = BookmarkManager.normalize(uri);

        let existing: Document = this.fromUri(uri);
        if (typeof existing === "undefined") {
            let bookmark = new Document(uri);
            this.documents.push(bookmark);
        }
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
        let currentBookmark: Document = active;
        let currentBookmarkId: number;
        for (let index = 0; index < this.documents.length; index++) {
            let element = this.documents[index];
            if (element === active) {
                currentBookmarkId = index;
            }
        }

        return new Promise((resolve, reject) => {
            currentBookmark.nextBookmark(position)
                .then((newLine) => {
                    resolve(newLine);
                    return;
                })
                .catch((error) => {
                    // next document
                    currentBookmarkId++;
                    if (currentBookmarkId === this.documents.length) {
                        currentBookmarkId = 0;
                    }
                    currentBookmark = this.documents[currentBookmarkId];

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
