import { Config } from '../config';
import * as vscode from 'vscode';

export enum SmartAdjustment {
    Before = -1, Default = 0 // default is after
}
export interface ILineCharIndexes {
    indexes: LineCharIndex[];
    lowIndexNearFocus: number;
    highIndexNearFocus: number;
    firstIndexInParagraph: number;
    lastIndexInParagraphy: number;
}

export enum Direction {
    up = -1, down = 1
}


export class LineCharIndex {
    static END = new LineCharIndex();
    constructor(public line = -1, public char = -1, public text = "", public smartAdj = SmartAdjustment.Default) {

    }
}

export class DecorationModel extends LineCharIndex {
    // code string displayed in decoration
    code: string;

    constructor(lineCharIndex: LineCharIndex) {
        super(lineCharIndex.line, lineCharIndex.char, lineCharIndex.text, lineCharIndex.smartAdj);
    }
}

class LineCharIndexState {
    upIndexCounter: number;
    downIndexCounter: number;
    indexes: LineCharIndex[];

    constructor(private lineIndexes: ILineCharIndexes, private firstIndex: number, private count: number, private direction = Direction.up) {
        this.upIndexCounter = lineIndexes.lowIndexNearFocus - firstIndex;
        this.downIndexCounter = lineIndexes.highIndexNearFocus - firstIndex;
        this.indexes = lineIndexes.indexes.slice(firstIndex, firstIndex + count);
    }

    findNextAutoWrap() {
        let r = this.findNext();
        if (r.lineCharIndex === LineCharIndex.END) {
            this.toggleDirection();
            r = this.findNext();
        }
        if (r.lineChanging)
            this.toggleDirection();
        return r.lineCharIndex;
    }

    private toggleDirection() {
        this.direction = this.direction === Direction.up ? Direction.down : Direction.up;
    }

    private findNext(): { lineCharIndex: LineCharIndex, lineChanging: boolean } {
        if (this.direction === Direction.up) {
            return this.findUp();
        } else {
            return this.findDown();
        }
    }

    private findUp(): { lineCharIndex: LineCharIndex, lineChanging: boolean } {
        if (this.upIndexCounter == -1) return { lineCharIndex: LineCharIndex.END, lineChanging: false };

        let lineChanging = this.upIndexCounter > 0 && this.indexes[this.upIndexCounter].line !== this.indexes[this.upIndexCounter - 1].line
        return { lineCharIndex: this.indexes[this.upIndexCounter--], lineChanging }
    }

    private findDown(): { lineCharIndex: LineCharIndex, lineChanging: boolean } {
        let len = this.indexes.length;
        if (this.downIndexCounter == -1 || this.downIndexCounter === len) return { lineCharIndex: LineCharIndex.END, lineChanging: false };

        let lineChanging = this.downIndexCounter < len - 1 && this.indexes[this.downIndexCounter].line !== this.indexes[this.downIndexCounter + 1].line
        return { lineCharIndex: this.indexes[this.downIndexCounter++], lineChanging }
    }
}

export class DecorationModelBuilder {
    private config: Config;
    initialize = (config: Config) => {
        this.config = config
    }

