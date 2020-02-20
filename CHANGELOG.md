# Change Log
All notable changes to the "metago" extension will be documented in this file.

## Todo List:
   - [ ] close issues.
   - [ ] add useful my command config into package.json. i.e. Ctrl+Alt+back to delete small word left

---     
## In Development
### V3.1.0
#### Added
* jumper could goto any opened editors not just the active editor.
#### Removed

#### Changed
* replace Promise with async/await in Metajump
* updated readme
---

## Released
### V3.0.0 - Feb 19, 2019
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
