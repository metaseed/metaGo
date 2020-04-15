# Sequiencial target charactors for MetaJumper

## Ripple Level
* 3 levels based on target chars number:
    - 1: surrounding paragraph(seperated by empty lines) in view port, if cursor at empty line, use para nearer(uper search first)
    - 2: viewport of current doc
    - 3...: all visible editors

> for 2,3... target chars: if the target is at the line end, use <dbd>Enter</kbd> to make it as three target chars.

show decorators only for current level, encorder charactors get by revmove charactors follows last target char of all levels, ~~note following chars in current level is usable if there is only one: code and fallowing char is the same.~~ deleted because if type fast for several following chars, would edit by mistake, so following chars are just used to narrow down search range, and user have to type decorator codes to go to target location;

when high level decorators shows low levels always show.