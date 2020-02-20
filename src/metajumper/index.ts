import { Config } from "../config";
import { Utilities } from '../lib';
import { InlineInput } from "./inline-input";
import { ILineCharIndexes, IIndexes, DecorationModel, DecorationModelBuilder, InteliAdjustment, Direction, CharIndex } from "./decoration-model";
import { Decorator } from "./decoration";
import { ViewPort } from '../lib/viewport';
import * as vscode from "vscode";

class Selection {
    static Empty = new Selection();
    text: string;
    startLine: number;
    lastLine: number;
}

enum JumpPosition { Before, After, Smart }

export class MetaJumper {
    private config: Config;
    private decorationModelBuilder: DecorationModelBuilder = new DecorationModelBuilder();
    private decorator: Decorator = new Decorator();
    private isJumping: boolean = false;
    private viewPort: ViewPort;
    private findFromCenterScreenRange;
    private halfViewPortRange: number;
    private currentFindIndex = -1;
    private decorationModels: DecorationModel[];
    private isSelectionMode: boolean;

    constructor(context: vscode.ExtensionContext, config: Config) {
        let disposables: vscode.Disposable[] = [];
        this.config = config;
        this.viewPort = new ViewPort();
        this.halfViewPortRange = Math.trunc(this.config.jumper.range / 2); // 0.5
        // determines whether to find from center of the screen.
        this.findFromCenterScreenRange = Math.trunc(this.config.jumper.range * 2 / 5); // 0.4
        // disposables.push(vscode.commands.registerCommand('metaGo.cancel', ()=>this.cancel));
        disposables.push(vscode.commands.registerCommand('metaGo.gotoAfter', () => {
            this.jumpTo(JumpPosition.After);
        }));

        disposables.push(vscode.commands.registerCommand('metaGo.gotoSmart', () => {
            this.jumpTo(JumpPosition.Smart)

        }));

        disposables.push(vscode.commands.registerCommand('metaGo.gotoBefore', () => {
            this.jumpTo(JumpPosition.Before);
        }));

        disposables.push(vscode.commands.registerCommand('metaGo.selectSmart', () => {
            this.selectTo(JumpPosition.Smart);
        }));

        disposables.push(vscode.commands.registerCommand('metaGo.selectBefore', () => {
            this.selectTo(JumpPosition.Before);
        }));

        disposables.push(vscode.commands.registerCommand('metaGo.selectAfter', () => {
            this.selectTo(JumpPosition.After);
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

    private async jumpTo(jumpPosition: JumpPosition) {
        this.isSelectionMode = false;

        try {
            var model = await this.getLocationWithTimeout()
            this.done();

            switch (jumpPosition) {
                case JumpPosition.Before:
                    Utilities.goto(model.line, model.character);
                    break;

                case JumpPosition.After:
                    Utilities.goto(model.line, model.character + 1);
                    break;

                case JumpPosition.Smart:
                    Utilities.goto(model.line, model.character + 1 + model.smartAdj);
                    break;

                default:
                    throw "unexpected JumpPosition value";
            }
        }
        catch (err) {
            this.cancel();
            console.log("metago:" + err);
        }
    }

    private async selectTo(jumpPosition: JumpPosition) {
        this.isSelectionMode = true;
        let editor = vscode.window.activeTextEditor;
        const selection = editor.selection;
        let position = selection.active.line === selection.end.line ? selection.start : selection.end;
        let fromLine = position.line;
        let fromChar = position.character;
        try {
            var model = await this.getLocationWithTimeout()
            this.done();
            let toCharacter = model.character;

            switch (jumpPosition) {
                case JumpPosition.Before:
                    break;
                case JumpPosition.After:
                    toCharacter++;
                    break;
                case JumpPosition.Smart:
                    if (model.line > fromLine) {
                        toCharacter++;
                    }
                    else if (model.line === fromLine) {
                        if (model.character > fromChar) {
                            toCharacter++;
                        }
                    }
                    break;
                default:
                    throw "unexpected JumpPosition value";
            }

            Utilities.select(fromLine, fromChar, model.line, toCharacter);
        }
        catch (err) {
            this.cancel();
            console.log("metago:" + err);
        }
    }

    private done() {
        this.isJumping = false;
    }

    private cancel() {
        while (InlineInput.instances.length > 0) {
            InlineInput.instances[0].cancelInput();
        }
        this.isJumping = false;
    }
    private async getPosition() {
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
    }
    private jumpTimeoutId = null;

    private async getLocationWithTimeout() {
        if (!this.isJumping) {
            this.isJumping = true;

            this.jumpTimeoutId = setTimeout(() => { this.jumpTimeoutId = null; this.cancel(); }, this.config.jumper.timeout);
            try {
                var [, model] = await this.getLocation();
                return model;
            }
            finally {
                if (this.jumpTimeoutId) {
                    clearTimeout(this.jumpTimeoutId);
                    this.jumpTimeoutId = null;
                }
            }
        } else {
            throw new Error('metago: reinvoke goto command');
        }
    }

    private async getLocation(): Promise<[vscode.TextEditor, DecorationModel]> {
        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            throw new Error('no active editor');
        }

        let msg = this.isSelectionMode ? "metaGo: Type to Select" : "metaGo: Type To Jump"
        let messageDisposable = vscode.window.setStatusBarMessage(msg, this.config.jumper.timeout);

        try {
            this.decorator.addCommandIndicator(editor);

            var value = await this.getFirstInput(editor);
            if (!value) {
                throw new Error('no locction char input')
            }
            if (value && value.length > 1)
                value = value.substring(0, 1);

            var model: DecorationModel = null;
            if (value === ' ' && this.currentFindIndex !== Number.NaN && this.decorationModels) {
                let model = this.decorationModels.find((model) => model.indexInModels === (this.currentFindIndex + 1));
                if (model) {
                    this.currentFindIndex++;
                } else {
                    throw new Error('metaGo: no next find');
                }
            } else if (value === '\n' && this.currentFindIndex !== Number.NaN && this.decorationModels) {
                let model = this.decorationModels.find((model) => model.indexInModels === (this.currentFindIndex - 1));
                if (model) {
                    this.currentFindIndex--;
                } else {
                    throw new Error('metaGo: no previous find');
                }
            } else {
                var selection = await this.getJumpRange(editor);
                let lineCharIndexes = this.find(editor, selection.before, selection.after, value);
                if (lineCharIndexes.count <= 0) {
                    throw new Error("metaGo: no matches");
                }

                this.decorationModels = this.decorationModelBuilder.buildDecorationModel(lineCharIndexes);

                if (this.decorationModels.length === 0) {
                    throw new Error("metaGo: encoding error")
                }

                var models = this.decorationModels;
                model = models[0]; // only one, length == 1
                while(models.length > 1){
                    model = await this.getExactLocation(editor, models);
                    models = model.children;
                }
            }

            let msg = this.isSelectionMode ? 'metaGo: Selected!' : 'metaGo: Jumped!';
            vscode.window.setStatusBarMessage(msg, 2000);
            return [editor, model];

        } catch (reason) {
            if (!reason) reason = new Error("Canceled!");
            this.decorator.removeCommandIndicator(editor);
            vscode.window.setStatusBarMessage(`metaGo: ${reason}`, 2000);
            throw reason;
        } finally {
            messageDisposable.dispose();
        }
    }

    private getFirstInput = (editor: vscode.TextEditor) => {
        let result = new InlineInput(this.config)
            .input(editor, (v) => {
                this.decorator.removeCommandIndicator(editor);
                return v;
            })
        return result;
    }

    private async getJumpRange(editor: vscode.TextEditor): Promise<{ before: Selection, after: Selection }> {
        let selection = new Selection();

        if (!editor.selection.isEmpty && this.config.jumper.findInSelection === 'on') {
            selection.text = editor.document.getText(editor.selection);

            if (editor.selection.anchor.line > editor.selection.active.line) {
                selection.startLine = editor.selection.active.line;
                selection.lastLine = editor.selection.anchor.line;
            }
            else {
                selection.startLine = editor.selection.anchor.line;
                selection.lastLine = editor.selection.active.line;
            }
            selection.lastLine++;
            return { before: selection, after: Selection.Empty };
        }
        else {
            await this.getPosition();
            selection.startLine = Math.max(editor.selection.active.line - this.config.jumper.range, 0);
            selection.lastLine = editor.selection.active.line + 1; //current line included in before
            selection.text = editor.document.getText(new vscode.Range(selection.startLine, 0, selection.lastLine, 0));

            let selectionAfter = new Selection();
            selectionAfter.startLine = editor.selection.active.line + 1;
            selectionAfter.lastLine = Math.min(editor.selection.active.line + this.config.jumper.range, editor.document.lineCount);
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

    private smartAdjBefore(str: string, char: string, index: number): InteliAdjustment {
        let regexp = new RegExp('\\w');
        if (this.smartAdjBeforeRegex(str, char, index, regexp) === InteliAdjustment.Before) {
            return InteliAdjustment.Before;
        }
        regexp = new RegExp(/[^\w\s]/);
        return this.smartAdjBeforeRegex(str, char, index, regexp);
    }

    private smartAdjBeforeRegex(str: string, char: string, index: number, regexp: RegExp): InteliAdjustment {

        if (regexp.test(char)) {
            if (index === 0 && str.length !== 1) {
                if (regexp.test(str[1])) return InteliAdjustment.Before;
            } else {
                if (str[index + 1] && regexp.test(str[index + 1]) && !regexp.test(str[index - 1]))
                    return InteliAdjustment.Before;
            }
        }
        return InteliAdjustment.Default;
    }

    private indexesOf = (str: string, char: string): CharIndex[] => {
        if (char && char.length === 0) {
            return [];
        }

        let indices = [];
        let ignoreCase = this.config.jumper.targetIgnoreCase;
        if (this.config.jumper.findAllMode === 'on') {
            for (var i = 0; i < str.length; i++) {
                if (!ignoreCase) {
                    if (str[i] === char) {
                        let adj = this.smartAdjBefore(str, char, i);
                        indices.push(new CharIndex(i, adj));
                    };
                } else {
                    if (str[i] && str[i].toLowerCase() === char.toLowerCase()) {
                        let adj = this.smartAdjBefore(str, char, i);
                        indices.push(new CharIndex(i, adj));
                    }
                }
            }
        } else {
            //splitted by spaces
            let words = str.split(new RegExp(this.config.jumper.wordSeparatorPattern));
            //current line index
            let index = 0;

            for (var i = 0; i < words.length; i++) {
                if (!ignoreCase) {
                    if (words[i][0] === char) {
                        indices.push(new CharIndex(index));
                    }
                } else {
                    if (words[i][0] && words[i][0].toLowerCase() === char.toLowerCase()) {
                        let adj = this.smartAdjBefore(str, char, i);
                        indices.push(new CharIndex(index, adj));
                    }
                }
                // increment by word and white space
                index += words[i].length + 1;
            }
        }
        return indices;
    }

    private getExactLocation = async (editor: vscode.TextEditor, models: DecorationModel[]) => {
        // show location candidates
        var decs = this.decorator.create(editor, models);

        let msg = this.isSelectionMode ? "metaGo: Select To" : "metaGo: Jump To";
        let messageDisposable = vscode.window.setStatusBarMessage(msg, this.config.jumper.timeout);

        try {
            // wait for first code key
            var value = await new InlineInput(this.config).onKey(this.config.decoration.hide.trigerKey, editor, v => v, 'type the character to goto',
                k => { // down
                    if (this.jumpTimeoutId != null) clearTimeout(this.jumpTimeoutId);
                    this.decorator.hide(editor, decs)
                }, k => { // up
                    this.jumpTimeoutId = setTimeout(() => { this.jumpTimeoutId = null; this.cancel(); }, this.config.jumper.timeout);
                    this.decorator.show(editor, decs);
                }, k => {
                }
            );

            this.decorator.remove(editor);
            if (!value) throw new Error('no key code input')

            if (value === '\n') {
                let model = models.find(model => model.indexInModels === 0);
                if (model) {
                    this.currentFindIndex = 0;
                    return model
                }
            }
            else if (value === ' ') {
                let model = models.find(model => model.indexInModels === 1);
                if (model) {
                    this.currentFindIndex = 1;
                    return model
                }
            }

            // filter location candidates
            let model = models.find(model => model.code[0] && model.code[0].toLowerCase() === value.toLowerCase());
            this.currentFindIndex = model.indexInModels;
            return model

        } catch (e) {
            this.decorator.remove(editor);
            throw e;
        }finally{
            messageDisposable.dispose();

        }

    }
}
