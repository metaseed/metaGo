import { Config } from "../config";
import { Utilities } from '../lib';
import { Input } from "./input";
import { ILineCharIndexes, IIndexes, DecorationModel, DecorationModelBuilder, SmartAdjustment, Direction, CharIndex } from "./decoration-model";
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
    private editorToDecorationModels = new Map<vscode.TextEditor, DecorationModel[]>()
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

        disposables.push(vscode.commands.registerCommand('metaGo.gotoAfterActive', () => {
            this.jumpTo(JumpPosition.After, false);
        }));

        disposables.push(vscode.commands.registerCommand('metaGo.gotoSmartActive', () => {
            this.jumpTo(JumpPosition.Smart, false)

        }));

        disposables.push(vscode.commands.registerCommand('metaGo.gotoBeforeActive', () => {
            this.jumpTo(JumpPosition.Before, false);
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

    private async jumpTo(jumpPosition: JumpPosition, mutiEditor: boolean = true) {
        this.isSelectionMode = false;

        try {
            var [editor, model] = await this.getLocationWithTimeout(mutiEditor)
            this.done();
            switch (jumpPosition) {
                case JumpPosition.Before:
                    Utilities.goto(editor, model.lineIndex, model.charIndex);
                    break;

                case JumpPosition.After:
                    Utilities.goto(editor, model.lineIndex, model.charIndex + 1);
                    break;

                case JumpPosition.Smart:
                    Utilities.goto(editor, model.lineIndex, model.charIndex + 1 + model.smartAdj);
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
            var [ed, model] = await this.getLocationWithTimeout(false)
            this.done();
            let toCharacter = model.charIndex;

            switch (jumpPosition) {
                case JumpPosition.Before:
                    break;
                case JumpPosition.After:
                    toCharacter++;
                    break;
                case JumpPosition.Smart:
                    if (model.lineIndex > fromLine) {
                        toCharacter++;
                    }
                    else if (model.lineIndex === fromLine) {
                        if (model.charIndex > fromChar) {
                            toCharacter++;
                        }
                    }
                    break;
                default:
                    throw "unexpected JumpPosition value";
            }

            Utilities.select(editor, fromLine, fromChar, model.lineIndex, toCharacter);
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
        while (Input.instances.length > 0) {
            Input.instances[0].cancelInput();
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

    private async getLocationWithTimeout(mutiEditor: boolean) {
        if (!this.isJumping) {
            this.isJumping = true;

            this.jumpTimeoutId = setTimeout(() => { this.jumpTimeoutId = null; this.cancel(); }, this.config.jumper.timeout);
            try {
                var model = await this.getLocation(mutiEditor);
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

    private async getLocation(mutiEditor: boolean): Promise<[vscode.TextEditor, DecorationModel]> {
        let inputEditor = vscode.window.activeTextEditor ?? vscode.window.visibleTextEditors[0];
        if (!inputEditor) {
            throw new Error('no visible editor');
        }

        let msg = this.isSelectionMode ? "metaGo: Type to Select" : "metaGo: Type To Jump"
        let messageDisposable = vscode.window.setStatusBarMessage(msg, this.config.jumper.timeout);

        try {
            this.decorator.addCommandIndicator(inputEditor);

            var locationChars = await this.getLocationChar(inputEditor);
            if (!locationChars) {
                throw new Error('no location char input')
            }
            if (locationChars && locationChars.length > 1)
                locationChars = locationChars.substring(0, 1);

            var editor: vscode.TextEditor = null;
            var models: DecorationModel[] = null;
            var model: DecorationModel = null;
            // if (locationChars === ' ' && this.currentFindIndex !== Number.NaN && this.editorToDecorationModels) {
            //     let model = this.editorToDecorationModels.find(model => model.indexInModels === (this.currentFindIndex + 1));
            //     if (model) {
            //         this.currentFindIndex++;
            //     } else {
            //         throw new Error('metaGo: no next find');
            //     }
            // } else if (locationChars === '\n' && this.currentFindIndex !== Number.NaN && this.editorToDecorationModels) {
            //     let model = this.editorToDecorationModels.find(model => model.indexInModels === (this.currentFindIndex - 1));
            //     if (model) {
            //         this.currentFindIndex--;
            //     } else {
            //         throw new Error('metaGo: no previous find');
            //     }
            // } else
            //{
            let editorToLineCharIndexesMap = new Map<vscode.TextEditor, ILineCharIndexes>()
            let editors = mutiEditor ? [inputEditor, ...vscode.window.visibleTextEditors.filter(e => e !== inputEditor)] : [inputEditor]
            for (let editor of editors) {
                var jumpRange = await this.getJumpRange(editor);
                let lineCharIndexes = this.find(editor, jumpRange.before, jumpRange.after, locationChars);
                if (lineCharIndexes.count > 0)
                    editorToLineCharIndexesMap.set(editor, lineCharIndexes);
            }

            let locationCount = 0;
            editorToLineCharIndexesMap.forEach(lineCharIndex => locationCount += lineCharIndex.count)
            if (locationCount <= 0) {
                throw new Error("metaGo: no location match for input char");
            }

            let editorToModelsMap = this.decorationModelBuilder.buildDecorationModel(editorToLineCharIndexesMap, locationCount);
            this.editorToDecorationModels = editorToModelsMap;
            // here, we have editorToModelsMap.size > 1 || models.length > 1
            do {
                editorToModelsMap = await this.getExactLocation(editorToModelsMap);

                if (editorToModelsMap.size == 0) throw new Error("metaGo: no match in codes for input char");

                [editor, models] = editorToModelsMap.entries().next().value; // first entry
            } while (editorToModelsMap.size > 1 || models.length > 1);

            model = models[0];
            this.currentFindIndex = model.indexInModels;
            //}

            let msg = this.isSelectionMode ? 'metaGo: Selected!' : 'metaGo: Jumped!';
            vscode.window.setStatusBarMessage(msg, 2000);
            return [editor, model];

        } catch (reason) {
            if (!reason) reason = new Error("Canceled!");
            this.decorator.removeCommandIndicator(inputEditor);
            vscode.window.setStatusBarMessage(`metaGo: ${reason}`, 2000);
            throw reason;
        } finally {
            messageDisposable.dispose();
        }
    }

    private getLocationChar = (editor: vscode.TextEditor) => {
        let result = new Input(this.config)
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

    private find = (editor: vscode.TextEditor, selectionBefore: Selection, selectionAfter: Selection, locationChars: string): ILineCharIndexes => {
        let editorLineCharIndexes: ILineCharIndexes = {
            count: 0,
            focusLine: 0,
            indexes: {}
        };

        for (let i = selectionBefore.startLine; i < selectionBefore.lastLine; i++) {
            let line = editor.document.lineAt(i);
            let indexes = this.indexesOf(line.text, locationChars);
            editorLineCharIndexes.count += indexes.length;
            editorLineCharIndexes.indexes[i] = indexes;
        }
        editorLineCharIndexes.focusLine = editor.selection.active.line;

        for (let i = selectionAfter.startLine; i < selectionAfter.lastLine; i++) {
            let line = editor.document.lineAt(i);
            let indexes = this.indexesOf(line.text, locationChars);
            editorLineCharIndexes.count += indexes.length;
            editorLineCharIndexes.indexes[i] = indexes;
        }
        return editorLineCharIndexes;
    }

    private smartAdjBefore(str: string, char: string, index: number): SmartAdjustment {
        let regexp = new RegExp('\\w');
        if (this.smartAdjBeforeRegex(str, char, index, regexp) === SmartAdjustment.Before) {
            return SmartAdjustment.Before;
        }
        regexp = new RegExp(/[^\w\s]/);
        return this.smartAdjBeforeRegex(str, char, index, regexp);
    }

    private smartAdjBeforeRegex(str: string, char: string, index: number, regexp: RegExp): SmartAdjustment {

        if (regexp.test(char)) {
            if (index === 0 && str.length !== 1) {
                if (regexp.test(str[1])) return SmartAdjustment.Before;
            } else {
                if (str[index + 1] && regexp.test(str[index + 1]) && !regexp.test(str[index - 1]))
                    return SmartAdjustment.Before;
            }
        }
        return SmartAdjustment.Default;
    }

    private indexesOf = (str: string, char: string): CharIndex[] => {
        if (char && char.length === 0) {
            return [];
        }

        let indices = [];

        if (char === '\n') {
            indices.push(new CharIndex(str.length))
            return indices;
        }

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

    private getExactLocation = async (editorToModelsMap: Map<vscode.TextEditor, DecorationModel[]>) => {
        // show location candidates
        var decs = this.decorator.createAll(editorToModelsMap);

        let msg = this.isSelectionMode ? "metaGo: Select To" : "metaGo: Jump To";
        let messageDisposable = vscode.window.setStatusBarMessage(msg, this.config.jumper.timeout);

        try {
            let editor = vscode.window.activeTextEditor ?? vscode.window.visibleTextEditors[0];
            // wait for first code key
            var value = await new Input(this.config).onKey(this.config.decoration.hide.trigerKey, editor, v => v, 'type the character to goto',
                k => { // down
                    if (this.jumpTimeoutId != null) clearTimeout(this.jumpTimeoutId);
                    this.decorator.hideAll(decs)
                }, k => { // up
                    this.jumpTimeoutId = setTimeout(() => { this.jumpTimeoutId = null; this.cancel(); }, this.config.jumper.timeout);
                    this.decorator.showAll(decs);
                }, k => {
                }
            );

            this.decorator.removeAll(decs);
            if (!value) throw new Error('no key code input')

            // if (value === '\n') {
            //     let model = models.find(model => model.indexInModels === 0);
            //     if (model) {
            //         this.currentFindIndex = 0;
            //         return [model]
            //     }
            // }
            // else if (value === ' ') {
            //     let model = models.find(model => model.indexInModels === 1);
            //     if (model) {
            //         this.currentFindIndex = 1;
            //         return [model]
            //     }
            // }

            editorToModelsMap.forEach((models, editor) => {
                // filter location candidates
                models = models.filter(model => {
                    if (model.code[0] && model.code[0].toLowerCase() === value.toLowerCase()) {
                        model.code = model.code.substring(1)
                        return true;
                    }
                    return false;
                })

                if (models.length == 0) editorToModelsMap.delete(editor)
                else editorToModelsMap.set(editor, models)
            })
            return editorToModelsMap

        } catch (e) {
            this.decorator.removeAll(decs);
            throw e;
        } finally {
            messageDisposable.dispose();

        }

    }
}
