import { ChangeLogItem, ChangeLogKind } from "@landing-page/index";
export const changeLog: ChangeLogItem[] = [
  { kind: ChangeLogKind.VERSION,   message: `V4.3.1 - May 19, 2022`},
  { kind: ChangeLogKind.ADDED,   message: `Planning for new major release.`},
  { kind: ChangeLogKind.ADDED,   message: `upgrade typescript(4.3.5), webpack(5.50.0), and other packages to latest version`},
  { kind: ChangeLogKind.ADDED,   message: `support Plan section in change log`},
  { kind: ChangeLogKind.CHANGED,   message: `Add the MIT license file`},
  { kind: ChangeLogKind.CHANGED,   message: `Adjust readme`},
  { kind: ChangeLogKind.FIXED,   message: `Output panel has decorators shown there, should remove them.- [issue 52](https://github.com/metaseed/metaGo/issues/52)`},
  { kind: ChangeLogKind.FIXED,   message: `fix inSurroundingPairSelectionWithPairs command problem`},
  { kind: ChangeLogKind.PLAN,   message: `extract metaPair as separate vscode extension`},
  { kind: ChangeLogKind.PLAN,   message: `extract metaMark as separate vscode extension`},
  { kind: ChangeLogKind.PLAN,   message: `code indent as code tree, use ctrl+cmd+arrow to navigate`},
  { kind: ChangeLogKind.VERSION,   message: `V4.2.0 - June 8, 2020`},
  { kind: ChangeLogKind.ADDED,   message: `landing-page as a common module that could be used by sub extension.`},
  { kind: ChangeLogKind.CHANGED,   message: `use logo v4`},
  { kind: ChangeLogKind.CHANGED,   message: `metaJump as a separated extension`},
  { kind: ChangeLogKind.FIXED,   message: `close issue <a href="https://github.com/metaseed/metaGo/issues/42">[#42]</a>`},
  { kind: ChangeLogKind.VERSION,   message: `V4.0.2 - May 25, 2020`},
  { kind: ChangeLogKind.ADDED,   message: `from V4 I would start to separate metaGo into several small extensions, and make metaGo also as an ExtensionPack.`},
  { kind: ChangeLogKind.CHANGED,   message: `metaWord as separated extension.`},
  { kind: ChangeLogKind.VERSION,   message: `V3.8.0 - May 09, 2020`},
  { kind: ChangeLogKind.ADDED,   message: `metaWord: add commands to moveCursor/select/delete one space-word left/right. <a href="https://github.com/metaseed/metaGo/blob/master/README.md#metaword">(Detail)</a> (with this and vscode's cursorWordPartStartLeft, cursorWordStartLeft..., we could do bigWord, smallWord and partialWord navigation/selection/deletion, I would include my hotkey config for vscode's default word commands, and separate it into a signal vscode extension in next version)`},
  { kind: ChangeLogKind.ADDED,   message: `metaSurroundingPair: add command to change surrounding pairs. <a href="https://github.com/metaseed/metaGo#surrounding-pair-changing-demo">(Detail)</a>`},
  { kind: ChangeLogKind.ADDED,   message: `metaSurroundingPair: rewrite surroundPairsSelection to support multiline tags, i.e the html-start-tag is multiline sometimes, html staring tag regex is revised. (this consumes most of my time for this release🤣)`},
  { kind: ChangeLogKind.CHANGED,   message: `metaJump: default foreground/background colors for one-char and two-char decorator changed to be more easier to differentiate if overlapped. (Have a try you would know😉)`},
  { kind: ChangeLogKind.CHANGED,   message: `metaSurroundingPair: default hotkey is changed. <a href="https://github.com/metaseed/metaGo#surrounding-pair-selection">(Detail)</a>`},
  { kind: ChangeLogKind.CHANGED,   message: `improve go-to-bracket command <a href="https://github.com/metaseed/metaGo/blob/master/README.md#jump-to-bracket">(Detail)</a>`},
  { kind: ChangeLogKind.FIXED,   message: `lineSelection: select line down if more than one screen lines selected, could not show active line(below the screen bottom), always show selection start. (works perfect, one line not selected shown at the top or bottom to give user a sense of selection range)`},
  { kind: ChangeLogKind.VERSION,   message: `V3.7.0 - April 30, 2020`},
  { kind: ChangeLogKind.ADDED,   message: `metaSelection: surrounding-pair-selection command use cancel timeout in config.`},
  { kind: ChangeLogKind.ADDED,   message: `metaSelection: surrounding-pair-selection command's pairs could be configurable. <a href="https://github.com/metaseed/metaGo/blob/master/README.md#surroundpairs-config">(Detail)</a>`},
  { kind: ChangeLogKind.ADDED,   message: `metaSelection: surrounding-pair-selection command's pairs support regex, html tag selection is supported.<a href="https://github.com/metaseed/metaGo/blob/master/README.md#surroundpairs-config">(Detail)</a>`},
  { kind: ChangeLogKind.REMOVED,   message: `metaJump: Remove find in selection and it's config. (never use)`},
  { kind: ChangeLogKind.FIXED,   message: `metaJump: Command indicator is not removed sometimes.`},
  { kind: ChangeLogKind.VERSION,   message: `V3.6.6 - April 26, 2020 `},
  { kind: ChangeLogKind.ADDED,   message: `metaJump: commands to add additional cursor via screen decorators.(metaGo.insertCursorBefore, metaGo.insertCursorAfter, metaGo.insertCursorSmart) <a href="https://github.com/metaseed/metaGo#add-multiple-cursors-to-the-active-editor">(Detail)</a>`},
  { kind: ChangeLogKind.ADDED,   message: `metaJump: selection support multi cursor, could add more selection parts to current selections.`},
  { kind: ChangeLogKind.ADDED,   message: `metaJump: the addCursor command could be used to change active selection when there are multiple selections.<a href="https://github.com/metaseed/metaGo#change-active-selection-demo">(Detail)</a>`},
  { kind: ChangeLogKind.ADDED,   message: `metaJump: show typed target chars in status bar. <a href="https://github.com/metaseed/metaGo#change-active-selection-demo">(Detail)</a>`},
  { kind: ChangeLogKind.ADDED,   message: `metaJump: different command indication colors for jump, selection and addCursor command.`},
  { kind: ChangeLogKind.ADDED,   message: `metaJump: could config foreground decorator color for both one-char and two-char decorator.`},
  { kind: ChangeLogKind.ADDED,   message: `metaSelection: command to alternate selection's active with anchor. <a href="https://github.com/metaseed/metaGo#lineselection-demo">(Detail)</a>`},
  { kind: ChangeLogKind.ADDED,   message: `lineSelection: multi cursors support, extend/shrink lines for last active cursor. <a href="https://github.com/metaseed/metaGo#lines-selection">(Detail)</a>`},
  { kind: ChangeLogKind.ADDED,   message: `inSurroundingPairSelection: command to select inside a pair of separators: '(',')'; '[',']'; '{','}';'<','>'; '>', '<'; or any char pair: '''; '"'...<a href="https://github.com/metaseed/metaGo#surrounding-pair-selection">(Detail)</a>`},
  { kind: ChangeLogKind.CHANGED,   message: `lineSelection: Ctrl+l to select current line or extend/shrink selection by one line below. Ctrl+o to extend/shrink selection by one line above. <a href="https://github.com/metaseed/metaGo#lineselection-demo">(Detail)</a>`},
  { kind: ChangeLogKind.CHANGED,   message: `metaJump: when have multiple cursors, add cursor does decorators encoding from last cursor position. originally always start from the first cursor position`},
  { kind: ChangeLogKind.CHANGED,   message: `metaJump: command indicator is shown at last cursor position when has multi cursor. i.e. when triggering 'add cursor' command.`},
  { kind: ChangeLogKind.FIXED,   message: `metaJump: multi 'enter' as target chars, would generate new line in status bar message.`},
  { kind: ChangeLogKind.FIXED,   message: `metaJump: undefined property ref exception, when cursor below the last location target candidate;`},
  { kind: ChangeLogKind.FIXED,   message: `selectLines: could select to first and last line of the document.`},
  { kind: ChangeLogKind.VERSION,   message: `V3.5.1 - April 16, 2020`},
  { kind: ChangeLogKind.ADDED,   message: `metaJump: ripple support, type location-chars to trigger far from center: one char current section(separated by empty lines); two chars current doc; three chars all opened editors; for one and two target chars, one char decorators will pass through boundaries if possible(i.e. for one target char, no two chars decorators are needed for all candidates in the current section)`},
  { kind: ChangeLogKind.ADDED,   message: `metaJump: target chars is only used for narrow down searching range, not for navigation. solve the problem of typing multi target chars together may edit document by mistake`},
  { kind: ChangeLogKind.ADDED,   message: `metaGo: what's new page to show when major and minor upgrade`},
  { kind: ChangeLogKind.ADDED,   message: `dev: webpack support bundle third party packages`},
  { kind: ChangeLogKind.ADDED,   message: `dev: add local package generation, uninstall then install npm command`},
  { kind: ChangeLogKind.CHANGED,   message: `readme: make user manual better. <a href="https://github.com/metaseed/metaGo/blob/master/README.md#features-summary">(Detail)</a>`},
  { kind: ChangeLogKind.CHANGED,   message: `bookmark: one bookmark in one line, toggle-bookmark command works when cursor not at char location. char location is still used when goto the bookmark.`},
  { kind: ChangeLogKind.CHANGED,   message: `line selection: metaGo.selectLineUp default shortcut changed from ctrl+shift+l to ctrl+i, to avoid collision with default command of ctrl+shift+l.`},
  { kind: ChangeLogKind.FIXED,   message: `bookmark: type in popup box, would jump automatically, may edit when type fast. should only do filter!`},
  { kind: ChangeLogKind.FIXED,   message: `bookmark: trigger bookmark.view command event there is no opened editor or no editor has focus.`},
  { kind: ChangeLogKind.FIXED,   message: `metaJump: fix cancel exception: after trigger jump, then press Esc would throw exception.`},
  { kind: ChangeLogKind.FIXED,   message: `metaJump: '/' key could not be used as following sequence key, if already used as decorator hide key. fix it by disable sequential-target-chars if it used as the target char.`},
  { kind: ChangeLogKind.VERSION,   message: `V3.4.3 - Mar 19, 2020`},
  { kind: ChangeLogKind.ADDED,   message: `text decorator support background color transparent: opacity`},
  { kind: ChangeLogKind.CHANGED,   message: `decoration background opacity as border opacity`},
  { kind: ChangeLogKind.CHANGED,   message: `adjust default decorator width to 8, otherwise it hide character, i.e. n looks like r`},
  { kind: ChangeLogKind.FIXED,   message: `fix following char is upper case, the lower case is used in decorator problem`},
  { kind: ChangeLogKind.VERSION,   message: `V3.4.0 - Mar 18, 2020`},
  { kind: ChangeLogKind.ADDED,   message: `in sequential-target-chars jump, background color of the char follows target char`},
  { kind: ChangeLogKind.ADDED,   message: `new gif logo`},
  { kind: ChangeLogKind.ADDED,   message: `jump commands could be triggered event editor not focused, and has any open editor. i.e when in "Explorer" treeView.`},
  { kind: ChangeLogKind.ADDED,   message: `left border on jump code decorator, easier for discriminating concatenated/overlapped decorators`},
  { kind: ChangeLogKind.ADDED,   message: `'Backspace' as command to delete last input char, it's a step cancel command, 'Esc' is a whole cancel command.`},
  { kind: ChangeLogKind.CHANGED,   message: `update metago.jump gif in readme.md`},
  { kind: ChangeLogKind.CHANGED,   message: `the target location chars case sensitive method is changed from 'if has upper case' to 'the last char is upper case"`},
  { kind: ChangeLogKind.FIXED,   message: `background color of matched target chars`},
  { kind: ChangeLogKind.FIXED,   message: `fix enter key at end of sequential-target jump`},
  { kind: ChangeLogKind.VERSION,   message: `V3.3.0 - Mar 10, 2020`},
  { kind: ChangeLogKind.ADDED,   message: `feat: sequential-target-chars support: type a sequence of target-chars, and dynamically change decoration codes while typing, at any time type the decoration codes to navigate. This means we provide two sets of codes one set is the target chars sequence and another set is the dynamically generated decorators. you could type the chars sequence as long as you want to narrow down the searched possible locations, and then type the decoration codes to got the the exact location.`},
  { kind: ChangeLogKind.ADDED,   message: `feat: add encode feature that support additional letters that only appears in signal char length code.`},
  { kind: ChangeLogKind.ADDED,   message: `feat: Color settings support referencing [Theme Color Id](https://code.visualstudio.com/api/references/theme-color), note: when use svg we not support them color`},
  { kind: ChangeLogKind.REMOVED,   message: `removed config: metaGo.decoration.upperCase: use as it is.`},
  { kind: ChangeLogKind.REMOVED,   message: `add config: metaGo.decoration.additionalSingleCharCodeCharacters: only appears as one char decoration codes`},
  { kind: ChangeLogKind.VERSION,   message: `V3.2.0 - Feb 28, 2020`},
  { kind: ChangeLogKind.ADDED,   message: `support real viewport range, not use config`},
  { kind: ChangeLogKind.ADDED,   message: `easy to trigger metago command: type 'F1, xx...'. 'xx' as a prefix for search metagoCommands`},
  { kind: ChangeLogKind.ADDED,   message: `jumper support fold region`},
  { kind: ChangeLogKind.REMOVED,   message: `remove editor viewport range lines in config, use new api to get editor viewport range`},
  { kind: ChangeLogKind.REMOVED,   message: `remove function to get anchor from selection, use new vscode api of Selection`},
  { kind: ChangeLogKind.CHANGED,   message: `remove 'jumper.targetIgnoreCase' in config, replace it with: if the location char is Upper case it is case sensitive, otherwise it's case insensitive.`},
  { kind: ChangeLogKind.CHANGED,   message: `upgrade vscode engine to the latest one, released in Sep 2019, need 1.22.0 at least to support editor.visibleRanges`},
  { kind: ChangeLogKind.CHANGED,   message: `rename commands name with verb-none pattern, easy to search in command list: F1, xsd -> select line down`},
  { kind: ChangeLogKind.FIXED,   message: `Jumper: svg decorator could not be shown`},
  { kind: ChangeLogKind.FIXED,   message: `Jumper: if the the line of location char is less than codes length, decorator codes hide partially`},
  { kind: ChangeLogKind.FIXED,   message: `Jumper: support show decorators for '\n' of empty line, we could jump to every line end.`},
  { kind: ChangeLogKind.VERSION,   message: `V3.1.0 - Feb 24, 2020`},
  { kind: ChangeLogKind.ADDED,   message: `jumper could goto any opened editors not just the active editor.`},
  { kind: ChangeLogKind.ADDED,   message: `metaGo.gotoAfterActive, metaGo.gotoBeforeActive, metaGo.gotoSmartActive commands only for active editor.`},
  { kind: ChangeLogKind.ADDED,   message: `support <kbd>Enter</kbd>, <kbd>Space</kbd> as target chars.`},
  { kind: ChangeLogKind.REMOVED,   message: `~~after the trigger(<kbd>Alt</kbd>+<kbd>.</kbd> or <kbd>Alt</kbd>+<kbd>,</kbd> or  <kbd>Alt</kbd>+<kbd>\/</kbd>)press <kbd>Enter</kbd> to directly go to the one before the current cursor position~~`},
  { kind: ChangeLogKind.REMOVED,   message: `~~after the trigger, press <kbd>Space</kbd> to directly go to the one after the current cursor position;~~`},
  { kind: ChangeLogKind.CHANGED,   message: `replace Promise with async/await in MetaJump`},
  { kind: ChangeLogKind.CHANGED,   message: `updated readme`},
  { kind: ChangeLogKind.CHANGED,   message: `metaJump decoration support any code length`},
  { kind: ChangeLogKind.VERSION,   message: `V3.0.0 - Feb 19, 2020`},
  { kind: ChangeLogKind.ADDED,   message: `add/change commands: metaGo.gotoBefore, metaGo.gotoAfter, metaGo.gotoSmart; metaGo.selectBefore, metaGo.selectAfter, metaGo.selectSmart;`},
  { kind: ChangeLogKind.ADDED,   message: `add feature of holding <kbd>/</kbd>(could be modified in config) to hide decorators and release it to show again.`},
  { kind: ChangeLogKind.REMOVED,   message: `removed delete related command, and no future implementation scheduled, because of unrelated to cursor jumping`},
  { kind: ChangeLogKind.CHANGED,   message: `modified default key bindings (compatible with [**metaTool**](https://github.com/metatool/metatool))and adjusted command names- **ATTENTION: not backward compatible**`},
  { kind: ChangeLogKind.CHANGED,   message: `upgrade dev dependent libs to latest version`},
  { kind: ChangeLogKind.CHANGED,   message: `updated readme`},
  { kind: ChangeLogKind.VERSION,   message: `V2.12.0: merge  pull requests to make it work in new version of vscode.`},
  { kind: ChangeLogKind.VERSION,   message: `v2.11.0: minor changes on readme.md according to feedback in issues.`},
];
