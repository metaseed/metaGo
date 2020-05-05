import * as vscode from 'vscode';
import { Input } from '../metajump/input';
import { Config } from '../config';
import { CommandIndicator, CommandMode } from '../metago.lib';

class SeparatorPair {
    public counter = 0;
    public startRegex: RegExp = null;
    public endRegex: RegExp = null;
    constructor(public start: string, public end: string, public matchChar = '') {
        if (start.length > 2 && start[0] === '/' && '/' === start[start.length - 1]) {
            this.startRegex = new RegExp(this.start.substring(1, this.start.length - 1), 'g');
        } else {
            this.startRegex = new RegExp(this.escapeRegExp(start), 'g');
        }
        if (end.length > 2 && end[0] === '/' && '/' === end[end.length - 1]) {
            this.endRegex = new RegExp(this.end.substring(1, this.end.length - 1), 'g');
        } else {
            this.endRegex = new RegExp(this.escapeRegExp(this.end), 'g');
        }
    }

    escapeRegExp(string) {
        return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
    }
}

enum Mode { InPair, WithPair, ChangePair }

export class SurroundingPairSelection {
    private separatorPairs = [new SeparatorPair('[', ']'), new SeparatorPair('{', '}'), new SeparatorPair('(', ')'), new SeparatorPair('<', '>'), new SeparatorPair('>', '<'), new SeparatorPair('/<(?!/)(?!br)([^!]+?)(?<!/)>/', '/<\/(.+?)>/', 't')];
    private commandIndicator = new CommandIndicator();

    private getPair(matchChar: string) {
        for (const pair of this.separatorPairs) {
            if (pair.matchChar === matchChar) return pair;
            if (pair.start === matchChar) return pair;
        }
        return new SeparatorPair(matchChar, matchChar);
    }

    private clearPairsCounter() {
        for (const pair of this.separatorPairs) {
            pair.counter = 0;
        }
    }

    constructor(context: vscode.ExtensionContext, config: Config) {
        this.separatorPairs = config.surroundPairs.map(a => new SeparatorPair(a[0], a[1], a[2])) ?? this.separatorPairs;
        context.subscriptions.push(
            vscode.commands.registerTextEditorCommand('metaGo.inSurroundingPairSelection',
                async (editor, edit) => await this.select(config, editor)));
        context.subscriptions.push(
            vscode.commands.registerTextEditorCommand('metaGo.changeSurroundingPair',
                async (editor, edit) => await this.select(config, editor, Mode.ChangePair)));
        context.subscriptions.push(
            vscode.commands.registerTextEditorCommand('metaGo.inSurroundingPairSelectionWithPairs',
                async (editor, edit) => await this.select(config, editor, Mode.WithPair)));
    }

    private inputTimeoutId = null;
    private cancelInput() {
        while (Input.instances.length > 0) {
            Input.instances[0].cancelInput();
        }
    }

    private async input(config: Config, editor: vscode.TextEditor) {
        this.inputTimeoutId = setTimeout(() => { this.inputTimeoutId = null; this.cancelInput(); }, config.jumper.timeout);
        try {
            const matchChar = await new Input(config).input(editor, v => v);
            return matchChar;
        } catch (reason) {
            if (!reason) reason = new Error("Canceled!");
            vscode.window.setStatusBarMessage(`metaGo: ${reason}`, 6000);
            return null;
        }
    }

