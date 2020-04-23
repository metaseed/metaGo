import { ChangeLogItem, ChangeLogKind } from "./contentProvider";
export const changeLog: ChangeLogItem[] = [
  { kind: ChangeLogKind.ADDED,   message: `metaJump: commands to add additional cursor via screen decorators.(metaGo.insertCursorBefore, metaGo.insertCursorAfter, metaGo.insertCursorSmart) <a href="https://github.com/metaseed/metaGo#add-multiple-cursors-to-the-active-editor">(Detail)</a>`},
  { kind: ChangeLogKind.ADDED,   message: `metaJump: selection support multi cursor, could add more selection parts to current selections.`},
  { kind: ChangeLogKind.ADDED,   message: `metaJump: the addCursor command could be used to change active selection when there are multiple selections.<a href="https://github.com/metaseed/metaGo#change-active-selection-demo">(Detail)</a>`},
  { kind: ChangeLogKind.ADDED,   message: `metaJump: show typed target chars in status bar. <a href="https://github.com/metaseed/metaGo#change-active-selection-demo">(Detail)</a>`},
  { kind: ChangeLogKind.ADDED,   message: `metaJump: different command indication colors for jump, selection and addCursor command.`},
  { kind: ChangeLogKind.ADDED,   message: `metaJump: could config foreground decorator color for both one-char and two-char decorator.`},
  { kind: ChangeLogKind.ADDED,   message: `metaSelection: command to alternate selection's active with anchor. <a href="https://github.com/metaseed/metaGo#lineselection-demo">(Detail)</a>`},
  { kind: ChangeLogKind.ADDED,   message: `lineSelection: multi cursors support, extend/shrink lines for last active cursor. <a href="https://github.com/metaseed/metaGo#lines-selection">(Detail)</a>`},
  { kind: ChangeLogKind.ADDED,   message: `inPairSelection:`},
  { kind: ChangeLogKind.CHANGED,   message: `lineSelection: Ctrl+l to select current line or extend/shrink selection by one line below. Ctrl+o to extend/shrink selection by one line above. <a href="https://github.com/metaseed/metaGo#lineselection-demo">(Detail)</a>`},
  { kind: ChangeLogKind.CHANGED,   message: `metaJump: when have multiple cursors, add cursor does decorators encoding from last cursor position. originally always start from the first cursor position`},
  { kind: ChangeLogKind.CHANGED,   message: `metaJump: command indicator is shown at last cursor position when has multi cursor. i.e. when triggering 'add cursor' command.`},
  { kind: ChangeLogKind.FIXED,   message: `metaJump: undefined property ref exception, when cursor below the last location target candidate;`},
  { kind: ChangeLogKind.FIXED,   message: `selectLines: could select to first and last line of the document.`},
];
