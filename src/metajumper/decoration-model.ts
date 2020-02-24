import { Config } from '../config';
import * as vscode from 'vscode';

export class CharIndex {
    constructor(public charIndex, public inteliAdj = SmartAdjustment.Default) {
    }
}
export interface IIndexes {
    // key is line number, value stores character indexes in line
    [lineNumber: number]: CharIndex[];
}

export enum SmartAdjustment {
    Before = -1, Default = 0 // default is after
}
export interface ILineCharIndexes {
    count: number;
    indexes: IIndexes;
    focusLine: number;
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

class LineCharIndex {
    static END = new LineCharIndex();
    constructor(public line: number = -1, public char: number = -1, public indexInModels: number = -1, public smartAdj: SmartAdjustment = SmartAdjustment.Default) { }
}

class LineCharIndexState {
    upIndexCounter = 0;
    downIndexCounter = 1;

    constructor(private lineIndexes: ILineCharIndexes, private direction = Direction.up, private up: LineCharIndex, private down: LineCharIndex) { }

    findNextAutoWrap(): { lineCharIndex: LineCharIndex, lineChanged: boolean } {
        let lineCharIndex = this.findNext();
        if (lineCharIndex.lineCharIndex === LineCharIndex.END) {
            this.toggleDirection();
            lineCharIndex = this.findNext();
        }
        return lineCharIndex;
    }

    toggleDirection() {
        this.direction = this.direction === Direction.up ? Direction.down : Direction.up;
    }

    private findNext(): { lineCharIndex: LineCharIndex, lineChanged: boolean } {
        if (this.direction === Direction.up) {
            return this.findUp();
        } else {
            return this.findDown();
        }
    }

    private findUp(): { lineCharIndex: LineCharIndex, lineChanged: boolean } {
        let lineCharIndex = this.up;
        let line = lineCharIndex.line;
        let charIndexes = this.lineIndexes.indexes[line];

        if (!charIndexes) return { lineCharIndex: LineCharIndex.END, lineChanged: false };//to end;

        if (lineCharIndex.char >= 0) {
            let r = new LineCharIndex(line, charIndexes[lineCharIndex.char].charIndex, this.upIndexCounter--, charIndexes[lineCharIndex.char].inteliAdj);
            lineCharIndex.char--
            return { lineCharIndex: r, lineChanged: false };
        } else {
            lineCharIndex.line -= 1;
            charIndexes = this.lineIndexes.indexes[lineCharIndex.line]
            if (!charIndexes) return { lineCharIndex: LineCharIndex.END, lineChanged: false };//to end;
            lineCharIndex.char = charIndexes.length - 1;
            return { lineCharIndex: this.findNext().lineCharIndex, lineChanged: true };
        }
    }
    private findDown(): { lineCharIndex: LineCharIndex, lineChanged: boolean } {
        let lineCharIndex = this.down;
        let line = lineCharIndex.line;
        let charIndexes = this.lineIndexes.indexes[line];

        if (!charIndexes) return { lineCharIndex: LineCharIndex.END, lineChanged: false };//to end;

        if (lineCharIndex.char < charIndexes.length) {
            let r = new LineCharIndex(line, charIndexes[lineCharIndex.char].charIndex, this.downIndexCounter++, charIndexes[lineCharIndex.char].inteliAdj);
            lineCharIndex.char++
            return { lineCharIndex: r, lineChanged: false };
        } else {
            lineCharIndex.line += 1;
            lineCharIndex.char = 0
            return { lineCharIndex: this.findNext().lineCharIndex, lineChanged: true };
        }
    }
}

export class DecorationModelBuilder {
    private config: Config;
    initialize = (config: Config) => {
        this.config = config
    }

    buildDecorationModel = (editorToLineCharIndexesMap: Map<vscode.TextEditor, ILineCharIndexes>,  locationCount:number): Map<vscode.TextEditor, DecorationModel[]> => {
        let encoder = new Encoder(this.config.jumper.characters, locationCount);
        let models = new Map<vscode.TextEditor, DecorationModel[]>();
        let codeOffset = 0;

        for (let [editor, lineIndexes] of editorToLineCharIndexesMap) {
            if (lineIndexes.count === 0) continue;

            let focusLine = lineIndexes.focusLine;
            let lineIndexesState = new LineCharIndexState(
                lineIndexes, Direction.up,
                new LineCharIndex(focusLine, lineIndexes.indexes[focusLine].length - 1),
                new LineCharIndex(focusLine + 1, 0)
            );

            let dModels: DecorationModel[] = []
            for (let i = 0; i < lineIndexes.count; i++) {
                let lci = lineIndexesState.findNextAutoWrap();
                let lineCharIndex = lci.lineCharIndex;
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
                if (lci.lineChanged)
                    lineIndexesState.toggleDirection();
            }
            models.set(editor, dModels);
            codeOffset += lineIndexes.count
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