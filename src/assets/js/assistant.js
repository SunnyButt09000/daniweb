/* Veltrix website assistant.
   Runs entirely in the browser. Answers from the site's own knowledge base (/assets/data/kb.json,
   generated at build time from the products, repairs, FAQs and business details), guides visitors
   through quote and repair requests, and hands over to WhatsApp for anything it can't answer. */
(() => {
  'use strict';
  const VX = window.VX || {};
  const KEY = 'vx-chat';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- text utilities ---------- */
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const SYN = {
    window: ['windows', 'khidki', 'khirki', 'casements'],
    door: ['doors', 'darwaza', 'darwaze', 'darwazay'],
    price: ['prices', 'pricing', 'cost', 'costs', 'costing', 'qeemat', 'qimat', 'kimat', 'rate', 'rates', 'charges', 'expensive', 'cheap', 'afford'],
    misted: ['mist', 'misty', 'foggy', 'fog', 'fogged', 'cloudy', 'steamy', 'steamed', 'hazy', 'milky', 'blown'],
    draught: ['draughts', 'draft', 'drafts', 'drafty', 'draughty', 'breeze'],
    lock: ['locks', 'locking', 'tala', 'lockd'],
    guarantee: ['warranty', 'warranties', 'guarantees', 'guaranty', 'guarentee', 'warrenty'],
    repair: ['repairs', 'fix', 'fixing', 'fixed', 'mend', 'mending', 'broken', 'broke', 'faulty', 'theek'],
    colour: ['color', 'colours', 'colors'],
    grey: ['gray'],
    install: ['installation', 'installing', 'installed', 'fitting', 'fitted', 'fit', 'lagana', 'lagwana'],
    quote: ['quotation', 'quotes', 'estimate', 'estimates', 'quoting'],
    leak: ['leaking', 'leaks', 'leaky'],
    handle: ['handles'],
    hinge: ['hinges'],
    glass: ['glazing', 'pane', 'panes', 'sheesha', 'shisha'],
    upvc: ['pvc', 'u-pvc', 'plastic'],
    bifold: ['bi-fold', 'bifolds', 'folding'],
  };
  const CANON = {};
  Object.entries(SYN).forEach(([k, arr]) => { CANON[k] = k; arr.forEach((w) => (CANON[w] = k)); });
  const STOP = new Set('a an the i im i\'m me my we our you your is are am be been was were do does did can could would should will to of in on at for with and or but if it its it\'s this that these those there here what which who whom how why when where any some about from by as have has had get got just please hi hello hey thanks thank need want like know tell show give much many mine'.split(' '));
  const norm = (s) => String(s).toLowerCase().replace(/[’‘`]/g, "'").replace(/[^a-z0-9'\s-]/g, ' ').replace(/-/g, ' ').replace(/\s+/g, ' ').trim();
  const stem = (w) => {
    if (CANON[w]) return CANON[w];
    let s = w.replace(/'s$/, '');
    if (s.length > 5 && s.endsWith('ing')) s = s.slice(0, -3);
    else if (s.length > 4 && s.endsWith('ed')) s = s.slice(0, -2);
    else if (s.length > 3 && s.endsWith('s') && !s.endsWith('ss')) s = s.slice(0, -1);
    return CANON[s] || s;
  };
  const tokens = (s) => norm(s).split(' ').filter((w) => w && !STOP.has(w)).map(stem);
  const lev = (a, b) => {
    if (Math.abs(a.length - b.length) > 2) return 9;
    const dp = Array.from({ length: a.length + 1 }, (_, i) => [i]);
    for (let j = 1; j <= b.length; j++) dp[0][j] = j;
    for (let i = 1; i <= a.length; i++)
      for (let j = 1; j <= b.length; j++)
        dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return dp[a.length][b.length];
  };

  /* ---------- knowledge base ---------- */
  let KB = null;
  let kbPromise = null;
  const loadKB = () =>
    (kbPromise ||= fetch(`/assets/data/kb.json?v=${VX.v || ''}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((j) => (KB = buildIndex(j)))
      .catch(() => (KB = buildIndex({ business: {}, faqs: [], repairs: [], products: [], services: [], guides: [] }))));

  function buildIndex(kb) {
    const docs = [];
    const add = (type, item, keys, title) => {
      const phrases = keys.map(tokens).filter((p) => p.length > 1);
      const words = new Set([...tokens(title), ...keys.flatMap((k) => tokens(k))]);
      docs.push({ type, item, phrases, words: [...words].filter((w) => w.length > 2) });
    };
    kb.faqs.forEach((f) => add('faq', f, f.k, f.q));
    kb.repairs.forEach((r) => add('repair', r, r.k, r.name));
    kb.products.forEach((p) => add('product', p, p.k, p.name));
    kb.services.forEach((s) => add('service', s, [s.name], s.name + ' ' + s.short));
    kb.guides.forEach((g) => add('guide', g, [], g.title));
    // inverse document frequency: rare, specific words count for more than common ones
    const df = {};
    docs.forEach((d) => new Set(d.words).forEach((w) => (df[w] = (df[w] || 0) + 1)));
    const N = docs.length || 1;
    const idf = (w) => Math.log(1 + N / (df[w] || 1));
    return { ...kb, docs, idf };
  }

  const PROBLEM = /\b(repair|fix|broken|broke|won'?t|wont|doesn'?t|not|stuck|problem|issue|leak|leaking|draught|draft|misted|foggy|cloudy|stiff|hard|heavy|drop|dropped|loose|crack|cracked|snapped|jammed|sticking|catching|faulty|damaged)\b/i;

  function search(text) {
    const T = tokens(text);
    const problem = PROBLEM.test(norm(text));
    const scored = KB.docs.map((d) => {
      let s = 0;
      const set = new Set(d.words);
      const seen = new Set();
      T.forEach((t) => {
        if (t.length < 3 || seen.has(t)) return;
        seen.add(t);
        if (set.has(t)) s += KB.idf(t);
        else if (t.length >= 5) {
          const near = d.words.find((w) => w.length >= 5 && lev(t, w) <= (t.length >= 8 ? 2 : 1));
          if (near) s += 0.5 * KB.idf(near);
        }
      });
      d.phrases.forEach((p) => {
        for (let i = 0; i + p.length <= T.length; i++) {
          if (p.every((w, j) => T[i + j] === w)) { s += 0.8 * p.reduce((a, w) => a + KB.idf(w), 0); break; }
        }
      });
      if (d.type === 'repair' && !problem) s *= 0.7;
      if (d.type === 'product' && problem) s *= 0.75;
      return { d, s };
    });
    scored.sort((a, b) => b.s - a.s);
    return scored.filter((x) => x.s > 0).slice(0, 4);
  }

  /* ---------- DOM ---------- */
  const mark = '<svg width="22" height="22" viewBox="0 0 32 32" aria-hidden="true"><rect x="1.5" y="1.5" width="29" height="29" fill="none" stroke="currentColor" stroke-width="3"/><path d="M16 3v26M3 13h26" stroke="currentColor" stroke-width="2.5"/><rect x="18.5" y="15.5" width="9.5" height="11.5" fill="#b98a45"/></svg>';
  const ico = {
    close: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>',
    reset: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',
    send: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/></svg>',
  };

  const launch = document.createElement('button');
  launch.type = 'button';
  launch.className = 'vxa-launch';
  launch.setAttribute('aria-haspopup', 'dialog');
  launch.innerHTML = `<span class="vxa-launch__av">${mark}</span><span>Questions? Ask us</span>`;

  const panel = document.createElement('section');
  panel.className = 'vxa';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', `${VX.brand || 'Website'} assistant`);
  panel.setAttribute('aria-hidden', 'true');
  panel.innerHTML = `
  <header class="vxa__head">
    <span class="vxa__av">${mark}</span>
    <div class="vxa__title"><strong>${esc(VX.brand || '')} Assistant</strong><span>Instant answers, any time</span></div>
    <button type="button" class="vxa__btn" data-reset aria-label="Start a new conversation" title="Start again">${ico.reset}</button>
    <button type="button" class="vxa__btn" data-close aria-label="Close assistant">${ico.close}</button>
  </header>
  <div class="vxa__log" role="log" aria-live="polite" aria-relevant="additions"></div>
  <form class="vxa__form" autocomplete="off">
    <label class="sr" for="vxa-input">Type your question</label>
    <input id="vxa-input" type="text" maxlength="300" placeholder="Ask about windows, doors, repairs…" enterkeyhint="send">
    <button type="submit" class="vxa__send" aria-label="Send">${ico.send}</button>
  </form>
  <p class="vxa__foot">Automated assistant · For a person, <a href="https://wa.me/${VX.wa}" target="_blank" rel="noopener">WhatsApp us</a> · <a href="/privacy/">Privacy</a></p>`;
  document.body.append(launch, panel);

  const log = panel.querySelector('.vxa__log');
  const form = panel.querySelector('form');
  const input = panel.querySelector('input');

  /* ---------- state ---------- */
  let state = { msgs: [], flow: null, data: {}, chips: [] };
  try { const s = JSON.parse(sessionStorage.getItem(KEY)); if (s && Array.isArray(s.msgs)) state = s; } catch { /* ignore */ }
  const save = () => { try { sessionStorage.setItem(KEY, JSON.stringify({ ...state, msgs: state.msgs.slice(-40) })); } catch { /* ignore */ } };

  /* ---------- rendering ---------- */
  function bubble(who, html, animate = true) {
    const el = document.createElement('div');
    el.className = `vxa__msg vxa__msg--${who}`;
    if (!animate) el.style.animation = 'none';
    el.innerHTML = html;
    log.append(el);
    return el;
  }
  function renderChips(chips) {
    log.querySelectorAll('.vxa__chips').forEach((c) => c.remove());
    if (!chips?.length) return;
    const wrap = document.createElement('div');
    wrap.className = 'vxa__chips';
    chips.forEach((c) => {
      const b = document.createElement(c.href ? 'a' : 'button');
      b.className = `vxa__chip${c.wa ? ' vxa__chip--wa' : ''}`;
      b.textContent = c.label;
      if (c.href) {
        b.href = c.href;
        if (/^https?:/.test(c.href)) { b.target = '_blank'; b.rel = 'noopener'; }
      } else {
        b.type = 'button';
        b.addEventListener('click', () => handle(c.say || c.label, c));
      }
      wrap.append(b);
    });
    log.append(wrap);
  }
  function card(text, label = 'Send on WhatsApp') {
    const el = document.createElement('div');
    el.className = 'vxa__card';
    el.innerHTML = `<pre>${esc(text)}</pre><a class="btn btn--wa" href="${waUrl(text)}" target="_blank" rel="noopener"><span>${esc(label)}</span></a>`;
    log.append(el);
    return el.outerHTML;
  }
  const scroll = () => (log.scrollTop = log.scrollHeight);

  function restore() {
    log.innerHTML = '';
    state.msgs.forEach((m) => {
      if (m.card) { const d = document.createElement('div'); d.innerHTML = m.card; log.append(d.firstElementChild); }
      else bubble(m.who, m.html, false);
    });
    renderChips(state.chips);
    scroll();
  }

  function user(text) {
    const html = esc(text);
    bubble('user', html);
    state.msgs.push({ who: 'user', html });
  }

  let queue = Promise.resolve();
  function bot(html, chips = [], extra) {
    queue = queue.then(
      () =>
        new Promise((res) => {
          renderChips([]);
          const t = document.createElement('div');
          t.className = 'vxa__typing';
          t.setAttribute('aria-hidden', 'true');
          t.innerHTML = '<span></span><span></span><span></span>';
          log.append(t);
          scroll();
          const delay = reduce ? 80 : Math.min(1100, 350 + html.length * 2.2);
          setTimeout(() => {
            t.remove();
            bubble('bot', html);
            state.msgs.push({ who: 'bot', html });
            if (extra) state.msgs.push({ card: extra() });
            state.chips = chips;
            renderChips(chips);
            save();
            scroll();
            res();
          }, delay);
        })
    );
    return queue;
  }

  /* ---------- helpers ---------- */
  const B = () => KB.business || {};
  const waUrl = (text) => `https://wa.me/${VX.wa}?text=${encodeURIComponent(text)}`;
  const waChip = (text, label = 'Continue on WhatsApp') => ({ label, href: waUrl(text), wa: true });
  const link = (href, text) => `<a href="${href}">${esc(text)}</a>`;
  const MAIN = [
    { label: 'Get a quote', say: 'I want a quote' },
    { label: 'Book a repair', say: 'I need a repair' },
    { label: 'Misted glass', say: 'My double glazing is misted' },
    { label: 'Prices', say: 'How much do windows cost?' },
    { label: 'Guarantee', say: 'What guarantee do I get?' },
    { label: 'Opening hours', say: 'What are your opening hours?' },
  ];
  const POSTCODE = /\b([A-Z]{1,2}\d[A-Z\d]?)\s*(\d[A-Z]{2})\b/i;
  const OUTWARD = /^\s*([A-Z]{1,2}\d[A-Z\d]?)\s*$/i;

  function hoursHtml() {
    const st = VX.openStatus ? VX.openStatus() : null;
    const t12 = VX.fmtTime || ((x) => x);
    const rows = (B().hours || VX.hours || []).map((h) => `<li>${esc(h.days)}: ${h.open ? `${t12(h.open)} – ${t12(h.close)}` : 'Closed'}</li>`).join('');
    return `${st ? `<p><strong>${esc(st.text)}.</strong></p>` : ''}<ul>${rows}</ul><p>Outside these hours, send a WhatsApp message and we’ll reply when we open.</p>`;
  }
  function areaHtml(text) {
    const b = B();
    const m = (text || '').match(POSTCODE) || (text || '').match(OUTWARD);
    if (m && b.postcodePrefixes?.length && VX.coversPostcode) {
      const pc = m[0].toUpperCase().trim();
      return VX.coversPostcode(pc, b.postcodePrefixes)
        ? `<p>Good news — <strong>${esc(pc)}</strong> is within our usual area.</p>`
        : `<p><strong>${esc(pc)}</strong> may be outside our usual area, but send us a message — we can often help.</p>`;
    }
    if (b.serviceAreas?.length) return `<p>We cover ${esc(b.serviceAreas.join(', '))}${b.areaServed ? ` and the surrounding ${esc(b.areaServed)} area` : ''}.</p><p>Not listed? Send your postcode and we’ll confirm.</p>`;
    if (b.areaServed) return `<p>We work across ${esc(b.areaServed)}. Send your postcode on WhatsApp and we’ll confirm we can reach you.</p>`;
    return `<p>Send us your postcode on WhatsApp and we’ll confirm straight away whether we cover your area.</p>`;
  }
  function contactHtml() {
    const b = B();
    return `<p>You can reach the team directly:</p><ul><li>WhatsApp or call: <a href="tel:${esc(VX.phone)}">${esc(VX.phoneDisplay)}</a></li><li>Email: <a href="mailto:${esc(VX.email)}">${esc(VX.email)}</a></li>${b.address ? `<li>Address: ${esc(b.address)}</li>` : ''}</ul><p>WhatsApp is quickest — you can send photos too.</p>`;
  }

  /* ---------- guided flows ---------- */
  const FLOWS = {
    quote: [
      { key: 'what', ask: 'Happy to help with a quote. What would you like priced?', chips: ['Windows', 'Doors', 'Windows and doors', 'Replacement glass', 'Repair'] },
      { key: 'count', ask: 'Roughly how many windows or doors?', chips: ['1', '2–3', '4–6', '7–10', 'More than 10'] },
      { key: 'postcode', ask: 'What’s the postcode of the property? (It helps us check coverage and plan the survey.)', chips: ['Skip'] },
      { key: 'name', ask: 'And what name should we use?', chips: ['Skip'] },
    ],
    repair: [
      { key: 'problem', ask: 'Sorry to hear something’s not working. What’s the problem?', chips: 'REPAIRS' },
      { key: 'on', ask: 'Is it on a window or a door?', chips: ['Window', 'Front / back door', 'Patio or bi-fold door', 'More than one'] },
      { key: 'postcode', ask: 'What’s the postcode of the property?', chips: ['Skip'] },
      { key: 'name', ask: 'And your name?', chips: ['Skip'] },
    ],
  };

  function startFlow(name, data = {}) {
    state.flow = { name, step: 0 };
    state.data = data;
    const steps = FLOWS[name];
    while (state.flow.step < steps.length && state.data[steps[state.flow.step].key]) state.flow.step++;
    askStep();
  }
  function askStep() {
    const steps = FLOWS[state.flow.name];
    const s = steps[state.flow.step];
    if (!s) return finishFlow();
    let chips = s.chips === 'REPAIRS' ? [...KB.repairs.map((r) => ({ label: r.name })), { label: 'Something else' }] : s.chips.map((c) => ({ label: c }));
    chips = [...chips, { label: 'Cancel', say: '__cancel' }];
    return bot(`<p>${esc(s.ask)}</p>`, chips);
  }
  function flowInput(text) {
    const steps = FLOWS[state.flow.name];
    const s = steps[state.flow.step];
    let v = text.trim();
    if (s.key === 'postcode' && !/^skip$/i.test(v)) {
      const m = v.match(POSTCODE);
      const o = v.match(OUTWARD);
      if (m) v = `${m[1].toUpperCase()} ${m[2].toUpperCase()}`;
      else if (o) v = o[1].toUpperCase();
      else return bot('<p>That doesn’t look like a UK postcode — could you check it? (For example SW1A 1AA.) Or tap Skip.</p>', [{ label: 'Skip' }, { label: 'Cancel', say: '__cancel' }]);
    }
    if (s.key === 'problem') {
      const hit = KB.repairs.find((r) => r.name.toLowerCase() === v.toLowerCase()) || search(v).find((x) => x.d.type === 'repair')?.d.item;
      if (hit) state.data.repairUrl = hit.url;
      if (hit && hit.name.toLowerCase() !== v.toLowerCase()) v = `${v} (${hit.name})`;
    }
    state.data[s.key] = /^skip$/i.test(v) ? '' : v;
    state.flow.step++;
    if (s.key === 'postcode' && state.data.postcode && B().postcodePrefixes?.length && VX.coversPostcode) {
      const ok = VX.coversPostcode(state.data.postcode, B().postcodePrefixes);
      if (!ok) bot(`<p>${esc(state.data.postcode)} may be just outside our usual area — we’ll confirm when you message us.</p>`);
    }
    return askStep();
  }
  function finishFlow() {
    const d = state.data;
    const name = state.flow.name;
    state.flow = null;
    let text;
    if (name === 'quote') {
      text = [`Hi ${VX.brand}, I’d like a quote.`, `For: ${d.what}`, `How many: ${d.count}`, d.postcode && `Postcode: ${d.postcode}`, d.name && `Name: ${d.name}`, '', 'I can send sizes and photos.'].filter((x) => x !== '' && x != null && x !== false).join('\n');
      return bot(
        `<p>Thanks${d.name ? `, ${esc(d.name.split(' ')[0])}` : ''}. Here’s your request — tap below to send it to the team on WhatsApp. Adding a photo of each window from outside makes the estimate much more accurate.</p>`,
        [{ label: 'Use the full quote builder', href: '/quote/' }, { label: 'Ask something else', say: '__menu' }],
        () => card(text)
      );
    }
    text = [`Hi ${VX.brand}, I need a repair.`, `Problem: ${d.problem}`, `On: ${d.on}`, d.postcode && `Postcode: ${d.postcode}`, d.name && `Name: ${d.name}`, '', 'I’ll attach photos.'].filter((x) => x !== '' && x != null && x !== false).join('\n');
    const chips = [{ label: 'Book a visit online', href: '/book/?type=repair' }];
    if (d.repairUrl) chips.unshift({ label: 'Read about this repair', href: d.repairUrl });
    return bot(
      `<p>Got it${d.name ? `, ${esc(d.name.split(' ')[0])}` : ''}. Send this on WhatsApp, then attach a photo of the problem (and of the lock edge or hinge if it’s a lock or hinge issue) in the same chat — it helps us bring the right part.</p>`,
      chips,
      () => card(text)
    );
  }

  /* ---------- intents ---------- */
  const RX = {
    cancel: /^(__cancel|cancel|stop|exit|start again|restart|never ?mind|forget it)$/i,
    menu: /^(__menu|menu|help|options|start)$/i,
    greet: /^(hi+|hello|hey|hiya|yo|good (morning|afternoon|evening)|salam|salaam|assalam.*|aoa|hola)[!. ]*$/i,
    thanks: /\b(thanks|thank you|thankyou|cheers|ta|shukriya|appreciate)\b/i,
    bye: /^(bye|goodbye|see you|that'?s all|no thanks|nothing else|ok bye)[!. ]*$/i,
    human: /\b(human|real person|someone|somebody|agent|staff|speak to|talk to|call me|call back|callback|ring me|phone number|your number|contact|email address|your email|get in touch|reach you)\b/i,
    hours: /\b(opening hours|open hours|hours|opening times|are you open|open today|open now|open tomorrow|open on|open at|closing|close today|what time|weekend|saturday|sunday|bank holiday)\b/i,
    area: /\b(where are you|where you|area|areas|cover|coverage|location|located|based|near me|nearby|come to|travel to|do you serve|serve my|my postcode)\b/i,
    wantQuote: /\b((get|want|need|like|request|give|send|have|book) (me )?(a |an )?(free )?(quote|quotation|estimate|price)|^quote$|^estimate$|quote (for|please|me)|i want a quote|price (up|for my))\b/i,
    wantRepair: /^(i need a repair|book a repair|repair|repairs|something(’|')?s broken|need (a )?repair|fix (my|a)|book (a )?repair( visit)?)$/i,
    book: /\b(book|booking|appointment|schedule|survey|come out|come round|come and see|visit)\b/i,
    who: /\b(who are you|are you a (bot|robot|human|person)|is this a bot|your name)\b/i,
    payment: /\b(pay|payment|deposit|finance|card|cash|bank transfer|instal?ments?)\b/i,
  };

  async function handle(raw, chip) {
    const text = String(raw || '').trim();
    if (!text) return;
    if (!KB) await loadKB();
    if (!chip || !chip.say?.startsWith('__')) user(chip?.label || text);
    else if (text === '__cancel') user('Cancel');
    else if (text === '__menu') user('Something else');
    save();

    if (RX.cancel.test(text)) {
      state.flow = null;
      return bot('<p>No problem. What else can I help with?</p>', MAIN);
    }
    if (RX.menu.test(text)) {
      state.flow = null;
      return bot('<p>Here are some things I can help with — or just type your question.</p>', MAIN);
    }
    if (state.flow) {
      // let a clear new question break out of a flow
      const strong = text.length > 25 && /\?$/.test(text);
      if (!strong) return flowInput(text);
      state.flow = null;
    }

    if (RX.greet.test(text)) return bot(`<p>Hello! I can answer questions about our windows, doors and repairs, help you get a quote or arrange a visit. What can I help with?</p>`, MAIN);
    if (RX.bye.test(text)) return bot('<p>Thanks for stopping by. If anything comes up, we’re on WhatsApp. Have a good day!</p>', [waChip(`Hi ${VX.brand}, `, 'WhatsApp the team')]);
    if (RX.thanks.test(text) && text.split(' ').length <= 6) return bot('<p>You’re welcome! Anything else I can help with?</p>', MAIN.slice(0, 4));
    if (RX.who.test(text)) return bot(`<p>I’m the ${esc(VX.brand)} website assistant — an automated helper that answers from the information on this site. For anything I can’t answer, the team is on WhatsApp.</p>`, [waChip(`Hi ${VX.brand}, `, 'Talk to a person'), ...MAIN.slice(0, 3)]);
    if (RX.wantQuote.test(text)) return startFlow('quote', guessQuote(text));
    if (RX.wantRepair.test(text)) return startFlow('repair');
    if (RX.hours.test(text) && !/\b(won'?t|wont|doesn'?t|will not|can'?t|cannot|hard to|stuck)\b/i.test(text)) return bot(hoursHtml(), [waChip(`Hi ${VX.brand}, `, 'Message us'), { label: 'Book a visit', href: '/book/' }]);
    if (RX.area.test(text) || ((text.match(POSTCODE) || text.match(OUTWARD)) && text.length < 12)) return bot(areaHtml(text), [waChip(`Hi ${VX.brand}, do you cover my area? My postcode is `, 'Check my postcode'), ...MAIN.slice(0, 2)]);
    if (RX.human.test(text)) return bot(contactHtml(), [waChip(`Hi ${VX.brand}, `, 'WhatsApp now'), { label: `Call ${VX.phoneDisplay}`, href: `tel:${VX.phone}` }]);

    const hits = search(text);
    const best = hits[0];
    if (RX.book.test(text) && (!best || best.s < 5)) {
      return bot(`<p>You can request a visit online and we’ll confirm by WhatsApp or phone:</p><ul><li>${link('/book/?type=survey', 'Book a free survey')} — for new windows or doors</li><li>${link('/book/?type=repair', 'Book a repair visit')}</li></ul>`, [{ label: 'Book a survey', href: '/book/?type=survey' }, { label: 'Book a repair', href: '/book/?type=repair' }, waChip(`Hi ${VX.brand}, I’d like to book a visit.`, 'Book on WhatsApp')]);
    }
    if (!best || best.s < 2.4) return fallback(text);
    return answer(best.d, hits[1] && hits[1].s >= best.s * 0.7 && hits[1].d.type !== best.d.type ? hits[1].d : null, text);
  }

  function guessQuote(text) {
    const t = norm(text);
    const w = /\bwindow/.test(t);
    const d = /\bdoor/.test(t);
    return w && d ? { what: 'Windows and doors' } : w ? { what: 'Windows' } : d ? { what: 'Doors' } : {};
  }

  function answer(doc, alt, text) {
    const it = doc.item;
    const altChip = alt ? [{ label: alt.item.q || alt.item.name || alt.item.title, say: alt.item.q || alt.item.name || alt.item.title }] : [];
    switch (doc.type) {
      case 'faq': {
        let chips = [];
        if (/price|cost|quote/i.test(it.q)) chips = [{ label: 'Start a quote', say: 'I want a quote' }, { label: 'Quote builder', href: '/quote/' }];
        else if (/repair|misted|call-out|quickly/i.test(it.q)) chips = [{ label: 'Book a repair', say: 'I need a repair' }, waChip(`Hi ${VX.brand}, I need a repair. Photos attached.`, 'Send photos')];
        else if (/guarantee|wrong/i.test(it.q)) chips = [{ label: 'Guarantee details', href: '/guarantee/' }, waChip(`Hi ${VX.brand}, I need help with a previous installation.`, 'Report a problem')];
        else if (/regulation|planning|trickle|escape/i.test(it.q)) chips = [{ label: 'Regulations guide', href: '/guides/building-regulations-for-replacement-windows/' }];
        else chips = [{ label: 'More FAQs', href: '/faq/' }];
        return bot(`<p>${esc(it.a)}</p>`, [...chips, ...altChip, { label: 'Ask something else', say: '__menu' }].slice(0, 5));
      }
      case 'repair':
        return bot(
          `<p><strong>${esc(it.name)}</strong> — ${esc(it.short)}</p><p>What we usually do:</p><ul>${it.fix.map((f) => `<li>${esc(f)}</li>`).join('')}</ul><p>${esc(it.visit)} ${link(it.url, 'More about this repair')}.</p>`,
          [waChip(`Hi ${VX.brand}, I need a repair: ${it.name}. Photos attached.`, 'Send photos on WhatsApp'), { label: 'Book a visit', href: `/book/?type=repair&repair=${it.url.split('/')[2]}` }, ...altChip].slice(0, 4)
        );
      case 'product':
        return bot(
          `<p><strong>${esc(it.name)}</strong> — ${esc(it.short)}</p><p>${link(it.url, `See ${it.name.toLowerCase()} in detail`)}, including options and specifications.</p>`,
          [{ label: `Quote for ${it.name.toLowerCase()}`, href: `/quote/?item=${it.url.split('/')[2]}` }, waChip(`Hi ${VX.brand}, I’m interested in ${it.name.toLowerCase()}.`, 'Ask on WhatsApp'), ...altChip].slice(0, 4)
        );
      case 'service':
        return bot(`<p><strong>${esc(it.name)}</strong> — ${esc(it.short)}</p><p>${link(it.url, 'Read how it works')}.</p>`, [{ label: 'Get a quote', say: 'I want a quote' }, { label: 'Book a visit', href: '/book/' }, ...altChip]);
      case 'guide':
        return bot(`<p>We have a guide on that: <strong>${link(it.url, it.title)}</strong></p><p>${esc(it.summary)}</p>`, [{ label: 'Ask something else', say: '__menu' }, ...altChip]);
      default:
        return fallback(text);
    }
  }

  function fallback(text) {
    return bot(
      `<p>I’m not certain about that one, and I’d rather not guess. The team can answer properly — tap below to send your question on WhatsApp, or choose a topic.</p>`,
      [waChip(`Hi ${VX.brand}, I have a question: ${text}`, 'Ask the team on WhatsApp'), ...MAIN.slice(0, 4)]
    );
  }

  /* ---------- open / close ---------- */
  let lastFocus = null;
  function openPanel() {
    lastFocus = document.activeElement;
    panel.classList.add('is-open');
    panel.setAttribute('aria-hidden', 'false');
    launch.hidden = true;
    loadKB();
    if (!state.msgs.length) {
      const st = VX.openStatus ? VX.openStatus() : null;
      bot(`<p>Hi, I’m the ${esc(VX.brand)} assistant. I can answer questions about our windows, doors and repairs, help you get a quote, or arrange a visit.</p>${st && !st.open ? `<p><small>${esc(st.text)} — the team will reply to WhatsApp messages when we open.</small></p>` : ''}<p>What can I help with?</p>`, MAIN);
    } else restore();
    setTimeout(() => input.focus({ preventScroll: true }), 60);
    if (window.matchMedia('(max-width: 760px)').matches) document.body.style.overflow = 'hidden';
  }
  function closePanel() {
    panel.classList.remove('is-open');
    panel.setAttribute('aria-hidden', 'true');
    launch.hidden = false;
    document.body.style.overflow = '';
    (lastFocus && document.contains(lastFocus) ? lastFocus : launch).focus?.({ preventScroll: true });
  }

  launch.addEventListener('click', openPanel);
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-chat-open]')) { e.preventDefault(); openPanel(); }
  });
  panel.querySelector('[data-close]').addEventListener('click', closePanel);
  panel.querySelector('[data-reset]').addEventListener('click', () => {
    state = { msgs: [], flow: null, data: {}, chips: [] };
    save();
    log.innerHTML = '';
    openPanel();
  });
  panel.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePanel(); });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = input.value;
    input.value = '';
    handle(v);
  });

  // expose for testing
  VX.assistant = { handle, search: (t) => loadKB().then(() => search(t)), open: openPanel, close: closePanel };
})();
