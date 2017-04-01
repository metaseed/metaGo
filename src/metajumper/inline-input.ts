import * as vscode from 'vscode';

class Input {
    text: string;
    validateInput: (text: string) => string;
    resolve: (text: string) => void;
    reject: (reason: any) => void;
    constructor(options: {
        validateInput: (text: string) => string,
        resolve: (text: string) => void,
        reject: (reason: any) => void,
    }) {
        this.text = "";
        this.validateInput = options.validateInput;
        this.resolve = options.resolve;
        this.reject = options.reject;
    }
}

export class InlineInput {
    private subscriptions: vscode.Disposable[] = [];
    private input: Input;

    constructor() {
        this.registerTextEditorCommand('extension.metaGo.input.stop', this.cancel);
    }

    show = (editor: vscode.TextEditor, validateInput: (text: string) => string): Promise<string> => {
        this.setContext(true);
        const promise = new Promise<string>((resolve, reject) => {
            this.input = new Input({ validateInput: validateInput, resolve: resolve, reject: reject });
            vscode.window.onDidChangeActiveTextEditor(() => {
                this.cancel(editor);
            });
        });
        this.registerCommand('type', this.onType);
        return promise;
    }

    private dispose = () => {
        this.subscriptions.forEach((d) => d.dispose());
    }

    private registerTextEditorCommand = (commandId: string, run: (editor: vscode.TextEditor, edit: vscode.TextEditorEdit, ...args: any[]) => void): void => {
        this.subscriptions.push(vscode.commands.registerTextEditorCommand(commandId, run));
    }

    private registerCommand = (commandId: string, run: (...args: any[]) => void): void => {
        this.subscriptions.push(vscode.commands.registerCommand(commandId, run));
    }

    private onType = (event: { text: string }) => {
        const editor = vscode.window.activeTextEditor;

        if (this.input) {
            this.input.text += event.text;
            this.input.validateInput(this.input.text);
            this.complete(editor);
        }
        else
            vscode.commands.executeCommand('default:type', event);
    }

    private cancel = (editor: vscode.TextEditor) => {
        if (this.input) {
            this.input.reject("canceled");
        }
        this.dispose();
        this.setContext(false);
    }

    private complete = (editor: vscode.TextEditor) => {
        if (this.input) {
            this.input.resolve(this.input.text);
        }
        this.dispose();
        this.setContext(false);
    }

    private setContext(value: boolean) {
        vscode.commands.executeCommand('setContext', "metaGoInput", value);
    }
}