import { icon, brandIcon, logoMark, productDrawing, productThumb } from './svg.mjs';

export const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const telText = (site) => site.contact.phoneDisplay.replace(/ /g, '&nbsp;');

export const waLink = (site, text = '') =>
  `https://wa.me/${site.contact.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

const fmt12 = (t) => {
  if (!t) return '';
  let [h, m] = t.split(':').map(Number);
  const ap = h >= 12 ? 'pm' : 'am';
  h = h % 12 || 12;
  return m ? `${h}:${String(m).padStart(2, '0')}${ap}` : `${h}${ap}`;
};
export function hoursLine(site) {
  return site.hours
    .filter((h) => h.open)
    .map((h) => `${h.short} ${fmt12(h.open)}–${fmt12(h.close)}`)
    .join(' · ');
}

export const hoursText = (h) => (h.open ? `${fmt12(h.open)} – ${fmt12(h.close)}` : 'Closed');

export function addressLines(site) {
  const a = site.contact.address;
  return [a.street, a.locality, a.region, a.postcode].filter(Boolean);
}

/* ---------- shared components ---------- */

// btn(href, label, { variant, ico, external, cls, attrs, arrow, size })
// variant: primary | brass | wa | ghost | ghost-light. size: '' | 'sm' | 'lg'.
// arrow: true adds a trailing arrow that slides on hover (↗ for external links).
export function btn(href, label, { variant = 'primary', ico = '', external = false, cls = '', attrs = '', arrow = false, size = '' } = {}) {
  const ext = external ? ' target="_blank" rel="noopener"' : '';
  const i = ico ? (ico === 'whatsapp' ? brandIcon('whatsapp', { size: 18, cls: 'btn__ico' }) : icon(ico, { size: 18, cls: 'btn__ico' })) : '';
  const a = arrow ? icon(external ? 'arrow-up-right' : 'arrow-right', { size: 17, cls: 'btn__arrow' }) : '';
  const classes = ['btn', `btn--${variant}`, size && `btn--${size}`, arrow && 'btn--arrow', cls].filter(Boolean).join(' ');
  return `<a class="${classes}" href="${esc(href)}"${ext}${attrs ? ` ${attrs}` : ''}>${i}<span>${label}</span>${a}</a>`;
}

export function sectionHead({ index = '', eyebrow = '', title, lead = '', link = null, id = '' }) {
  return `<header class="sec-head">
  <div class="sec-head__meta">${index ? `<span class="idx">${index}</span>` : ''}${eyebrow ? `<span class="eyebrow">${eyebrow}</span>` : ''}</div>
  <div class="sec-head__main">
    <h2 class="h2"${id ? ` id="${id}"` : ''}>${title}</h2>
    ${lead ? `<p class="lead">${lead}</p>` : ''}
  </div>
  ${link ? `<a class="link-arrow" href="${link.href}">${link.label}${icon('arrow-right', { size: 18 })}</a>` : ''}
</header>`;
}

export function productCard(p) {
  const url = `/${p.category}/${p.slug}/`;
  return `<article class="pcard">
  <div class="pcard__fig">${productDrawing(p.slug)}${p.tag ? `<span class="pcard__tag">${p.tag}</span>` : ''}</div>
  <div class="pcard__body">
    <h3 class="pcard__title"><a class="pcard__link" href="${url}">${p.name}</a></h3>
    <p class="pcard__text">${p.short}</p>
    ${p.chips?.length ? `<ul class="pcard__chips">${p.chips.map((c) => `<li>${c}</li>`).join('')}</ul>` : ''}
    <div class="pcard__foot"><span class="pcard__more" aria-hidden="true">View details ${icon('arrow-right', { size: 16 })}</span><a class="pcard__quote" href="/quote/?item=${p.slug}">Get a price<span class="sr"> for ${p.name.toLowerCase()}</span></a></div>
  </div>
