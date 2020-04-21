import { ChangeLogItem, ChangeLogKind } from "./contentProvider";
export const changeLog: ChangeLogItem[] = [
  { kind: ChangeLogKind.ADDED,   message: `selection: command to switch selection's active with anchor.`},
  { kind: ChangeLogKind.ADDED,   message: `metaJump: commands to add additional cursor via screen decorators.(metaGo.insertCursorBefore, metaGo.insertCursorAfter, metaGo.insertCurosrSmart)`},
  { kind: ChangeLogKind.ADDED,   message: `lineSelection: muti cursor support, extend/shrink lines for last active cursor.`},
  { kind: ChangeLogKind.ADDED,   message: `metaJump: selection support muti cursor, could add more selection parts to current selections`},
  { kind: ChangeLogKind.ADDED,   message: `metaJump: show typed target chars in status bar.`},
  { kind: ChangeLogKind.ADDED,   message: `metaJump: adding cursor command reused to change active selection if cursor is added to a selection already exist.`},
  { kind: ChangeLogKind.ADDED,   message: `metaJump: forground decorator color for one char decorator.`},
  { kind: ChangeLogKind.ADDED,   message: `metaJump: different command indication colors for jump, selection and addCursor command`},
  { kind: ChangeLogKind.ADDED,   message: `insideSelection:`},
  { kind: ChangeLogKind.CHANGED,   message: `lineSelection: Ctrl+l to select current line or extend selection by one line below. Ctrl+o to extend selection by one line above.`},
  { kind: ChangeLogKind.CHANGED,   message: `metaJump: add cursor does decorators encoding from last cursor position. originally always use the first cursor position`},
  { kind: ChangeLogKind.CHANGED,   message: `metaJump: command indicator is shown at last cursor position when has muti cursor. i.e. when triggering 'add cursor' command.`},
  { kind: ChangeLogKind.FIXED,   message: `metaJump: undefined property ref exception, when cursor below the last location target candidate;`},
  { kind: ChangeLogKind.FIXED,   message: `selectLines: could select to first and last line`},
];
