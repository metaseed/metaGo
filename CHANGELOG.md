# Change Log
All notable changes to the "metago" extension will be documented in this file.

## Todo List:
   - [x] close issues. 
   - [x] support real viewport range, not use config
   - [x] jumper support fold region    
   ~~- [ ] backspace as command to delete last input char: not possible in inline input to catch `BS` key~~    
   - [ ] sequential-location-chars support: 
      * type a sequence of location-chars, and dynamicly change decoration codes while typing, at any time type the decoration codes to navigate. This means we provide two sets of codes one set is the location chars sequence and another set is the dynamicly generated docrators. you could type the chars sequence as long as you want to narrow down the searched possible locations, and then type the decoration codes to got the the exact location.
      * ripple search support, type location-chars to triger far from center
   - [ ] Line selection up/down command: ?
      ctrl+l,k -> select down; ctrl+l,i -> select up
   - [ ] add useful my command config into package.json. i.e. Ctrl+Alt+back to delete small word left
   - [ ] jump commands could be triggered event editor not focused, has any open editor
   - [ ] Create command for move to previous/next member


---     
## In Development
### V3.3.0
#### Added
#### Removed
#### Changed
#### Fixed

---
### V3.2.0 - Feb 28, 2020
#### Added
* support real viewport range, not use config
* easy to triger metago command: type `F1, xx...`. `xx` as a prefix for search metagoCommands
* jumper support fold region
#### Removed
* remove editor viewport range lines in config, use new api to get editor viewport range
* remove function to get anchor from selection, use new vscode api of Selection
#### Changed
   - remove 'jumper.targetIgnoreCase' in config, replace it with: if the location char is Uper case it is case sensitive, otherwise it's case insensitive.
   - upgrade vscode engine to the latest one, released in Sep 2019, need 1.22.0 at least to support editor.visibleRanges
   - rename commands name with verb-none pattern, easy to search in command list: F1, xsd -> select line down
#### Fix
   - Jumper: svg decorator could not be shown
   - Jumper: if the the line of location char is less than codes length, decorator codes hide partially
   - Jumper: suppor show decorators for `\n` of empty line, we could jump to evely line end.

## Released
### V3.1.0 - Feb 24, 2020
#### Added
* jumper could goto any opened editors not just the active editor.
* metaGo.gotoAfterActive, metaGo.gotoBeforeActive, metaGo.gotoSmartActive commands only for active editor.
* support <kbd>Enter</kbd>, <kbd>Space</kbd> as location chars.
#### Removed
~~after the trigger(<kbd>Alt</kbd>+<kbd>.</kbd> or <kbd>Alt</kbd>+<kbd>,</kbd> or  <kbd>Alt</kbd>+<kbd>\/</kbd>)press <kbd>Enter</kbd> to directly go to the one before the current cursor positon;~~    
~~after the trigger, press <kbd>Space</kbd> to directly go to the one after the current cursor position;~~
#### Changed
* replace Promise with async/await in Metajump
* updated readme
* metajump decoration support any code length

### V3.0.0 - Feb 19, 2020
#### Added
* add/change commands: metaGo.gotoBefore, metaGo.gotoAfter, metaGo.gotoSmart; metaGo.selectBefore, metaGo.selectAfter, metaGo.selectSmart; 
* add feature of holding <kbd>/</kbd>(could be modified in config) to hide decorators and release it to show again.
#### Removed
* removed delete related command, and no future implementation scheduled, because of unrelated to cursor jumping

#### Changed
* modified default key bindings (compatble with [**metaTool**](https://github.com/metatool/metatool))and adjusted command names- **ATTENTION: not backward compatable**
- upgrade dev dependent libs to latest version
* updated readme


### V2.12.0: merge  pull requests to make it work in new version of vscode.
### v2.11.0: minor changes on readme.md according to feedback in issues.
