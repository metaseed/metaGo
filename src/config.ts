export class Config {
    placeholder: PlaceHolderConfig = new PlaceHolderConfig();
    finder: FinderConfig = new FinderConfig();
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
    characters: string[] = ["k", "j", "d", "f", "l", "s", "a", "h", "g", "i", "o", "n", "u", "r", "v", "c", "w", "e", "x", "m", "b", "p", "q", "t", "y", "z"];
    pattern: string = "[ ,-.{_(\"'<\\/[+]";
    range: number = 40;
}