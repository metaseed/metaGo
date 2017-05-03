import path = require('path');
import fs = require('fs');
import * as vscode from 'vscode';

import { BookmarkConfig } from './config';
import { Bookmark } from './model/bookmark';
import { Document } from './model/document';
import { BookmarkManager } from './manager';
import { History, HistoryItem } from './model/history';

export class Storage {
    constructor(private config: BookmarkConfig, private context: vscode.ExtensionContext, private manager: BookmarkManager) { }

    public load = (): boolean => {
        if (vscode.workspace.rootPath && this.config.saveBookmarksInProject) {
            let fPath: string = path.join(vscode.workspace.rootPath, ".vscode", "bookmarks.json");

            if (!fs.existsSync(fPath)) {
                return false;
            }

            try {
                let str = fs.readFileSync(fPath).toString();
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

    public save = async () => {
        if (this.manager.documents.size === 0) {
            return;
        }

        if (vscode.workspace.rootPath && this.config.saveBookmarksInProject) {
            let fPath: string = path.join(vscode.workspace.rootPath, ".vscode", "bookmarks.json");
            if (!fs.existsSync(path.dirname(fPath))) {
                fs.mkdirSync(path.dirname(fPath));
            }
            const manager = await this.getManagerToSave();
            let str = JSON.stringify(manager, null, "    ");
            //let root = JSON.stringify(vscode.workspace.rootPath).replace(/"/g, '').replace(/\\/g, '\\\\')
            //str = str.replace(new RegExp(root, 'gm'), "$ROOTPATH$");
            fs.writeFileSync(fPath, str);
        } else {
            this.context.workspaceState.update("bookmarks", JSON.stringify(await this.getManagerToSave()));
        }
    }

    private updateManagerData = (jsonObject) => {
        if (jsonObject === "") {
            return;
        }

        let jsonBookmarks = jsonObject.documents;

        for (let key in jsonBookmarks) {
            const docKey = key.replace("$ROOTPATH$", vscode.workspace.rootPath);
            const doc = this.manager.addDocumentIfNotExist(docKey);
            for (let bmKey in jsonBookmarks[key].bookmarks) {
                const bm = jsonBookmarks[key].bookmarks[bmKey];
                doc.addBookmark(new Bookmark(bm.line, bm.char));
            }
        }
        this.manager.history.history.length = 0;
        jsonObject.history.history.forEach((item: HistoryItem) => {
            const docKey = item.documentKey.replace('$ROOTPATH$', vscode.workspace.rootPath);
            this.manager.history.history.push(new HistoryItem(docKey, item.bookmarkKey));
        });
        this.manager.history.index = Math.min(jsonObject.history.index, this.manager.history.history.length - 1);
    }

    private getManagerToSave = async () => {
        let manager = new BookmarkManager();
        await this.manager.tidyBookmarks();
        for (let [docKey, doc] of this.manager.documents) {
            const key = docKey.replace(vscode.workspace.rootPath, '$ROOTPATH$');
            let newDoc = new Document(key, undefined);

            manager.documents[key] = newDoc;
            for (let [bmKey, bm] of doc.bookmarks) {
                newDoc.bookmarks[bmKey] = new Bookmark(bm.line, bm.char);
            }
        }
        manager.history.index = this.manager.history.index;
        this.manager.history.history.forEach(item => {
            const docKey = item.documentKey.replace(vscode.workspace.rootPath, '$ROOTPATH$');
            manager.history.history.push(new HistoryItem(docKey, item.bookmarkKey));
        });
        return manager;
    }

}