import { Config } from '../config';
import * as vscode from 'vscode';
import * as _ from 'lodash';

export interface IIndexes { [key: number]: number[]; }

export interface ILineIndexes {
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
    root?: DecorationModel;
    children: DecorationModel[] = [];
}

class LineCharIndex {
    static END = new LineCharIndex();
    constructor(public line: number = -1, public char: number = -1) { }
}

enum Direction {
    up = -1, down = 1
}

class LineCharIndexState {

    constructor(private lineIndexes: ILineIndexes, private direction = Direction.up, private up: LineCharIndex, private down: LineCharIndex) { }

    findNextAutoWrap(): LineCharIndex {
        let lineCharIndex = this.findNext(this.direction);
        if (lineCharIndex === LineCharIndex.END) {
            this.toggleDirection();
            lineCharIndex = this.findNext(this.direction);
        }
        return lineCharIndex;
    }

    toggleDirection() {
        this.direction = this.direction === Direction.up ? Direction.down : Direction.up;
    }

    private findNext(direction: Direction): LineCharIndex {
        let lineCharIndex = direction === Direction.up ? this.up : this.down;
        let line = lineCharIndex.line;
        let charIndexes = this.lineIndexes.indexes[line];
        if (!charIndexes) return LineCharIndex.END;//to end;
        if (lineCharIndex.char < charIndexes.length) {
            return new LineCharIndex(line, charIndexes[lineCharIndex.char++]);
        } else {
            lineCharIndex.line += direction;
            lineCharIndex.char = 0
            return this.findNext(direction);
        }
    }
}

export class DecorationModelBuilder {
    private config: Config;

    load = (config: Config) => {
        this.config = config
    }

    buildDecorationModel = (lineIndexes: ILineIndexes): DecorationModel[] => {
        let models: DecorationModel[] = [];
        let lineIndexesState = new LineCharIndexState(lineIndexes, Direction.up,
            { line: lineIndexes.focusLine, char: 0 },
            { line: lineIndexes.focusLine + 1, char: 0 }
        );
        let twoCharsMax = Math.pow(this.config.finder.characters.length, 2);
        let leadLetters = lineIndexes.count > twoCharsMax ? twoCharsMax : lineIndexes.count
        leadLetters = Math.trunc(leadLetters / this.config.finder.characters.length); // just process two letter codes

        // one char codes
        for (let i = leadLetters; i < this.config.finder.characters.length; i++) {
            let lineCharIndex = lineIndexesState.findNextAutoWrap();
            if (lineCharIndex === LineCharIndex.END)
                return models;
            let model = new DecorationModel();
            model.code = this.config.finder.characters[i];
            model.index = i;
            model.line = lineCharIndex.line;
            model.character = lineCharIndex.char;
            models.push(model);
        }

        // two char codes
        for (let i = 0; i < leadLetters; i++) {
            lineIndexesState.toggleDirection();
            let root: DecorationModel;
            for (let k = 0; k < this.config.finder.characters.length; k++) {
                let lineCharIndex = lineIndexesState.findNextAutoWrap();
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