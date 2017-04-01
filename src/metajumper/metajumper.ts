import { Config } from "../config";
import { InlineInput } from "./inline-input";
import { PlaceHolder, PlaceHolderCalculus } from "./placeholder-calculus";
import { PlaceHolderDecorator } from "./placeholder-decorator";
import * as _ from "lodash";
import * as vscode from "vscode";

class Selection {
    text: string;
    startLine: number;
    lastLine: number;
}

export interface IIndexes { [key: number]: number[]; }

export interface ILineIndexes {
    count: number;
    indexes: IIndexes;
}

export class MetaJumper {
    private config: Config = new Config();
    private placeholderCalculus: PlaceHolderCalculus = new PlaceHolderCalculus();
    private placeHolderDecorator: PlaceHolderDecorator = new PlaceHolderDecorator();
    private isJumping: boolean = false;

    configure = (context: vscode.ExtensionContext) => {
        let disposables: vscode.Disposable[] = [];

        disposables.push(vscode.commands.registerCommand('extension.metaGo', () => {
            if (!this.isJumping) {
                this.isJumping = true;
                this.jump((editor, placeholder) => {
                    editor.selection = new vscode.Selection(new vscode.Position(placeholder.line, placeholder.lineIndex), new vscode.Position(placeholder.line, placeholder.lineIndex));
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
                    editor.selection = new vscode.Selection(new vscode.Position(editor.selection.active.line, editor.selection.active.character), new vscode.Position(placeholder.line, placeholder.lineIndex));
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

        vscode.workspace.onDidChangeConfiguration(this.loadConfig);
        this.loadConfig();
    }

    private loadConfig = () => {
        let config = vscode.workspace.getConfiguration("metaGo");

        this.config.placeholder.backgroundColor = config.get<string>("placeholder.backgroundColor");
        this.config.placeholder.color = config.get<string>("placeholder.color");
        this.config.placeholder.border = config.get<string>("placeholder.border");

        this.config.placeholder.width = config.get<number>("placeholder.width");
        this.config.placeholder.height = config.get<number>("placeholder.height");

        this.config.placeholder.x = config.get<number>("placeholder.x");
        this.config.placeholder.y = config.get<number>("placeholder.y");

        this.config.placeholder.fontSize = config.get<number>("placeholder.fontSize");
        this.config.placeholder.fontWeight = config.get<string>("placeholder.fontWeight");
        this.config.placeholder.fontFamily = config.get<string>("placeholder.fontFamily");
        this.config.placeholder.upperCase = config.get<boolean>("placeholder.upperCase");

        this.config.finder.pattern = config.get<string>("finder.pattern");
        this.config.finder.range = config.get<number>("finder.range");

        this.placeholderCalculus.load(this.config);
        this.placeHolderDecorator.load(this.config);
    }

    private jump = (action: (editor: vscode.TextEditor, placeholder: PlaceHolder) => void): Promise<void> => {
        return new Promise<void>((jumpResolve, jumpReject) => {
            let editor = vscode.window.activeTextEditor;

            if (!editor) {
                jumpReject();
                return;
            }

            let messageDisposable = vscode.window.setStatusBarMessage("metaGo: Type");
            const promise = new Promise<PlaceHolder>((resolve, reject) => {

                let firstInlineInput = new InlineInput().show(editor, (v) => v)
                    .then((value: string) => {

                        if (!value) {
                            reject();
                            return;
                        };

                        if (value && value.length > 1)
                            value = value.substring(0, 1);

                        let selection: Selection = this.getSelection(editor);

                        let lineIndexes: ILineIndexes = this.find(editor, selection, value);
                        if (lineIndexes.count <= 0) {
                            reject("metaGo: no matches");
                            return;
                        }

                        let placeholders: PlaceHolder[] = this.placeholderCalculus.buildPlaceholders(lineIndexes);

                        if (placeholders.length === 0) return;
                        if (placeholders.length === 1) {
                            let placeholder = _.first(placeholders);
                            resolve(placeholder);
                        }
                        else {
                            this.prepareForJumpTo(editor, placeholders).then((placeholder) => {
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
                .then((placeholder: PlaceHolder) => {
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

    private getSelection = (editor: vscode.TextEditor): Selection => {
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
        }
        else {
            selection.startLine = Math.max(editor.selection.active.line - this.config.finder.range, 0);
            selection.lastLine = Math.min(editor.selection.active.line + this.config.finder.range, editor.document.lineCount);
            selection.text = editor.document.getText(new vscode.Range(selection.startLine, 0, selection.lastLine, 0));
        }

        return selection;
    }

    private find = (editor: vscode.TextEditor, selection: Selection, value: string): ILineIndexes => {
        let lineIndexes: ILineIndexes = {
            count: 0,
            indexes: {}
        };

        for (let i = selection.startLine; i < selection.lastLine; i++) {
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
        for (let index = 0; index < str.length; index++) {
            if(char.toLowerCase() === str[index]){
                indices.push(index);
            }
        }
        return indices;
    }

    private indexesOfFirstChar = (str: string, char: string): number[] => {
        if (char.length === 0) {
            return [];
        }

        let indices = [];
        //splitted by spaces
        let words = str.split(new RegExp(this.config.finder.pattern));
        //current line index
        let index = 0;

        for (var i = 0; i < words.length; i++) {
            if (words[i][0] && words[i][0].toLowerCase() === char.toLowerCase()) {
                indices.push(index);
            };

            // increment by word and white space
            index += words[i].length + 1;
        }
        return indices;
    }

    private prepareForJumpTo = (editor: vscode.TextEditor, placeholders: PlaceHolder[]) => {
        return new Promise<PlaceHolder>((resolve, reject) => {
            this.placeHolderDecorator.addDecorations(editor, placeholders);
            let messageDisposable = vscode.window.setStatusBarMessage("metaGo: Jump To");
            new InlineInput().show(editor, (v) => v)
                .then((value: string) => {
                    this.placeHolderDecorator.removeDecorations(editor);

                    if (!value) return;

                    let placeholder = placeholders.find(placeholder => placeholder.key === value.toLowerCase());

                    if (placeholder.root)
                        placeholder = placeholder.root;

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
