/* Quote builder, booking and contact forms.
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

  function wire(form, { kind, subject, compose }) {
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
      const text = compose(form);
      postCopy(kind, form, text);
      if (via === 'email') {
        openEmail(subject(form), text);
        showMsg(form, 'Your email app should open with the message ready — press send there to deliver it.', true);
      } else {
        openWhatsApp(text);
        showMsg(form, 'WhatsApp should open with your message ready — press send in WhatsApp to deliver it. Not opening? Call us instead.', true);
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
     QUOTE BUILDER
     ===================================================== */
  const quoteForm = document.getElementById('quote-form');
  if (quoteForm) {
    const list = document.getElementById('qb-items');
    const tpl = document.getElementById('qb-item-tpl');
    const fields = ['type', 'w', 'h', 'qty', 'glaze', 'colour', 'glass', 'note'];

    const renumber = () => {
      [...list.children].forEach((el, i) => {
        el.querySelector('.qitem__n').textContent = `Item ${i + 1}`;
        el.querySelector('.qitem__del').setAttribute('aria-label', `Remove item ${i + 1}`);
      });
    };
    const readItems = () =>
      [...list.children].map((el) => Object.fromEntries(fields.map((f) => [f, el.querySelector(`[name="${f}"]`).value.trim()])));
    const typeLabel = (el) => el.querySelector('[name="type"]').selectedOptions[0]?.textContent || '';

    const update = () => {
      const items = readItems();
      let units = 0;
      let area = 0;
      let measured = 0;
      items.forEach((it) => {
        const q = Math.max(1, parseInt(it.qty, 10) || 1);
        units += q;
        const w = parseFloat(it.w);
        const h = parseFloat(it.h);
        if (w > 0 && h > 0) {
          area += (w * h * q) / 1e6;
          measured++;
        }
      });
      document.getElementById('qs-items').textContent = items.length;
      document.getElementById('qs-units').textContent = units;
      document.getElementById('qs-area').textContent = measured ? `${area.toFixed(2)} m²` : '—';
      store.set('vx-quote', items);
    };

    const add = (data = {}, focus = false) => {
      const node = tpl.content.firstElementChild.cloneNode(true);
      fields.forEach((f) => {
        if (data[f] != null && data[f] !== '') node.querySelector(`[name="${f}"]`).value = data[f];
      });
      // ids/labels are implicit (label wraps control), so cloning is safe
      node.querySelector('.qitem__del').addEventListener('click', () => {
        node.remove();
        renumber();
        update();
        list.lastElementChild?.querySelector('select')?.focus();
      });
      list.append(node);
      renumber();
      update();
      if (focus) node.querySelector('select').focus();
    };

    const saved = store.get('vx-quote');
    const pre = params.get('item');
    if (Array.isArray(saved) && saved.length) saved.forEach((it) => add(it));
    else add(pre ? { type: pre } : {});
    if (pre && Array.isArray(saved) && saved.length && !saved.some((s) => s.type === pre)) add({ type: pre });

    document.getElementById('qb-add').addEventListener('click', () => add({}, true));
    list.addEventListener('input', update);
    list.addEventListener('change', update);

    wire(quoteForm, {
      kind: 'Quote request',
      subject: (f) => `Quote request — ${val(f, 'name')} (${fmtPostcode(val(f, 'postcode'))})`,
      compose(form) {
        const nodes = [...list.children];
        const items = readItems();
        let area = 0;
        const lines = items.map((it, i) => {
          const q = Math.max(1, parseInt(it.qty, 10) || 1);
          const size = it.w && it.h ? `${it.w} × ${it.h} mm` : 'size TBC';
          if (it.w && it.h) area += (it.w * it.h * q) / 1e6;
          return `${i + 1}. ${typeLabel(nodes[i])} — ${size} × ${q}\n   ${it.glaze} · ${it.colour} · ${it.glass} glass${it.note ? `\n   Note: ${it.note}` : ''}`;
        });
        return [
          `*Quote request — ${VX.brand} website*`,
          '',
          ...contactLines(form),
          `Property: ${val(form, 'property')} · Start: ${val(form, 'timeframe')}`,
          '',
          '*Items*',
          ...lines,
          area ? `Total area ≈ ${area.toFixed(2)} m²` : '',
          val(form, 'message') ? `\n*Notes*\n${val(form, 'message')}` : '',
          '',
          'I can send photos of each window/door.',
        ]
          .filter((l, i, a) => !(l === '' && a[i - 1] === ''))
          .join('\n')
          .trim();
      },
    });
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
