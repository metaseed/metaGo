import * as vscode from 'vscode';
import { MetaSpaceWord, Mode } from './space-word';

/**
 * Space mode: press the trigger key (alt+;) to enter, then:
 * - left/right move the cursor between space-word boundaries
 * - up/down skip empty lines, hop onto the nearest non-empty line and reuse the
 *   left/right space-word scan there
 * - shift + arrow keys extend the selection to the same targets
 * - backspace/delete remove from the cursor to that target
 * - any other (typed) key escapes the mode and is sent to the editor as usual
 *
 * All of the actual movement/selection/deletion is delegated to MetaSpaceWord
 * (space-word.ts). The mode just owns the keyboard: a `metaGoSpaceMode` context
 * key gates the arrow/delete keybindings (see package.json) plus a temporary
 * `type` command override that catches "any other key" — the same approach
 * metaJump uses while a command mode is active.
 */
export class SpaceMode {
    private active = false;
    private typeDisposable: vscode.Disposable | null = null;
    private editorChangeDisposable: vscode.Disposable | null = null;
    private statusBar: vscode.Disposable | null = null;

    constructor(context: vscode.ExtensionContext, private word: MetaSpaceWord) {
        context.subscriptions.push(
            vscode.commands.registerCommand('metaGo.spaceMode.start', () => this.enter()),
            vscode.commands.registerCommand('metaGo.spaceMode.exit', () => this.exit()),

            vscode.commands.registerTextEditorCommand('metaGo.spaceMode.left', (e, ed) => this.run(e, () => this.word.left(e, ed, Mode.Move))),
            vscode.commands.registerTextEditorCommand('metaGo.spaceMode.right', (e, ed) => this.run(e, () => this.word.right(e, ed, Mode.Move))),
            vscode.commands.registerTextEditorCommand('metaGo.spaceMode.up', (e, ed) => this.run(e, () => this.word.up(e, ed, Mode.Move))),
            vscode.commands.registerTextEditorCommand('metaGo.spaceMode.down', (e, ed) => this.run(e, () => this.word.down(e, ed, Mode.Move))),

            vscode.commands.registerTextEditorCommand('metaGo.spaceMode.leftSelect', (e, ed) => this.run(e, () => this.word.left(e, ed, Mode.Select))),
            vscode.commands.registerTextEditorCommand('metaGo.spaceMode.rightSelect', (e, ed) => this.run(e, () => this.word.right(e, ed, Mode.Select))),
            vscode.commands.registerTextEditorCommand('metaGo.spaceMode.upSelect', (e, ed) => this.run(e, () => this.word.up(e, ed, Mode.Select))),
            vscode.commands.registerTextEditorCommand('metaGo.spaceMode.downSelect', (e, ed) => this.run(e, () => this.word.down(e, ed, Mode.Select))),

            vscode.commands.registerTextEditorCommand('metaGo.spaceMode.deleteLeft', (e, ed) => this.run(e, () => this.word.left(e, ed, Mode.Delete))),
            vscode.commands.registerTextEditorCommand('metaGo.spaceMode.deleteRight', (e, ed) => this.run(e, () => this.word.right(e, ed, Mode.Delete))),
            vscode.commands.registerTextEditorCommand('metaGo.spaceMode.deleteUp', (e, ed) => this.run(e, () => this.word.up(e, ed, Mode.Delete))),
            vscode.commands.registerTextEditorCommand('metaGo.spaceMode.deleteDown', (e, ed) => this.run(e, () => this.word.down(e, ed, Mode.Delete)))
        );
    }

    private run(editor: vscode.TextEditor, action: () => void) {
        if (!this.active) return;
        action();
        const active = editor.selection.active;
        editor.revealRange(new vscode.Range(active, active));
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
}
