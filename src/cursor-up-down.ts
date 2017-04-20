// import * as vscode from 'vscode';

// export class CursorUpDown {
//     constructor(context: vscode.ExtensionContext) {
//         let disposable = vscode.commands.registerCommand('metaGo.cursorUp', () => {
//             const editor = vscode.window.activeTextEditor;
//             const lineN = editor.selection.active.line;
//             let line = editor.document.lineAt(lineN);
//             line.text
//             const selection = editor.selection;
//             let anchor = Utilities.anchorPosition(selection);
//             if (selection.isEmpty)
//                 anchor = new vscode.Position(anchor.line + 1, 0);
//             const toLine = line >= 0 ? line : 0;
//             editor.selection = new vscode.Selection(
//                 anchor,
//                 new vscode.Position(toLine, 0));
//             editor.revealRange(new vscode.Range(editor.selection.start, editor.selection.end));

//         });

//         context.subscriptions.push(disposable);
//     }
// }