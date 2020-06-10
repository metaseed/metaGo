[![Version](https://vsmarketplacebadge.apphb.com/version/metaseed.metaword.svg)](https://marketplace.visualstudio.com/items?itemName=metaseed.metaword)
[![Installs](https://vsmarketplacebadge.apphb.com/installs/metaseed.metaword.svg)](https://marketplace.visualstudio.com/items?itemName=metaseed.metaword)
[![Ratings](https://vsmarketplacebadge.apphb.com/rating/metaseed.metaword.svg)](https://marketplace.visualstudio.com/items?itemName=metaseed.metaword)
[![](https://img.shields.io/badge/TWITTER-%40metaseed-blue.svg?logo=twitter&style=flat)](https://twitter.com/metaseed)
[![](https://img.shields.io/badge/gitter-join_chat-1dce73.svg?style=flat&logo=gitter-white)](https://gitter.im/vscode-metago/community)

**the Goal of MetaWord is providing different kinds of words based cursorMove/Select/Delete commands.**

> **MetaWord is part of [MetaGo extension](https://marketplace.visualstudio.com/items?itemName=metaseed.metago)**
<table align="center" width="68%" border="0">
  <tr>
    <td>
      <a href="https://github.com/sponsors/metasong">
          <img src="https://github.com/metaseed/metaGo/blob/master/donate/githubSponsors.png?raw=true" style="height: 66px;" />
      </a>
    </td>
    <td>
      <a href="https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=P9GXHBAAHPBMN&item_name=metago+dev&currency_code=USD&source=url">
          <img src="https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif"/>
      </a>
      <br>
    </td>
    <td>
      <a href="https://github.com/metaseed/metaGo/blob/master/donate/index.md">
          <img src="https://github.com/metaseed/metaGo/blob/master/donate/scan.png?raw=true" style="height: 66px;"/>
      </a>
    </td>
  </tr>
</table>
<br>

## MetaWord
|word type|description|
|---|---|
|SpaceWord(BigWord)| characters separated by 'space'('Space' or 'Tab')|
|Word|a group of alphanumeric character with underscore(A-Za-z0-9_) or a group of other symbol characters(i.e. ~!@#$%^&*()-+:;"',.<>/?\[]{})|
|WordPart(SmallWord)| a group of spaces, a part in a group of CamelCase (A-Za-z0-9) characters, a part of '_' connected (A-Za-z0-9) characters, or a group of other symbol characters|

* <kbd>shift</kbd>+<kbd>backspace</kbd>: delete all from the cursor to the line start.
* <kbd>shift</kbd>+<kbd>del</kbd>: delete all from the cursor to the line end.

### Word commands to moveCursor/select/delete by word

> we use the default vscode 'Word' commands

> **note:**  
> default vscode cursorWordEndRight command would do this:   
> '|console|.log|(err|)|' and 'a|+=| 3| +5|-3| +| 7|' (if there is only one symbol character before the next word, the cursor would not stop after the symbol)  
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

### WordPart commands to moveCursor/select/delete by wordPart
> Examples:  
> * when forward:  
>   * '|AB|Cdef|\_\_gh|IJKL|'  
>   * '|AB|Cdef|\_\_gh|ijkl|'  
> * when backward:  
>   * '|AB|Cdef\_\_|gh|IJKL|' (<-start from end)  

> note: the word connector('_') character is not stopped.  

* <kbd>ctrl</kbd>+<kbd>alt</kbd>+<kbd>left/right</kbd>: move cursor left/right to the wordPart start/end.
* <kbd>ctrl</kbd>+<kbd>alt</kbd>+<kbd>shift</kbd>+<kbd>left/right</kbd>: left/right select from cursor to the wordPart start/end.
* <kbd>ctrl</kbd>+<kbd>alt</kbd>+<kbd>backspace</kbd>: left delete to the wordPart start.
* on windows <kbd>ctrl</kbd>+<kbd>alt</kbd>+<kbd>shift</kbd>+<kbd>backspace</kbd>: right delete to the wordPart end.(note: `ctrl+alt+del` on windows is a system shortcut, we could not use it)  
    > on Mac use <kbd>ctrl</kbd>+<kbd>alt</kbd>+<kbd>delete</kbd>

### SpaceWord commands to moveCursor/select/delete word separated by space:
* <kbd>win/cmd</kbd>+<kbd>alt</kbd>+<kbd>left/right</kbd>: move cursor left/right by one space-word and set cursor at the begin/end of the word.
* <kbd>win/cmd</kbd>+<kbd>alt</kbd>+<kbd>shift</kbd>+<kbd>left/right</kbd>: select to left/right by one space-word.
* <kbd>win/cmd</kbd>+<kbd>alt</kbd>+<kbd>backspace</kbd>: delete one space-word left.
* <kbd>win/cmd</kbd>+<kbd>alt</kbd>+<kbd>del</kbd>: delete one space-word right.

* <kbd>win/cmd</kbd>+<kbd>alt</kbd>+<kbd>home/end</kbd>: move cursor left/right by one space-word and set cursor at the begin/end of the spaces surrounding the word.
* <kbd>win/cmd</kbd>+<kbd>alt</kbd>+<kbd>shift</kbd>+<kbd>home/end</kbd>: select to left/right by one space-word, spaces before/after the word is selected too.
* <kbd>win/cmd</kbd>+<kbd>alt</kbd>+<kbd>shift</kbd>+<kbd>backspace</kbd>: delete one space-word left, spaces before the word are also deleted.
* <kbd>win/cmd</kbd>+<kbd>alt</kbd>+<kbd>shift</kbd>+<kbd>del</kbd>: delete one space-word right, spaces after the word are also deleted.

## Note
we modified several default command vscode command's shortcut, because we want to use it to do word based cursorMove/select/delete.
* `ctrl+alt+left/right` by default is used by "workbench.action.moveEditorToPreviousGroup/NextGroup", so we assign `ctrl+k ctrl+left/right` to do the editor movement.
* `ctrl+alt+shift+left/right` by default is used by "cursorColumnSelectLeft/Right" command, we think of a solution to do column based vertical selection:
    > <kbd>alt</kbd>+<kbd>v</kbd>: toggle vertical column selection mode.  
    > `alt+v` to enter vertical column selection model, then press `shift+left/right/up/down` as needed to do column mode selection.

[*➭MetaGo Feature Summary⮵*](https://github.com/metaseed/metaGo/blob/master/README.md#features-summary)

