import { icon, brandIcon, productDrawing, facadeDrawing, sectionDrawing } from './svg.mjs';
import { esc, btn, telText, waLink, sectionHead, productCard, helpCard, repairRow, faqList, ctaBand, pageHero, crumbs, hoursText, addressLines, businessSchema, breadcrumbSchema } from './layout.mjs';

const pad = (n) => String(n).padStart(2, '0');
const fmtDate = (iso) => new Date(iso + 'T12:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

/* =========================================================
   HOME
   ========================================================= */
export function home(site, d) {
  const win = d.products.filter((p) => p.category === 'windows');
  const door = d.products.filter((p) => p.category === 'doors');
  const install = d.services.find((s) => s.slug === 'installation');
  const g = d.guides.slice(0, 3);
  const faqs = [d.faqs[0].items[0], d.faqs[2].items[1], d.faqs[3].items[0], d.faqs[4].items[1], d.faqs[1].items[0]];

  const stats = site.stats.length
    ? `<dl class="hero__stats">${site.stats.map((s) => `<div><dt>${esc(s.label)}</dt><dd>${esc(s.value)}</dd></div>`).join('')}</dl>`
    : '';

  const testimonials = site.testimonials.length
    ? `<section class="sec sec--paper2" aria-labelledby="t-title"><div class="wrap">
  ${sectionHead({ eyebrow: 'Customer reviews', title: 'What our customers say', id: 't-title', link: site.social.googleReviews ? { href: site.social.googleReviews, label: 'Read all reviews' } : null })}
  <div class="tgrid">${site.testimonials.map((t) => `<figure class="tcard"><div class="tcard__stars" aria-label="${t.rating || 5} out of 5 stars">${'★'.repeat(t.rating || 5)}</div><blockquote><p>${esc(t.text)}</p></blockquote><figcaption><strong>${esc(t.name)}</strong>${t.location ? ` · ${esc(t.location)}` : ''}${t.job ? `<span>${esc(t.job)}</span>` : ''}</figcaption></figure>`).join('')}</div>
</div></section>`
    : '';

  const accreditations = site.accreditations.length
    ? `<div class="accred"><span class="eyebrow">Registered &amp; accredited</span><ul>${site.accreditations.map((a) => `<li>${a.url ? `<a href="${esc(a.url)}" target="_blank" rel="noopener">${esc(a.name)}</a>` : esc(a.name)}</li>`).join('')}</ul></div>`
    : '';

  const body = `
<section class="hero">
  <div class="wrap hero__grid">
    <div class="hero__copy">
      <p class="eyebrow">uPVC windows · doors · repairs${site.areaServed ? ` · ${esc(site.areaServed)}` : ''}</p>
      <h1 class="display">Windows and doors, made to measure and <em>fitted properly.</em></h1>
      <p class="hero__lead">${esc(site.brand.short)} supplies, installs and repairs uPVC and composite windows and doors. A free survey, an itemised written quote, and clear communication from the first visit to the final handover.</p>
      <div class="hero__actions">
        ${btn('/quote/', 'Get a free quote', { variant: 'primary', ico: 'square-pen' })}
        ${btn(waLink(site, `Hi ${site.brand.short}, I’d like a quote.`), 'WhatsApp us', { variant: 'wa', ico: 'whatsapp', external: true })}
      </div>
      <ul class="hero__ticks">
        <li>${icon('check', { size: 16 })}Free survey &amp; written quote</li>
        <li>${icon('check', { size: 16 })}Fitted to current Building Regulations</li>
        <li>${icon('check', { size: 16 })}Repairs to most uPVC makes</li>
      </ul>
      ${stats}
    </div>
    <div class="hero__art">
      <div class="sheet">
        <div class="sheet__bar"><span>Elevation A</span><span>Replacement schedule</span></div>
        ${facadeDrawing()}
      </div>
    </div>
  </div>
</section>

<section class="paths" aria-label="How can we help?">
  <div class="wrap paths__grid">
    <a class="path" href="/windows/"><span class="idx">01</span><h2>Replacing windows</h2><p>Casement, flush, tilt &amp; turn, sash and bay windows — made to measure.</p><span class="path__go">${icon('arrow-right', { size: 20 })}</span></a>
    <a class="path" href="/doors/"><span class="idx">02</span><h2>A new door</h2><p>Front, back, French, patio, bi-fold and stable doors in uPVC or composite.</p><span class="path__go">${icon('arrow-right', { size: 20 })}</span></a>
    <a class="path path--dark" href="/repairs/"><span class="idx">03</span><h2>Something needs fixing</h2><p>Misted glass, locks, handles, hinges, draughts, patio rollers and more.</p><span class="path__go">${icon('arrow-right', { size: 20 })}</span></a>
  </div>
</section>

<section class="sec" aria-labelledby="win-title">
  <div class="wrap">
    ${sectionHead({ index: '01', eyebrow: 'Windows', title: 'A window for every opening', lead: d.categories.windows.lead, id: 'win-title', link: { href: '/windows/', label: 'All windows' } })}
    <div class="pgrid pgrid--4">${win.map(productCard).join('')}${helpCard(site)}</div>
  </div>
</section>

<section class="sec sec--paper2" aria-labelledby="door-title">
  <div class="wrap">
    ${sectionHead({ index: '02', eyebrow: 'Doors', title: 'Entrance and garden doors', lead: d.categories.doors.lead, id: 'door-title', link: { href: '/doors/', label: 'All doors' } })}
    <div class="pgrid pgrid--3">${door.map(productCard).join('')}</div>
  </div>
</section>

<section class="sec sec--dark" aria-labelledby="rep-title">
  <div class="wrap repband">
    <div class="repband__intro">
      <div class="sec-head__meta"><span class="idx">03</span><span class="eyebrow eyebrow--light">Repairs</span></div>
      <h2 class="h2" id="rep-title">Most problems need a part, not a new window.</h2>
      <p class="lead">We repair uPVC windows and doors whoever fitted them. Send a photo first and we can often identify the part and quote before we visit.</p>
      <ol class="steps-mini">
        <li><span>1</span>Send photos on WhatsApp</li>
        <li><span>2</span>Get a price and a time</li>
        <li><span>3</span>We fix it — usually in one visit</li>
      </ol>
      <div class="repband__actions">
        ${btn(waLink(site, `Hi ${site.brand.short}, I need a repair. Here are some photos:`), 'Send photos on WhatsApp', { variant: 'wa', ico: 'whatsapp', external: true })}
        ${btn('/book/?type=repair', 'Book a repair visit', { variant: 'ghost-light', ico: 'calendar-days' })}
      </div>
    </div>
    <div class="repband__list">${d.repairs.map(repairRow).join('')}</div>
  </div>
</section>

<section class="sec" aria-labelledby="perf-title">
  <div class="wrap perf">
    <div class="perf__copy">
      ${sectionHead({ index: '04', eyebrow: 'Performance', title: 'What’s inside a good window', id: 'perf-title' })}
      <p class="lead">The frame you see is only part of the story. Here is what we specify, and why it matters for warmth, security and comfort.</p>
      <dl class="specs">
        <div><dt>${icon('thermometer', { size: 18 })}Energy</dt><dd>Specified to Part L: U-value 1.4 W/m²K or better, or WER band B+. A-rated options available.</dd></div>
        <div><dt>${icon('layers', { size: 18 })}Glass</dt><dd>Low-E coated glass, argon-filled cavity and warm-edge spacers. Triple glazing on request.</dd></div>
        <div><dt>${icon('shield-check', { size: 18 })}Security</dt><dd>Multipoint locking, key-locking handles and anti-snap cylinders. PAS 24 options.</dd></div>
        <div><dt>${icon('wind', { size: 18 })}Ventilation</dt><dd>Trickle vents where Part F requires them, so new windows don’t trap condensation.</dd></div>
        <div><dt>${icon('volume-x', { size: 18 })}Noise</dt><dd>Acoustic laminated glass or triple glazing for busy roads.</dd></div>
      </dl>
    </div>
    <div class="perf__art"><div class="sheet sheet--plain">${sectionDrawing()}</div></div>
  </div>
</section>

<section class="sec sec--paper2" aria-labelledby="col-title">
  <div class="wrap">
    ${sectionHead({ index: '05', eyebrow: 'Colours & finishes', title: 'Beyond white', lead: 'Smooth or woodgrain, single or dual colour. These are some of the most popular finishes — ask to see physical samples at your survey.', id: 'col-title' })}
    <ul class="swatches">${d.colours.map((c) => `<li><span class="swatch" style="--sw:${c.hex}"></span><span>${c.name}</span></li>`).join('')}</ul>
    <p class="fineprint">Colours on screen are indicative only.</p>
  </div>
</section>

<section class="sec" aria-labelledby="proc-title">
  <div class="wrap">
    ${sectionHead({ index: '06', eyebrow: 'How it works', title: 'From first message to final handover', id: 'proc-title', link: { href: '/services/installation/', label: 'Installation in detail' } })}
    <ol class="process">${install.steps.map(([t, x], i) => `<li><span class="process__n">${pad(i + 1)}</span><h3>${t}</h3><p>${x}</p></li>`).join('')}</ol>
    ${accreditations}
  </div>
</section>

${testimonials}

<section class="sec sec--paper2" aria-labelledby="guide-title">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Guides', title: 'Straight answers before you buy', id: 'guide-title', link: { href: '/guides/', label: 'All guides' } })}
    <div class="ggrid">${g.map(guideCard).join('')}</div>
  </div>
</section>

<section class="sec" aria-labelledby="faq-title">
  <div class="wrap faqwrap">
    <div>
      ${sectionHead({ eyebrow: 'FAQs', title: 'Common questions', id: 'faq-title' })}
      <p class="lead">Can’t see your question? Ask our assistant in the corner of the screen, or message us on WhatsApp.</p>
      <p>${btn('/faq/', 'All FAQs', { variant: 'ghost', ico: 'circle-help' })}</p>
    </div>
    ${faqList(faqs, { open: 0 })}
  </div>
</section>

${ctaBand(site)}`;

  return {
    path: '/',
    title: `${site.brand.name} | uPVC Windows, Doors & Repairs`,
    description: site.brand.description,
    nav: 'home',
    bodyClass: 'is-home',
    schema: [businessSchema(site), { '@context': 'https://schema.org', '@type': 'WebSite', name: site.brand.name, url: `${site.url}/` }],
    body,
  };
}

function guideCard(gd) {
  return `<a class="gcard" href="/guides/${gd.slug}/">
  <span class="gcard__tag">${gd.tag}</span>
  <h3>${gd.title}</h3>
  <p>${gd.summary}</p>
  <span class="gcard__meta">${gd.read} read ${icon('arrow-right', { size: 16 })}</span>
</a>`;
}

/* =========================================================
   PRODUCT CATEGORY + DETAIL
   ========================================================= */
export function category(site, d, cat) {
  const c = d.categories[cat];
  const list = d.products.filter((p) => p.category === cat);
  const trail = [{ name: 'Home', href: '/' }, { name: c.name, href: `/${cat}/` }];
  const other = cat === 'windows' ? 'doors' : 'windows';
  const body = `
${pageHero({ eyebrow: `${list.length} styles · made to measure`, title: c.title, lead: c.lead, trail, actions: btn('/quote/', 'Get a free quote', { ico: 'square-pen' }) + btn(waLink(site, `Hi ${site.brand.short}, I’m interested in new ${cat}.`), 'WhatsApp us', { variant: 'wa', ico: 'whatsapp', external: true }) })}
<section class="sec sec--tight" aria-labelledby="range-title">
  <div class="wrap">
    <h2 class="sr" id="range-title">All ${c.name.toLowerCase()}</h2>
    <div class="pgrid ${cat === 'windows' ? 'pgrid--4' : 'pgrid--3'}">${list.map(productCard).join('')}${cat === 'windows' ? helpCard(site) : ''}</div>
  </div>
</section>
<section class="sec sec--paper2">
  <div class="wrap two-col">
    <div>
      ${sectionHead({ eyebrow: 'Every product we fit', title: cat === 'windows' ? 'Specified to current regulations' : 'Secure as standard' })}
    </div>
    <ul class="checklist">
      ${(cat === 'windows'
        ? ['Made to measure from a final technical survey', 'U-value of 1.4 W/m²K or better, or WER band B+ (Part L)', 'Trickle vents where Part F requires them', 'Safety glass in critical locations (Part K)', 'Escape openings on first-floor habitable rooms (Part B)', 'Multipoint locking and key-locking handles', 'Compliance certificate on completion']
        : ['Multipoint locking along the full height of the door', 'Anti-snap cylinders rated TS 007 3-star or SS 312 Diamond', 'Toughened or laminated safety glass', 'Meets Part L for replacement doors', 'Low thresholds available', 'PAS 24 / Secured by Design options', 'Compliance certificate on completion']
      )
        .map((x) => `<li>${icon('check', { size: 18 })}${x}</li>`)
        .join('')}
    </ul>
  </div>
</section>
<section class="sec">
  <div class="wrap crosslink">
    <p class="eyebrow">Also from ${esc(site.brand.short)}</p>
    <a href="/${other}/" class="crosslink__a">${d.categories[other].title} ${icon('arrow-right', { size: 22 })}</a>
    <a href="/repairs/" class="crosslink__a">Repairs to existing windows &amp; doors ${icon('arrow-right', { size: 22 })}</a>
  </div>
</section>
${ctaBand(site)}`;
  return {
    path: `/${cat}/`,
    title: c.title.charAt(0).toUpperCase() + c.title.slice(1),
    description: c.metaDescription,
    nav: cat,
    schema: [breadcrumbSchema(site, trail)],
    body,
  };
}

export function product(site, d, p) {
  const c = d.categories[p.category];
  const trail = [{ name: 'Home', href: '/' }, { name: c.name, href: `/${p.category}/` }, { name: p.name, href: `/${p.category}/${p.slug}/` }];
  const related = p.related.map((s) => d.products.find((x) => x.slug === s)).filter(Boolean);
  const wa = `Hi ${site.brand.short}, I’d like a quote for ${p.name.toLowerCase()}.`;
  const body = `
<section class="phero phero--product">
  <div class="wrap">
    ${crumbs(trail)}
    <div class="prod">
      <div class="prod__main">
        <p class="eyebrow">${c.name}</p>
        <h1 class="h1">${p.name}</h1>
        <p class="phero__lead">${p.lead}</p>
        <div class="phero__actions">
          ${btn(`/quote/?item=${p.slug}`, 'Quote for this product', { ico: 'square-pen' })}
          ${btn(waLink(site, wa), 'Ask on WhatsApp', { variant: 'wa', ico: 'whatsapp', external: true })}
        </div>
      </div>
      <figure class="prod__fig sheet">
        <div class="sheet__bar"><span>${p.name}</span><span>Elevation · NTS</span></div>
        ${productDrawing(p.slug)}
        <figcaption>Dashed lines meet at the hinge side, as on an architect’s window schedule.</figcaption>
      </figure>
    </div>
  </div>
</section>

<section class="sec sec--tight">
  <div class="wrap prose-grid">
    <div class="prose">
      ${p.body.map((x) => `<p>${x}</p>`).join('')}
    </div>
    <aside class="side-card" aria-label="Product summary">
      <h2 class="h4">Good for</h2>
      <ul class="checklist checklist--sm">${p.goodFor.map((x) => `<li>${icon('check', { size: 16 })}${x}</li>`).join('')}</ul>
      <h2 class="h4">Popular options</h2>
      <ul class="tags">${p.options.map((x) => `<li>${x}</li>`).join('')}</ul>
    </aside>
  </div>
</section>

<section class="sec sec--paper2">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Features', title: `Why choose ${p.name.toLowerCase()}` })}
    <div class="fgrid">${p.features.map(([t, x], i) => `<div class="feat"><span class="idx">${pad(i + 1)}</span><h3>${t}</h3><p>${x}</p></div>`).join('')}</div>
  </div>
</section>

<section class="sec">
  <div class="wrap two-col">
    <div>${sectionHead({ eyebrow: 'Specification', title: 'At a glance' })}<p class="fineprint">Exact specification depends on the system and options chosen and is confirmed on your quotation.</p></div>
    <table class="spec-table"><tbody>${p.specs.map(([k, v]) => `<tr><th scope="row">${k}</th><td>${v}</td></tr>`).join('')}</tbody></table>
  </div>
</section>

<section class="sec sec--paper2">
  <div class="wrap faqwrap">
    <div>${sectionHead({ eyebrow: 'Questions', title: `${p.name}: FAQs` })}</div>
    ${faqList(p.faqs, { open: 0 })}
  </div>
</section>

<section class="sec">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'You may also like', title: 'Related products' })}
    <div class="pgrid pgrid--3 pgrid--rel">${related.map(productCard).join('')}</div>
  </div>
</section>
${ctaBand(site, { title: `Get a price for ${p.name.toLowerCase()}.`, waText: wa })}`;
  return {
    path: `/${p.category}/${p.slug}/`,
    title: `${p.name} — supplied & fitted`,
    description: p.metaDescription,
    nav: p.category,
    schema: [
      breadcrumbSchema(site, trail),
      { '@context': 'https://schema.org', '@type': 'Service', name: p.name, serviceType: `${p.name} supply and installation`, description: p.metaDescription, provider: { '@id': `${site.url}/#business` }, url: `${site.url}/${p.category}/${p.slug}/` },
    ],
    body,
  };
}

/* =========================================================
   REPAIRS
   ========================================================= */
export function repairsHub(site, d) {
  const trail = [{ name: 'Home', href: '/' }, { name: 'Repairs', href: '/repairs/' }];
  const body = `
${pageHero({
  eyebrow: 'uPVC window & door repairs',
  title: 'Repairs that save the window',
  lead: 'Misted glass, broken locks, dropped doors, worn hinges, draughts and sticky patio doors. We repair uPVC windows and doors whoever installed them — and we’ll tell you honestly when repair isn’t worth it.',
  trail,
  actions: btn(waLink(site, `Hi ${site.brand.short}, I need a repair. Photos attached:`), 'Send photos on WhatsApp', { variant: 'wa', ico: 'whatsapp', external: true }) + btn('/book/?type=repair', 'Book a repair visit', { variant: 'ghost', ico: 'calendar-days' }),
})}
<section class="sec sec--tight">
  <div class="wrap">
    <div class="rgrid">${d.repairs
      .map(
        (r, i) => `<a class="rcard" href="/repairs/${r.slug}/"><span class="rcard__top"><span class="rcard__ico">${icon(r.icon, { size: 24 })}</span><span class="idx">${pad(i + 1)}</span></span><h2>${r.name}</h2><p>${r.short}</p><span class="pcard__more">Symptoms &amp; fixes ${icon('arrow-right', { size: 16 })}</span></a>`
      )
      .join('')}</div>
  </div>
</section>
<section class="sec sec--dark">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'How a repair works', title: 'Photo first. Then the right part, first time.' })}
    <ol class="process process--dark">
      <li><span class="process__n">01</span><h3>Send photos</h3><p>A photo of the problem, plus the lock edge or hinge if relevant. WhatsApp is quickest.</p></li>
      <li><span class="process__n">02</span><h3>Diagnosis &amp; price</h3><p>We identify the likely cause and part and confirm any call-out or repair charge before we book.</p></li>
      <li><span class="process__n">03</span><h3>The visit</h3><p>Most repairs are completed in one visit. Made-to-measure glass needs a measure visit first.</p></li>
      <li><span class="process__n">04</span><h3>Guaranteed</h3><p>Repairs are covered by our ${site.guarantee.repairMonths}-month parts and labour guarantee.</p></li>
    </ol>
  </div>
</section>
<section class="sec">
  <div class="wrap two-col">
    <div>${sectionHead({ eyebrow: 'Repair or replace?', title: 'An honest answer either way' })}</div>
    <div class="prose">
      <p>A single failed part rarely justifies replacing a window. If the frame is sound, replacing a sealed unit, gearbox, hinge or gasket restores it for a fraction of the cost of a new one.</p>
      <p>Replacement makes more sense when frames are cracked or badly discoloured, several parts are failing at once, parts are no longer available for an old system, or you want a real improvement in energy performance. We will tell you which applies to your windows — and why.</p>
    </div>
  </div>
</section>
${ctaBand(site, { title: 'Something not working?', text: 'Send us a photo — we’ll identify the part and give you a price.', waText: `Hi ${site.brand.short}, I need a repair. Photos attached:` })}`;
  return {
    path: '/repairs/',
    title: 'uPVC window & door repairs',
    description: 'uPVC window and door repairs: misted double glazing, locks, handles, hinges, dropped doors, draughts, patio rollers and glass. Send photos on WhatsApp for a fast price.',
    nav: 'repairs',
    schema: [breadcrumbSchema(site, trail)],
    body,
  };
}

export function repair(site, d, r) {
  const trail = [{ name: 'Home', href: '/' }, { name: 'Repairs', href: '/repairs/' }, { name: r.name, href: `/repairs/${r.slug}/` }];
  const wa = `Hi ${site.brand.short}, I need a repair: ${r.name}. Photos attached. My postcode is `;
  const others = d.repairs.filter((x) => x.slug !== r.slug).slice(0, 4);
  const list = (arr) => `<ul class="checklist">${arr.map((x) => `<li>${icon('check', { size: 18 })}${x}</li>`).join('')}</ul>`;
  const body = `
${pageHero({
  eyebrow: 'Repairs',
  title: r.name,
  lead: r.short,
  trail,
  actions: btn(waLink(site, wa), 'Send photos on WhatsApp', { variant: 'wa', ico: 'whatsapp', external: true }) + btn(`/book/?type=repair&repair=${r.slug}`, 'Book a visit', { variant: 'ghost', ico: 'calendar-days' }),
  aside: `<div class="diag-card"><span class="diag-card__ico">${icon(r.icon, { size: 40 })}</span><p class="eyebrow">Typical visit</p><p>${r.visit}</p></div>`,
})}
<section class="sec sec--tight">
  <div class="wrap"><div class="diag">
    <div class="diag__col"><h2 class="h3"><span class="idx">A</span>Symptoms</h2>${list(r.symptoms)}</div>
    <div class="diag__col"><h2 class="h3"><span class="idx">B</span>Likely causes</h2>${list(r.causes)}</div>
    <div class="diag__col diag__col--fix"><h2 class="h3"><span class="idx">C</span>What we do</h2>${list(r.fix)}</div>
  </div></div>
</section>
<section class="sec sec--paper2">
  <div class="wrap two-col">
    <div>${sectionHead({ eyebrow: 'Before we arrive', title: 'Useful to know' })}</div>
    <div class="tips">${r.tips.map((t) => `<p class="tip">${icon('info', { size: 18 })}<span>${t}</span></p>`).join('')}</div>
  </div>
</section>
<section class="sec">
  <div class="wrap faqwrap">
    <div>${sectionHead({ eyebrow: 'Questions', title: 'FAQs' })}</div>
    ${faqList(r.faqs, { open: 0 })}
  </div>
</section>
<section class="sec sec--paper2">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Other repairs', title: 'We also fix', link: { href: '/repairs/', label: 'All repairs' } })}
    <div class="rlist">${others.map(repairRow).join('')}</div>
  </div>
</section>
${ctaBand(site, { title: 'Send a photo, get a price.', text: 'The quickest way to a repair: a photo of the problem and your postcode on WhatsApp.', waText: wa })}`;
  return {
    path: `/repairs/${r.slug}/`,
    title: `${r.name} — uPVC repairs`,
    description: r.metaDescription,
    nav: 'repairs',
    schema: [breadcrumbSchema(site, trail), { '@context': 'https://schema.org', '@type': 'Service', name: r.name, serviceType: 'uPVC window and door repair', description: r.metaDescription, provider: { '@id': `${site.url}/#business` } }],
    body,
  };
}

/* =========================================================
   SERVICES
   ========================================================= */
export function servicesHub(site, d) {
  const trail = [{ name: 'Home', href: '/' }, { name: 'Services', href: '/services/' }];
  const body = `
${pageHero({ eyebrow: 'Services', title: 'What we do', lead: 'Supply and installation, surveys, repairs and servicing — for homeowners, landlords and businesses.', trail })}
<section class="sec sec--tight">
  <div class="wrap"><div class="sgrid">
    ${d.services.map((s, i) => `<a class="scard" href="/services/${s.slug}/"><span class="rcard__top"><span class="rcard__ico">${icon(s.icon, { size: 24 })}</span><span class="idx">${pad(i + 1)}</span></span><h2>${s.name}</h2><p>${s.short}</p><span class="pcard__more">Learn more ${icon('arrow-right', { size: 16 })}</span></a>`).join('')}
    <a class="scard scard--dark" href="/repairs/"><span class="rcard__top"><span class="rcard__ico">${icon('wrench', { size: 24 })}</span><span class="idx">05</span></span><h2>Repairs</h2><p>Misted glass, locks, hinges, handles, draughts and more.</p><span class="pcard__more">See repairs ${icon('arrow-right', { size: 16 })}</span></a>
    <a class="scard" href="/guarantee/"><span class="rcard__top"><span class="rcard__ico">${icon('badge-check', { size: 24 })}</span><span class="idx">06</span></span><h2>Guarantees &amp; aftercare</h2><p>What’s covered, for how long, and how to claim.</p><span class="pcard__more">Read more ${icon('arrow-right', { size: 16 })}</span></a>
  </div></div>
</section>
${ctaBand(site)}`;
  return { path: '/services/', title: 'Services', description: 'uPVC window and door services: supply and installation, free surveys, repairs, servicing and maintenance, and work for landlords and businesses.', nav: 'services', schema: [breadcrumbSchema(site, trail)], body };
}

export function service(site, d, s) {
  const trail = [{ name: 'Home', href: '/' }, { name: 'Services', href: '/services/' }, { name: s.name, href: `/services/${s.slug}/` }];
  const isSurvey = s.slug === 'survey-and-quote';
  const body = `
${pageHero({
  eyebrow: 'Services',
  title: s.name,
  lead: s.lead,
  trail,
  actions: btn(isSurvey ? '/book/?type=survey' : '/quote/', isSurvey ? 'Book a free survey' : 'Get a free quote', { ico: isSurvey ? 'calendar-days' : 'square-pen' }) + btn(waLink(site, `Hi ${site.brand.short}, I’m enquiring about ${s.name.toLowerCase()}.`), 'WhatsApp us', { variant: 'wa', ico: 'whatsapp', external: true }),
  aside: `<div class="side-card side-card--brass"><h2 class="h4">Included</h2><ul class="checklist checklist--sm">${s.includes.map((x) => `<li>${icon('check', { size: 16 })}${x}</li>`).join('')}</ul></div>`,
})}
<section class="sec sec--tight">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Step by step', title: 'What happens' })}
    <ol class="process">${s.steps.map(([t, x], i) => `<li><span class="process__n">${pad(i + 1)}</span><h3>${t}</h3><p>${x}</p></li>`).join('')}</ol>
  </div>
</section>
${s.slug === 'installation' ? installPrep() : ''}
${ctaBand(site)}`;
  return {
    path: `/services/${s.slug}/`,
    title: s.name,
    description: s.metaDescription,
    nav: 'services',
    schema: [breadcrumbSchema(site, trail), { '@context': 'https://schema.org', '@type': 'Service', name: s.name, description: s.metaDescription, provider: { '@id': `${site.url}/#business` } }],
    body,
  };
}

function installPrep() {
  return `<section class="sec sec--paper2">
  <div class="wrap two-col">
    <div>${sectionHead({ eyebrow: 'Preparing for installation day', title: 'A little preparation helps' })}</div>
    <ul class="checklist">
      <li>${icon('check', { size: 18 })}Take down curtains, blinds and poles near the windows being replaced.</li>
      <li>${icon('check', { size: 18 })}Move furniture and ornaments about a metre back from the windows.</li>
      <li>${icon('check', { size: 18 })}Clear a path from the front door and make space outside for frames.</li>
      <li>${icon('check', { size: 18 })}Let us know about alarm sensors fitted to existing frames.</li>
      <li>${icon('check', { size: 18 })}Keep children and pets away from work areas.</li>
      <li>${icon('check', { size: 18 })}Tell neighbours if we need shared access or parking.</li>
    </ul>
  </div>
</section>`;
}

/* =========================================================
   QUOTE + BOOK
   ========================================================= */
export function quote(site, d) {
  const trail = [{ name: 'Home', href: '/' }, { name: 'Get a quote', href: '/quote/' }];
  const opts = (cat) => d.products.filter((p) => p.category === cat).map((p) => `<option value="${p.slug}">${p.name}</option>`).join('');
  const colours = d.colours.map((c) => `<option>${c.name.split(' · ')[0]}</option>`).join('');
  const body = `
${pageHero({ eyebrow: 'Free quote · no obligation', title: 'Build your quote', lead: 'Add each window or door with its approximate size. We add up the area and send everything to us in one tidy message — on WhatsApp or by email. We reply with an estimate and confirm a fixed price after a free survey.', trail })}
<section class="sec sec--tight">
  <div class="wrap qb">
    <form class="qb__form" id="quote-form" novalidate data-form="quote">
      <fieldset class="fs">
        <legend><span class="idx">01</span>Your windows &amp; doors</legend>
        <p class="hint">Sizes in millimetres (width × height of the existing frame). Not sure? Leave blank and add a note — or read <a href="/guides/how-to-measure-windows-for-a-quote/">how to measure</a>.</p>
        <div id="qb-items" class="qb__items" aria-live="polite"></div>
        <template id="qb-item-tpl">
          <div class="qitem">
            <div class="qitem__head"><span class="qitem__n">Item 1</span><button type="button" class="qitem__del" aria-label="Remove item">${icon('trash-2', { size: 18 })}<span>Remove</span></button></div>
            <div class="grid-6">
              <label class="f f--span3"><span>Product</span>
                <select name="type" required>
                  <optgroup label="Windows">${opts('windows')}</optgroup>
                  <optgroup label="Doors">${opts('doors')}</optgroup>
                  <optgroup label="Other"><option value="sealed-unit">Replacement glass / sealed unit</option><option value="other">Other / not sure</option></optgroup>
                </select></label>
              <label class="f"><span>Width (mm)</span><input type="number" name="w" inputmode="numeric" min="200" max="8000" step="1" placeholder="1200"></label>
              <label class="f"><span>Height (mm)</span><input type="number" name="h" inputmode="numeric" min="200" max="4000" step="1" placeholder="1250"></label>
              <label class="f"><span>Qty</span><input type="number" name="qty" inputmode="numeric" min="1" max="50" value="1"></label>
              <label class="f f--span2"><span>Glazing</span><select name="glaze"><option>Double glazed</option><option>Triple glazed</option><option>Not sure</option></select></label>
              <label class="f f--span2"><span>Colour</span><select name="colour">${colours}<option>Other / not sure</option></select></label>
              <label class="f f--span2"><span>Glass</span><select name="glass"><option>Clear</option><option>Obscure (privacy)</option><option>Acoustic</option><option>Not sure</option></select></label>
              <label class="f f--span6"><span>Notes <em>(optional)</em></span><input type="text" name="note" maxlength="200" placeholder="e.g. bedroom, first floor, needs escape hinges"></label>
            </div>
          </div>
        </template>
        <button type="button" class="btn btn--ghost" id="qb-add">${icon('plus', { size: 18 })}<span>Add another window or door</span></button>
      </fieldset>

      <fieldset class="fs">
        <legend><span class="idx">02</span>About the job</legend>
        <div class="grid-6">
          <label class="f f--span3"><span>Property type</span><select name="property"><option>House</option><option>Bungalow</option><option>Flat / maisonette</option><option>Commercial</option></select></label>
          <label class="f f--span3"><span>When are you looking to start?</span><select name="timeframe"><option>As soon as possible</option><option>Within 1–3 months</option><option>3–6 months</option><option>Just researching</option></select></label>
          <label class="f f--span6"><span>Anything else? <em>(optional)</em></span><textarea name="message" rows="3" maxlength="1000" placeholder="Listed building, conservation area, access issues, particular style you like…"></textarea></label>
        </div>
      </fieldset>

      <fieldset class="fs">
        <legend><span class="idx">03</span>Your details</legend>
        <div class="grid-6">
          <label class="f f--span3"><span>Name</span><input type="text" name="name" autocomplete="name" required></label>
          <label class="f f--span3"><span>Phone</span><input type="tel" name="phone" autocomplete="tel" required></label>
          <label class="f f--span3"><span>Email <em>(optional)</em></span><input type="email" name="email" autocomplete="email"></label>
          <label class="f f--span3"><span>Postcode</span><input type="text" name="postcode" autocomplete="postal-code" required maxlength="8" class="upper"></label>
        </div>
        <label class="check"><input type="checkbox" name="consent" required><span>I agree to ${esc(site.brand.short)} using these details to respond to my enquiry, as described in the <a href="/privacy/" target="_blank">privacy policy</a>.</span></label>
      </fieldset>

      <div class="qb__submit">
        <p class="form-msg" role="alert" hidden></p>
        <button type="submit" class="btn btn--wa btn--lg" data-send="whatsapp">${brandIcon('whatsapp', { size: 20 })}<span>Send on WhatsApp</span></button>
        <button type="submit" class="btn btn--ghost btn--lg" data-send="email">${icon('mail', { size: 20 })}<span>Send by email</span></button>
      </div>
      <noscript><p class="form-msg">This form needs JavaScript. Please call ${telText(site)} or WhatsApp us instead.</p></noscript>
    </form>

    <aside class="qb__aside" aria-label="Summary and help">
      <div class="qsum" id="qb-summary">
        <p class="eyebrow">Summary</p>
        <dl>
          <div><dt>Items</dt><dd id="qs-items">1</dd></div>
          <div><dt>Units</dt><dd id="qs-units">1</dd></div>
          <div><dt>Total area</dt><dd id="qs-area">—</dd></div>
        </dl>
        <p class="fineprint">Area is calculated from the sizes you enter, to help us estimate. It is not a price.</p>
      </div>
      <div class="side-card">
        <h2 class="h4">What happens next</h2>
        <ol class="numlist">
          <li>We reply with an estimate, usually the same or next working day.</li>
          <li>If you’re happy, we book a free survey to measure and confirm details.</li>
          <li>You get a fixed, itemised written quotation. No pressure.</li>
        </ol>
        <p class="side-card__tip">${icon('camera', { size: 18 })}<span>On WhatsApp, attach photos of each window from outside — it makes the estimate much more accurate.</span></p>
      </div>
      <div class="side-card side-card--dark">
        <h2 class="h4">Rather talk?</h2>
        <a class="big-phone" href="tel:${site.contact.phoneInternational}">${icon('phone', { size: 22 })}${telText(site)}</a>
        <p class="fineprint">${site.hours.filter((h) => h.open).map((h) => `${h.short} ${hoursText(h)}`).join(' · ')}</p>
      </div>
    </aside>
  </div>
</section>`;
  return {
    path: '/quote/',
    title: 'Get a free quote',
    description: 'Build a free, no-obligation quote for uPVC windows and doors. Add sizes and styles, then send to us on WhatsApp or email for a fast estimate.',
    nav: 'quote',
    scripts: ['forms'],
    schema: [breadcrumbSchema(site, trail)],
    body,
  };
}

export function book(site, d) {
  const trail = [{ name: 'Home', href: '/' }, { name: 'Book', href: '/book/' }];
  const body = `
${pageHero({ eyebrow: 'Book online', title: 'Book a survey or repair', lead: 'Tell us what you need and when suits you. This is a booking request — we confirm the appointment by WhatsApp or phone.', trail })}
<section class="sec sec--tight">
  <div class="wrap qb">
    <form class="qb__form" id="book-form" novalidate data-form="book">
      <fieldset class="fs">
        <legend><span class="idx">01</span>What do you need?</legend>
        <div class="choice-grid" role="radiogroup">
          <label class="choice"><input type="radio" name="type" value="survey" checked><span>${icon('ruler', { size: 22 })}<strong>Free survey</strong><small>Measure &amp; quote for new windows or doors</small></span></label>
          <label class="choice"><input type="radio" name="type" value="repair"><span>${icon('wrench', { size: 22 })}<strong>Repair visit</strong><small>Fix a problem with an existing window or door</small></span></label>
          <label class="choice"><input type="radio" name="type" value="service"><span>${icon('clipboard-check', { size: 22 })}<strong>Servicing</strong><small>Adjust, lubricate and check everything</small></span></label>
          <label class="choice"><input type="radio" name="type" value="other"><span>${icon('circle-help', { size: 22 })}<strong>Something else</strong><small>Commercial, landlord or general enquiry</small></span></label>
        </div>
        <div class="grid-6 mt">
          <label class="f f--span3" data-show-for="repair"><span>Type of repair</span><select name="repair"><option value="">Not sure</option>${d.repairs.map((r) => `<option value="${r.slug}">${r.name}</option>`).join('')}</select></label>
          <label class="f f--span3"><span>How many windows / doors?</span><select name="count"><option>1</option><option>2–3</option><option>4–6</option><option>7–10</option><option>More than 10</option><option>Not sure</option></select></label>
          <label class="f f--span6"><span>Briefly describe the job</span><textarea name="message" rows="3" maxlength="1000" placeholder="e.g. replace 6 white casement windows and a back door / back door won’t lock"></textarea></label>
        </div>
      </fieldset>
      <fieldset class="fs">
        <legend><span class="idx">02</span>When suits you?</legend>
        <div class="grid-6">
          <label class="f f--span3"><span>Preferred date</span><input type="date" name="date" required></label>
          <label class="f f--span3"><span>Time of day</span><select name="slot"><option>Morning (8am – 12pm)</option><option>Afternoon (12pm – 4pm)</option><option>Late afternoon (4pm – 6pm)</option><option>Any time</option></select></label>
          <label class="f f--span3"><span>Alternative date <em>(optional)</em></span><input type="date" name="date2"></label>
        </div>
        <p class="hint" id="date-hint">We’re closed on Sundays. Saturday appointments are limited.</p>
      </fieldset>
      <fieldset class="fs">
        <legend><span class="idx">03</span>Where &amp; who</legend>
        <div class="grid-6">
          <label class="f f--span3"><span>Name</span><input type="text" name="name" autocomplete="name" required></label>
          <label class="f f--span3"><span>Phone</span><input type="tel" name="phone" autocomplete="tel" required></label>
          <label class="f f--span4"><span>Address</span><input type="text" name="address" autocomplete="address-line1" required></label>
          <label class="f f--span2"><span>Postcode</span><input type="text" name="postcode" autocomplete="postal-code" required maxlength="8" class="upper"></label>
          <label class="f f--span3"><span>Email <em>(optional)</em></span><input type="email" name="email" autocomplete="email"></label>
          <label class="f f--span3"><span>I am the…</span><select name="role"><option>Homeowner</option><option>Tenant</option><option>Landlord / agent</option><option>Business owner</option></select></label>
        </div>
        <label class="check"><input type="checkbox" name="consent" required><span>I agree to ${esc(site.brand.short)} using these details to arrange my appointment, as described in the <a href="/privacy/" target="_blank">privacy policy</a>.</span></label>
      </fieldset>
      <div class="qb__submit">
        <p class="form-msg" role="alert" hidden></p>
        <button type="submit" class="btn btn--wa btn--lg" data-send="whatsapp">${brandIcon('whatsapp', { size: 20 })}<span>Request on WhatsApp</span></button>
        <button type="submit" class="btn btn--ghost btn--lg" data-send="email">${icon('mail', { size: 20 })}<span>Request by email</span></button>
      </div>
      <noscript><p class="form-msg">This form needs JavaScript. Please call ${telText(site)} or WhatsApp us instead.</p></noscript>
    </form>
    <aside class="qb__aside" aria-label="Summary and help">
      <div class="side-card">
        <h2 class="h4">Opening hours</h2>
        <table class="hours"><tbody>${site.hours.map((h) => `<tr><th scope="row">${h.days}</th><td>${hoursText(h)}</td></tr>`).join('')}</tbody></table>
        <p class="openstate" data-openstate></p>
      </div>
      <div class="side-card">
        <h2 class="h4">For repairs</h2>
        <p>After sending your request, attach photos of the problem in the same WhatsApp chat — and of the lock edge or hinge if relevant. It helps us bring the right parts.</p>
      </div>
      <div class="side-card side-card--dark">
        <h2 class="h4">Urgent?</h2>
        <p>If glass is broken or a door can’t be secured, call us.</p>
        <a class="big-phone" href="tel:${site.contact.phoneInternational}">${icon('phone', { size: 22 })}${telText(site)}</a>
      </div>
    </aside>
  </div>
</section>`;
  return {
    path: '/book/',
    title: 'Book a survey or repair',
    description: 'Book a free survey for new uPVC windows and doors, or a repair or servicing visit. Choose a date and time and send your request on WhatsApp or by email.',
    nav: 'book',
    scripts: ['forms'],
    schema: [breadcrumbSchema(site, trail)],
    body,
  };
}

/* =========================================================
   ABOUT, GUARANTEE, CONTACT
   ========================================================= */
export function about(site, d) {
  const trail = [{ name: 'Home', href: '/' }, { name: 'About', href: '/about/' }];
  const principles = [
    ['Survey before price', 'We don’t give a “final” price over the phone. We measure, check the structure and then put a fixed price in writing.'],
    ['Itemised quotes', 'Every window and door is listed with its size, style, glass, colour and hardware, so you can compare properly.'],
    ['No pressure', 'No “today only” discounts, no salesperson who won’t leave. Take your time.'],
    ['Regulations handled', 'Energy, ventilation, safety glass and escape requirements are checked at survey and certified on completion.'],
    ['Respect for your home', 'Dust sheets down, floors protected, tidy at the end of every day, old frames taken away.'],
    ['Aftercare that answers', 'If something isn’t right, message us. We come back and put it right.'],
  ];
  const body = `
${pageHero({ eyebrow: 'About us', title: `About ${esc(site.brand.name)}`, lead: `We do three things — supply, install and repair uPVC windows and doors — and we do them the way we’d want it done in our own homes.`, trail })}
<section class="sec sec--tight">
  <div class="wrap two-col">
    <div>${sectionHead({ eyebrow: 'Who we are', title: 'Specialists, not generalists' })}</div>
    <div class="prose">
      <p>${esc(site.brand.name)} is a specialist window and door company. We focus on uPVC and composite products because that is where we know the systems, the hardware and the problems inside out — from a 1990s casement with a worn friction hinge to a new A-rated flush sash in anthracite grey.</p>
      <p>That focus means we can usually tell from a photo what is wrong with a window or door, recommend the right product for an opening rather than the one with the biggest margin, and fit it to the standard the Building Regulations expect.</p>
      <p>Whether you are replacing every window in the house, fitting a new front door or just want the back door to lock properly again, you deal with people who know what they’re talking about and who answer the phone afterwards.</p>
    </div>
  </div>
</section>
<section class="sec sec--paper2">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'How we work', title: 'Six promises' })}
    <div class="fgrid fgrid--3">${principles.map(([t, x], i) => `<div class="feat"><span class="idx">${pad(i + 1)}</span><h3>${t}</h3><p>${x}</p></div>`).join('')}</div>
  </div>
</section>
${site.accreditations.length ? `<section class="sec"><div class="wrap">${sectionHead({ eyebrow: 'Accreditations', title: 'Registered & accredited' })}<ul class="tags tags--lg">${site.accreditations.map((a) => `<li>${esc(a.name)}</li>`).join('')}</ul></div></section>` : ''}
${ctaBand(site)}`;
  return { path: '/about/', title: 'About us', description: `About ${site.brand.name}: specialist uPVC window and door supply, installation and repairs. How we work and what you can expect.`, nav: 'about', schema: [breadcrumbSchema(site, trail)], body };
}

export function guarantee(site, d) {
  const trail = [{ name: 'Home', href: '/' }, { name: 'Guarantees', href: '/guarantee/' }];
  const g = site.guarantee;
  const body = `
${pageHero({ eyebrow: 'Aftercare', title: 'Guarantees & aftercare', lead: 'What is covered, for how long, and how to make a claim. Your individual guarantee certificate sets out the full terms for your installation.', trail })}
<section class="sec sec--tight">
  <div class="wrap"><div class="gcards">
    <div class="gbig"><span class="gbig__n">${g.installationYears}<small>years</small></span><h2 class="h3">Installation guarantee</h2><p>New windows and doors supplied and fitted by us are guaranteed against defects in manufacture and workmanship for ${g.installationYears} years from completion${g.insuranceBacked ? ', backed by an insurance-backed guarantee so you remain protected even if we cease trading' : ''}.</p></div>
    <div class="gbig"><span class="gbig__n">${g.repairMonths}<small>months</small></span><h2 class="h3">Repair guarantee</h2><p>Parts we supply and fit during a repair, and our workmanship on that repair, are guaranteed for ${g.repairMonths} months.</p></div>
  </div></div>
</section>
<section class="sec sec--paper2">
  <div class="wrap two-col">
    <div>${sectionHead({ eyebrow: 'Covered', title: 'What’s included' })}
      <ul class="checklist">
        <li>${icon('check', { size: 18 })}Frames and sashes that warp, crack or discolour abnormally</li>
        <li>${icon('check', { size: 18 })}Sealed units that mist between the panes</li>
        <li>${icon('check', { size: 18 })}Locks, hinges and handles that fail in normal use</li>
        <li>${icon('check', { size: 18 })}Faults caused by our installation workmanship</li>
      </ul>
    </div>
    <div>${sectionHead({ eyebrow: 'Not covered', title: 'Exclusions' })}
      <ul class="checklist checklist--x">
        <li>${icon('x', { size: 18 })}Accidental damage, misuse or vandalism</li>
        <li>${icon('x', { size: 18 })}Glass breakage after handover</li>
        <li>${icon('x', { size: 18 })}Condensation on the room side of the glass</li>
        <li>${icon('x', { size: 18 })}Alterations or repairs by anyone else</li>
        <li>${icon('x', { size: 18 })}Wear caused by lack of basic maintenance</li>
      </ul>
    </div>
  </div>
</section>
<section class="sec">
  <div class="wrap two-col">
    <div>${sectionHead({ eyebrow: 'Claims', title: 'How to make a claim' })}</div>
    <ol class="numlist numlist--lg">
      <li>Contact us by WhatsApp, phone or email with your name, address and a description of the problem.</li>
      <li>Send photos or a short video if you can — it helps us bring the right part.</li>
      <li>We arrange a visit to inspect and, where covered, put it right at no cost to you.</li>
    </ol>
  </div>
</section>
<section class="sec sec--paper2">
  <div class="wrap two-col">
    <div>${sectionHead({ eyebrow: 'Keep it valid', title: 'Simple maintenance' })}</div>
    <div class="prose"><p>Clean frames a few times a year, keep drainage slots clear and lubricate hinges and locking points once or twice a year. Our <a href="/guides/how-to-maintain-upvc-windows-and-doors/">care guide</a> explains exactly what to do.</p><p>Your statutory rights as a consumer are not affected by our guarantee.</p></div>
  </div>
</section>
${ctaBand(site, { title: 'Need help with something we fitted?', text: 'Message us with photos and your address and we’ll arrange a visit.', waText: `Hi ${site.brand.short}, I need help under my guarantee. My address is ` })}`;
  return { path: '/guarantee/', title: 'Guarantees & aftercare', description: `${site.brand.name} guarantees: ${g.installationYears}-year installation guarantee and ${g.repairMonths}-month repair guarantee. What’s covered and how to claim.`, nav: 'services', schema: [breadcrumbSchema(site, trail)], body };
}

export function contact(site, d) {
  const trail = [{ name: 'Home', href: '/' }, { name: 'Contact', href: '/contact/' }];
  const addr = addressLines(site);
  const mapQ = encodeURIComponent([site.brand.name, ...addr].join(', '));
  const body = `
${pageHero({ eyebrow: 'Contact', title: 'Talk to us', lead: 'WhatsApp is usually quickest — especially if you can send photos. Or call, email, or use the form below.', trail })}
<section class="sec sec--tight">
  <div class="wrap"><div class="ccards">
    <a class="ccard ccard--wa" href="${waLink(site, `Hi ${site.brand.short}, `)}" target="_blank" rel="noopener">${brandIcon('whatsapp', { size: 28 })}<span class="eyebrow">WhatsApp</span><strong>${telText(site)}</strong><span>Messages, photos &amp; quotes</span></a>
    <a class="ccard" href="tel:${site.contact.phoneInternational}">${icon('phone', { size: 28 })}<span class="eyebrow">Call</span><strong>${telText(site)}</strong><span data-openstate>During&nbsp;opening&nbsp;hours</span></a>
    <a class="ccard" href="mailto:${site.contact.email}">${icon('mail', { size: 28 })}<span class="eyebrow">Email</span><strong class="break">${site.contact.email}</strong><span>We reply within one working day</span></a>
    ${addr.length ? `<div class="ccard">${icon('map-pin', { size: 28 })}<span class="eyebrow">Address</span><strong>${addr.map(esc).join('<br>')}</strong></div>` : ''}
  </div></div>
</section>
<section class="sec sec--paper2">
  <div class="wrap qb">
    <form class="qb__form" id="contact-form" novalidate data-form="contact">
      <fieldset class="fs">
        <legend><span class="idx">✉</span>Send a message</legend>
        <div class="grid-6">
          <label class="f f--span3"><span>Name</span><input type="text" name="name" autocomplete="name" required></label>
          <label class="f f--span3"><span>Phone</span><input type="tel" name="phone" autocomplete="tel" required></label>
          <label class="f f--span3"><span>Email <em>(optional)</em></span><input type="email" name="email" autocomplete="email"></label>
          <label class="f f--span3"><span>Postcode</span><input type="text" name="postcode" autocomplete="postal-code" maxlength="8" class="upper"></label>
          <label class="f f--span6"><span>Subject</span><select name="subject"><option>New windows or doors</option><option>A repair</option><option>Existing installation / guarantee</option><option>Landlord or commercial enquiry</option><option>Something else</option></select></label>
          <label class="f f--span6"><span>Message</span><textarea name="message" rows="5" maxlength="2000" required></textarea></label>
        </div>
        <label class="check"><input type="checkbox" name="consent" required><span>I agree to ${esc(site.brand.short)} using these details to respond, as described in the <a href="/privacy/" target="_blank">privacy policy</a>.</span></label>
      </fieldset>
      <div class="qb__submit">
        <p class="form-msg" role="alert" hidden></p>
        <button type="submit" class="btn btn--wa btn--lg" data-send="whatsapp">${brandIcon('whatsapp', { size: 20 })}<span>Send on WhatsApp</span></button>
        <button type="submit" class="btn btn--ghost btn--lg" data-send="email">${icon('mail', { size: 20 })}<span>Send by email</span></button>
      </div>
    </form>
    <aside class="qb__aside" aria-label="Summary and help">
      <div class="side-card">
        <h2 class="h4">Opening hours</h2>
        <table class="hours"><tbody>${site.hours.map((h) => `<tr><th scope="row">${h.days}</th><td>${hoursText(h)}</td></tr>`).join('')}</tbody></table>
        <p class="openstate" data-openstate></p>
      </div>
      ${
        site.postcodePrefixes.length
          ? `<div class="side-card"><h2 class="h4">Do we cover your area?</h2><form class="pc-check" data-prefixes="${esc(site.postcodePrefixes.join(','))}"><label class="f"><span>Your postcode</span><input type="text" name="pc" class="upper" maxlength="8" autocomplete="postal-code"></label><button class="btn btn--primary" type="submit">Check</button><p class="pc-check__out" aria-live="polite"></p></form></div>`
          : ''
      }
      ${site.serviceAreas.length ? `<div class="side-card"><h2 class="h4">Areas we cover</h2><ul class="tags">${site.serviceAreas.map((a) => `<li>${esc(a)}</li>`).join('')}</ul></div>` : ''}
    </aside>
  </div>
</section>
${
  site.contact.showMap && addr.length
    ? `<section class="sec"><div class="wrap"><div class="map" data-map-src="https://www.google.com/maps?q=${mapQ}&output=embed"><button type="button" class="btn btn--primary" data-map-load>${icon('map-pin', { size: 18 })}<span>Show map</span></button><p class="fineprint">Loads Google Maps, which may set cookies. <a href="/cookies/">Cookie policy</a>.</p></div></div></section>`
    : ''
}`;
  return { path: '/contact/', title: 'Contact us', description: `Contact ${site.brand.name}: WhatsApp or call ${site.contact.phoneDisplay}, email ${site.contact.email}. Quotes, repairs and surveys for uPVC windows and doors.`, nav: 'contact', scripts: ['forms'], schema: [breadcrumbSchema(site, trail), businessSchema(site)], body };
}

/* =========================================================
   FAQ + GUIDES
   ========================================================= */
export function faqPage(site, d) {
  const trail = [{ name: 'Home', href: '/' }, { name: 'FAQs', href: '/faq/' }];
  const body = `
${pageHero({ eyebrow: 'Help centre', title: 'Frequently asked questions', lead: 'Prices, surveys, regulations, repairs and guarantees — answered plainly.', trail })}
<section class="sec sec--tight">
  <div class="wrap faqpage">
    <aside class="faqpage__nav" aria-label="Search and topics">
      <label class="search"><span class="sr">Search FAQs</span>${icon('search', { size: 18 })}<input type="search" id="faq-search" placeholder="Search questions…" autocomplete="off"></label>
      <nav aria-label="FAQ topics"><ul>${d.faqs.map((g) => `<li><a href="#${g.id}">${g.title}</a></li>`).join('')}</ul></nav>
    </aside>
    <div class="faqpage__main">
      ${d.faqs.map((g) => `<section class="faqgroup" id="${g.id}" aria-labelledby="h-${g.id}"><h2 class="h3" id="h-${g.id}">${g.title}</h2>${faqList(g.items)}</section>`).join('')}
      <p class="faq-empty" hidden>No questions match. Try different words, or <a href="/contact/">ask us directly</a>.</p>
    </div>
  </div>
</section>
${ctaBand(site, { title: 'Still have a question?', text: 'Ask on WhatsApp — a real person replies during opening hours.' })}`;
  return {
    path: '/faq/',
    title: 'FAQs',
    description: 'Answers to common questions about uPVC windows and doors: prices, surveys, installation, Building Regulations, FENSA, planning, repairs and guarantees.',
    nav: 'faq',
    scripts: ['faq'],
    schema: [
      breadcrumbSchema(site, trail),
      { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: d.allFaqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
    ],
    body,
  };
}

export function guidesHub(site, d) {
  const trail = [{ name: 'Home', href: '/' }, { name: 'Guides', href: '/guides/' }];
  const body = `
${pageHero({ eyebrow: 'Guides & advice', title: 'Know what you’re buying', lead: 'Plain-English guides to energy ratings, regulations, repairs and maintenance — so you can compare quotes with confidence.', trail })}
<section class="sec sec--tight"><div class="wrap"><div class="ggrid ggrid--all">${d.guides.map(guideCard).join('')}</div></div></section>
${ctaBand(site)}`;
  return { path: '/guides/', title: 'Guides & advice', description: 'Guides to uPVC windows and doors: energy ratings, Building Regulations, misted glass, maintenance, measuring and choosing a front door.', nav: 'guides', schema: [breadcrumbSchema(site, trail)], body };
}

export function guide(site, d, gd) {
  const trail = [{ name: 'Home', href: '/' }, { name: 'Guides', href: '/guides/' }, { name: gd.title, href: `/guides/${gd.slug}/` }];
  const more = d.guides.filter((x) => x.slug !== gd.slug).slice(0, 3);
  const body = `
<article>
  <header class="phero phero--article">
    <div class="wrap wrap--text">
      ${crumbs(trail)}
      <p class="eyebrow">${gd.tag}</p>
      <h1 class="h1">${gd.title}</h1>
      <p class="phero__lead">${gd.summary}</p>
      <p class="article-meta"><time datetime="${gd.date}">${fmtDate(gd.date)}</time> · ${gd.read} read · ${esc(site.brand.name)}</p>
    </div>
  </header>
  <div class="sec sec--tight"><div class="wrap wrap--text prose prose--article">${gd.body}</div></div>
</article>
<section class="sec sec--paper2"><div class="wrap">${sectionHead({ eyebrow: 'Keep reading', title: 'More guides' })}<div class="ggrid">${more.map(guideCard).join('')}</div></div></section>
${ctaBand(site)}`;
  return {
    path: `/guides/${gd.slug}/`,
    title: gd.title,
    description: gd.metaDescription,
    nav: 'guides',
    ogType: 'article',
    schema: [
      breadcrumbSchema(site, trail),
      { '@context': 'https://schema.org', '@type': 'Article', headline: gd.title, description: gd.metaDescription, datePublished: gd.date, dateModified: gd.date, author: { '@type': 'Organization', name: site.brand.name }, publisher: { '@id': `${site.url}/#business` }, mainEntityOfPage: `${site.url}/guides/${gd.slug}/` },
    ],
    body,
  };
}

/* =========================================================
   LEGAL
   ========================================================= */
function legalShell(site, { path, title, lead, html, description }) {
  const trail = [{ name: 'Home', href: '/' }, { name: title, href: path }];
  const body = `
${pageHero({ eyebrow: 'Legal', title, lead, trail })}
<section class="sec sec--tight"><div class="wrap wrap--text prose prose--legal">${html}</div></section>`;
  return { path, title, description, nav: '', schema: [breadcrumbSchema(site, trail)], body };
}

function controllerBlock(site) {
  const co = site.company;
  const addr = co.registeredOffice || addressLines(site).join(', ');
  return `<p>${esc(co.legalName || site.brand.name)}${co.companyNumber ? ` (company number ${esc(co.companyNumber)})` : ''}${addr ? `, ${esc(addr)}` : ''}. Email <a href="mailto:${site.contact.email}">${site.contact.email}</a>, telephone ${telText(site)}.${co.icoNumber ? ` ICO registration number: ${esc(co.icoNumber)}.` : ''}</p>`;
}

export function privacy(site) {
  const n = esc(site.brand.name);
  const html = `
<p class="updated">Last updated: ${site.legal.policiesUpdated}</p>
<p>This policy explains how ${n} (“we”, “us”) collects and uses personal information when you visit this website, contact us, or ask us for a quote, survey, installation or repair. We are committed to handling your information lawfully and transparently under the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.</p>

<h2>1. Who we are</h2>
<p>We are the controller of your personal data. Our details:</p>
${controllerBlock(site)}

<h2>2. Information we collect</h2>
<h3>Information you give us</h3>
<ul>
<li><strong>Contact details</strong> — name, telephone number, email address, postal address and postcode.</li>
<li><strong>Enquiry and job details</strong> — the products or repairs you are interested in, sizes, preferred appointment times, messages, and any photos or videos of your property you send us.</li>
<li><strong>Property access information</strong> — for example access arrangements, or tenant contact details provided by a landlord or agent.</li>
<li><strong>Contract and payment records</strong> — quotations, orders, invoices and payments, guarantee records and Building Regulations notifications.</li>
</ul>
<h3>Information collected when you use the website</h3>
<ul>
<li><strong>Technical data</strong> — our hosting provider processes your IP address, browser type and the pages requested in order to deliver the website and protect it against attacks. We do not use analytics or advertising cookies.</li>
<li><strong>Information stored on your device</strong> — the website assistant stores your conversation in your browser’s session storage so it is not lost between pages. It stays on your device, is not sent to us, and is cleared when you close the browser tab. See our <a href="/cookies/">cookie policy</a>.</li>
</ul>
<p>The website assistant runs entirely in your browser. It does not send what you type to us or to any third party unless you choose to continue the conversation on WhatsApp.</p>

<h2>3. How we use your information and our lawful basis</h2>
<table class="compare"><thead><tr><th scope="col">Purpose</th><th scope="col">Lawful basis</th></tr></thead><tbody>
<tr><td>Responding to enquiries, preparing estimates and quotations, arranging surveys</td><td>Steps taken at your request before entering into a contract</td></tr>
<tr><td>Manufacturing, installing and repairing products; aftercare and guarantee claims</td><td>Performance of a contract</td></tr>
<tr><td>Registering installations with a Competent Person Scheme or building control; registering insurance-backed guarantees; keeping accounting and tax records</td><td>Legal obligation</td></tr>
<tr><td>Handling requests from landlords and agents for tenanted properties; keeping records to deal with complaints or legal claims; improving our service</td><td>Legitimate interests</td></tr>
<tr><td>Sending occasional offers or news (only if you have opted in)</td><td>Consent — you can withdraw it at any time</td></tr>
</tbody></table>
<p>We do not sell your personal information and we do not use automated decision-making or profiling.</p>

<h2>4. WhatsApp, phone and email</h2>
<p>When you press a “Send on WhatsApp” button, the website opens WhatsApp with a pre-written message. Nothing is sent until you press send inside WhatsApp. Messages are then handled by WhatsApp (part of Meta) under its own terms and privacy policy, and are end-to-end encrypted. Similarly, “Send by email” opens your own email app; the message is sent by your email provider.</p>
${site.forms.endpoint ? '<p>Forms on this website may also be delivered to us by email through a third-party form-processing service acting on our behalf.</p>' : ''}

<h2>5. Who we share information with</h2>
<p>We share personal information only where necessary, with:</p>
<ul>
<li>manufacturers and suppliers, for ordering and warranty purposes (usually product and delivery details only);</li>
<li>Competent Person Schemes (such as FENSA or Certass) or your local authority building control, to certify that work complies with Building Regulations — this requires the property address and details of the work;</li>
<li>insurance-backed guarantee providers, to register your guarantee;</li>
<li>subcontracted fitters working on our behalf under our instructions;</li>
<li>service providers who host our website, email and business systems;</li>
<li>our accountants, insurers and professional advisers;</li>
<li>the police, courts or regulators where the law requires it.</li>
</ul>

<h2>6. International transfers</h2>
<p>Some of our service providers (for example email, messaging and hosting providers) may process data outside the UK. Where they do, we rely on UK adequacy regulations or appropriate safeguards such as the UK International Data Transfer Agreement or Addendum.</p>

<h2>7. How long we keep information</h2>
<ul>
<li>Enquiries and quotations that do not proceed: up to 24 months, then deleted.</li>
<li>Customer and job records: for the length of the guarantee plus six years, to deal with guarantee claims and legal obligations.</li>
<li>Accounting records: as required by HMRC (normally six years).</li>
</ul>

<h2>8. Your rights</h2>
<p>You have the right to: access your personal data; have inaccurate data corrected; have data erased; restrict or object to processing; data portability; and withdraw consent at any time where we rely on consent. To exercise any right, contact us using the details above. We will respond within one month. There is normally no charge.</p>

<h2>9. Security</h2>
<p>We use appropriate technical and organisational measures to protect personal information, including encrypted connections (HTTPS) on this website, access controls on our devices and accounts, and limiting access to staff who need it.</p>

<h2>10. Children</h2>
<p>Our services are intended for adults. We do not knowingly collect information from children under 16.</p>

<h2>11. Complaints</h2>
<p>If you have a concern about how we use your information, please contact us first so we can try to resolve it. You also have the right to complain to the Information Commissioner’s Office (ICO): <a href="https://ico.org.uk/make-a-complaint/" target="_blank" rel="noopener">ico.org.uk/make-a-complaint</a>, telephone 0303 123 1113.</p>

<h2>12. Changes to this policy</h2>
<p>We may update this policy from time to time. The date at the top shows when it was last changed.</p>`;
  return legalShell(site, { path: '/privacy/', title: 'Privacy policy', lead: 'How we collect, use and protect your personal information.', html, description: `How ${site.brand.name} collects, uses and protects personal information under UK GDPR and the Data Protection Act 2018.` });
}

export function cookies(site) {
  const html = `
<p class="updated">Last updated: ${site.legal.policiesUpdated}</p>
<p>Cookies are small files stored on your device by websites. Similar technologies, such as your browser’s local and session storage, work in a similar way. This page explains what this website uses.</p>
<h2>What we use</h2>
<table class="compare"><thead><tr><th scope="col">Name</th><th scope="col">Type</th><th scope="col">Purpose</th><th scope="col">Duration</th></tr></thead><tbody>
<tr><td><code>vx-chat</code></td><td>Session storage (strictly necessary)</td><td>Keeps your conversation with the website assistant while you move between pages</td><td>Until you close the tab</td></tr>
<tr><td><code>vx-quote</code></td><td>Session storage (strictly necessary)</td><td>Keeps the items you’ve added to the quote builder if you navigate away</td><td>Until you close the tab</td></tr>
</tbody></table>
<p>These are strictly necessary for features you ask for, so under the Privacy and Electronic Communications Regulations (PECR) they do not require consent. They are never sent to us.</p>
<h2>What we don’t use</h2>
<p>This website does not use analytics, advertising or tracking cookies, and does not use social media tracking pixels.</p>
<h2>Third-party services</h2>
<p>If we show a map on the contact page, it does not load until you press “Show map”. Google Maps may then set its own cookies, governed by Google’s privacy policy. Opening WhatsApp or your email app takes you to those services, which have their own policies.</p>
<p>Our hosting provider may set a strictly necessary security cookie to protect the website from malicious traffic.</p>
<h2>Managing storage</h2>
<p>You can clear cookies and site data at any time in your browser settings. The website will continue to work.</p>
<p>Questions? See our <a href="/privacy/">privacy policy</a> or <a href="/contact/">contact us</a>.</p>`;
  return legalShell(site, { path: '/cookies/', title: 'Cookie policy', lead: 'We keep it simple: no tracking, no advertising cookies.', html, description: `Cookie policy for ${site.brand.name}. No analytics or advertising cookies — only strictly necessary storage for the website assistant and quote builder.` });
}

export function terms(site) {
  const n = esc(site.brand.name);
  const html = `
<p class="updated">Last updated: ${site.legal.policiesUpdated}</p>
<p>These terms apply to your use of this website and summarise how we provide quotations and work. The written quotation and contract you receive for any job set out the full terms for that job and take priority over this summary.</p>
<h2>1. About us</h2>
${controllerBlock(site)}
<h2>2. Using this website</h2>
<ul>
<li>Information on this website is general guidance. It is not a quotation or specification for your property.</li>
<li>Product drawings are illustrative. Colours on screen are indicative only; please see physical samples.</li>
<li>Estimates given online, by phone or on WhatsApp are based on the information you provide and are confirmed or adjusted after survey.</li>
<li>You must not misuse the website, attempt to gain unauthorised access to it, or copy its content for commercial use without permission.</li>
<li>We are not responsible for the content of external websites we link to.</li>
</ul>
<h2>3. Quotations</h2>
<ul>
<li>Quotations are given in writing after a survey and are valid for the period stated on them.</li>
<li>A contract is formed when you accept a written quotation and we confirm your order.</li>
<li>Prices, deposits and payment stages are set out on the quotation. We will never ask you to pay the full price before work is complete.</li>
</ul>
<h2>4. Your right to cancel</h2>
<p>If you agree a contract with us at your home or at a distance (for example by phone, email or WhatsApp), you may have the right to cancel within 14 days under the Consumer Contracts (Information, Cancellation and Additional Charges) Regulations 2013. Your quotation explains whether and how this right applies, including for made-to-measure products and where you ask us to start work within the cancellation period.</p>
<h2>5. Surveys, manufacture and installation</h2>
<ul>
<li>Products are made to measure from our final survey. Please tell us of anything that could affect the work, such as alarm sensors, known structural issues, or planning restrictions on your property.</li>
<li>Lead times are estimates and depend on manufacturers. We keep you informed of any change.</li>
<li>We take reasonable care to avoid damage. Some disturbance to plaster, decoration or render around frames can be unavoidable; making good beyond standard sealing and trims is quoted separately.</li>
<li>Building Regulations compliance is certified on completion, as described on your quotation.</li>
</ul>
<h2>6. Guarantees</h2>
<p>Our guarantees are described on our <a href="/guarantee/">guarantee page</a> and on your guarantee certificate. They are in addition to your statutory rights under the Consumer Rights Act 2015, which are not affected.</p>
<h2>7. Liability</h2>
<p>Nothing in these terms limits our liability for death or personal injury caused by negligence, for fraud, or for anything that cannot be limited by law. Otherwise, we are not liable for losses that were not reasonably foreseeable.</p>
<h2>8. Complaints</h2>
<p>If you are unhappy with any aspect of our work, please contact us so we can put it right.</p>
<h2>9. Law</h2>
<p>These terms are governed by the law of England and Wales. If you live in Scotland or Northern Ireland, you may also bring proceedings in your local courts.</p>`;
  return legalShell(site, { path: '/terms/', title: 'Terms & conditions', lead: `Website terms of use and a summary of how ${n} quotes and carries out work.`, html, description: `Website terms and summary trading terms for ${site.brand.name}: quotations, cancellation rights, installation, guarantees and liability.` });
}

export function accessibility(site) {
  const html = `
<p class="updated">Last updated: ${site.legal.policiesUpdated}</p>
<p>We want everyone to be able to use this website. It has been designed to meet the Web Content Accessibility Guidelines (WCAG) 2.2 at level AA.</p>
<h2>What we’ve done</h2>
<ul>
<li>Pages work with a keyboard alone, with visible focus indicators and a “skip to content” link.</li>
<li>Text and interface colours meet contrast requirements.</li>
<li>Pages use proper headings, landmarks and labels for screen readers; diagrams have text descriptions.</li>
<li>The layout adapts to phones, tablets, zoom up to 400% and larger text settings.</li>
<li>Animations are reduced if your device asks for reduced motion.</li>
</ul>
<h2>Known limitations</h2>
<p>Third-party services we link to, such as WhatsApp and Google Maps, are outside our control and may not be fully accessible.</p>
<h2>Need something in a different format?</h2>
<p>If you have difficulty using any part of this website, or need information in another format, call us on ${telText(site)} or email <a href="mailto:${site.contact.email}">${site.contact.email}</a> and we will help.</p>`;
  return legalShell(site, { path: '/accessibility/', title: 'Accessibility', lead: 'Our commitment to an accessible website.', html, description: `Accessibility statement for the ${site.brand.name} website.` });
}

export function notFound(site, d) {
  const body = `
<section class="phero phero--404">
  <div class="wrap">
    <p class="eyebrow">Error 404</p>
    <h1 class="display">This page has been <em>removed</em> — like an old window.</h1>
    <p class="phero__lead">The page you were looking for doesn’t exist or has moved. Try one of these instead:</p>
    <div class="phero__actions">
      ${btn('/', 'Home', { ico: 'house' })}
      ${btn('/windows/', 'Windows', { variant: 'ghost' })}
      ${btn('/doors/', 'Doors', { variant: 'ghost' })}
      ${btn('/repairs/', 'Repairs', { variant: 'ghost' })}
      ${btn('/contact/', 'Contact', { variant: 'ghost' })}
    </div>
  </div>
</section>`;
  return { path: '/404.html', title: 'Page not found', description: 'Page not found.', noindex: true, body };
}
