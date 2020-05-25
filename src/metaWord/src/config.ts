import * as vscode from "vscode";

export class Config {
    loadConfig = () => {
        try {

        }
        catch (e) {
            vscode.window.showErrorMessage('metaGo.metaWord: please double check your config->' + e);
        }
    }

}