    private async select(config: Config, editor: vscode.TextEditor, mode = Mode.InPair) {
        const status = vscode.window.setStatusBarMessage(`metaGo.surroundingPairs: please input the pair-start to find...`);
        try {
            this.commandIndicator.addCommandIndicator(editor, CommandMode.Selection);

            let { selections, document } = editor;
            selections = editor.selections.slice(0, editor.selections.length - 1);
            const currentSelection = editor.selections[editor.selections.length - 1];
            /// adjust start/end
            let start = currentSelection.start;
            let line = start.line;
            const startLineText = document.lineAt(line).text;
            let end = currentSelection.end;
            const endLineText = document.lineAt(end.line).text;
            const matchChar = await this.input(config, editor);
            if (matchChar === null) return;

            var pair = this.getPair(matchChar);
            const startLineMatch = startLineText.matchAll(pair.startRegex);
            const endLineMatch = endLineText.matchAll(pair.endRegex);
            // if start position inside start pattern
            for (const m of startLineMatch) {
                if (m.index < start.character && start.character < m.index + m[0].length) {
                    start = new vscode.Position(line, m.index + m[0].length);
                    if (end.character < start.character) end = new vscode.Position(line, start.character);
                    if (mode === Mode.InPair)
                        mode = Mode.WithPair;
                    break;
                }
            }
            // if end position inside end position
            for (const m of endLineMatch) {
                if (m.index < end.character && end.character < m.index + m[0].length) {
                    end = new vscode.Position(line, m.index);
                    if (end.character < start.character) start = new vscode.Position(line, end.character);
                    if (mode === Mode.InPair)

                        mode = Mode.WithPair;
                    break;
                }
            }
            //// find startPosition
            this.clearPairsCounter();
            let text = startLineText.substring(0, start.character);
            let startPosition: vscode.Position = null;
            let startEndPosition: vscode.Position = null;
            let endText = endLineText.substring(end.character);

            let endPlus = 0
            /// to trigger further selection: if cursor just selected the content of pairs, we do further content selection.
            if (mode == Mode.InPair) {
                const startMatch = [...text.matchAll(pair.startRegex)];
                const endMatch = [...endText.matchAll(pair.endRegex)];

                if (startMatch.length > 0 && endMatch.length > 0) {

                    if (startMatch[startMatch.length - 1][0].length + startMatch[startMatch.length - 1].index === text.length && endMatch[0].index === 0) {
                        text = text.substring(0, startMatch[startMatch.length - 1].index);
                        endText = endText.substring(endMatch[0][0].length);
                        endPlus = endMatch[0][0].length;
                    }
                }
            }

            do {
                const endMatch = [...text.matchAll(pair.endRegex)];
                const startMatch = [...text.matchAll(pair.startRegex)];

                let startIndex = startMatch.length - 1;
                let endIndex = endMatch.length - 1;
                while (startIndex >= 0 || endIndex >= 0) {
                    if (startIndex >= 0 && (endIndex < 0 || startMatch[startIndex].index >= endMatch[endIndex].index)) {
                        if (pair.counter <= 0) {
                            const match = startMatch[startIndex];
                            const i = match.index;
                            const m = match[0];
                            const m1 = match[1]; // group in pair. h1 in <h1>
                            let firstGroupIndex = 0;
                            let startPairEnd = i + m.length;
                            if (m1) {
                                firstGroupIndex = m.indexOf(m1);
                                startPairEnd = i + firstGroupIndex + m1.length;
                            }
                            let charIndex = mode === Mode.WithPair ?
                                i :
                                mode === Mode.InPair ?
                                    i + m.length :
                                    i + firstGroupIndex;
                            startPosition = new vscode.Position(line, charIndex);
                            if (mode === Mode.ChangePair) {
                                startEndPosition = new vscode.Position(line, startPairEnd);
                            }
                            break;
                        } else {
                            pair.counter--;
                            startIndex--;
                        }
                    } else {
                        pair.counter++;
                        endIndex--;
                    }
                }
                if (startPosition !== null) break;

                if (--line >= 0) {
                    text = document.lineAt(line).text;
                }

            } while (line >= 0);

            if (startPosition === null) {
                vscode.window.setStatusBarMessage(`metaGo.surroundingPairs: can not find pair-start '${pair.start}'`, 6000);
                return
            }
            //// find endPosition
            this.clearPairsCounter();

            let endPosition: vscode.Position = null;
            let endEndPosition: vscode.Position = null;
            line = end.line;
            const lines = document.lineCount;
            text = endText;

            do {
                const endMatch = [...text.matchAll(pair.endRegex)];
                const startMatch = [...text.matchAll(pair.startRegex)];

                let startIndex = 0;
                let endIndex = 0;
                while (startIndex < startMatch.length || endIndex < endMatch.length) {
                    if (endIndex < endMatch.length && (startIndex >= startMatch.length || endMatch[endIndex].index <= startMatch[startIndex].index)) {
                        if (pair.counter <= 0) {
                            const i = endMatch[endIndex].index;
                            const m = endMatch[endIndex][0];
                            const m1 = endMatch[endIndex][1];
                            let firstGroupIndex = 0;
                            let charIndex = line === end.line ? end.character + endPlus + i : i;
                            let endPairEnd = charIndex + m.length;
                            if (m1) {
                                firstGroupIndex = m.indexOf(m1);
                                endPairEnd = charIndex + firstGroupIndex + m1.length;
                            }
                            charIndex = mode === Mode.WithPair ?
                                charIndex + m.length :
                                mode === Mode.InPair ?
                                    charIndex :
                                    charIndex + firstGroupIndex;
                            endPosition = new vscode.Position(line, charIndex);
                            if (mode === Mode.ChangePair) {
                                endEndPosition = new vscode.Position(line, endPairEnd);
                            }
                            break;
                        } else {
                            pair.counter--;
                            endIndex++;
                        }
                    } else {
                        pair.counter++;
                        startIndex++;
                    }
                }

                if (endPosition !== null) break

                if (++line < lines) {
                    text = document.lineAt(line).text;
                }

            } while (line < lines);

            if (endPosition === null) {
                vscode.window.setStatusBarMessage(`metaGo.SurroundingPairs: can not find pair-end '${pair.end}'`);
                return;
            }

            // extend selection
            if (mode === Mode.ChangePair) {
                const start = new vscode.Selection(startPosition, startEndPosition);
                const end = new vscode.Selection(endPosition, endEndPosition)
                editor.selections = [...selections, end, start];
                var pair = this.separatorPairs.find(p => p.start === matchChar);
                if (pair) {
                    vscode.window.setStatusBarMessage(`metaGo.surroundingPairs: input the new start-pair...`);
                    const matchChar = await this.input(config, editor);
                    if (matchChar === null) {
                        return;
                    }
                    var pair = this.separatorPairs.find(p => p.start === matchChar);
                    if (!pair) pair = new SeparatorPair(matchChar, matchChar);
                    await editor.edit(builder => {
                        builder.replace(start, pair.start);
                        builder.replace(end, pair.end);
                    });

                    editor.selections = [...selections, currentSelection];

                }
            }
            else {
                editor.selections = [...selections, new vscode.Selection(startPosition, endPosition)];
                vscode.window.setStatusBarMessage(`metaGo.surroundingPairs: Selected via pair '${pair.start}' and '${pair.end}'`, 3000)
            }

            const range = (<vscode.Range[]>editor.selections).reduce((a, c) => a.union(c))
            editor.revealRange(range);

        } catch (e) {
            vscode.window.setStatusBarMessage(`metaGo.surroundingPairs exception: ${e}`, 6000)
        } finally {
            if (this.inputTimeoutId) {
                clearTimeout(this.inputTimeoutId);
                this.inputTimeoutId = null;
            }
            this.commandIndicator.removeCommandIndicator(editor);
            status.dispose();
        }
    }
}