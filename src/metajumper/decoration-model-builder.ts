import { Config } from '../config';
import * as vscode from 'vscode';
import * as _ from 'lodash';
import { ILineIndexes, IIndexes } from './metajumper';


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

    buildDecorationModel1 = (lineIndexes: ILineIndexes): DecorationModel[] => {
        let models: DecorationModel[] = [];
        let lineIndexesState = new LineCharIndexState(lineIndexes, Direction.up,
            { line: lineIndexes.focusLine, char: 0 },
            { line: lineIndexes.focusLine + 1, char: 0 }
        );

        let leadLetters = Math.trunc(lineIndexes.count % Math.pow(this.config.finder.characters.length, 2) / this.config.finder.characters.length); // just process two letter codes

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

    buildDecorationModel = (lineIndexes: ILineIndexes): DecorationModel[] => {
        let models: DecorationModel[] = [];
        let count: number = 0;
        let candidate: number = 1;
        let map: DecorationModel[][] = [];
        let breakCycles: boolean = false;

        for (let key in lineIndexes.indexes) {
            let line = parseInt(key);
            let lineIndex = lineIndexes.indexes[key];

            for (let i = 0; i < lineIndex.length; i++) {
                if (count + 1 > Math.pow(this.config.finder.characters.length, 2)) {
                    breakCycles = true;
                    break;
                }

                let indexInLine = lineIndex[i];

                if (count >= this.config.finder.characters.length) {
                    for (let y = candidate; y < models.length; y++) {
                        let movingModel = models[y];
                        let previousIndex = movingModel.index - 1;

                        if (map[previousIndex].length < this.config.finder.characters.length) {
                            _.remove(map[movingModel.index], item => item === movingModel);
                            movingModel.index = previousIndex;
                            map[movingModel.index].push(movingModel);
                        }

                        movingModel.code = this.config.finder.characters[movingModel.index];
                    }
                    candidate++;
                }

                let model = new DecorationModel();

                model.index = 0;
                let last = _.last(models);
                if (last)
                    model.index = last.index + 1;

                if (model.index >= this.config.finder.characters.length)
                    model.index = this.config.finder.characters.length - 1;

                model.code = this.config.finder.characters[model.index];
                model.line = line;
                model.character = indexInLine;

                if (!map[model.index])
                    map[model.index] = [];

                models.push(model);
                map[model.index].push(model);
                count++;
            }

            if (breakCycles)
                break;
        }

        // we assign root to other placeholders   
        _.each(_.filter(map, item => item.length > 1), mappedModels => {
            let root = mappedModels[0];

            for (let y = 0; y < mappedModels.length; y++) {
                let mappedModel: DecorationModel = mappedModels[y];

                // first mapped models is the root!
                if (y > 0)
                    mappedModel.root = root;

                let model = new DecorationModel();
                model.index = y;
                model.code = this.config.finder.characters[model.index];// 2 characters support
                model.line = mappedModel.line;
                model.character = mappedModel.character;
                mappedModel.code += model.code;
                // add a copy of model as children of root
                root.children.push(model);
            }
        });

        return models;
    }

    getIndexByChar = (char: string): number => {
        return this.config.finder.characters.indexOf(char);
    }

    private isLastChar = (char: string) => {
        let index = this.config.finder.characters.indexOf(char);
        return index + 1 >= this.config.finder.characters.length;
    }

    private nextChar = (char: string) => {
        if (this.isLastChar(char)) {
            return this.config.finder.characters[0];
        }
        else {
            let index = this.config.finder.characters.indexOf(char);
            return this.config.finder.characters[index + 1];
        }
    }

}