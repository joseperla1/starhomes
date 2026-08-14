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
      if (output.event === 'FACEBOOK_CONNECT') {
        setTimeout(showFacebookModal, 500);
      }
    }, 900);
  }

  function startSearch() {
    setTimeout(() => {
      addMessage('Here are some of our featured properties — scroll down to browse, or tell me what you\'re looking for! 🏙️', 'bot');
      setQuickReplies(['menu', 'about']);
    }, 700);
  }

  /* ---------- Facebook Connect Modal ---------- */

  function showFacebookModal() {
    const pigSvg = [
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">',
        '<circle cx="40" cy="40" r="40" fill="#F9C0D0"/>',
        '<circle cx="27" cy="31" r="5.5" fill="#2d2d2d"/>',
        '<circle cx="53" cy="31" r="5.5" fill="#2d2d2d"/>',
        '<circle cx="29" cy="29" r="2.2" fill="#fff"/>',
        '<circle cx="55" cy="29" r="2.2" fill="#fff"/>',
        '<ellipse cx="40" cy="53" rx="15" ry="10" fill="#F0A0BB"/>',
        '<ellipse cx="33.5" cy="54" rx="4" ry="3.8" fill="#C86080"/>',
        '<ellipse cx="46.5" cy="54" rx="4" ry="3.8" fill="#C86080"/>',
      '</svg>'
    ].join('');
    const JOHN_PORK_AVATAR = 'data:image/svg+xml;base64,' + btoa(pigSvg);

    const overlay = document.createElement('div');
    overlay.className = 'fb-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Connect your Facebook account');

    const modal = document.createElement('div');
    modal.className = 'fb-modal';
    overlay.appendChild(modal);

    function makeFbLogo() {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.setAttribute('class', 'fb-logo-icon');
      svg.setAttribute('aria-hidden', 'true');
      svg.innerHTML = '<path fill="#fff" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>';
      return svg;
    }

    function makeHeader(onClose) {
      const header = document.createElement('div');
      header.className = 'fb-header';

      const logoWrap = document.createElement('div');
      logoWrap.className = 'fb-header-logo';
      logoWrap.appendChild(makeFbLogo());
      const wm = document.createElement('span');
      wm.className = 'fb-wordmark';
      wm.textContent = 'facebook';
      logoWrap.appendChild(wm);
      header.appendChild(logoWrap);

      const closeBtn = document.createElement('button');
      closeBtn.className = 'fb-header-close';
      closeBtn.setAttribute('aria-label', 'Close');
      closeBtn.textContent = '×';
      closeBtn.addEventListener('click', onClose);
      header.appendChild(closeBtn);

      return header;
    }

    function dismiss() {
      overlay.classList.add('fb-overlay--closing');
      setTimeout(() => overlay.remove(), 300);
    }

    function renderScreen1() {
      modal.innerHTML = '';
      modal.appendChild(makeHeader(dismiss));

      const body = document.createElement('div');
      body.className = 'fb-body';

      const title = document.createElement('h2');
      title.className = 'fb-title';
      title.textContent = 'Log in with Facebook';
      body.appendChild(title);

      const sub = document.createElement('p');
      sub.className = 'fb-subtitle';
      sub.textContent = 'Star Homes is requesting access to your Facebook account.';
      body.appendChild(sub);

      /* Profile card */
      const card = document.createElement('div');
      card.className = 'fb-profile-card';

      const pic = document.createElement('img');
      pic.src = JOHN_PORK_AVATAR;
      pic.alt = 'John Pork';
      pic.className = 'fb-profile-pic';
      card.appendChild(pic);

      const info = document.createElement('div');
      info.className = 'fb-profile-info';
      const nameEl = document.createElement('span');
      nameEl.className = 'fb-profile-name';
      nameEl.textContent = 'John Pork';
      const handleEl = document.createElement('span');
      handleEl.className = 'fb-profile-handle';
      handleEl.textContent = '@johnpork';
      info.appendChild(nameEl);
      info.appendChild(handleEl);
      card.appendChild(info);

      const checkDiv = document.createElement('div');
      checkDiv.className = 'fb-profile-check';
      const checkSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      checkSvg.setAttribute('viewBox', '0 0 24 24');
      checkSvg.setAttribute('aria-hidden', 'true');
      checkSvg.innerHTML = '<polyline points="20 6 9 17 4 12"/>';
      checkDiv.appendChild(checkSvg);
      card.appendChild(checkDiv);
      body.appendChild(card);

      const continueBtn = document.createElement('button');
      continueBtn.className = 'fb-btn-primary';
      continueBtn.textContent = 'Continue as John Pork';
      continueBtn.addEventListener('click', renderScreen2);
      body.appendChild(continueBtn);

      const switchBtn = document.createElement('button');
      switchBtn.className = 'fb-switch-link';
      switchBtn.textContent = 'Not you? Switch accounts';

      const switchMsg = document.createElement('span');
      switchMsg.className = 'fb-switch-msg';
      switchMsg.hidden = true;
      switchMsg.textContent = 'No other accounts found. Continue as John Pork.';

      switchBtn.addEventListener('click', () => {
        switchMsg.hidden = false;
        switchBtn.disabled = true;
        switchBtn.style.opacity = '.5';
      });

      body.appendChild(switchBtn);
      body.appendChild(switchMsg);
      modal.appendChild(body);

      const footer = document.createElement('div');
      footer.className = 'fb-footer';
      footer.innerHTML = 'By continuing, Facebook will share your name, profile picture, and email address with Star Homes. <a href="#" onclick="return false">Privacy Policy</a> · <a href="#" onclick="return false">Terms of Service</a>';
      modal.appendChild(footer);
    }

    function renderScreen2() {
      modal.innerHTML = '';
      modal.appendChild(makeHeader(dismiss));

      const body = document.createElement('div');
      body.className = 'fb-body';

      const backBtn = document.createElement('button');
      backBtn.className = 'fb-back-btn';
      backBtn.textContent = '← Back';
      backBtn.addEventListener('click', renderScreen1);
      body.appendChild(backBtn);

      const title = document.createElement('h2');
      title.className = 'fb-title';
      title.textContent = 'Star Homes would like to access:';
      body.appendChild(title);

      const perms = [
        { icon: '👤', label: 'Your name and profile picture', desc: 'To personalise your account' },
        { icon: '📧', label: 'Your email address',            desc: 'For alerts and sign-in'        },
        { icon: '🏠', label: 'Property search history',       desc: 'To save and resume searches'   },
      ];

      const list = document.createElement('ul');
      list.className = 'fb-permission-list';

      perms.forEach(perm => {
        const item = document.createElement('li');
        item.className = 'fb-permission-item';

        const icon = document.createElement('div');
        icon.className = 'fb-perm-icon';
        icon.textContent = perm.icon;
        item.appendChild(icon);

        const textDiv = document.createElement('div');
        textDiv.className = 'fb-perm-text';
        textDiv.textContent = perm.label;
        const small = document.createElement('small');
        small.textContent = perm.desc;
        textDiv.appendChild(small);
        item.appendChild(textDiv);

        const toggle = document.createElement('div');
        toggle.className = 'fb-perm-toggle';
        toggle.setAttribute('aria-label', 'Enabled');
        item.appendChild(toggle);

        list.appendChild(item);
      });

      body.appendChild(list);

      const allowBtn = document.createElement('button');
      allowBtn.className = 'fb-btn-primary';
      allowBtn.textContent = 'Allow';
      allowBtn.addEventListener('click', renderScreen3);
      body.appendChild(allowBtn);

      const declineBtn = document.createElement('button');
      declineBtn.className = 'fb-btn-secondary';
      declineBtn.textContent = 'Decline';
      declineBtn.addEventListener('click', dismiss);
      body.appendChild(declineBtn);

      modal.appendChild(body);

      const footer = document.createElement('div');
      footer.className = 'fb-footer';
      footer.innerHTML = 'By clicking Allow, you agree to the <a href="#" onclick="return false">Facebook Platform Terms</a> and acknowledge the <a href="#" onclick="return false">Developer Policies</a>. You can remove app access in Facebook Settings at any time.';
      modal.appendChild(footer);
    }

    function renderScreen3() {
      modal.innerHTML = '';
      modal.appendChild(makeHeader(() => {})); /* close disabled during linking */

      const loading = document.createElement('div');
      loading.className = 'fb-loading';

      const spinner = document.createElement('div');
      spinner.className = 'fb-spinner';
      loading.appendChild(spinner);

      const loadingText = document.createElement('p');
      loadingText.className = 'fb-loading-text';
      loadingText.textContent = 'Linking your account…';
      loading.appendChild(loadingText);

      modal.appendChild(loading);

      /* After 1.8 s close and fire Cassie's success message */
      setTimeout(() => {
        overlay.classList.add('fb-overlay--closing');
        setTimeout(() => {
          overlay.remove();
          resolveOutput('fbLinked');
        }, 300);
      }, 1800);
    }

    renderScreen1();
    document.body.appendChild(overlay);

    /* Click outside modal to dismiss */
    overlay.addEventListener('click', e => { if (e.target === overlay) dismiss(); });
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
