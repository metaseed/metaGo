import * as vscode from 'vscode';
import { BookmarkManager } from './manager';
import { Bookmark } from './model/bookmark';

export class StickyBookmark {
    public activeEditorCountLine;

    constructor(private manager: BookmarkManager) {
    }

    public stickyBookmarks(event): boolean {
        let diffLine: number;
        let updatedBookmark: boolean = false;
        let bms = this.manager.activeDocument.bookmarks;
        let doc = this.manager.activeDocument;

        if (this.HadOnlyOneValidContentChange(event)) {
            // add or delete line case
            if (event.document.lineCount !== this.activeEditorCountLine) {
                if (event.document.lineCount > this.activeEditorCountLine) {
                    diffLine = event.document.lineCount - this.activeEditorCountLine;
                } else if (event.document.lineCount < this.activeEditorCountLine) {
                    diffLine = this.activeEditorCountLine - event.document.lineCount;
                    diffLine = 0 - diffLine;

                    // one line up
                    if (event.contentChanges[0].range.end.line - event.contentChanges[0].range.start.line === 1) {

                        if ((event.contentChanges[0].range.end.character === 0) &&
                            (event.contentChanges[0].range.start.character === 0)) {
                            // the bookmarked one
                            doc.getBookmarks(event.contentChanges[0].range.start.line).forEach(key => bms.delete(key));
                        }

                        if (event.contentChanges[0].range.end.line - event.contentChanges[0].range.start.line > 1) {
                            for (let i = event.contentChanges[0].range.start.line/* + 1*/; i <= event.contentChanges[0].range.end.line; i++) {
                                doc.getBookmarks(i).forEach(key => { bms.delete(key); updatedBookmark = true });
                            }
                        }
                    }
                }

                for (let [key, bm] of this.manager.activeDocument.bookmarks) {
                    let eventLine = event.contentChanges[0].range.start.line;
                    let eventCharacter = event.contentChanges[0].range.start.character;

                    // indent ?
                    if (eventCharacter > 0) {
                        let textInEventLine = vscode.window.activeTextEditor.document.lineAt(eventLine).text;
                        textInEventLine = textInEventLine.replace(/\t/g, "").replace(/\s/g, "");
                        if (textInEventLine === "") {
                            eventCharacter = 0;
                        }
                    }

                    // also =
                    if (((bm.line > eventLine) && (eventCharacter > 0)) ||
                        ((bm.line >= eventLine) && (eventCharacter === 0))
                    ) {
                        let newLine = bm.line + diffLine;
                        if (newLine < 0) {
                            newLine = 0;
                        }

                        bm.line = newLine;
                        updatedBookmark = true;
                    }
                }
            }

            // paste case
            if (!updatedBookmark && (event.contentChanges[0].text.length > 1)) {
                let selection = vscode.window.activeTextEditor.selection;
                let lineRange = [selection.start.line, selection.end.line];
                let lineMin = Math.min.apply(this, lineRange);
                let lineMax = Math.max.apply(this, lineRange);

                if (selection.start.character > 0) {
                    lineMin++;
                }

                if (selection.end.character < vscode.window.activeTextEditor.document.lineAt(selection.end).range.end.character) {
                    lineMax--;
                }

                if (lineMin <= lineMax) {
                    for (let i = lineMin; i <= lineMax; i++) {
                        const invalidKeys = [];
                        for (let [key, bm] of bms) {
                            if (bm.line === i) {
                                invalidKeys.push(key);
                                updatedBookmark = true;
                            }
                        }
                        invalidKeys.forEach((key) => bms.delete(key));
                    }
                }
            }
        } else if (event.contentChanges.length === 2) {
            // move line up and move line down case
            if (vscode.window.activeTextEditor.selections.length === 1) {
                if (event.contentChanges[0].text === "") {
                    updatedBookmark = this.moveStickyBookmarks("down");
                } else if (event.contentChanges[1].text === "") {
                    updatedBookmark = this.moveStickyBookmarks("up");
                }
            }
        }

        return updatedBookmark;
    }


    private moveStickyBookmarks = (direction): boolean => {
        let line: number = -1;
        let char: number;
        let updatedBookmark: boolean = false;
        let diffLine;
        let selection = vscode.window.activeTextEditor.selection;
        let lineRange = [selection.start.line, selection.end.line];
        let lineMin = Math.min.apply(this, lineRange);
        let lineMax = Math.max.apply(this, lineRange);

        if (selection.end.character === 0 && !selection.isSingleLine) {
            let lineAt = vscode.window.activeTextEditor.document.lineAt(selection.end.line);
            let posMin = new vscode.Position(selection.start.line + 1, selection.start.character);
            let posMax = new vscode.Position(selection.end.line, lineAt.range.end.character);
            vscode.window.activeTextEditor.selection = new vscode.Selection(posMin, posMax);
            lineMax--;
        }
        const doc = this.manager.activeDocument;
        if (direction === "up") {
            diffLine = 1;
            const bms = doc.getBookmarks(lineMin).forEach((key) => {
                line = lineMax;
                char = doc.bookmarks.get(key).char;
                updatedBookmark = true;
            });
        } else if (direction === "down") {
            diffLine = -1;
            const bms = doc.getBookmarks(lineMax).forEach((key) => {
                line = lineMin;
                char = doc.bookmarks.get(key).char;
                updatedBookmark = true;
            });
        }

        lineRange = [];
        for (let i = lineMin; i <= lineMax; i++) {
            lineRange.push(i);
        }
        lineRange = lineRange.sort();
        if (diffLine < 0) {
            lineRange = lineRange.reverse();
        }

        for (let i in lineRange) {
            for (let [key, bm] of doc.bookmarks) {
                if (bm.line === lineRange[i]) {
                    bm.line -= diffLine;
                    updatedBookmark = true;
                }
            }
        }

        return updatedBookmark;
    }

    private HadOnlyOneValidContentChange(event): boolean {
        const length = event.contentChanges.length;
        // not valid
        if ((length > 2) || (length === 0)) {
            return false;
        }

        // normal behavior - only 1
        if (length === 1) {
            return true;
        } else { // has 2, but is it a trimAutoWhitespace issue?
            if (length === 2) {
                // check if the first range is 'equal' and if the second is 'empty', do trim
                let fistRangeEquals: boolean =
                    (event.contentChanges[0].range.start.character === event.contentChanges[0].range.end.character) &&
                    (event.contentChanges[0].range.start.line === event.contentChanges[0].range.end.line);

                let secondRangeEmpty: boolean = (event.contentChanges[1].text === "") &&
                    (event.contentChanges[1].range.start.line === event.contentChanges[1].range.end.line) &&
                    (event.contentChanges[1].range.start.character === 0) &&
                    (event.contentChanges[1].range.end.character > 0);

                return fistRangeEquals && secondRangeEmpty;
            }
        }
    }


}