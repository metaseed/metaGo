import * as vscode from 'vscode';
import { Config } from './config';

enum Mode { Move, Select, Delete }
export class SpaceWord {

    constructor(context: vscode.ExtensionContext, config: Config) {
        context.subscriptions.push(
            vscode.commands.registerTextEditorCommand('metaGo.cursorSpaceWordLeft',
                (editor, edit) => this.left(editor, edit)
            ),
            vscode.commands.registerTextEditorCommand('metaGo.cursorSpaceWordLeftSelect',
                (editor, edit) => this.left(editor, edit, Mode.Select)
            ),
            vscode.commands.registerTextEditorCommand('metaGo.cursorSpaceWordLeftDelete',
                (editor, edit) => this.left(editor, edit, Mode.Delete)
            ),
            vscode.commands.registerTextEditorCommand('metaGo.cursorSpaceWordRight',
                (editor, edit) => this.right(editor, edit)
            ),
            vscode.commands.registerTextEditorCommand('metaGo.cursorSpaceWordRightSelect',
                (editor, edit) => this.right(editor, edit, Mode.Select)
            ),
            vscode.commands.registerTextEditorCommand('metaGo.cursorSpaceWordRightDelete',
                (editor, edit) => this.right(editor, edit, Mode.Delete)
            )
        )
    }

    left(editor, edit, mode = Mode.Move) {
        let selections: vscode.Selection[] = [];
        for (let s = 0; s < editor.selections.length; s++) {
            const selection = editor.selections[s];
            let i = selection.active.line;
            let charIndex = selection.active.character;

            let text: string;
            let position: vscode.Position;

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
                    if (findNoneSpace && (text[j] === ' ' || j === -1) || (j === -1 && selection.active.character-1 !== j)) {
                        position = new vscode.Position(i, j + 1);
                        done = true;
                        break;
                    }
                }
                if (done) break;
            } while (--i > -1);
            if (i === -1) position = selection.active;
            this.action(mode, selection, position, selections, edit);
        }

        editor.selections = selections;
    }

    right(editor: vscode.TextEditor, edit: vscode.TextEditorEdit, mode = Mode.Move) {
        const lines = editor.document.lineCount;
        let selections: vscode.Selection[] = [];
        for (let s = 0; s < editor.selections.length; s++) {
            const selection = editor.selections[s];
            let i = selection.active.line;
            let charIndex = selection.active.character;
            let position: vscode.Position;
            do {
                const line = editor.document.lineAt(i);
                const text = line.text;
                if (selection.active.line !== i) {
                    charIndex = 0;
                }

                let findNoneSpace = false;
                let done = false;
                for (let j = charIndex; j <= text.length; j++) {
                    if (text[j] !== ' ' && text[j] !== undefined) {
                        findNoneSpace = true;
                        continue;
                    }
                    if (findNoneSpace && (text[j] === ' ' || j === text.length) || (j === text.length && j !== selection.active.character) ) {
                        position = new vscode.Position(i, j);
                        done = true;
                        break;
                    }
                }
                if (done) break;
            } while (++i < lines);

            if (i === lines) position = selection.active;

            this.action(mode, selection, position, selections, edit);
        }

        editor.selections = selections;
    }

    action(mode: Mode, selection: vscode.Selection, position: vscode.Position, selections: vscode.Selection[], edit: vscode.TextEditorEdit) {
        switch (mode) {
            case Mode.Move:
                selections.push(new vscode.Selection(position, position));
                break;
            case Mode.Select:
                selections.push(new vscode.Selection(selection.anchor, position));
                break;
            case Mode.Delete:
                const anchor = selection.anchor;
                const active = selection.active;
                edit.delete(new vscode.Range(active, position));
                selections.push(new vscode.Selection(anchor, position));
        }
    }
}