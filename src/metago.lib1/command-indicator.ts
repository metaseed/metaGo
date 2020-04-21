import * as vscode from 'vscode';
import { color} from './color';

export enum CommandMode {Jump, Selection, AddCursor}

export class CommandIndicator {

    private commandIndicatorDecorationType;

    private getCommandIndicatorType(colorStr:string,) {
        return vscode.window.createTextEditorDecorationType({
            backgroundColor: color(colorStr),
            borderWidth: '3px',
            borderStyle: 'solid',
            light: {
                borderColor: color(colorStr)
            },
            dark: {
                borderColor: color(colorStr)
            }
        });
    }


    addCommandIndicator = (editor: vscode.TextEditor, commandMode: CommandMode) => {
        const selection = editor.selections[editor.selections.length - 1];
        let line = selection.anchor.line;
        let char = selection.anchor.character;
        let option = [new vscode.Range(line, char, line, char)];
            switch (commandMode) {
                case CommandMode.Jump:
                    this.commandIndicatorDecorationType = this.getCommandIndicatorType('rgba(255,255,0,0.4)'); 
                    break;
                
                case CommandMode.Selection:
                    this.commandIndicatorDecorationType = this.getCommandIndicatorType('editorBracketMatch.border'); 
                    break;

                case CommandMode.AddCursor:
                    this.commandIndicatorDecorationType = this.getCommandIndicatorType('#3344F0A0'); 
                    break;
            
                default:
                    break;
            }
            editor.setDecorations(this.commandIndicatorDecorationType, option);
    }

    removeCommandIndicator = (editor: vscode.TextEditor) => {
        let locations: vscode.Range[] = [];
        vscode.window.activeTextEditor.setDecorations(this.commandIndicatorDecorationType, locations);
    }
}
