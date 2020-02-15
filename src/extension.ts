'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { Config } from "./config";
import { MetaJumper } from './metajumper';
import { CurrentLineScroller } from './current-line-scroller';
import { BlankLineJumper } from './blank-line-jumper';
import { SelectLines } from './select-lines';
import { BookmarkExt } from './bookmark';
import { BracketJumper } from './bracket-jumper';
// import { SoftDelete } from './delete/smart-delete';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // console.log('Congratulations, your extension "metago" is now active!');
    let config = new Config();
    config.loadConfig();
    // Event to update active configuration items when changed without restarting vscode
    vscode.workspace.onDidChangeConfiguration((e: void) => {
        config.loadConfig();
        metaJumper.updateConfig();
    });

    let metaJumper = new MetaJumper(context, config);
    let centerEditor = new CurrentLineScroller(context);
    let spaceBlockJumper = new BlankLineJumper(context);
    let selectLineUp = new SelectLines(context);
    let bookmark = new BookmarkExt(context, config.bookmark);
    let bracketJumper = new BracketJumper(context);
    // let softDelete = new SoftDelete(context);

}

// this method is called when your extension is deactivated
export function deactivate() {
}