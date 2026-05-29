import * as vscode from 'vscode';

import { BookmarkConfig } from './config';
import { Bookmark } from './model/bookmark';
import { Document } from './model/document';
import { BookmarkManager } from './manager';
import { History, HistoryItem } from './model/history';

export class Storage {
    constructor(private config: BookmarkConfig, private context: vscode.ExtensionContext, private manager: BookmarkManager) { }

    public load = async (): Promise<boolean> => {
        const workspaceFolderUri = vscode.workspace.workspaceFolders?.[0]?.uri;
        const canUseWorkspaceFile = Boolean(workspaceFolderUri) && this.config.saveBookmarksInProject;

        if (workspaceFolderUri && canUseWorkspaceFile) {
            const fileUri = vscode.Uri.joinPath(workspaceFolderUri, ".vscode", "metago_bookmarks.json");
            try {
                const bytes = await vscode.workspace.fs.readFile(fileUri);
                const str = new TextDecoder().decode(bytes);
                this.updateManagerData(JSON.parse(str), workspaceFolderUri);
                return true;
            } catch (error) {
                // If the file doesn't exist (or can't be read), treat as "no saved data".
                return false;
            }
        }

        const savedBookmarks = this.context.workspaceState.get("metago_bookmarks", "");
        if (savedBookmarks !== "") {
            this.updateManagerData(JSON.parse(savedBookmarks), workspaceFolderUri);
        }
        return savedBookmarks !== "";
    }

    public save = async () => {
        if (this.manager.documents.size === 0) {
            return;
        }

        const workspaceFolderUri = vscode.workspace.workspaceFolders?.[0]?.uri;
        const canUseWorkspaceFile = Boolean(workspaceFolderUri) && this.config.saveBookmarksInProject;

        if (workspaceFolderUri && canUseWorkspaceFile) {
            const dirUri = vscode.Uri.joinPath(workspaceFolderUri, ".vscode");
            const fileUri = vscode.Uri.joinPath(dirUri, "metago_bookmarks.json");

            await vscode.workspace.fs.createDirectory(dirUri);
            const manager = await this.getManagerToSave(workspaceFolderUri);
            const str = JSON.stringify(manager, null, "    ");
            await vscode.workspace.fs.writeFile(fileUri, new TextEncoder().encode(str));
            return;
        }

        this.context.workspaceState.update("metago_bookmarks", JSON.stringify(await this.getManagerToSave(workspaceFolderUri)));
    }

    private updateManagerData = (jsonObject, workspaceFolderUri?: vscode.Uri) => {
        if (jsonObject === "") {
            return;
        }

        const workspaceRootFsPath = workspaceFolderUri?.fsPath ?? "";
        let jsonBookmarks = jsonObject.documents;

        for (let key in jsonBookmarks) {
            const docKey = key.replace("$ROOTPATH$", workspaceRootFsPath);
            const doc = this.manager.addDocumentIfNotExist(docKey);
            for (let bmKey in jsonBookmarks[key].bookmarks) {
                const bm = jsonBookmarks[key].bookmarks[bmKey];
                doc.addBookmark(new Bookmark(bm.line, bm.char));
            }
        }
        this.manager.history.history.length = 0;
        jsonObject.history.history.forEach((item: HistoryItem) => {
            const docKey = item.documentKey.replace('$ROOTPATH$', workspaceRootFsPath);
            this.manager.history.history.push(new HistoryItem(docKey, item.bookmarkKey));
        });
        this.manager.history.index = Math.min(jsonObject.history.index, this.manager.history.history.length - 1);
    }

    private getManagerToSave = async (workspaceFolderUri?: vscode.Uri) => {
        await this.manager.tidyBookmarks();
        let managerToSave = new BookmarkManager();
        const workspaceRootFsPath = workspaceFolderUri?.fsPath ?? "";
        for (let [docKey, doc] of this.manager.documents) {
            const key = workspaceRootFsPath ? docKey.replace(workspaceRootFsPath, '$ROOTPATH$') : docKey;
            let newDoc = new Document(key, undefined);

            managerToSave.documents[key] = newDoc;
            for (let [bmKey, bm] of doc.bookmarks) {
                newDoc.bookmarks[bmKey] = new Bookmark(bm.line, bm.char);
            }
        }
        managerToSave.history.index = this.manager.history.index;
        this.manager.history.history.forEach(item => {
            const docKey = workspaceRootFsPath ? item.documentKey.replace(workspaceRootFsPath, '$ROOTPATH$') : item.documentKey;
            managerToSave.history.history.push(new HistoryItem(docKey, item.bookmarkKey));
        });
        return managerToSave;
    }

}