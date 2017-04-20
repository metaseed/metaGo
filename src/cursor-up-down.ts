// import * as vscode from 'vscode';

// export class CursorUpDown {
//     constructor(context: vscode.ExtensionContext) {
//         let disposable = vscode.commands.registerCommand('metaGo.cursorUp', () => {
//             const editor = vscode.window.activeTextEditor;
//             const lineN = editor.selection.active.line;
//             if (lineN === 0) return;

//             let line = editor.document.lineAt(lineN);
//             if (line.isEmptyOrWhitespace) {
//                 vscode.commands.executeCommand('cursorUp');
//                 return;
//             }
//             let startChar = line.firstNonWhitespaceCharacterIndex;
//             let currentChar = editor.selection.active.character;
//             let executeCommand = false;
//             if (currentChar === startChar) {
//                 executeCommand = true;
//             } else {
//                 let endChar = line.text.length - 1;
//                 while (endChar > 0 && (line.text[endChar] === ' ' || line.text[endChar] === '\t')) {
//                     --endChar;
//                 }
//                 if (currentChar === endChar + 1) {
//                     executeCommand = true;
//                 }
//             }

//             if (!executeCommand) {
//                 vscode.commands.executeCommand('cursorUp');
//                 return;
//             }

//             let lastLine = editor.document.lineAt(lineN - 1);
//             if (currentChar < lastLine.firstNonWhitespaceCharacterIndex)


//         });

//         context.subscriptions.push(disposable);
//     }
// }