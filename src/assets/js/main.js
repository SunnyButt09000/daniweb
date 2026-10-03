/* Navigation, opening hours, map loader, postcode check. */
(() => {
  'use strict';
  const VX = (window.VX = window.VX || {});
  document.documentElement.classList.add('js');

  /* ---------- navigation ---------- */
  // Desktop: mega menu panels with hover intent, click/tap/keyboard toggles, arrow-key movement.
  // ≤1060px: the same markup becomes an accordion inside the slide-down drawer.
  const burger = document.querySelector('.burger');
  const nav = document.getElementById('nav');
  const mq = window.matchMedia('(max-width: 1060px)');
  const subs = [...document.querySelectorAll('.nav__item.has-sub')];
  const OPEN_DELAY = 90; // pointer must rest this long before a closed menu opens
  const SWITCH_DELAY = 120; // a little longer when another panel is already open (diagonal moves)
  const CLOSE_DELAY = 260; // grace period for the pointer to come back
  let openItem = null;
  let openTimer = 0;
  let closeTimer = 0;
  let swapTimer = 0;
  let pointerType = 'mouse';

  const linkOf = (item) => item.querySelector('.nav__link');
  const panelOf = (item) => item.querySelector('.sub');
  const focusablesOf = (item) => [...panelOf(item).querySelectorAll('a[href], button:not([disabled])')];

  const setNav = (open) => {
    if (!burger || !nav) return;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('nav-open', open);
  };

  // Point the little notch at the trigger. Panels are right-aligned in CSS, so this is cosmetic.
  const placeCaret = (item) => {
    const panel = panelOf(item);
    if (mq.matches || !panel.offsetParent) return panel.classList.remove('has-caret');
    // layout offsets, not getBoundingClientRect: the panel is mid-transform while it opens
    const left = panel.offsetParent.getBoundingClientRect().left + panel.offsetLeft;
    const lr = linkOf(item).getBoundingClientRect();
    const x = Math.round(lr.left + lr.width / 2 - 8 - left);
    panel.style.setProperty('--caret-x', `${x}px`);
    panel.classList.toggle('has-caret', x > 24 && x < panel.offsetWidth - 24);
  };

  const setSub = (item, open) => {
    item.classList.toggle('is-open', open);
    linkOf(item).setAttribute('aria-expanded', String(open));
    if (open) {
      openItem = item;
      placeCaret(item);
    } else if (openItem === item) {
      openItem = null;
      // don’t leave focus stranded inside a panel that is now hidden
      if (panelOf(item).contains(document.activeElement)) linkOf(item).focus({ preventScroll: true });
    }
  };
  const closeSubs = (except) => subs.forEach((i) => i !== except && i.classList.contains('is-open') && setSub(i, false));
  const openSub = (item) => {
    clearTimeout(openTimer);
    clearTimeout(closeTimer);
    if (openItem === item) return;
    // Going straight from one open panel to the next: swap instantly instead of replaying the fade.
    const swap = !!openItem && !mq.matches;
    clearTimeout(swapTimer);
    nav?.classList.toggle('is-swap', swap);
    closeSubs(item);
    setSub(item, true);
    if (swap) swapTimer = setTimeout(() => nav?.classList.remove('is-swap'), 60);
  };
  const toggleSub = (item) => (item.classList.contains('is-open') ? setSub(item, false) : openSub(item));

  // Move focus to the nearest item in a direction, using on-screen positions so the
  // two-column grid behaves as it looks (down goes down the column, right crosses over).
  // Items in the same row/column win; otherwise anything within a 45° cone.
  const moveFocus = (from, list, dir) => {
    const r = from.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const vertical = dir === 'down' || dir === 'up';
    let best = null;
    let bestScore = Infinity;
    for (const el of list) {
      if (el === from) continue;
      const b = el.getBoundingClientRect();
      if (!b.width) continue;
      const dx = b.left + b.width / 2 - cx;
      const dy = b.top + b.height / 2 - cy;
      const along = { down: dy, up: -dy, right: dx, left: -dx }[dir];
      const across = vertical ? Math.abs(dx) : Math.abs(dy);
      if (along <= 4) continue;
      const aligned = vertical
        ? Math.min(r.right, b.right) - Math.max(r.left, b.left) > 0
        : Math.min(r.bottom, b.bottom) - Math.max(r.top, b.top) > 0;
      const score = aligned ? along : across <= along ? 1e4 + along + across * 2 : Infinity;
      if (score < bestScore) { bestScore = score; best = el; }
    }
    return best;
  };

  burger?.addEventListener('click', (e) => {
    const open = burger.getAttribute('aria-expanded') !== 'true';
    setNav(open);
    // keyboard users: the drawer sits before the burger in the DOM, so take focus into it
    if (open && e.detail === 0) requestAnimationFrame(() => nav?.querySelector('.nav__link')?.focus());
  });

  subs.forEach((item) => {
    const link = linkOf(item);
    const panel = panelOf(item);

    item.addEventListener('pointerenter', (e) => {
      if (mq.matches || e.pointerType !== 'mouse') return;
      clearTimeout(openTimer);
      if (openItem === item) return clearTimeout(closeTimer);
      openTimer = setTimeout(() => openSub(item), openItem ? SWITCH_DELAY : OPEN_DELAY);
    });
    item.addEventListener('pointerleave', (e) => {
      if (mq.matches || e.pointerType !== 'mouse') return;
      clearTimeout(openTimer);
      clearTimeout(closeTimer);
      closeTimer = setTimeout(() => {
        if (openItem && !openItem.matches(':hover')) closeSubs();
      }, CLOSE_DELAY);
    });

    link.addEventListener('pointerdown', (e) => { pointerType = e.pointerType || 'mouse'; });
    link.addEventListener('click', (e) => {
      const viaKeyboard = e.detail === 0;
      if (mq.matches) {
        // drawer accordion: one section open at a time
        e.preventDefault();
        const open = !item.classList.contains('is-open');
        closeSubs(item);
        setSub(item, open);
        return;
      }
      // Desktop mouse: hover has normally opened the panel already, so a click follows the link.
      if (!viaKeyboard && pointerType === 'mouse' && item.classList.contains('is-open')) return;
      e.preventDefault();
      if (!viaKeyboard && pointerType === 'mouse') return openSub(item);
      toggleSub(item); // touch, pen and keyboard: toggle
    });

    link.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        if (mq.matches) { const open = !item.classList.contains('is-open'); closeSubs(item); setSub(item, open); }
        else toggleSub(item);
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (mq.matches) { closeSubs(item); setSub(item, true); } else openSub(item);
        const items = [...panel.querySelectorAll('.sub__list a')];
        const target = e.key === 'ArrowDown' ? items[0] : items[items.length - 1];
        // wait a frame so the panel is visible (and focusable) before moving focus
        requestAnimationFrame(() => target?.focus());
      }
    });

    panel.addEventListener('keydown', (e) => {
      const list = focusablesOf(item);
      const i = list.indexOf(document.activeElement);
      if (i < 0) return;
      const dir = { ArrowDown: 'down', ArrowUp: 'up', ArrowLeft: 'left', ArrowRight: 'right' }[e.key];
      let next = null;
      if (dir) {
        next = moveFocus(list[i], list, dir);
        if (!next && dir === 'up') next = link; // off the top: back to the trigger, panel stays open
      } else if (e.key === 'Home') next = list[0];
      else if (e.key === 'End') next = list[list.length - 1];
      else return;
      e.preventDefault();
      next?.focus();
    });

    item.addEventListener('focusout', (e) => {
      if (mq.matches || item.contains(e.relatedTarget) || item.matches(':hover')) return;
      if (item.classList.contains('is-open')) setSub(item, false);
    });
  });

  document.addEventListener('click', (e) => {
    if (!mq.matches && openItem && !openItem.contains(e.target)) closeSubs();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (openItem) {
      const item = openItem;
      const hadFocus = item.contains(document.activeElement);
      setSub(item, false);
      // return focus to the trigger, but never pull it away from something else (e.g. a form field)
      if (hadFocus) linkOf(item).focus();
    } else if (nav?.classList.contains('is-open')) {
      setNav(false);
      burger.focus();
    }
  });
  mq.addEventListener?.('change', () => {
    setNav(false);
    closeSubs();
  });
  window.addEventListener('resize', () => { if (openItem && !mq.matches) placeCaret(openItem); }, { passive: true });
  nav?.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (a && mq.matches && !a.classList.contains('nav__link')) setNav(false);
  });

  // keep the mobile drawer aligned with the header once the top bar scrolls away
  const onScroll = () => document.body.classList.toggle('nav-scrolled', window.scrollY > 38);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- opening hours (UK time) ---------- */
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const toMin = (t) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  const fmt = (t) => {
    if (t === '24:00' || t === '00:00') return 'midnight';
    let [h, m] = t.split(':').map(Number);
    const ap = h >= 12 ? 'pm' : 'am';
    h = h % 12 || 12;
    return m ? `${h}:${String(m).padStart(2, '0')}${ap}` : `${h}${ap}`;
  };
  function ukNow() {
    try {
      const parts = Object.fromEntries(
        new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false })
          .formatToParts(new Date())
          .map((p) => [p.type, p.value])
      );
      return { dow: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts.weekday), mins: (Number(parts.hour) % 24) * 60 + Number(parts.minute) };
    } catch {
      const d = new Date();
      return { dow: d.getDay(), mins: d.getHours() * 60 + d.getMinutes() };
    }
  }
  VX.fmtTime = fmt;
  VX.openStatus = function openStatus() {
    const hours = VX.hours || [];
    const { dow, mins } = ukNow();
    const dayRow = (d) => hours.find((h) => h.dow.includes(d));
    const today = dayRow(dow);
    if (today && today.open && mins >= toMin(today.open) && mins < toMin(today.close)) {
      return { open: true, text: `Open now · until ${fmt(today.close)}` };
    }
    for (let i = 0; i < 8; i++) {
      const d = (dow + i) % 7;
      const h = dayRow(d);
      if (!h || !h.open) continue;
      if (i === 0 && mins >= toMin(h.open)) continue;
      const when = i === 0 ? 'today' : i === 1 ? 'tomorrow' : DAYS[d];
      return { open: false, text: `Closed now · opens ${when} at ${fmt(h.open)}` };
    }
    return { open: false, text: 'Closed now' };
  };
  // WhatsApp and chat replies (every day), which run later than the service hours
  VX.chatStatus = function chatStatus() {
    const c = VX.chatHours;
    if (!c || !c.open || !c.close) return null;
    const { mins } = ukNow();
    const o = toMin(c.open);
    const cl = toMin(c.close);
    if (mins >= o && mins < cl) return { open: true, text: `Team replying now · until ${fmt(c.close)}` };
    return { open: false, text: `Team back on WhatsApp at ${fmt(c.open)}` };
  };
  const st = VX.openStatus();
  document.querySelectorAll('[data-openstate]').forEach((el) => {
    el.textContent = st.text;
    el.classList.toggle('is-open', st.open);
  });

  /* ---------- click-to-load map ---------- */
  document.querySelectorAll('[data-map-load]').forEach((b) =>
    b.addEventListener('click', () => {
      const box = b.closest('[data-map-src]');
      const f = document.createElement('iframe');
      f.src = box.dataset.mapSrc;
      f.title = 'Map showing our location';
      f.loading = 'lazy';
      f.referrerPolicy = 'no-referrer-when-downgrade';
      box.replaceChildren(f);
      box.classList.add('is-loaded');
    })
  );

  /* ---------- postcode coverage check ---------- */
  VX.coversPostcode = function (pc, prefixes) {
    const clean = String(pc || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (clean.length < 2) return null;
    const outward = clean.length > 4 ? clean.slice(0, -3) : clean;
    const area = (outward.match(/^[A-Z]+/) || [''])[0];
    return prefixes.some((raw) => {
      const p = raw.toUpperCase().replace(/\s/g, '');
      if (/^[A-Z]+$/.test(p)) return area === p;
      return outward === p || (outward.length === p.length + 1 && outward.startsWith(p) && /[A-Z]$/.test(outward));
    });
  };
  document.querySelectorAll('.pc-check').forEach((form) =>
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const out = form.querySelector('.pc-check__out');
      const v = form.pc.value.trim();
      const ok = VX.coversPostcode(v, form.dataset.prefixes.split(','));
      out.textContent = ok == null ? 'Please enter a postcode.' : ok ? `Yes — we cover ${v.toUpperCase()}.` : `${v.toUpperCase()} may be outside our usual area — message us and we’ll check.`;
    })
  );

  /* ---------- motion: header, top bar, timelines, reveals, drawings ---------- */
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hdr = document.querySelector('.site-header');
  const onScrollHdr = () => hdr?.classList.toggle('is-scrolled', window.scrollY > 60);
  window.addEventListener('scroll', onScrollHdr, { passive: true });
  onScrollHdr();

  const tb = document.querySelector('.topbar');
  if (tb) {
    const msgs = ['.topbar__wa', '.topbar__msg', '.topbar__hours'].map((s) => tb.querySelector(s)).filter(Boolean);
    const mqm = window.matchMedia('(max-width: 760px)');
    let n = 0;
    let timer;
    const show = () => msgs.forEach((x, j) => { x.classList.toggle('is-active', j === n); x.setAttribute('aria-hidden', String(j !== n)); });
    const start = () => {
      clearInterval(timer);
      if (!mqm.matches || reduce) { tb.classList.remove('rot'); msgs.forEach((x) => { x.classList.remove('is-active'); x.removeAttribute('aria-hidden'); }); return; }
      tb.classList.add('rot');
      show();
      timer = setInterval(() => { n = (n + 1) % msgs.length; show(); }, 4200);
    };
    start();
    mqm.addEventListener?.('change', start);
  }

  const io = 'IntersectionObserver' in window && !reduce
    ? new IntersectionObserver((entries) => entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        e.target.dispatchEvent(new CustomEvent('vx:in'));
        io.unobserve(e.target);
      }), { rootMargin: '0px 0px -10% 0px', threshold: 0.1 })
    : null;

  document.querySelectorAll('.process').forEach((ol) => {
    const lis = [...ol.children];
    lis.forEach((li, i) => li.style.setProperty('--i', i));
    if (!ol.classList.contains('process--dark')) ol.style.setProperty('--cols', lis.length <= 4 ? lis.length : 3);
    if (io) { ol.classList.add('anim'); io.observe(ol); }
  });

  if (io) {
    const vh = window.innerHeight;
    document.querySelectorAll('main .sec-head, .pgrid, .rgrid, .sgrid, .ggrid, .fgrid, .swatches, main .faq, .diag, .specs, .repband__list, .gcards, .tgrid, .cta-band__in, .crosslink, .qlist').forEach((el) => {
      if (el.closest('.process') || el.getBoundingClientRect().top < vh * 0.92) return;
      el.classList.add('anim-up');
      io.observe(el);
    });
  }

  function drawIn(svg, delay = 0, dur = 1500) {
    if (reduce || !svg || !svg.animate) return;
    const strokes = svg.querySelectorAll('.d-frame, .d-sash, .d-line, .d-outline, .d-cill, .d-roof, .d-ground, .d-profile, .d-chamber, .d-steel, .d-glass-sec');
    strokes.forEach((el, i) => {
      let L = 0;
      try { L = el.getTotalLength(); } catch { return; }
      if (!L || !isFinite(L)) return;
      el.style.strokeDasharray = `${L} ${L}`;
      el.animate(
        [{ strokeDashoffset: L, fillOpacity: 0 }, { strokeDashoffset: 0, fillOpacity: 0, offset: 0.72 }, { strokeDashoffset: 0, fillOpacity: 1 }],
        { duration: dur, delay: delay + Math.min(i * 14, 520), easing: 'cubic-bezier(.45,0,.2,1)', fill: 'backwards' }
      );
    });
    svg.querySelectorAll('.d-glass, .d-wall, .d-glint, .d-handle, .d-gasket, .d-spacer, .d-gap, .d-obscure').forEach((el) =>
      el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 700, delay: delay + dur * 0.75, fill: 'backwards' })
    );
  }
  // on phones the side labels are too small to read: hide them and crop to the house
  const facade = document.querySelector('.hero .diagram--facade');
  if (facade && facade.dataset.vbNarrow) {
    const wide = facade.getAttribute('viewBox');
    const mqNarrow = window.matchMedia('(max-width: 600px)');
    const fit = () => facade.setAttribute('viewBox', mqNarrow.matches ? facade.dataset.vbNarrow : wide);
    fit();
    mqNarrow.addEventListener?.('change', fit);
  }
  drawIn(facade, 250, 1600);
  const sect = document.querySelector('.diagram--section');
  if (sect && io) {
    if (sect.getBoundingClientRect().top > window.innerHeight) {
      sect.addEventListener('vx:in', () => drawIn(sect, 0, 1300), { once: true });
      io.observe(sect);
    }
  }
})();
