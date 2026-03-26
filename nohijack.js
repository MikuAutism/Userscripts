// ==UserScript==
// @name         NoHijack
// @namespace    https://github.com/yumi/nohijack
// @version      1.0
// @description  Prevent sites from blocking copy, paste, cut, context menu, and text selection
// @author       yumi
// @match        *://*/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(()=> {
    'use strict';

    const block = e => {
        if (e.target === document || e.target === document.body) {
            e.stopImmediatePropagation();
        }
    };

    const handlers = {
        copy:        block,
        cut:         block,
        paste:       block,
        contextmenu: block,
        selectstart: block,
        keydown: e => {
            if (e.altKey && e.key.match(/[0-9]/) &&
                (e.target === document || e.target === document.body)) {
                e.stopImmediatePropagation();
            }
        }
    };

    for (const [event, handler] of Object.entries(handlers)) {
        document.addEventListener(event, handler, true);
    }
})();
