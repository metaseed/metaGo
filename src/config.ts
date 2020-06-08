import * as vscode from "vscode";
import { BookmarkConfig } from './bookmark/config';

export class Config {
    bookmark = new BookmarkConfig();
    surroundPairs: Array<Array<string>>;
    loadConfig = () => {
        try {
            this.bookmark.loadConfig();
            let config = vscode.workspace.getConfiguration("metaGo");
            
            this.surroundPairs = config.get<Array<Array<string>>>("surroundPairs", null);
        }
        catch (e) {
            vscode.window.showErrorMessage('metaGo: please double check your metaGo config->' + e);
        }
    }
    
}
