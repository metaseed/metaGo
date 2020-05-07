import * as vscode from "vscode";
import { SurroundingPairSelection } from "../metaSelect/inPair-selection";
import { Config } from "../config";

export class MetaSurroundingPair {
    private inSurroundingPairSelection: SurroundingPairSelection;

    constructor(context: vscode.ExtensionContext, config: Config){
        this.inSurroundingPairSelection = new SurroundingPairSelection(context, config);
    }
}