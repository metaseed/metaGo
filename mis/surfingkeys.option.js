    /// the url of this file: https://raw.githubusercontent.com/metaseed/metaGo/refs/heads/master/mis/surfingkeys.option.js

    // config doc for:
    // https://github.com/brookhong/Surfingkeys?tab=readme-ov-file#table-of-contents
    // default mappings code:
    // https://github.com/brookhong/Surfingkeys/blob/master/src/content_scripts/common/default.js
    // https://github.com/brookhong/Surfingkeys/src/content_scripts/common/default.js

    // Microsoft Edge Shortcuts:
    // https://support.microsoft.com/en-us/microsoft-edge/keyboard-shortcuts-in-microsoft-edge-50d3edab-30d9-c7e4-21ce-37fe2713cfad


    settings.showTabIndices = true; // index on tab header, default false
    /*
    # Browser shortcuts and tips
    * ctrl+shift+b: toggle bookmark bar
    * ctrl+shift+o: open bookmark manager(obb )
    * ctrl+d: bookmark current page, (ab/-b is better, note: b to open from bookmark)
    > note: the surfingkeys do not have direct way to edit a bookmark(or edit an entry in omnibar)

    * ctrl+h: open history
    * ctrl+j: open downloads

    * ctrl+shift+a(use T instead): open a tab by search, note:  not usable by keyboard to select a item
    * alt+d(or ctrl+l): select url in address bar and edit, type to search from bookmark history and tabs, or type something and press enter to search with default search engine.

    * ctrl+shift+k: dup current tab
    * ctrl+t: new tab
    * ctrl+n: new window
    * ctrl+shift+n: new incognito window

    * ctrl+m: toggle mute current tab

    * home: scroll to top. note: the browser is not in caret mode(F7 to toggle)
    * end: scroll to bottom. note: not in caret mode
    * space(pageDown): per screen scroll down, shift+space(pageUp): scroll up
    * F5(ctrl+r): reload current page, ctrl+F5: reload current page without cache
    * F6: the focus moves in a clockwise loop through the main regions of the interface(address bar, bookmarks bar, web content, status bar, tab strip), shift+F6: the focus moves in a counterclockwise loop.
    * Ctrl+F6: move focus to web content pane
    * F7: toggle caret browsing, use arrow key to move the caret, and use shift+arrow key to select text.
        > note: for selecting text, we can ctrl+f to find text, use 'enter'/'shift+enter' to navigate, and then F7 to show caret, shift+left/right to select the text, then 'app'/'shift+F10' to open context menu... or press 'ssg' to search selected text with google.
        > for surfingkey, we can use '/' to find text and 'n'/'N' to navigate, then 'v' to enter visual mode, and use h/j/k/l to select text, then 'y' to copy.
        > surfingKey also support regular expression search, i.e. '/\bword\b' to find the whole word match.
    * F10(same as 'alt'): focus setting(...) menu, then enter to open, use arrow key to navigate, and enter to select
    * F11: toggle full screen
    * shift+F10: open context menu same as 'app' key.
    * F12(ctrl+shift+i): open developer tools

    # DEBUG:
    to debug, see errors in console, and from stack look at rmap(in this file),
    in 'api.js' find '[SurfingKeys] Error found in settings'
    search '.mappings.add(' in 'content.js' to view the mapping tree
    */
    // with the log from this file, we can find three files on the left 'content script' panel.
    // console.log(
    //   "%c MY SURFING-KEY MAPPING CONFIG",
    //   "background: linear-gradient(to right, #ff00cc, #3333ff); color: #fff; padding: 5px 10px; font-size: 16px; font-weight: bold; border-radius: 8px; border: 2px solid #fff; text-shadow: 2px 2px 0px #000;"
    // );
    /*
    CKAR: Common Key Action Rule of binding/mapping/shortcut

    # Help
    F1  or ?: help

    # HotKeys:
    command grammar:
    [number of repeat][action verb][adv][position(index or time)][object][near adjective][far adjective]
    > position is special adv to to verb, and special adj to obj, so put it in middle, if the verb is 'goto', the verb can be omitted.

    * all command could be prefix with numbers to repeat.
    * the prefix number for 'to' command is the object index in collection
    * if the action verb is omitted, it's the default verb 'goto'.
    * adverb: i.e. move *in/out*

    ##  example:
    > .t: next tab : goto next
    > x.: close next tab : the next-location, tab is used frequently, so give it priority as default, no need to type `x.t`
    > x.c: close connection at next (next connection)
    > x.cd: close next connection of dead (next dead connection)
    > when the obj is default 2 times the verb is easier to type:
    > yy: copy current page's url, easy to type.
    > use upper case for obj undo:
    > 'h: display hover, 'H: un-display hover(': a position adv, means pick one from collection, normally via hint)

    > verb with adv(like obj with adj)
    > \i: move in
    > \o: move out

    ## Navigation adv in collection or tree
    > if start with navigation adv, the default 'goto' verb can be omitted for navigation in collection or tree.

    ### 1 dimension collection
    ,: previous ('<' on the key)
    .: next ('>' on the key)
    [: first
    ]: last

    ### obj only
    {: all on left
    }: all on right, (.. is not good as when . also an adj, if there is default obj, it will override the '..' coding)
    /: all
    ?: others, except the current one

    ### tree: multiple dimension collection
    <: to parent (go out tree: parent or previous sibling if no parent(root level siblings))
    >: to child (go into tree: first child of the parent or next sibling if no children)
    [: first sibling
    ]: last sibling
    .: next sibling
    ,: previous sibling
    |:root
    ': pick, i.e. with hint
    > ' is the general go, maybe helped with hint for select/focus/jump, or select from omnibar
    > i.e. `p: goto playing tab

    ### combined position
    ],: end-second, (goto)length-2, i.e. }[': the last used tab,
    [.: second



    ## action verbs
    > default(omitted if with position):goto, still need for 'goto playing tab', 'goto scrollable element', can be replaced by '.'(next) if no position
    a: add,new(create), increase, (better than the '='the '+' on the key, make it as set),
    c: click
    d: display, show
    e: edit
    g: get(restore, download). _:(not used) download from up(cloud)
    r: restore; reset;reload;refresh, also for rare action, we may use Upper case of action for opposite meaning, to save char space to other actions.
    (0: is not good, hard to type and can not do command repeat: 20z: is 20 times z, not 2 times reset of z)
    o: open
    q:
    s: search, query, select chars
    x: close
    -: remove,decrease
    r: undo, reset, reload, refresh, cancel
    \: move
    `: toggle: toggle + action, toggle + object
    /: find('?' on the key), note: it's reserved by surfing-keys as find on current page
    =: set, save
    ?: (not used), for help originally

    y: yank(copy)
    p: paste
    ;: not used(for future use, user can use this easy-to-type key as prefix for custom command)

    // here used for scroll same as vim
    k: up
    j: down
    l: right
    h: left

    ## other keys can be used

    # Tips
    i: go to edit box, I: go to edit box with vim editor
    D: dictionary, 'sd': search word in dictionary
    f: click a link with hint, press SHIFT to flip overlapped hints, hold SPACE to temporarily hide hints
    i: focus input if only one, or with hint if multiple.
    v: visual mode for selection; V: escape visual mode
    t: switch tab of all windows, filter via input box, or open url from bookmark/history.
    T: switch tab
    :: show command input box.
    E: edit with vim
    b: bookmark
    H: history of current tab
    0: scroll to leftmost, $: scroll to rightmost.
    L: regional Mode
    ": repeat last action
    :: input command
    > omnibar note:
    ctrl+enter to open several from list, shift+enter to open in current tab, enter to open in new tab, ctrl+d to delete, ctrl+, and ctrl+. to page
    ## objs
    w: window
    s: scrollable element

    */

    keyMaps = [
        // format: [usedSequence, originalSequence, isRemoveOriginal, newAnnotation]
        // isRemoveOriginal: default false,
        //      but default to true if !usedSequence && !!originalSequence
        // newAnnotation: if start with '#groupIndex', can put the command into the 'groupIndex' group in help popup.
        // Group Index: 0:help, 1: Mouse Click, 2: Scroll, 3: Tabs, 4: Page Navigation, 5: Sessions, 6: Search Selected with, 7: Clipboard, 8: Omnibar, 9: Visual Model, 10: vim-like marks, 11: Settings, 12: Chrome URLs, 13: Proxy, 14: Misc, 15: Insert Mode

        // we can put all unmap in the beginning, note: later the unmapped key is still useable for remapping.
        ['<F1>', '?', true, `#0 Show Help Page`], // toggle help popup

        [, 'r'], // r is originally as reload current page, use 'rr' for reload, so unmap 'r' as make it a verb of reload, reset
        [, 'u'],//api.unmap('u'); // u is used for undo
        // what is the diff? with ctrl-`
        ["??'", "'", true],//api.unmap("'");  and to temp var // ' is used for goto. original: Jump to vim-like mark
        // note: ["''", "'", true] not working, so have to walk around with temp var, same for ['rr', 'r', true] and ['xx', 'x', true]
        ["''", "??'", true],
        [, 'zi'], // zoom in, use ctrl-= instead
        [, 'zo'],// zoom out; use ctrl--
        [, 'zr'], //reset zoom; use 'ctrl-0'
        // [',h', 'S', true],
        [, 'S'], // previous in history (of current tab)(is adj), `alt+left`, ,h is not used
        //['.h', 'D', true],
        [, 'D'], // next in history of current tab, `alt+right`, '.h' is not used
        /// goto(default verb - omitted)
        //[',t', 'R', true],
        [, 'R'],// switch to the tab right, `ctrl+tab`, ',t' is not used
        //['.t', 'E', true],
        [, 'E'],// switch to the tab left, `ctrl+shift+tab`, '.t' is not used
        // note: ctrl+9(chrome shortcut) is goto the last tab, and ctrl+1,2... are goto the 1st, 2nd... tab
        ['"', '.', true], // repeat last action, should be before any use of the '.' as start key.
        // ['[t', 'g0', true], // first tab, use ctrl+1
        [, 'g0'],
        // [']t', 'g$', true],
        [, 'g$'], // last tab, use ctrl+9

        ['[i', 'gi', true], // first input
        ['|e', ';w', true], // focus window(root) level element (<body>)

        ['.s', 'cs', true], // change scrollable target.

        /// ': tab-switching-history, tab-switching-history is not modified after executing these commands.
        // used, used, used, active
        ["['", 'gT', true, 'tab-switching-history[0]: the first(start)'],
        ["]'", 'gt', true, 'tab-switching-history[length-1]: the last(end) tab'],
        ["],'", '<Ctrl-6>', true, 'tab-switching-history[length-2]: goto last(previous) used tab'],
        [",'", 'B', true, 'tab-switching-history[current-index -1]: backward'],
        [".'", 'F', true, 'tab-switching-history[current-index + 1]: forward'],
        ['.f', 'w', true, 'goto frame'],

        ['<u', 'gu', true], // go up one path in url
        ['|u', 'gU', true], // goto root url

        // pick from collection...
        ["'h", '<Ctrl-h>', true], // display hint for hover
        ["'H", '<Ctrl-j>', true], // un-display hint for hover
        ["'s", ';fs', true], // focus scrollable elements
        ["'p", 'gp', true], // goto play tab

        // click
        ["ci", 'q', true, `#1Click image|button(interactive element)`], // click image or button
        // add
        //['at', 'on', true],// new tab; use: ctrl-t and ctrl-n: new window

        // remove
        ['-h', ';dh', true], // delete history older than 30 days
        ['-b', ';db', true], // remove bookmark of this page

        // ['sb', 'ob', true],
        // ['sb', 'oh', true],
        // ['sg', 'og', true],
        // ['sd', 'od', true],
        // ['sw', 'ow', true],
        // ['sy', 'oy', true],

        // select element
        ["se", 'zv', true], // display hint for visual mode element selection, then type 'y' to copy

        // open
        // ['&', 'H', false, 'open from tab history of new tab'], // open from tab history of new tab
        // ['os', 'se', true, '#11Open settings'],
        ['oba', 'ga', true], // open browser about
        ['obb', 'gb', true], // open browser bookmark
        ['obc', 'gc', true], // open browser cache
        ['obd', 'gd', true], // open browser download
        ['obh', 'gh', true], // open browser history
        ['obk', 'gk', true], // open browser cookies
        ['obe', 'ge', true], // open browser extensions
        ['obn', 'gn', true], // open browser net-internals
        ['obs', 'gs', true], // open browser page source
        ['obi', ';i', true], // open browser inspect
        ['om', 'om', false, `#10open from vim-marks`], //  open from vim-marks,
        ['ov', ';v', true], //open neovim, for me not used

        // f: fast open a url, press SHIFT to flip overlapped hints, hold SPACE to hide hints
        // t: open a url in new tab
        ['oo', 'go', true], // open url in current tab
        ['oumt', 'cf', true], // open multiple urls in non-active tab
        ['out', 'gf', true], // open the url in non-active tab with hint
        ['ouT', 'af', true], // show hint for urls and open it in new tab with hint
        ['oux', 'ox', true], // open recently closed url
        // close
        // X: restore closed tab(ctrl-shift-t)
        // ['xx', 'x', true], // close current tab (use ctrl-w instead)
        [, 'x'],
        ['xd', ';j', true], // close download shelf
        ['x}', 'gx$', true],// close all on the right
        ['x{', 'gx0', true],// close all on the left
        ['x,', 'gxt', true],
        ['x.', 'gxT', true],
        ["x?", 'gxx', true], // close others(all except current)
        ['xp', 'gxp', true], // close playing tab

        // move
        ['\\,', '<<', true], // move tab left
        ['\\.', '>>', true], // move tab right
        // move out
        ['\\o', 'W', true], // move tab out to new window or selected window
        // move in
        ['\\ia', ';gw', true],// move all tabs into current window
        ['\\if', ';gt', true], // move filtered tabs(type to filter) into current window

        // copy(yank)
        // [, 'yt'], // remove duplicate current tab, use ctrl-shift-k instead
        ['yt', 'yT', true], // duplicate current tab in background
        ['ypf', 'yp', true], // yank form data for post
        ['ypi', ';cp', true], // yank proxy info
        ['yss', 'yj', true], //yank surfingkey settings
        // yank-browser verb
        ['ybh', ';yh', true], // yank browser history
        // yank-page verb
        ['yps', 'ys', true],// yank page source
        ['yph', 'yh', true],// yank page host url part
        ['ye', 'yi', true],// yank text of an input
        // screen shot, yank image, After one of above shortcuts pressed, you could see a popup of captured image
        ['yif', 'yG', true],// yank the full page image
        ['yis', 'yS', true], // yank scrolling element image
        ['yic', 'yg', true], // yank current screen image

        // paste
        ["P", 'p', true], // ephemeral pass-through-mode, auto quit after 1 second
        ['pp', ';ap', true], // apply proxy info from clipboard
        ['pf', ';pf', true], // fill form with data from yf
        ['ph', ';pp', true],// paste html on current page
        ['pbh', ';ph', true],// paste into browser history(from 'ybh')
        ['pss', ';pj', true],// paste surfingkey settings

        //reload, refresh, reset, read
        // ['rr', 'r', true], // ctrl-r and F5
        [, 'r'],
        ['rs', 'cS', true], // reset scrollable target
        ['r#', 'g#', true], // reload without hash
        ['r?', 'g?', true], // reload without query string

        // undo, unset, clear
        ['rh', ';m', true], // unhover
        // ['rc', 'X'], // undo tab close, same as  'ctrl-shift-t'
        [, 'X'],
        ['rt', 'gr', true],// read text(selected or in clipboard)
        ['ruq', ';cq', true], // clear the url queue,(the front and backed use this url queue to open url: browser pages, any url to open)

        // set, save,
        ['=pa', ';pa', true], // set proxy mode 'always'
        ['=pb', ';pb', true], // set proxy mode 'byhost'
        ['=pd', ';pd', true], // set proxy mode 'direct'
        ['=ps', ';ps', true], // set proxy mode 'system'
        ['=pc', ';pc', true], // set proxy mode 'clear'
        ['=s', 'ZZ', true, '#5Save session and quit'],

        // toggle
        ['`pt', '<Alt-p>', true], // toggle pinning current tab
        ['`pr', 'cp', true], // proxy
        // ['`m', '<Alt-m>', true], // mute, use ctrl-m
        [, '<Alt-m>'],
        ['`pd', ';s', true, `#0Enable/Disable surfingkey's pdf viewer`], // toggle surfingKeys's pdf viewer
        // in readme.md: toggle surfkey: hotkey must be one keystroke with/without modifier, it can not be a sequence of keystrokes like `gg`.
        // as described in below link, hotkey can not be sequence key
        // https://github.com/brookhong/Surfingkeys?tab=readme-ov-file#hotkey-to-toggle-surfingkeys
        ["<Alt-t>", '<Alt-s>', true, `#0Always Enable/Disable SurfingKey on current url`], // toggle surfkey on current site, defined in: Mode.specialKeys

        // should after toggle surfkey '<Alt-s>' is replaced
        // [,'d'], // d is used for scroll half page down by default
        ['<Alt-s>', 'd', true], // scroll half page down, before any use of 'd' as start key.
        ['<Alt-w>', 'e', true], // scroll half page up

        // display, show;
        // should be after the 'd' is replaced
        ['dl', ';ql', true, `#14Show Last Action`], // show last action
        ['dm', ';pm', true], // preview markdown
        // edit, should after old key of 'e'(scroll half page up) is replaced
        // ['E', 'I', true],// goto edit box with vim editor
        // ['ee', 'i', false], // the 'i' is still usable for goto the first input.
        ['eut', ';u', true, '#5edit url with vim and open in new tab'],
        ['eul', ';U', true, '#5edit url and load'],
        ['eo', ';e', true],

        // scroll
        // use the default vim way now: 'h','j','k','l'
        // ['i', 'k', true],// up
        // ['k', 'j', true], // down
        // ['j', 'h', true], // left
        // l: right; the same as default
        // note: the function of scroll to top/bottom of surfingkeys is better than browsers, it differentiate scroll target, and can switch scroll target.
        ['<End>', 'gg'],
        ['<Home>', 'G'],
        // ['L', '$', true], // scroll to right most
        // ['J', '0', true], // scroll to left most
        //20%: scroll down to the 20% position


        // get, restore
        ['gi', ';di', true, 'Get(download) image'], // download image
        ['gs', 'ZR', true, '#5Restore(get) last saved session'],
        // search, query
        ["sd", 'cq', true],// querying word in word-dictionary
        ["st", ';t', true], // translate selection with google

        // should be after all old key start with ';' are replaced
        // [';', '', true],//
        // mis
        ['D', 'Q', true], //dictionary
    ];

    api.removeSearchAlias('g');// remove default search alias for google
    api.removeSearchAlias('d');// remove default search alias for duckduckgo
    api.removeSearchAlias('b');// remove default search alias for baidu
    api.removeSearchAlias('e');// remove default search alias for wikipedia
    api.removeSearchAlias('w');// remove default search alias for bing
    api.removeSearchAlias('s');// remove default search alias for stackoverflow
    api.removeSearchAlias('h');// remove default search alias for github
    api.removeSearchAlias('y');// remove default search alias for youtube

    api.addSearchAlias('sg', 'google', 'https://www.google.com/search?q=', 's', 'https://www.google.com/complete/search?client=chrome-omni&gs_ri=chrome-ext&oit=1&cp=1&pgcl=7&q=', function (response) {
        var res = JSON.parse(response.text);
        return res[1];
    });
    api.addSearchAlias('sd', 'duckduckgo', 'https://duckduckgo.com/?q=', 's', 'https://duckduckgo.com/ac/?q=', function (response) {
        var res = JSON.parse(response.text);
        return res.map(function (r) {
            return r.phrase;
        });
    });
    api.addSearchAlias('sb', 'baidu', 'https://www.baidu.com/s?wd=', 's', 'https://suggestion.baidu.com/su?cb=&wd=', function (response) {
        var res = response.text.match(/,s:\[("[^\]]+")]}/);
        return res ? res[1].replace(/"/g, '').split(",") : [];
    });
    api.addSearchAlias('se', 'wikipedia', 'https://en.wikipedia.org/wiki/', 's', 'https://en.wikipedia.org/w/api.php?action=opensearch&format=json&formatversion=2&namespace=0&limit=40&search=', function (response) {
        return JSON.parse(response.text)[1];
    });
    api.addSearchAlias('sw', 'bing', 'https://www.bing.com/search?setmkt=en-us&setlang=en-us&q=', 's', 'https://api.bing.com/osjson.aspx?query=', function (response) {
        var res = JSON.parse(response.text);
        return res[1];
    });
    api.addSearchAlias('ss', 'stackoverflow', 'https://stackoverflow.com/search?q=', 's');
    // the default 'h' is used in 'oh' command for history.
    api.addSearchAlias('su', 'github', 'https://github.com/search?q=', 's', 'https://api.github.com/search/repositories?order=desc&q=', function (response) {
        var res = JSON.parse(response.text)['items'];
        return res ? res.map(function (r) {
            return {
                title: r.description,
                url: r.html_url
            };
        }) : [];
    });
    api.addSearchAlias('sy', 'youtube', 'https://www.youtube.com/results?search_query=', 's',
        'https://clients1.google.com/complete/search?client=youtube&ds=yt&callback=cb&q=', function (response) {
            var res = JSON.parse(response.text.substr(9, response.text.length - 10));
            return res[1].map(function (d) {
                return d[0];
            });
        });
    // search dictionary
    // https://github.com/brookhong/Surfingkeys/wiki/Register-inline-query#what-is-inline-query
    api.Front.registerInlineQuery({
        url: function (q) {
            return `http://dict.youdao.com/w/eng/${q}/#keyfrom=dict2.index`;
        },
        parseResult: function (res) {
            var parser = new DOMParser();
            var doc = parser.parseFromString(res.text, "text/html");
            var collinsResult = doc.querySelector("#collinsResult");
            var authTransToggle = doc.querySelector("#authTransToggle");
            var examplesToggle = doc.querySelector("#examplesToggle");
            if (collinsResult) {
                collinsResult.querySelectorAll("div>span.collinsOrder").forEach(function (span) {
                    span.nextElementSibling.prepend(span);
                });
                collinsResult.querySelectorAll("div.examples").forEach(function (div) {
                    div.innerHTML = div.innerHTML.replace(/<p/gi, "<span").replace(/<\/p>/gi, "</span>");
                });
                var exp = collinsResult.innerHTML;
                return exp;
            } else if (authTransToggle) {
                authTransToggle.querySelector("div.via.ar").remove();
                return authTransToggle.innerHTML;
            } else if (examplesToggle) {
                return examplesToggle.innerHTML;
            }
        }
    });

    function reMap(newKey, oldKey, ummapOldKey, domain, annotation) { // replacing map
        if (!!newKey && !!oldKey) {
            api.map(newKey, oldKey, domain, annotation);
        }

        // ['na','ob', true]//remove
        // ['na','ob']//keep
        // [,'ob']//remove
        if (!!ummapOldKey || !newKey && !!oldKey) {
            api.unmap(oldKey);
        }
        //console.log("rmap", api)
    }

    function reMap_InsertMode(newKey, oldKey, ummapOldKey, domain, annotation) {
        if (!!newKey && !!oldKey) {
            api.imap(newKey, oldKey, domain, annotation);
        }

        if (!!ummapOldKey || !newKey && !!oldKey) {
            api.iunmap(oldKey);
        }
    }

    function reMap_Omnibar(newKey, oldKey, ummapOldKey, domain, annotation) {
        if (!!newKey && !!oldKey) {
            api.cmap(newKey, oldKey, domain, annotation);
        }

        // if (!!ummapOldKey || !newKey && !!oldKey) {
        //     api.cunmap(oldKey); // no cunmap to remove shortcut
        // }
    }


    /// move this section to end, because the 'ss' processed in the above searching section, and the 'ss' is mapped to 'ZZ'

    keyMaps.forEach(map => {
        reMap(map[0], map[1], map[2], undefined, map[3]);
    });
    // ['xx', 'x', true] not work, so do walk around with below or use temp var like the["''", "'"] above.
    // api.mapkey('xx', '#3Close current', function () { api.RUNTIME("closeTab") });
    // ['rr', 'r', true] not work, so do walk around
    // api.mapkey('rr', '#4Reload the page', function () { api.RUNTIME("reloadTab", { nocache: false }); }); // not used use F5 or ctrl-r instead.
    // reference the note on the top of this file for debugging tips.
    console.log(
        "%cSurfingKeys%cConfig Loaded",
        "background: #222; color: #0f0; padding: 5px; border-radius: 5px 0 0 5px; border: 1px solid #0f0; font-weight: bold;",
        "background: #0f0; color: #222; padding: 5px; border-radius: 0 5px 5px 0; border: 1px solid #0f0; font-weight: bold;"
    );


    /*
    # insert mode
    > Attention: have to use <Alt-d> instead of <alt-d>, case sensitive.
    */
    insertModeKeyMaps = [
        [, '<Ctrl-e>'], // unmap: move to the end of input, use 'end' key
        [, '<Ctrl-a>'], // unmap: move to the beginning of input, use 'home' key
        //delete from cursor to the end of input, use 'shift+end' and 'delete' key
        [, '<Ctrl-u>'], // unmap: delete from cursor to the beginning of input, use 'shift+home' and 'delete' key
        [, '<Alt-b>'], // unmap: move left one word, use 'ctrl+left' key
        [, '<Alt-f>'], // unmap: move right one word, use 'ctrl+right' key
        [, '<Alt-d>'], // unmap: delete right one word, use 'ctrl+shift+right' and 'delete' key or directly use 'ctrl+delete' key
        [, '<Alt-w>'], // unmap: delete left one word, use 'ctrl+shift+left' and 'delete' key or directly use 'ctrl+backspace' key
    ];
    insertModeKeyMaps.forEach(map => {
        reMap_InsertMode(map[0], map[1], map[2], undefined, map[3]);
    });

    omnibarKeyMaps = [
        ['<PageUp>', '<Ctrl-,>'],
        ['<PageDown>', '<Ctrl-.>'],
    ];
    omnibarKeyMaps.forEach(map => {
        reMap_Omnibar(map[0], map[1],map[2], undefined, map[3]);
    });
    // set theme
    settings.theme = `
    .sk_theme {
        font-family: Input Sans Condensed, Charcoal, sans-serif;
        font-size: 12pt;
        background: #24272e;
        color: #abb2bf;
    }
    .sk_theme tbody {
        color: #fff;
    }
    .sk_theme input {
        color: #d0d0d0;
    }
    .sk_theme .url {
        color: #61afef;
    }
    .sk_theme .annotation {
        color: #56b6c2;
    }
    .sk_theme .omnibar_highlight {
        color: #528bff;
    }
    .sk_theme .omnibar_timestamp {
        color: #e5c07b;
    }
    .sk_theme .omnibar_visitcount {
        color: #98c379;
    }
    .sk_theme #sk_omnibarSearchResult ul li:nth-child(odd) {
        background: #303030;
    }
    .sk_theme #sk_omnibarSearchResult ul li.focused {
        background: #3e4452;
    }
    #sk_status, #sk_find {
        font-size: 20pt;
    }`;
    // click `Save` button to make above settings to take effect.