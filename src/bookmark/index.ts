import * as vscode from "vscode";
import fs = require("fs");
import path = require("path");

import { JumpDirection, BookmarkItem } from "./document";
import { Bookmark } from './bookmark';
import { BookmarkManager } from "./bookmark-manager";
import { BookmarkConfig } from './config';

export class BookmarkExt {
    private bookmarkManager: BookmarkManager;
    private bookmarkDecorationType: vscode.TextEditorDecorationType;
    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext, private config: BookmarkConfig) {
        this.context = context
        let activeEditorCountLine: number;

        // load pre-saved bookmarks
        let didLoadBookmarks: boolean = this.loadWorkspaceState();

        // Define the Bookmark Decoration
        if (config.pathIcon !== "") {
            if (!fs.existsSync(config.pathIcon)) {
                vscode.window.showErrorMessage('The file "' + config.pathIcon + '" used for "this.bookmarks.gutterIconPath" does not exists.');
                config.pathIcon = context.asAbsolutePath("images\\bookmark.png");
            }
        } else {
            config.pathIcon = context.asAbsolutePath("images\\bookmark.png");
        }
        config.pathIcon = config.pathIcon.replace(/\\/g, "/");

        this.bookmarkDecorationType = vscode.window.createTextEditorDecorationType({
            gutterIconPath: config.pathIcon,
            overviewRulerLane: vscode.OverviewRulerLane.Full,
            overviewRulerColor: "rgba(21, 126, 251, 0.7)"
        });
        // Timeout
        let timeout = null;
        let triggerUpdateDecorations = () => {
            if (timeout) {
                clearTimeout(timeout);
            }
            timeout = setTimeout(this.updateDecorations, 100);
        }
        // Connect it to the Editors Events
        let activeEditor = vscode.window.activeTextEditor;
        if (activeEditor) {
            if (!didLoadBookmarks) {
                this.bookmarkManager.addDocumentIfNotExist(activeEditor.document.uri.fsPath);
            }
            let activeEditorCountLine = activeEditor.document.lineCount;
            this.bookmarkManager.activeDocument = this.bookmarkManager.findDocument(activeEditor.document.uri.fsPath);
            triggerUpdateDecorations();
        }

        // new docs
        vscode.workspace.onDidOpenTextDocument(doc => {
            this.bookmarkManager.addDocumentIfNotExist(doc.uri.fsPath);
        });

        vscode.window.onDidChangeActiveTextEditor(editor => {
            activeEditor = editor;
            if (editor) {
                activeEditorCountLine = editor.document.lineCount;
                this.bookmarkManager.activeDocument = this.bookmarkManager.findDocument(editor.document.uri.fsPath);
                triggerUpdateDecorations();
            }
        }, null, context.subscriptions);

        vscode.workspace.onDidChangeTextDocument(event => {
            if (activeEditor && event.document === activeEditor.document) {
                //            triggerUpdateDecorations();
                let updatedBookmark: boolean = true;
                // call sticky function when the activeEditor is changed
                if (this.bookmarkManager.activeDocument && this.bookmarkManager.activeDocument.bookmarks.length > 0) {
                    updatedBookmark = this.stickyBookmarks(event);
                }

                activeEditorCountLine = event.document.lineCount;
                this.updateDecorations();

                if (updatedBookmark) {
                    this.saveWorkspaceState();
                }
            }
        }, null, context.subscriptions);
        this.registerCommands();

    }
    // Evaluate (prepare the list) and DRAW
    private updateDecorations = () => {
        let activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor) {
            return;
        }

        if (!this.bookmarkManager.activeDocument) {
            return;
        }

        if (this.bookmarkManager.activeDocument.bookmarks.length === 0) {
            let books: vscode.Range[] = [];

            activeEditor.setDecorations(this.bookmarkDecorationType, books);
            return;
        }

        let books: vscode.Range[] = [];
        // Remove all bookmarks.if active file is empty
        if (activeEditor.document.lineCount === 1 && activeEditor.document.lineAt(0).text === "") {
            this.bookmarkManager.activeDocument.bookmarks = [];
        } else {
            let invalids = [];

            for (let location of this.bookmarkManager.activeDocument.bookmarks) {
                if (location.line <= activeEditor.document.lineCount) {
                    let decoration = new vscode.Range(location.line, 0, location.line, 0);
                    books.push(decoration);
                } else {
                    invalids.push(location);
                }
            }

            if (invalids.length > 0) {
                let idxInvalid: number;
                for (const element of invalids) {
                    idxInvalid = this.bookmarkManager.activeDocument.bookmarks.indexOf(element); // invalids[indexI]);
                    this.bookmarkManager.activeDocument.bookmarks.splice(idxInvalid, 1);
                }
            }
        }
        activeEditor.setDecorations(this.bookmarkDecorationType, books);
    }

    private expandLineRange(editor: vscode.TextEditor, toLine: number, direction: JumpDirection) {
        const doc = editor.document;
        let newSe: vscode.Selection;
        let actualSelection: vscode.Selection = editor.selection;

        // no matter 'the previous selection'. going FORWARD will become 'isReversed = FALSE'
        if (direction === JumpDirection.FORWARD) {

            if (actualSelection.isEmpty || !actualSelection.isReversed) {
                newSe = new vscode.Selection(editor.selection.start.line, editor.selection.start.character, toLine, doc.lineAt(toLine).text.length);
            } else {
                newSe = new vscode.Selection(editor.selection.end.line, editor.selection.end.character, toLine, doc.lineAt(toLine).text.length);
            }
        } else { // going BACKWARD will become 'isReversed = TRUE'

            if (actualSelection.isEmpty || !actualSelection.isReversed) {
                newSe = new vscode.Selection(editor.selection.start.line, editor.selection.start.character, toLine, 0);
            } else {
                newSe = new vscode.Selection(editor.selection.end.line, editor.selection.end.character, toLine, 0);
            }
        }
        editor.selection = newSe;
    }

    private shrinkLineRange(editor: vscode.TextEditor, toLine: number, direction: JumpDirection) {
        const doc = editor.document;
        let newSe: vscode.Selection;

        // no matter 'the previous selection'. going FORWARD will become 'isReversed = FALSE'
        if (direction === JumpDirection.FORWARD) {
            newSe = new vscode.Selection(editor.selection.end.line, editor.selection.end.character, toLine, 0);
        } else { // going BACKWARD , select to line length
            newSe = new vscode.Selection(editor.selection.start.line, editor.selection.start.character, toLine, doc.lineAt(toLine).text.length);
        }
        editor.selection = newSe;
    }

    private revealLine(location: Bookmark) {
        let reviewType = vscode.TextEditorRevealType.InCenter;
        if (location.line === vscode.window.activeTextEditor.selection.active.line) {
            reviewType = vscode.TextEditorRevealType.InCenterIfOutsideViewport;
        }
        let newSe = new vscode.Selection(location.line, location.char, location.line, location.char);
        vscode.window.activeTextEditor.selection = newSe;
        vscode.window.activeTextEditor.revealRange(newSe, reviewType);
    }

    private loadWorkspaceState(): boolean {
        let saveBookmarksInProject: boolean = this.config.saveBookmarksInProject;

        this.bookmarkManager = new BookmarkManager();

        if (vscode.workspace.rootPath && saveBookmarksInProject) {
            let bookmarksFileInProject: string = path.join(vscode.workspace.rootPath, ".vscode", "bookmarks.json");

            if (!fs.existsSync(bookmarksFileInProject)) {
                return false;
            }

            try {
                this.bookmarkManager.loadFrom(JSON.parse(fs.readFileSync(bookmarksFileInProject).toString()), true);
                return true;
            } catch (error) {
                vscode.window.showErrorMessage("Error loading Bookmarks: " + error.toString());
                return false;
            }
        } else {
            let savedBookmarks = this.context.workspaceState.get("bookmarks", "");

            if (savedBookmarks !== "") {
                this.bookmarkManager.loadFrom(JSON.parse(savedBookmarks));
            }
            return savedBookmarks !== "";
        }
    }

    private saveWorkspaceState(): void {
        if (this.bookmarkManager.documents.length === 0) {
            return;
        }

        let saveBookmarksInProject: boolean = this.config.saveBookmarksInProject;

        if (vscode.workspace.rootPath && saveBookmarksInProject) {
            let bookmarksFileInProject: string = path.join(vscode.workspace.rootPath, ".vscode", "bookmarks.json");
            if (!fs.existsSync(path.dirname(bookmarksFileInProject))) {
                fs.mkdirSync(path.dirname(bookmarksFileInProject));
            }
            fs.writeFileSync(bookmarksFileInProject, JSON.stringify(this.bookmarkManager.zip(true), null, "\t"));
        } else {
            this.context.workspaceState.update("bookmarks", JSON.stringify(this.bookmarkManager.zip()));
        }
    }

    private HadOnlyOneValidContentChange(event): boolean {

        // not valid
        if ((event.contentChanges.length > 2) || (event.contentChanges.length === 0)) {
            return false;
        }

        // normal behavior - only 1
        if (event.contentChanges.length === 1) {
            return true;
        } else { // has 2, but is it a trimAutoWhitespace issue?
            if (event.contentChanges.length === 2) {

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

    // function used to attach this.bookmarks.at the line
    private stickyBookmarks(event): boolean {

        let diffLine: number;
        let updatedBookmark: boolean = false;
        let activeEditorCountLine = vscode.window.activeTextEditor.document.lineCount;
        // fix autoTrimWhitespace
        // if (event.contentChanges.length === 1) {
        if (this.HadOnlyOneValidContentChange(event)) {
            // add or delete line case
            if (event.document.lineCount !== activeEditorCountLine) {
                if (event.document.lineCount > activeEditorCountLine) {
                    diffLine = event.document.lineCount - activeEditorCountLine;
                } else if (event.document.lineCount < activeEditorCountLine) {
                    diffLine = activeEditorCountLine - event.document.lineCount;
                    diffLine = 0 - diffLine;

                    // one line up
                    if (event.contentChanges[0].range.end.line - event.contentChanges[0].range.start.line === 1) {

                        if ((event.contentChanges[0].range.end.character === 0) &&
                            (event.contentChanges[0].range.start.character === 0)) {
                            // the bookmarked one
                            let bookmarkIndex = this.bookmarkManager.activeDocument.bookmarks.indexOf(event.contentChanges[0].range.start.line);
                            if (bookmarkIndex > -1) {
                                this.bookmarkManager.activeDocument.bookmarks.splice(bookmarkIndex, 1);
                            }
                        }
                    }

                    if (event.contentChanges[0].range.end.line - event.contentChanges[0].range.start.line > 1) {
                        for (let i = event.contentChanges[0].range.start.line/* + 1*/; i <= event.contentChanges[0].range.end.line; i++) {
                            let index = this.bookmarkManager.activeDocument.bookmarks.indexOf(i);

                            if (index > -1) {
                                this.bookmarkManager.activeDocument.bookmarks.splice(index, 1);
                                updatedBookmark = true;
                            }
                        }
                    }
                }

                // for (let index in this.bookmarks.activeBookmark.bookmarks. {
                for (let index = 0; index < this.bookmarkManager.activeDocument.bookmarks.length; index++) {
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
                    if (
                        ((this.bookmarkManager.activeDocument.bookmarks[index] > eventLine) && (eventCharacter > 0)) ||
                        ((this.bookmarkManager.activeDocument.bookmarks[index] >= eventLine) && (eventCharacter === 0))
                    ) {
                        let newLine = this.bookmarkManager.activeDocument.bookmarks[index].line + diffLine;
                        if (newLine < 0) {
                            newLine = 0;
                        }

                        this.bookmarkManager.activeDocument.bookmarks[index].line = newLine;
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
                        let index = this.bookmarkManager.activeDocument.bookmarks.indexOf(i);
                        if (index > -1) {
                            this.bookmarkManager.activeDocument.bookmarks.splice(index, 1);
                            updatedBookmark = true;
                        }
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

    private moveStickyBookmarks(direction): boolean {
        let diffChange: number = -1;
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

        if (direction === "up") {
            diffLine = 1;

            let index = this.bookmarkManager.activeDocument.bookmarks.findIndex((l) => l.line === lineMin - 1);
            if (index > -1) {
                diffChange = lineMax;
                this.bookmarkManager.activeDocument.bookmarks.splice(index, 1);
                updatedBookmark = true;
            }
        } else if (direction === "down") {
            diffLine = -1;

            let index: number;
            index = this.bookmarkManager.activeDocument.bookmarks.indexOf(lineMax + 1);
            if (index > -1) {
                diffChange = lineMin;
                this.bookmarkManager.activeDocument.bookmarks.splice(index, 1);
                updatedBookmark = true;
            }
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
            let index = this.bookmarkManager.activeDocument.bookmarks.findIndex((l) => l.line === lineRange[i]);
            if (index > -1) {
                this.bookmarkManager.activeDocument.bookmarks[index].line -= diffLine;
                updatedBookmark = true;
            }
        }

        if (diffChange > -1) {
            this.bookmarkManager.activeDocument.bookmarks.push(new Bookmark(diffChange, 0));
            updatedBookmark = true;
        }

        return updatedBookmark;
    }

    private removeRootPathFrom(path: string): string {
        if (!vscode.workspace.rootPath) {
            return path;
        }

        if (path.indexOf(vscode.workspace.rootPath) === 0) {
            return "$(tag) " + path.split(vscode.workspace.rootPath).pop();
        } else {
            return "$(link) " + path;
        }
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

        if (this.bookmarkManager.activeDocument.bookmarks.length === 0) {
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

        this.bookmarkManager.activeDocument.nextBookmark(pos, direction)
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

    private expandSelectionToNextBookmark(direction: JumpDirection) {
        if (!vscode.window.activeTextEditor) {
            vscode.window.showInformationMessage("Open a file first to clear this.bookmarks");
            return;
        }

        if (this.bookmarkManager.activeDocument.bookmarks.length === 0) {
            vscode.window.showInformationMessage("No Bookmark found");
            return;
        }

        if (this.bookmarkManager.activeDocument.bookmarks.length === 1) {
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

        this.bookmarkManager.activeDocument.nextBookmark(pos, direction)
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
    private registerCommands() {
        vscode.commands.registerCommand("metaGo.bookmark.expandSelectionToNext", () => this.expandSelectionToNextBookmark(JumpDirection.FORWARD));
        vscode.commands.registerCommand("metaGo.bookmark.expandSelectionToPrevious", () => this.expandSelectionToNextBookmark(JumpDirection.BACKWARD));
        vscode.commands.registerCommand("metaGo.bookmark.shrinkSelection", () => this.shrinkSelection());

        vscode.commands.registerCommand("metaGo.bookmark.clearInFile", () => {

            if (!vscode.window.activeTextEditor) {
                vscode.window.showInformationMessage("Open a file first to clear bookmarks");
                return;
            }

            this.bookmarkManager.activeDocument.clear();

            this.saveWorkspaceState();
            this.updateDecorations();
        });

        vscode.commands.registerCommand("metaGo.bookmark.clear", () => {

            for (let doc of this.bookmarkManager.documents) {
                doc.clear();
            }

            this.saveWorkspaceState();
            this.updateDecorations();
        });

        function selectLines(editor: vscode.TextEditor, lines: Bookmark[]): void {
            const doc = editor.document;
            editor.selections.shift();
            let selections = new Array<vscode.Selection>();
            let newSe;
            lines.forEach(line => {
                newSe = new vscode.Selection(line.line, 0, line.line, doc.lineAt(line.line).text.length);
                selections.push(newSe);
            });
            editor.selections = selections;
        }

        vscode.commands.registerCommand("metaGo.bookmark.selectLines", () => {

            if (!vscode.window.activeTextEditor) {
                vscode.window.showInformationMessage("Open a file first to clear bookmarks");
                return;
            }

            if (this.bookmarkManager.activeDocument.bookmarks.length === 0) {
                vscode.window.showInformationMessage("No Bookmark found");
                return;
            }

            selectLines(vscode.window.activeTextEditor, this.bookmarkManager.activeDocument.bookmarks);
        });

        vscode.commands.registerCommand("metaGo.bookmark.toggle", () => {

            if (!vscode.window.activeTextEditor) {
                vscode.window.showInformationMessage("Open a file first to toggle bookmarks");
                return;
            }

            let line = vscode.window.activeTextEditor.selection.active.line;
            let char = vscode.window.activeTextEditor.selection.active.character;
            // fix issue emptyAtLaunch
            if (!this.bookmarkManager.activeDocument) {
                let doc = this.bookmarkManager.addDocumentIfNotExist(vscode.window.activeTextEditor.document.uri.fsPath);
                this.bookmarkManager.activeDocument = doc;
            }

            this.bookmarkManager.toggleBookmark(line, char);
            this.saveWorkspaceState();
            this.updateDecorations();
        });

        vscode.commands.registerCommand("metaGo.bookmark.jumpToNext", () => {
            if (!vscode.window.activeTextEditor) {
                vscode.window.showInformationMessage("Open a file first to jump to bookmarks");
                return;
            }

            if (!this.bookmarkManager.activeDocument) {
                return;
            }

            this.bookmarkManager.activeDocument.nextBookmark(vscode.window.activeTextEditor.selection.active)
                .then((nextLine) => {
                    if ((nextLine === Bookmark.NO_MORE_BOOKMARKS) || (nextLine === Bookmark.NO_BOOKMARKS)) {
                        this.bookmarkManager.nextDocumentWithBookmarks(this.bookmarkManager.activeDocument)
                            .then((nextDocumentPath) => {
                                if (!nextDocumentPath) {
                                    return;
                                }

                                // same document?
                                let activeDocumentPath = BookmarkManager.normalize(vscode.window.activeTextEditor.document.uri.fsPath);
                                if (nextDocumentPath.toString() === activeDocumentPath) {
                                    let location = this.bookmarkManager.activeDocument.bookmarks[0];
                                    this.revealLine(location);
                                } else {
                                    vscode.workspace.openTextDocument(nextDocumentPath.toString()).then(doc => {
                                        vscode.window.showTextDocument(doc).then(editor => {
                                            let location = this.bookmarkManager.activeDocument.bookmarks[0];
                                            this.revealLine(location);
                                        });
                                    });
                                }
                            })
                            .catch((error) => {
                                vscode.window.showInformationMessage("No more bookmarks...");
                            });
                    } else {
                        this.revealLine(nextLine);
                    }
                })
                .catch((error) => {
                    console.log("activeBookmark.nextBookmark REJECT" + error);
                });
        });

        vscode.commands.registerCommand("metaGo.bookmark.jumpToPrevious", () => {

            if (!vscode.window.activeTextEditor) {
                vscode.window.showInformationMessage("Open a file first to jump to this.bookmarks");
                return;
            }

            if (!this.bookmarkManager.activeDocument) {
                return;
            }

            this.bookmarkManager.activeDocument.nextBookmark(vscode.window.activeTextEditor.selection.active, JumpDirection.BACKWARD)
                .then((location) => {
                    if ((location === Bookmark.NO_MORE_BOOKMARKS) || (location === Bookmark.NO_BOOKMARKS)) {
                        this.bookmarkManager.nextDocumentWithBookmarks(this.bookmarkManager.activeDocument, JumpDirection.BACKWARD)
                            .then((nextDocument) => {

                                if (!nextDocument) {
                                    return;
                                }

                                // same document?
                                let activeDocument = BookmarkManager.normalize(vscode.window.activeTextEditor.document.uri.fsPath);
                                if (nextDocument.toString() === activeDocument) {
                                    let locations = this.bookmarkManager.activeDocument.bookmarks;
                                    this.revealLine(locations.pop());
                                } else {
                                    vscode.workspace.openTextDocument(nextDocument.toString()).then(doc => {
                                        vscode.window.showTextDocument(doc).then(editor => {
                                            let locations = this.bookmarkManager.activeDocument.bookmarks;
                                            this.revealLine(locations.pop());
                                        });
                                    });
                                }
                            })
                            .catch((error) => {
                                vscode.window.showInformationMessage("No more this.bookmarks...");
                            });
                    } else {
                        this.revealLine(location);
                    }
                })
                .catch((error) => {
                    console.log("activeBookmark.nextBookmark REJECT" + error);
                });
        });

        vscode.commands.registerCommand("metaGo.bookmark.view", () => {
            // no bookmark
            let totalBookmarkCount: number = 0;
            for (let element of this.bookmarkManager.documents) {
                totalBookmarkCount = totalBookmarkCount + element.bookmarks.length;
            }
            if (totalBookmarkCount === 0) {
                vscode.window.showInformationMessage("No Bookmarks found");
                return;
            }

            // push the items
            let items: vscode.QuickPickItem[] = [];
            let activeTextEditorPath = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.document.uri.fsPath : "";
            let promises = [];
            let currentLine: number = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.selection.active.line + 1 : -1;

            for (let index = 0; index < this.bookmarkManager.documents.length; index++) {
                let bookmark = this.bookmarkManager.documents[index];
                let pp = bookmark.listBookmarks();
                promises.push(pp);
            }

            Promise.all(promises).then(
                (values) => {
                    for (let index = 0; index < values.length; index++) {
                        let element: BookmarkItem[] = values[index];

                        for (let indexInside = 0; indexInside < element.length; indexInside++) {
                            let elementInside = element[indexInside];

                            if (elementInside.detail.toString().toLowerCase() === activeTextEditorPath.toLowerCase()) {
                                items.push(
                                    new BookmarkItem(elementInside.label,
                                        elementInside.description, null, null, elementInside.location
                                    )
                                );
                            } else {
                                let itemPath = this.removeRootPathFrom(elementInside.detail);
                                items.push(
                                    new BookmarkItem(elementInside.label,
                                        elementInside.description,
                                        itemPath, null, elementInside.location
                                    )
                                );
                            }
                        }

                    }

                    // sort
                    // - active document
                    // - no Octicons - document inside project
                    // - with Octicons - document outside project
                    let itemsSorted: vscode.QuickPickItem[];
                    itemsSorted = items.sort(function (a: vscode.QuickPickItem, b: vscode.QuickPickItem): number {
                        if (!a.detail && !b.detail) {
                            return 0;
                        } else {
                            if (!a.detail && b.detail) {
                                return -1;
                            } else {
                                if (a.detail && !b.detail) {
                                    return 1;
                                } else {
                                    if ((a.detail.toString().indexOf("$(link) ") === 0) && (b.detail.toString().indexOf("$(link) ") === -1)) {
                                        return 1;
                                    } else {
                                        if ((a.detail.toString().indexOf("$(link) ") === -1) && (b.detail.toString().indexOf("$(link) ") === 0)) {
                                            return -1;
                                        } else {
                                            return 0;
                                        }
                                    }
                                }
                            }
                        }
                    });

                    items.push(
                        new BookmarkItem('c',
                            'clear bookmarks in current file',
                            null, 'metaGo.bookmark.clearInFile'
                        )
                    );
                    items.push(
                        new BookmarkItem('cc',
                            'clear all bookmarks in workspace',
                            null, 'metaGo.bookmark.clear'
                        )
                    );
                    items.splice(0, 0,
                        new BookmarkItem('p',
                            'jump to previous bookmark',
                            null, 'metaGo.bookmark.jumpToPrevious'
                        )
                    );
                    items.splice(0, 0,
                        new BookmarkItem('n',
                            'jump to next bookmark',
                            null, 'metaGo.bookmark.jumpToNext'
                        )
                    );

                    let options = <vscode.QuickPickOptions>{
                        placeHolder: "Type a line number or a piece of code to navigate to",
                        matchOnDescription: true,
                        onDidSelectItem: (item: BookmarkItem) => {
                            let filePath: string;
                            if (item.commandId) return;
                            // no detail - previously active document
                            if (!item.detail) {
                                filePath = activeTextEditorPath;
                            } else {
                                // with icon - document outside project
                                if (item.detail.toString().indexOf("$(link) ") === 0) {
                                    filePath = item.detail.toString().split("$(link) ").pop();
                                } else if (item.detail.toString().indexOf("$(tag) ") === 0) {// tag - document inside project
                                    filePath = vscode.workspace.rootPath + item.detail.toString().split("$(tag) ").pop();
                                } else {// no icon
                                    filePath = vscode.workspace.rootPath + item.detail.toString();
                                }
                            }

                            if (vscode.window.activeTextEditor && vscode.window.activeTextEditor.document.uri.fsPath.toLowerCase() === filePath.toLowerCase()) {
                                this.revealLine(item.location);
                            } else {
                                let uriDocument: vscode.Uri = vscode.Uri.file(filePath);
                                vscode.workspace.openTextDocument(uriDocument).then(doc => {
                                    vscode.window.showTextDocument(doc, undefined, true).then(editor => {
                                        this.revealLine(item.location);
                                    });
                                });
                            }
                        }
                    };
                    vscode.window.showQuickPick(itemsSorted, options).then((selection: BookmarkItem) => {
                        if (typeof selection === "undefined") {
                            if (activeTextEditorPath === "") {
                                return;
                            } else {
                                let uriDocument: vscode.Uri = vscode.Uri.file(activeTextEditorPath);
                                vscode.workspace.openTextDocument(uriDocument).then(doc => {
                                    vscode.window.showTextDocument(doc).then(editor => {
                                        this.revealLine(new Bookmark(currentLine - 1, 0));
                                        return;
                                    });
                                });
                            }
                        }

                        if (typeof selection === "undefined") {
                            return;
                        }

                        if (selection.commandId) {
                            vscode.commands.executeCommand(selection.commandId);
                            return;
                        } else {
                            if (!selection.detail) {
                                this.revealLine(selection.location);
                            } else {
                                let newPath = vscode.workspace.rootPath + selection.detail.toString();
                                let uriDocument: vscode.Uri = vscode.Uri.file(newPath);
                                vscode.workspace.openTextDocument(uriDocument).then(doc => {
                                    vscode.window.showTextDocument(doc).then(editor => {
                                        this.revealLine(selection.location);
                                    });
                                });
                            }
                        }
                    });
                }
            );
        });
    }
}