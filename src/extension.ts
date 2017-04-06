'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { Config } from "./config";
import { MetaJumper } from './metajumper/metajumper';
import { CenterEditor } from './center-editor';
import { SpaceBlockJumper } from './space-block-jumper';
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "metago" is now active!');
    // Event to update active configuration items when changed without restarting vscode
    let metaJumper = new MetaJumper();
    let config = new Config();
    vscode.workspace.onDidChangeConfiguration((e: void) => {
        config.loadConfig();
        metaJumper.updateConfig();
    });
    config.loadConfig();
    metaJumper.initialize(context, config);
    let centerEditor = new CenterEditor();
    centerEditor.activate(context);
    let spaceBlockJumper = new SpaceBlockJumper();
    spaceBlockJumper.activate(context);
}

// this method is called when your extension is deactivated
export function deactivate() {
}