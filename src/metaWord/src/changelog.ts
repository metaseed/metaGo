import { ChangeLogItem, ChangeLogKind } from "@landing-page/index";
export const changeLog: ChangeLogItem[] = [
  { kind: ChangeLogKind.VERSION,   message: `V1.3.0 - Sep 02, 2021`},
  { kind: ChangeLogKind.FIXED,   message: `cursorSpaceWordSpaceLeftDelete command not work.`},
  { kind: ChangeLogKind.FIXED,   message: `fix command map for mac: cursorSpaceWordSpaceLeftDelete`},
  { kind: ChangeLogKind.FIXED,   message: `readme description minor errors`},
  { kind: ChangeLogKind.PLAN,   message: `[] command(alt+s) to repeat a same word(space seperated) of the above line to save time of typing Same words as the above line.`},
  { kind: ChangeLogKind.PLAN,   message: `[] modify ctrl+pageup ctrl+pagedown to goto pagestart/end, so ctrl+home/end could be use to word based cursor movement.`},
  { kind: ChangeLogKind.PLAN,   message: `[] all words has start/end so: Home(left-end), Left(left-start), Right(right-end), End(right-start)`},
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
