// ==UserScript==
// @name         Twitter/X → Nitter
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Redirects twitter.com and x.com to nitter.net with fallback instances
// @author       yumi
// @match        https://twitter.com/*
// @match        https://x.com/*
// @match        https://www.twitter.com/*
// @match        https://www.x.com/*
// @grant        GM_xmlhttpRequest
// @connect      nitter.net
// @connect      xcancel.com
// @connect      nitter.poast.org
// @connect      nitter.privacyredirect.com
// @connect      lightbrd.com
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    const INSTANCES = [
        'nitter.net',
        'xcancel.com',
        'nitter.poast.org',
        'nitter.privacyredirect.com',
        'lightbrd.com',
    ];

    const TIMEOUT_MS = 3000;

    const path = window.location.pathname + window.location.search;

    function tryInstance(index) {
        if (index >= INSTANCES.length) return;
        const host = INSTANCES[index];
        GM_xmlhttpRequest({
            method: 'HEAD',
            url: `https://${host}/`,
            timeout: TIMEOUT_MS,
            onload(res) {
                if (res.status > 0 && res.status < 500) {
                    window.location.replace(`https://${host}${path}`);
                } else {
                    tryInstance(index + 1);
                }
            },
            onerror()   { tryInstance(index + 1); },
            ontimeout() { tryInstance(index + 1); },
        });
    }

    tryInstance(0);
})();
