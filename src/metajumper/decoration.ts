import * as vscode from 'vscode';
import { DecorationModel } from './decoration-model';
import { Config } from '../config';

export class PlaceHolderDecorator {
    private config: Config;
    private cache: { [index: string]: vscode.Uri };
    private decorations: vscode.TextEditorDecorationType[] = [];

    load = (config: Config) => {
        this.config = config;
        this.updateCache();
    }

    addDecorations = (editor: vscode.TextEditor, placeholders: DecorationModel[]) => {
        let decorationType = this.createTextEditorDecorationType(1);
        let decorationType2 = this.createTextEditorDecorationType(2);
        let options = [];
        let options2 = [];
        placeholders.forEach((placeholder) => {
            let len = placeholder.code.length;
            let option = this.createDecorationOptions(null, placeholder.line, placeholder.lineIndex + 1, placeholder.lineIndex + 1, placeholder.code);
            let option2 = this.createDecorationOptions(null, placeholder.line, placeholder.lineIndex + 1, placeholder.lineIndex + 2, placeholder.code);
            if (len === 1)
                options.push(option);
            else
                options2.push(option2);
        })
        this.decorations.push(decorationType);
        this.decorations.push(decorationType2);
        editor.setDecorations(decorationType, options);
        editor.setDecorations(decorationType2, options2);
    }

    removeDecorations = (editor: vscode.TextEditor) => {
        this.decorations.forEach((item) => {
            editor.setDecorations(item, []);
            item.dispose();
        });
    }

    private createTextEditorDecorationType = (charsToOffset: number) => {
        return vscode.window.createTextEditorDecorationType({
            after: {
                margin: `0 0 0 ${charsToOffset * -7}px`,
                height: `${this.config.placeholder.height}px`,
                width: `${this.config.placeholder.width}px`
            }
        });
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
        let width = cf.width;
        if (code.length > 1)
            width = code.length * (width - 2);
        let svg =
            `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${cf.height}" height="${cf.height}" width="${width}"><rect width="${width}" height="${cf.height}" rx="2" ry="2" style="fill: ${cf.backgroundColor};"/><text font-family="${cf.fontFamily}" font-weight="${cf.fontWeight}" font-size="${cf.fontSize}px" fill="${cf.color};" x="${cf.x}" y="${cf.y}">${key}</text></svg>`;
        return vscode.Uri.parse(svg);
    }

}