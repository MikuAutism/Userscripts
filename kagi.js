// ==UserScript==
// @name         Kagi — Old Google Black Bar
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Adds an old Google-style black top navigation bar to Kagi Search
// @author       yumi
// @match        https://kagi.com/*
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @connect      status.kagi.com
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';

    const BAR_H = 30;
    const path  = window.location.pathname;

    if (path === '/assistant' || path.startsWith('/settings')) return;

    const isNews = window.location.hostname === 'news.kagi.com';

    // ── Catppuccin Mocha theme (all pages except news) ──────────────────────────
    if (!isNews) GM_addStyle(`
        /* Base */
        html, body { background: #1e1e2e !important; color: #cdd6f4 !important; }

        /* Header */
        .app-header, header.app-header { background: #1e1e2e !important; border-bottom-color: transparent !important; }

        /* Logo */
        .app-logo .logo_kagi svg path, .app-logo .logo_kagi_small svg path { fill: #f9e2af !important; }

        /* Search bar */
        .search-input-container, ._0_search-input-container {
            background: #313244 !important;
            border-color: transparent !important;
            box-shadow: none !important;
        }
        .search-input, ._0_search_input_field {
            background: transparent !important;
            color: #cdd6f4 !important;
            caret-color: #f9e2af !important;
        }
        .search-input::placeholder { color: #7f849c !important; }
        .search-input-container:focus-within { border-color: #f9e2af !important; }
        .search-form-icons svg, .clear-search svg, #searchFormSubmit svg { stroke: #a6adc8 !important; }
        .clear-search:hover svg, #searchFormSubmit:hover svg { stroke: #cdd6f4 !important; }
        .sfi_sep { background: #45475a !important; }

        /* Nav tabs (All / Images / Videos…) and lens bar */
        #tonav, .app-nav, ._0_nav-items, .serp-nav,
        ._0_lenses, .lenses, ._0_lens_nav, .lens-nav,
        ._0_search_nav, .search-nav, ._0_result_nav,
        [class*="lenses"], [class*="lens-nav"] {
            background: transparent !important;
            border-bottom-color: transparent !important;
            border-top-color: transparent !important;
        }
        .app-header::after, #tonav::after, .serp-nav::after { display: none !important; }
        .nav_item { color: #a6adc8 !important; border-color: transparent !important; }
        .nav_item:hover { color: #cdd6f4 !important; background: #313244 !important; }
        .nav_item.--active { color: #f9e2af !important; border-bottom-color: #f9e2af !important; }

        /* Filter bar */
        .app-content-box.top-panel-box { background: transparent !important; border-bottom-color: transparent !important; }
        .dd-toggle-label, .filter-item .btn, ._0_k_ui_dropdown_first_item,
        .filter-item a, ._0_filters-panel a {
            background: transparent !important;
            color: #cdd6f4 !important;
            border-color: transparent !important;
        }
        .dd-toggle-label:hover, ._0_k_ui_dropdown:hover { background: #45475a !important; }
        .serp_nav_end ._0_k_ui_dropdown,
        .serp_nav_end ._0_k_ui_dropdown:hover,
        .serp_nav_end ._0_k_ui_dropdown_first_item,
        .serp_nav_end ._0_k_ui_dropdown_first_item:hover {
            background: transparent !important;
            border-color: transparent !important;
            color: #a6adc8 !important;
        }
        .__sri_more_menu, .__sri_more_menu:hover,
        .__sri_more_menu ._0_k_ui_dropdown_first_item,
        .__sri_more_menu ._0_k_ui_dropdown_first_item:hover {
            background: transparent !important;
            border-color: transparent !important;
            color: #6c7086 !important;
        }
        .__sri_more_menu ._0_k_ui_dropdown_first_item:hover { color: #cdd6f4 !important; }
        .serp_nav_end svg { stroke: #a6adc8 !important; fill: none !important; }
        .serp_nav_end a svg { stroke: #a6adc8 !important; }
        .dd-list, ._0_k_ui_dropdown_data_list {
            background: #181825 !important;
            border-color: #313244 !important;
            box-shadow: 0 4px 16px #11111b !important;
        }
        .dd-list .inner-label, ._0_k_ui_dropdown_li {
            color: #cdd6f4 !important;
        }
        .dd-list .inner-label:hover, ._0_k_ui_dropdown_li:hover { background: #313244 !important; }
        .dd-list .inner-label.checked { color: #f9e2af !important; }
        .k_ui_toggle_switch_bar { background: #45475a !important; }
        input:checked ~ .k_ui_toggle_switch_bar { background: #f9e2af !important; }

        /* Search results */
        .__sri { border-color: #313244 !important; }
        .__sri-title a, .__sri-title a:visited,
        .sri-title a, .sri-title a:visited,
        #main h3 a, #main h2 a, #main h1 a { color: #89b4fa !important; }
        .__sri-title a:hover, .sri-title a:hover,
        #main h3 a:hover, #main h2 a:hover { color: #b4befe !important; }
        .__sri-url, ._0_sri_url, .sri-url { color: #a6e3a1 !important; }
        .__sri-desc, .sri-desc { color: #bac2de !important; }
        .__sri-date { color: #7f849c !important; }

        /* Result action buttons (bookmark, translate…) */
        .__sri_actions, .__sri_actions button, .__sri_actions a,
        ._0_sri_actions, ._0_sri_actions button, ._0_sri_actions a,
        .sri-actions, .sri-actions button, .sri-actions a,
        .__sri .actions, .__sri .actions button, .__sri .actions a {
            color: #6c7086 !important;
            background: transparent !important;
        }
        .__sri_actions button:hover, .__sri_actions a:hover,
        ._0_sri_actions button:hover, ._0_sri_actions a:hover { color: #cdd6f4 !important; background: #313244 !important; }

        /* Popups / modals */
        [class*="d-info-box"] {
            background: #1e1e2e !important;
            color: #cdd6f4 !important;
            border-color: #313244 !important;
        }
        [class*="d-info-box"] * { color: #cdd6f4 !important; }
        [class*="d-info-box"] a { color: #89b4fa !important; }

        /* Sidebar / answer boxes */
        .__sri-answer-box, .sri-answer-box { background: #181825 !important; border-color: #313244 !important; }

        /* Ranked box */
        .ranked-box-center { background: #181825 !important; border-color: #313244 !important; color: #cdd6f4 !important; }
        .ranked-box-center a { color: #89b4fa !important; }
        .ranked-box-center a:visited { color: #b4befe !important; }

        /* Autocomplete dropdown */
        .auto_suggestions { background: #181825 !important; border-color: #f9e2af !important; box-shadow: 0 4px 16px #11111b !important; }
        .auto_suggestions_in a { color: #cdd6f4 !important; }
        .auto_suggestions_in a:hover { background: #313244 !important; }
        .auto_suggestions_footer { border-top-color: #313244 !important; color: #7f849c !important; }
        .auto_suggestions_footer, .auto_suggestions_lenses_box, ._0_auto_suggestions_lenses_box { background: transparent !important; }
        ._0_lens_suggestion { color: #a6adc8 !important; background: transparent !important; border-color: transparent !important; }
        ._0_lens_suggestion:hover { background: #313244 !important; color: #cdd6f4 !important; }
        ._0_lens_suggestion:has(input:checked) { color: #f9e2af !important; font-weight: bold; }

        /* Footer */
        footer a, footer a:visited { color: #6c7086 !important; }
        footer a:hover { color: #a6adc8 !important; }

        /* Share This Search */
        .copyToClipLink, ._0_non_native_share_btn a,
        ._0_share_search_button a, ._0_share_search_button a:visited { color: #6c7086 !important; }
        ._0_share_search_button a:hover { color: #a6adc8 !important; }

        /* Misc text */
        a { color: #89b4fa !important; }
        a:visited { color: #b4befe !important; }
        hr { border-color: #313244 !important; }
        input, textarea, select { background: #313244 !important; color: #cdd6f4 !important; border-color: #45475a !important; }
        button.btn:not([type="submit"]):not(#searchFormSubmit),
        a.btn:not(#searchFormSubmit) {
            background: #313244 !important; color: #cdd6f4 !important; border-color: #45475a !important;
        }
        button.btn:not([type="submit"]):not(#searchFormSubmit):hover,
        a.btn:not(#searchFormSubmit):hover { background: #45475a !important; }

        /* Toggle switch knob */
        .k_ui_toggle_switch_bar::after, .k_ui_toggle_switch_bar::before { background: #cdd6f4 !important; }
        input:checked ~ .k_ui_toggle_switch_bar::after,
        input:checked ~ .k_ui_toggle_switch_bar::before { background: #1e1e2e !important; }
    `);

    if (path === '/search') {
        GM_addStyle(`
            .app_nav_dropdown { display: none !important; }
            .control-center-btn { display: none !important; }
            .related-items { display: none !important; }
            /* Center header and main search content */
            .app-header > .flex {
                justify-content: center !important;
            }
            .center-content-box, #main {
                margin-left: auto !important;
                margin-right: auto !important;
                max-width: none !important;
                width: 100% !important;
            }
        `);
    }

    if (path !== '/') return;

    // ── Nav tabs ────────────────────────────────────────────────────────────────

    const activeMap = {
        '/maps': 'maps', '/assistant': 'assistant',
        '/translate': 'translate', '/summarize': 'summarize', '/small_web': 'smallweb',
    };
    const activeTab = activeMap[path] ?? null;

    const toolTabs = [
        { id: 'maps',      label: 'Maps',      href: 'https://www.google.com/maps' },
        { id: 'assistant', label: 'Assistant', href: 'https://kagi.com/assistant' },
        { id: 'translate', label: 'Translate', href: 'https://translate.kagi.com/' },
        { id: 'summarize', label: 'Summarize', href: 'https://kagi.com/summarizer/' },
        { id: 'smallweb',  label: 'Small Web', href: 'https://kagi.com/smallweb/' },
        { id: 'news',      label: 'News',      href: 'https://news.kagi.com' },
    ];

    // ── Control Center panel ────────────────────────────────────────────────────

    const panel = document.createElement('div');
    panel.id = 'og-cc';
    panel.style.cssText = 'transform:translateX(100%);transition:none';

    function closePanel() { panel.classList.remove('og-cc--open'); }

    // Header
    const ccHead = document.createElement('div');
    ccHead.className = 'og-cc-head';
    const ccTitle = document.createElement('span');
    ccTitle.textContent = 'Control Center';
    ccHead.appendChild(ccTitle);
    panel.appendChild(ccHead);

    // Nav links
    function ccLink(label, href, svg) {
        const a = document.createElement('a');
        a.href = href;
        a.className = 'og-cc-link';
        a.innerHTML = `<span class="og-cc-icon">${svg}</span>${label}`;
        return a;
    }

    const ICON_GEAR     = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 15a3 3 0 100-6 3 3 0 000 6z"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>`;
    const ICON_MAIL     = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/></svg>`;
    const ICON_STAR     = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
    const ICON_FEEDBACK = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 2L11 13"/><path d="M22 2L15 22l-4-9-9-4 20-7z"/></svg>`;

    const ccLinks = document.createElement('div');
    ccLinks.className = 'og-cc-links';
    ccLinks.appendChild(ccLink('Settings',                    '/settings',  ICON_GEAR));
    ccLinks.appendChild(ccLink('Contact Support',             'https://help.kagi.com/', ICON_MAIL));
    ccLinks.appendChild(ccLink('Specials',                    '/specials',  ICON_STAR));
    ccLinks.appendChild(ccLink('Send feedback or report bugs','https://kagifeedback.org/', ICON_FEEDBACK));

    const ICON_DISCORD  = `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>`;
    ccLinks.appendChild(ccLink('Discord', 'https://kagi.com/discord', ICON_DISCORD));
    panel.appendChild(ccLinks);

    // Divider
    const ccDivider = () => { const hr = document.createElement('hr'); hr.className = 'og-cc-hr'; return hr; };
    panel.appendChild(ccDivider());

    // More links
    const moreLinks = [
        { label: 'About',              href: 'https://help.kagi.com/kagi/company/' },
        { label: 'Blog',               href: '/blog' },
        { label: 'Changelog',          href: '/changelog' },
        { label: 'Live Stats',          href: '/stats' },
        { label: 'Swag',               href: 'https://store.kagi.com/' },
        { label: 'Hub',                href: 'https://hub.kagi.com/' },
        { label: 'Firefox Add-on',     href: 'https://addons.mozilla.org/en-US/firefox/user/17391934/' },
        { label: 'Chrome Extension',   href: 'https://chromewebstore.google.com/publisher/kagi/ua725dd00b4f4687b9914bb71bb96a4d0' },
        { label: 'Privacy & Terms',    href: '/privacy' },
        { label: 'Help Docs',          href: 'https://help.kagi.com/' },
        { label: 'Press',              href: '/press' },
    ];
    const ccMore = document.createElement('div');
    ccMore.className = 'og-cc-more';
    moreLinks.forEach(({ label, href }) => {
        const a = document.createElement('a');
        a.href = href;
        a.textContent = label;
        a.className = 'og-cc-more-item';
        ccMore.appendChild(a);
    });
    panel.appendChild(ccMore);

    document.body.appendChild(panel);
    requestAnimationFrame(() => panel.style.cssText = '');

    // Close on outside click
    document.addEventListener('click', e => {
        if (!panel.contains(e.target) && e.target.id !== 'og-settings-btn') closePanel();
    });

    // ── Build bar ───────────────────────────────────────────────────────────────

    const bar = document.createElement('div');
    bar.id = 'og-black-bar';

    const left = document.createElement('div');
    left.className = 'og-bar-left';

    const brand = document.createElement('a');
    brand.className = 'og-bar-brand';
    brand.href = '/';
    brand.textContent = 'Kagi';
    left.appendChild(brand);

    const nav = document.createElement('nav');
    nav.className = 'og-bar-nav';
    toolTabs.forEach(({ id, label, href }) => {
        const a = document.createElement('a');
        a.href = href;
        a.textContent = label;
        a.className = 'og-bar-link' + (activeTab === id ? ' og-bar-link--active' : '');
        nav.appendChild(a);
    });
    left.appendChild(nav);

    const right = document.createElement('div');
    right.className = 'og-bar-right';

    // Server status dot
    const statusDot = document.createElement('a');
    statusDot.id = 'og-status';
    statusDot.href = 'https://status.kagi.com/';
    statusDot.target = '_blank';
    statusDot.title = 'Checking status…';
    right.appendChild(statusDot);

    GM_xmlhttpRequest({
        method: 'GET',
        url: 'https://status.kagi.com/summary.json',
        onload(res) {
            try {
                const { page } = JSON.parse(res.responseText);
                const up = page.status === 'UP';
                statusDot.style.background = up ? '#a6e3a1' : '#f38ba8';
                statusDot.title = up ? 'All systems operational' : `Status: ${page.status}`;
            } catch { statusDot.title = 'Status unavailable'; }
        },
        onerror() { statusDot.title = 'Status unavailable'; },
    });

    const settingsBtn = document.createElement('button');
    settingsBtn.id = 'og-settings-btn';
    settingsBtn.className = 'og-bar-link';
    settingsBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`;
    settingsBtn.addEventListener('click', e => { e.stopPropagation(); panel.classList.toggle('og-cc--open'); });
    right.appendChild(settingsBtn);

    bar.appendChild(left);
    bar.appendChild(right);
    document.body.prepend(bar);

    // Push content below bar
    const firstSibling = bar.nextElementSibling;
    if (firstSibling) {
        const cur = parseInt(getComputedStyle(firstSibling).marginTop, 10) || 0;
        firstSibling.style.marginTop = `${cur + BAR_H}px`;
    }

    // ── Styles ──────────────────────────────────────────────────────────────────

    GM_addStyle(`
        /* ── Bar ── */
        #og-black-bar {
            position: fixed;
            top: 0; left: 0; right: 0;
            z-index: 99999;
            height: ${BAR_H}px;
            background: #1e1e2e;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 8px;
            font-family: arial, sans-serif;
            font-size: 13px;
            box-shadow: 0 1px 3px #11111b;
            box-sizing: border-box;
            user-select: none;
        }
        .og-bar-left { display:flex; align-items:center; height:100%; min-width:0; }
        .og-bar-right { display:flex; align-items:center; height:100%; gap:2px; flex-shrink:0; }
        .og-bar-brand {
            color:#f9e2af !important; font-weight:bold; font-size:14px; letter-spacing:.5px;
            text-decoration:none !important; padding:0 12px 0 4px; white-space:nowrap; flex-shrink:0;
        }
        .og-bar-nav { display:flex; align-items:center; height:100%; }
        .og-bar-link {
            color:#a6adc8 !important; text-decoration:none !important;
            padding:0 8px; height:100%; display:flex; align-items:center;
            white-space:nowrap; transition:color .1s,background .1s;
            background:none; border:none; cursor:pointer; font-size:13px; font-family:arial,sans-serif;
        }
        .og-bar-link:hover { color:#cdd6f4 !important; background:#313244; }
        .og-bar-link--active { color:#f9e2af !important; font-weight:bold; box-shadow:inset 0 -2px 0 #f9e2af; }

        #og-status {
            width: 8px; height: 8px; border-radius: 50%;
            background: #7f849c; display: inline-block; flex-shrink: 0;
            margin: 0 6px; cursor: pointer; transition: opacity .2s;
        }
        #og-status:hover { opacity: .75; }

        /* ── Control Center ── */
        #og-cc {
            position: fixed;
            top: ${BAR_H}px; right: 0; bottom: 0;
            width: 320px;
            background: #181825;
            color: #cdd6f4;
            font-family: arial, sans-serif;
            font-size: 14px;
            z-index: 99998;
            overflow-y: auto;
            transform: translateX(100%);
            transition: transform .2s ease;
            box-shadow: -4px 0 16px #11111b;
        }
        #og-cc.og-cc--open { transform: translateX(0); }

        .og-cc-head {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px 16px 12px;
            font-size: 17px;
            font-weight: bold;
            border-bottom: 1px solid #313244;
        }
        .og-cc-close {
            background: none; border: none; color: #a6adc8; font-size: 20px;
            cursor: pointer; padding: 0 4px; line-height: 1;
        }
        .og-cc-close:hover { color: #cdd6f4; }

        .og-cc-links { padding: 8px 0; }
        .og-cc-link {
            display: flex; align-items: center; gap: 12px;
            padding: 10px 16px;
            color: #cdd6f4 !important; text-decoration: none !important;
            transition: background .1s;
        }
        .og-cc-link:hover { background: #313244; color: #cdd6f4 !important; }
        .og-cc-icon { display:flex; align-items:center; color:#a6adc8; flex-shrink:0; }

        .og-cc-hr { border: none; border-top: 1px solid #313244; margin: 0; }

        .og-cc-more { padding: 8px 0 16px; }
        .og-cc-more-item {
            display: block; padding: 7px 16px;
            color: #a6adc8 !important; text-decoration: none !important; font-size: 13px;
            transition: background .1s;
        }
        .og-cc-more-item:hover { background: #313244; color: #cdd6f4 !important; }

        /* Hide Kagi's native UI */
        .user-auth-bar {
            visibility: hidden !important;
            position: absolute !important;
        }
        footer { display: none !important; }

        body { padding-top: 0 !important; margin-top: 0 !important; }
    `);

})();
