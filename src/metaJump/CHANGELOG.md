# Change Log
All notable changes to the "metaJump" extension will be documented in this file.
## False Features
 - [x] ~~if there is only one location remains while user typing 'flowing chars', go to that location directly. (not have to type the decorator char 'k')~~ (removed because user may false edit the document if continue typing after jumping)
  ~~- [] after press alt+\ then Tab, the indicator is expanded, that means user could not search Tab, this is a bug.
  - [] if a Tab following a char searched, user could not type Tab to narrow down searching range.~~ [vscode.commands.registerCommand('Type', handler), handler can not be triggered by 'Tab' key](https://github.com/microsoft/vscode/issues/131124)
## Todo List:
 - [ ] remove svg decoration
 - [ ] add commands for single-target-char
 - [ ] command to navigate indent code tree. (alt+/ arrow)
## In Development
---
### V
#### Added
#### Removed

#### Changed
#### Fixed

#### Plan
## Current Version
---
### V 1.3.4 (not released)
#### Added
 - [x] support ripple config for sequential-target-command. enabled by default.
#### Removed
#### Changed
 - [x] make all the 'smart'(triggered by '/') commands use single target encoding. (note: the others are still multiple target encoding. we could config which command to use single-target-encoding)
 - [x] document work for the changes.
#### Fixed
 - [x] 'Return' key's target decorators could shown if press press multiple time. (ripple function not work.)
 - [x] could only show one-length decorators for multiple-target-location-chars commands.
#### Plan
 - [ ] command to navigate indent code tree. (alt+/ arrow)
---
### V1.3.0 Sep 28, 2021
#### Added
 - [x] Tab key could be used as a common target character
 - [x] add config for user to enable single-target-char support
 - [x] shrink extension size
 - [x] document work for modification
#### Removed

#### Changed
#### Fixed
- [x] fixed bug of displaying decorators in the Output panel of vscode <a href="https://github.com/metaseed/metaGo/issues/52">[#52]</a>
#### Plan
---
### V1.2.0 Aug 19, 2021
#### Added
 - [x] prepare for another major release
 - [x] add command 'shift+space' to hide decoration for a configurable time.
 - [x] upgrade typescript(4.3.5), webpack(5.50.0), and other packages to latest version
 - [x] add detail description about selection in readme.
#### Removed
 - [x] '/' currently is a normal char, not act as the default hide-decoration trigger, so remove the special handling for it as the target-sequence-char.(via setting the default metaGo.decoration.hide.triggerKey = '' in config)
#### Changed
#### Fixed
 - [x] fix decorators problem if hide-command character('/') is in the target-chars-sequence, it would be considered as the hide-command trigger.(this is the limitation of this hiding way, so we invent the hideDecorationCommand to overcome it)
#### Plan
 - [x] add option for user to enable/disable sequence-target-chars and ripple support when narrowing down target locations
---
### V1.1.0 June 18, 2020
#### Added
 - [x] add MetaJump.DeleteToSmart command( 'alt+d'): to delete from cursor to the position smartly <a href="https://github.com/metaseed/metaGo/tree/master/src/metaJump#delete-to-any-character">(detail)</a>
 - [x] add MetaJump.DeleteToBefore command( 'alt+backspace'): to delete from cursor to the position before the target character
 - [x] add MetaJump.DeleteToAfter command( 'alt+delete'): to delete from cursor to the position after the target character
 - [x] add delete command indicator: 'red block'
 - [x] add gif demo for delete commands <a href="https://github.com/metaseed/metaGo/tree/master/src/metaJump#delete-to-any-character">(detail)</a>
#### Removed
 - [x] remove findAllMode config
#### Changed
#### Fixed
 - [x] metaGo.selectSmart command: target cursor position is calculated by the same way as the metaGo.GotoSmart command

---
### V1.0.0 June 09, 2020
#### Added
 - [x] add metaJump.gif to show most features of metaJump
#### Removed
#### Changed
 - [x] MetaJump extracted from MetaGo as a separated vscode extension.
 - [x] rename insert* command to Add* command.
#### Fixed