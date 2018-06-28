import {
    window,
    commands,
    ExtensionContext,
    Position,
    Range,
    TextDocument,
    TextLine,
    Selection,
    workspace
} from 'vscode';

/**
 * Extension Method https://marketplace.visualstudio.com/items?itemName=jasonlhy.hungry-delete
 */
declare global {
    interface String {
        /**
         * Takes a predicate and returns the index of the first rightest char in the string satisfying the predicate,
         * or -1 if there is no such char.
         *
         * @param {number} columnNumber the column index starts testing
         * @param {(theChar: string) => Boolean} predicate to test the char
         * @returns {number} -1 if there is no such char
         *
         * @memberOf String
         */
        findLastIndex(predicate: (theChar: string) => Boolean, columnNumber?: number, ): number;
    }
}

String.prototype.findLastIndex = function (predicate: (theChar: string) => Boolean, columnNumber?: number) {
    if (typeof columnNumber === 'undefined') {
        columnNumber = this.length;
    }

    for (let i = columnNumber; i >= 0; i--) {
        if (predicate(this[i])) {
            return i;
        }
    }

    return -1;
}

export class SmartDelete {
    constructor(context: ExtensionContext) {
        const disposableHungry = commands.registerCommand('metaGo.delete.hungryDelete', this.hungryDelete);
        const disposableSmart = commands.registerCommand('metaGo.delete.smartBackspace', this.smartBackspace);

        context.subscriptions.push(disposableHungry);
        context.subscriptions.push(disposableSmart);
    }

    private coupleCharacter = [
        "()",
        "[]",
        "<>",
        "{}",
        "''",
        "``",
        '""',
    ];

    private config = {};

    setConfig(newConfig: {}) {
        if (newConfig && Object.keys(newConfig)) {
            Object.assign(this.config, newConfig);
        }
    }

    getKeepOneSpaceSetting(): boolean {
        if (!this.config["debug"]) {
            this.config['hungryDelete.keepOneSpace'] = workspace.getConfiguration().get('hungryDelete.keepOneSpace');
        }

        return this.config['hungryDelete.keepOneSpace'];
    }


    backtraceAboveLine(doc: TextDocument, cursorLineNumber: number): Position {
        // backtrace the first non-empty character position
        let backtraceLineNumber = cursorLineNumber - 1;
        let empty = true;
        while (backtraceLineNumber >= 0 && empty) {
            empty = doc.lineAt(backtraceLineNumber).isEmptyOrWhitespace;
            if (empty) {
                backtraceLineNumber--;
            }
        }

        let startPosition;
        if (backtraceLineNumber < 0) {
            startPosition = new Position(0, 0);
        } else {
            const nonEmptyLine = doc.lineAt(backtraceLineNumber);
            startPosition = nonEmptyLine.range.end; // it is the one after the last character (which may be space)!
        }

        return startPosition;
    }


    backtraceInLine(doc: TextDocument, cursorLine: TextLine, cursorPosition: Position): Position {
        const text = cursorLine.text;
        let charIndexBefore = cursorPosition.character - 1;
        let wordRange = doc.getWordRangeAtPosition(cursorPosition);
        let wordRangeBefore = doc.getWordRangeAtPosition(new Position(cursorPosition.line, charIndexBefore));

        // the cursor is at within word, end of word
        // and special case aaa |bbb but not include aaa |EOL
        if (wordRange && wordRangeBefore) {
            return wordRangeBefore.start;
        } else {
            // the cursor is at a whitespace
            let nonEmptyCharIndex = text.findLastIndex(theChar => /\S/.test(theChar), charIndexBefore);
            let offset = charIndexBefore - nonEmptyCharIndex;
            let deleteWhiteSpaceOnly = (offset > 1);

            if (deleteWhiteSpaceOnly) {
                return new Position(cursorPosition.line, nonEmptyCharIndex + 1);
            } else {
                // delete a space with the entire word at left
                // in consistent to the exisiting implementation of "deleteWorldLeft"
                wordRange = doc.getWordRangeAtPosition(new Position(cursorPosition.line, nonEmptyCharIndex));
                if (wordRange) {
                    return wordRange.start;
                } else {
                    // For edge case : If there is Word Seperator, e.g. @ or =  - its word range is undefined
                    // the exisiting implementation of "deleteWorldLeft" is to delete all of them "@@@@@|3333 444" => "333 4444"
                    let separatorChar = text.charAt(nonEmptyCharIndex);
                    const nonSeparatorIndex = text.findLastIndex(theChar => theChar !== separatorChar, nonEmptyCharIndex - 1);
                    const endIdx = (nonSeparatorIndex < 0) ? 0 : (nonSeparatorIndex + 1);

                    return new Position(cursorPosition.line, endIdx);
                }
            }
        }
    }

