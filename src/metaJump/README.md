[![Version](https://vsmarketplacebadge.apphb.com/version/metaseed.metajump.svg)](https://marketplace.visualstudio.com/items?itemName=metaseed.metajump)
[![Installs](https://vsmarketplacebadge.apphb.com/installs/metaseed.metajump.svg)](https://marketplace.visualstudio.com/items?itemName=metaseed.metajump)
[![Ratings](https://vsmarketplacebadge.apphb.com/rating/metaseed.metajump.svg)](https://marketplace.visualstudio.com/items?itemName=metaseed.metajump)
[![](https://img.shields.io/badge/TWITTER-%40metaseed-blue.svg?logo=twitter&style=flat)](https://twitter.com/metaseed)
[![](https://img.shields.io/badge/gitter-join_chat-1dce73.svg?style=flat&logo=gitter-white)](https://gitter.im/vscode-metago/community)


## MetaJump

MetaJump as a free tool, currently is maintained and developed by me in my spare time🌙⏳, if you think has ever saved you time, boosted your efficiency, or even indispensable like some of our users, please support me 😊
Give me a  [github⭐](https://github.com/metaseed/metago), or even [sponsor me at github🍻](https://github.com/sponsors/metasong)

MetaJump provides fast cursor moving/selecting/deleting commands with decoration characters on the possible target-locations.

> **MetaWord is part of [MetaGo extension](https://marketplace.visualstudio.com/items?itemName=metaseed.metago)**

![MetaGo.MetaJump](https://github.com/metaseed/metaGo/blob/master/src/metaJump/images/metaJump.gif?raw=true)

### features highlight
* code characters are based on priority, the character easier to type has higher priority. i.e. 'k','j', and code characters are configurable.
* at anytime continue typing would narrow down the candidate positions range.
* code character decorator is encoded with one or more characters, the code characters around cursor are easier to type.
* only encode characters on viewable screen area, so metaGo is faster.
* support having fold regions.
* support jumping to all opened editors.
* support adding multiple cursors and do multiple selections.
* support change the active selection of multiple selections.
* compatible with the vim plugins.
* Tab, Space, Enter key could also be used as target-location character.

[*➭Feature Summary⮵*](https://github.com/metaseed/metaGo/blob/master/README.md#features-summary)

### go to any character on screen
1. type <kbd>Alt</kbd>+<kbd>/</kbd> to tell I want to *go* somewhere. (Trigger)
2. type the characters(stands for the target location) on screen, metaGo will show you some decorator codes(candidate target locations) encoded with characters. (to see the characters behind the decoration, you could press the <kbd>shift</kbd>+<kbd>/</kbd>(configurable) to hide the location decorators for a short while(default 560ms))
3. you could continue type characters following the target location to narrow down the possible targets range, or type the code decoration characters of one location to *go* to that target location.

> at any time press <kbd>ESC</kbd> to cancel the command; <kbd>Backspace</kbd> to cancel last typed char in target-char-sequence. (<kbd>Backspace</kbd> triggers 'step-cancel')

> to show less decorators on screen, metaJump introduces 'ripple-encoding' support, : type target-location-chars to encode locations far from center(cursor location) by steps.
> 1. one target-char for current section(separated by empty lines);
> 1. two target-chars for current doc;
> 1. three or more target-chars for all opened editors;

> Ripple support for sequential-target commands:
> * ripple support are used to reduce the decorations shown on screen.
> * it take the idea of the water ripple caused by a rock.
> * just show target-location candidates in current section(seperated by empty lines) if user typed one target char;
> * just show location candidates of current document, if there is more than one document visible and user typed 2 target chars.
> * one-char-decorators will pass through boundaries(section or document) if possible. (i.e. for one-target-char, one-char-decorators has encoded all possible target locations in the section, then it will continue encodes until all one-char-decorators are used up).
> * it is only for sequential-target commands, the default configured value is true.

> tips for fast jumping of ripple enabled sequential-target commands:
> 1. if go to another section within the active document but not in the active section.(sections are seperated by empty lines), directly **type 2 target location chars**.
> 1. if want to go to another visible document, **always typing 3 target chars**.


> Note: <kbd>Enter</kbd>, <kbd>Space</kbd> and <kbd>Tab</kbd> are also usable as location characters. <kbd>Enter</kbd> means the end of line. You could press <kbd>Enter</kbd> any times to trigger the decorator-encoding for the line-end out side of current section(2 times) or document(3 times). (like a ripple)

> Note: you could also config the 'metaGo.decoration.hide.triggerKey' to a character, i.e. '/', this will hide decorations if holding '/' and show them after releasing.
> but this makes it impossible for the character i.e. '/' to be used as the following-target-character.

* the <kbd>Alt</kbd>+<kbd>.</kbd> shortcut will trigger the metaGo.gotoAfter command, the cursor will be placed after the target character;
* the <kbd>Alt</kbd>+<kbd>,</kbd> shortcut will trigger the metaGo.gotoBefore command, the cursor will be placed before the target character;
* the <kbd>Alt</kbd>+<kbd>/</kbd> shortcut will trigger the metaGo.gotoSmart command which intelligently set cursor position after navigation:
    * if the target is at the begin of the word, the cursor will be set before target character, otherwise after it;
    * The 'word' is defined as a group of all alphanumeric or punctuation characters.

> commands that only navigate in the active editor are also provided: metaGo.gotoAfterActive, metaGo.gotoBeforeActive, metaGo.gotoSmartActive, you could assign shortcuts by yourself.

> for the metajump location navigation commands, user could config to use single-target-char or sequential-target-chars to navigate to location:
> by default all the 'smart' commands (triggered with '/') are configured as single-target-char as below
>
> ```json
> "metaGo.jumper.commandsToUseSingleTargetChar":["metaGo.gotoSmart", "metaGo.selectSmart", "metaGo.addCursorSmart", "metaGo.metaJump.deleteToSmart"],
> ```
> to make the these smart commands use single-target-char: show decorations of all potential locations after user type one target char.

[*➭Feature Summary⮵*](https://github.com/metaseed/metaGo/blob/master/README.md#features-summary)

### select to any character in the active editor
1. type <kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>/</kbd> to tell I want to *select* to somewhere.
2. type the character(stands for location) on screen, metaGo will show you some codes encoded with character.
3. type the code characters, you will *select* to that location.
4. repeat 1-3 to adjust your current selection.
> at any time press <kbd>ESC</kbd> to cancel, or press <kdb>Backspace</kbd> to do step cancel to re-input last typed character

> support to do multiple selections,

> selection is always the range from the active cursor to the target location

![MetaGo.MetaJump](https://github.com/metaseed/metaGo/blob/master/src/metaJump/images/metago.jump.gif?raw=true)

### add multiple cursors to the active editor or change the active selection of multiple selections
1. <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>,</kbd> to add another cursor before the target-character.
1. <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>.</kbd> to add another cursor after the target-character.
1. <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>/</kbd> to add another cursor smartly to the target-character.

> <kbd>Ctrl</kbd>+<kbd>u</kbd> to cancel last cursor action.

> the three add-cursor commands would become change-active-selection commands if the target location is inside a selection. It is useful to modify multiple selection ranges, just select one selection as the active one and do extending or shrinking there.

#### add-multi-cursors demo
we want to modify the three wrongly spelled words, `alt+/` to goto the end of one of them, and `ctrl+alt+/` two times to add two additional cursors to the end of the other two words, `ctrl+backspace` to delete them together, `esc` to escape multi-cursor mode:

![MetaGo.MultiCursor](https://github.com/metaseed/metaGo/blob/master/src/metaJump/images/metago.multiCursor.gif?raw=true)


[*➭Feature Summary⮵*](https://github.com/metaseed/metaGo/blob/master/README.md#features-summary)

### change active selection in multiple selections
#### change-active-selection demo
in the gif, we use `alt+shift+/` do selection, then `alt+a`(provided in MegaGo plugin) to alternate selection's active with anchor, then `alt+shift+/` to extend selection from another end; then we use `ctrl+alt+/` to add another cursor to code above, `alt+shift+/` to do selection, then `ctrl+alt+/` to make the first selection active, `alt+shift+/` to shrink selection there:
![MetaGo.change-active-selection](https://github.com/metaseed/metaGo/blob/master/src/metaJump/images/metago.change-active-selection.gif?raw=true)

[*➭Feature Summary⮵*](https://github.com/metaseed/metaGo/blob/master/README.md#features-summary)

### delete to any character
 1. <kbd>alt</kbd>+<kbd>d</kbd>: to delete from cursor to the position smartly
 1. <kbd>alt</kbd>+<kbd>backspace</kbd>: to delete from cursor to the position before the target character
 1. <kbd>alt</kbd>+<kbd>delete</kbd>: to delete from cursor to the position after the target character

#### deleteTo commands demo:
![MetaGo.deleteTo](https://github.com/metaseed/metaGo/blob/master/src/metaJump/images/deleteTo.gif?raw=true)
[*➭Feature Summary⮵*](https://github.com/metaseed/metaGo/blob/master/README.md#features-summary)
