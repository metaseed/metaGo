import * as vscode from "vscode";

export class Config {
    placeholder: PlaceHolderConfig = new PlaceHolderConfig();
    finder: FinderConfig = new FinderConfig();

    loadConfig = () => {
        let config = vscode.workspace.getConfiguration("metaGo");

        this.placeholder.backgroundColor = config.get<string>("placeholder.backgroundColor");
        this.placeholder.color = config.get<string>("placeholder.color");
        this.placeholder.border = config.get<string>("placeholder.border");

        this.placeholder.width = config.get<number>("placeholder.width");
        this.placeholder.height = config.get<number>("placeholder.height");

        this.placeholder.x = config.get<number>("placeholder.x");
        this.placeholder.y = config.get<number>("placeholder.y");

        this.placeholder.fontSize = config.get<number>("placeholder.fontSize");
        this.placeholder.fontWeight = config.get<string>("placeholder.fontWeight");
        this.placeholder.fontFamily = config.get<string>("placeholder.fontFamily");
        this.placeholder.upperCase = config.get<boolean>("placeholder.upperCase");

        this.finder.findAllMode = config.get<string>("finder.findAllMode");
        this.finder.wordSeparatorPattern = config.get<string>("finder.wordSeparatorPattern");
        this.finder.range = config.get<number>("finder.range");
    }
}

class PlaceHolderConfig {
    backgroundColor: string = "yellow";
    color: string = "black";
    border: string = "dotted thin black";

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
    wordSeparatorPattern: string = "[ ,-.{_(\"'<\\/[+]";
    range: number = 40;
}