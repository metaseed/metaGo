import * as vscode from "vscode";
import {Selection} from "./selection";
import {LineSelection} from './select-lines';

export class MetaSelection {
    private selection: Selection;
    private lineSelection: LineSelection;

    constructor(context: vscode.ExtensionContext){
        this.selection = new Selection(context);
        this.lineSelection = new LineSelection(context);
    }
}