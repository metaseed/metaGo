import fs = require('fs');
import * as vscode from 'vscode';

import { BookmarkConfig } from './config';
import { BookmarkManager } from './manager';

export class Decoration {
    private lineDecorationType: vscode.TextEditorDecorationType;
    private charDecorationType: vscode.TextEditorDecorationType;

    constructor(private config: BookmarkConfig, private context: vscode.ExtensionContext, private manager: BookmarkManager) {
        if (config.pathIcon !== "") {
            if (!fs.existsSync(config.pathIcon)) {
                vscode.window.showErrorMessage('The file "' + config.pathIcon + '" used for "this.bookmarks.gutterIconPath" does not exists.');
                config.pathIcon = this.context.asAbsolutePath("images\\bookmark.png");
            }
        } else {
            config.pathIcon = this.context.asAbsolutePath("images\\bookmark.png");
        }
        config.pathIcon = config.pathIcon.replace(/\\/g, "/");

        this.lineDecorationType = vscode.window.createTextEditorDecorationType({
            gutterIconPath: config.pathIcon,
            overviewRulerLane: vscode.OverviewRulerLane.Full,
            overviewRulerColor: "rgba(21, 126, 251, 0.7)"
        });

        this.charDecorationType = vscode.window.createTextEditorDecorationType({
            borderWidth: '2px',
            borderStyle: 'solid',
            light: {
                // this color will be used in light color themes
                borderColor: 'darkblue'
            },
            dark: {
                // this color will be used in dark color themes
                borderColor: 'blue'
            }
        });
    }

    public clear() {
        let books: vscode.Range[] = [];
        vscode.window.activeTextEditor.setDecorations(this.lineDecorationType, books);
    }

    public update = () => {
        let activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor) {
            return;
        }

        if (!this.manager.activeDocument) {
            return;
        }

        if (this.manager.activeDocument.bookmarks.size === 0) {
            this.clear();
            return;
        }

        const lineMarks: vscode.Range[] = [];
        const charMarks: vscode.Range[] = [];
        if (activeEditor.document.lineCount === 1 && activeEditor.document.lineAt(0).text === "") {
            this.manager.activeDocument.clear();
        } else {
            let invalids = [];
            for (let [key, bm] of this.manager.activeDocument.bookmarks) {
                if (bm.line <= activeEditor.document.lineCount) {
                    const lineDecoration = new vscode.Range(bm.line, 0, bm.line, 0);
                    const charDecoration = new vscode.Range(bm.line, bm.char, bm.line, bm.char + 1);
                    lineMarks.push(lineDecoration);
                    charMarks.push(charDecoration);
                } else {
                    invalids.push(key);
                }
            }

            if (invalids.length > 0) {
                let idxInvalid: number;
                for (const key of invalids) {
                    this.manager.activeDocument.removeBookmark(key);
                }
            }
        }
        activeEditor.setDecorations(this.lineDecorationType, lineMarks);
        activeEditor.setDecorations(this.charDecorationType, charMarks);
    }
}
