## MetaWord

* SpaceWord: characters seperated by 'space'.
* Word: a group of (A-Za-z0-9_) or a group of other symbol characters.
* WordPart: a group of spaces, a part in a group of CamelCase (A-Za-z0-9_) characters (note: '_' is considered as word parts connector ), or a group of other symbol characters *)
    >CamelCase partial example:  
    > when find forward:  (start from begin ->) AB'Cdef'__gh'IJKL   AB'Cdef'__gh'ijkl
    > when find backward: AB'Cdef__'gh'IJKL (<-start from end)
    

### SpaceWord commands to moveCursor/select/delete word seperated by space:
* <kbd>alt</kbd>+<kbd>win/cmd</kbd>+<kbd>left/right</kbd>: to move cursor left/right by one space-word and set cursor at the begin/end of the word.
* <kbd>win/cmd</kbd>+<kbd>alt</kbd>+<kbd>shift</kbd>+<kbd>left/right</kbd>: to select to left/right by one space-word.
* <kbd>win/cmd</kbd>+<kbd>alt</kbd>+<kbd>backspace</kbd>: to delete one space-word left.
* <kbd>win/cmd</kbd>+<kbd>alt</kbd>+<kbd>del</kbd> or <kbd>win/cmd</kbd>+<kbd>alt</kbd>+<kbd>shift</kbd>+<kbd>backspace</kbd>: to delete one space-word right.

[*➭Feature Summary⮵*](https://github.com/metaseed/metaGo/blob/master/README.md#features-summary)
