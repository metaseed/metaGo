> **MetaWord is part of [MetaGo extension](https://marketplace.visualstudio.com/items?itemName=metaseed.metago)**

## MetaWord

* SpaceWord: characters separated by 'space'.
* Word: a group of (A-Za-z0-9_) or a group of other symbol characters.
* WordPart: a group of spaces, a part in a group of CamelCase (A-Za-z0-9) characters, a part of '_' connected (A-Za-z0-9) characters, or a group of other symbol characters.
    > Examples:  
    > when find forward:  
    >   'AB|Cdef|\_\_gh|IJKL'  
    >   'AB|Cdef|\_\_gh|ijkl'  
    > when find backward:  
    >   'AB|Cdef\_\_|gh|IJKL' (<-start from end)  

### delete all left/right
* `shift+backspace`: delete all from the cursor to the line start.
* `shift+del`: delete all from the cursor to the line end.

### Word commands to moveCursor/select/delete by word

> we use all default vscode commands

> **note:**  
> default cursorWordEndRight would do this:   
> 'console|.log|(err|)|' and 'a|+=| 3| +5|-3| +| 7|' (planing to modify this)  
>
> default cursorWordStartLeft would do this:  
> 'this|.|is|.|a|.|test' and ' text| a|+=| 3| +|5|-|3| +| 7|' (work as expected)  
>
> default deleteWordLeft would do this:  
> '|this.|is.|a.|test" (planing to modify this)

* `ctrl+left/right`: move cursor to word start/end.
* `ctrl+shift+left/right`: select from cursor to word start/end.
* `ctrl+backspace/delete`: delete from cursor to word start/end.

### WordPart commands to moveCursor/select/delete by wordPart


### SpaceWord commands to moveCursor/select/delete word separated by space:
* <kbd>ctrl</kbd>+<kbd>alt</kbd>+<kbd>left/right</kbd>: to move cursor left/right by one space-word and set cursor at the begin/end of the word.
* <kbd>ctrl</kbd>+<kbd>alt</kbd>+<kbd>home(end</kbd>: to move cursor left/right by one space-word and set cursor at the begin/end of the word.
* <kbd>ctrl</kbd>+<kbd>alt</kbd>+<kbd>shift</kbd>+<kbd>left/right</kbd>: to select to left/right by one space-word.
* <kbd>ctrl</kbd>+<kbd>alt</kbd>+<kbd>backspace</kbd>: to delete one space-word left.
* <kbd>ctrl</kbd>+<kbd>alt</kbd>+<kbd>del</kbd> or <kbd>ctrl</kbd>+<kbd>alt</kbd>+<kbd>shift</kbd>+<kbd>backspace</kbd>: to delete one space-word right.

[*➭Feature Summary⮵*](https://github.com/metaseed/metaGo/blob/master/README.md#features-summary)