    buildDecorationModel = (editorToLineCharIndexesMap: Map<vscode.TextEditor, ILineCharIndexes>, lettersExcluded: Set<string>, enableSequentialTargetChars: boolean, targetCharsCount: number, rippleSupport: boolean) => {
        if (editorToLineCharIndexesMap.size === 0) throw new Error("metaGo: no open editor");

        let chars = lettersExcluded === null || lettersExcluded.size === 0 ? this.config.jumper.characters : this.config.jumper.characters.filter(c => !lettersExcluded.has(c.toUpperCase()) && !lettersExcluded.has(c.toLowerCase()));
        let signalCharLetters = lettersExcluded === null ? this.config.jumper.additionalSingleCharCodeCharacters : this.config.jumper.additionalSingleCharCodeCharacters.filter(c => !lettersExcluded.has(c));

        let targetCount = 0;
        let all = 0;
        editorToLineCharIndexesMap.forEach(lineCharIndex => all += lineCharIndex.indexes.length);
        targetCount = all;
        let indexParagraph = false;
        let availableOneChars = chars.length + signalCharLetters.length;

        let [[activeEditor, activeLineCharIndexes]] = editorToLineCharIndexesMap;// current active doc
        if (enableSequentialTargetChars && rippleSupport) {
            if (targetCharsCount === 1) {
                targetCount = availableOneChars;
                if (activeLineCharIndexes.firstIndexInParagraph !== -1 && activeLineCharIndexes.lastIndexInParagraphy !== -1) {
                    let countInParagraph = activeLineCharIndexes.lastIndexInParagraphy - activeLineCharIndexes.firstIndexInParagraph + 1;
                    if (countInParagraph > targetCount) {
                        targetCount = countInParagraph;
                        indexParagraph = true;
                    }

                }
                let activeLen = activeLineCharIndexes.indexes.length;
                if (activeLen < targetCount) {
                    if (activeLen === 0) {
                        targetCount = all > targetCount ? targetCount : all;
                    } else {
                        targetCount = activeLen;
                    }
                }

            }
            else if (targetCharsCount === 2 && editorToLineCharIndexesMap.size > 1) {
                let c = activeLineCharIndexes.indexes.length;
                if (c !== 0 && c > availableOneChars)
                    targetCount = c;
            }
        }

        if (targetCount <= 0) {
            throw new Error("metaGo: no target location match for input char");
        }

        let encoder = new Encoder(targetCount, chars, signalCharLetters);
        let editorToModelsMap = new Map<vscode.TextEditor, DecorationModel[]>();
        let codeOffset = 0;
        let tCount = 0;

        for (let [editor, lineIndexes] of editorToLineCharIndexesMap) {
            let count = lineIndexes.indexes.length;
            if (count === 0) continue;

            let firstIndex = 0;
            if (editor === activeEditor && indexParagraph) {
                firstIndex = lineIndexes.firstIndexInParagraph;
                count = lineIndexes.lastIndexInParagraphy - lineIndexes.firstIndexInParagraph + 1;
            }
            let lineIndexesState = new LineCharIndexState(lineIndexes, firstIndex, count, Direction.up);

            let dModels: DecorationModel[] = []
            for (let i = 0; i < count; i++) {
                let lineCharIndex = lineIndexesState.findNextAutoWrap();
                if (lineCharIndex === LineCharIndex.END)
                    break;

                let code = encoder.getCode(i + codeOffset);
                let model = new DecorationModel(lineCharIndex);
                model.code = code;
                dModels.push(model);
                tCount++;
                if (tCount >= targetCount) break;
            }
            editorToModelsMap.set(editor, dModels);
            codeOffset += count;
            if (tCount >= targetCount) break;
        }

        return editorToModelsMap;
    }
}

// rules:
// dimension prority: x>y>z;
// if x is full, then add y dimension at first(next)...
// if all units used in high dimension, pick first(next) one in this dimension, and add it's demision then, fill the added demision to the end.
export class Encoder {
    private dimensions: number;
    private usedInLowDim: number;
    private notUsedInLowDim: number;

    constructor(public codeCount: number, public letters: string[], public additionalFirstDimOnlyLetters: string[] = []) {
        let letterCount = letters.length;
        let codeCountRemain = codeCount - additionalFirstDimOnlyLetters.length;

        if (codeCountRemain <= letterCount) {
            this.dimensions = 1; // fix bug: log(1)/log(26) = 0
            this.usedInLowDim = 0;
            this.notUsedInLowDim = 0;
        } else {
            this.dimensions = Math.ceil(Math.log(codeCountRemain) / Math.log(letterCount));
            var lowDimCount = Math.pow(letterCount, this.dimensions - 1);
            this.usedInLowDim = Math.ceil((codeCountRemain - lowDimCount) / (this.letters.length - 1));
            this.notUsedInLowDim = lowDimCount - this.usedInLowDim;

        }

    }

    private getCodeOfDimension(index: number, dimensions: number): string {
        var ii = index;
        var len = this.letters.length;
        var code = ''
        do {
            var i = ii % len;
            code = this.letters[i] + code;
            ii = Math.floor(ii / len);
        } while (ii > 0);

        return code.padStart(dimensions, this.letters[0]);
    }

    public getCode(index: number): string {
        let singleCodeLetters = this.additionalFirstDimOnlyLetters.length;
        if (this.dimensions === 1) { // a, b, ... then A, B, C
            if (index < this.letters.length)
                return this.getCodeOfDimension(index, this.dimensions);
            return this.additionalFirstDimOnlyLetters[index - this.letters.length];

        } else if (this.dimensions === 2) { // 
            if (index < this.notUsedInLowDim) {
                return this.getCodeOfDimension(index + this.usedInLowDim, this.dimensions - 1);
            } else if (index < this.notUsedInLowDim + singleCodeLetters) {
                return this.additionalFirstDimOnlyLetters[index - this.notUsedInLowDim];
            }

            return this.getCodeOfDimension(index - (this.notUsedInLowDim + singleCodeLetters), this.dimensions);
        } else {
            if (index < singleCodeLetters)
                return this.additionalFirstDimOnlyLetters[index];
            else if (index < this.notUsedInLowDim + singleCodeLetters) {
                return this.getCodeOfDimension(index - singleCodeLetters + this.usedInLowDim, this.dimensions - 1);
            }

            return this.getCodeOfDimension(index - singleCodeLetters - this.notUsedInLowDim, this.dimensions);
        }
    }

}