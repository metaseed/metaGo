import * as vscode from 'vscode';
import { DecorationModel } from './decoration-model';
import { Config } from '../config';

export class PlaceHolderDecorator {
    private config: Config;
    private cache: { [index: string]: vscode.Uri };
    private decorations: { [index: number]: vscode.TextEditorDecorationType } = {};

    load = (config: Config) => {
        this.config = config;
        this.updateCache();
    }

    addDecorations = (editor: vscode.TextEditor, decorationModel: DecorationModel[]) => {
        let decorationType = this.createTextEditorDecorationType(1);
        let decorationType2 = this.createTextEditorDecorationType(2);

        let options = [];
        let options2 = [];
        decorationModel.forEach((placeholder) => {
            let code = placeholder.code;
            let len = code.length;

            let option: any;
            if (len === 1) {
                option = this.createDecorationOptions(null, placeholder.line, placeholder.character + 1, placeholder.character + 1, code);
                options.push(option);
            }
            else {
                option = this.createDecorationOptions(null, placeholder.line, placeholder.character + 1, placeholder.character + len, code);
                options2.push(option);
            }
        })
        editor.setDecorations(decorationType, options);
        editor.setDecorations(decorationType2, options2);
    }

    removeDecorations = (editor: vscode.TextEditor) => {
        for (var dec in this.decorations) {
            if (this.decorations[dec] === null) continue;
            editor.setDecorations(this.decorations[dec], []);
            this.decorations[dec].dispose();
            this.decorations[dec] = null;
        }
    }

    private createTextEditorDecorationType = (charsToOffset: number) => {
        let decorationType = this.decorations[charsToOffset];
        if (decorationType) return decorationType;
        decorationType = vscode.window.createTextEditorDecorationType({
            after: {
                margin: `0 0 0 ${charsToOffset * (-this.config.placeholder.width)}px`,
                height: `${this.config.placeholder.height}px`,
                width: `${charsToOffset * this.config.placeholder.width}px`
            }
        });
        this.decorations[charsToOffset] = decorationType;
        return decorationType;
    }

    private createDecorationOptions = (context: vscode.ExtensionContext, line: number, startCharacter: number, endCharacter: number, code: string): vscode.DecorationOptions => {
        return {
            range: new vscode.Range(line, startCharacter, line, endCharacter),
            renderOptions: {
                dark: {
                    after: {
                        contentIconPath: this.getUri(code)
                    }
                },
                light: {
                    after: {
                        contentIconPath: this.getUri(code)
                    }
                }
            }
        };
    }

    private getUri = (code: string) => {
        if (this.cache[code] != undefined)
            return this.cache[code];
        this.cache[code] = this.buildUri(code);
        return this.cache[code];
    }

    private updateCache = () => {
        this.cache = {};
        this.config.finder.characters.forEach(code => this.cache[code] = this.buildUri(code))
    }

    private buildUri = (code: string) => {
        let cf = this.config.placeholder;
        let key = this.config.placeholder.upperCase ? code.toUpperCase() : code.toLowerCase();
        let width = code.length * cf.width;
        let colors = cf.backgroundColor.split(',');
        let bgColor = colors[(code.length-1) % colors.length];
        let svg =
            `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${cf.height}" height="${cf.height}" width="${width}"><rect width="${width}" height="${cf.height}" rx="3" ry="3" style="fill: ${bgColor};fill-opacity:0.85;stroke:${cf.stroke};stroke-opacity:0.85;"/><text font-family="${cf.fontFamily}" font-weight="${cf.fontWeight}" font-size="${cf.fontSize}px" fill="${cf.color};" x="${cf.x}" y="${cf.y}">${key}</text></svg>`;
        return vscode.Uri.parse(svg);
    }

}