import fs = require('fs');
import * as vscode from 'vscode';

import { BookmarkConfig } from './config';
import { BookmarkManager } from './manager';

export class Selection {

    constructor(private manager: BookmarkManager) {
    }

    public shrinkSelection() {
        if (!vscode.window.activeTextEditor) {
            vscode.window.showInformationMessage("Open a file first to shrink bookmark selection");
            return;
        }

        if (vscode.window.activeTextEditor.selections.length > 1) {
            vscode.window.showInformationMessage("Command not supported with more than one selection");
            return;
        }

        if (vscode.window.activeTextEditor.selection.isEmpty) {
            vscode.window.showInformationMessage("No selection found");
            return;
        }

        if (this.manager.activeDocument.bookmarks.length === 0) {
            vscode.window.showInformationMessage("No Bookmark found");
            return;
        }

        // which direction?
        let direction: JumpDirection = vscode.window.activeTextEditor.selection.isReversed ? JumpDirection.FORWARD : JumpDirection.BACKWARD;
        let activeSelectionStartLine: number = vscode.window.activeTextEditor.selection.isReversed ? vscode.window.activeTextEditor.selection.end.line : vscode.window.activeTextEditor.selection.start.line;

        let pos: vscode.Position;
        if (direction === JumpDirection.FORWARD) {
            pos = vscode.window.activeTextEditor.selection.start;
        } else {
            pos = vscode.window.activeTextEditor.selection.end;
        }

        this.manager.activeDocument.nextBookmark(pos, direction)
            .then((nextLine) => {
                if ((nextLine === Bookmark.NO_MORE_BOOKMARKS) || (nextLine === Bookmark.NO_BOOKMARKS)) {
                    vscode.window.setStatusBarMessage("No more bookmarks", 2000);
                    return;
                } else {

                    if ((direction === JumpDirection.BACKWARD && nextLine.line < activeSelectionStartLine) ||
                        (direction === JumpDirection.FORWARD && nextLine.line > activeSelectionStartLine)) {
                        // vscode.window.showInformationMessage('No more this.bookmarks.to shrink...');
                        vscode.window.setStatusBarMessage("No more this.bookmarks.to shrink", 2000);
                    } else {
                        this.shrinkLineRange(vscode.window.activeTextEditor, parseInt(nextLine.toString(), 10), direction);
                    }
                }
            })
            .catch((error) => {
                console.log("activeBookmark.nextBookmark REJECT" + error);
            });
    }

    public expandSelectionToNextBookmark(direction: JumpDirection) {
        if (!vscode.window.activeTextEditor) {
            vscode.window.showInformationMessage("Open a file first to clear this.bookmarks");
            return;
        }

        if (this.manager.activeDocument.bookmarks.length === 0) {
            vscode.window.showInformationMessage("No Bookmark found");
            return;
        }

        if (this.manager.activeDocument.bookmarks.length === 1) {
            vscode.window.showInformationMessage("There is only one bookmark in this file");
            return;
        }

        let pos: vscode.Position;
        if (vscode.window.activeTextEditor.selection.isEmpty) {
            pos = vscode.window.activeTextEditor.selection.active;
        } else {
            if (direction === JumpDirection.FORWARD) {
                pos = vscode.window.activeTextEditor.selection.end;
            } else {
                pos = vscode.window.activeTextEditor.selection.start;
            }
        }

        this.manager.activeDocument.nextBookmark(pos, direction)
            .then((nextLine) => {
                if ((nextLine === Bookmark.NO_MORE_BOOKMARKS) || (nextLine === Bookmark.NO_BOOKMARKS)) {
                    // vscode.window.showInformationMessage('No more bookmarks...');
                    vscode.window.setStatusBarMessage("No more this.bookmarks", 2000);
                    return;
                } else {
                    this.expandLineRange(vscode.window.activeTextEditor, parseInt(nextLine.toString(), 10), direction);
                }
            })
            .catch((error) => {
                console.log("activeBookmark.nextBookmark REJECT" + error);
            });
    };
}