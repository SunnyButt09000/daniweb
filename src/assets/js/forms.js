/* Quote configurator, booking and contact forms.
   Each form composes a tidy message and opens WhatsApp (or the visitor's email app).
   If window.VX.endpoint is set (Formspree / Web3Forms etc.), a copy is also POSTed there. */
(() => {
  'use strict';
  const VX = window.VX || {};
  const store = {
    get(k) { try { return JSON.parse(sessionStorage.getItem(k)); } catch { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } },
  };
  const params = new URLSearchParams(location.search);
  const POSTCODE = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;
  const val = (form, name) => (form.elements[name]?.value || '').trim();
  const fmtPostcode = (p) => {
    const c = p.toUpperCase().replace(/\s+/g, '');
    return c.length > 3 ? `${c.slice(0, -3)} ${c.slice(-3)}` : c;
  };

  /* ---------- validation ---------- */
  function validate(form) {
    const errors = [];
    form.querySelectorAll('.is-invalid').forEach((el) => el.classList.remove('is-invalid'));
    const mark = (el, msg) => {
      (el.closest('.f') || el.closest('.check') || el).classList.add('is-invalid');
      el.setAttribute('aria-invalid', 'true');
      errors.push({ el, msg });
    };
    form.querySelectorAll('input, select, textarea').forEach((el) => el.removeAttribute('aria-invalid'));
    form.querySelectorAll('[required]').forEach((el) => {
      if (el.closest('[hidden]')) return;
      if (el.type === 'checkbox' ? !el.checked : !el.value.trim()) mark(el, el.type === 'checkbox' ? 'Please tick the consent box.' : `Please fill in “${labelOf(el)}”.`);
    });
    const phone = form.elements.phone;
    if (phone && phone.value.trim() && phone.value.replace(/\D/g, '').length < 10) mark(phone, 'Please enter a full phone number.');
    const email = form.elements.email;
    if (email && email.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) mark(email, 'Please check your email address.');
    const pc = form.elements.postcode;
    if (pc && pc.value.trim() && !POSTCODE.test(pc.value.trim())) mark(pc, 'Please enter a valid UK postcode.');
    return errors;
  }
  const labelOf = (el) => el.closest('label')?.querySelector('span')?.textContent.replace(/\(optional\)/, '').trim() || el.name;

  function showMsg(form, text, ok = false) {
    const m = form.querySelector('.form-msg');
    if (!m) return;
    m.textContent = text;
    m.hidden = !text;
    m.classList.toggle('is-ok', ok);
  }

  /* ---------- sending ---------- */
  function openWhatsApp(text) {
    const url = `https://wa.me/${VX.wa}?text=${encodeURIComponent(text)}`;
    const w = window.open(url, '_blank');
    if (w) w.opener = null;
    else location.href = url;
  }
  function openEmail(subject, text) {
    location.href = `mailto:${VX.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
  }
  function postCopy(kind, form, text) {
    if (!VX.endpoint) return;
    const fd = Object.fromEntries(new FormData(form).entries());
    try {
      fetch(VX.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ _subject: `${VX.brand} website — ${kind}`, form: kind, ...fd, summary: text }),
        keepalive: true,
      }).catch(() => {});
    } catch { /* ignore */ }
  }

  function wire(form, { kind, subject, compose, before, after }) {
    let via = 'whatsapp';
    form.querySelectorAll('[data-send]').forEach((b) => b.addEventListener('click', () => (via = b.dataset.send)));
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (e.submitter?.dataset.send) via = e.submitter.dataset.send;
      const errors = validate(form);
      if (errors.length) {
        showMsg(form, errors.length === 1 ? errors[0].msg : `Please check the ${errors.length} highlighted fields.`);
        errors[0].el.focus({ preventScroll: false });
        return;
      }
      const blocked = before ? before(form) : '';
      if (blocked) {
        showMsg(form, blocked);
        return;
      }
      const text = compose(form);
      postCopy(kind, form, text);
      if (via === 'email') {
        openEmail(subject(form), text);
        showMsg(form, after ? after(via) : 'Your email app should open with the message ready — press send there to deliver it.', true);
      } else {
        openWhatsApp(text);
        showMsg(form, after ? after(via) : 'WhatsApp should open with your message ready — press send in WhatsApp to deliver it. Not opening? Call us instead.', true);
      }
    });
    form.addEventListener('input', (e) => {
      const f = e.target.closest('.is-invalid');
      if (f) f.classList.remove('is-invalid');
    });
  }

  const contactLines = (form) =>
    [
      `Name: ${val(form, 'name')}`,
      `Phone: ${val(form, 'phone')}`,
      val(form, 'email') && `Email: ${val(form, 'email')}`,
      val(form, 'address') && `Address: ${val(form, 'address')}`,
      val(form, 'postcode') && `Postcode: ${fmtPostcode(val(form, 'postcode'))}`,
    ].filter(Boolean);

  /* =====================================================
     QUOTE CONFIGURATOR
     ===================================================== */
  const quoteForm = document.getElementById('quote-form');
  const cfg = document.getElementById('cfg');
  if (quoteForm && cfg && window.VXDraw) {
    const D = window.VXDraw;
    const $ = (id) => document.getElementById(id);
    const el = {
      type: $('cfg-type'), w: $('cfg-w'), h: $('cfg-h'), room: $('cfg-room'), qty: $('cfg-qty'), hinge: $('cfg-hinge'),
      hingeF: $('cfg-hinge-f'), hingeL: $('cfg-hinge-l'), glaze: $('cfg-glaze'), glass: $('cfg-glass'), vents: $('cfg-vents'),
      note: $('cfg-note-in'), fig: $('cfg-fig'), draw: $('cfg-draw'), add: $('cfg-add'), cancel: $('cfg-cancel'), msg: $('cfg-msg'),
      ref: $('cfg-ref'), mode: $('cfg-mode'), colourName: $('cfg-colour-name'), list: $('ql-items'), empty: $('ql-empty'),
      count: $('ql-count'), units: $('qs-units'), area: $('qs-area'), sheet: $('qb-sheet'),
    };
    const SINGULAR = {
      'casement-windows': 'Casement window', 'flush-casement-windows': 'Flush casement window', 'tilt-and-turn-windows': 'Tilt & turn window',
      'sash-windows': 'Sash window', 'bay-and-bow-windows': 'Bay / bow window', 'sliding-windows': 'Horizontal sliding window',
      'shaped-and-feature-windows': 'Shaped / feature window', 'upvc-doors': 'uPVC door', 'composite-doors': 'Composite door',
      'french-doors': 'French doors (pair)', 'patio-doors': 'Sliding patio door', 'bifold-doors': 'Bi-fold door', 'stable-doors': 'Stable door',
      'sealed-unit': 'Replacement glass / sealed unit', other: 'Other / not sure',
    };
    const nameOf = (slug) => SINGULAR[slug] || [...el.type.options].find((o) => o.value === slug)?.textContent || slug;
    const clampQty = (v) => Math.min(50, Math.max(1, parseInt(v, 10) || 1));
    const uid = () => Math.random().toString(36).slice(2, 9);
    let items = store.get('vx-quote');
    items = Array.isArray(items) ? items.filter((i) => i && i.type).map((i) => ({ id: i.id || uid(), hinge: 'left', vents: 'As existing', room: '', ...i })) : [];
    let editing = null;
    let ref = store.get('vx-quote-ref');
    if (!ref) {
      const d = new Date();
      ref = `VX-${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;
      store.set('vx-quote-ref', ref);
    }

    const refsOf = (list) => {
      const c = {};
      return list.map((it) => {
        const k = D.KIND[it.type] || 'X';
        c[k] = (c[k] || 0) + 1;
        return k + c[k];
      });
    };
    const openingLabel = (it) => {
      if (!D.HINGED.has(it.type)) return '';
      if (!it.hinge) return 'Opening as existing';
      const s = it.hinge === 'right' ? 'right' : 'left';
      if (D.SLIDING.has(it.type)) return `Sliding panel ${s}`;
      if (it.type === 'bifold-doors') return `Traffic door ${s}`;
      return `Hinged ${s}`;
    };
    const sizeText = (it) => (it.w && it.h ? `${it.w} W × ${it.h} H mm` : it.w || it.h ? `${it.w || '?'} W × ${it.h || '?'} H mm` : 'to be confirmed');
    const areaOf = (it) => (Number(it.w) > 0 && Number(it.h) > 0 ? (it.w * it.h * clampQty(it.qty)) / 1e6 : 0);
    const colourVal = () => cfg.querySelector('[name="cfg-colour"]:checked')?.value || 'White';

    const read = () => ({
      id: editing || uid(), type: el.type.value, w: el.w.value.trim(), h: el.h.value.trim(), room: el.room.value.trim(),
      qty: clampQty(el.qty.value), hinge: el.hinge.value, glaze: el.glaze.value, glass: el.glass.value, vents: el.vents.value,
      colour: colourVal(), note: el.note.value.trim(),
    });
    const write = (it) => {
      el.type.value = it.type; el.w.value = it.w || ''; el.h.value = it.h || ''; el.room.value = it.room || '';
      el.qty.value = clampQty(it.qty); el.hinge.value = it.hinge ?? 'left'; el.glaze.value = it.glaze; el.glass.value = it.glass;
      el.vents.value = it.vents || 'As existing'; el.note.value = it.note || '';
      const c = cfg.querySelector(`[name="cfg-colour"][value="${CSS.escape(it.colour || 'White')}"]`);
      if (c) c.checked = true;
      syncType();
    };

    function syncType() {
      const t = el.type.value;
      const def = D.DEFAULTS[t] || D.DEFAULTS.other;
      el.w.placeholder = def[0];
      el.h.placeholder = def[1];
      const hinged = D.HINGED.has(t);
      el.hingeF.hidden = !hinged;
      const opts = el.hinge.options;
      if (D.SLIDING.has(t)) { el.hingeL.textContent = 'Sliding panel'; opts[0].text = 'On the left'; opts[1].text = 'On the right'; }
      else if (t === 'bifold-doors') { el.hingeL.textContent = 'Traffic door'; opts[0].text = 'On the left'; opts[1].text = 'On the right'; }
      else { el.hingeL.textContent = 'Opening side'; opts[0].text = 'Hinged left'; opts[1].text = 'Hinged right'; }
      el.vents.closest('.f').hidden = !(D.KIND[t] === 'W');
      renderDrawing();
    }

    function renderDrawing() {
      const it = read();
      const stageW = el.draw.parentElement.clientWidth || 360;
      const box = Math.round(Math.max(150, Math.min(360, stageW - 120)));
      const d = D.svg(it.type, { w: it.w, h: it.h, hinge: it.hinge || 'left', colour: it.colour, glass: it.glass, box, label: `${nameOf(it.type)} drawing` });
      el.fig.innerHTML = d.svg;
      el.draw.style.setProperty('--fw', `${d.fw}px`);
      el.draw.style.setProperty('--fh', `${d.fh}px`);
      el.draw.classList.toggle('is-default', !(it.w && it.h));
      el.colourName.textContent = it.colour;
      const list = editing ? items : [...items, it];
      const idx = editing ? items.findIndex((x) => x.id === editing) : list.length - 1;
      el.ref.textContent = refsOf(list)[idx] || '';
      el.mode.textContent = editing ? 'Editing' : 'New item';
    }

    function sizeError(it) {
      const w = Number(it.w), h = Number(it.h);
      if (it.w && (!(w >= 200) || w > 8000)) return 'Width should be between 200 and 8000 mm.';
      if (it.h && (!(h >= 200) || h > 4000)) return 'Height should be between 200 and 4000 mm.';
      return '';
    }
    const say = (t, bad = false) => {
      el.msg.textContent = t;
      el.msg.classList.toggle('is-bad', bad);
    };

    function save() { store.set('vx-quote', items); }

    function renderList(flashId) {
      const refs = refsOf(items);
      el.list.replaceChildren();
      let units = 0;
      let area = 0;
      items.forEach((it, i) => {
        units += clampQty(it.qty);
        area += areaOf(it);
        const li = document.createElement('li');
        li.className = 'qli' + (it.id === editing ? ' is-editing' : '') + (it.id === flashId ? ' is-new' : '');
        const fig = document.createElement('div');
        fig.className = 'qli__fig';
        fig.innerHTML = D.svg(it.type, { w: it.w, h: it.h, hinge: it.hinge || 'left', colour: it.colour, glass: it.glass, box: 92, label: `${refs[i]} drawing` }).svg;
        const body = document.createElement('div');
        body.className = 'qli__body';
        const h = document.createElement('p');
        h.className = 'qli__title';
        h.innerHTML = `<span class="qli__ref"></span><strong></strong>`;
        h.firstChild.textContent = refs[i];
        h.lastChild.textContent = nameOf(it.type);
        const meta = document.createElement('p');
        meta.className = 'qli__meta';
        meta.textContent = [it.room, it.w || it.h ? sizeText(it) : 'Size to be confirmed', `Qty ${clampQty(it.qty)}`].filter(Boolean).join(' · ');
        const chips = document.createElement('ul');
        chips.className = 'qli__chips';
        [it.glaze, it.colour, `${it.glass} glass`, openingLabel(it), D.KIND[it.type] === 'W' ? `Vents: ${it.vents}` : ''].filter(Boolean).forEach((c) => {
          const x = document.createElement('li');
          x.textContent = c;
          chips.append(x);
        });
        body.append(h, meta, chips);
        if (it.note) {
          const n = document.createElement('p');
          n.className = 'qli__note';
          n.textContent = it.note;
          body.append(n);
        }
        const act = document.createElement('div');
        act.className = 'qli__act';
        act.innerHTML = `<button type="button" data-act="edit">${ICONS.edit}<span>Edit</span></button><button type="button" data-act="dup">${ICONS.dup}<span>Duplicate</span></button><button type="button" data-act="del">${ICONS.del}<span>Remove</span></button>`;
        act.querySelectorAll('button').forEach((b) => b.setAttribute('aria-label', `${b.textContent} ${refs[i]}`));
        act.dataset.id = it.id;
        li.append(fig, body, act);
        el.list.append(li);
      });
      el.empty.hidden = items.length > 0;
      el.count.textContent = `${items.length} item${items.length === 1 ? '' : 's'}`;
      el.units.textContent = units;
      el.area.textContent = area ? `${area.toFixed(2)} m²` : '—';
      renderDrawing();
    }

    const ICONS = {
      edit: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.4 3.6a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
      dup: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="8" y="8" width="13" height="13" rx="2"/><path d="M4 16V5a1 1 0 0 1 1-1h11"/></svg>',
      del: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>',
    };

    function resetCfg(keepSpec = true) {
      const keep = read();
      editing = null;
      el.w.value = ''; el.h.value = ''; el.room.value = ''; el.note.value = ''; el.qty.value = 1; el.hinge.value = 'left';
      if (!keepSpec) write({ ...keep, type: el.type.value });
      el.add.querySelector('span').textContent = 'Add to list';
      el.cancel.hidden = true;
      cfg.dataset.editing = '';
    }

    function addOrSave() {
      const it = read();
      const err = sizeError(it);
      if (err) { say(err, true); (err.startsWith('Width') ? el.w : el.h).focus(); return false; }
      let flash = it.id;
      if (editing) {
        const i = items.findIndex((x) => x.id === editing);
        if (i > -1) items[i] = it;
        say(`${refsOf(items)[i]} updated.`);
      } else {
        items.push(it);
        say(`${refsOf(items)[items.length - 1]} added to your schedule.${it.w && it.h ? '' : ' Size marked “to be confirmed”.'}`);
      }
      resetCfg();
      save();
      renderList(flash);
      return true;
    }

    el.add.addEventListener('click', addOrSave);
    el.cancel.addEventListener('click', () => { resetCfg(); renderList(); say('Editing cancelled.'); });
    el.list.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-act]');
      if (!b) return;
      const id = b.parentElement.dataset.id;
      const i = items.findIndex((x) => x.id === id);
      if (i < 0) return;
      const ref = refsOf(items)[i];
      if (b.dataset.act === 'del') {
        items.splice(i, 1);
        if (editing === id) resetCfg();
        save();
        renderList();
        say(`${ref} removed.`);
      } else if (b.dataset.act === 'dup') {
        const copy = { ...items[i], id: uid() };
        items.splice(i + 1, 0, copy);
        save();
        renderList(copy.id);
        say(`${ref} duplicated — edit the copy if the size differs.`);
      } else {
        editing = id;
        write(items[i]);
        el.add.querySelector('span').textContent = 'Save changes';
        el.cancel.hidden = false;
        cfg.dataset.editing = id;
        renderList();
        say(`Editing ${ref}. Change anything, then press Save changes.`);
        cfg.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
      }
    });

    cfg.addEventListener('input', renderDrawing);
    cfg.addEventListener('change', (e) => (e.target === el.type ? syncType() : renderDrawing()));
    cfg.querySelectorAll('[data-step]').forEach((b) => b.addEventListener('click', () => { el.qty.value = clampQty(Number(el.qty.value) + Number(b.dataset.step)); }));
    [el.w, el.h].forEach((inp) => inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); addOrSave(); } }));
    let rt;
    window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(renderDrawing, 120); });

    const pre = params.get('item');
    if (pre && [...el.type.options].some((o) => o.value === pre)) el.type.value = pre;
    syncType();
    renderList();

    /* ---------- message ---------- */
    const today = () => new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    function compose(form) {
      const refs = refsOf(items);
      const units = items.reduce((a, it) => a + clampQty(it.qty), 0);
      const area = items.reduce((a, it) => a + areaOf(it), 0);
      const lines = [
        `*QUOTE REQUEST · ${(VX.name || '').toUpperCase()}*`,
        `Ref: ${ref} · ${today()}`,
        '',
        '*Customer*',
        ...contactLines(form),
        `Property: ${val(form, 'property')} · Start: ${val(form, 'timeframe')}`,
        '',
        `*Schedule — ${items.length} item${items.length === 1 ? '' : 's'} · ${units} unit${units === 1 ? '' : 's'}${area ? ` · ${area.toFixed(2)} m²` : ''}*`,
      ];
      items.forEach((it, i) => {
        lines.push('', `*${refs[i]} · ${nameOf(it.type)}*${it.room ? ` (${it.room})` : ''}`);
        lines.push(`Size: ${sizeText(it)} · Qty ${clampQty(it.qty)}`);
        lines.push([it.glaze, it.colour, `${it.glass} glass`].join(' · '));
        const extra = [openingLabel(it), D.KIND[it.type] === 'W' ? `Trickle vents: ${it.vents.toLowerCase()}` : ''].filter(Boolean).join(' · ');
        if (extra) lines.push(extra);
        if (it.note) lines.push(`Note: ${it.note}`);
      });
      if (val(form, 'message')) lines.push('', '*Notes*', val(form, 'message'));
      lines.push('', '_Sizes are customer measurements, to be confirmed at survey._', 'Quote sheet and photos to follow in this chat.');
      return lines.join('\n');
    }

    function ensureItems() {
      if (items.length) return true;
      if (addOrSave()) return true;
      return false;
    }

    wire(quoteForm, {
      kind: 'Quote request',
      subject: (f) => `Quote request ${ref} — ${val(f, 'name')} (${fmtPostcode(val(f, 'postcode'))})`,
      compose,
      before: () => (ensureItems() ? '' : 'Please add at least one window or door to your schedule.'),
      after: (via) =>
        via === 'email'
          ? `Your email app should open with request ${ref} ready — press send there to deliver it.`
          : `WhatsApp should open with request ${ref} ready — press send in WhatsApp. Then tap “Save quote sheet” and attach it, with photos, in the same chat.`,
    });

    /* ---------- quote sheet (PNG) ---------- */
    async function sheetBlob() {
      const fonts = ['700 32px Archivo', '600 22px Archivo', '400 16px "IBM Plex Sans"', '600 16px "IBM Plex Sans"', '500 12px "IBM Plex Mono"'];
      await Promise.all(fonts.map((f) => document.fonts?.load(f).catch(() => null)));
      const refs = refsOf(items);
      const f = quoteForm;
      const Wd = 1080, S = 2, M = 48;
      const rowH = 268;
      const meas = document.createElement('canvas').getContext('2d');
      const wrap = (ctx, text, maxW) => {
        const words = String(text).split(/\s+/);
        const out = [];
        let line = '';
        words.forEach((w) => {
          const t = line ? `${line} ${w}` : w;
          if (ctx.measureText(t).width > maxW && line) { out.push(line); line = w; } else line = t;
        });
        if (line) out.push(line);
        return out;
      };
      meas.font = '400 16px "IBM Plex Sans"';
      const notes = val(f, 'message') ? wrap(meas, val(f, 'message'), Wd - 2 * M) : [];
      const headH = 150, custH = 200, schedHeadH = 70;
      const footH = 150 + (notes.length ? 40 + notes.length * 24 : 0);
      const Ht = headH + custH + schedHeadH + items.length * rowH + footH;
      const cv = document.createElement('canvas');
      cv.width = Wd * S;
      cv.height = Ht * S;
      const c = cv.getContext('2d');
      c.scale(S, S);
      const INK = '#1b2024', SLATE = '#586166', MUTED = '#7a8287', BRASS = '#b98a45', LINE = '#d5d9d6', PAPER = '#f4f5f3';
      const text = (t, x, y, font, color = INK, align = 'left') => { c.font = font; c.fillStyle = color; c.textAlign = align; c.fillText(t, x, y); };
      c.fillStyle = '#fff'; c.fillRect(0, 0, Wd, Ht);
      // header
      c.fillStyle = INK; c.fillRect(0, 0, Wd, headH);
      c.strokeStyle = '#f1f2f0'; c.lineWidth = 4; c.strokeRect(M + 2, 50, 46, 46);
      c.lineWidth = 3; c.beginPath(); c.moveTo(M + 25, 52); c.lineTo(M + 25, 94); c.moveTo(M + 4, 66); c.lineTo(M + 46, 66); c.stroke();
      c.fillStyle = BRASS; c.fillRect(M + 29, 70, 14, 21);
      text((VX.brand || '').toUpperCase(), M + 66, 80, '700 32px Archivo', '#f1f2f0');
      text('WINDOWS & DOORS', M + 67, 102, '500 12px "IBM Plex Mono"', '#9aa1a5');
      text('QUOTE REQUEST', Wd - M, 62, '500 13px "IBM Plex Mono"', BRASS, 'right');
      text(ref, Wd - M, 94, '600 26px Archivo', '#f1f2f0', 'right');
      text(today(), Wd - M, 120, '400 15px "IBM Plex Sans"', '#9aa1a5', 'right');
      // customer
      let y = headH + 44;
      text('CUSTOMER', M, y, '500 12px "IBM Plex Mono"', BRASS);
      const pairs = [['Name', val(f, 'name') || '—'], ['Phone', val(f, 'phone') || '—'], ['Email', val(f, 'email') || '—'], ['Postcode', val(f, 'postcode') ? fmtPostcode(val(f, 'postcode')) : '—'], ['Property', val(f, 'property')], ['Start', val(f, 'timeframe')]];
      pairs.forEach(([k, v], i) => {
        const col = i % 3, row = Math.floor(i / 3);
        const x = M + col * ((Wd - 2 * M) / 3), yy = y + 36 + row * 62;
        text(k.toUpperCase(), x, yy, '500 11px "IBM Plex Mono"', MUTED);
        c.font = '600 17px "IBM Plex Sans"';
        let vv = v;
        while (c.measureText(vv).width > (Wd - 2 * M) / 3 - 16 && vv.length > 4) vv = vv.slice(0, -2);
        text(vv === v ? v : vv + '…', x, yy + 24, '600 17px "IBM Plex Sans"', INK);
      });
      y = headH + custH;
      c.fillStyle = LINE; c.fillRect(M, y - 10, Wd - 2 * M, 1);
      // schedule head
      const units = items.reduce((a, it) => a + clampQty(it.qty), 0);
      const area = items.reduce((a, it) => a + areaOf(it), 0);
      text('SCHEDULE', M, y + 30, '500 12px "IBM Plex Mono"', BRASS);
      text(`${items.length} items · ${units} units${area ? ` · ${area.toFixed(2)} m²` : ''}`, Wd - M, y + 30, '600 16px "IBM Plex Sans"', INK, 'right');
      y += schedHeadH;
      // items
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        const y0 = y + i * rowH;
        c.fillStyle = i % 2 ? '#fff' : PAPER; c.fillRect(M, y0, Wd - 2 * M, rowH - 12);
        const d = D.svg(it.type, { w: it.w, h: it.h, hinge: it.hinge || 'left', colour: it.colour, glass: it.glass, box: 160 });
        const img = new Image();
        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(d.svg);
        try { await img.decode(); } catch { /* skip drawing */ }
        const bx = M + 28, by = y0 + 52, bw = 190, bh = 170;
        const sc = Math.min(bw / d.fw, bh / d.fh, 1);
        const dw = d.fw * sc, dh = d.fh * sc;
        const ix = bx + (bw - dw) / 2, iy = by + (bh - dh) / 2;
        if (img.complete && img.naturalWidth) c.drawImage(img, ix, iy, dw, dh);
        // dimension lines
        c.strokeStyle = SLATE; c.lineWidth = 1;
        c.beginPath(); c.moveTo(ix, iy - 16); c.lineTo(ix + dw, iy - 16); c.moveTo(ix, iy - 22); c.lineTo(ix, iy - 10); c.moveTo(ix + dw, iy - 22); c.lineTo(ix + dw, iy - 10);
        c.moveTo(ix + dw + 16, iy); c.lineTo(ix + dw + 16, iy + dh); c.moveTo(ix + dw + 10, iy); c.lineTo(ix + dw + 22, iy); c.moveTo(ix + dw + 10, iy + dh); c.lineTo(ix + dw + 22, iy + dh); c.stroke();
        c.font = '500 12px "IBM Plex Mono"';
        const wt = it.w ? `${it.w}` : 'W?';
        const tw = c.measureText(wt).width + 10;
        c.fillStyle = i % 2 ? '#fff' : PAPER; c.fillRect(ix + dw / 2 - tw / 2, iy - 24, tw, 16);
        text(wt, ix + dw / 2, iy - 12, '500 12px "IBM Plex Mono"', INK, 'center');
        c.save(); c.translate(ix + dw + 16, iy + dh / 2); c.rotate(-Math.PI / 2);
        const ht = it.h ? `${it.h}` : 'H?';
        const th = c.measureText(ht).width + 10;
        c.fillStyle = i % 2 ? '#fff' : PAPER; c.fillRect(-th / 2, -8, th, 16);
        text(ht, 0, 4, '500 12px "IBM Plex Mono"', INK, 'center');
        c.restore();
        // details
        const tx = M + 280;
        c.fillStyle = INK; c.fillRect(tx, y0 + 30, 48, 26);
        text(refs[i], tx + 24, y0 + 49, '600 15px Archivo', '#f1f2f0', 'center');
        text(nameOf(it.type), tx + 62, y0 + 51, '600 22px Archivo', INK);
        if (it.room) text(it.room, Wd - M - 24, y0 + 50, '400 15px "IBM Plex Sans"', SLATE, 'right');
        const rows = [
          ['Size', sizeText(it)], ['Quantity', String(clampQty(it.qty))], ['Glazing', `${it.glaze} · ${it.glass} glass`], ['Colour', it.colour],
          ...(openingLabel(it) || D.KIND[it.type] === 'W' ? [['Opening', [openingLabel(it), D.KIND[it.type] === 'W' ? `Trickle vents: ${it.vents.toLowerCase()}` : ''].filter(Boolean).join(' · ')]] : []),
        ];
        rows.forEach(([k, v], j) => {
          text(k.toUpperCase(), tx, y0 + 90 + j * 27, '500 11px "IBM Plex Mono"', MUTED);
          text(v, tx + 110, y0 + 90 + j * 27, '400 16px "IBM Plex Sans"', INK);
        });
        if (it.note) {
          c.font = 'italic 400 15px "IBM Plex Sans"';
          const nl = wrap(c, `Note: ${it.note}`, Wd - M - 24 - tx).slice(0, 2);
          nl.forEach((l, j) => text(l, tx, y0 + 90 + rows.length * 27 + 6 + j * 21, 'italic 400 15px "IBM Plex Sans"', SLATE));
        }
      }
      // footer
      y += items.length * rowH + 10;
      if (notes.length) {
        text('NOTES', M, y + 20, '500 12px "IBM Plex Mono"', BRASS);
        notes.forEach((l, j) => text(l, M, y + 48 + j * 24, '400 16px "IBM Plex Sans"', INK));
        y += 40 + notes.length * 24;
      }
      c.fillStyle = LINE; c.fillRect(M, y + 20, Wd - 2 * M, 1);
      text('Sizes are customer measurements and will be confirmed at a free survey. This is a request for a quotation, not a price.', M, y + 52, '400 14px "IBM Plex Sans"', SLATE);
      text(`${(VX.url || '').replace(/^https?:\/\//, '')} · WhatsApp ${VX.phoneDisplay || ''}`, M, y + 82, '600 15px "IBM Plex Sans"', INK);
      text('Drawings viewed from outside · dashed lines meet at the hinge side', Wd - M, y + 82, '400 13px "IBM Plex Sans"', MUTED, 'right');
      return new Promise((res) => cv.toBlob(res, 'image/png'));
    }

    el.sheet?.addEventListener('click', async () => {
      if (!ensureItems()) { showMsg(quoteForm, 'Please add at least one window or door to your schedule first.'); return; }
      const label = el.sheet.querySelector('span');
      const old = label.textContent;
      label.textContent = 'Preparing…';
      el.sheet.disabled = true;
      try {
        const blob = await sheetBlob();
        const name = `${VX.brand || 'Quote'}-quote-${ref}.png`;
        const file = typeof File === 'function' ? new File([blob], name, { type: 'image/png' }) : null;
        if (file && navigator.canShare?.({ files: [file] }) && matchMedia('(pointer: coarse)').matches) {
          await navigator.share({ files: [file], title: `Quote request ${ref}` }).catch(() => {});
        } else {
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = name;
          document.body.append(a);
          a.click();
          setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 4000);
        }
        showMsg(quoteForm, `Quote sheet ${ref} saved. Attach it in your WhatsApp chat with us.`, true);
      } catch {
        showMsg(quoteForm, 'Sorry, the quote sheet could not be created on this device. Your WhatsApp message still contains every detail.');
      } finally {
        label.textContent = old;
        el.sheet.disabled = false;
      }
    });
    VX.quoteSheet = sheetBlob;
  }

  /* =====================================================
     BOOKING
     ===================================================== */
  const bookForm = document.getElementById('book-form');
  if (bookForm) {
    const typeLabels = { survey: 'Free survey (new windows/doors)', repair: 'Repair visit', service: 'Servicing', other: 'Other enquiry' };
    const sync = () => {
      const t = bookForm.querySelector('[name="type"]:checked')?.value;
      bookForm.querySelectorAll('[data-show-for]').forEach((el) => (el.hidden = el.dataset.showFor !== t));
    };
    const t = params.get('type');
    if (t && bookForm.querySelector(`[name="type"][value="${t}"]`)) bookForm.querySelector(`[name="type"][value="${t}"]`).checked = true;
    const r = params.get('repair');
    if (r && bookForm.elements.repair) bookForm.elements.repair.value = r;
    bookForm.addEventListener('change', sync);
    sync();

    // dates: from tomorrow, warn on Sundays
    const tomorrow = new Date(Date.now() + 864e5);
    const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const closedDays = (VX.hours || []).filter((h) => !h.open).flatMap((h) => h.dow);
    ['date', 'date2'].forEach((n) => {
      const el = bookForm.elements[n];
      if (!el) return;
      el.min = iso(tomorrow);
      el.addEventListener('change', () => {
        const d = el.value ? new Date(el.value + 'T12:00:00') : null;
        const hint = document.getElementById('date-hint');
        if (d && closedDays.includes(d.getDay())) {
          hint.textContent = 'We’re normally closed that day — please choose another date or add a note.';
          hint.style.color = 'var(--err)';
        } else {
          hint.textContent = 'We’re closed on Sundays. Saturday appointments are limited.';
          hint.style.color = '';
        }
      });
    });
    const niceDate = (v) => (v ? new Date(v + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : '');

    wire(bookForm, {
      kind: 'Booking request',
      subject: (f) => `Booking request — ${val(f, 'name')} (${fmtPostcode(val(f, 'postcode'))})`,
      compose(form) {
        const type = form.querySelector('[name="type"]:checked')?.value || 'other';
        const rep = type === 'repair' && form.elements.repair.value ? form.elements.repair.selectedOptions[0].textContent : '';
        return [
          `*Booking request — ${VX.brand} website*`,
          '',
          `Visit: ${typeLabels[type]}${rep ? ` — ${rep}` : ''}`,
          `Items: ${val(form, 'count')}`,
          `Preferred: ${niceDate(val(form, 'date'))}, ${val(form, 'slot')}`,
          val(form, 'date2') && `Alternative: ${niceDate(val(form, 'date2'))}`,
          '',
          ...contactLines(form),
          `I am the: ${val(form, 'role')}`,
          val(form, 'message') && `\n*Details*\n${val(form, 'message')}`,
          type === 'repair' ? '\nI’ll attach photos of the problem.' : '',
        ]
          .filter((l) => l !== false && l != null)
          .join('\n')
          .replace(/\n{3,}/g, '\n\n')
          .trim();
      },
    });
  }

  /* =====================================================
     CONTACT
     ===================================================== */
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    wire(contactForm, {
      kind: 'Contact message',
      subject: (f) => `${val(f, 'subject')} — ${val(f, 'name')}`,
      compose(form) {
        return [`*Message — ${VX.brand} website*`, `Subject: ${val(form, 'subject')}`, '', ...contactLines(form), '', val(form, 'message')].join('\n').trim();
      },
    });
  }
})();
