import * as vscode from 'vscode';
import { DecorationModel } from './decoration-model';
import { Config } from '../config';
import { Colors } from '../lib/color-name';

export type Decorations = [vscode.TextEditorDecorationType, vscode.DecorationOptions[]][];

export class Decorator {
	private config: Config;
	private renderOptionsCache: { [index: string]: vscode.ThemableDecorationAttachmentRenderOptions };
	private decorationTypeCache: { [chars: number]: vscode.TextEditorDecorationType } = {};
	public commandIndicatorDecorationType;

	initialize = (config: Config) => {
		this.config = config;
		this.updateCache();
		this.commandIndicatorDecorationType = vscode.window.createTextEditorDecorationType({
			backgroundColor: 'rgba(255,255,0,0.4)',
			borderWidth: '2px',
			borderStyle: 'solid',
			light: {
				borderColor: 'rgba(255,255,0,0.8)'
			},
			dark: {
				borderColor: 'rgba(255,255,0,0.4)'
			}
		});
	}

	addCommandIndicator = (editor: vscode.TextEditor) => {
		let line = editor.selection.anchor.line;
		let char = editor.selection.anchor.character;
		let option = [new vscode.Range(line, char, line, char)];
		editor.setDecorations(this.commandIndicatorDecorationType, option);
	}

	removeCommandIndicator = (editor: vscode.TextEditor) => {
		let locations: vscode.Range[] = [];
		vscode.window.activeTextEditor.setDecorations(this.commandIndicatorDecorationType, locations);
	}

	createAll(editorToModelMap: Map<vscode.TextEditor, DecorationModel[]>, targetChars: string): Map<vscode.TextEditor, Decorations> {
		let editorToDecorationsMap = new Map<vscode.TextEditor, Decorations>();
		editorToModelMap.forEach((model, editor) => {
			var decorations = this.create(editor, model, targetChars);
			editorToDecorationsMap.set(editor, decorations);
		})
		return editorToDecorationsMap;
	}

	create = (editor: vscode.TextEditor, decorationModel: DecorationModel[], targetChars: string): Decorations => {
		let decorations: Decorations = [];
		decorationModel.forEach(model => {
			let code = model.code;
			let len = code.length;
			let charIndex = model.char;
			if (targetChars[0] === '\n') len = 0;
			else {
				// no enough space to display the decorator codes
				if (charIndex + 1 < len) {
					len = charIndex + 1;
					code = code.substring(0, len)
				}
			}
			if (!decorations[len]) {
				let decorationType = this.createTextEditorDecorationType(len);
				decorations[len] = [decorationType, []];
			}
			let option = this.createDecorationOptions(model.line, charIndex + 1/*len: codeToDecoratorLeftAlign; 1: rightAlign */,charIndex + 1, code);
			decorations[len][1].push(option);
		})

		decorations.forEach(([type, option]) => editor.setDecorations(type, option));
		return decorations.filter(e => e);
	}

	hideAll(editorToModelMap: Map<vscode.TextEditor, Decorations>) {
		editorToModelMap.forEach((model, editor) => this.hide(editor, model));
	}

	hide = (editor: vscode.TextEditor, decorations: Decorations) => {
		for (var dec of decorations) {
			editor.setDecorations(dec[0], []);
		}
	}

	showAll(editorToModelMap: Map<vscode.TextEditor, Decorations>) {
		editorToModelMap.forEach((model, editor) => this.show(editor, model));
	}

	show = (editor: vscode.TextEditor, decorations: Decorations) => {
		for (var dec of decorations) {
			editor.setDecorations(dec[0], dec[1]);
		}
	}

	removeAll(editorToModelMap: Map<vscode.TextEditor, Decorations>) {
		editorToModelMap.forEach((_, editor) => this.remove(editor));
	}

	remove = (editor: vscode.TextEditor) => {
		for (var codeLen in this.decorationTypeCache) {
			if (this.decorationTypeCache[codeLen] === null) continue;
			editor.setDecorations(this.decorationTypeCache[codeLen], []);
			this.decorationTypeCache[codeLen].dispose();
			this.decorationTypeCache[codeLen] = null;
		}
	}

	private createTextEditorDecorationType = (len: number) => {
		let decorationType = this.decorationTypeCache[len];
		if (decorationType) return decorationType;
		let cf = this.config.decoration;
		decorationType = vscode.window.createTextEditorDecorationType({
			after: {
				margin: `0 0 0 ${len * (-cf.width)}px`
			}
		});
		this.decorationTypeCache[len] = decorationType;
		return decorationType;
	}

	private createDecorationOptions = ( line: number, decoratorPositionStart: number,decoratorPositionEnd: number, code: string): vscode.DecorationOptions => {
		const renderOptions = this.getAfterRenderOptions(code);
		return {
			range: new vscode.Range(line, decoratorPositionStart, line, decoratorPositionEnd),
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
		if (this.renderOptionsCache[code] !== undefined)
			return this.renderOptionsCache[code];
		this.renderOptionsCache[code] = this.buildAfterRenderOptions(code);
		return this.renderOptionsCache[code];
	}

	private updateCache = () => {
		this.renderOptionsCache = {};
		this.config.jumper.characters
			.forEach(code => this.renderOptionsCache[code] = this.buildAfterRenderOptions(code))
	}

	private buildAfterRenderOptions = (code: string) => {
		return this.config.decoration.useTextBasedDecorations
			? this.buildAfterRenderOptionsText(code)
			: this.buildAfterRenderOptionsSvg(code)
			;
	}

	private buildAfterRenderOptionsText = (code: string) => {
		let cf = this.config.decoration;
		let key = code;
		let colors = cf.bgColor.split(',');
		let bgColor = colors[(code.length - 1) % colors.length];
		let c = Colors[bgColor];
		bgColor = c ? `rgba(${c[0]},${c[1]},${c[2]},${cf.bgOpacity})` : bgColor;
		let width = code.length * cf.width;
		return {
			contentText: key,
			backgroundColor: bgColor,
			fontWeight: cf.fontWeight,
			color: cf.color,
			width: `${width}px`, //fix hori flash
			//border:`1px solid ${cf.borderColor}`// cause vertical flash 1px
		};
	}

	private svgStyleColor(color: string) {
		if (color.startsWith('#')) {
			let r = parseInt(color.substring(1, 2), 16);
			let g = parseInt(color.substring(3, 5), 16);
			let b = parseInt(color.substring(5, 7), 16);
			return `rgb(${r},${g},${b})`
		}
		return color;
	}

	private buildAfterRenderOptionsSvg = (code: string) => {
		let cf = this.config.decoration;
		let key = code;
		let width = code.length * cf.width;
		let colors = cf.bgColor.split(',');
		let ftColor = cf.color;
		ftColor = this.svgStyleColor(ftColor)
		let bgColor = colors[(code.length - 1) % colors.length];
		bgColor = this.svgStyleColor(bgColor);
		let borderColor = this.svgStyleColor(cf.borderColor);

		let svg =
			`data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${cf.height}" height="${cf.height}" width="${width}"><rect width="${width}" height="${cf.height}" rx="2" ry="2" style="fill:${bgColor};fill-opacity:${cf.bgOpacity};stroke:${borderColor};stroke-opacity:${cf.bgOpacity};"/><text font-family="${cf.fontFamily}" font-weight="${cf.fontWeight}" font-size="${cf.fontSize}px" style="fill:${ftColor}" x="${cf.x}" y="${cf.y}">${key}</text></svg>`;
		return {
			contentIconPath: vscode.Uri.parse(svg)
		};
	}

}
