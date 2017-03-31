import * as vscode from 'vscode';
import { PlaceHolder } from './placeholder-calculus';
import { Config } from './config';

export class PlaceHolderDecorator {
    private config: Config;
    private cache: { [index: string]: vscode.Uri };
    private decorations: vscode.TextEditorDecorationType[] = [];

    load = (config: Config) => {
        this.config = config;
        this.updateCache();
    }

    addDecorations = (editor: vscode.TextEditor, placeholders: PlaceHolder[]) => {
        let decorationType = vscode.window.createTextEditorDecorationType({
            after: {
                margin: `0 0 0 -7px`,
                height: `${this.config.placeholder.height}px`,
                width: `${this.config.placeholder.width}px`
            }
        });
        let options = [];
        placeholders.forEach((placeholder) => {
            let option = {
                range: new vscode.Range(placeholder.line, placeholder.character + 1, placeholder.line, placeholder.character + 1),
                renderOptions: {
                    dark: {
                        after: {
                            contentIconPath: this.cache[placeholder.key]
                        }
                    },
                    light: {
                        after: {
                            contentIconPath: this.cache[placeholder.key]
                        }
                    }
                }
            };
            options.push(option);
        })
        this.decorations.push(decorationType);
        editor.setDecorations(decorationType, options);
    }

    removeDecorations = (editor: vscode.TextEditor) => {
        this.decorations.forEach((item) => {
            editor.setDecorations(item, []);
            item.dispose();
        });
    }

    private updateCache = () => {
        this.cache = {};
        this.config.finder.characters.forEach(code => this.cache[code] = this.buildUri(code))
    }

    private buildUri = (code: string) => {
               let cf = this.config.placeholder;
        let key = this.config.placeholder.upperCase ? code.toUpperCase() : code.toLowerCase();
        let svg = 
        `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${cf.width} ${cf.height}" height="${cf.height}" width="${cf.width}"><rect width="${cf.width}" height="${cf.height}" rx="2" ry="2" style="fill: ${cf.backgroundColor};"/><text font-family="${cf.fontFamily}" font-weight="${cf.fontWeight}" font-size="${cf.fontSize}px" fill="${cf.color};" x="${cf.x}" y="${cf.y}">${key}</text></svg>`;
        return vscode.Uri.parse(svg);
    }

}