import { ChangeLogItem, ChangeLogKind } from "@landing-page/index";
export const changeLog: ChangeLogItem[] = [
  { kind: ChangeLogKind.VERSION,   message: `V1.2.0 - June 01, 2020`},
  { kind: ChangeLogKind.ADDED,   message: `add commands to moveCursor/select/delete spaceWord, that include spaces before/after the word. <a href="https://github.com/metaseed/metaGo/tree/master/src/metaWord#spaceword-commands-to-movecursorselectdelete-word-separated-by-space">(detail)</a>`},
  { kind: ChangeLogKind.ADDED,   message: `make spaceWord commands use both 'Tab' and 'Space' as spaces.`},
  { kind: ChangeLogKind.CHANGED,   message: `on Mac ctrl+alt+del to right delete wordPart.`},
  { kind: ChangeLogKind.VERSION,   message: `V1.1.0 - May 27, 2020`},
  { kind: ChangeLogKind.ADDED,   message: `add default word related commands shortcuts. <a href="https://github.com/metaseed/metaGo/blob/master/src/metaWord/README.md">(detail)</a>`},
  { kind: ChangeLogKind.ADDED,   message: `what's new landing page.`},
  { kind: ChangeLogKind.CHANGED,   message: `improve readme. <a href="https://github.com/metaseed/metaGo/blob/master/src/metaWord/README.md">(detail)</a>`},
  { kind: ChangeLogKind.VERSION,   message: `V1.0.0 - May 25, 2020`},
  { kind: ChangeLogKind.ADDED,   message: `metaWord as a separated vscode extension`},
];