</article>`;
}

export function helpCard(site) {
  return `<div class="pcard pcard--help">
  <p class="eyebrow">Not sure which style?</p>
  <h3>Send us a photo of the house</h3>
  <p>A photo of the front and one of the window you want to replace is enough. We’ll suggest styles that suit the property and meet Building Regulations. No obligation.</p>
  ${btn(waLink(site, `Hi ${site.brand.short}, which window/door styles would suit my home? Photo attached.`), 'WhatsApp a photo', { variant: 'wa', ico: 'whatsapp', external: true })}
  <a class="link-arrow" href="/quote/">Or draw your windows to size${icon('arrow-right', { size: 16 })}</a>
</div>`;
}

export function repairRow(r) {
  return `<a class="rrow" href="/repairs/${r.slug}/">
  <span class="rrow__ico">${icon(r.icon, { size: 22 })}</span>
  <span class="rrow__body"><strong>${r.name}</strong><span>${r.short}</span></span>
  <span class="rrow__go">${icon('arrow-right', { size: 18 })}</span>
</a>`;
}

export function faqList(items, { open = -1 } = {}) {
  return `<div class="faq">${items
    .map(
      (f, i) => `<details class="faq__item"${i === open ? ' open' : ''}>
  <summary><span>${f.q ?? f[0]}</span>${icon('plus', { size: 18, cls: 'faq__ico' })}</summary>
  <div class="faq__a"><p>${f.a ?? f[1]}</p></div>
</details>`
    )
    .join('')}</div>`;
}

export function ctaBand(site, { title = 'Tell us what needs replacing or fixing.', text = 'Send rough sizes and a few photos for an estimate. Or book a free survey and we’ll measure everything ourselves.', waText = '' } = {}) {
  return `<section class="cta-band" aria-labelledby="cta-title">
  <div class="wrap cta-band__in">
    <div>
      <p class="eyebrow eyebrow--light">Free survey · written quote · no obligation</p>
      <h2 class="h2" id="cta-title">${title}</h2>
      <p class="cta-band__text">${text}</p>
    </div>
    <div class="cta-band__actions">
      ${btn('/quote/', 'Build your quote', { variant: 'brass', size: 'lg', arrow: true })}
      ${btn(waLink(site, waText || `Hi ${site.brand.short}, I’d like a quote for windows/doors.`), 'WhatsApp us', { variant: 'wa', ico: 'whatsapp', external: true, size: 'lg' })}
      <a class="cta-band__phone" href="tel:${site.contact.phoneInternational}">${icon('phone', { size: 18 })}<span><small>Or&nbsp;call</small>${telText(site)}</span></a>
    </div>
  </div>
</section>`;
}

export function crumbs(list) {
  return `<nav class="crumbs" aria-label="Breadcrumb"><ol>${list
    .map((c, i) =>
      i === list.length - 1
        ? `<li aria-current="page">${c.name}</li>`
        : `<li><a href="${c.href}">${c.name}</a>${icon('chevron-right', { size: 14 })}</li>`
    )
    .join('')}</ol></nav>`;
}

export function pageHero({ eyebrow = '', title, lead = '', trail = [], aside = '', actions = '', variant = '' }) {
  return `<section class="phero ${variant}">
  <div class="wrap">
    ${trail.length ? crumbs(trail) : ''}
    <div class="phero__grid${aside ? '' : ' phero__grid--solo'}">
      <div class="phero__main">
        ${eyebrow ? `<p class="eyebrow">${eyebrow}</p>` : ''}
        <h1 class="h1">${title}</h1>
        ${lead ? `<p class="phero__lead">${lead}</p>` : ''}
        ${actions ? `<div class="phero__actions">${actions}</div>` : ''}
      </div>
      ${aside ? `<div class="phero__aside">${aside}</div>` : ''}
    </div>
  </div>
