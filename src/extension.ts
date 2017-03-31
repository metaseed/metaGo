'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { MetaJumper } from './metajumper';
import { CenterEditor } from './center-editor';
import { SpaceBlockJumper } from './space-block-jumper';
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "metago" is now active!');
    let metaJumper = new MetaJumper();
    metaJumper.configure(context);
    let centerEditor = new CenterEditor();
    centerEditor.activate(context);
    let spaceBlockJumper = new SpaceBlockJumper();
    spaceBlockJumper.activate(context);
}

// this method is called when your extension is deactivated
export function deactivate() {
}