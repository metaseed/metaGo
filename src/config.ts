import * as vscode from "vscode";
import { BookmarkConfig } from './bookmark/config';

export class Config {
	decoration: DecoratorConfig = new DecoratorConfig();
	jumper: FinderConfig = new FinderConfig();
	bookmark = new BookmarkConfig();

	loadConfig = () => {
		try {
			this.bookmark.loadConfig();
			let config = vscode.workspace.getConfiguration("metaGo");

			this.decoration.useTextBasedDecorations = config.get<boolean>("decoration.useTextBasedDecorations", this.decoration.useTextBasedDecorations);

			this.decoration.bgColor = config.get<string>("decoration.backgroundColor", this.decoration.bgColor);
			this.decoration.bgOpacity = config.get<string>("decoration.backgroundOpacity", this.decoration.bgOpacity);

			this.decoration.color = config.get<string>("decoration.color", this.decoration.color);
			this.decoration.borderColor = config.get<string>("decoration.borderColor", this.decoration.borderColor);
			this.decoration.borderColor = config.get<string>("decoration.matchBackground", this.decoration.matchBackground);

			this.decoration.width = config.get<number>("decoration.width", this.decoration.width);
			this.decoration.height = config.get<number>("decoration.height", this.decoration.height);

			this.decoration.x = config.get<number>("decoration.x", this.decoration.x);
			this.decoration.y = config.get<number>("decoration.y", this.decoration.y);

			this.decoration.fontSize = config.get<number>("decoration.fontSize", this.decoration.fontSize);
			this.decoration.fontWeight = config.get<string>("decoration.fontWeight", this.decoration.fontWeight);
			this.decoration.fontFamily = config.get<string>("decoration.fontFamily", this.decoration.fontFamily);

			this.jumper.characters = config.get<string>("decoration.characters", "k, j, d, f, l, s, a, h, g, i, o, n, u, r, v, c, w, e, x, m, b, p, q, t, y, z").split(/[\s,]+/);
			this.jumper.additionalSingleCharCodeCharacters = config.get<string>("decoration.additionalSingleCharCodeCharacters", "J,D,F,L,A,H,G,I,N,R,E,M,B,Q,T,Y").split(/[\s,]+/);
			this.decoration.hide.trigerKey = config.get<string>('decoration.hide.trigerKey');
			this.decoration.hide.triggerKeyDownRepeatInitialDelay = config.get<number>('decoration.hide.triggerKeyDownRepeatInitialDelay');
			this.decoration.hide.triggerKeyDownRepeatInterval = config.get<number>('decoration.hide.triggerKeyDownRepeatInterval');

			this.jumper.findAllMode = config.get<string>("jumper.findAllMode", this.jumper.findAllMode);
			this.jumper.findInSelection = config.get<string>("jumper.findInSelection", this.jumper.findInSelection);
			this.jumper.wordSeparatorPattern = config.get<string>("jumper.wordSeparatorPattern", this.jumper.wordSeparatorPattern);
			let timeout = config.get<number>("jumper.timeout", this.jumper.timeout);
			this.jumper.timeout = isNaN(timeout) ? 12000 : timeout * 1000;
		}
		catch (e) {
			vscode.window.showErrorMessage('metaGo: please double check your metaGo config->' + e);
		}
	}

}

class DecoratorHide {
	trigerKey: string='/';
	triggerKeyDownRepeatInitialDelay: number=550;
	triggerKeyDownRepeatInterval:number=60;
}

class DecoratorConfig {
	useTextBasedDecorations: boolean = false;

	bgOpacity: string = '0.88';
	bgColor: string = "lime,yellow";
	color: string = "black";
	borderColor: string = "black";

	width: number = 12;
	height: number = 14;

	x: number = 2;
	y: number = 12;

	fontSize: number = 14;
	matchBackground = "editor.wordHighlightBackground";
	fontWeight: string = "normal";
	fontFamily: string = "Consolas";
	hide = new DecoratorHide();

}

class FinderConfig {
	characters: string[];
	additionalSingleCharCodeCharacters: string[];
	findAllMode: string = 'on';
	findInSelection: string = 'off';
	wordSeparatorPattern: string = "[ ,-.{_(\"'<\\/[+]";
	timeout: number = 12000;
}
