/* Navigation, opening hours, map loader, postcode check. */
(() => {
  'use strict';
  const VX = (window.VX = window.VX || {});
  document.documentElement.classList.add('js');

  /* ---------- navigation ---------- */
  const burger = document.querySelector('.burger');
  const nav = document.getElementById('nav');
  const mq = window.matchMedia('(max-width: 1060px)');
  const subs = [...document.querySelectorAll('.nav__item.has-sub')];

  const setNav = (open) => {
    if (!burger || !nav) return;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('nav-open', open);
  };
  const setSub = (item, open) => {
    item.classList.toggle('is-open', open);
    item.querySelector('.nav__link')?.setAttribute('aria-expanded', String(open));
  };
  const closeSubs = (except) => subs.forEach((i) => i !== except && setSub(i, false));

  burger?.addEventListener('click', () => setNav(burger.getAttribute('aria-expanded') !== 'true'));

  subs.forEach((item) => {
    const link = item.querySelector('.nav__link');
    let timer;
    item.addEventListener('mouseenter', () => {
      if (mq.matches) return;
      clearTimeout(timer);
      closeSubs(item);
      setSub(item, true);
    });
    item.addEventListener('mouseleave', () => {
      if (mq.matches) return;
      timer = setTimeout(() => setSub(item, false), 140);
    });
    link.addEventListener('click', (e) => {
      // Mobile: accordion. Desktop touch/keyboard: first activation opens, second follows the link.
      if (mq.matches || !item.classList.contains('is-open')) {
        e.preventDefault();
        const open = !item.classList.contains('is-open');
        closeSubs(item);
        setSub(item, open);
      }
    });
    link.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSub(item, true);
        item.querySelector('.sub a')?.focus();
      }
    });
    item.addEventListener('focusout', (e) => {
      if (!mq.matches && !item.contains(e.relatedTarget)) setSub(item, false);
    });
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav__item.has-sub') && !mq.matches) closeSubs();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const openItem = subs.find((i) => i.classList.contains('is-open'));
    if (openItem) {
      setSub(openItem, false);
      openItem.querySelector('.nav__link')?.focus();
    } else if (nav?.classList.contains('is-open')) {
      setNav(false);
      burger.focus();
    }
  });
  mq.addEventListener?.('change', () => {
    setNav(false);
    closeSubs();
  });
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
  drawIn(document.querySelector('.hero .diagram--facade'), 250, 1600);
  const sect = document.querySelector('.diagram--section');
  if (sect && io) {
    if (sect.getBoundingClientRect().top > window.innerHeight) {
      sect.addEventListener('vx:in', () => drawIn(sect, 0, 1300), { once: true });
      io.observe(sect);
    }
  }
})();
