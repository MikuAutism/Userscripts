// ==UserScript==
// @name         Marginalia Search — Google UI
// @namespace    https://marginalia-search.com/
// @version      1.0.0
// @description  Transforms Marginalia Search into a Google-like interface
// @author       userscript
// @match        https://marginalia-search.com/*
// @grant        GM_addStyle
// ==/UserScript==

(function () {
  'use strict';

  // ── Bot-protection bypass ─────────────────────────────────────────────
  // The bot-check page shows a countdown then redirects via JS.
  // Detect the continue link (contains the sst session token) and skip immediately.
  // Only bypass the bot-check page if we haven't already followed the sst redirect
  const sstLink = document.querySelector('a[href*="sst=SE-"]');
  if (sstLink && !location.search.includes('sst=')) { location.href = sstLink.href; return; }

  // ── CSS ───────────────────────────────────────────────────────────────
  GM_addStyle(`
    /* ── Reset ─────────────────────────────────────── */
    *, *::before, *::after { box-sizing: border-box; }
    body {
      background: #fff !important;
      color: #202124 !important;
      font-family: arial, sans-serif !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    /* ── Homepage ───────────────────────────────────── */
    #g-home {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding-top: 16vh;
      min-height: 100vh;
    }

    #g-logo {
      font-size: 72px;
      letter-spacing: -2px;
      margin-bottom: 28px;
      text-decoration: none;
      font-family: 'Product Sans', 'Google Sans', arial, sans-serif;
      background: linear-gradient(90deg, #4285f4 0%, #34a853 25%, #fbbc05 62%, #ea4335 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      line-height: 1;
    }

    #g-form { width: 582px; max-width: 92vw; }

    #g-input-wrap {
      display: flex;
      align-items: center;
      border: 1px solid #dfe1e5;
      border-radius: 24px;
      padding: 0 16px;
      height: 46px;
      gap: 10px;
      transition: box-shadow .15s, border-color .15s;
    }
    #g-input-wrap:hover,
    #g-input-wrap:focus-within {
      box-shadow: 0 1px 6px rgba(32,33,36,.28);
      border-color: transparent;
    }
    #g-input-wrap input[type="text"] {
      flex: 1;
      border: none !important;
      outline: none !important;
      font-size: 16px;
      background: transparent;
      padding: 0 !important;
      box-shadow: none !important;
      color: #202124;
    }
    #g-input-wrap svg { flex-shrink: 0; }

    #g-btns {
      display: flex;
      gap: 12px;
      margin-top: 28px;
      justify-content: center;
    }
    .g-btn {
      background: #f8f9fa;
      border: 1px solid #f8f9fa;
      border-radius: 4px;
      color: #3c4043;
      font-size: 14px;
      font-family: arial, sans-serif;
      padding: 0 18px;
      height: 36px;
      cursor: pointer;
      transition: box-shadow .1s, border-color .1s;
    }
    .g-btn:hover {
      box-shadow: 0 1px 1px rgba(0,0,0,.12);
      border-color: #dadce0;
    }

    #g-tagline {
      margin-top: 32px;
      font-size: 13px;
      color: #70757a;
    }

    /* ── Results: header ────────────────────────────── */
    #g-header {
      display: flex;
      align-items: center;
      padding: 8px 20px;
      border-bottom: 1px solid #ebebeb;
      background: #fff;
      gap: 24px;
      height: 60px;
      position: relative;
    }

    #g-header-logo {
      font-size: 26px;
      font-weight: 700;
      text-decoration: none;
      letter-spacing: -0.5px;
      flex-shrink: 0;
      background: linear-gradient(90deg, #4285f4, #34a853 40%, #fbbc05 70%, #ea4335);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    #g-header-form {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      width: 600px;
      max-width: calc(100% - 200px);
    }

    #g-header-search {
      display: flex;
      align-items: center;
      border: 1px solid #dfe1e5;
      border-radius: 24px;
      height: 44px;
      padding: 0 6px 0 14px;
      gap: 8px;
      transition: box-shadow .15s, border-color .15s;
    }
    #g-header-search:hover,
    #g-header-search:focus-within {
      box-shadow: 0 1px 6px rgba(32,33,36,.28);
      border-color: transparent;
    }
    #g-header-search input[type="text"] {
      flex: 1;
      border: none !important;
      outline: none !important;
      font-size: 16px;
      background: transparent;
      padding: 0 !important;
      box-shadow: none !important;
      color: #202124;
    }

    #g-search-btn {
      width: 40px;
      height: 32px;
      border: none;
      background: #4285f4;
      border-radius: 20px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: background .1s;
    }
    #g-search-btn:hover { background: #357ae8; }

    /* ── Results: main area ─────────────────────────── */
    main {
      max-width: none !important;
      margin: 0 20px !important;
      padding: 20px 0 0 !important;
      display: block !important;
    }

    /* ── Results: individual result ─────────────────── */
    .g-result {
      margin-bottom: 28px !important;
      padding: 0 !important;
      border: none !important;
      border-radius: 0 !important;
      background: transparent !important;
      box-shadow: none !important;
    }
    .g-url {
      font-size: 13px;
      color: #4d5156;
      line-height: 1.4;
      margin-bottom: 3px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .g-title {
      font-size: 20px !important;
      line-height: 1.3 !important;
      margin: 0 0 4px !important;
      font-family: arial, sans-serif !important;
      font-weight: normal !important;
    }
    .g-title a {
      color: #1a0dab !important;
      text-decoration: none !important;
    }
    .g-title a:hover { text-decoration: underline !important; }
    .g-title a:visited { color: #609 !important; }

    .g-snippet {
      font-size: 14px !important;
      color: #4d5156 !important;
      line-height: 1.58 !important;
      margin: 0 !important;
    }

    .g-meta {
      font-size: 12px;
      color: #70757a;
      margin-top: 6px;
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
    }
    .g-meta a { color: #70757a; text-decoration: none; }
    .g-meta a:hover { text-decoration: underline; }

    .g-badge {
      display: inline-block;
      padding: 1px 6px;
      border-radius: 3px;
      font-size: 11px;
      background: #e8f0fe;
      color: #1967d2;
    }
    .g-badge-warn {
      background: #fef7e0;
      color: #b06000;
    }

    .g-also-from {
      margin-top: 10px;
      padding: 8px 12px;
      background: #f8f9fa;
      border-radius: 4px;
      font-size: 13px;
      color: #4d5156;
    }
    .g-also-from p { margin: 0 0 6px; font-weight: 500; color: #70757a; }
    .g-also-from a { color: #1a0dab; }

    /* Hide noise */
    [title="Match density"],
    .g-action-btns,
    header,
    footer { display: none !important; }

    aside { display: none !important; }

    /* ── Results: pagination ────────────────────────── */
    #g-pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 2px;
      padding: 28px 0 0;
    }
    .g-page {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 34px;
      height: 34px;
      padding: 0 4px;
      border-radius: 50%;
      font-size: 14px;
      color: #1a0dab;
      text-decoration: none;
    }
    .g-page:hover { background: #f8f9fa; }
    .g-page.g-page-current {
      color: #202124;
      font-weight: bold;
      pointer-events: none;
    }

    /* ── Responsive ─────────────────────────────────── */
    @media (max-width: 768px) {
      #g-header { gap: 12px; padding: 8px 12px; }
    }
  `);

  const path = window.location.pathname;

  if (path === '/' || path === '') {
    buildHomepage();
  } else if (path === '/search') {
    buildResultsPage();
  }

  // ─────────────────────────────────────────────────────────────────────

  function buildHomepage() {
    document.body.innerHTML = `
      <div id="g-home">
        <a id="g-logo" href="/">marginalia</a>
        <form id="g-form" action="/search" method="get">
          <div id="g-input-wrap">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                 stroke="#9aa0a6" stroke-width="2.2"
                 stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input type="text" name="query" autocomplete="off" autofocus
                   placeholder="Search the web">
            <input type="hidden" name="profile" value="corpo">
          </div>
          <div id="g-btns">
            <button type="submit" class="g-btn">Marginalia Search</button>
            <button type="button" class="g-btn"
                    onclick="location.href='/explore'">I'm Feeling Curious</button>
          </div>
        </form>
        <p id="g-tagline">Independent · Open source · No tracking</p>
      </div>
    `;
    document.title = 'Marginalia Search';
  }

  function buildResultsPage() {
    const params = new URLSearchParams(location.search);
    const query  = params.get('query') || '';

    // Strip all Tailwind dark: classes so OS dark mode can't override our styles
    document.querySelectorAll('*').forEach(el => {
      [...el.classList].forEach(cls => { if (cls.startsWith('dark:')) el.classList.remove(cls); });
    });

    // Inject header
    injectHeader(query, params);

    // Transform existing result items
    styleResults();

    // Transform pagination
    stylePagination();

  }

  function injectHeader(query, params) {
    const header = document.createElement('div');
    header.id = 'g-header';

    const profile = params.get('profile') || 'corpo';

    header.innerHTML = `
      <a id="g-header-logo" href="/">marginalia</a>
      <form id="g-header-form" action="/search" method="get">
        <div id="g-header-search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
               stroke="#9aa0a6" stroke-width="2.2"
               stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" name="query" autocomplete="off"
                 value="${escAttr(query)}">
          <input type="hidden" name="profile" value="${escAttr(profile)}">
          <button type="submit" id="g-search-btn" aria-label="Search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"
                 stroke="none">
              <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5
                       6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79
                       l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5
                       S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
          </button>
        </div>
      </form>
    `;

    document.body.insertBefore(header, document.body.firstChild);
  }

  function styleResults() {
    document.querySelectorAll('main h2').forEach(h2 => {
      // Walk up to the result card (has border + bg-white classes)
      const card = h2.closest('div[class*="border"][class*="bg-white"]') ||
                   h2.closest('div[class*="border"][class*="dark:bg-gray"]');
      if (!card) return;

      const titleLink  = h2.querySelector('a');
      const urlLink    = card.querySelector('a[class*="text-liteblue"], a[class*="text-blue-2"]');
      const snippet    = card.querySelector('p[class*="text-sm"]');
      const actionCol  = card.querySelector('.ml-5, [class*="ml-5"]');
      const alsoFrom   = card.querySelector('[class*="bg-green"]');

      // Remove noisy elements
      if (actionCol) actionCol.classList.add('g-action-btns'); // hidden by CSS

      // Restyle card
      card.className = 'g-result';
      card.removeAttribute('style');

      // URL line (shown above title, Google-style)
      if (urlLink) {
        const cleanUrl = urlLink.textContent.replace(/\u00ad/g, '').trim();
        const urlDiv = document.createElement('div');
        urlDiv.className = 'g-url';
        urlDiv.textContent = cleanUrl;
        card.insertBefore(urlDiv, card.firstChild);
        // Hide the original URL container
        const origUrlWrap = urlLink.closest('div[class*="text-sm"]');
        if (origUrlWrap) origUrlWrap.style.display = 'none';
      }

      // Title
      h2.className = 'g-title';
      if (titleLink) {
        titleLink.removeAttribute('rel');
        titleLink.removeAttribute('class');
      }

      // Snippet
      if (snippet) {
        snippet.className = 'g-snippet';
        snippet.removeAttribute('dir');
      }

      // "Also from" block
      if (alsoFrom) {
        const container = alsoFrom.closest('div[class*="flex"][class*="mt-2"]') ||
                          alsoFrom.parentElement;
        if (container) container.className = 'g-also-from';
        alsoFrom.className = '';
      }

      // Meta row: "N more" link + badges
      const metaSpan = card.querySelector('span[class*="space-x-1"]');
      if (metaSpan) {
        metaSpan.className = 'g-meta';
        // Re-class badges
        metaSpan.querySelectorAll('span').forEach(badge => {
          const cls = badge.getAttribute('class') || '';
          if (cls.includes('yellow') || cls.includes('red')) {
            badge.className = 'g-badge g-badge-warn';
          } else {
            badge.className = 'g-badge';
          }
        });
      }
    });
  }

  function stylePagination() {
    const pgDiv = document.querySelector('main div[class*="justify-center"]');
    if (!pgDiv) return;

    pgDiv.id = 'g-pagination';
    pgDiv.querySelectorAll('a').forEach(a => {
      const cls = a.getAttribute('class') || '';
      // Current page has a gray background in original classes
      const isCurrent = cls.includes('bg-gray-2') || cls.includes('bg-gray-9');
      a.className = isCurrent ? 'g-page g-page-current' : 'g-page';
    });
  }

  function escAttr(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

})();