</section>`;
}

/* ---------- header / footer ---------- */

// One-line descriptors for the menus, short enough to sit on one line next to a thumbnail.
// Keyed by slug. Anything not listed falls back to the first clause of the item’s own summary.
const MENU_NOTES = {
  'casement-windows': 'Side-hung and top-hung openers',
  'flush-casement-windows': 'Sashes sit flush, like timber joinery',
  'tilt-and-turn-windows': 'Tilts to ventilate, turns in to clean',
  'sash-windows': 'Box-sash looks, no cords or weights',
  'bay-and-bow-windows': 'Three to six facets, checked at survey',
  'sliding-windows': 'Slide sideways, nothing swings out',
  'shaped-and-feature-windows': 'Arches, apexes and circles',
  'upvc-doors': 'Front and back doors, multipoint locks',
  'composite-doors': 'Solid core behind a timber-look skin',
  'french-doors': 'A glazed pair with no centre post',
  'patio-doors': 'Large glass panels on tandem rollers',
  'bifold-doors': 'Panels fold and stack to open a wall',
  'stable-doors': 'Top and bottom open separately',
  'misted-double-glazing': 'New sealed unit, same frame',
  'locks-and-mechanisms': 'Gearboxes, multipoint locks, cylinders',
  'handles-and-hinges': 'Dropped sashes, loose handles',
  'door-alignment': 'Doors that scrape, catch or stick',
  'draughts-and-leaks': 'Gaskets, drainage and sealant',
  'patio-and-bifold-repairs': 'Rollers, tracks, locks and adjustment',
  'glass-and-panel-replacement': 'Cracked glass, privacy glass, panels',
  'safety-and-security-upgrades': 'Restrictors, locking handles, cylinders',
  installation: 'Made to measure, fitted and registered',
  'survey-and-quote': 'Measured properly, priced in writing',
  'servicing-and-maintenance': 'Adjusted, lubricated and checked',
  'landlords-and-commercial': 'Tenant liaison and photo reports',
};
const menuNote = (slug, fallback = '') => MENU_NOTES[slug] || String(fallback).split(/\.\s|\.$|—/)[0].trim();
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

function menuItem(it, n, path) {
  const media = it.thumb
    ? `<span class="sub__thumb">${it.thumb}</span>`
    : `<span class="sub__ico">${icon(it.icon || 'arrow-right', { size: 22 })}</span>`;
  const cur = path && path === it.href ? ' aria-current="page"' : '';
  return `<li${it.cls ? ` class="${it.cls}"` : ''} style="--i:${n}"><a href="${it.href}"${cur}>${media}<span class="sub__txt"><strong>${it.name}</strong><span>${it.note}</span></span>${icon('arrow-right', { size: 16, cls: 'sub__go' })}</a></li>`;
}

function menuFeature({ ico, eyebrow, title, text, actions }) {
  return `<div class="sub__feat">
        <span class="sub__feat-ico">${ico}</span>
        <p class="sub__feat-eyebrow">${eyebrow}</p>
        <p class="sub__feat-title">${title}</p>
        <p class="sub__feat-text">${text}</p>
        <div class="sub__feat-actions">${actions}</div>
      </div>`;
}

function navDropdown({ id, label, href, items, count, all, feature, current, path, extra = null, cols = 2 }) {
  const cur = current ? ' aria-current="true"' : '';
  // a two-column grid with an odd number of items gets a related guide in the empty cell
  if (extra && cols === 2 && items.length % 2) items = [...items, extra];
  return `<li class="nav__item has-sub">
  <a class="nav__link" href="${href}" aria-expanded="false" aria-controls="sub-${id}" data-sub="${id}"${cur}>${label}${icon('chevron-down', { size: 16, cls: 'nav__chev' })}</a>
  <div class="sub sub--${id}" id="sub-${id}">
    <div class="sub__in">
      <div class="sub__main">
        <div class="sub__head"><p class="sub__title">${label} <span>${count}</span></p><a class="sub__all" href="${href}">${all}${icon('arrow-right', { size: 16 })}</a></div>
        <ul class="sub__list">${items.map((it, n) => menuItem(it, n, path)).join('')}</ul>
      </div>
      ${feature}
    </div>
  </div>
