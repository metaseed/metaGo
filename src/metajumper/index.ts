import { Config } from "../config";
import { Utilities } from '../lib';
import { Input } from "./input";
import { ILineCharIndexes, DecorationModel, DecorationModelBuilder, SmartAdjustment, LineCharIndex } from "./decoration-model";
import { Decorator } from "./decoration";
import { ViewPort } from '../lib/viewport';
import * as vscode from "vscode";
import { Cursor } from "../lib/cursor";
import { stringify } from "querystring";

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
    private currentFindIndex = -1;
    private editorToDecorationModels = new Map<vscode.TextEditor, DecorationModel[]>()
    private isSelectionMode: boolean;

    constructor(context: vscode.ExtensionContext, config: Config) {
        let disposables: vscode.Disposable[] = [];
        this.config = config;
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
                    Utilities.goto(editor, model.line, model.char);
                    break;

                case JumpPosition.After:
                    Utilities.goto(editor, model.line, model.char + 1);
                    break;

                case JumpPosition.Smart:
                    Utilities.goto(editor, model.line, model.char + 1 + model.smartAdj);
                    break;

                default:
                    throw "unexpected JumpPosition value";
            }
        }
        catch (err) {
            this.cancel();
            console.log("metago:" + err.message + err.stack);
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
            let toCharacter = model.char;

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
                        if (model.char > fromChar) {
                            toCharacter++;
                        }
                    }
                    break;
                default:
                    throw "unexpected JumpPosition value";
            }

            Utilities.select(editor, fromLine, fromChar, model.line, toCharacter);
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
                let {lineCharIndexes, followingChars} = this.find(editor, jumpRange, locationChars);
                if (lineCharIndexes.indexes.length > 0)
                    editorToLineCharIndexesMap.set(editor, lineCharIndexes);
            }

            let targetCount = 0;
            editorToLineCharIndexesMap.forEach(lineCharIndex => targetCount += lineCharIndex.indexes.length)
            if (targetCount <= 0) {
                throw new Error("metaGo: no target location match for input char");
            }

            let editorToModelsMap = this.decorationModelBuilder.buildDecorationModel(editorToLineCharIndexesMap, targetCount);
            this.editorToDecorationModels = editorToModelsMap;
            // here, we have editorToModelsMap.size > 1 || models.length > 1
            do {
                editorToModelsMap = await this.getExactLocation(editorToModelsMap, locationChars);

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

    private async getJumpRange(editor: vscode.TextEditor): Promise<vscode.Range[]> {
        if (this.config.jumper.findInSelection === 'on') {
            let selections: vscode.Selection[] = editor.selections;
            selections = selections.filter(s => !s.isEmpty)
            if (selections.length != 0) // editor.selection.isEmpty
                return selections;

        }
        return editor.visibleRanges;

    }

    private find = (editor: vscode.TextEditor, ranges: vscode.Range[], targetChars: string) => {
        let { document, selection } = editor;
        let lineCharIndexes: ILineCharIndexes = {
            focus: selection.active,
            lowIndexNearFocus: -1,
            highIndexNearFocus: -1,
            indexes: []
        };

        let followingChars = new Set<string>();

        for (const range of ranges) {
            if (range.isEmpty) continue;

            let start = range.start;
            let end = range.end;
            for (let lineIndex = start.line; lineIndex <= end.line; lineIndex++) {
                let text: string;
                if (range.isSingleLine) {
                    text = document.getText(range)
                } else {
                    let line = document.lineAt(lineIndex);
                    text = line.text
                    if (lineIndex === start.line && start.character !== 0) {
                        text = text.substring(range.start.character);
                    } else if (lineIndex === end.line && end.character !== line.range.end.character) {
                        text = text.substring(0, end.character);
                    }
                }

                let { indexes, followingChars:followingCharsInLine } = this.indexesOf(lineIndex, text, targetChars);
                for (const ind of indexes) {
                    let len = lineCharIndexes.indexes.length;
                    ind.indexInModels = len;
                    lineCharIndexes.indexes.push(ind);

                    if (lineIndex < lineCharIndexes.focus.line) {//up
                        lineCharIndexes.lowIndexNearFocus = len;
                    } else if (lineIndex == lineCharIndexes.focus.line) {
                        if (ind.char <= lineCharIndexes.focus.character) {// left
                            lineCharIndexes.lowIndexNearFocus = len;
                        }
                    }

                }
                followingCharsInLine.forEach(char=>followingChars.add(char))
            }
        }

        if (lineCharIndexes.lowIndexNearFocus !== lineCharIndexes.indexes.length - 1)
            lineCharIndexes.highIndexNearFocus = lineCharIndexes.lowIndexNearFocus + 1;

        return {lineCharIndexes, followingChars}
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

    private indexesOf = (line: number, textInline: string, char: string) => {
        let indexes: LineCharIndex[] = [];
        let followingChars = new Set<string>();
        if (char && char.length === 0) {
            return { indexes, followingChars }
        }

        if (char === '\n') {
            indexes.push(new LineCharIndex(line, textInline.length))
            return { indexes, followingChars };
        }

        let ignoreCase = char.toLocaleLowerCase() === char; // no UperCase
        if (this.config.jumper.findAllMode === 'on') {
            for (var i = 0; i < textInline.length; i++) {
                let found = ignoreCase ? textInline[i] && textInline[i].toLowerCase() === char.toLowerCase() : textInline[i] === char;
                if (found) {
                    let adj = this.smartAdjBefore(textInline, char, i);
                    indexes.push(new LineCharIndex(line, i, adj));
                    let followingChar = textInline[i+1];
                    if(followingChar) followingChars.add(followingChar);
                }

            }
        } else {
            //splitted by spaces
            let words = textInline.split(new RegExp(this.config.jumper.wordSeparatorPattern));
            //current line index
            let index = 0;

            for (var i = 0; i < words.length; i++) {
                let found = ignoreCase ? words[i][0] && words[i][0].toLowerCase() === char.toLowerCase() : words[i][0] === char;
                if (found) {
                    let adj = this.smartAdjBefore(textInline, char, i);
                    indexes.push(new LineCharIndex(line, index, adj));
                    let followingChar = textInline[i+1];
                    if(followingChar) followingChars.add(followingChar);
                }
                // increment by word and white space
                index += words[i].length + 1;
            }
        }
        return { indexes, followingChars };
    }

    private getExactLocation = async (editorToModelsMap: Map<vscode.TextEditor, DecorationModel[]>, targetChars: string) => {
        // show location candidates
        var decs = this.decorator.createAll(editorToModelsMap, targetChars);

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
                    if (model.code[0] && model.code[0] === value) {
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
