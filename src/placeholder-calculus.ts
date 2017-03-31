import { Config } from './config';
import * as vscode from 'vscode';
import * as _ from 'lodash';
import { ILineIndexes, IIndexes } from './metago';


export class PlaceHolder {
    index: number;
    key: string;
    line: number;
    character: number;
    root?: PlaceHolder;
    children: PlaceHolder[] = [];
}

export class PlaceHolderCalculus {
    private config: Config;

    load = (config: Config) => {
        this.config = config
    }

    buildPlaceholders = (lineIndexes: ILineIndexes): PlaceHolder[] => {
        let placeholders: PlaceHolder[] = [];
        let count: number = 0;
        let candidate: number = 1;
        let map: PlaceHolder[][] = [];
        let breakCycles: boolean = false;

        for (let key in lineIndexes.indexes) {
            let line = parseInt(key);
            let lineIndex = lineIndexes.indexes[key];

            for (let i = 0; i < lineIndex.length; i++) {
                if (count + 1 > Math.pow(this.config.finder.characters.length, 2)) {
                    breakCycles = true;
                    break;
                }

                let character = lineIndex[i];

                if (count >= this.config.finder.characters.length) {
                    for (let y = candidate; y < placeholders.length; y++) {
                        let movingPlaceholder = placeholders[y];
                        let previousIndex = movingPlaceholder.index - 1;

                        if (map[previousIndex].length < this.config.finder.characters.length) {
                            _.remove(map[movingPlaceholder.index], item => item === movingPlaceholder);
                            movingPlaceholder.index = previousIndex;
                            map[movingPlaceholder.index].push(movingPlaceholder);
                        }

                        movingPlaceholder.key = this.config.finder.characters[movingPlaceholder.index];
                    }
                    candidate++;
                }

                let placeholder = new PlaceHolder();

                placeholder.index = 0;
                let last = _.last(placeholders);
                if (last)
                    placeholder.index = last.index + 1;

                if (placeholder.index >= this.config.finder.characters.length)
                    placeholder.index = this.config.finder.characters.length - 1;

                placeholder.key = this.config.finder.characters[placeholder.index];
                placeholder.line = line;
                placeholder.character = character;

                if (!map[placeholder.index])
                    map[placeholder.index] = [];

                placeholders.push(placeholder);
                map[placeholder.index].push(placeholder);
                count++;
            }

            if (breakCycles)
                break;
        }

        // we assign root to other placeholders   
        _.each(_.filter(map, item => item.length > 1), mappedPlaceholders => {
            let root = mappedPlaceholders[0];

            for (let y = 0; y < mappedPlaceholders.length; y++) {
                let mappedPlaceholder: PlaceHolder = mappedPlaceholders[y];

                // first mappedPlaceholder is the root!
                if (y > 0)
                    mappedPlaceholder.root = root;

                let placeholder = new PlaceHolder();
                placeholder.index = y;
                placeholder.key = this.config.finder.characters[placeholder.index];
                placeholder.line = mappedPlaceholder.line;
                placeholder.character = mappedPlaceholder.character;

                // add a copy of placeholder as children of root
                root.children.push(placeholder);
            }
        });

        return placeholders;
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