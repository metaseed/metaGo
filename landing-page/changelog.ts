import { ChangeLogItem, ChangeLogKind } from "./contentProvider";
export const changeLog: ChangeLogItem[] = [
  { kind: ChangeLogKind.ADDED,   message: `metaJump: ripple support, type location-chars to triger far from center: one char current paragraph(seperated by empty lines); two chars current doc; three chars all opened editors; for one and two target chars, one char decorators will pass through boundaries if possible(i.e. for one target char, no two chars decorators are needed for all candidates in the current paragraph)`},
  { kind: ChangeLogKind.ADDED,   message: `metaJump: target chars is only used for narrow down searching range, not for navagition. solve the problem of typing muti target chars together may edit document by mistake`},
  { kind: ChangeLogKind.ADDED,   message: `metaGo: what's new page to show when major and minor upgrade`},
  { kind: ChangeLogKind.CHANGED,   message: `bookmark: one bookmark in one line, toggle-bookmark command works when cursor not at char location. char location is still used when goto the bookmark.`},
  { kind: ChangeLogKind.FIXED,   message: `bookmark: type in popup box, would jump automaticly, may edit when type fast. should only do filter!`},
  { kind: ChangeLogKind.FIXED,   message: `metaJump: contributed command: metaGo.Cancel doesn't exist.`},
];
