
[![Version](https://vsmarketplacebadge.apphb.com/version/metaseed.metago.svg)](https://marketplace.visualstudio.com/items?itemName=metaseed.metago)
[![Installs](https://vsmarketplacebadge.apphb.com/installs/metaseed.metago.svg)](https://marketplace.visualstudio.com/items?itemName=metaseed.metago)
[![Ratings](https://vsmarketplacebadge.apphb.com/rating/metaseed.metago.svg)](https://marketplace.visualstudio.com/items?itemName=metaseed.metago)
[![Dependencies Status](https://david-dm.org/metaseed/metago/status.svg)](https://david-dm.org/metaseed/metago)
[![DevDependencies Status](https://david-dm.org/metaseed/metago/dev-status.svg)](https://david-dm.org/metaseed/metago?type=dev)
[![Known Vulnerabilities](https://snyk.io/test/github/metaseed/metago/badge.svg)](https://snyk.io/test/github/metaseed/metago)
[![Average time to resolve an issue](https://isitmaintained.com/badge/resolution/metaseed/metago.svg)](https://isitmaintained.com/project/metaseed/metago "Average time to resolve an issue")
[![Percentage of issues still open](https://isitmaintained.com/badge/open/metaseed/metago.svg)](https://isitmaintained.com/project/metaseed/metago "Percentage of issues still open")

---
<table align="center" width="60%" border="0">
  <tr>
    <td>
      <a href="https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=P9GXHBAAHPBMN&item_name=metago+dev&currency_code=USD&source=url">
          <img src="https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif"/>
      </a>
      <br>
    </td>
    <td>
	  <a href="./donate/index.md">
          <img src="./donate/scan.png" style="height: 66px;"/>
      </a>
    </td>
	<td>
	  <a href="https://join.slack.com/t/metaseedworkspace/shared_invite/enQtOTU5ODM1MTI2MDcwLWM5N2QzY2MzMTVjMjVlZDVjZTVmMDFjNmViNmE4MzE3NGM4Mzk5M2UwNDAwYjQ4ZGM5Y2U2YjdlMGM5MjJiNDQ">
		<img src="https://i.imgur.com/1QWdtcX.png" alt="Drawing" style="width: 150px;"/>
	  </a>
	</td>
  </tr>
</table>
<br>

<br>
<br>

Metago tries to be the best keyboard(mouseless) focused navigation tool in vscode.

quotes from users:
> [Wicked fast cursor movement/selection for a focus on keyboard usage. This changed how I use VS Code forever. Seriously.](https://spectrum.chat/frontend/general/favourite-vs-code-extensions~9ad33139-aa3a-4f8e-a640-d08ba08736b0)

> [This boosts my performance so much since It’s a trouble for me to use VIM (I’m leftie :( )](https://medium.com/@ColCh/i-found-also-these-plugins-very-helpful-in-my-work-df795a9e929f)

> [ probably the best tool for keyboard driven navigation bar none (better than vim), includes bookmarks](https://dev.to/fbnlsr/10-essential-extensions-for-vscode-174i#comment-node-140785)

> [MetaGo is a way to move your cursor to a position quickly and without using your mouse/trackpad.](https://scotch.io/starters/visual-studio-code/metago)

> [Oh, man.. I have a feeling that after that I'm going to feel crippled without it. This is fantastic.](https://www.reddit.com/r/vscode/comments/6wcucw/mouseless_setup/#t1_dm8ka1b)

> and MORE from you... 

With this new V3 released, we are going to add more features ([Changelog](./CHANGELOG.md)), peek features in dev:
* jumper commands for all opened editors
* hold <kbd>Space</kbd> to hide jumper decorators on screen.
* and more... contact with us on [SLACK☕](https://join.slack.com/t/metaseedworkspace/shared_invite/enQtOTU5ODM1MTI2MDcwLWM5N2QzY2MzMTVjMjVlZDVjZTVmMDFjNmViNmE4MzE3NGM4Mzk5M2UwNDAwYjQ4ZGM5Y2U2YjdlMGM5MjJiNDQ)

## Features
MetaGo provides fast cursor movement/selection for keyboard focused users:
* go to any character on screen with 3(most cases) or 4 times key press.
* using bookmarks to jump between files.
* moving cursor up/down between blank lines.
* select code block when moving cursor while hold shift key.
* scroll the active line (contains cursor) to the screen Top/Middle/Bottom.
* select line up/down.
* compatible with the vim plugins. :smile:

> if you like this tool, and using Windows, you may also be interested in my other tool: [**metaTool**](https://github.com/metatool/metatool). (release soon) :smirk:    
> with metatool running with it's metakeyboard plugin, you just using the 61 keys main keyboard area to type any key you want.
>
> i.e. to jump next blank line in the document, currently the default trigger is <kbd>Alt</kbd>+<kbd>End</kbd>, now you could use<kbd>LAlt</kbd>+<kbd>;</kbd>, because <kbd>LAlt</kbd>+<kbd>;</kbd> is expanded to <kbd>Alt</kbd>+<kbd>end</kbd>


### go to any character on screen
1. type <kbd>Alt</kbd>+<kbd>/</kbd> to tell I want to *go* somewhere.
2. type the character(stands for location) on screen, metaGo will show you some codes encoded with character.
3. type the code characters, you will *go* to that location.

> at any time press <kbd>ESC</kbd> to cancel


> the <kbd>Alt</kbd>+<kbd>.</kbd> command will trigger the metaGo.gotoAfter command, the cursor will be placed after the target character;    
> the <kbd>Alt</kbd>+<kbd>,</kbd> command will trigger the metaGo.gotoBefore command, the cursor will be placed before the target character;

> the <kbd>Alt</kbd>+<kbd>\/</kbd> command will trigger the metaGo.gotoSmart mommand which intelligently set cursor position after navigation:
> if the target is at the begin of the word, the cursor will be set before target character, otherwise after it;
> The 'word' is defined as a group of all alphanumeric or punctuation characters.
> MetaGo also provide commands that set cursor before/after the character after navigation, you can config the shortcut by yourself.

> After the decorators shows up on screen:
> * press <kbd>Enter</kbd> to directly go to the one before the current cursor positon;
> * press <kbd>Space</kbd> to directly go to the one after the current cursor position;

### select to any character on screen from cursor
1. type <kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>;</kbd> to tell I want to *select* to somewhere.
2. type the character(stands for location) on screen, metaGo will show you some codes encoded with character.
3. type the code characters, you will *select* to that location.
4. repeat 1-3 to adjust your current selection.
> at any time press <kbd>ESC</kbd> to cancel

![MetaGo.MetaJump](images/metago.jump.gif)

### features highlight
* code characters are based on priority, the easier to type character has higher priority. i.e. 'k','j', and code characters are configurable, if you like.
* code character decorator is encoded with 1 or 2 characters, the code characters around cursor are easier to type.
* only encode characters on viewable screen area, so metaGo is faster.
* even though your cursor is out of your viewable screen, metaGo still works!
* work with vim plugin

### navigate between files using bookmarks

* <kbd>Alt</kbd>+ <kdb>\'</kbd> to set a bookmark at the cursor location.
* <kbd>Alt</kbd>+ <kdb>[</kbd> goto previous bookmark.
* <kbd>Alt</kbd>+ <kdb>]</kbd> goto next bookmark
* <kbd>Alt</kbd>+<kdb>\\</kbd> to list the bookmarks and show management menu.
    1. press <kdb>cc</kbd> and <kbd>enter</kbd> to clear all the bookmarks
    2. press <kdb>c</kbd> and <kbd>enter</kbd> to clear all the bookmarks in current document.
    3. press <kdb>n</kbd> and <kbd>enter</kbd> to go to the next bookmark.
    4. press <kdb>p</kbd> and <kbd>enter</kbd> to go to the previous bookmark.

![MetaGo.Center](images/metago.bookmark.gif)

### scroll line to the screen center/top
* <kbd>Alt</kbd>+<kbd>m</kbd> is the default shortcut to scroll current line to screen center.
* <kbd>Alt</kbd>+<kbd>t</kbd> is the default shortcut to scroll current line to screen top.
* <kbd>Alt</kbd>+<kbd>b</kbd> is the default shortcut to scroll current line to screen bottom.

![MetaGo.Center](images/metago.center.gif)

### moving cursor up/down between blank lines
* <kbd>Alt</kbd>+<kbd>Home</kbd>(default shortcut) to move cursor to the blank line above.
* <kbd>Alt</kbd>+<kbd>End</kbd>(default shortcut) to move cursor to the blank line below.
* <kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>Home</kbd>(default shortcut) to select from the cursor to the blank line above.
* <kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>End</kbd>(default shortcut) to select from the cursor to the blank line below.
![MetaGo.blankLine](images/metago.blankLine.gif)

### select line up/down
* <kbd>Ctrl</kbd>+<kbd>i</kbd> to select line up.
* <kbd>Ctrl</kbd>+<kbd>shift</kbd>+i to select line down.

### jump to bracket
* extend the default jumpToBracket command.
* <kbd>ctrl</kbd>+<kbd>shift</kbd>+<kbd>\\</kbd>: jump to the begin bracket that contains the cursor. Press the shortcut *again* jump to the end bracket.

### Other resources that help you understand MetaGo

[Use MetaGo to Quickly Move Around Your Code in VS Code](https://scotch.io/starters/visual-studio-code/metago#toc-conclusion)

## Requirements

If you have any requirements or dependencies, add a section describing those and how to install and configure them.

## Default Shortcut Settings

           {
				"command": "metaGo.input.cancel",
				"key": "escape",
				"when": "editorTextFocus && metaGoInput"
			},
			{
				"command": "metaGo.gotoBefore",
				"key": "alt+,",
				"when": "editorTextFocus",
				"description": "goto the character and set the cursor before the character"
			},
			{
				"command": "metaGo.gotoAfter",
				"key": "alt+.",
				"when": "editorTextFocus",
				"description": "goto the character and set the cursor after the character"
			},
			{
				"command": "metaGo.gotoSmart",
				"key": "alt+/",
				"when": "editorTextFocus",
				"description": "goto the character and set the cursor smartly"
			},
			{
				"command": "metaGo.selectBefore",
				"key": "alt+shift+,",
				"when": "editorTextFocus",
				"description": "select to the cursor position before the character"
			},
			{
				"command": "metaGo.selectAfter",
				"key": "alt+shift+.",
				"when": "editorTextFocus",
				"description": "select to the cursor position after the character"
			},
			{
				"command": "metaGo.selectSmart",
				"key": "alt+shift+/",
				"when": "editorTextFocus",
				"description": "select to the cursor position smartly"
			},
			{
				"command": "metaGo.selectLineUp",
				"key": "ctrl+shift+l",
				"mac": "cmd+shift+l",
				"when": "editorTextFocus"
			},
			{
				"command": "metaGo.selectLineDown",
				"key": "ctrl+l",
				"mac": "cmd+l",
				"when": "editorTextFocus"
			},
			{
				"command": "metaGo.currentLineToCenter",
				"key": "alt+m",
				"when": "editorTextFocus"
			},
			{
				"command": "metaGo.currentLineToBottom",
				"key": "alt+b",
				"when": "editorTextFocus"
			},
			{
				"command": "metaGo.currentLineToTop",
				"key": "alt+t",
				"when": "editorTextFocus"
			},
			{
				"command": "metaGo.spaceBlockMoveUp",
				"key": "alt+home",
				"when": "editorTextFocus"
			},
			{
				"command": "metaGo.spaceBlockSelectUp",
				"key": "alt+shift+home",
				"when": "editorTextFocus"
			},
			{
				"command": "metaGo.spaceBlockMoveDown",
				"key": "alt+end",
				"when": "editorTextFocus"
			},
			{
				"command": "metaGo.spaceBlockSelectDown",
				"key": "alt+shift+end",
				"when": "editorTextFocus"
			},
			{
				"command": "metaGo.bookmark.toggle",
				"key": "alt+'",
				"when": "editorTextFocus"
			},
			{
				"command": "metaGo.bookmark.view",
				"key": "alt+\\",
				"when": "editorTextFocus"
			},
			{
				"command": "metaGo.bookmark.previous",
				"key": "alt+[",
				"when": "editorTextFocus"
			},
			{
				"command": "metaGo.bookmark.next",
				"key": "alt+]",
				"when": "editorTextFocus"
			},
			{
				"command": "metaGo.jumpToBracket",
				"key": "ctrl+shift+\\",
				"when": "editorTextFocus"
			}

To configure the keybinding, add the following lines to *keybindings.json* (File -> Preferences -> Keyboard Shortcuts):
## extension Settings
to modify default press <kbd>ctrl</kbd>+<kbd>,</kbd>, and search metago...

# default settings:
                "metaGo.decoration.backgroundColor": {
                    "type": "string",
                    "default": "Chartreuse,yellow",
                    "description": "one and two character decorator background color"
                },
                "metaGo.decoration.backgroundOpacity": {
                    "type": "string",
                    "default": "0.8"
                },
                "metaGo.decoration.borderColor": {
                    "type": "string",
                    "default": "#1e1e1e"
                },
                "metaGo.decoration.color": {
                    "type": "string",
                    "default": "blue"
                },
                "metaGo.decoration.width": {
                    "type": "number",
                    "default": 9
                },
                "metaGo.decoration.height": {
                    "type": "number",
                    "default": 15
                },
                "metaGo.decoration.fontSize": {
                    "type": "number",
                    "default": 13
                },
                "metaGo.decoration.x": {
                    "type": "number",
                    "default": 1
                },
                "metaGo.decoration.y": {
                    "type": "number",
                    "default": 12
                },
                "metaGo.decoration.fontWeight": {
                    "type": "string",
                    "default": "bold"
                },
                "metaGo.decoration.fontFamily": {
                    "type": "string",
                    "default": "Consolas"
                },
                "metaGo.decoration.upperCase": {
                    "type": "boolean",
                    "default": false
                },
                "metaGo.decoration.characters": {
                    "type": "string",
                    "default": "k, j, d, f, l, s, a, h, g, i, o, n, u, r, v, c, w, e, x, m, b, p, q, t, y, z"
                },
                "metaGo.jumper.findInSelection": {
                    "type": "string",
                    "default": "off"
                },
                "metaGo.jumper.targetIgnoreCase": {
                    "type": "boolean",
                    "default": true
                },
                "metaGo.jumper.timeout": {
                    "type": "number",
                    "default": "12",
                    "description": "timeout value in seconds to cancel metaGo jumper commands."
                },
                "metaGo.jumper.findAllMode": {
                    "type": "string",
                    "default": "on",
                    "description": "on: find all characters on viewable screen area; off: only search the first character of the words that are separated by chars configured in 'wordSeparatorPattern'"
                },
                "metaGo.jumper.wordSeparatorPattern": {
                    "type": "string",
                    "default": "[ ,-.{_(\"'<\\/[+]"
                },
                "metaGo.jumper.screenLineRange": {
                    "type": "number",
                    "default": 50,
                    "description": "how many lines could be showed in one screen"
                },
                "metaGo.bookmark.saveBookmarksInProject": {
                    "type": "boolean",
                    "default": false,
                    "description": "Allow bookmarks to be saved (and restored) locally in the opened Project/Folder instead of VS Code"
                },
                "metaGo.bookmark.gutterIconPath": {
                    "type": "string",
                    "default": "",
                    "description": "Path to another image to be presented as Bookmark"
                }

## Special Thanks To Contributers:

@nicchristeller
