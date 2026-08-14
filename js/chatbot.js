/* Cassie chatbot widget — Star Homes */
(function () {
  'use strict';

  const VISITED_KEY = 'cassie_visited';
  const PREFS_KEY   = 'cassie_prefs';
  const HISTORY_KEY = 'cassie_history';
  const OPEN_KEY    = 'cassie_open';
  const QR_KEY      = 'cassie_qr';
  const AVATAR_SRC  = 'starhomeslogo.png';

  let map = null;
  let fallbackCycle = 0;

  /* ---------- DOM helpers ---------- */

  function el(tag, attrs, ...children) {
    const node = document.createElement(tag);
    Object.entries(attrs || {}).forEach(([k, v]) => {
      if (k === 'className') node.className = v;
      else if (k === 'textContent') node.textContent = v;
      else node.setAttribute(k, v);
    });
    children.forEach(c => c && node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c));
    return node;
  }

  function svgClose() {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 24 24');
    s.setAttribute('fill', 'none');
    s.setAttribute('stroke', 'currentColor');
    s.setAttribute('stroke-width', '2.5');
    s.setAttribute('aria-hidden', 'true');
    s.innerHTML = '<path d="M18 6 6 18M6 6l12 12"/>';
    return s;
  }

  function svgSend() {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 24 24');
    s.setAttribute('aria-hidden', 'true');
    s.innerHTML = '<path d="m22 2-7 20-4-9-9-4 20-7z"/>';
    return s;
  }

  /* ---------- Build widget DOM ---------- */

  function buildWidget() {
    /* --- chat window --- */
    const messages   = el('div', { className: 'cassie-messages', id: 'cassie-messages', role: 'log', 'aria-live': 'polite', 'aria-label': 'Chat messages' });
    const quickReplies = el('div', { className: 'cassie-quick-replies', id: 'cassie-qr' });

    const input = el('input', {
      className: 'cassie-input',
      id: 'cassie-input',
      type: 'text',
      placeholder: 'Type a message…',
      'aria-label': 'Type a message to Cassie',
      autocomplete: 'off',
      maxlength: '200'
    });

    const sendBtn = el('button', { className: 'cassie-send-btn', id: 'cassie-send', 'aria-label': 'Send message' });
    sendBtn.appendChild(svgSend());

    const inputRow = el('div', { className: 'cassie-input-row' }, input, sendBtn);

    const avatarSm = el('img', { src: AVATAR_SRC, alt: '', className: 'cassie-avatar-sm', 'aria-hidden': 'true' });
    const titleSpan   = el('span', { className: 'cassie-title', id: 'cassie-dialog-title' }, 'Cassie');
    const subtitleSpan = el('span', { className: 'cassie-subtitle' }, 'Star Homes Guide ✨');
    const headerInfo  = el('div', { className: 'cassie-header-info' }, avatarSm, el('div', {}, titleSpan, subtitleSpan));

    const closeBtn = el('button', { className: 'cassie-close-btn', id: 'cassie-close', 'aria-label': 'Close chat' });
    closeBtn.appendChild(svgClose());

    const header = el('div', { className: 'cassie-header' }, headerInfo, closeBtn);

    const chatWindow = el('div', {
      className: 'cassie-chat',
      id: 'cassie-chat',
      role: 'dialog',
      'aria-modal': 'false',
      'aria-labelledby': 'cassie-dialog-title',
      'aria-label': 'Chat with Cassie'
    }, header, messages, quickReplies, inputRow);
    chatWindow.hidden = true;

    /* --- toggle button --- */
    const badge = el('span', { className: 'cassie-badge', id: 'cassie-badge', 'aria-hidden': 'true' }, '1');
    badge.hidden = true;

    const toggleImg = el('img', { src: AVATAR_SRC, alt: '', className: 'cassie-toggle-img', 'aria-hidden': 'true' });
    const toggleBtn = el('button', {
      className: 'cassie-toggle',
      id: 'cassie-toggle',
      'aria-label': 'Open chat with Cassie',
      'aria-expanded': 'false',
      'aria-controls': 'cassie-chat'
    }, toggleImg, badge);

    /* --- root widget --- */
    const widget = el('div', { className: 'cassie-widget', id: 'cassie-widget', 'aria-label': 'Cassie chat assistant' }, chatWindow, toggleBtn);
    document.body.appendChild(widget);

    return { chatWindow, messages, quickReplies, input, sendBtn, closeBtn, toggleBtn, badge };
  }

  /* ---------- Chat state ---------- */

  let refs = null;

  function isOpen() {
    return !refs.chatWindow.hidden;
  }

  function openChat() {
    refs.chatWindow.hidden = false;
    refs.chatWindow.classList.remove('cassie-animate');
    void refs.chatWindow.offsetWidth;
    refs.chatWindow.classList.add('cassie-animate');
    refs.toggleBtn.setAttribute('aria-expanded', 'true');
    refs.toggleBtn.setAttribute('aria-label', 'Close chat');
    refs.badge.hidden = true;
    sessionStorage.setItem(OPEN_KEY, '1');
    setTimeout(() => refs.input.focus(), 80);
  }

  function closeChat() {
    refs.chatWindow.hidden = true;
    refs.toggleBtn.setAttribute('aria-expanded', 'false');
    refs.toggleBtn.setAttribute('aria-label', 'Open chat with Cassie');
    refs.toggleBtn.focus();
    sessionStorage.removeItem(OPEN_KEY);
  }

  /* ---------- Rendering ---------- */

  function scrollBottom() {
    refs.messages.scrollTop = refs.messages.scrollHeight;
  }

  function saveHistory() {
    const msgs = Array.from(refs.messages.children).map(m => ({
      type: m.classList.contains('cassie-msg--user') ? 'user' : 'bot',
      html: m.querySelector('.cassie-bubble').innerHTML
    }));
    sessionStorage.setItem(HISTORY_KEY, JSON.stringify(msgs));
  }

  function addMessage(text, type) {
    const msg = el('div', { className: `cassie-msg cassie-msg--${type}` });

    if (type === 'bot') {
      const av = el('img', { src: AVATAR_SRC, alt: '', className: 'cassie-msg-avatar', 'aria-hidden': 'true' });
      msg.appendChild(av);
    }

    const bubble = el('div', { className: 'cassie-bubble' });
    bubble.innerHTML = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
    msg.appendChild(bubble);

    refs.messages.appendChild(msg);
    scrollBottom();
    saveHistory();
  }

  function restoreMessages(history) {
    history.forEach(({ type, html }) => {
      const msg = el('div', { className: `cassie-msg cassie-msg--${type}` });
      msg.style.animation = 'none'; // skip entrance animation on restore
      if (type === 'bot') {
        const av = el('img', { src: AVATAR_SRC, alt: '', className: 'cassie-msg-avatar', 'aria-hidden': 'true' });
        msg.appendChild(av);
      }
      const bubble = el('div', { className: 'cassie-bubble' });
      bubble.innerHTML = html; // already sanitised when originally saved
      msg.appendChild(bubble);
      refs.messages.appendChild(msg);
    });
    scrollBottom();
  }

  function showTyping() {
    const wrap = el('div', { className: 'cassie-typing', id: 'cassie-typing' });
    const av   = el('img', { src: AVATAR_SRC, alt: '', className: 'cassie-msg-avatar', 'aria-hidden': 'true' });
    const dots = el('div', { className: 'cassie-dots' });
    dots.innerHTML = '<span></span><span></span><span></span>';
    wrap.appendChild(av);
    wrap.appendChild(dots);
    refs.messages.appendChild(wrap);
    scrollBottom();
  }

  function hideTyping() {
    const t = document.getElementById('cassie-typing');
    if (t) t.remove();
  }

  function setQuickReplies(optionKeys) {
    refs.quickReplies.innerHTML = '';
    sessionStorage.setItem(QR_KEY, JSON.stringify(optionKeys || []));
    if (!optionKeys || !optionKeys.length) return;

    optionKeys.forEach(key => {
      const opt = map.options[key];
      if (!opt) return;
      const btn = el('button', { className: 'cassie-qr', type: 'button' }, opt.label);
      btn.addEventListener('click', () => handleOutput(opt.label, opt.output));
      refs.quickReplies.appendChild(btn);
    });
  }

  /* ---------- Conversation engine ---------- */

  function resolveOutput(outputKey) {
    const output = map.outputs[outputKey];
    if (!output) return;

    setQuickReplies([]);
    showTyping();

    setTimeout(() => {
      hideTyping();

      const parts = output.text.map(k => map.text[k]).filter(Boolean);
      const joined = parts.join(map.settings.joinWith || '\n\n');
      addMessage(joined, 'bot');
      setQuickReplies(output.options || []);

      if (output.event === 'START_SEARCH') {
        startSearch();
      }
    }, 900);
  }

  function startSearch() {
    setTimeout(() => {
      addMessage('Here are some of our featured properties — scroll down to browse, or tell me what you\'re looking for! 🏙️', 'bot');
      setQuickReplies(['menu', 'about']);
    }, 700);
  }

  function matchKeywords(text) {
    const lower = text.toLowerCase().trim();
    for (const rule of map.inputs) {
      for (const kw of rule.keywords) {
        if (lower.includes(kw.toLowerCase())) {
          return rule.output;
        }
      }
    }
    return null;
  }

  function handleOutput(displayText, outputKey) {
    addMessage(displayText, 'user');
    setQuickReplies([]);
    fallbackCycle = 0;
    resolveOutput(outputKey);
  }

  function handleUserText(text) {
    const matched = matchKeywords(text);

    if (matched) {
      fallbackCycle = 0;
      addMessage(text, 'user');
      setQuickReplies([]);
      resolveOutput(matched);
    } else {
      const fallbacks = map.fallback;
      const key = fallbacks[fallbackCycle % fallbacks.length];
      fallbackCycle++;
      addMessage(text, 'user');
      setQuickReplies([]);
      resolveOutput(key);
    }
  }

  /* ---------- Returning user greeting ---------- */

  function getPrefs() {
    try { return JSON.parse(localStorage.getItem(PREFS_KEY) || 'null'); } catch { return null; }
  }

  function returningGreeting(prefs) {
    const parts = [];
    if (prefs.type)   parts.push(prefs.type === 'rent' ? 'renting' : 'buying');
    if (prefs.budget) parts.push(`budget around ${prefs.budget}`);
    if (prefs.area)   parts.push(`in ${prefs.area}`);

    const summary = parts.length
      ? `Welcome back! 🌟 Last time you were looking to ${parts.join(', ')}. Want to pick up where you left off?`
      : 'Welcome back! 🌟 Great to see you again. Ready to keep searching?';

    addMessage(summary, 'bot');
    setQuickReplies(['go', 'menu', 'about']);
  }

  /* ---------- Boot ---------- */

  async function init() {
    const res = await fetch('conversation-map.json');
    map = await res.json();

    refs = buildWidget();

    /* Event listeners */
    refs.toggleBtn.addEventListener('click', () => {
      if (isOpen()) closeChat(); else openChat();
    });
    refs.closeBtn.addEventListener('click', closeChat);

    refs.sendBtn.addEventListener('click', () => {
      const text = refs.input.value.trim();
      if (!text) return;
      refs.input.value = '';
      handleUserText(text);
    });

    refs.input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        refs.sendBtn.click();
      }
    });

    /* First vs returning visit */
    const hasVisited  = sessionStorage.getItem(VISITED_KEY);
    const savedPrefs  = getPrefs();
    const savedHistory = JSON.parse(sessionStorage.getItem(HISTORY_KEY) || 'null');
    const wasOpen      = !!sessionStorage.getItem(OPEN_KEY);
    const savedQR      = JSON.parse(sessionStorage.getItem(QR_KEY) || '[]');

    if (savedHistory && savedHistory.length) {
      /* Refresh with existing history — restore silently */
      sessionStorage.setItem(VISITED_KEY, '1');
      restoreMessages(savedHistory);
      setQuickReplies(savedQR);
      if (wasOpen) {
        openChat();
      } else {
        refs.badge.hidden = false;
      }
    } else if (!hasVisited) {
      sessionStorage.setItem(VISITED_KEY, '1');
      setTimeout(() => {
        openChat();
        resolveOutput(map.settings.firstOutput || 'welcome');
      }, 1000);
    } else if (savedPrefs) {
      setTimeout(() => {
        openChat();
        returningGreeting(savedPrefs);
      }, 600);
      refs.badge.hidden = true;
    } else {
      refs.badge.hidden = false;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
