

## Features
MetaGo provides fast cursor movement/selection for keyboard focused users: 
* go to any character on screen with 3(most cases) or 4 times key press.
* moving cursor up/down between blank lines.
* select code block when moving cursor while hold shift key.
* scroll the active line (contains cursor) to the screen center.
* select line up/down.

### highlight features
* code characters are based on priority, the easier to type character has higher priority. i.e. 'k','j', and code characters are configurable, if you like.
* code character decorator is encoded with 1 or 2 characters, the code characters around cursor are easier to type.
* only encode characters on viewable screen area, so metaGo is faster.
* even though your cursor is out of your viewable screen, metaGo still works!

### go to any character on screen
1. type <kbd>Alt</kbd>+<kbd>;</kbd> to tell I want to *go* somewhere.
2. type the character(stands for location) on screen, metaGo will show you some codes encoded with character.
3. now you have three options:
    * type the code characters, you will *go* to that location. 
    * press <kdb>Enter</kdb> to directly go to the one *before* the cursor.(useful for the parameter or code block separators: { , ( and ) })
    * press <kdb>Space</kdb> to directly go to the one *after* the cursor.(useful for the parameter or code block separators: { , ( and ) })
4. now you have two options to do further navigation or just do nothing:
    * press <kbd>Alt</kbd>+<kbd>;</kbd> and then <kbd>Enter</kbd> to goto the next one *before* the cursor.
    * press <kbd>Alt</kbd>+<kbd>;</kbd> and then <kbd>Space</kbd> to goto the next one *after* the cursor.

> at any time press <kbd>ESC</kbd> to cancel

> the <kbd>Alt</kbd>+<kbd>;</kbd> command will intelligently set cursor position after navigation:
> if the target is at the begin of the word, the cursor will be set before target character, otherwise after it;
> The 'word' is defined as a group of all alphanumeric or punctuation characters. 
> MetaGo also provide commands that set cursor before/after the character after navigation, you can config the shortcut by yourself.

> * type <kbd>Alt</kbd>+<kbd>;</kbd> and then press <kbd>Enter</kbd> to go to the one above;
> * type <kbd>Alt</kbd>+<kbd>;</kbd> and then press <kbd>Space</kbd> to go to the one below;

### select to any character on screen from cursor
1. type <kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>;</kbd> to tell I want to *select* to somewhere.
2. type the character(stands for location) on screen, metaGo will show you some codes encoded with character.
3. type the code characters, you will *select* to that location.
4. repeat 1-3 to adjust your current selection.
> at any time press <kbd>ESC</kbd> to cancel

![MetaGo.MetaJump](images/metago.jump.gif)

### scroll line to the screen center/top
* <kbd>Alt</kbd>+<kbd>m</kbd> is the default shortcut to scroll current line to screen center.
* <kbd>Alt</kbd>+<kbd>t</kbd> is the default shortcut to scroll current line to screen top.
![MetaGo.Center](images/metago.center.gif)

### moving cursor up/down between blank lines
* <kbd>Alt</kbd>+<kbd>Home</kbd>(default shortcut) to move cursor to the blank line above.
* <kbd>Alt</kbd>+<kbd>End</kbd>(default shortcut) to move cursor to the blank line below.
* <kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>Home</kbd>(default shortcut) to select from the cursor to the blank line above.
* <kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>End</kbd>(default shortcut) to select from the cursor to the blank line below.
![MetaGo.blankLine](images/metago.blankLine.gif)

### select line up/down
* <kbd>Ctrl</kbd>+<kbd>i</kbd> to select line up.
* <kbd>Ctrl</kbd>+<kbd>shift</kbd>+i to select line down.

## Requirements

If you have any requirements or dependencies, add a section describing those and how to install and configure them.

## Default Shortcut Settings

To configure the keybinding, add the following lines to *keybindings.json* (File -> Preferences -> Keyboard Shortcuts):

        {
            "command": "extension.metaGo.input.cancel",
            "key": "escape",
            "when": "editorTextFocus && metaGoInput"
        },
        {
            "command": "extension.metaGo",
            "key": "alt+;",
            "when": "editorTextFocus",
            "description": "goto the character and set the cursor after the character"
        },
        {
            "command": "extension.metaGo.selection",
            "key": "alt+shift+;",
            "when": "editorTextFocus"
        },
        {
            "command": "extension.metaGo.selectLineUp",
            "key": "ctrl+shift+i",
            "when": "editorTextFocus"
        },
        {
            "command": "extension.metaGo.centerEditor",
            "key": "alt+m",
            "when": "editorTextFocus"
        },
        {
            "key": "alt+home",
            "command": "extension.metaGo.spaceBlockMoveUp",
            "when": "editorTextFocus"
        },
        {
            "key": "alt+shift+home",
            "command": "extension.metaGo.spaceBlockSelectUp",
            "when": "editorTextFocus"
        },
        {
            "key": "alt+end",
            "command": "extension.metaGo.spaceBlockMoveDown",
            "when": "editorTextFocus"
        },
        {
            "key": "alt+shift+end",
            "command": "extension.metaGo.spaceBlockSelectDown",
            "when": "editorTextFocus"
        }
## extension Settings

        "metaGo.decoration.backgroundColor": {
            "type": "string",
            "default": "Chartreuse,yellow",
            "description": "one and two character decorator background color"
        },
        "metaGo.decoration.backgroundOpacity": {
            "type": "string",
            "default": "0.7"
        },
        "metaGo.decoration.borderColor": {
            "type": "string",
            "default": "#1e1e1e"
        },
        "metaGo.decoration.color": {
            "type": "string",
            "default": "blue"
        },
        "metaGo.decoration.width": {
            "type": "number",
            "default": 9
        },
        "metaGo.decoration.height": {
            "type": "number",
            "default": 15
        },
        "metaGo.decoration.fontSize": {
            "type": "number",
            "default": 13
        },
        "metaGo.decoration.x": {
            "type": "number",
            "default": 1
        },
        "metaGo.decoration.y": {
            "type": "number",
            "default": 12
        },
        "metaGo.decoration.fontWeight": {
            "type": "string",
            "default": "bold"
        },
        "metaGo.decoration.fontFamily": {
            "type": "string",
            "default": "Consolas"
        },
        "metaGo.decoration.upperCase": {
            "type": "boolean",
            "default": false
        },
        "metaGo.decoration.characters": {
            "type": "string",
            "default": "k, j, d, f, l, s, a, h, g, i, o, n, u, r, v, c, w, e, x, m, b, p, q, t, y, z"
        },
        "metaGo.finder.findInSelection": {
            "type": "string",
            "default": "off"
        },
        "metaGo.finder.targetIgnoreCase": {
            "type": "string",
            "default": "false"
        },
        "metaGo.finder.findAllMode": {
            "type": "string",
            "default": "on",
            "description": "on: find all characters on viewable screen area; off: only search the first character of the words that are separated by chars configured in 'wordSeparatorPattern'"
        },
        "metaGo.finder.wordSeparatorPattern": {
            "type": "string",
            "default": "[ ,-.{_(\"'<\\/[+]"
        },
        "metaGo.finder.screenLineRange": {
            "type": "number",
            "default": 50,
            "description": "how many lines could be showed in one screen"
        }
