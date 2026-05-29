import * as vscode from 'vscode';

import { BookmarkConfig } from './config';
import { BookmarkManager } from './manager';

export class Decoration {
    private lineDecorationType: vscode.TextEditorDecorationType;
    private charDecorationType: vscode.TextEditorDecorationType;

    constructor(private config: BookmarkConfig, private context: vscode.ExtensionContext, private manager: BookmarkManager) {
        const defaultIconUri = vscode.Uri.joinPath(this.context.extensionUri, "images", "bookmark.png");
        const gutterIconUri = this.toUriOrUndefined(config.pathIcon) ?? defaultIconUri;

        this.lineDecorationType = vscode.window.createTextEditorDecorationType({
            gutterIconPath: gutterIconUri,
            overviewRulerLane: vscode.OverviewRulerLane.Full,
            overviewRulerColor: "rgba(21, 126, 251, 0.7)"
        });

        this.charDecorationType = vscode.window.createTextEditorDecorationType({
            backgroundColor: 'rgba(255,0,0,0.3)',
            borderWidth: '1px',
            borderStyle: 'solid',
            light: {
                // this color will be used in light color themes
                borderColor: 'darkblue'
            },
            dark: {
                // this color will be used in dark color themes
                borderColor: 'mediumblue '
            }
        });

    }

    private toUriOrUndefined = (value: string | undefined): vscode.Uri | undefined => {
        if (!value) {
            return undefined;
        }

        // Allow URIs (data/http/https/vscode-resource/etc) or filesystem paths.
        try {
            if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(value)) {
                return vscode.Uri.parse(value);
            }
            return vscode.Uri.file(value);
        } catch {
            return undefined;
        }
    }

    public clear() {
        let books: vscode.Range[] = [];
        vscode.window.activeTextEditor.setDecorations(this.lineDecorationType, books);
        vscode.window.activeTextEditor.setDecorations(this.charDecorationType, books);
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
        const charMarks: vscode.Range[] = [];//vscode.DecorationOptions[] = [];
        if (activeEditor.document.lineCount === 1 && activeEditor.document.lineAt(0).text === "") {
            this.manager.activeDocument.clear();
        } else {
            let invalids = [];
            for (let [key, bm] of this.manager.activeDocument.bookmarks) {
                if (bm.line <= activeEditor.document.lineCount) {
                    const lineDecoration = new vscode.Range(bm.line, 0, bm.line, 0);
                    lineMarks.push(lineDecoration);
                    // const charDecorationOption = {
                    //     range: new vscode.Range(bm.line, bm.char, bm.line, bm.char),
                    //     // renderOptions: {
                    //     //     dark: {
                    //     //         after: {
                    //     //             contentIconPath: this.buildUri()
                    //     //         }
                    //     //     },
                    //     //     light: {
                    //     //         after: {
                    //     //             contentIconPath: this.buildUri()
                    //     //         }
                    //     //     }
                    //     // }
                    // };
                    charMarks.push(new vscode.Range(bm.line, bm.char, bm.line, bm.char));
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

    private buildUri = () => {
        let width = 6;
        let height = 18;
        let bgColor = 'blue';
        let bgOpacity = '1';
        let borderColor = 'lightblue';
        let svg =
            `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" height="${height}" width="${width}"><rect width="${width}" height="${height}" rx="0" ry="0" style="fill: ${bgColor};fill-opacity:${bgOpacity};stroke:${borderColor};stroke-opacity:${bgOpacity};"/></svg>`;
        return vscode.Uri.parse(svg);
    }
}
