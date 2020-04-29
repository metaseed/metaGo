# Change Log
All notable changes to the "metago" extension will be documented in this file.

## Todo List:
   - [x] close issues. 
   - [x] support real viewport range, not use config
   - [x] jumper support fold region    
   - [x] Color settings support referencing [Theme Color Id](https://code.visualstudio.com/api/references/theme-color)
   - [x] sequential-target-chars support: type a sequence of target-chars, and dynamically change decoration codes while typing, at any time type the decoration codes to navigate. This means we provide two sets of codes one set is the target chars sequence and another set is the dynamically generated decorators. you could type the chars sequence as long as you want to narrow down the searched possible locations, and then type the decoration codes to got the the exact location.
   - [x] add following char decorator in sequential-target.
   - [x] jump commands could be triggered event editor not focused, has any open editor
   - [x] left border on jump code decorator support
   - [x] fix enter key at end of sequential-target jump
   - [x] backspace as command to delete last input char: could done by registered as textEditor command
   - [x] bookmark: one bookmark in one line, toggle-bookmark command works when cursor not at char location. char location is still used when goto the bookmark.
   - [x] target chars is only used for narrow down searching range, not for navigation. solve the problem of typing multi target chars together may edit document by mistake
   - [x] ripple search support, type location-chars to trigger far from center: one char nearby; two char current doc; three chars all opened editors
   - [x] bug: metaJump: '/' key could not be used as following sequence key, if already used as decorator hide key. fix it by disable sequential-target-chars if it used as the target char.

   - [x] Line selection up/down command: ? editorHasSelection
      ~~make Ctrl+L into a line command trigger: if the user press i(means up, configurable), triggers the selecting up subCommand, in this subCommand the user can press i again or press k (mean down) several times. Ctrl+L, k is select down subCommand trigger. any other key other than i,k would escape this command~~
      Ctrl+o to extendLineSelection up when has selection

   - [ ] bracketJump: level navigate. context conditional variable when cursor at bracket. ctrl+shift+P[ or ] to go to previous/ next level.
   - [ ] metaJump: backspace to cancel last input decoration code.
   - [ ] ctrl+i i ': select in '; ctrl+i a ': select ' and content;
   
   - [ ] bookmark: use treeView and implement tag mark.
   - [ ] metaSelection: active selection's cursor should be special to identify, when there are multiple selections or multiple cursors
   - [ ] metaJump: contributed command: metaGo.Cancel doesn't exist.

   - [ ] inPairSelection: pairs configuration
   - [ ] inPairSelection: tag selection support
   - [ ] metaJump: alt+/ then ctrl+alt+/ could cancel and press ctrl+alt+/ to trigger.
   - [ ] add useful my command config into package.json. i.e. Ctrl+Alt+back to delete small word left
   - [ ] Create command for move to previous/next member
## Todo List for V4
   - [ ] extract metaJump as separate vscode extension
   - [ ] extract metaSelection as separate vscode extension
   - [ ] extract metaMark as separate vscode extension
## In Development

---
### 
#### Added
#### Removed
#### Changed
#### Fixed


## Current Version
---
### V3.6.7
#### Added
#### Removed
   - [x] metaJump: Remove find in selection and it's config. (seldom used, I never use)
#### Changed
#### Fixed

---
### V3.6.6 - April 26, 2020 
#### Added
   - [x] metaJump: commands to add additional cursor via screen decorators.(metaGo.insertCursorBefore, metaGo.insertCursorAfter, metaGo.insertCursorSmart) <a href="https://github.com/metaseed/metaGo#add-multiple-cursors-to-the-active-editor">(Detail)</a>
   - [x] metaJump: selection support multi cursor, could add more selection parts to current selections. 
   - [x] metaJump: the addCursor command could be used to change active selection when there are multiple selections.<a href="https://github.com/metaseed/metaGo#change-active-selection-demo">(Detail)</a>
   - [x] metaJump: show typed target chars in status bar. <a href="https://github.com/metaseed/metaGo#change-active-selection-demo">(Detail)</a>
   - [x] metaJump: different command indication colors for jump, selection and addCursor command.
   - [x] metaJump: could config foreground decorator color for both one-char and two-char decorator.
   - [x] metaSelection: command to alternate selection's active with anchor. <a href="https://github.com/metaseed/metaGo#lineselection-demo">(Detail)</a>
   - [x] lineSelection: multi cursors support, extend/shrink lines for last active cursor. <a href="https://github.com/metaseed/metaGo#lines-selection">(Detail)</a>
   - [x] inPairSelection: command to select inside a pair of separators: '(',')'; '[',']'; '{','}';'<','>'; '>', '<'; or any char pair: '''; '"'...<a href="https://github.com/metaseed/metaGo#inside-pair-selection">(Detail)</a>
#### Removed
#### Changed
   - [x] lineSelection: Ctrl+l to select current line or extend/shrink selection by one line below. Ctrl+o to extend/shrink selection by one line above. <a href="https://github.com/metaseed/metaGo#lineselection-demo">(Detail)</a>
   - [x] metaJump: when have multiple cursors, add cursor does decorators encoding from last cursor position. originally always start from the first cursor position
   - [x] metaJump: command indicator is shown at last cursor position when has multi cursor. i.e. when triggering 'add cursor' command.
#### Fixed
   - [x] metaJump: multi 'enter' as target chars, would generate new line in status bar message.
   - [x] metaJump: undefined property ref exception, when cursor below the last location target candidate;
   - [x] selectLines: could select to first and last line of the document.

---
### V3.5.1 - April 16, 2020
#### Added
   - [x] metaJump: ripple support, type location-chars to trigger far from center: one char current section(separated by empty lines); two chars current doc; three chars all opened editors; for one and two target chars, one char decorators will pass through boundaries if possible(i.e. for one target char, no two chars decorators are needed for all candidates in the current section)
   - [x] metaJump: target chars is only used for narrow down searching range, not for navigation. solve the problem of typing multi target chars together may edit document by mistake
   - [x] metaGo: what's new page to show when major and minor upgrade
   - [x] dev: webpack support bundle third party packages
   - [x] dev: add local package generation, uninstall then install npm command

#### Removed

#### Changed
   - [x] readme: make user manual better. <a href="https://github.com/metaseed/metaGo/blob/master/README.md#features-summary">(Detail)</a>
   - [x] bookmark: one bookmark in one line, toggle-bookmark command works when cursor not at char location. char location is still used when goto the bookmark.
   - [x] line selection: metaGo.selectLineUp default shortcut changed from ctrl+shift+l to ctrl+i, to avoid collision with default command of ctrl+shift+l.
#### Fixed
   - [x] bookmark: type in popup box, would jump automatically, may edit when type fast. should only do filter!
   - [x] bookmark: trigger bookmark.view command event there is no opened editor or no editor has focus.
   - [x] metaJump: fix cancel exception: after trigger jump, then press Esc would throw exception.
   - [x] metaJump: '/' key could not be used as following sequence key, if already used as decorator hide key. fix it by disable sequential-target-chars if it used as the target char.

---
### V3.4.3 - Mar 19, 2020
#### Added
* text decorator support background color transparent: opacity
#### Removed
#### Changed
* decoration background opacity as border opacity
* adjust default decorator width to 8, otherwise it hide character, i.e. n looks like r

#### Fixed
* fix following char is upper case, the lower case is used in decorator problem
---

### V3.4.0 - Mar 18, 2020
#### Added
* in sequential-target-chars jump, background color of the char follows target char
* new gif logo
* jump commands could be triggered event editor not focused, and has any open editor. i.e when in "Explorer" treeView.
* left border on jump code decorator, easier for discriminating concatenated/overlapped decorators
* 'Backspace' as command to delete last input char, it's a step cancel command, 'Esc' is a whole cancel command.
#### Removed
#### Changed
* update metago.jump gif in readme.md
* the target location chars case sensitive method is changed from 'if has upper case' to 'the last char is upper case"
#### Fixed
* background color of matched target chars
* fix enter key at end of sequential-target jump
---     

### V3.3.0 - Mar 10, 2020
#### Added
* feat: sequential-target-chars support: type a sequence of target-chars, and dynamically change decoration codes while typing, at any time type the decoration codes to navigate. This means we provide two sets of codes one set is the target chars sequence and another set is the dynamically generated decorators. you could type the chars sequence as long as you want to narrow down the searched possible locations, and then type the decoration codes to got the the exact location.
* feat: add encode feature that support additional letters that only appears in signal char length code.
* feat: Color settings support referencing [Theme Color Id](https://code.visualstudio.com/api/references/theme-color), note: when use svg we not support them color
#### Removed
* removed config: metaGo.decoration.upperCase: use as it is.
* add config: metaGo.decoration.additionalSingleCharCodeCharacters: only appears as one char decoration codes 
#### Changed
#### Fixed

---
### V3.2.0 - Feb 28, 2020
#### Added
* support real viewport range, not use config
* easy to trigger metago command: type 'F1, xx...'. 'xx' as a prefix for search metagoCommands
* jumper support fold region
#### Removed
* remove editor viewport range lines in config, use new api to get editor viewport range
* remove function to get anchor from selection, use new vscode api of Selection
#### Changed
   - remove 'jumper.targetIgnoreCase' in config, replace it with: if the location char is Upper case it is case sensitive, otherwise it's case insensitive.
   - upgrade vscode engine to the latest one, released in Sep 2019, need 1.22.0 at least to support editor.visibleRanges
   - rename commands name with verb-none pattern, easy to search in command list: F1, xsd -> select line down
#### Fixed
   - Jumper: svg decorator could not be shown
   - Jumper: if the the line of location char is less than codes length, decorator codes hide partially
   - Jumper: support show decorators for '\n' of empty line, we could jump to every line end.
---

### V3.1.0 - Feb 24, 2020
#### Added
* jumper could goto any opened editors not just the active editor.
* metaGo.gotoAfterActive, metaGo.gotoBeforeActive, metaGo.gotoSmartActive commands only for active editor.
* support <kbd>Enter</kbd>, <kbd>Space</kbd> as target chars.
#### Removed
~~after the trigger(<kbd>Alt</kbd>+<kbd>.</kbd> or <kbd>Alt</kbd>+<kbd>,</kbd> or  <kbd>Alt</kbd>+<kbd>\/</kbd>)press <kbd>Enter</kbd> to directly go to the one before the current cursor position~~    
~~after the trigger, press <kbd>Space</kbd> to directly go to the one after the current cursor position;~~
#### Changed
* replace Promise with async/await in MetaJump
* updated readme
* metaJump decoration support any code length

---

### V3.0.0 - Feb 19, 2020
#### Added
* add/change commands: metaGo.gotoBefore, metaGo.gotoAfter, metaGo.gotoSmart; metaGo.selectBefore, metaGo.selectAfter, metaGo.selectSmart; 
* add feature of holding <kbd>/</kbd>(could be modified in config) to hide decorators and release it to show again.
#### Removed
* removed delete related command, and no future implementation scheduled, because of unrelated to cursor jumping

#### Changed
* modified default key bindings (compatible with [**metaTool**](https://github.com/metatool/metatool))and adjusted command names- **ATTENTION: not backward compatible**
- upgrade dev dependent libs to latest version
* updated readme


### V2.12.0: merge  pull requests to make it work in new version of vscode.
### v2.11.0: minor changes on readme.md according to feedback in issues.
