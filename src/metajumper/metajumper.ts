import { Config } from "../config";
import { InlineInput } from "./inline-input";
import { ILineIndexes, IIndexes, DecorationModel, DecorationModelBuilder } from "./decoration-model";
import { PlaceHolderDecorator } from "./decoration";
import * as _ from "lodash";
import * as vscode from "vscode";

class Selection {
    static Empty = new Selection();
    text: string;
    startLine: number;
    lastLine: number;
}

export class MetaJumper {
    private config: Config = new Config();
    private decorationModelBuilder: DecorationModelBuilder = new DecorationModelBuilder();
    private placeHolderDecorator: PlaceHolderDecorator = new PlaceHolderDecorator();
    private isJumping: boolean = false;

    configure = (context: vscode.ExtensionContext) => {
        let disposables: vscode.Disposable[] = [];

        disposables.push(vscode.commands.registerCommand('extension.metaGo', () => {
            if (!this.isJumping) {
                this.isJumping = true;
                this.jump((editor, placeholder) => {
                    editor.selection = new vscode.Selection(new vscode.Position(placeholder.line, placeholder.character), new vscode.Position(placeholder.line, placeholder.character));
                })
                    .then(() => {
                        this.isJumping = false;
                    })
                    .catch(() => {
                        this.isJumping = false;
                    });
            }
        }));

        disposables.push(vscode.commands.registerCommand('extension.metaGo.selection', () => {
            if (!this.isJumping) {
                this.isJumping = true;
                this.jump((editor, placeholder) => {
                    editor.selection = new vscode.Selection(new vscode.Position(editor.selection.active.line, editor.selection.active.character), new vscode.Position(placeholder.line, placeholder.character));
                })
                    .then(() => {
                        this.isJumping = false;
                    })
                    .catch(() => {
                        this.isJumping = false;
                    });
            }
        }));

        for (let i = 0; i < disposables.length; i++) {
            context.subscriptions.push(disposables[i]);
        }

        vscode.workspace.onDidChangeConfiguration(this.config.loadConfig);
        this.config.loadConfig();
        this.decorationModelBuilder.load(this.config);
        this.placeHolderDecorator.load(this.config);
    }

    private jump = (action: (editor: vscode.TextEditor, placeholder: DecorationModel) => void): Promise<void> => {
        return new Promise<void>((jumpResolve, jumpReject) => {
            let editor = vscode.window.activeTextEditor;

            if (!editor) {
                jumpReject();
                return;
            }

            let messageDisposable = vscode.window.setStatusBarMessage("metaGo: Type");
            const promise = new Promise<DecorationModel>((resolve, reject) => {

                let firstInlineInput = new InlineInput().show(editor, (v) => v)
                    .then((value: string) => {

                        if (!value) {
                            reject();
                            return;
                        };

                        if (value && value.length > 1)
                            value = value.substring(0, 1);

                        let selection = this.getSelection(editor);

                        let lineIndexes = this.find(editor, selection.before, selection.after, value);
                        if (lineIndexes.count <= 0) {
                            reject("metaGo: no matches");
                            return;
                        }

                        let decorationModels: DecorationModel[] = this.decorationModelBuilder.buildDecorationModel(lineIndexes);

                        if (decorationModels.length === 0) return;
                        if (decorationModels.length === 1) {
                            let placeholder = _.first(decorationModels);
                            resolve(placeholder);
                        }
                        else {
                            this.prepareForJumpTo(editor, decorationModels).then((placeholder) => {
                                resolve(placeholder);
                            }).catch(() => {
                                reject();
                            });
                        }
                    })
                    .catch(() => {
                        reject();
                    });
            })
                .then((placeholder: DecorationModel) => {
                    action(editor, placeholder);
                    vscode.window.setStatusBarMessage("metaGo: Jumped!", 2000);
                    jumpResolve();
                })
                .catch((reason?: string) => {
                    if (!reason) reason = "Canceled!";
                    vscode.window.setStatusBarMessage(`metaGo: ${reason}`, 2000);
                    messageDisposable.dispose();
                    jumpReject();
                });
        });
    };