</li>`;
}

export function header(site, data, current = '', path = '') {
  const { products, repairs, services, guides = [] } = data;
  const guide = (slug, name, note) =>
    guides.some((g) => g.slug === slug) ? { href: `/guides/${slug}/`, name, note, icon: 'file-text', cls: 'sub__guide' } : null;
  const prod = (cat) =>
    products
      .filter((p) => p.category === cat)
      .map((p) => ({ href: `/${cat}/${p.slug}/`, name: p.name, note: menuNote(p.slug, p.short), thumb: productThumb(p.slug), icon: cat === 'doors' ? 'door-open' : 'house' }));
  const win = prod('windows');
  const door = prod('doors');
  const rep = repairs.map((r) => ({ href: `/repairs/${r.slug}/`, name: r.name, note: menuNote(r.slug, r.short), icon: r.icon }));
  const svc = services.map((s) => ({ href: `/services/${s.slug}/`, name: s.name, note: menuNote(s.slug, s.short), icon: s.icon }));
  const cur = (p) => (current === p ? ' aria-current="page"' : '');
  const hours = hoursLine(site);
  const g = site.guarantee || {};
  const wa = (text) => waLink(site, text);
  const waBtn = (text, label) => btn(wa(text), label, { variant: 'wa', ico: 'whatsapp', external: true, size: 'sm' });
  const subLink = (href, label, ext = false) =>
    `<a class="sub__feat-link" href="${href}"${ext ? ' target="_blank" rel="noopener"' : ''}>${label}${icon(ext ? 'arrow-up-right' : 'arrow-right', { size: 15 })}</a>`;

  const featWin = menuFeature({
    ico: icon('ruler', { size: 20 }),
    eyebrow: 'Not sure which style?',
    title: 'Draw your windows to size',
    text: 'Type the width and height onto a drawing, room by room, and send us the list. Every size is checked at the free survey.',
    actions: btn('/quote/', 'Start a quote', { variant: 'brass', size: 'sm', arrow: true }) + subLink(wa(`Hi ${site.brand.short}, which window styles would suit my home? Photo attached.`), 'Or WhatsApp a photo', true),
  });
  const featDoor = menuFeature({
    ico: icon('door-open', { size: 20 }),
    eyebrow: 'Not sure which door?',
    title: 'Send a photo of the opening',
    text: 'We’ll tell you which styles fit, and set out the lock and glass options on your written quote.',
    actions: waBtn(`Hi ${site.brand.short}, I’m looking at a new door. Photo of the opening attached.`, 'WhatsApp a photo') + subLink('/quote/', 'Or draw it to size'),
  });
  const featRep = menuFeature({
    ico: icon('camera', { size: 20 }),
    eyebrow: 'Repairs',
    title: 'Send a photo, get a price',
    text: 'Photograph the fault and the whole window or door. We can often name the part and price the repair before we visit.',
    actions: waBtn(`Hi ${site.brand.short}, I need a repair. Photos attached:`, 'Send photos') + subLink('/book/?type=repair', 'Or book a repair visit'),
  });
  const featSvc = menuFeature({
    ico: icon('shield-check', { size: 20 }),
    eyebrow: 'Guarantees',
    title: g.installationYears ? `${g.installationYears}-year installation guarantee` : 'Guarantees &amp; aftercare',
    text: g.installationYears && g.repairMonths
      ? `New windows and doors are guaranteed for ${g.installationYears} years from completion. Repair work is guaranteed for ${g.repairMonths} months.`
      : 'What is covered, for how long, and how to make a claim.',
    actions: btn('/guarantee/', 'Guarantees &amp; aftercare', { variant: 'ghost-light', size: 'sm', arrow: true }),
  });

  return `<a class="skip" href="#main">Skip to content</a>
<aside class="topbar" aria-label="Opening hours and contact">
  <div class="wrap topbar__in">
    <p class="topbar__msg">${icon('ruler', { size: 15 })}<span>Free survey and an itemised written quote</span></p>
    <p class="topbar__hours">${icon('clock', { size: 15 })}<span>${hours}</span></p>
    <a class="topbar__wa" href="${wa(`Hi ${site.brand.short}, `)}" target="_blank" rel="noopener">${brandIcon('whatsapp', { size: 15 })}<span>WhatsApp ${telText(site)}</span></a>
  </div>
