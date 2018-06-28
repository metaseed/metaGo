import {
    window,
    commands,
    ExtensionContext,
    Position,
    Range,
    TextDocument,
    TextLine,
    TextEditorEdit,
    TextEdit,
    Selection,
    workspace
} from 'vscode';

export class SoftDelete {
    constructor(context: ExtensionContext) {
        // The command has been defined in the package.json file
        // Now provide the implementation of the command with  registerCommand
        // The commandId parameter must match the command field in package.json
        const disposable = commands.registerCommand('metaGo.delete.softDelete', this.softDelete);

        context.subscriptions.push(disposable);
    }
    softDelete() {
        const editor = window.activeTextEditor;
        const doc = editor.document;
        const start = editor.selections[0].start;
        let lines = [];

        if (start.line === 0 && start.character === 0) {
            return false;
        }

        for (let i = 0; i < editor.selections.length; i++) {
            const selection = editor.selections[i];
            if (selection.start.character === 0) {
                lines.push(
                    {
                        startLine: selection.start.line,
                        startCharacter: selection.start.character,
                        endLine: selection.start.line - 1,
                        endCharacter: 999999999
                    }
                );
            } else {
                lines.push(
                    {
                        startLine: selection.start.line,
                        startCharacter: selection.start.character,
                        endLine: selection.start.line,
                        endCharacter: 0
                    }
                );
            }
        }

        return editor.edit(editorBuilder => {
            let range;

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                range = new Range(
                    line.startLine,
                    line.startCharacter,
                    line.endLine,
                    line.endCharacter
                );

                editorBuilder.delete(range);
            }
        });
    }
}
