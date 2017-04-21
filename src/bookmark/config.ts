import * as vscode from "vscode";

export class BookmarkConfig {
    pathIcon: string;
    saveBookmarksInProject: boolean;

    loadConfig() {
        let config = vscode.workspace.getConfiguration("metaGo");
        this.pathIcon = config.get("bookmark.gutterIconPath", "");
        this.saveBookmarksInProject = config.get<boolean>('bookmark.saveBookmarksInProject', true);

    }
}