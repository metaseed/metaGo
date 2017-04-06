import * as vscode from "vscode";

export class Config {
    decoration: DecoratorConfig = new DecoratorConfig();
    finder: FinderConfig = new FinderConfig();

    loadConfig = () => {
        let config = vscode.workspace.getConfiguration("metaGo");

        this.decoration.bgColor = config.get<string>("decoration.backgroundColor");
        this.decoration.bgOpacity = config.get<string>("decoration.backgroundOpacity");
        
        this.decoration.color = config.get<string>("decoration.color");
        this.decoration.borderColor = config.get<string>("decoration.borderColor");

        this.decoration.width = config.get<number>("decoration.width");
        this.decoration.height = config.get<number>("decoration.height");

        this.decoration.x = config.get<number>("decoration.x");
        this.decoration.y = config.get<number>("decoration.y");

        this.decoration.fontSize = config.get<number>("decoration.fontSize");
        this.decoration.fontWeight = config.get<string>("decoration.fontWeight");
        this.decoration.fontFamily = config.get<string>("decoration.fontFamily");
        this.decoration.upperCase = config.get<boolean>("decoration.upperCase");

        this.finder.findAllMode = config.get<string>("finder.findAllMode");
        this.finder.findInSelection = config.get<string>("finder.findInSelection");
        this.finder.wordSeparatorPattern = config.get<string>("finder.wordSeparatorPattern");
        this.finder.range = config.get<number>("finder.range");
    }
}

class DecoratorConfig {
    bgOpacity: string = '0.82';
    bgColor: string = "lime,yellow";
    color: string = "black";
    borderColor: string = "black";

    width: number = 12;
    height: number = 14;

    x: number = 2;
    y: number = 12;

    fontSize: number = 14;
    fontWeight: string = "normal";
    fontFamily: string = "Consolas";

    upperCase: boolean = false;
}

class FinderConfig {
    characters: string[] = ["a","b","c","d","e","f","g","h","i","j","k","l"]//["k", "j", "d", "f", "l", "s", "a", "h", "g", "i", "o", "n", "u", "r", "v", "c", "w", "e", "x", "m", "b", "p", "q", "t", "y", "z"];
    findAllMode: string = 'on';
    findInSelection:string = 'off';
    wordSeparatorPattern: string = "[ ,-.{_(\"'<\\/[+]";
    range: number = 40;
}