import * as vscode from 'vscode';
import { DecorationModel } from './decoration-model';
import { Config } from '../config';

export class Decorator {
	private config: Config;
	private cache: { [index: string]: vscode.ThemableDecorationAttachmentRenderOptions };
	private decorations: { [index: number]: vscode.TextEditorDecorationType } = {};
	public charDecorationType;

	initialize = (config: Config) => {
		this.config = config;
		this.updateCache();
		this.charDecorationType = vscode.window.createTextEditorDecorationType({
			backgroundColor: 'rgba(0,255,0,0.3)',
			borderWidth: '2px',
			borderStyle: 'solid',
			light: {
				// this color will be used in light color themes
				borderColor: 'rgba(0,255,0,0.3)'
			},
			dark: {
				// this color will be used in dark color themes
				borderColor: 'rgba(0,255,0,0.3)'
			}
		});
	}

	addCommandIndicator = (editor: vscode.TextEditor) => {
		let line = editor.selection.anchor.line;
		let char = editor.selection.anchor.character;
		let option = [new vscode.Range(line, char, line, char)];
		editor.setDecorations(this.charDecorationType, option);
	}

	removeCommandIndicator = (editor: vscode.TextEditor) => {
		let locations: vscode.Range[] = [];
		vscode.window.activeTextEditor.setDecorations(this.charDecorationType, locations);
	}

	addDecorations = (editor: vscode.TextEditor, decorationModel: DecorationModel[]) => {
		let decorationType = this.createTextEditorDecorationType(1);
		let decorationType2 = this.createTextEditorDecorationType(2);

		let options = [];
		let options2 = [];
		decorationModel.forEach((model) => {
			let code = model.code;
			let len = code.length;

			let option: any;
			if (len === 1) {
				option = this.createDecorationOptions(null, model.line, model.character + 1, model.character + 1, code);
				options.push(option);
			}
			else {
				option = this.createDecorationOptions(null, model.line, model.character + 1, model.character + len, code);
				options2.push(option);
			}
		});

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
				margin: `0 0 0 ${charsToOffset * (-this.config.decoration.width)}px`,
				height: `${this.config.decoration.height}px`,
				width: `${charsToOffset * this.config.decoration.width}px`
			}
		});
		this.decorations[charsToOffset] = decorationType;
		return decorationType;
	}

	private createDecorationOptions = (context: vscode.ExtensionContext, line: number, startCharacter: number, endCharacter: number, code: string): vscode.DecorationOptions => {
		const renderOptions = this.getAfterRenderOptions(code);
		return {
			range: new vscode.Range(line, startCharacter, line, endCharacter),
			renderOptions: {
				dark: {
					after: renderOptions,
				},
				light: {
					after: renderOptions,
				},
			}
		};
	}

	private getAfterRenderOptions = (code: string) => {
		if (this.cache[code] !== undefined)
			return this.cache[code];
		this.cache[code] = this.buildAfterRenderOptions(code);
		return this.cache[code];
	}

	private updateCache = () => {
		this.cache = {};
		this.config.jumper.characters
			.forEach(code => this.cache[code] = this.buildAfterRenderOptions(code))
	}

	private buildAfterRenderOptions = (code: string) => {
		return this.config.decoration.useTextBasedDecorations
			? this.buildAfterRenderOptionsText(code)
			: this.buildAfterRenderOptionsSvg(code)
			;
	}

	private buildAfterRenderOptionsText = (code: string) => {
		let cf = this.config.decoration;
		let key = cf.upperCase ? code.toUpperCase() : code.toLowerCase();

		const knownColors = {
			chartreuse: `rgba(127,255,0,${cf.bgOpacity})`,
			yellow: `rgba(255,255,0,${cf.bgOpacity})`,
		};

		let colors = cf.bgColor.split(',');
		let bgColor = colors[(code.length - 1) % colors.length];
		bgColor = knownColors[bgColor] || bgColor;

		return {
			contentText: key,
			backgroundColor: bgColor,
			fontWeight: cf.fontWeight,
			color: cf.color,
		};
	}

	private buildAfterRenderOptionsSvg = (code: string) => {
		let cf = this.config.decoration;
		let key = this.config.decoration.upperCase ? code.toUpperCase() : code.toLowerCase();
		let width = code.length * cf.width;
		let colors = cf.bgColor.split(',');
		let bgColor = colors[(code.length - 1) % colors.length];
		let svg =
			`data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${cf.height}" height="${cf.height}" width="${width}"><rect width="${width}" height="${cf.height}" rx="2" ry="3" style="fill: ${bgColor};fill-opacity:${cf.bgOpacity};stroke:${cf.borderColor};stroke-opacity:${cf.bgOpacity};"/><text font-family="${cf.fontFamily}" font-weight="${cf.fontWeight}" font-size="${cf.fontSize}px" style="fill:${cf.color}" x="${cf.x}" y="${cf.y}">${key}</text></svg>`;
		return {
			contentIconPath: vscode.Uri.parse(svg)
		};
	}

}