    private findDeleteRange(doc: TextDocument, selection: Selection): Range {
        if (!selection.isEmpty) {
            return new Range(selection.start, selection.end);
        }

        const cursorPosition = selection.active;
        const cursorLineNumber = cursorPosition.line;
        const cursorLine = doc.lineAt(cursorPosition);

        const hungryDeleteAcrossLine = cursorLine.isEmptyOrWhitespace || (cursorPosition.character <= cursorLine.firstNonWhitespaceCharacterIndex);

        /* Determine the delete range */
        const startPosition = (hungryDeleteAcrossLine)
            ? this.backtraceAboveLine(doc, cursorLineNumber)
            : this.backtraceInLine(doc, cursorLine, cursorPosition);
        const endPosition = cursorPosition;

        return new Range(startPosition, endPosition);
    }

    private hungryDelete(): Thenable<Boolean> {
        /* Edior and doc */
        const editor = window.activeTextEditor;
        const doc = editor.document;
        const deleteRanges = editor.selections.map(selection => this.findDeleteRange(doc, selection));

        // it includs the startPosition but exclude the endPositon
        // This is in one transaction
        const returned = editor.edit(editorBuilder => deleteRanges.forEach(range => editorBuilder.delete(range)));

        // Adjust the viewport
        if (deleteRanges.length <= 1) {
            editor.revealRange(new Range(editor.selection.start, editor.selection.end));
        }
        return returned;
    }


    findSmartBackspaceRange(doc: TextDocument, selection: Selection): Range | [Position, Range] {
        if (!selection.isEmpty) {
            return new Range(selection.start, selection.end);
        }

        const cursorPosition = selection.active;
        const cursorLineNumber = cursorPosition.line;
        const cursorLine = doc.lineAt(cursorPosition);

        let isSmartBackspace = (cursorLineNumber > 0) && (cursorPosition.character <= cursorLine.firstNonWhitespaceCharacterIndex);
        if (isSmartBackspace) {
            let aboveLine = doc.lineAt(cursorLineNumber - 1);
            let aboveRange = aboveLine.range;

            if (aboveLine.isEmptyOrWhitespace) {
                return new Range(aboveRange.start, aboveRange.start.translate(1, 0));
            } else {
                let lastWordPosition = this.backtraceAboveLine(doc, cursorLineNumber);
                let keepOneSpaceSetting = this.getKeepOneSpaceSetting();
                let a = doc.getText(new Range(lastWordPosition.translate(0, -1), lastWordPosition));
                let isKeepOneSpace = keepOneSpaceSetting &&
                    // For better UX ?
                    // Don't add space if current line is empty
                    !cursorLine.isEmptyOrWhitespace &&
                    // Only add space if there is no space
                    /\S/.test(a);
                if (isKeepOneSpace) {
                    return [lastWordPosition, new Range(lastWordPosition, cursorPosition)];
                } else {
                    return new Range(lastWordPosition, cursorPosition);
                }
            }
        } else if (cursorPosition.line == 0 && cursorPosition.character == 0) {
            // edge case, otherwise it will failed
            return new Range(cursorPosition, cursorPosition);
        } else {
            // inline
            let positionBefore = cursorPosition.translate(0, -1);
            let positionAfter = cursorPosition.translate(0, 1);
            let peekBackward = doc.getText(new Range(positionBefore, cursorPosition));
            let peekForward = doc.getText(new Range(cursorPosition, positionAfter));
            let isAutoClosePair = ~this.coupleCharacter.indexOf(peekBackward + peekForward);

            return (isAutoClosePair) ?
                new Range(positionBefore, positionAfter) :
                new Range(positionBefore, cursorPosition) // original backsapce
        }
    }

    public smartBackspace(): Thenable<Boolean> {
        const editor = window.activeTextEditor;
        const doc = editor.document;
        const deleteRanges = editor.selections.map(selection => this.findSmartBackspaceRange(doc, selection));

        const returned = editor.edit(editorBuilder => deleteRanges.forEach(range => {
            if (range instanceof Range) {
                editorBuilder.delete(range)
            } else {
                let position = range[0];
                editorBuilder.insert(position, " ");
                editorBuilder.delete(range[1]);
            }
        }));

        if (deleteRanges.length <= 1) {
            editor.revealRange(new Range(editor.selection.start, editor.selection.end));
        }

        return returned;
    }
}