import * as vscode from "vscode";

export class BookmarkConfig {
    pathIcon:string;
    saveBookmarksInProject:boolean;

    loadConfig(){
        let config = vscode.workspace.getConfiguration("metaGo");
        let bookmark = vscode.workspace.getConfiguration("bookmark");
        this.pathIcon = bookmark.get("gutterIconPath", "");
        this.saveBookmarksInProject = bookmark.get<boolean>('saveBookmarksInProject', true);

    }
}