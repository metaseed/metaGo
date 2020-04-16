import { ChangeLogItem, ChangeLogKind } from "./contentProvider";
export const changeLog: ChangeLogItem[] = [
  { kind: ChangeLogKind.ADDED,   message: `metaJump: ripple support, type location-chars to triger far from center: one char current paragraph(seperated by empty lines); two chars current doc; three chars all opened editors; for one and two target chars, one char decorators will pass through boundaries if possible(i.e. for one target char, no two chars decorators are needed for all candidates in the current paragraph)`},
  { kind: ChangeLogKind.ADDED,   message: `metaJump: target chars is only used for narrow down searching range, not for navagition. solve the problem of typing muti target chars together may edit document by mistake`},
  { kind: ChangeLogKind.ADDED,   message: `metaGo: what's new page to show when major and minor upgrade`},
  { kind: ChangeLogKind.ADDED,   message: `dev: webpack support bundle third party packates`},
  { kind: ChangeLogKind.ADDED,   message: `dev: add local package generation, uninstall then install npm command`},
  { kind: ChangeLogKind.CHANGED,   message: `bookmark: one bookmark in one line, toggle-bookmark command works when cursor not at char location. char location is still used when goto the bookmark.`},
  { kind: ChangeLogKind.CHANGED,   message: `line selection: metaGo.selectLineUp default shortcut changed from ctrl+shift+l to ctrl+i, to avoid collision with default command of ctrl+shift+l.`},
  { kind: ChangeLogKind.FIXED,   message: `bookmark: type in popup box, would jump automaticly, may edit when type fast. should only do filter!`},
  { kind: ChangeLogKind.FIXED,   message: `bookmark: trigger bookmark.view command event there is no openned editor or no editor has focus.`},
  { kind: ChangeLogKind.FIXED,   message: `metaJump: fix cancel exception: after tigger jump, then press Esc would throw exception.`},
  { kind: ChangeLogKind.FIXED,   message: `metaJump: '/' key could not be used as following sequence key, if already used as decorator hide key. fix it by disable sequential-target-chars if it used as the target char.`},
];
