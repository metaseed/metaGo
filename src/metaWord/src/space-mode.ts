import * as vscode from 'vscode';

const SPACE_CHARS = new Set([' ', '\t']);

enum Arrow { Left, Right, Up, Down }

/**
 * Space mode: press the trigger key (alt+;) to enter, then:
 * - arrow keys move the cursor between space-word boundaries
 *   (up -> last boundary in the line above, down -> first boundary in the line below)
 * - shift + arrow keys extend the selection to the same boundaries
 * - backspace deletes back to the previous boundary, delete deletes to the next one
 * - any other (typed) key escapes the mode and is sent to the editor as usual
 *
 * The mode is implemented with a `metaGoSpaceMode` context key that gates the
 * arrow/delete keybindings (see package.json) plus a temporary `type` command
 * override that catches "any other key" — the same approach metaJump uses to
 * own the keyboard while a command mode is active.
 */
export class SpaceMode {
    private active = false;
    private typeDisposable: vscode.Disposable | null = null;
    private editorChangeDisposable: vscode.Disposable | null = null;
    private statusBar: vscode.Disposable | null = null;

    constructor(context: vscode.ExtensionContext) {
        context.subscriptions.push(
            vscode.commands.registerCommand('metaGo.spaceMode.start', () => this.enter()),
            vscode.commands.registerCommand('metaGo.spaceMode.exit', () => this.exit()),

            vscode.commands.registerTextEditorCommand('metaGo.spaceMode.left', (e) => this.move(e, Arrow.Left, false)),
            vscode.commands.registerTextEditorCommand('metaGo.spaceMode.right', (e) => this.move(e, Arrow.Right, false)),
            vscode.commands.registerTextEditorCommand('metaGo.spaceMode.up', (e) => this.move(e, Arrow.Up, false)),
            vscode.commands.registerTextEditorCommand('metaGo.spaceMode.down', (e) => this.move(e, Arrow.Down, false)),

            vscode.commands.registerTextEditorCommand('metaGo.spaceMode.leftSelect', (e) => this.move(e, Arrow.Left, true)),
            vscode.commands.registerTextEditorCommand('metaGo.spaceMode.rightSelect', (e) => this.move(e, Arrow.Right, true)),
            vscode.commands.registerTextEditorCommand('metaGo.spaceMode.upSelect', (e) => this.move(e, Arrow.Up, true)),
            vscode.commands.registerTextEditorCommand('metaGo.spaceMode.downSelect', (e) => this.move(e, Arrow.Down, true)),

            vscode.commands.registerTextEditorCommand('metaGo.spaceMode.deleteLeft', (e, edit) => this.delete(e, edit, Arrow.Left)),
            vscode.commands.registerTextEditorCommand('metaGo.spaceMode.deleteRight', (e, edit) => this.delete(e, edit, Arrow.Right))
        );
    }

    private enter() {
        if (this.active) return;
        if (!vscode.window.activeTextEditor) return;

        this.active = true;
        vscode.commands.executeCommand('setContext', 'metaGoSpaceMode', true);
        this.statusBar = vscode.window.setStatusBarMessage(
            '🏃‍♂️metaGo Space mode: ←→↑↓ move, shift+arrows select, backspace/delete remove, any other key exits'
        );

        // catch "any other key" so it escapes the mode and still takes effect in the editor.
        try {
            this.typeDisposable = vscode.commands.registerCommand('type', (args: { text: string }) => {
                this.exit();
                return vscode.commands.executeCommand('default:type', args);
            });
        } catch {
            // another feature already owns the `type` command; the mode still works through keybindings.
            this.typeDisposable = null;
        }

        this.editorChangeDisposable = vscode.window.onDidChangeActiveTextEditor(() => this.exit());
    }

    private exit() {
        if (!this.active) return;
        this.active = false;
        vscode.commands.executeCommand('setContext', 'metaGoSpaceMode', false);
        this.typeDisposable?.dispose();
        this.typeDisposable = null;
        this.editorChangeDisposable?.dispose();
        this.editorChangeDisposable = null;
        this.statusBar?.dispose();
        this.statusBar = null;
    }

    private isSpaceAt(text: string, i: number): boolean {
        if (i < 0 || i >= text.length) return true; // treat the area outside the line as space
        return SPACE_CHARS.has(text[i]);
    }

    /** positions (0..len) where the line transitions between space and non-space, i.e. the edges of every space-word. */
    private boundaries(text: string): number[] {
        const res: number[] = [];
        for (let k = 0; k <= text.length; k++) {
            if (this.isSpaceAt(text, k - 1) !== this.isSpaceAt(text, k)) res.push(k);
        }
        return res;
    }

    private target(doc: vscode.TextDocument, pos: vscode.Position, dir: Arrow): vscode.Position {
        const line = doc.lineAt(pos.line).text;
        switch (dir) {
            case Arrow.Left: {
                const left = this.boundaries(line).filter(b => b < pos.character).pop();
                if (left !== undefined) return new vscode.Position(pos.line, left);
                if (pos.line > 0) return this.lineEdge(doc, pos.line - 1, true);
                return new vscode.Position(pos.line, 0);
            }
            case Arrow.Right: {
                const right = this.boundaries(line).find(b => b > pos.character);
                if (right !== undefined) return new vscode.Position(pos.line, right);
                if (pos.line < doc.lineCount - 1) return this.lineEdge(doc, pos.line + 1, false);
                return new vscode.Position(pos.line, line.length);
            }
            case Arrow.Up:
                if (pos.line === 0) return pos;
                return this.lineEdge(doc, pos.line - 1, true);
            case Arrow.Down:
                if (pos.line >= doc.lineCount - 1) return pos;
                return this.lineEdge(doc, pos.line + 1, false);
        }
    }

    /** last boundary of a line (last=true) or first boundary (last=false); falls back to the line end/start. */
    private lineEdge(doc: vscode.TextDocument, lineIndex: number, last: boolean): vscode.Position {
        const text = doc.lineAt(lineIndex).text;
        const bs = this.boundaries(text);
        if (bs.length === 0) return new vscode.Position(lineIndex, last ? text.length : 0);
        return new vscode.Position(lineIndex, last ? bs[bs.length - 1] : bs[0]);
    }

    private move(editor: vscode.TextEditor, dir: Arrow, select: boolean) {
        if (!this.active) return;
        const doc = editor.document;
        editor.selections = editor.selections.map(sel => {
            const t = this.target(doc, sel.active, dir);
            return new vscode.Selection(select ? sel.anchor : t, t);
        });
        const active = editor.selection.active;
        editor.revealRange(new vscode.Range(active, active));
    }

    private delete(editor: vscode.TextEditor, edit: vscode.TextEditorEdit, dir: Arrow) {
        if (!this.active) return;
        const doc = editor.document;
        for (const sel of editor.selections) {
            if (!sel.isEmpty) {
                edit.delete(sel);
                continue;
            }
            const t = this.target(doc, sel.active, dir);
            const range = dir === Arrow.Left
                ? new vscode.Range(t, sel.active)
                : new vscode.Range(sel.active, t);
            edit.delete(range);
        }
    }
}
