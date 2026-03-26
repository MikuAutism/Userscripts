// ==UserScript==
// @name         ChatGPT Tweaks
// @namespace    http://tampermonkey.net/
// @version      1.3.0
// @description  Removes upsell nags; adds a "Delete All Chats" button; auto-continues truncated responses; desktop notification on completion; Claude-inspired theme
// @author       yumi
// @match        https://chatgpt.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  // ── Claude-inspired theme ─────────────────────────────────────────────────
  // ChatGPT uses CSS custom properties (--main-surface-primary, etc.) consumed
  // by Tailwind utility classes like bg-token-main-surface-primary. Overriding
  // element backgrounds loses to those classes. The fix: override the variables
  // directly on html.light / html.dark so everything that uses them picks up
  // Claude's colors automatically.
  //
  // Claude token values sourced from live Anthropic CDN CSS chunks.
  // anthropicSans/Serif aren't publicly loadable; fallbacks used instead.

  const CLAUDE_CSS = `
    /* === Light mode === */
    html.light {
      --main-surface-primary:    hsl(0, 0%, 100%);           /* Claude --bg-000  */
      --main-surface-secondary:  hsl(48, 33.3%, 97.1%);      /* Claude --bg-100  */
      --main-surface-tertiary:   hsl(53, 28.6%, 94.5%);      /* Claude --bg-200  */
      --bg-primary:              hsl(48, 33.3%, 97.1%);
      --bg-secondary:            hsl(53, 28.6%, 94.5%);
      --bg-tertiary:             hsl(48, 25%, 92.2%);        /* Claude --bg-300  */
      --sidebar-surface-primary:   hsl(53, 28.6%, 94.5%);   /* Claude sidebar   */
      --sidebar-surface-secondary: hsl(48, 25%, 92.2%);
      --sidebar-surface-tertiary:  hsl(50, 20.7%, 88.6%);
      --composer-surface-primary:  hsl(53, 28.6%, 94.5%);
      --surface-hover:           hsl(48, 25%, 92.2%);
      --text-primary:            hsl(60, 2.6%, 7.6%);        /* Claude #141413   */
      --text-secondary:          hsl(60, 2.5%, 23.3%);       /* Claude #3c3b38   */
      --text-tertiary:           hsl(51, 3.1%, 43.7%);       /* Claude #706f6a   */
      --text-placeholder:        hsl(51, 3.1%, 43.7%);
      --border-default:          hsla(30, 3.3%, 11.8%, 0.15);
      --border-light:            hsla(30, 3.3%, 11.8%, 0.10);
      --composer-blue-bg:        hsl(15, 54.2%, 51.2%);      /* Claude clay      */
      --composer-blue-hover:     hsl(14.8, 63.1%, 59.6%);
      --icon-primary:            hsl(60, 2.6%, 7.6%);
      --icon-secondary:          hsl(51, 3.1%, 43.7%);
    }

    /* === Dark mode === */
    html.dark {
      --main-surface-primary:    hsl(60, 2.1%, 18.4%);       /* Claude #2f2f2d   */
      --main-surface-secondary:  hsl(60, 2.7%, 14.5%);       /* Claude #252523   */
      --main-surface-tertiary:   hsl(30, 3.3%, 11.8%);       /* Claude #1e1d1b   */
      --bg-primary:              hsl(60, 2.7%, 14.5%);
      --bg-secondary:            hsl(30, 3.3%, 11.8%);
      --bg-tertiary:             hsl(60, 2.6%, 7.6%);        /* Claude #141413   */
      --sidebar-surface-primary:   hsl(60, 2.7%, 14.5%);    /* Claude sidebar   */
      --sidebar-surface-secondary: hsl(30, 3.3%, 11.8%);
      --sidebar-surface-tertiary:  hsl(60, 2.6%, 7.6%);
      --composer-surface-primary:  hsl(60, 2.7%, 14.5%);
      --surface-hover:           hsl(30, 3.3%, 11.8%);
      --text-primary:            hsl(48, 33.3%, 97.1%);      /* Claude #f8f7f4   */
      --text-secondary:          hsl(50, 9%, 73.7%);         /* Claude #bdbbb5   */
      --text-tertiary:           hsl(48, 4.8%, 59.2%);       /* Claude #989690   */
      --text-placeholder:        hsl(48, 4.8%, 59.2%);
      --border-default:          hsla(51, 16.5%, 84.5%, 0.12);
      --border-light:            hsla(51, 16.5%, 84.5%, 0.08);
      --composer-blue-bg:        hsl(15, 54.2%, 51.2%);      /* Claude clay      */
      --composer-blue-hover:     hsl(14.8, 63.1%, 59.6%);
      --icon-primary:            hsl(48, 33.3%, 97.1%);
      --icon-secondary:          hsl(48, 4.8%, 59.2%);
    }

    /* Serif font for AI response prose — Claude's signature look */
    [data-message-author-role="assistant"] .markdown,
    [data-message-author-role="assistant"] .prose {
      font-family: Georgia, Arial, serif !important;
      font-size: 15px !important;
      line-height: 1.75 !important;
    }
  `;

  function injectClaudeTheme() {
    if (document.getElementById('__claude-theme')) return;
    const style = document.createElement('style');
    style.id = '__claude-theme';
    style.textContent = CLAUDE_CSS;
    document.head.appendChild(style);
  }

  // ── Model selector dropdown removal ──────────────────────────────────────

  const MODEL_SELECTOR_CSS = `
    /* Hide the chevron/arrow inside the model selector button */
    button[data-testid="model-switcher-dropdown-button"] svg,
    button[id*="model"] svg,
    header button svg[class*="chevron"],
    header button svg[class*="arrow"],
    header button svg[class*="caret"] { display: none !important; }

    /* Make the button non-interactive so it can't open the dropdown */
    button[data-testid="model-switcher-dropdown-button"],
    button[id*="model-switcher"] {
      pointer-events: none !important;
      cursor: default !important;
    }
  `;

  function injectModelSelectorStyle() {
    if (document.getElementById('__hide-model-selector')) return;
    const style = document.createElement('style');
    style.id = '__hide-model-selector';
    style.textContent = MODEL_SELECTOR_CSS;
    document.head.appendChild(style);
  }

  function stripModelSelectorDropdown() {
    // Find the header model-switcher button by test-id or by its text content
    const btn =
      document.querySelector('button[data-testid="model-switcher-dropdown-button"]') ||
      [...document.querySelectorAll('header button')].find(b =>
        /^chatgpt$/i.test(b.textContent.trim())
      );
    if (!btn || btn.dataset.__stripped) return;
    btn.dataset.__stripped = '1';

    // Replace content with a plain text node — removes all SVG children
    btn.replaceChildren(document.createTextNode('ChatGPT'));
    btn.style.setProperty('pointer-events', 'none', 'important');
    btn.style.setProperty('cursor', 'default', 'important');
    btn.style.removeProperty('background');
  }

  // ── Voice removal ─────────────────────────────────────────────────────────

  const VOICE_CSS = `
    /* Microphone / voice input button in the composer */
    button[aria-label*="voice" i],
    button[aria-label*="microphone" i],
    button[aria-label*="audio" i],
    button[aria-label*="dictate" i],
    /* Voice mode orb / call UI */
    [data-testid*="voice"],
    [data-testid*="microphone"],
    [class*="voiceMode"],
    [class*="voice-mode"] { display: none !important; }
  `;

  function injectVoiceStyle() {
    if (document.getElementById('__hide-voice-style')) return;
    const style = document.createElement('style');
    style.id = '__hide-voice-style';
    style.textContent = VOICE_CSS;
    document.head.appendChild(style);
  }

  // Also catch any text-labelled voice menu items
  const UPSELL_PHRASES = ['claim offer', 'free offer', 'upgrade to plus', 'upgrade plan',
    'voice mode', 'use voice', 'start voice', 'dictate',
    'try for free', 'chatgpt business',
    'message remaining', 'messages remaining', 'business trial',
    'try business', 'keep the conversation going', 'start a free'];

  function hideUpsells() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const toHide = new Set();

    let node;
    while ((node = walker.nextNode())) {
      const text = node.textContent.trim().toLowerCase();
      if (UPSELL_PHRASES.some(p => text.includes(p))) {
        // Walk up to the nearest interactive/block container
        const INTERACTIVE_ROLES = new Set(['menuitem', 'option', 'button', 'link', 'listitem']);
        let el = node.parentElement;
        while (el && el !== document.body) {
          const tag = el.tagName;
          const role = el.getAttribute('role') || '';
          if (['BUTTON', 'A', 'LI'].includes(tag) || INTERACTIVE_ROLES.has(role)) break;
          el = el.parentElement;
        }
        if (el && el !== document.body) toHide.add(el);
      }
    }

    toHide.forEach(el => { el.style.setProperty('display', 'none', 'important'); });
  }

  // ── Auto-continue ─────────────────────────────────────────────────────────
  // When ChatGPT truncates a response it renders a "Continue generating" button.
  // No existing userscript handles this correctly with the current UI selectors.
  // We scan all buttons by text content so the selector survives UI refactors.

  function tryAutoContinue() {
    for (const btn of document.querySelectorAll('button')) {
      if (/^continue generating$/i.test(btn.textContent.trim())) {
        btn.click();
        return;
      }
    }
  }

  // ── Response-complete notification ────────────────────────────────────────
  // Fires a desktop notification when streaming finishes and the tab is hidden.
  // Permission is requested lazily on the first click of the send button.

  let wasStreaming = false;
  let notifPermissionRequested = false;

  function isStreaming() {
    // The stop-streaming button is present only while generation is in progress.
    return !!(
      document.querySelector('button[data-testid="stop-button"]') ||
      document.querySelector('button[aria-label*="stop" i]')
    );
  }

  function checkStreamingState() {
    const streaming = isStreaming();

    if (wasStreaming && !streaming) {
      if (document.hidden && Notification.permission === 'granted') {
        new Notification('ChatGPT', {
          body: 'Response complete',
          icon: '/favicon.ico',
          tag: 'chatgpt-done', // collapses duplicate notifications
        });
      }
    }

    wasStreaming = streaming;
  }

  function requestNotifPermissionOnSend() {
    if (notifPermissionRequested || Notification.permission !== 'default') return;

    // Intercept the first time the user submits a message
    document.addEventListener('click', function handler(e) {
      const btn = e.target.closest('button[data-testid="send-button"]');
      if (!btn) return;
      notifPermissionRequested = true;
      document.removeEventListener('click', handler, true);
      Notification.requestPermission();
    }, true);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  async function getAccessToken() {
    const res = await fetch('/api/auth/session');
    if (!res.ok) throw new Error('Failed to fetch session');
    const data = await res.json();
    if (!data?.accessToken) throw new Error('No access token in session');
    return data.accessToken;
  }

  async function deleteAllConversations(token) {
    // Bulk-archive (delete) all conversations in one call
    const res = await fetch('https://chatgpt.com/backend-api/conversations', {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ is_visible: false }),
    });
    if (!res.ok) throw new Error(`API error ${res.status}`);
    return res.json();
  }

  // ── UI ────────────────────────────────────────────────────────────────────

  function createButton() {
    const btn = document.createElement('button');
    btn.textContent = 'Delete all chats';
    btn.title = 'Permanently delete all conversations';

    Object.assign(btn.style, {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      width: '100%',
      padding: '8px 12px',
      background: 'transparent',
      border: 'none',
      borderRadius: '8px',
      color: '#ef4444',
      fontSize: '14px',
      fontFamily: 'inherit',
      cursor: 'pointer',
      textAlign: 'left',
      transition: 'background 0.15s',
    });

    btn.addEventListener('mouseenter', () => {
      btn.style.background = 'rgba(239,68,68,0.1)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.background = 'transparent';
    });

    btn.addEventListener('click', async () => {
      const confirmed = window.confirm(
        'Delete ALL chats?\n\nThis cannot be undone.'
      );
      if (!confirmed) return;

      btn.textContent = 'Deleting…';
      btn.disabled = true;

      try {
        const token = await getAccessToken();
        await deleteAllConversations(token);
        btn.textContent = 'Done';
        // Reload so the sidebar reflects the cleared history
        const reloadTimer = setTimeout(() => window.location.reload(), 800);
        window.addEventListener('beforeunload', () => clearTimeout(reloadTimer), { once: true });
      } catch (err) {
        console.error('[delete-all-chats]', err);
        btn.textContent = 'Error — see console';
        btn.disabled = false;
        setTimeout(() => { btn.textContent = 'Delete all chats'; }, 3000);
      }
    });

    return btn;
  }

  function inject() {
    if (document.getElementById('__delete-all-chats-btn')) return;

    // Target: the bottom section of the sidebar (where Settings lives)
    // ChatGPT renders a nav element inside the sidebar; the bottom items sit
    // in a flex column at the end. We wait for any sidebar nav to appear.
    const nav = document.querySelector('nav');
    if (!nav) return;

    const wrapper = document.createElement('div');
    wrapper.id = '__delete-all-chats-btn';
    Object.assign(wrapper.style, {
      padding: '4px 8px',
    });

    wrapper.appendChild(createButton());

    // Insert before the last child of the nav (usually the account / settings row)
    const settingsBtn = nav.querySelector('a[href="/settings"], button[data-testid*="settings"]');
    if (settingsBtn) {
      settingsBtn.closest('li, div')?.before(wrapper);
    } else {
      nav.insertBefore(wrapper, nav.lastElementChild);
    }
  }

  // ── Init ──────────────────────────────────────────────────────────────────

  // ChatGPT is a SPA — watch for the sidebar to render
  let hideScheduled = false;
  let injectTimer;
  const observer = new MutationObserver(() => {
    // Hide upsells on the next paint (~16ms) to avoid visible flash
    if (!hideScheduled) {
      hideScheduled = true;
      requestAnimationFrame(() => {
        hideScheduled = false;
        hideUpsells();
        tryAutoContinue();
        checkStreamingState();
        stripModelSelectorDropdown();
      });
    }
    // Inject UI elements with a longer debounce — they're not flash-sensitive
    clearTimeout(injectTimer);
    injectTimer = setTimeout(() => {
      if (document.querySelector('nav')) inject();
    }, 100);
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // Also try immediately in case the page already loaded
  injectClaudeTheme();
  injectVoiceStyle();
  injectModelSelectorStyle();
  hideUpsells();
  stripModelSelectorDropdown();
  inject();
  requestNotifPermissionOnSend();
})();
