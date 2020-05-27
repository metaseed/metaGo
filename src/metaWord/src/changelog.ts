import { ChangeLogItem, ChangeLogKind } from "@landing-page/index";
export const changeLog: ChangeLogItem[] = [
  { kind: ChangeLogKind.VERSION,   message: `V1.2.0 - May 26, 2020`},
  { kind: ChangeLogKind.ADDED,   message: `add default word related commands shortcuts.`},
  { kind: ChangeLogKind.ADDED,   message: `what's new landing page.`},
  { kind: ChangeLogKind.CHANGED,   message: `improve readme. <a href="https://github.com/metaseed/metaGo/blob/master/src/metaWord/README.md">(detail)</a>`},
  { kind: ChangeLogKind.VERSION,   message: `V1.0.0 - May 25, 2020`},
  { kind: ChangeLogKind.ADDED,   message: `metaWord as a seperated vscode extension`},
];
