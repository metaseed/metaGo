import { Config } from '../config';
import * as vscode from 'vscode';

export class CharIndex {
    constructor(public charIndex, public inteliAdj = InteliAdjustment.Default) {
    }
}
export interface IIndexes {
    // key is line number, value stores character indexes in line
    [key: number]: CharIndex[];
}

export enum InteliAdjustment {
    Before = -1, Default = 0 // default is after
}
export interface ILineCharIndexes {
    count: number;
    indexes: IIndexes;
    focusLine: number;
}

export class DecorationModel {
    // index in character set array
    index: number;
    //string displayed in decoration
    code: string;

    // line index
    line: number;
    //character index in line
    character: number;
    inteliAdj: InteliAdjustment;

    root?: DecorationModel;
    children: DecorationModel[] = [];
}

class LineCharIndex {
    static END = new LineCharIndex();
    constructor(public line: number = -1, public char: number = -1, public inteliAdj: InteliAdjustment = InteliAdjustment.Default) { }
}

enum Direction {
    up = -1, down = 1
}

class LineCharIndexState {

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
        let lineCharIndex = this.direction === Direction.up ? this.up : this.down;
        let line = lineCharIndex.line;
        let charIndexes = this.lineIndexes.indexes[line];

        if (!charIndexes) return { lineCharIndex: LineCharIndex.END, lineChanged: false };//to end;

        if (lineCharIndex.char < charIndexes.length) {
            let r = new LineCharIndex(line, charIndexes[lineCharIndex.char].charIndex, charIndexes[lineCharIndex.char].inteliAdj);
            lineCharIndex.char++
            return { lineCharIndex: r, lineChanged: false };
        } else {
            lineCharIndex.line += this.direction;
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

    buildDecorationModel = (lineIndexes: ILineCharIndexes): DecorationModel[] => {
        let models: DecorationModel[] = [];
        let lineIndexesState = new LineCharIndexState(
            lineIndexes, Direction.up,
            new LineCharIndex(lineIndexes.focusLine, 0),
            new LineCharIndex(lineIndexes.focusLine + 1, 0)
        );

        let twoCharsMax = Math.pow(this.config.finder.characters.length, 2);
        let leadChars = lineIndexes.count > twoCharsMax ? twoCharsMax : lineIndexes.count
        leadChars = Math.trunc(leadChars / this.config.finder.characters.length); // just process two letter codes

        // one char codes
        for (let i = leadChars; i < this.config.finder.characters.length; i++) {
            let lci = lineIndexesState.findNextAutoWrap();
            let lineCharIndex = lci.lineCharIndex;
            if (lineCharIndex === LineCharIndex.END)
                return models;

            let model = new DecorationModel();
            model.code = this.config.finder.characters[i];
            model.index = i;
            model.line = lineCharIndex.line;
            model.character = lineCharIndex.char;
            model.inteliAdj = lineCharIndex.inteliAdj;
            models.push(model);
            if (lci.lineChanged)
                lineIndexesState.toggleDirection();
        }

        // two char codes
        for (let i = 0; i < leadChars; i++) {
            lineIndexesState.toggleDirection();
            let root: DecorationModel;
            for (let k = 0; k < this.config.finder.characters.length; k++) {
                let lineCharIndex = lineIndexesState.findNextAutoWrap().lineCharIndex;

                if (lineCharIndex === LineCharIndex.END)
                    return models;

                let model = new DecorationModel();
                if (k === 0) {
                    root = model;
                }

                model.code = this.config.finder.characters[i] + this.config.finder.characters[k];
                model.index = i;
                model.line = lineCharIndex.line;
                model.character = lineCharIndex.char;
                model.inteliAdj = lineCharIndex.inteliAdj;
                models.push(model);

                let childModel = Object.assign({}, model);
                childModel.root = root;
                childModel.children = [];
                childModel.code = this.config.finder.characters[k];
                root.children.push(childModel);
            }
        }
        return models;
    }

}