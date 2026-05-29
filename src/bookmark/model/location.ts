import * as vscode from "vscode";
import { Document } from "./document";
import { Bookmark } from './bookmark';

export enum JumpDirection { FORWARD, BACKWARD };

export class BookmarkLocation {
    public static NO_BOOKMARKS = new BookmarkLocation(null, new Bookmark(-1, 0));

    constructor(public document: Document, public bookmark: Bookmark) { }
}
