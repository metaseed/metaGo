import * as vscode from 'vscode';
import { Config } from './config';

export enum Mode { Move, Select, Delete }
export class MetaSpaceWord {

    updateConfig() {

    }
    constructor(context: vscode.ExtensionContext, private config: Config) {
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

            vscode.commands.registerTextEditorCommand('metaGo.cursorSpaceWordSpaceLeft',
                (editor, edit) => this.left(editor, edit, Mode.Move, true)
            ),
            vscode.commands.registerTextEditorCommand('metaGo.cursorSpaceWordSpaceLeftSelect',
                (editor, edit) => this.left(editor, edit, Mode.Select, true)
            ),
            vscode.commands.registerTextEditorCommand('metaGo.cursorSpaceWordSpaceLeftDelete',
                (editor, edit) => this.left(editor, edit, Mode.Delete, true)
            ),

            vscode.commands.registerTextEditorCommand('metaGo.cursorSpaceWordRight',
                (editor, edit) => this.right(editor, edit)
            ),
            vscode.commands.registerTextEditorCommand('metaGo.cursorSpaceWordRightSelect',
                (editor, edit) => this.right(editor, edit, Mode.Select)
            ),
            vscode.commands.registerTextEditorCommand('metaGo.cursorSpaceWordRightDelete',
                (editor, edit) => this.right(editor, edit, Mode.Delete)
            ),

            vscode.commands.registerTextEditorCommand('metaGo.cursorSpaceWordSpaceRight',
                (editor, edit) => this.right(editor, edit, Mode.Move, true)
            ),
            vscode.commands.registerTextEditorCommand('metaGo.cursorSpaceWordSpaceRightSelect',
                (editor, edit) => this.right(editor, edit, Mode.Select, true)
            ),
            vscode.commands.registerTextEditorCommand('metaGo.cursorSpaceWordSpaceRightDelete',
                (editor, edit) => this.right(editor, edit, Mode.Delete, true)
            )
        )
    }

    left(editor: vscode.TextEditor, edit: vscode.TextEditorEdit, mode = Mode.Move, includeChar = true, chars = [' ', '\t']) {
        let selections: vscode.Selection[] = [];
        for (let s = 0; s < editor.selections.length; s++) {
            const selection = editor.selections[s];
            let i = selection.active.line;
            let charIndex = selection.active.character;
            if (charIndex === 0) {
                i--;
            }

            let position: vscode.Position = selection.active;
            const line = editor.document.lineAt(i);
            var text = line.text;
            if (i !== selection.active.line)
                charIndex = text.length;

            let findNoneSpace = false;
            let findSpace = false;
            for (let j = charIndex - 1; j >= -1; j--) {
                if (chars.every(c => c !== text[j]) && text[j] !== undefined) {
                    findNoneSpace = true;
                    if (!includeChar || !findSpace)
                        continue;
                }
                if (j === -1) {
                    position = new vscode.Position(i, j + 1);
                    break;
                }
                if (includeChar) {
                    if (chars.some(c => c === text[j])) {
                        findSpace = true;
                        continue;
                    }
                    if (findSpace) {
                        position = new vscode.Position(i, j + 1);
                        break;
                    }
                } else {
                    if (findNoneSpace && chars.some(c => c === text[j])) {
                        position = new vscode.Position(i, j + 1);
                        break;
                    }
                }
            }
            if (i === -1) position = selection.active;
            this.action(mode, selection, position, selections, edit);
        }

        editor.selections = selections;
    }

    right(editor: vscode.TextEditor, edit: vscode.TextEditorEdit, mode = Mode.Move, includeChar = true, chars = [' ', '\t']) {
        const lines = editor.document.lineCount;
        let selections: vscode.Selection[] = [];

        for (let s = 0; s < editor.selections.length; s++) {
            const selection = editor.selections[s];
            let i = selection.active.line;
            const line = editor.document.lineAt(i);
            let charIndex = selection.active.character;
            let text = line.text;
            if (charIndex === line.text.length) {
                i++;
                text = editor.document.lineAt(i).text;
                charIndex = 0;
            }
            let position: vscode.Position = selection.active;

            let findNoneSpace = false;
            let findSpace = false;
            for (let j = charIndex; j <= text.length; j++) {
                if (chars.every(c => c !== text[j]) && text[j] !== undefined) {
                    findNoneSpace = true;
                    if (!includeChar || !findSpace)
                        continue;
                }
                if (j === text.length) {
                    position = new vscode.Position(i, j);
                    break;
                }

                if (includeChar) {
                    if (chars.some(c => c === text[j])) {
                        findSpace = true;
                        continue;
                    }
                    if (findSpace) {
                        position = new vscode.Position(i, j);
                        break;
                    }
                } else {
                    if (findNoneSpace && chars.some(c => c === text[j])) {
                        position = new vscode.Position(i, j);
                        break;
                    }
                }
            }

            if (i === lines) position = selection.active;

            this.action(mode, selection, position, selections, edit);
        }

        editor.selections = selections;
    }

    up(editor: vscode.TextEditor, edit: vscode.TextEditorEdit, mode = Mode.Move, includeChar = true, chars = [' ', '\t']) {
        this.vertical(editor, edit, mode, includeChar, chars, true);
    }

    down(editor: vscode.TextEditor, edit: vscode.TextEditorEdit, mode = Mode.Move, includeChar = true, chars = [' ', '\t']) {
        this.vertical(editor, edit, mode, includeChar, chars, false);
    }

    /**
     * Move up/down by reusing the left/right space-word scan: hop onto the nearest
     * non-empty line (skipping blank/whitespace-only lines) and then run left (for up,
     * scanning back from the line end) or right (for down, from the line start).
     */
    private vertical(editor: vscode.TextEditor, edit: vscode.TextEditorEdit, mode: Mode, includeChar: boolean, chars: string[], isUp: boolean) {
        const doc = editor.document;
        const origin = editor.selections;
        const originActive = origin.map(s => s.active);
        const targetLines = origin.map(sel => this.adjacentNonEmptyLine(doc, sel.active.line, isUp ? -1 : 1));
        if (targetLines.every(line => line < 0)) return; // nowhere to go (top/bottom of file)

        // hop each cursor onto its target line, keeping the anchor for Select.
        editor.selections = origin.map((sel, k) => {
            if (targetLines[k] < 0) return sel;
            const col = isUp ? doc.lineAt(targetLines[k]).text.length : 0;
            const pos = new vscode.Position(targetLines[k], col);
            return new vscode.Selection(sel.anchor, pos);
        });

        // let left/right land on the space-word boundary; for Delete we land first, then remove.
        const scanMode = mode === Mode.Delete ? Mode.Move : mode;
        if (isUp) this.left(editor, edit, scanMode, includeChar, chars);
        else this.right(editor, edit, scanMode, includeChar, chars);

        // restore any cursor that had no target line (left/right would have nudged it sideways).
        if (targetLines.some(line => line < 0)) {
            editor.selections = editor.selections.map((sel, k) => targetLines[k] < 0 ? origin[k] : sel);
        }

        if (mode === Mode.Delete) {
            editor.selections = editor.selections.map((sel, k) => {
                if (targetLines[k] < 0) return sel;
                edit.delete(new vscode.Range(originActive[k], sel.active));
                return new vscode.Selection(sel.active, sel.active);
            });
        }
    }

    /** nearest non-empty (non whitespace-only) line in `step` direction, or -1 if none. */
    private adjacentNonEmptyLine(doc: vscode.TextDocument, fromLine: number, step: number): number {
        for (let i = fromLine + step; i >= 0 && i < doc.lineCount; i += step) {
            if (doc.lineAt(i).text.trim().length > 0) return i;
        }
        return -1;
    }

    private action(mode: Mode, selection: vscode.Selection, position: vscode.Position, selections: vscode.Selection[], edit: vscode.TextEditorEdit) {
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