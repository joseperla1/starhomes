/* Cassie chatbot widget — Star Homes */
(function () {
  'use strict';

  const VISITED_KEY = 'cassie_visited';
  const PREFS_KEY   = 'cassie_prefs';
  const HISTORY_KEY = 'cassie_history';
  const OPEN_KEY    = 'cassie_open';
  const QR_KEY      = 'cassie_qr';
  const AVATAR_SRC  = 'starhomeslogo.png';
  const FB_AVATAR   = 'data:image/svg+xml,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60">' +
    '<rect width="60" height="60" rx="30" fill="#FFB6C1"/>' +
    '<ellipse cx="13" cy="22" rx="9" ry="11" fill="#FF69B4"/>' +
    '<ellipse cx="47" cy="22" rx="9" ry="11" fill="#FF69B4"/>' +
    '<ellipse cx="13" cy="22" rx="5" ry="7" fill="#FF1493" opacity="0.4"/>' +
    '<ellipse cx="47" cy="22" rx="5" ry="7" fill="#FF1493" opacity="0.4"/>' +
    '<circle cx="30" cy="33" r="21" fill="#FFB6C1"/>' +
    '<circle cx="22" cy="27" r="3" fill="#2d1b00"/>' +
    '<circle cx="38" cy="27" r="3" fill="#2d1b00"/>' +
    '<circle cx="23" cy="26" r="1" fill="white"/>' +
    '<circle cx="39" cy="26" r="1" fill="white"/>' +
    '<ellipse cx="30" cy="37" rx="10" ry="8" fill="#FF69B4"/>' +
    '<ellipse cx="26" cy="38" rx="2.5" ry="2" fill="#C24082"/>' +
    '<ellipse cx="34" cy="38" rx="2.5" ry="2" fill="#C24082"/>' +
    '</svg>'
  );

  const apartmentAreas = ['Wicker Park', 'River North', 'Logan Square', 'Lakeview', 'Old Town', 'West Loop', 'Pilsen'];
  const houseAreas = ['Lincoln Park', 'Bucktown', 'Andersonville', 'Hyde Park', 'Bronzeville', 'Roscoe Village', 'Ravenswood', 'Bridgeport', 'South Loop', 'Uptown', 'Avondale', 'Irving Park'];
  const apartmentNames = [
    'Milwaukee Ave Modern Studio',
    'River North Skyline Loft',
    'Logan Square Brick Retreat',
    'Lakeview Sunlit 2BR',
    'Old Town Courtyard Flat',
    'West Loop Corner Residence',
    'Pilsen Artist Loft'
  ];
  const houseNames = [
    'Lincoln Park Classic Townhome',
    'Bucktown Designer Row House',
    'Andersonville Family Home',
    'Hyde Park Heritage Residence',
    'Bronzeville Cornerstone Home',
    'Roscoe Village Garden House',
    'Ravenswood Tree-Lined Home',
    'Bridgeport Renovated Brick House',
    'South Loop Urban Townhouse',
    'Uptown Landmark Home',
    'Avondale Modern Single-Family',
    'Irving Park Spacious Estate'
  ];

  const localImageListings = [
    ...Array.from({ length: 7 }, (_, i) => ({
      title: apartmentNames[i] || `Apartment ${i + 1}`,
      area: apartmentAreas[i] || 'Chicago',
      price: 1650 + (i * 140),
      type: 'Rent',
      beds: i % 3 === 0 ? 'Studio' : `${(i % 3) + 1} bed${(i % 3) + 1 > 1 ? 's' : ''}`,
      baths: i % 2 === 0 ? '1 bath' : '2 baths',
      image: `assets/apartment${i + 1}.jpg`
    })),
    ...Array.from({ length: 12 }, (_, i) => ({
      title: houseNames[i] || `House ${i + 1}`,
      area: houseAreas[i] || 'Chicago',
      price: 345000 + (i * 28000),
      type: 'Buy',
      beds: `${3 + (i % 3)} beds`,
      baths: `${2 + (i % 2)} baths`,
      image: `assets/house${i + 1}.jpg`
    }))
  ];

  const supplementalListings = [
    { title: 'Uptown Efficient Studio', area: 'Uptown', price: 1250, type: 'Rent', beds: 'Studio', baths: '1 bath', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80' },
    { title: 'Rogers Park Starter Studio', area: 'Rogers Park', price: 1395, type: 'Rent', beds: 'Studio', baths: '1 bath', image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=900&q=80' },
    { title: 'Avondale Cozy 1BR', area: 'Avondale', price: 1475, type: 'Rent', beds: '1 bed', baths: '1 bath', image: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=900&q=80' },
    { title: 'Pilsen 2BR Value Flat', area: 'Pilsen', price: 1490, type: 'Rent', beds: '2 beds', baths: '1 bath', image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=900&q=80' },
    { title: 'Lakeview Classic 3BR Rental', area: 'Lakeview', price: 2480, type: 'Rent', beds: '3 beds', baths: '2 baths', image: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80' },
    { title: 'West Loop Family 3BR Rental', area: 'West Loop', price: 2395, type: 'Rent', beds: '3 beds', baths: '2 baths', image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=900&q=80' },

    { title: 'South Loop Entry Condo', area: 'South Loop', price: 289000, type: 'Buy', beds: '1 bed', baths: '1 bath', image: 'https://images.unsplash.com/photo-1515263487990-61b07816b324?auto=format&fit=crop&w=900&q=80' },
    { title: 'Ukrainian Village 1BR Condo', area: 'Ukrainian Village', price: 332000, type: 'Buy', beds: '1 bed', baths: '1 bath', image: 'https://images.unsplash.com/photo-1501876725168-00c445821c9e?auto=format&fit=crop&w=900&q=80' },
    { title: 'Hyde Park 2BR Condo', area: 'Hyde Park', price: 355000, type: 'Buy', beds: '2 beds', baths: '2 baths', image: 'https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=900&q=80' },
    { title: 'Bridgeport 2BR Townhome', area: 'Bridgeport', price: 372000, type: 'Buy', beds: '2 beds', baths: '2 baths', image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80' },
    { title: 'Irving Park 3BR Starter Home', area: 'Irving Park', price: 418000, type: 'Buy', beds: '3 beds', baths: '2 baths', image: 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=900&q=80' },
    { title: 'Portage Park 4BR Renovated Home', area: 'Portage Park', price: 498000, type: 'Buy', beds: '4 beds', baths: '3 baths', image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=900&q=80' }
  ];

  const demoListings = [...localImageListings, ...supplementalListings];

  function parseBedsCount(bedsLabel) {
    if (!bedsLabel) return null;
    if (/studio/i.test(String(bedsLabel))) return 0;
    const m = String(bedsLabel).match(/\d+/);
    return m ? parseInt(m[0], 10) : null;
  }

  function normalizeBuyBudget(budget) {
    if (budget === null || budget === undefined) return null;
    if (budget >= 10000) return budget;
    // The chat asks monthly budget; for buy mode, map to a rough purchase cap.
    return budget * 250;
  }

  function filterListingsByPrefs(allListings, prefs) {
    const mode = prefs && prefs.mode ? String(prefs.mode).toLowerCase() : null;
    const budget = prefs && prefs.budget !== undefined ? prefs.budget : null;
    const bedrooms = prefs && prefs.bedrooms !== undefined ? prefs.bedrooms : null;
    const area = prefs && prefs.area ? String(prefs.area).trim().toLowerCase() : '';
    const relaxed = !!(prefs && prefs.relaxed);

    const budgetCap = mode === 'buy'
      ? normalizeBuyBudget(budget)
      : (budget !== null && budget !== undefined ? budget : null);

    function sortByBudgetProximity(listings) {
      if (budgetCap === null || budgetCap === undefined) return listings;
      return listings.slice().sort((a, b) => {
        return Math.abs(Number(a.price) - budgetCap) - Math.abs(Number(b.price) - budgetCap);
      });
    }

    function matchesBedrooms(count, tolerance, allowStudioFlex) {
      if (bedrooms === null || bedrooms === undefined || count === null) return true;
      if (bedrooms >= 3) return count >= (allowStudioFlex ? 2 : 3);
      if (bedrooms === 0) {
        if (allowStudioFlex) return count <= 1;
        return count === 0;
      }
      return Math.abs(count - bedrooms) <= tolerance;
    }

    function applyFilter(config) {
      const useMode = config.useMode !== false;
      const useArea = config.useArea !== false;
      const useBudget = config.useBudget !== false;
      const useBedrooms = config.useBedrooms !== false;
      const tolerance = config.tolerance || 0;
      const budgetMultiplier = config.budgetMultiplier || 1;
      const allowStudioFlex = !!config.allowStudioFlex;

      return sortByBudgetProximity(
        allListings.filter((listing) => {
          const listingMode = String(listing.type || '').toLowerCase();
          if (useMode && mode && listingMode !== mode) return false;

          if (useBudget && budgetCap !== null && budgetCap !== undefined) {
            if (Number(listing.price) > budgetCap * budgetMultiplier) return false;
          }

          if (useBedrooms) {
            const count = parseBedsCount(listing.beds);
            if (!matchesBedrooms(count, tolerance, allowStudioFlex)) return false;
          }

          if (useArea && area) {
            const haystack = `${listing.area || ''} ${listing.title || ''}`.toLowerCase();
            if (!haystack.includes(area)) return false;
          }

          return true;
        })
      );
    }

    const strictBudgetMultiplier = relaxed ? (mode === 'buy' ? 1.15 : 1.3) : 1;
    const strictTolerance = relaxed ? 1 : 0;

    const strategies = [
      { useMode: true, useArea: true,  useBudget: true,  useBedrooms: true,  tolerance: strictTolerance, budgetMultiplier: strictBudgetMultiplier, allowStudioFlex: relaxed },
      { useMode: true, useArea: false, useBudget: true,  useBedrooms: true,  tolerance: strictTolerance, budgetMultiplier: strictBudgetMultiplier, allowStudioFlex: relaxed },
      { useMode: true, useArea: false, useBudget: true,  useBedrooms: true,  tolerance: strictTolerance + 1, budgetMultiplier: strictBudgetMultiplier * 1.1, allowStudioFlex: true },
      { useMode: true, useArea: false, useBudget: true,  useBedrooms: false, tolerance: 2, budgetMultiplier: strictBudgetMultiplier * 1.2, allowStudioFlex: true },
      { useMode: true, useArea: false, useBudget: false, useBedrooms: true,  tolerance: 2, budgetMultiplier: 99, allowStudioFlex: true },
      { useMode: true, useArea: false, useBudget: false, useBedrooms: false, tolerance: 3, budgetMultiplier: 99, allowStudioFlex: true },
      { useMode: false, useArea: false, useBudget: false, useBedrooms: false, tolerance: 3, budgetMultiplier: 99, allowStudioFlex: true }
    ];

    for (let i = 0; i < strategies.length; i++) {
      const matches = applyFilter(strategies[i]);
      if (matches.length) return matches;
    }

    return allListings;
  }

  const map = {"settings":{"botName":"Stella","teaser":"Hey! 👋 Looking for a place in Chicago?","firstOutput":"welcome","joinWith":"\n\n"},"handlers":{"searchListings":{"receives":{"mode":"rent|buy","budget":"number|null","bedrooms":"number|null","area":"string|null","relaxed":"boolean"},"returns":"array of { type, price, area } — empty array means no match"}},"text":{"greeting":"Hey! 👋 I'm Stella, your Star Homes guide.","capabilities":"Here's what I've got:\n\n🏠 Find you a place to rent or buy\n💸 Match you with a lender — coming soon\n🛋️ Help you find a roommate — coming soon","cta":"Chicago's got options. Ready to find yours?","start":"Let's do it! 🔥","askMode":"First things first — are you looking to rent or buy?","askBudget":"Got it! What's your monthly budget? (No worries if you're not sure — just give me a ballpark)","askBedrooms":"How many bedrooms do you need? (Studios count too!)","askArea":"Any particular neighbourhood you have your eye on? Or should I search city-wide?","searching":"Perfect — let me pull up some options for you! 🏠","results":"Here's what I found:","afterResults":"Nice pick! Want more info on one, similar places, or shall we talk next steps?","noMatch":"Nothing matching exactly — but I've got options just a little over budget. Want to see those, or should I widen the search area?","stillNoMatch":"Still nothing, sorry! 😕 Want to try a different budget or area?","lender":"Ooh, good call — lender matching is coming soon! 🔜\n\nRight now I'm all about finding you a place. Want to start there?","roommate":"Roommate matching is on the way! 🔜\n\nFor now, let's get you a place — you can always add a roommate to the mix later.","about":"We're Star Homes — a Chicago crew helping people find places they actually want to live. Renting, buying, all of it. 🏙️","restart":"No problem, starting fresh! ✨","fallback1":"Hmm, didn't quite catch that! 🤔 Try one of these:","fallback2":"Still not getting it — my bad! Tap a button below and I'll take it from there. 👇","fbIntro":"I can connect your Facebook Messenger account so you receive property updates and can message us directly! 📱\n\nTap the button below to link your account — it only takes a moment."},"options":{"go":{"label":"Let's go 🔎","output":"start"},"findPlace":{"label":"Find me a place","output":"start"},"about":{"label":"What's Star Homes?","output":"about"},"menu":{"label":"Show me the menu","output":"menu"},"whatCanYouDo":{"label":"What can you do?","output":"menu"},"showOver":{"label":"Show me those","output":"searchRelaxed"},"widen":{"label":"Widen the search","output":"askAreaAgain"},"fbOffer":{"label":"Connect Facebook","output":"fbMessenger"},"fbConnect":{"label":"Connect Facebook","output":"fbMessenger"}},"outputs":{"welcome":{"text":["greeting","capabilities","cta"],"options":["go","about","fbOffer"]},"menu":{"text":["capabilities","cta"],"options":["go","about","fbOffer"]},"start":{"text":["start"],"options":[],"startFlow":"propertySearch"},"lender":{"text":["lender"],"options":["go","menu"]},"roommate":{"text":["roommate"],"options":["findPlace","menu"]},"about":{"text":["about"],"options":["findPlace","menu"]},"restart":{"text":["restart","capabilities","cta"],"options":["go","about"],"clearAnswers":true},"fallback1":{"text":["fallback1"],"options":["findPlace","whatCanYouDo"]},"fallback2":{"text":["fallback2"],"options":["findPlace","whatCanYouDo"]},"results":{"text":["results"],"options":[],"renderListings":true,"then":"afterResults"},"afterResults":{"text":["afterResults"],"options":[]},"noMatch":{"text":["noMatch"],"options":["showOver","widen"]},"stillNoMatch":{"text":["stillNoMatch"],"options":["findPlace","menu"]},"searchRelaxed":{"text":["searching"],"options":[],"call":"searchListings","relaxed":true,"onResults":"results","onEmpty":"stillNoMatch"},"askAreaAgain":{"text":["askArea"],"options":[],"resumeFlow":"propertySearch","atStep":"area"},"fbMessenger":{"text":["fbIntro"],"options":["fbConnect"]}},"flows":{"propertySearch":{"firstStep":"mode","prefillFromInput":true,"steps":{"mode":{"ask":"askMode","options":[{"label":"Rent","value":"rent"},{"label":"Buy","value":"buy"}],"save":"mode","parse":"choice","next":"budget"},"budget":{"ask":"askBudget","options":[{"label":"Under $1,500","value":1500},{"label":"$1,500–2,500","value":2500},{"label":"Not sure","value":null}],"save":"budget","parse":"number","optional":true,"next":"bedrooms"},"bedrooms":{"ask":"askBedrooms","options":[{"label":"Studio","value":0},{"label":"1","value":1},{"label":"2","value":2},{"label":"3+","value":3}],"save":"bedrooms","parse":"number","next":"area"},"area":{"ask":"askArea","options":[{"label":"City-wide","value":null}],"save":"area","parse":"text","optional":true,"next":null}},"onComplete":{"text":["searching"],"call":"searchListings","onResults":"results","onEmpty":"noMatch"}}},"globalInputs":[{"keywords":["start over","restart","go back","never mind","nevermind","reset"],"output":"restart"},{"keywords":["menu","help","options","what can you do","what do you do"],"output":"menu"}],"inputs":[{"keywords":["lender","loan","mortgage","financing","finance","credit","afford"],"output":"lender"},{"keywords":["roommate","roomie","housemate","share a place","sharing"],"output":"roommate"},{"keywords":["star homes","about you","who are you","what is this","company"],"output":"about"},{"keywords":["let's go","lets go","yes","yeah","yep","sure","start","find","place","apartment","rent","buy","looking","search","browse"],"output":"start"}],"prefill":[{"slot":"budget","parse":"number"},{"slot":"mode","parse":"choice","match":{"rent":["rent","renting","rental"],"buy":["buy","buying","purchase","own"]}},{"slot":"bedrooms","parse":"bedrooms"}],"fallback":["fallback1","fallback2"]};

  let chat = null;
  let refs = null;

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
    const messages    = el('div', { className: 'cassie-messages', id: 'cassie-messages', role: 'log', 'aria-live': 'polite', 'aria-label': 'Chat messages' });
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

    const avatarSm   = el('img', { src: AVATAR_SRC, alt: '', className: 'cassie-avatar-sm', 'aria-hidden': 'true' });
    const titleSpan  = el('span', { className: 'cassie-title', id: 'cassie-dialog-title' }, 'Cassie');
    const subtitleSpan = el('span', { className: 'cassie-subtitle' }, 'Star Homes Guide ✨');
    const headerInfo = el('div', { className: 'cassie-header-info' }, avatarSm, el('div', {}, titleSpan, subtitleSpan));

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

    const widget = el('div', { className: 'cassie-widget', id: 'cassie-widget', 'aria-label': 'Cassie chat assistant' }, chatWindow, toggleBtn);
    document.body.appendChild(widget);

    return { chatWindow, messages, quickReplies, input, sendBtn, closeBtn, toggleBtn, badge };
  }

  /* ---------- Open / close ---------- */

  function isOpen() { return !refs.chatWindow.hidden; }

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

  function scrollBottom() { refs.messages.scrollTop = refs.messages.scrollHeight; }

  function saveHistory() {
    const msgs = Array.from(refs.messages.children)
      .filter((node) => node.classList && node.classList.contains('cassie-msg'))
      .map((m) => {
        const bubble = m.querySelector('.cassie-bubble');
        return {
          type: m.classList.contains('cassie-msg--user') ? 'user' : 'bot',
          html: bubble ? bubble.innerHTML : ''
        };
      });
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
      msg.style.animation = 'none';
      if (type === 'bot') {
        const av = el('img', { src: AVATAR_SRC, alt: '', className: 'cassie-msg-avatar', 'aria-hidden': 'true' });
        msg.appendChild(av);
      }
      const bubble = el('div', { className: 'cassie-bubble' });
      bubble.innerHTML = html;
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

  function renderListings(listings) {
    const wrapper = el('div', { className: 'cassie-listings' });

    (listings || []).forEach((listing) => {
      const card = el('article', { className: 'cassie-listing-card' });

      const imgWrap = el('div', { className: 'cassie-listing-image' });
      const photo = el('div', {
        className: 'cassie-listing-photo',
        style: listing.image ? `background-image: url(${listing.image});` : ''
      });
      imgWrap.appendChild(photo);

      const body = el('div', { className: 'cassie-listing-body' });
      const title = el('h4', { className: 'cassie-listing-title' }, listing.title || 'Property');
      const meta = el('div', { className: 'cassie-listing-meta' }, `${listing.area || 'Chicago'} · ${listing.type || 'Property'}`);
      const price = el('div', { className: 'cassie-listing-price' }, listing.price ? ('$' + Number(listing.price).toLocaleString()) : 'Price on request');
      const specs = el('div', { className: 'cassie-listing-specs' }, `${listing.beds || '—'} · ${listing.baths || '—'}`);

      body.appendChild(title);
      body.appendChild(meta);
      body.appendChild(price);
      body.appendChild(specs);
      card.appendChild(imgWrap);
      card.appendChild(body);
      wrapper.appendChild(card);
    });

    refs.messages.appendChild(wrapper);
    scrollBottom();
    saveHistory();
  }

  /* Render a Response object from window.StarChat */
  function renderResponse(resp) {
    showTyping();
    setTimeout(() => {
      hideTyping();
      addMessage(resp.message, 'bot');
      if (resp.listings && resp.listings.length) renderListings(resp.listings);
      if (resp.followUp) setTimeout(() => addMessage(resp.followUp, 'bot'), 600);
      setQuickReplies(resp.options);
    }, 900);
  }

  /* options: [{key, label}] from engine Response */
  function setQuickReplies(options) {
    refs.quickReplies.innerHTML = '';
    sessionStorage.setItem(QR_KEY, JSON.stringify(options || []));
    if (!options || !options.length) return;

    options.forEach(({ key, label }) => {
      if (key === 'fbConnect' || key === 'fbOffer') {
        const fbBtn = el('button', { className: 'cassie-qr cassie-qr--fb', type: 'button' });
        fbBtn.innerHTML = '<span class="fb-qr-f">f</span> Connect Facebook';
        fbBtn.addEventListener('click', () => {
          setQuickReplies([]);
          openFBModal();
        });
        refs.quickReplies.appendChild(fbBtn);
        return;
      }
      const btn = el('button', { className: 'cassie-qr', type: 'button' }, label);
      btn.addEventListener('click', () => {
        addMessage(label, 'user');
        setQuickReplies([]);
        let resp;
        try {
          resp = chat.choose(key);
        } catch (e) {
          // stale step key after a page refresh — fall back to text matching
          resp = chat.send(label);
        }
        renderResponse(resp);
      });
      refs.quickReplies.appendChild(btn);
    });
  }

  /* ---------- Returning user ---------- */

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
    setQuickReplies(['go', 'menu', 'about'].map(k => ({ key: k, label: map.options[k].label })));
  }

  /* ---------- Facebook Messenger Modal ---------- */

  function buildFBModal() {
    const overlay = el('div', {
      className: 'fb-modal-overlay',
      role: 'dialog',
      'aria-modal': 'true',
      'aria-label': 'Connect Facebook Messenger'
    });

    const dialog = el('div', { className: 'fb-dialog' });

    // Header
    const fbHeader = el('div', { className: 'fb-logo-header' });
    fbHeader.innerHTML =
      '<svg class="fb-logo-icon" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">' +
      '<circle cx="20" cy="20" r="20" fill="white"/>' +
      '<text x="21" y="29" text-anchor="middle" fill="#1877F2" font-size="24" font-weight="bold" font-family="helvetica,arial,sans-serif">f</text>' +
      '</svg>' +
      '<h2>Connect to Star Homes</h2>' +
      '<p>facebook.com</p>';

    // Step 1 — account confirmation
    const step1 = el('div', { className: 'fb-step', id: 'fb-step-1' });
    const accountRow = el('div', { className: 'fb-account-row' });
    const avatar = el('img', { className: 'fb-avatar', src: FB_AVATAR, alt: '' });
    const accountInfo = el('div', { className: 'fb-account-info' });
    accountInfo.appendChild(el('div', { className: 'fb-account-name' }, 'John Pork'));
    accountInfo.appendChild(el('div', { className: 'fb-account-sub' }, 'facebook.com/johnpork'));
    const checkIcon = el('div', { className: 'fb-check' });
    checkIcon.innerHTML = '<svg viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    accountRow.appendChild(avatar);
    accountRow.appendChild(accountInfo);
    accountRow.appendChild(checkIcon);
    const continueBtn = el('button', { className: 'fb-btn', id: 'fb-continue' }, 'Continue as John Pork');
    const notYouBtn   = el('button', { className: 'fb-btn--secondary', id: 'fb-notyou' }, 'Not you? Use a different account');
    step1.appendChild(accountRow);
    step1.appendChild(continueBtn);
    step1.appendChild(notYouBtn);

    // Step 2 — permissions
    const step2 = el('div', { className: 'fb-step', id: 'fb-step-2' });
    step2.hidden = true;
    const permList = el('ul', { className: 'fb-permissions' });
    ['Access your public profile (name & photo)', 'Send you messages on Messenger', 'Notify you about property listings'].forEach(p => {
      permList.appendChild(el('li', {}, p));
    });
    const allowBtn  = el('button', { className: 'fb-btn',           id: 'fb-allow'  }, 'Allow');
    const cancelBtn = el('button', { className: 'fb-btn--secondary', id: 'fb-cancel' }, 'Cancel');
    step2.appendChild(el('p', { className: 'fb-perm-heading' }, 'Star Homes would like to:'));
    step2.appendChild(permList);
    step2.appendChild(el('p', { className: 'fb-perm-note' }, 'You control what Star Homes can access in your privacy settings.'));
    step2.appendChild(el('hr', { className: 'fb-divider' }));
    step2.appendChild(allowBtn);
    step2.appendChild(cancelBtn);

    // Step 3 — loading
    const step3 = el('div', { className: 'fb-loading', id: 'fb-step-3' });
    step3.hidden = true;
    step3.innerHTML = '<div class="fb-loading-ring"></div><p>Linking your account…</p>';

    // Step 4 — success
    const step4 = el('div', { className: 'fb-success', id: 'fb-step-4' });
    step4.hidden = true;
    step4.innerHTML =
      '<div class="fb-success-icon">' +
      '<svg viewBox="0 0 26 26" fill="none"><path d="M4 13l7 7 11-11" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      '</div>' +
      '<h3>Account Linked!</h3>' +
      '<p>@johnpork is now connected<br>to Star Homes</p>';
    const doneBtn = el('button', { className: 'fb-btn', id: 'fb-done' }, 'Done');
    step4.appendChild(doneBtn);

    dialog.appendChild(fbHeader);
    dialog.appendChild(step1);
    dialog.appendChild(step2);
    dialog.appendChild(step3);
    dialog.appendChild(step4);
    overlay.appendChild(dialog);
    return overlay;
  }

  function openFBModal() {
    const modal = buildFBModal();
    document.body.appendChild(modal);

    const step1 = modal.querySelector('#fb-step-1');
    const step2 = modal.querySelector('#fb-step-2');
    const step3 = modal.querySelector('#fb-step-3');
    const step4 = modal.querySelector('#fb-step-4');

    modal.querySelector('#fb-continue').addEventListener('click', () => {
      step1.hidden = true;
      step2.hidden = false;
    });

    modal.querySelector('#fb-allow').addEventListener('click', () => {
      step2.hidden = true;
      step3.hidden = false;
      setTimeout(() => {
        step3.hidden = true;
        step4.hidden = false;
      }, 1800);
    });

    modal.querySelector('#fb-cancel').addEventListener('click', () => {
      modal.remove();
      addMessage('No worries! You can connect Messenger any time from the menu. 👍', 'bot');
      setQuickReplies([
        { key: 'go',   label: 'Let\'s go 🔎' },
        { key: 'menu', label: 'Show me the menu' }
      ]);
    });

    modal.querySelector('#fb-done').addEventListener('click', () => {
      modal.remove();
      showTyping();
      setTimeout(() => {
        hideTyping();
        addMessage('🎉 Your Facebook Messenger account is now linked! You\'ll receive property updates in Messenger and can reach us there anytime. 🏠', 'bot');
        setQuickReplies([
          { key: 'go',   label: 'Let\'s go 🔎' },
          { key: 'menu', label: 'Show me the menu' }
        ]);
      }, 900);
    });
  }

  /* ---------- Boot ---------- */

  function init() {
    chat = window.StarChat.createChat(map, {
      searchListings: function (prefs) {
        const safePrefs = prefs || {};
        try {
          localStorage.setItem(PREFS_KEY, JSON.stringify({
            type: safePrefs.mode || null,
            budget: safePrefs.budget || null,
            bedrooms: safePrefs.bedrooms || null,
            area: safePrefs.area || null
          }));
        } catch (_) {
          // Ignore storage failures to keep chat responsive.
        }
        return filterListingsByPrefs(demoListings, safePrefs);
      }
    });
    refs = buildWidget();

    refs.toggleBtn.addEventListener('click', () => {
      if (isOpen()) closeChat(); else openChat();
    });
    refs.closeBtn.addEventListener('click', closeChat);

    refs.sendBtn.addEventListener('click', () => {
      const text = refs.input.value.trim();
      if (!text) return;
      refs.input.value = '';
      addMessage(text, 'user');
      setQuickReplies([]);
      renderResponse(chat.send(text));
    });

    refs.input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        refs.sendBtn.click();
      }
    });

    const hasVisited   = sessionStorage.getItem(VISITED_KEY);
    const savedPrefs   = getPrefs();
    const savedHistory = JSON.parse(sessionStorage.getItem(HISTORY_KEY) || 'null');
    const wasOpen      = !!sessionStorage.getItem(OPEN_KEY);
    const savedQR      = JSON.parse(sessionStorage.getItem(QR_KEY) || '[]');

    if (savedHistory && savedHistory.length) {
      sessionStorage.setItem(VISITED_KEY, '1');
      restoreMessages(savedHistory);
      setQuickReplies(savedQR);
      if (wasOpen) openChat(); else refs.badge.hidden = false;
    } else if (!hasVisited) {
      sessionStorage.setItem(VISITED_KEY, '1');
      setTimeout(() => {
        openChat();
        renderResponse(chat.start());
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
