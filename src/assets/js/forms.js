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
    // send only filled-in fields; the consent tick itself is not personal data the provider needs
    const fd = Object.fromEntries([...new FormData(form).entries()].filter(([k, v]) => k !== 'consent' && String(v).trim() !== ''));
    try {
      fetch(VX.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ _subject: `${VX.brand} website — ${kind}`, form: kind, ...fd, summary: text }),
        keepalive: true,
      })
        .then((r) => { if (!r.ok) console.warn('Form copy was not accepted by the form service:', r.status); })
        .catch((e) => console.warn('Form copy could not be sent:', e));
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
      next: $('ql-next'), nextSum: $('ql-next-sum'), cont: $('ql-continue'), dToggle: $('qd-toggle'), dBody: $('qd-body'), dSec: $('quote-details'), dHint: $('qd-hint'),
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
      if (el.next) {
        el.next.hidden = items.length === 0;
        el.nextSum.textContent = `${items.length} item${items.length === 1 ? '' : 's'} · ${units} unit${units === 1 ? '' : 's'}${area ? ` · ${area.toFixed(2)} m²` : ''}`;
      }
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

    /* ---------- step 2: job and contact details (opens after "Send for quote") ---------- */
    const smooth = () => (matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth');
    function setDetails(open, { scroll = false } = {}) {
      if (!el.dSec) return;
      el.dSec.classList.toggle('is-collapsed', !open);
      el.dToggle.setAttribute('aria-expanded', String(open));
      el.dBody.inert = !open;
      if (open) {
        const h = el.dBody.scrollHeight;
        el.dBody.style.maxHeight = `${h}px`;
        setTimeout(() => { if (!el.dSec.classList.contains('is-collapsed')) el.dBody.style.maxHeight = 'none'; }, 650);
        if (scroll) {
          el.dSec.scrollIntoView({ behavior: smooth(), block: 'start' });
          setTimeout(() => quoteForm.elements.name?.focus({ preventScroll: true }), 700);
        }
      } else {
        el.dBody.style.maxHeight = `${el.dBody.scrollHeight}px`;
        requestAnimationFrame(() => { el.dBody.style.maxHeight = '0px'; });
      }
    }
    if (el.dSec) {
      // collapsed until the visitor has a list and chooses to continue
      el.dSec.classList.add('is-collapsed');
      el.dBody.style.maxHeight = '0px';
      el.dBody.inert = true;
      el.dToggle.setAttribute('aria-expanded', 'false');
      el.dToggle.addEventListener('click', () => {
        const open = el.dSec.classList.contains('is-collapsed');
        if (open && !items.length) { say('Add at least one window or door to your list first.', true); cfg.scrollIntoView({ behavior: smooth(), block: 'start' }); return; }
        setDetails(open, { scroll: open });
      });
      el.cont?.addEventListener('click', () => setDetails(true, { scroll: true }));
      window.addEventListener('resize', () => { if (!el.dSec.classList.contains('is-collapsed')) el.dBody.style.maxHeight = 'none'; });
    }

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
      const full = lines.join('\n');
      if (encodeURIComponent(full).length <= 7000) return full;
      // very long schedules: one line per item so every item still fits in a single WhatsApp message
      const head = lines.slice(0, lines.findIndex((l) => l.startsWith('*Schedule')) + 1);
      const rows = items.map((it, i) => {
        const bits = [
          `${it.w || it.h ? `${it.w || '?'}×${it.h || '?'} mm` : 'size TBC'} ×${clampQty(it.qty)}`,
          it.glaze, it.colour, `${it.glass} glass`, openingLabel(it),
          D.KIND[it.type] === 'W' ? `vents ${it.vents.toLowerCase()}` : '',
          it.note ? `note: ${it.note}` : '',
        ].filter(Boolean);
        return `${refs[i]} ${nameOf(it.type)}${it.room ? ` (${it.room})` : ''}: ${bits.join(' · ')}`;
      });
      return [...head, ...rows, ...(val(form, 'message') ? ['', '*Notes*', val(form, 'message')] : []), '', '_Sizes are customer measurements, to be confirmed at survey._', 'Quote sheet with drawings and photos to follow in this chat.'].join('\n');
    }

    function ensureItems() {
      if (items.length) return true;
      if (addOrSave()) return true;
      return false;
    }

    /* ---------- short WhatsApp / email message (the full schedule goes in the PDF) ---------- */
    function shortMessage(form, link = '') {
      const refs = refsOf(items);
      const units = items.reduce((a, it) => a + clampQty(it.qty), 0);
      return [
        `*Quote request ${ref} · ${VX.name || ''}*`,
        '',
        ...contactLines(form),
        `Property: ${val(form, 'property')} · Start: ${val(form, 'timeframe')}`,
        '',
        `*${items.length} item${items.length === 1 ? '' : 's'} · ${units} unit${units === 1 ? '' : 's'}*`,
        ...items.map((it, i) => `${refs[i]} ${nameOf(it.type)}${it.room ? ` (${it.room})` : ''} · ${it.w && it.h ? `${it.w}×${it.h} mm` : 'size TBC'} · ×${clampQty(it.qty)}`),
        '',
        link ? `📄 Full schedule with drawings (PDF): ${link}` : `📎 Full schedule with drawings: ${pdfName()} (attached).`,
      ].join('\n');
    }
    const pdfName = () => `${VX.brand || 'Quote'}-quote-${ref}.pdf`;

    /* ---------- PDF: cover page + one page per item ---------- */
    const COLOUR_HEX = { White: '#f5f5f2', Cream: '#ede6cf', 'Agate grey': '#b4b2aa', 'Anthracite grey': '#3a4044', Black: '#232426', 'Chartwell green': '#8fa592', 'Golden oak': '#a8692d', Rosewood: '#5b2a22' };
    async function pdfBlob() {
      const fonts = ['700 34px Archivo', '600 26px Archivo', '400 18px "IBM Plex Sans"', '600 18px "IBM Plex Sans"', 'italic 400 18px "IBM Plex Sans"', '500 14px "IBM Plex Mono"'];
      await Promise.all(fonts.map((f) => document.fonts?.load(f).catch(() => null)));
      const f = quoteForm;
      const refs = refsOf(items);
      const PW = 1240, PH = 1754, M = 80; // A4 at 150 dpi
      const INK = '#1b2024', SLATE = '#586166', MUTED = '#7a8287', BRASS = '#b98a45', LINE = '#d5d9d6', PAPER = '#f4f5f3';
      const units = items.reduce((a, it) => a + clampQty(it.qty), 0);
      const total = items.reduce((a, it) => a + areaOf(it), 0);
      const pages = items.length + 1;
      const cust = [['Name', val(f, 'name') || '—'], ['Phone', val(f, 'phone') || '—'], ['Email', val(f, 'email') || '—'], ['Postcode', val(f, 'postcode') ? fmtPostcode(val(f, 'postcode')) : '—'], ['Property', val(f, 'property')], ['Start', val(f, 'timeframe')]];

      const newPage = () => {
        const cv = document.createElement('canvas');
        cv.width = PW; cv.height = PH;
        const c = cv.getContext('2d');
        c.fillStyle = '#fff'; c.fillRect(0, 0, PW, PH);
        return { cv, c };
      };
      const T = (c, t, x, y, font, color = INK, align = 'left', maxW) => {
        c.font = font; c.fillStyle = color; c.textAlign = align;
        let s = String(t);
        if (maxW) while (s.length > 3 && c.measureText(s).width > maxW) s = s.slice(0, -2);
        c.fillText(s === String(t) ? s : `${s.trimEnd()}…`, x, y);
      };
      const wrap = (c, text, maxW) => {
        const out = []; let line = '';
        String(text).split(/\s+/).forEach((w) => { const t = line ? `${line} ${w}` : w; if (c.measureText(t).width > maxW && line) { out.push(line); line = w; } else line = t; });
        if (line) out.push(line);
        return out;
      };
      const header = (c, n) => {
        c.fillStyle = INK; c.fillRect(0, 0, PW, 170);
        c.strokeStyle = '#f1f2f0'; c.lineWidth = 5; c.strokeRect(M + 2, 52, 60, 60);
        c.lineWidth = 4; c.beginPath(); c.moveTo(M + 32, 55); c.lineTo(M + 32, 109); c.moveTo(M + 5, 74); c.lineTo(M + 59, 74); c.stroke();
        c.fillStyle = BRASS; c.fillRect(M + 37, 79, 18, 27);
        T(c, (VX.brand || '').toUpperCase(), M + 84, 92, '700 40px Archivo', '#f1f2f0');
        T(c, 'WINDOWS & DOORS', M + 86, 118, '500 14px "IBM Plex Mono"', '#9aa1a5');
        T(c, 'QUOTE REQUEST', PW - M, 70, '500 15px "IBM Plex Mono"', BRASS, 'right');
        T(c, ref, PW - M, 106, '600 30px Archivo', '#f1f2f0', 'right');
        T(c, `${today()} · page ${n} of ${pages}`, PW - M, 136, '400 17px "IBM Plex Sans"', '#9aa1a5', 'right');
      };
      const footer = (c) => {
        c.fillStyle = LINE; c.fillRect(M, PH - 110, PW - 2 * M, 1);
        T(c, 'Sizes are customer measurements and will be confirmed at a free survey. This is a request for a quotation, not a price.', M, PH - 76, '400 16px "IBM Plex Sans"', SLATE);
        T(c, `${(VX.url || '').replace(/^https?:\/\//, '')} · WhatsApp ${VX.phoneDisplay || ''}`, M, PH - 46, '600 17px "IBM Plex Sans"', INK);
        T(c, 'Drawings viewed from outside · dashed lines meet at the hinge side', PW - M, PH - 46, '400 15px "IBM Plex Sans"', MUTED, 'right');
      };
      const custBlock = (c, y, compact) => {
        T(c, 'CUSTOMER', M, y, '500 15px "IBM Plex Mono"', BRASS);
        cust.forEach(([k, v], i) => {
          const col = i % 3, row = Math.floor(i / 3), cw = (PW - 2 * M) / 3;
          const x = M + col * cw, yy = y + 40 + row * (compact ? 58 : 72);
          T(c, k.toUpperCase(), x, yy, '500 13px "IBM Plex Mono"', MUTED);
          T(c, v, x, yy + 28, `600 ${compact ? 19 : 21}px "IBM Plex Sans"`, INK, 'left', cw - 20);
        });
      };
      const svgImage = async (it, box) => {
        const d = D.svg(it.type, { w: it.w, h: it.h, hinge: it.hinge || 'left', colour: it.colour, glass: it.glass, box });
        const img = new Image();
        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(d.svg);
        try { await img.decode(); } catch { return null; }
        return { img, d };
      };
      const jpeg = (cv) => new Promise((res) => cv.toBlob(async (b) => res({ bytes: new Uint8Array(await b.arrayBuffer()), w: cv.width, h: cv.height }), 'image/jpeg', 0.88));
      const out = [];

      // page 1: customer + schedule overview
      {
        const { cv, c } = newPage();
        header(c, 1);
        custBlock(c, 230, false);
        let y = 430;
        c.fillStyle = LINE; c.fillRect(M, y - 30, PW - 2 * M, 1);
        T(c, 'SCHEDULE', M, y, '500 15px "IBM Plex Mono"', BRASS);
        T(c, `${items.length} item${items.length === 1 ? '' : 's'} · ${units} unit${units === 1 ? '' : 's'}${total ? ` · ${total.toFixed(2)} m²` : ''}`, PW - M, y, '600 19px "IBM Plex Sans"', INK, 'right');
        y += 30;
        const cols = [[M, 'REF'], [M + 90, 'PRODUCT'], [M + 450, 'ROOM'], [M + 700, 'SIZE (W × H)'], [M + 950, 'QTY'], [M + 1010, 'PAGE']];
        c.fillStyle = PAPER; c.fillRect(M, y, PW - 2 * M, 44);
        cols.forEach(([x, t]) => T(c, t, x + 10, y + 28, '500 13px "IBM Plex Mono"', SLATE));
        y += 44;
        const maxRows = Math.floor((PH - 170 - y - (val(f, 'message') ? 160 : 40)) / 40);
        items.slice(0, maxRows).forEach((it, i) => {
          if (i % 2) { c.fillStyle = '#fafbfa'; c.fillRect(M, y, PW - 2 * M, 40); }
          T(c, refs[i], M + 10, y + 27, '600 17px "IBM Plex Sans"', INK);
          T(c, nameOf(it.type), M + 100, y + 27, '400 17px "IBM Plex Sans"', INK, 'left', 340);
          T(c, it.room || '—', M + 460, y + 27, '400 17px "IBM Plex Sans"', SLATE, 'left', 230);
          T(c, it.w || it.h ? `${it.w || '?'} × ${it.h || '?'} mm` : 'to be confirmed', M + 710, y + 27, '400 17px "IBM Plex Sans"', INK);
          T(c, String(clampQty(it.qty)), M + 960, y + 27, '400 17px "IBM Plex Sans"', INK);
          T(c, String(i + 2), M + 1020, y + 27, '400 17px "IBM Plex Sans"', SLATE);
          y += 40;
        });
        if (items.length > maxRows) { T(c, `+ ${items.length - maxRows} more items — see the following pages`, M + 10, y + 30, 'italic 400 17px "IBM Plex Sans"', SLATE); y += 50; }
        if (val(f, 'message')) {
          y += 40;
          T(c, 'NOTES FROM THE CUSTOMER', M, y, '500 15px "IBM Plex Mono"', BRASS);
          c.font = '400 18px "IBM Plex Sans"';
          wrap(c, val(f, 'message'), PW - 2 * M).slice(0, 4).forEach((l, j) => T(c, l, M, y + 36 + j * 28, '400 18px "IBM Plex Sans"', INK));
        }
        footer(c);
        out.push(await jpeg(cv));
      }

      // one page per item
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        const { cv, c } = newPage();
        header(c, i + 2);
        // compact customer strip so every page stands alone
        c.fillStyle = PAPER; c.fillRect(M, 196, PW - 2 * M, 56);
        T(c, `${val(f, 'name') || '—'} · ${val(f, 'phone') || '—'} · ${val(f, 'postcode') ? fmtPostcode(val(f, 'postcode')) : '—'}`, M + 20, 232, '600 18px "IBM Plex Sans"', INK, 'left', PW - 2 * M - 220);
        T(c, `Item ${i + 1} of ${items.length}`, PW - M - 20, 232, '500 15px "IBM Plex Mono"', SLATE, 'right');
        // title
        c.fillStyle = INK; c.fillRect(M, 296, 92, 48);
        T(c, refs[i], M + 46, 330, '600 26px Archivo', '#f1f2f0', 'center');
        T(c, nameOf(it.type), M + 114, 332, '600 34px Archivo', INK, 'left', PW - 2 * M - 120);
        if (it.room) T(c, it.room, M + 114, 368, '400 20px "IBM Plex Sans"', SLATE);
        // drawing with dimension lines
        const areaTop = 410, areaH = 660, areaW = PW - 2 * M;
        c.fillStyle = '#fbfcfb'; c.fillRect(M, areaTop, areaW, areaH);
        c.strokeStyle = 'rgba(27,32,36,.05)'; c.lineWidth = 1;
        for (let gx = M; gx <= M + areaW; gx += 24) { c.beginPath(); c.moveTo(gx, areaTop); c.lineTo(gx, areaTop + areaH); c.stroke(); }
        for (let gy = areaTop; gy <= areaTop + areaH; gy += 24) { c.beginPath(); c.moveTo(M, gy); c.lineTo(M + areaW, gy); c.stroke(); }
        const pic = await svgImage(it, 420);
        if (pic) {
          const maxW = 620, maxH = 500;
          const sc = Math.min(maxW / pic.d.fw, maxH / pic.d.fh, 1.6);
          const dw = pic.d.fw * sc, dh = pic.d.fh * sc;
          const ix = M + (areaW - dw) / 2 - 30, iy = areaTop + 100 + (maxH - dh) / 2;
          c.drawImage(pic.img, ix, iy, dw, dh);
          c.strokeStyle = SLATE; c.lineWidth = 1.5;
          c.beginPath();
          c.moveTo(ix, iy - 34); c.lineTo(ix + dw, iy - 34); c.moveTo(ix, iy - 44); c.lineTo(ix, iy - 24); c.moveTo(ix + dw, iy - 44); c.lineTo(ix + dw, iy - 24);
          c.moveTo(ix + dw + 34, iy); c.lineTo(ix + dw + 34, iy + dh); c.moveTo(ix + dw + 24, iy); c.lineTo(ix + dw + 44, iy); c.moveTo(ix + dw + 24, iy + dh); c.lineTo(ix + dw + 44, iy + dh);
          c.stroke();
          const wl = it.w ? `${it.w} mm` : 'W to confirm';
          c.font = '500 20px "IBM Plex Mono"';
          const tw = c.measureText(wl).width + 20;
          c.fillStyle = '#fbfcfb'; c.fillRect(ix + dw / 2 - tw / 2, iy - 48, tw, 28);
          T(c, wl, ix + dw / 2, iy - 27, '500 20px "IBM Plex Mono"', INK, 'center');
          c.save(); c.translate(ix + dw + 34, iy + dh / 2); c.rotate(-Math.PI / 2);
          const hl = it.h ? `${it.h} mm` : 'H to confirm';
          const th = c.measureText(hl).width + 20;
          c.fillStyle = '#fbfcfb'; c.fillRect(-th / 2, -14, th, 28);
          T(c, hl, 0, 7, '500 20px "IBM Plex Mono"', INK, 'center');
          c.restore();
        }
        // details table
        let y = areaTop + areaH + 50;
        const opening = [openingLabel(it), D.KIND[it.type] === 'W' ? `Trickle vents: ${it.vents.toLowerCase()}` : ''].filter(Boolean).join(' · ');
        const rows = [
          ['Size', sizeText(it)],
          ['Quantity', String(clampQty(it.qty))],
          ...(areaOf(it) ? [['Area', `${areaOf(it).toFixed(2)} m² (all units)`]] : []),
          ['Glazing', it.glaze],
          ['Glass', it.glass],
          ['Colour', it.colour],
          ...(opening ? [['Opening', opening]] : []),
          ...(it.note ? [['Note', it.note]] : []),
        ];
        rows.forEach(([k, v], j) => {
          if (j % 2 === 0) { c.fillStyle = PAPER; c.fillRect(M, y - 30, PW - 2 * M, 46); }
          T(c, k.toUpperCase(), M + 16, y, '500 15px "IBM Plex Mono"', MUTED);
          if (k === 'Colour' && COLOUR_HEX[v]) {
            c.fillStyle = COLOUR_HEX[v]; c.fillRect(M + 260, y - 20, 24, 24);
            c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 1; c.strokeRect(M + 260, y - 20, 24, 24);
            T(c, v, M + 296, y, '400 20px "IBM Plex Sans"', INK);
          } else T(c, v, M + 260, y, k === 'Note' ? 'italic 400 20px "IBM Plex Sans"' : '400 20px "IBM Plex Sans"', INK, 'left', PW - 2 * M - 280);
          y += 46;
        });
        footer(c);
        out.push(await jpeg(cv));
      }
      return makePdf(out, `Quote request ${ref}`);
    }

    // minimal PDF writer: each page is one full-page JPEG image
    function makePdf(pages, title) {
      const enc = new TextEncoder();
      const parts = [];
      let len = 0;
      const offs = [];
      const push = (d) => { const b = typeof d === 'string' ? enc.encode(d) : d; parts.push(b); len += b.length; };
      const W = 595.28, H = 841.89;
      const n = pages.length;
      const obj = (id, fn) => { offs[id] = len; push(`${id} 0 obj\n`); fn(); push('\nendobj\n'); };
      push('%PDF-1.4\n');
      push(new Uint8Array([37, 226, 227, 207, 211, 10]));
      const info = 3 + n * 3;
      obj(1, () => push('<< /Type /Catalog /Pages 2 0 R >>'));
      obj(2, () => push(`<< /Type /Pages /Count ${n} /Kids [${pages.map((_, i) => `${3 + i * 3} 0 R`).join(' ')}] >>`));
      pages.forEach((pg, i) => {
        const pid = 3 + i * 3, cid = pid + 1, iid = pid + 2;
        obj(pid, () => push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /XObject << /Im${i} ${iid} 0 R >> >> /Contents ${cid} 0 R >>`));
        const content = `q ${W} 0 0 ${H} 0 0 cm /Im${i} Do Q`;
        obj(cid, () => push(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`));
        obj(iid, () => { push(`<< /Type /XObject /Subtype /Image /Width ${pg.w} /Height ${pg.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${pg.bytes.length} >>\nstream\n`); push(pg.bytes); push('\nendstream'); });
      });
      const safe = String(title).replace(/[()\\\r\n]/g, ' ');
      obj(info, () => push(`<< /Title (${safe}) /Creator (${String(VX.name || '').replace(/[()\\]/g, ' ')} website) >>`));
      const xref = len;
      push(`xref\n0 ${info + 1}\n0000000000 65535 f \n`);
      for (let id = 1; id <= info; id++) push(`${String(offs[id]).padStart(10, '0')} 00000 n \n`);
      push(`trailer\n<< /Size ${info + 1} /Root 1 0 R /Info ${info} 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
      return new Blob(parts, { type: 'application/pdf' });
    }

    /* ---------- sending: build the PDF, save it, then open WhatsApp or email ---------- */
    let lastPdf = null;
    const sendBox = $('qb-sendbox');
    function downloadBlob(blob, name) {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = name;
      document.body.append(a);
      a.click();
      setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 8000);
    }
    // Upload the PDF to the business's Google Drive (Apps Script web app, see scripts/google-drive).
    // Returns the Drive link, or '' so the caller falls back to saving the PDF on the device.
    async function uploadPdf(blob, form) {
      if (!VX.drive || !blob) return '';
      const ctrl = typeof AbortController === 'function' ? new AbortController() : null;
      const timer = setTimeout(() => ctrl?.abort(), 45000);
      try {
        const b64 = await new Promise((res, rej) => {
          const r = new FileReader();
          r.onload = () => res(String(r.result).split(',')[1] || '');
          r.onerror = rej;
          r.readAsDataURL(blob);
        });
        // text/plain keeps this a "simple" request, which Apps Script accepts from another site
        const resp = await fetch(VX.drive, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ ref, pdf: b64, summary: compose(form).replace(/\*/g, '') }),
          signal: ctrl?.signal,
        });
        const j = await resp.json();
        const url = j && j.ok ? String(j.url || '') : '';
        return /^https:\/\/drive\.google\.com\/[\w\-/?=&.%]+$/.test(url) ? url : '';
      } catch {
        return '';
      } finally {
        clearTimeout(timer);
      }
    }
    let lastLink = '';

    async function preparePdf() {
      const label = el.sheet?.querySelector('span');
      const old = label?.textContent;
      if (label) label.textContent = 'Preparing PDF…';
      if (el.sheet) el.sheet.disabled = true;
      try {
        lastPdf = await pdfBlob();
        return lastPdf;
      } finally {
        if (label) label.textContent = old;
        if (el.sheet) el.sheet.disabled = false;
      }
    }
    function showSendBox(via, form, link = '') {
      if (!sendBox) return;
      const isWa = via !== 'email';
      const msg = shortMessage(form, link);
      const href = isWa ? `https://wa.me/${VX.wa}?text=${encodeURIComponent(msg)}` : `mailto:${VX.email}?subject=${encodeURIComponent(`Quote request ${ref} — ${val(form, 'name')}`)}&body=${encodeURIComponent(msg.replace(/\*/g, ''))}`;
      const one = sendBox.querySelector('[data-sb-one]');
      sendBox.querySelector('[data-sb-title]').textContent = link ? 'Your quote is ready to send' : 'Your quote PDF is ready';
      if (link) {
        one.textContent = 'Your PDF is with us. The link to it is already in your message.';
      } else {
        const code = document.createElement('code');
        code.textContent = pdfName();
        const b = document.createElement('strong');
        b.textContent = 'Saved:';
        one.replaceChildren(b, ' ', code);
      }
      sendBox.querySelector('[data-sb-again]').textContent = link ? 'Save a copy' : 'Save again';
      sendBox.querySelector('[data-sb-pages]').textContent = `${items.length + 1} pages · one page per item`;
      const open = sendBox.querySelector('[data-sb-open]');
      open.href = href;
      open.querySelector('span').textContent = isWa ? 'Open WhatsApp chat' : 'Open my email';
      open.className = `btn btn--lg ${isWa ? 'btn--wa' : 'btn--primary'}`;
      if (isWa) { open.target = '_blank'; open.rel = 'noopener'; } else { open.removeAttribute('target'); }
      sendBox.querySelector('[data-sb-how]').textContent = link
        ? (isWa ? 'Tap “Open WhatsApp chat” below, then press Send. Nothing to attach.' : 'Tap “Open my email” below, then press Send. Nothing to attach.')
        : isWa
          ? 'In the WhatsApp chat, tap 📎 (or +) → Document, choose the PDF from Downloads, then press Send.'
          : 'In your email, attach the PDF from Downloads, then press Send.';
      const share = sendBox.querySelector('[data-sb-share]');
      const file = typeof File === 'function' && lastPdf ? new File([lastPdf], pdfName(), { type: 'application/pdf' }) : null;
      share.hidden = !!link || !(isWa && file && navigator.canShare?.({ files: [file] }));
      share.onclick = () => navigator.share({ files: [file], title: `Quote request ${ref}`, text: shortMessage(form) }).catch(() => {});
      sendBox.querySelector('[data-sb-again]').onclick = () => lastPdf && downloadBlob(lastPdf, pdfName());
      sendBox.hidden = false;
      sendBox.scrollIntoView({ behavior: smooth(), block: 'center' });
      open.focus({ preventScroll: true });
    }

    let via = 'whatsapp';
    quoteForm.querySelectorAll('[data-send]').forEach((b) => b.addEventListener('click', () => (via = b.dataset.send)));
    quoteForm.addEventListener('input', (e) => { const x = e.target.closest('.is-invalid'); if (x) x.classList.remove('is-invalid'); });
    quoteForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (e.submitter?.dataset.send) via = e.submitter.dataset.send;
      const errors = validate(quoteForm);
      if (errors.length) {
        showMsg(quoteForm, errors.length === 1 ? errors[0].msg : `Please check the ${errors.length} highlighted fields.`);
        errors[0].el.focus();
        return;
      }
      if (!ensureItems()) { showMsg(quoteForm, 'Please add at least one window or door to your schedule.'); return; }
      showMsg(quoteForm, '');
      postCopy('Quote request', quoteForm, compose(quoteForm));
      const btns = [...quoteForm.querySelectorAll('[data-send]')];
      const pressed = btns.find((b) => b.dataset.send === via)?.querySelector('span');
      const label = pressed?.textContent;
      btns.forEach((b) => (b.disabled = true));
      try {
        const blob = await preparePdf();
        let link = '';
        if (VX.drive) {
          if (pressed) pressed.textContent = 'Sending your PDF…';
          link = await uploadPdf(blob, quoteForm);
        }
        lastLink = link;
        if (!link) downloadBlob(blob, pdfName());
        showSendBox(via, quoteForm, link);
      } catch {
        // PDF could not be made on this device: fall back to the full text schedule
        if (via === 'email') openEmail(`Quote request ${ref} — ${val(quoteForm, 'name')}`, compose(quoteForm));
        else openWhatsApp(compose(quoteForm));
        showMsg(quoteForm, `WhatsApp should open with request ${ref} and your full list. Press send there.`, true);
      } finally {
        btns.forEach((b) => (b.disabled = false));
        if (pressed && label) pressed.textContent = label;
      }
    });

    el.sheet?.addEventListener('click', async () => {
      if (!ensureItems()) { showMsg(quoteForm, 'Please add at least one window or door to your schedule first.'); return; }
      try {
        downloadBlob(await preparePdf(), pdfName());
        showMsg(quoteForm, `${pdfName()} saved.`, true);
      } catch {
        showMsg(quoteForm, 'Sorry, the PDF could not be created on this device. Your WhatsApp message will still contain every detail.');
      }
    });
    VX.quotePdf = pdfBlob;
    VX.quoteShort = () => shortMessage(quoteForm, lastLink);
    VX.quoteFull = () => compose(quoteForm);
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
    // prefill from the link, matching exact values only (never build selectors from the URL)
    try {
      const t = params.get('type');
      const radio = t && [...bookForm.querySelectorAll('[name="type"]')].find((x) => x.value === t);
      if (radio) radio.checked = true;
      const r = params.get('repair');
      const sel = bookForm.elements.repair;
      if (r && sel && [...sel.options].some((o) => o.value === r)) sel.value = r;
    } catch { /* ignore a bad link */ }
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
