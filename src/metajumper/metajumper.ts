import { Config } from "../config";
import { InlineInput } from "./inline-input";
import { ILineCharIndexes, IIndexes, DecorationModel, DecorationModelBuilder } from "./decoration-model";
import { Decorator } from "./decoration";
import { ViewPort } from './view-port';
import * as vscode from "vscode";

class Selection {
    static Empty = new Selection();
    text: string;
    startLine: number;
    lastLine: number;
}

export class MetaJumper {
    private config: Config;
    private decorationModelBuilder: DecorationModelBuilder = new DecorationModelBuilder();
    private decorator: Decorator = new Decorator();
    private isJumping: boolean = false;
    private viewPort: ViewPort;
    private findFromCenterScreenRange;
    private halfViewPortRange: number;

    initialize = (context: vscode.ExtensionContext, config: Config) => {
        let disposables: vscode.Disposable[] = [];
        this.config = config;
        this.viewPort = new ViewPort();
        this.halfViewPortRange = Math.trunc(this.config.finder.range / 2); // 0.5
        // determines whether to find from center of the screen.
        this.findFromCenterScreenRange = Math.trunc(this.config.finder.range * 2 / 5); // 0.4

        disposables.push(vscode.commands.registerCommand('extension.metaGo', () => {
            this.metaJump()
                .then(({ model }) => {
                    let editor = vscode.window.activeTextEditor;
                    editor.selection = new vscode.Selection(new vscode.Position(model.line, model.character + 1), new vscode.Position(model.line, model.character + 1));
                })

        }));
        disposables.push(vscode.commands.registerCommand('extension.metaGoBefore', () => {
            this.metaJump()
                .then(({ model }) => {
                    let editor = vscode.window.activeTextEditor;
                    editor.selection = new vscode.Selection(new vscode.Position(model.line, model.character), new vscode.Position(model.line, model.character));
                })

        }));

        disposables.push(vscode.commands.registerCommand('extension.metaGo.selection', () => {
            this.metaJump()
                .then(({ model, fromLine, fromChar }) => {
                    let toCharacter = model.character;
                    if (model.line > fromLine) {
                        toCharacter++;
                    } else if (model.line === fromLine) {
                        if (model.character > fromChar) {
                            toCharacter++;
                        }
                    }
                    let editor = vscode.window.activeTextEditor;
                    editor.selection = new vscode.Selection(
                        new vscode.Position(fromLine, fromChar),
                        new vscode.Position(model.line, toCharacter));
                })

        }));

        for (let i = 0; i < disposables.length; i++) {
            context.subscriptions.push(disposables[i]);
        }

        this.decorationModelBuilder.initialize(this.config);
        this.decorator.initialize(this.config);
    }

    updateConfig = () => {
        this.decorator.initialize(this.config);
    }

