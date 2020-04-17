import { ChangeLogItem, ChangeLogKind } from "./contentProvider";
export const changeLog: ChangeLogItem[] = [
  { kind: ChangeLogKind.ADDED,   message: `selection: command to switch selection active with anchor.`},
  { kind: ChangeLogKind.ADDED,   message: `metaJump: commands to add additianal cursor via screen decorators.(metaGo.insertCursorBefore, metaGo.insertCursorAfter, metaGo.insertCurosrSmart)`},
  { kind: ChangeLogKind.ADDED,   message: `lineSelection: muti cursor support.`},
  { kind: ChangeLogKind.CHANGED,   message: `lineSelection: Ctrl+l to select current line or extend selection by one line below. Ctrl+o to extend selection by one line above.`},
];
