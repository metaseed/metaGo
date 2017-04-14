import * as vscode from "vscode";

export class BookmarkConfig {
    pathIcon:string;

    loadConfig(){
        let config = vscode.workspace.getConfiguration("metaGo");
        let bookmark = vscode.workspace.getConfiguration("bookmark");
        this.pathIcon = bookmark.get("gutterIconPath", "");

    }
}