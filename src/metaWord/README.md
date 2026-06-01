**the Goal of MetaWord is providing different kinds of words based cursorMove/Select/Delete commands.**

> **MetaWord is part of [MetaGo extension](https://marketplace.visualstudio.com/items?itemName=metaseed.metago)**

MetaWord as a free tool, currently is maintained and developed by me in my spare time🌙⏳, if you think has ever saved you time, boosted your efficiency, or even indispensable like some of our users, please support me 😊
Give me a  [github⭐](https://github.com/metaseed/metago), or even [sponsor me at github🍻](https://github.com/sponsors/metasong)

## MetaWord
|word type|description|examples|
|---|---|---|
|SpaceWord(BigWord)| characters separated by 'space'('Space' or 'Tab')|"abc $1024 (apple,pineapple...)" are three SpaceWords
|Word|a group of alphanumeric character with underscore:(A-Za-z0-9_) or a group of other symbol characters:~!@#$%^&*()-+:;"',.<>/?\[]{} **note: include 'space'**|"abc $1024 (apple,pineapple...)" are words seperated by '/' as "abc/ $/1024/ (/apple/,/pineapple/...)"
|WordPart(SmallWord)| a part in a group of CamelCase (A-Za-z0-9) characters, a part of '_' connected (A-Za-z0-9) characters, or a group of other symbol characters| a group of spaces; WordPart: Word/Part; word-part: word/-part/

* <kbd>shift</kbd>+<kbd>backspace</kbd>: delete all from the cursor to the line start.
* <kbd>shift</kbd>+<kbd>del</kbd>: delete all from the cursor to the line end.

### Word commands to moveCursor/select/delete by word

> we use the default vscode 'Word' commands

> **note:**
> default vscode cursorWordEndRight command would do this: \
> `console.log(err)`: '|console|.log|(err|)|' \
> `a+= 3 +5-3 + 7`:'|a|+=| 3| +5|-3| +| 7|'(from left) or 'a|+= |3 |+|5|-|3 |+ |7|'(from right)\
> (if there is only one symbol character before the next word, the cursor would not stop after the symbol)
>
> default vscode cursorWordStartLeft command would do this:
> 'this|.|is|.|a|.|test' and ' text| a|+=| 3| +|5|-|3| +| 7|' (work as expected)
>
> default deleteWordLeft command would do this:
> '|this.|is.|a.|test'(<=star from here, if there is only one symbol character after the previous word, the cursor would not stop and delete it with the previous word together)
> default deleteWordRight command would do this:
> '|this|.|is|.|a|.|test|' (work as expected)


* <kbd>ctrl</kbd>+<kbd>left/right</kbd>: left/right move cursor to word start/end.
* <kbd>ctrl</kbd>+<kbd>shift</kbd>+<kbd>left/right</kbd>: left/right select from cursor to word start/end.
* <kbd>ctrl</kbd>+<kbd>backspace/delete</kbd>: left/right delete from cursor to word start/end.
> Note: one Mac, the cursorWord* commands are not mapped, you may need to map them by your self.

### WordPart commands to moveCursor/select/delete by wordPart
> Examples: ABCdef__ghIJKL
> * when forward:
>   * '|AB|Cdef|\_\_gh|IJKL|'
>   * '|AB|Cdef|\_\_ghijkl|'
> * when backward:
>   * '|AB|Cdef\_\_|gh|IJKL|' (<-start from end)
character
> note: the difference at the word connector('_')  dd    dd

* <kbd>ctrl</kbd>+<kbd>alt</kbd>+<kbd>left/right</kbd>: move cursor left/right to the wordPart start/end.
* <kbd>ctrl</kbd>+<kbd>alt</kbd>+<kbd>shift</kbd>+<kbd>left/right</kbd>: left/right select from cursor to the wordPart start/end.
* <kbd>ctrl</kbd>+<kbd>alt</kbd>+<kbd>backspace</kbd>: left delete to the wordPart start.
* on windows <kbd>ctrl</kbd>+<kbd>alt</kbd>+<kbd>shift</kbd>+<kbd>backspace</kbd>: right delete to the wordPart end.(note: `ctrl+alt+del` on windows is a system shortcut, we could not use it)
    > on Mac use <kbd>ctrl</kbd>+<kbd>alt</kbd>+<kbd>delete</kbd>

### SpaceWord commands to moveCursor/select/delete word separated by space:

<kbd>alt+;</kbd> enter space mode, then:
* move: <kbd>arrow: left/right/up/down</kbd> to move between spaces;
  > note: up/down also work: they skip empty/whitespace-only lines and jump to the nearest non-empty line — up lands like `left` from the end of that line, down lands like `right` from its start.
* select: <kbd>shift + arrow keys</kbd> to select; up/down same as move's logic.
* delete: <kbd>backspace</kbd> to delete backward; <kbd>delete</kbd> to delete to another direction.
* <kbd>escape</kbd> exits the mode.
* any other key(except: arrow, delete/backspace) escape the mode, and the key also take effect in editor.

> ⚠️ **If some keys don't work in space mode** (e.g. `up`/`down` or `backspace` do nothing or behave normally while `left`/`right`/`delete` are fine), the key is being captured by something with higher priority than this extension — **check these in order**:
> 1. **Your own keybindings** (`Preferences: Open Keyboard Shortcuts (JSON)`): a user keybinding for that key (e.g. `up`→`cursorUp` with a `when` like `textInputFocus`) **always overrides extension keybindings**. Remove it, or scope it with `&& !metaGoSpaceMode`.
> 2. **Other extensions**: another extension may bind the same key (e.g. *Markdown All in One* claims `backspace` in `.md` files). One extension can't reliably out-prioritize another, so disable/uninstall the conflicting one, or add a user keybinding for that key → the matching `metaGo.spaceMode.*` command gated by `metaGoSpaceMode` (user keybindings win over everything).
>
> These space-mode bindings ship in this extension's `package.json` and work out of the box on a clean setup; the above only matters when a higher-priority binding shadows them.

#### Additional commands (manual keybinding)

These are the original **non-modal** SpaceWord commands (same logic as SpaceMode), but **no default shortcuts are assigned** (because some historical shortcuts are taken by OS / other features, e.g. Win11).

**Commands**

* `metaGo.cursorSpaceWordLeft`: move left by one space-word (cursor stops at the word boundary)
* `metaGo.cursorSpaceWordLeftSelect`: select left by one space-word
* `metaGo.cursorSpaceWordLeftDelete`: delete left by one space-word

* `metaGo.cursorSpaceWordRight`: move right by one space-word
* `metaGo.cursorSpaceWordRightSelect`: select right by one space-word
* `metaGo.cursorSpaceWordRightDelete`: delete right by one space-word

* `metaGo.cursorSpaceWordSpaceLeft`: move left by one space-word **including surrounding spaces**
* `metaGo.cursorSpaceWordSpaceLeftSelect`: select left by one space-word including surrounding spaces
* `metaGo.cursorSpaceWordSpaceLeftDelete`: delete left by one space-word including surrounding spaces

* `metaGo.cursorSpaceWordSpaceRight`: move right by one space-word including surrounding spaces
* `metaGo.cursorSpaceWordSpaceRightSelect`: select right by one space-word including surrounding spaces
* `metaGo.cursorSpaceWordSpaceRightDelete`: delete right by one space-word including surrounding spaces

**Example keybindings**

Add your preferred keys in `Preferences: Open Keyboard Shortcuts (JSON)`:

```json
 {
    "command": "metaGo.cursorSpaceWordLeft",
    "key": "win+alt+left", // note: win11 already used this key, I don't know other reasonable key to use, so create space-mode.
    "when": "editorTextFocus"
    "mac": "cmd+alt+left",
    "when": "editorTextFocus"
 },
```
## Note
we modified several default command vscode command's shortcut, because we want to use it to do word based cursorMove/select/delete.
* `ctrl+alt+left/right` by default is used by "workbench.action.moveEditorToPreviousGroup/NextGroup", so we assign `ctrl+k ctrl+left/right` to do the editor movement.
* `ctrl+alt+shift+left/right` by default is used by "cursorColumnSelectLeft/Right" command, we think of a solution to do column based vertical selection:
    > <kbd>alt</kbd>+<kbd>v</kbd>: toggle vertical column selection mode.
    > `alt+v` to enter vertical column selection model, then press `shift+left/right/up/down` as needed to do column mode selection.

[*➭MetaGo Feature Summary⮵*](https://github.com/metaseed/metaGo/blob/master/README.md#features-summary)

