# Change Log
All notable changes to the "metaJump" extension will be documented in this file.

## Todo List:
 - [ ] remove svg decoration
 - [ ] fix space target char problem
## In Development
---
### V1.2.0 Aug 18, 2021
#### Added  
 - [] if there is only one location remains while user typing 'flowing chars', go to that location directly. (not have to type the decorator char 'k')
 - [] add command shift+space to show/hide decorators.
#### Removed
 - [] '/' currently is a normal char, not act as hide-command trigger, so remove the special handling for it as the first target-sequence-char.
#### Changed
#### Fixed
 - [] fix selection problem:  extending, shrinking, changing active selection
 - [] fix decorators problem if hide-command character('/') is in the target-chars-sequence, it would be considered as the hide-command trigger.
 - [] after press alt+\ then Tab, the indicator is expanded, that means user could not search Tab, this is a bug.
 - [] if a Tab following a char searched, user could not type Tab to narrow down searching range.

## Current Version
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