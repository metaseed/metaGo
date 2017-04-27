import path = require('path');
import fs = require('fs');
import * as vscode from 'vscode';

import { BookmarkConfig } from './config';
import { Bookmark } from './model/bookmark';
import { Document } from './model/document';
import { BookmarkManager } from './manager';

export class Storage {
    constructor(private config: BookmarkConfig, private context: vscode.ExtensionContext, private manager: BookmarkManager) { }

    public load(): boolean {
        if (vscode.workspace.rootPath && this.config.saveBookmarksInProject) {
            let fPath: string = path.join(vscode.workspace.rootPath, ".vscode", "bookmarks.json");

            if (!fs.existsSync(fPath)) {
                return false;
            }

            try {
                let str = fs.readFileSync(fPath).toString();
                str = str.replace("$ROOTPATH$", vscode.workspace.rootPath);
                this.updateManagerData(JSON.parse(str));
                return true;
            } catch (error) {
                vscode.window.showErrorMessage("Error loading Bookmarks: " + error.toString());
                return false;
            }
        } else {
            let savedBookmarks = this.context.workspaceState.get("bookmarks", "");

            if (savedBookmarks !== "") {
                this.updateManagerData(JSON.parse(savedBookmarks));
            }
            return savedBookmarks !== "";
        }
    }

    public save(): void {
        if (this.manager.documents.size === 0) {
            return;
        }

        if (vscode.workspace.rootPath && this.config.saveBookmarksInProject) {
            let fPath: string = path.join(vscode.workspace.rootPath, ".vscode", "bookmarks.json");
            if (!fs.existsSync(path.dirname(fPath))) {
                fs.mkdirSync(path.dirname(fPath));
            }
            let str = JSON.stringify(this.getManagerToSave(), null, "\t");
            str = str.replace(vscode.workspace.rootPath, "$ROOTPATH$");
            fs.writeFileSync(fPath, str);
        } else {
            this.context.workspaceState.update("bookmarks", JSON.stringify(this.getManagerToSave()));
        }
    }

    private updateManagerData(jsonObject) {
        if (jsonObject === "") {
            return;
        }

        let jsonBookmarks: Map<string, Document> = jsonObject.documents;

        for (let [key, doc] of jsonBookmarks) {
            this.manager.addDocumentIfNotExist(key);
            for (let [bmKey, bm] of doc.bookmarks) {
                this.manager[key].bookmarks[bmKey] = bm;
            }
        }
    }

    private getManagerToSave(): BookmarkManager {
        function isNotEmpty(book: Document): boolean {
            return book.bookmarks.size > 0;
        }

        let newBookmarks: BookmarkManager = new BookmarkManager();
        newBookmarks.documents = JSON.parse(JSON.stringify(this.manager.documents)).filter(isNotEmpty);
        return newBookmarks;
    }

}