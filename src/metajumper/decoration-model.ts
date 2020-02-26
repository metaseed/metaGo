import { Config } from '../config';
import * as vscode from 'vscode';

export enum SmartAdjustment {
    Before = -1, Default = 0 // default is after
}
export interface ILineCharIndexes {
    indexes: LineCharIndex[];
    lowIndexNearFocus: number;
    highIndexNearFocus: number;
    focus: vscode.Position;
}

export enum Direction {
    up = -1, down = 1
}

export class DecorationModel {
    // code string displayed in decoration
    code: string;
    // line index
    lineIndex: number;
    //character index in line
    charIndex: number;
    smartAdj: SmartAdjustment;
    indexInModels: number;
}

export class LineCharIndex {
    public indexInModels: number = -1;
    static END = new LineCharIndex();
    constructor(public line: number = -1, public char: number = -1, public smartAdj: SmartAdjustment = SmartAdjustment.Default) { 

    }
}

class LineCharIndexState {
    upIndexCounter: number;
    downIndexCounter: number;

    constructor(private lineIndexes: ILineCharIndexes, private direction = Direction.up) { this.upIndexCounter = lineIndexes.lowIndexNearFocus; this.downIndexCounter = lineIndexes.highIndexNearFocus }

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

        let lineChanging = this.upIndexCounter > 0 && this.lineIndexes.indexes[this.upIndexCounter].line !== this.lineIndexes.indexes[this.upIndexCounter - 1].line
        return { lineCharIndex: this.lineIndexes.indexes[this.upIndexCounter--], lineChanging }
    }

    private findDown(): { lineCharIndex: LineCharIndex, lineChanging: boolean } {
        let len = this.lineIndexes.indexes.length;
        if (this.downIndexCounter == -1 || this.downIndexCounter === len) return { lineCharIndex: LineCharIndex.END, lineChanging: false };

        let lineChanging = this.downIndexCounter < len-1 && this.lineIndexes.indexes[this.downIndexCounter].line !== this.lineIndexes.indexes[this.downIndexCounter + 1].line
        return { lineCharIndex: this.lineIndexes.indexes[this.downIndexCounter++], lineChanging }
    }
}

export class DecorationModelBuilder {
    private config: Config;
    initialize = (config: Config) => {
        this.config = config
    }

    buildDecorationModel = (editorToLineCharIndexesMap: Map<vscode.TextEditor, ILineCharIndexes>, locationCount: number): Map<vscode.TextEditor, DecorationModel[]> => {
        let encoder = new Encoder(this.config.jumper.characters, locationCount);
        let models = new Map<vscode.TextEditor, DecorationModel[]>();
        let codeOffset = 0;

        for (let [editor, lineIndexes] of editorToLineCharIndexesMap) {
            let count = lineIndexes.indexes.length;
            if ( count === 0) continue;

            let focusLine = lineIndexes.focus.line;
            let lineIndexesState = new LineCharIndexState(lineIndexes, Direction.up);

            let dModels: DecorationModel[] = []
            for (let i = 0; i < count; i++) {
                let lineCharIndex = lineIndexesState.findNextAutoWrap();
                if (lineCharIndex === LineCharIndex.END)
                    break;

                let code = encoder.getCode(i + codeOffset);
                let model = new DecorationModel();
                model.code = code;
                model.lineIndex = lineCharIndex.line;
                model.charIndex = lineCharIndex.char;
                model.smartAdj = lineCharIndex.smartAdj;
                model.indexInModels = lineCharIndex.indexInModels;
                dModels.push(model)
            }
            models.set(editor, dModels);
            codeOffset += count
        }

        return models;
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

    constructor(public letters: string[], public codeCount: number) {
        var letterCount = letters.length;
        if (codeCount < letterCount) {
            this.dimensions = 1; // fix bug: log(1)/log(26) = 0
            this.usedInLowDim = 0;
            this.notUsedInLowDim = 0;
        } else {
            this.dimensions = Math.ceil(Math.log(codeCount) / Math.log(letterCount));
            var lowDimCount = Math.pow(letterCount, this.dimensions - 1);
            this.usedInLowDim = Math.ceil((codeCount - lowDimCount) / (this.dimensions - 1));
            this.notUsedInLowDim = lowDimCount - this.usedInLowDim;
        }

    }

    private getKeyOfDimension(index: number, dimensions: number): string {
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
        if (index < this.notUsedInLowDim) {
            return this.getKeyOfDimension(index + this.usedInLowDim, this.dimensions - 1);
        }

        return this.getKeyOfDimension(index - this.notUsedInLowDim, this.dimensions);
    }

}