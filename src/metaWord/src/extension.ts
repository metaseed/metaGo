'use strict';
import * as vscode from 'vscode';
import { Config } from "./config";
import { LandingPage } from './landing-page';
import {MetaSpaceWord} from './space-word';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    new LandingPage(context).showIfNeed(); // comment out this line to make breakpoint work when debugging
    let config = new Config();
    config.loadConfig();
    // Event to update active configuration items when changed without restarting vscode
    vscode.workspace.onDidChangeConfiguration(e => {
        config.loadConfig();
        spaceWord.updateConfig();
        
    });
    let spaceWord = new MetaSpaceWord(context, config);
}

// this method is called when your extension is deactivated
export function deactivate() {
}