</aside>
<header class="site-header" id="top">
  <div class="wrap site-header__in">
    <a class="logo" href="/" aria-label="${esc(site.brand.name)} — home">${logoMark(30)}<span class="logo__word"><span class="logo__name">${esc(site.brand.short)}</span><span class="logo__sub">Windows &amp; Doors</span></span></a>
    <nav class="nav" id="nav" aria-label="Main">
      <ul class="nav__list">
        ${navDropdown({ id: 'win', label: 'Windows', href: '/windows/', items: win, count: plural(win.length, 'style', 'styles'), all: 'View all windows', feature: featWin, current: current === 'windows', path, extra: guide('building-regulations-for-replacement-windows', 'Building Regulations, explained', 'Guide · energy, glass, vents, escape') })}
        ${navDropdown({ id: 'door', label: 'Doors', href: '/doors/', items: door, count: plural(door.length, 'style', 'styles'), all: 'View all doors', feature: featDoor, current: current === 'doors', path, extra: guide('upvc-vs-composite-doors', 'uPVC or composite?', 'Guide · how the two door types compare') })}
        ${navDropdown({ id: 'rep', label: 'Repairs', href: '/repairs/', items: rep, count: plural(rep.length, 'repair', 'repairs'), all: 'View all repairs', feature: featRep, current: current === 'repairs', path, extra: guide('how-to-maintain-upvc-windows-and-doors', 'Look after your windows', 'Guide · a twice-yearly maintenance routine') })}
        ${navDropdown({ id: 'svc', label: 'Services', href: '/services/', items: svc, count: plural(svc.length, 'service', 'services'), all: 'View all services', feature: featSvc, current: current === 'services', path, cols: 1 })}
        <li class="nav__item"><a class="nav__link" href="/guides/"${cur('guides')}>Guides</a></li>
        <li class="nav__item"><a class="nav__link" href="/about/"${cur('about')}>About</a></li>
        <li class="nav__item"><a class="nav__link" href="/contact/"${cur('contact')}>Contact</a></li>
      </ul>
      <div class="nav__mobile-cta">
        <p class="nav__cta-title">Free survey and a written quote</p>
        <p class="nav__cta-hours">${icon('clock', { size: 15 })}<span>${hours}</span></p>
        ${btn('/quote/', 'Get a free quote', { variant: 'brass', ico: 'square-pen', arrow: true })}
        ${btn('/book/', 'Book a survey or repair', { variant: 'ghost', ico: 'calendar-days' })}
        <div class="nav__contact">
          <a class="nav__phone" href="tel:${site.contact.phoneInternational}">${icon('phone', { size: 18 })}<span>${telText(site)}</span></a>
          <a class="nav__wa" href="${wa(`Hi ${site.brand.short}, `)}" target="_blank" rel="noopener">${brandIcon('whatsapp', { size: 18 })}<span>WhatsApp</span></a>
        </div>
      </div>
    </nav>
    <div class="site-header__actions">
      <a class="hdr-phone" href="tel:${site.contact.phoneInternational}">${icon('phone', { size: 18 })}<span><small>Call&nbsp;us</small>${telText(site)}</span></a>
      ${btn('/quote/', 'Get a quote', { variant: 'primary', cls: 'hdr-cta' })}
      <button class="burger" type="button" aria-controls="nav" aria-expanded="false" aria-label="Open menu"><span></span><span></span><span></span></button>
    </div>
  </div>
