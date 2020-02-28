# Sequiencial target charactors for MetaJumper

## Ripple Level
* 3 levels based on target chars number:
    - 1: surrounding paragraph(seperated by empty lines) in view port, if cursor at empty line, use para nearer(uper search first)
    - 2: viewport of current doc
    - 3...: all visible editors

> for 2,3... target chars: if the target is at the line end, use <dbd>Enter</kbd> to make it as three target chars.

show decorators only for current level, encorder charactors get by revmove charactors follows last target char of higher level, note follow chars in current level is usable.

when high level decorators shows low levels always show.