import { Config } from '../config';
import * as vscode from 'vscode';
import * as _ from 'lodash';
import { ILineIndexes, IIndexes } from './metajumper';


export class DecorationModel {
    index: number;
    code: string;
    line: number;
    lineIndex: number;
    root?: DecorationModel;
    children: DecorationModel[] = [];
}

export class DecorationModelManager {
    private config: Config;

    load = (config: Config) => {
        this.config = config
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
                model.lineIndex = indexInLine;

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
                model.lineIndex = mappedModel.lineIndex;
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