    private async metaJump() {
        let editor = vscode.window.activeTextEditor;
        let fromLine = editor.selection.active.line;
        let fromChar = editor.selection.active.character;

        await this.viewPort.moveCursorToCenter(false)
        let toLine = editor.selection.active.line;
        let cursorMoveBoundary = this.findFromCenterScreenRange;
        if (Math.abs(toLine - fromLine) < cursorMoveBoundary) {
            // back
            editor.selection = new vscode.Selection(new vscode.Position(fromLine, fromChar), new vscode.Position(fromLine, fromChar));
        };
        return new Promise<{ model: DecorationModel, fromLine: number, fromChar: number }>((resolve) => {
            if (!this.isJumping) {
                this.isJumping = true;
                this.jump((editor, model: any) => { resolve({ model, fromLine, fromChar }); })
                    .then(() => {
                        this.isJumping = false;
                    })
                    .catch(() => {
                        this.isJumping = false;
                    });
            }
        });
    }
    private jump = (jumped: (editor: vscode.TextEditor, model: DecorationModel) => void): Promise<void> => {
        return new Promise<void>((jumpResolve, jumpReject) => {
            let editor = vscode.window.activeTextEditor;

            if (!editor) {
                jumpReject();
                return;
            }

            let messageDisposable = vscode.window.setStatusBarMessage("metaGo: Type");
            const promise = new Promise<DecorationModel>((resolve, reject) => {
                this.getFirstInput(editor, resolve, reject)
            })
                .then((model: DecorationModel) => {
                    jumped(editor, model);
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
    }

    private getFirstInput(editor: vscode.TextEditor, resolve, reject): Promise<void> {
        let firstInlineInput = new InlineInput().show(editor, (v) => v)
            .then((value: string) => {
                if (!value) {
                    reject();
                    return;
                };

                if (value && value.length > 1)
                    value = value.substring(0, 1);

                let selection = this.getSelection(editor);

                let lineCharIndexes = this.find(editor, selection.before, selection.after, value);
                if (lineCharIndexes.count <= 0) {
                    reject("metaGo: no matches");
                    return;
                }

                let decorationModels: DecorationModel[] = this.decorationModelBuilder.buildDecorationModel(lineCharIndexes);

                if (decorationModels.length === 0) return;
                if (decorationModels.length === 1) {
                    resolve(decorationModels[0]);
                }
                else {
                    this.prepareForJumpTo(editor, decorationModels).then((model) => {
                        resolve(model);
                    }).catch(() => {
                        reject();
                    });
                }
            })
            .catch(() => {
                reject();
            });

        return firstInlineInput;
    }

    private getSelection = (editor: vscode.TextEditor): { before: Selection, after: Selection } => {
        let selection: Selection = new Selection();

        if (!editor.selection.isEmpty && this.config.finder.findInSelection === 'on') {
            selection.text = editor.document.getText(editor.selection);

            if (editor.selection.anchor.line > editor.selection.active.line) {
                selection.startLine = editor.selection.active.line;
                selection.lastLine = editor.selection.anchor.line;
            }
            else {
                selection.startLine = editor.selection.anchor.line;
                selection.lastLine = editor.selection.active.line;
            }
            return { before: selection, after: Selection.Empty };
        }
        else {

            selection.startLine = Math.max(editor.selection.active.line - this.halfViewPortRange, 0);
            selection.lastLine = editor.selection.active.line + 1; //current line included in before
            selection.text = editor.document.getText(new vscode.Range(selection.startLine, 0, selection.lastLine, 0));

            let selectionAfter = new Selection();
            selectionAfter.startLine = editor.selection.active.line + 1;
            selectionAfter.lastLine = Math.min(editor.selection.active.line + this.halfViewPortRange, editor.document.lineCount);
            selectionAfter.text = editor.document.getText(new vscode.Range(selectionAfter.startLine, 0, selectionAfter.lastLine, 0));

            return { before: selection, after: selectionAfter };
        }
    }

    private find = (editor: vscode.TextEditor, selectionBefore: Selection, selectionAfter: Selection, value: string): ILineCharIndexes => {
        let lineIndexes: ILineCharIndexes = {
            count: 0,
            focusLine: 0,
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
        if (char && char.length === 0) {
            return [];
        }

        let indices = [];
        let ignoreCase = this.config.finder.targetIgnoreCase;
        if (this.config.finder.findAllMode === 'on') {
            for (var i = 0; i < str.length; i++) {
                if (ignoreCase) {
                    if (str[i] === char) {
                        indices.push(i);
                    };
                } else {
                    if (str[i] && str[i].toLowerCase() === char.toLowerCase()) {
                        indices.push(i);
                    }
                }
            }
        } else {
            //splitted by spaces
            let words = str.split(new RegExp(this.config.finder.wordSeparatorPattern));
            //current line index
            let index = 0;

            for (var i = 0; i < words.length; i++) {
                if (ignoreCase) {
                    if (words[i][0] === char) {
                        indices.push(index);
                    }
                } else {
                    if (words[i][0] && words[i][0].toLowerCase() === char.toLowerCase()) {
                        indices.push(index);
                    }
                }
                // increment by word and white space
                index += words[i].length + 1;
            }
        }
        return indices;
    }

    private prepareForJumpTo = (editor: vscode.TextEditor, models: DecorationModel[]) => {
        return new Promise<DecorationModel>((resolve, reject) => {
            this.decorator.addDecorations(editor, models);
            let messageDisposable = vscode.window.setStatusBarMessage("metaGo: Jump To");
            new InlineInput().show(editor, (v) => v)
                .then((value: string) => {
                    this.decorator.removeDecorations(editor);

                    if (!value) return;

                    let model = models.find(model => model.code[0] && model.code[0].toLowerCase() === value.toLowerCase());

                    if (model.children.length > 1) {
                        this.prepareForJumpTo(editor, model.children)
                            .then((model) => {
                                resolve(model);
                            })
                            .catch(() => {
                                reject();
                            });
                    }
                    else {
                        resolve(model);
                    }
                }).catch(() => {
                    this.decorator.removeDecorations(editor);
                    messageDisposable.dispose();
                    reject();
                });
        });
    }
}
