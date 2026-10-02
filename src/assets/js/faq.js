/* FAQ search filter. */
(() => {
  'use strict';
  const input = document.getElementById('faq-search');
  if (!input) return;
  const items = [...document.querySelectorAll('.faqpage__main .faq__item')];
  const groups = [...document.querySelectorAll('.faqgroup')];
  const empty = document.querySelector('.faq-empty');
  const norm = (s) => s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  const index = items.map((el) => norm(el.textContent));

  input.addEventListener('input', () => {
    const words = norm(input.value).split(' ').filter((w) => w.length > 1);
    let shown = 0;
    items.forEach((el, i) => {
      const hit = !words.length || words.every((w) => index[i].includes(w));
      el.hidden = !hit;
      if (hit) shown++;
      if (words.length && hit && input.value.length > 2) el.open = true;
      if (!words.length) el.open = false;
    });
    groups.forEach((g) => (g.hidden = ![...g.querySelectorAll('.faq__item')].some((el) => !el.hidden)));
    empty.hidden = shown > 0;
  });
})();