</header>`;
}

export function footer(site, data) {
  const { products, repairs, services } = data;
  const year = new Date().getFullYear();
  const co = site.company;
  const addr = addressLines(site);
  const social = [
    ['facebook', 'Facebook'],
    ['instagram', 'Instagram'],
    ['tiktok', 'TikTok'],
  ].filter(([k]) => site.social[k]);
  const legalBits = [
    co.legalName && esc(co.legalName),
    co.companyNumber && `Registered in England &amp; Wales No. ${esc(co.companyNumber)}`,
    co.registeredOffice && `Registered office: ${esc(co.registeredOffice)}`,
    co.vatNumber && `VAT No. ${esc(co.vatNumber)}`,
  ].filter(Boolean);
  return `<footer class="site-footer">
  <div class="wrap">
    <div class="site-footer__top">
      <div class="f-brand">
        <a class="logo logo--light" href="/">${logoMark(30)}<span class="logo__word"><span class="logo__name">${esc(site.brand.short)}</span><span class="logo__sub">Windows &amp; Doors</span></span></a>
        <p>${esc(site.brand.tagline)} We also repair uPVC windows and doors, whoever fitted them${site.areaServed ? `, across ${esc(site.areaServed)}` : ''}.</p>
        <ul class="f-contact">
          <li><a href="tel:${site.contact.phoneInternational}">${icon('phone', { size: 17 })}${telText(site)}</a></li>
          <li><a href="${waLink(site, `Hi ${site.brand.short}, `)}" target="_blank" rel="noopener">${brandIcon('whatsapp', { size: 17 })}WhatsApp</a></li>
          <li><a href="mailto:${site.contact.email}">${icon('mail', { size: 17 })}${site.contact.email}</a></li>
          ${addr.length ? `<li><span>${icon('map-pin', { size: 17 })}${addr.map(esc).join(', ')}</span></li>` : ''}
        </ul>
        ${social.length ? `<div class="f-social">${social.map(([k, n]) => `<a href="${esc(site.social[k])}" target="_blank" rel="noopener" aria-label="${n}">${brandIcon(k, { size: 18 })}</a>`).join('')}</div>` : ''}
      </div>
      <nav class="f-col" aria-label="Windows"><h2>Windows</h2><ul>${products.filter((p) => p.category === 'windows').map((p) => `<li><a href="/windows/${p.slug}/">${p.name}</a></li>`).join('')}</ul></nav>
      <nav class="f-col" aria-label="Doors"><h2>Doors</h2><ul>${products.filter((p) => p.category === 'doors').map((p) => `<li><a href="/doors/${p.slug}/">${p.name}</a></li>`).join('')}</ul></nav>
      <nav class="f-col" aria-label="Repairs"><h2>Repairs</h2><ul>${repairs.map((r) => `<li><a href="/repairs/${r.slug}/">${r.name}</a></li>`).join('')}</ul></nav>
      <nav class="f-col" aria-label="Company"><h2>Company</h2><ul>
        ${services.map((s) => `<li><a href="/services/${s.slug}/">${s.name}</a></li>`).join('')}
        <li><a href="/guarantee/">Guarantees</a></li>
        <li><a href="/about/">About us</a></li>
        <li><a href="/guides/">Guides</a></li>
        <li><a href="/faq/">FAQs</a></li>
        <li><a href="/contact/">Contact</a></li>
      </ul></nav>
    </div>
    <div class="site-footer__hours">
      ${site.hours.map((h) => `<p><span>${h.days}</span><strong>${hoursText(h)}</strong></p>`).join('')}
    </div>
    <div class="site-footer__bottom">
      <p>© ${year} ${esc(site.brand.name)}. All rights reserved.${legalBits.length ? ` ${legalBits.join(' · ')}.` : ''}</p>
      <ul>
        <li><a href="/privacy/">Privacy</a></li>
        <li><a href="/cookies/">Cookies</a></li>
        <li><a href="/terms/">Terms</a></li>
        <li><a href="/accessibility/">Accessibility</a></li>
        <li><a href="/sitemap.xml">Sitemap</a></li>
      </ul>
    </div>
  </div>
</footer>
<nav class="actionbar" aria-label="Quick contact">
  <a href="tel:${site.contact.phoneInternational}">${icon('phone', { size: 20 })}<span>Call</span></a>
  <a href="${waLink(site, `Hi ${site.brand.short}, `)}" target="_blank" rel="noopener" class="actionbar__wa">${brandIcon('whatsapp', { size: 20 })}<span>WhatsApp</span></a>
  <a href="/quote/" class="actionbar__quote">${icon('square-pen', { size: 20 })}<span>Quote</span></a>
  <button type="button" data-chat-open>${icon('message-circle', { size: 20 })}<span>Ask us</span></button>
