import * as vscode from 'vscode';
import { Bookmark } from './bookmark';
export class HistoryItem {
    constructor(public docKey: string, public bookmarkKey: string) { }
}
export class History {
    private history: Array<HistoryItem>;
    private index: number;

    public add(docKey: string, bkKey: string): HistoryItem {
        const item = new HistoryItem(docKey, bkKey);
        const len = this.history.length;
        if (len === 0) {
            this.index = 0;
            this.history.push(item);
            return item;
        }
        this.history.splice(this.index++, 0, item);
        return item;
    }

    public remove(docKey: string, bkKey: string): HistoryItem {
        let i = this.history.findIndex((e) => e.docKey === docKey && e.bookmarkKey === bkKey);
        if (i === -1) return null;
        const len = this.history.length;
        if (len !== 1 && this.index >= i && this.index === len - 1) {
            this.index = 0;
        }
        const rm = this.history.splice(i, 1);
        if (this.history.length === 0) this.index = -1;
        return rm[0];
    }

    public removeDoc(docKey: string) {
        this.history = this.history.filter((hi) => hi.docKey !== docKey);
    }

    public clear() {
        this.history.length = 0;
    }
    public replace(docKey: string, bkKey: string, toDocKey: string, toBkKey: string) {
        let i = this.history.findIndex((e) => e.docKey === docKey && e.bookmarkKey === bkKey);
        if (i !== -1) {
            this.history[i].bookmarkKey = toDocKey;
            this.history[i].docKey = toDocKey;
        }
    }

    public next(): HistoryItem {
        const len = this.history.length;
        if (len === 0) return null;

        if (this.index + 1 === len) {
            this.index = 0;
            return this.history[0];
        }

        return this.history[++this.index];
    }

    public previous(): HistoryItem {
        const len = this.history.length;
        if (len === 0) return null;

        if (this.index === 0) {
            this.index = len - 1;
            return this.history[this.index];
        }

        return this.history[--this.index];
    }
}