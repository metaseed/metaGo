import * as vscode from 'vscode';
import { Config } from './config';

export class SpaceWord {

    constructor(context: vscode.ExtensionContext, config: Config) {
        context.subscriptions.push(
            vscode.commands.registerTextEditorCommand('metaGo.cursorSpaceWordLeft',
                (editor, edit) => {
                    let selections: vscode.Selection[] = [];
                    for (let s = 0; s < editor.selections.length; s++) {
                        const selection = editor.selections[s];
                        let i = selection.active.line;
                        let charIndex = selection.active.character;

                        let text: string;
                        do {
                            const line = editor.document.lineAt(i);
                            text = line.text;
                            if (i !== selection.active.line)
                                charIndex = text.length;

                            let findNoneSpace = false;
                            let done = false;
                            for (let j = charIndex - 1; j >= -1; j--) {
                                if (text[j] !== ' ' && text[j] !== undefined) {
                                    findNoneSpace = true;
                                    continue;
                                }
                                if (findNoneSpace && (text[j] === ' ' || j === -1)) {
                                    const position = new vscode.Position(i, j + 1);
                                    selections.push(new vscode.Selection(position, position));
                                    done = true;
                                    break;
                                }
                            }
                            if (done) break;
                        } while (--i > -1);
                        if (i === -1) selections.push(selection);

                    }

                    editor.selections = selections;
                }
            ),
            vscode.commands.registerTextEditorCommand('metaGo.cursorSpaceWordRight',
                (editor, edit) => {
                    const lines = editor.document.lineCount;
                    let selections: vscode.Selection[] = [];
                    for (let s = 0; s < editor.selections.length; s++) {
                        const selection = editor.selections[s];
                        let i = selection.active.line;
                        let charIndex = selection.active.character;
                        do {
                            const line = editor.document.lineAt(i);
                            const text = line.text;
                            if(selection.active.line !== i) {
                                charIndex = 0;
                            }

                            let findNoneSpace = false;
                            let done = false;
                            for (let j = charIndex; j <= text.length; j++) {
                                if (text[j] !== ' ' && text[j] !== undefined) {
                                    findNoneSpace = true;
                                    continue;
                                }
                                if (findNoneSpace && (text[j] === ' ' || j === text.length)) {
                                    const position = new vscode.Position(i, j);
                                    selections.push(new vscode.Selection(position, position));
                                    done = true;
                                    break;
                                }
                            }
                            if (done) break;
                        } while (++i < lines);

                        if (i === lines) selections.push(selection);
                    }

                    editor.selections = selections;
                }
            )
        )
    }
}