</nav>`;
}

/* ---------- structured data ---------- */

export function businessSchema(site) {
  const a = site.contact.address;
  const days = { 0: 'Sunday', 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday', 6: 'Saturday' };
  const s = {
    '@context': 'https://schema.org',
    '@type': 'HomeAndConstructionBusiness',
    '@id': `${site.url}/#business`,
    name: site.brand.name,
    description: site.brand.description,
    url: `${site.url}/`,
    telephone: site.contact.phoneInternational,
    email: site.contact.email,
    image: `${site.url}/assets/img/og-image.png`,
    logo: `${site.url}/assets/img/icon-512.png`,
    priceRange: '££',
    openingHoursSpecification: site.hours
      .filter((h) => h.open)
      .map((h) => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: h.dow.map((d) => days[d]), opens: h.open, closes: h.close })),
    contactPoint: { '@type': 'ContactPoint', telephone: site.contact.phoneInternational, contactType: 'customer service', areaServed: 'GB', availableLanguage: ['English'] },
  };
  if (a.locality || a.postcode) {
    s.address = { '@type': 'PostalAddress', streetAddress: a.street || undefined, addressLocality: a.locality || undefined, addressRegion: a.region || undefined, postalCode: a.postcode || undefined, addressCountry: 'GB' };
  }
  if (site.serviceAreas.length) s.areaServed = site.serviceAreas.map((n) => ({ '@type': 'City', name: n }));
  else if (site.areaServed) s.areaServed = site.areaServed;
  const same = Object.values(site.social).filter(Boolean);
  if (same.length) s.sameAs = same;
  return s;
}

export function breadcrumbSchema(site, list) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: list.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name.replace(/<[^>]+>/g, ''), item: `${site.url}${c.href}` })),
  };
}

/* ---------- document shell ---------- */

export function documentShell({ site, data, page, body, assetV }) {
  const url = `${site.url}${page.path}`;
  const title = page.path === '/' ? page.title : `${page.title} | ${site.brand.name}`;
  const schemas = [...(page.schema || [])].map((s) => `<script type="application/ld+json">${JSON.stringify(s).replace(/</g, '\\u003c')}</script>`).join('\n');
  return `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(page.description)}">
<link rel="canonical" href="${url}">
${page.noindex ? '<meta name="robots" content="noindex">' : ''}
<meta property="og:type" content="${page.ogType || 'website'}">
<meta property="og:site_name" content="${esc(site.brand.name)}">
<meta property="og:locale" content="${site.locale}">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${esc(page.title)}">
<meta property="og:description" content="${esc(page.description)}">
<meta property="og:image" content="${site.url}/assets/img/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#23292D">
<meta name="format-detection" content="telephone=no">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preload" href="/assets/fonts/archivo-var.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/ibm-plex-sans-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/css/main.css?v=${assetV}">
<link rel="stylesheet" href="/assets/css/assistant.css?v=${assetV}">
<script>document.documentElement.classList.add('js');try{if(!sessionStorage.getItem('vx-intro')){document.documentElement.classList.add('intro');sessionStorage.setItem('vx-intro','1')}}catch(e){}</script>
${schemas}
</head>
<body class="${page.bodyClass || ''}">
<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs><linearGradient id="vxg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e4eeef"/><stop offset=".55" stop-color="#ccdcdf"/><stop offset="1" stop-color="#e9f1f2"/></linearGradient></defs></svg>
${header(site, data, page.nav, page.path)}
<main id="main">
${body}
</main>
${footer(site, data)}
<script>window.VX=${JSON.stringify({ wa: site.contact.whatsapp, phone: site.contact.phoneInternational, phoneDisplay: site.contact.phoneDisplay, email: site.contact.email, brand: site.brand.short, name: site.brand.name, url: site.url, hours: site.hours, endpoint: site.forms.endpoint || '', v: assetV })};</script>
<script src="/assets/js/main.js?v=${assetV}" defer></script>
${(page.scripts || []).map((s) => `<script src="/assets/js/${s}.js?v=${assetV}" defer></script>`).join('\n')}
<script src="/assets/js/assistant.js?v=${assetV}" defer></script>
</body>
</html>
`;
}