    private getSelection = (editor: vscode.TextEditor): { before: Selection, after: Selection } => {
        let selection: Selection = new Selection();

        if (!editor.selection.isEmpty) {
            selection.text = editor.document.getText(editor.selection);

            if (editor.selection.anchor.line > editor.selection.active.line) {
                selection.startLine = editor.selection.active.line;
                selection.lastLine = editor.selection.anchor.line;
            }
            else {
                selection.startLine = editor.selection.anchor.line;
                selection.lastLine = editor.selection.active.line;
            }
            return { before: selection, after:  Selection.Empty};
        }
        else {
            selection.startLine = Math.max(editor.selection.active.line - this.config.finder.range, 0);
            selection.lastLine = editor.selection.active.line + 1; //current line included in before
            selection.text = editor.document.getText(new vscode.Range(selection.startLine, 0, selection.lastLine, 0));

            let selectionAfter = new Selection();
            selectionAfter.startLine = editor.selection.active.line + 1;
            selectionAfter.lastLine = Math.min(editor.selection.active.line + this.config.finder.range, editor.document.lineCount);
            selectionAfter.text = editor.document.getText(new vscode.Range(selectionAfter.startLine, 0, selectionAfter.lastLine, 0));

            return { before: selection, after: selectionAfter };
        }
    }

    private find = (editor: vscode.TextEditor, selectionBefore: Selection, selectionAfter: Selection, value: string): ILineIndexes => {
        let lineIndexes: ILineIndexes = {
            count: 0,
            focusLine:0,
            indexes: {}
        };

        for (let i = selectionBefore.startLine; i < selectionBefore.lastLine; i++) {
            let line = editor.document.lineAt(i);
            let indexes = this.indexesOf(line.text, value);
            lineIndexes.count += indexes.length;
            lineIndexes.indexes[i] = indexes;
        }
        lineIndexes.focusLine = editor.selection.active.line;

        for (let i = selectionAfter.startLine; i < selectionAfter.lastLine; i++) {
            let line = editor.document.lineAt(i);
            let indexes = this.indexesOf(line.text, value);
            lineIndexes.count += indexes.length;
            lineIndexes.indexes[i] = indexes;
        }
        return lineIndexes;
    }


    private indexesOf = (str: string, char: string): number[] => {
        if (char.length === 0) {
            return [];
        }

        let indices = [];

        if (this.config.finder.findAllMode === 'on') {
            let regexp = new RegExp(`[${char}]`, "gi");
            let match: RegExpMatchArray;
            while ((match = regexp.exec(str)) != null) {
                indices.push(match.index);
            }
        } else {
            //splitted by spaces
            let words = str.split(new RegExp(this.config.finder.wordSeparatorPattern));
            //current line index
            let index = 0;

            for (var i = 0; i < words.length; i++) {
                if (words[i][0] && words[i][0].toLowerCase() === char.toLowerCase()) {
                    indices.push(index);
                };

                // increment by word and white space
                index += words[i].length + 1;
            }
        }
        return indices;
    }

    private prepareForJumpTo = (editor: vscode.TextEditor, placeholders: DecorationModel[]) => {
        return new Promise<DecorationModel>((resolve, reject) => {
            this.placeHolderDecorator.addDecorations(editor, placeholders);
            let messageDisposable = vscode.window.setStatusBarMessage("metaGo: Jump To");
            new InlineInput().show(editor, (v) => v)
                .then((value: string) => {
                    this.placeHolderDecorator.removeDecorations(editor);

                    if (!value) return;

                    let placeholder = placeholders.find(placeholder => placeholder.code[0] === value.toLowerCase());

                   // if (placeholder.root)
                        //placeholder = placeholder.root;

                    if (placeholder.children.length > 1) {
                        this.prepareForJumpTo(editor, placeholder.children)
                            .then((placeholder) => {
                                resolve(placeholder);
                            })
                            .catch(() => {
                                reject();
                            });
                    }
                    else {
                        resolve(placeholder);
                    }
                }).catch(() => {
                    this.placeHolderDecorator.removeDecorations(editor);
                    messageDisposable.dispose();
                    reject();
                });
        });
    }
}
