import { icon, brandIcon, productDrawing, facadeDrawing, sectionDrawing } from './svg.mjs';
import { esc, btn, telText, waLink, sectionHead, productCard, helpCard, repairRow, faqList, ctaBand, pageHero, crumbs, hoursText, addressLines, breadcrumbSchema } from './layout.mjs';

const pad = (n) => String(n).padStart(2, '0');
// lower-case a product or repair name for use mid-sentence, keeping “uPVC” and “French” intact
// structured data helpers (layout.mjs links these into one graph per page)
const plain = (h) => String(h).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const areaServed = (site) => (site.serviceAreas.length ? site.serviceAreas.map((name) => ({ '@type': 'City', name })) : site.areaServed || undefined);
const serviceSchema = (site, path, o) => ({ '@type': 'Service', '@id': `${site.url}${path}#service`, mainOfPage: true, url: `${site.url}${path}`, provider: { '@id': `${site.url}/#business` }, areaServed: areaServed(site), ...o });
const faqSchema = (site, path, items) => ({
  '@type': 'FAQPage',
  '@id': `${site.url}${path}#faq`,
  isPartOf: { '@id': `${site.url}${path}#webpage` },
  mainEntity: items.map((f) => {
    const [q, a] = Array.isArray(f) ? f : [f.q, f.a];
    return { '@type': 'Question', name: plain(q), acceptedAnswer: { '@type': 'Answer', text: plain(a) } };
  }),
});

const lc = (s) => (/^(uPVC|French)\b/.test(s) ? s : s.charAt(0).toLowerCase() + s.slice(1));
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
      <h1 class="display"><span class="ln"><span style="--d:0">Windows &amp; doors,</span></span> <span class="ln"><span style="--d:1">made to measure,</span></span> <span class="ln"><span style="--d:2"><em>fitted properly.</em></span></span></h1>
      <p class="hero__lead">${esc(site.brand.short)} supplies, fits and repairs uPVC and composite windows and doors. The survey is free, every item is listed on a written quote, and we keep you informed until handover.</p>
      <div class="hero__actions">
        <a class="hbtn hbtn--quote" href="/quote/"><span class="hbtn__ico">${icon('square-pen', { size: 22 })}</span><span class="hbtn__txt"><strong>Get my free quote</strong><small>Draw your windows to size</small></span><span class="hbtn__go">${icon('arrow-right', { size: 18 })}</span></a>
        <a class="hbtn hbtn--wa" href="${esc(waLink(site, `Hi ${site.brand.short}, I’d like a quote.`))}" target="_blank" rel="noopener"><span class="hbtn__ico">${brandIcon('whatsapp', { size: 22 })}</span><span class="hbtn__txt"><strong>Ask on WhatsApp</strong><small>${telText(site)}</small></span><span class="hbtn__go">${icon('arrow-up-right', { size: 18 })}</span></a>
      </div>
      <ul class="hero__ticks">
        <li>${icon('check', { size: 16 })}Free survey and written quote</li>
        <li>${icon('check', { size: 16 })}Fitted to current Building Regulations</li>
        <li>${icon('check', { size: 16 })}Repairs to most uPVC systems</li>
      </ul>
      ${stats}
    </div>
    <div class="hero__art">
      ${facadeDrawing()}
      <a class="hero__badge" href="/quote/">${icon('ruler', { size: 20 })}<span><strong>Draw your windows to size</strong><span>Online quote builder · no sign-up</span></span></a>
    </div>
  </div>
</section>

<section class="paths" aria-label="How can we help?">
  <div class="wrap paths__grid">
    <a class="path" href="/windows/"><div class="path__body"><p class="eyebrow">${win.length} styles</p><h2>New windows</h2><p>Casement, flush, tilt and turn, sash, bay and sliding. Each one made to measure.</p></div><div class="path__fig">${productDrawing('casement-windows')}</div><span class="path__go">${icon('arrow-right', { size: 20 })}</span></a>
    <a class="path" href="/doors/"><div class="path__body"><p class="eyebrow">${door.length} styles</p><h2>A new door</h2><p>Front, back, French, patio, bi-fold and stable doors in uPVC or composite.</p></div><div class="path__fig">${productDrawing('composite-doors')}</div><span class="path__go">${icon('arrow-right', { size: 20 })}</span></a>
    <a class="path path--dark" href="/repairs/"><div class="path__body"><p class="eyebrow eyebrow--light">${d.repairs.length} common repairs</p><h2>Something needs fixing</h2><p>Misted glass, sticking locks, dropped doors, worn hinges, draughts and patio rollers.</p></div><div class="path__fig">${icon('wrench', { size: 64 })}</div><span class="path__go">${icon('arrow-right', { size: 20 })}</span></a>
  </div>
</section>

<section class="sec" aria-labelledby="win-title">
  <div class="wrap">
    ${sectionHead({ index: '01', eyebrow: 'Windows', title: 'Window styles we fit', lead: d.categories.windows.lead, id: 'win-title', link: { href: '/windows/', label: 'See all windows' } })}
    <div class="pgrid pgrid--4">${win.map(productCard).join('')}${helpCard(site)}</div>
  </div>
</section>

<section class="sec sec--paper2" aria-labelledby="door-title">
  <div class="wrap">
    ${sectionHead({ index: '02', eyebrow: 'Doors', title: 'Front, back and garden doors', lead: d.categories.doors.lead, id: 'door-title', link: { href: '/doors/', label: 'See all doors' } })}
    <div class="pgrid pgrid--3">${door.map(productCard).join('')}</div>
  </div>
</section>

<section class="sec sec--dark" aria-labelledby="rep-title">
  <div class="wrap repband">
    <div class="repband__intro">
      <div class="sec-head__meta"><span class="idx">03</span><span class="eyebrow eyebrow--light">Repairs</span></div>
      <h2 class="h2" id="rep-title">Most faults need a new part. The window can stay.</h2>
      <p class="lead">We repair uPVC windows and doors, whoever fitted them. Send a photo first. We can often identify the part and give you a price before we visit.</p>
      <ol class="steps-mini">
        <li><span>1</span>Send photos on WhatsApp</li>
        <li><span>2</span>Get a price and a time</li>
        <li><span>3</span>We fit the part, often in one visit</li>
      </ol>
      <div class="repband__actions">
        ${btn(waLink(site, `Hi ${site.brand.short}, I need a repair. Here are some photos:`), 'Send photos on WhatsApp', { variant: 'wa', ico: 'whatsapp', external: true })}
        ${btn('/book/?type=repair', 'Book a repair', { variant: 'ghost-light', ico: 'calendar-days' })}
      </div>
    </div>
    <div class="repband__list">${d.repairs.map(repairRow).join('')}</div>
  </div>
</section>

<section class="sec" aria-labelledby="perf-title">
  <div class="wrap perf">
    <div class="perf__copy">
      ${sectionHead({ index: '04', eyebrow: 'Performance', title: 'What’s inside a good window', id: 'perf-title' })}
      <p class="lead">Most of what keeps a room warm and secure sits inside the frame and the sealed unit. This is what we specify, and why.</p>
      <dl class="specs">
        <div><dt>${icon('thermometer', { size: 18 })}Energy</dt><dd>Meets Part L for replacement windows, with a U-value of 1.4&nbsp;W/m²K or better, or WER band B or above. A-rated options are available.</dd></div>
        <div><dt>${icon('layers', { size: 18 })}Glass</dt><dd>Low-E coated glass, an argon-filled cavity and warm-edge spacer bars. Triple glazing on request.</dd></div>
        <div><dt>${icon('shield-check', { size: 18 })}Security</dt><dd>Multipoint locks and key-locking handles. Door cylinders rated TS&nbsp;007 3-star or SS&nbsp;312 Diamond. PAS&nbsp;24 options available.</dd></div>
        <div><dt>${icon('wind', { size: 18 })}Ventilation</dt><dd>If your old windows have trickle vents, the new ones must too (Part F). Background ventilation helps keep condensation down.</dd></div>
        <div><dt>${icon('volume-x', { size: 18 })}Noise</dt><dd>Acoustic laminated glass or triple glazing for rooms that face a busy road.</dd></div>
      </dl>
    </div>
    <div class="perf__art"><div class="sheet sheet--plain">${sectionDrawing()}</div></div>
  </div>
</section>

<section class="sec sec--paper2" aria-labelledby="col-title">
  <div class="wrap">
    ${sectionHead({ index: '05', eyebrow: 'Colours & finishes', title: 'Beyond white', lead: 'Smooth or woodgrain finishes, in one colour or a different colour inside and out. These are some of the most popular. Ask to see physical samples at your survey.', id: 'col-title' })}
    <ul class="swatches">${d.colours.map((c) => `<li><span class="swatch" style="--sw:${c.hex}"></span><span>${c.name}</span></li>`).join('')}</ul>
    <p class="fineprint">Screen colours are a guide only. Always check against a physical sample.</p>
  </div>
</section>

<section class="sec" aria-labelledby="proc-title">
  <div class="wrap">
    ${sectionHead({ index: '06', eyebrow: 'How it works', title: 'How a replacement job runs', id: 'proc-title', link: { href: '/services/installation/', label: 'Read the full process' } })}
    <ol class="process">${install.steps.map(([t, x], i) => `<li><span class="process__n">${pad(i + 1)}</span><h3>${t}</h3><p>${x}</p></li>`).join('')}</ol>
    ${accreditations}
  </div>
</section>

${testimonials}

<section class="sec sec--paper2" aria-labelledby="guide-title">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Guides', title: 'Straight answers before you buy', id: 'guide-title', link: { href: '/guides/', label: 'See all guides' } })}
    <div class="ggrid">${g.map(guideCard).join('')}</div>
  </div>
</section>

<section class="sec" aria-labelledby="faq-title">
  <div class="wrap faqwrap">
    <div>
      ${sectionHead({ eyebrow: 'FAQs', title: 'Common questions', id: 'faq-title' })}
      <p class="lead">Can’t see yours? Ask the assistant in the corner of the screen, or message us on WhatsApp.</p>
      <p>${btn('/faq/', 'Browse all FAQs', { variant: 'ghost', ico: 'circle-help' })}</p>
    </div>
    ${faqList(faqs, { open: 0 })}
  </div>
</section>

${ctaBand(site)}`;

  return {
    path: '/',
    title: `${site.brand.name} | uPVC Windows, Doors & Repairs`,
    description: site.brand.seoDescription || site.brand.description,
    nav: 'home',
    bodyClass: 'is-home',
    schema: [faqSchema(site, '/', faqs)],
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
${pageHero({ eyebrow: `${list.length} styles · made to measure`, title: c.title, lead: c.lead, trail, actions: btn('/quote/', 'Get my free quote', { ico: 'square-pen' }) + btn(waLink(site, `Hi ${site.brand.short}, I’m interested in new ${cat}.`), 'Ask on WhatsApp', { variant: 'wa', ico: 'whatsapp', external: true }) })}
<section class="sec sec--tight" aria-labelledby="range-title">
  <div class="wrap">
    <h2 class="sr" id="range-title">All ${c.name.toLowerCase()}</h2>
    <div class="pgrid ${cat === 'windows' ? 'pgrid--4' : 'pgrid--3'}">${list.map(productCard).join('')}${cat === 'windows' ? helpCard(site) : ''}</div>
  </div>
</section>
<section class="sec sec--paper2">
  <div class="wrap two-col">
    <div>
      ${sectionHead({ eyebrow: 'As standard', title: cat === 'windows' ? 'What every window includes' : 'What every door includes' })}
    </div>
    <ul class="checklist">
      ${(cat === 'windows'
        ? ['Made to measure from a final technical survey', 'Part L: a U-value of 1.4&nbsp;W/m²K or better, or WER band B or above', 'Trickle vents wherever the old windows had them (Part F)', 'Safety glass where Part K requires it, such as glazing within 800&nbsp;mm of the floor', 'Escape openings where Part B requires them, such as first-floor bedrooms', 'Multipoint locks and key-locking handles', 'Building Regulations certificate on completion']
        : ['Multipoint locking along the full height of the door', 'Anti-snap cylinders rated TS&nbsp;007 3-star or SS&nbsp;312 Diamond', 'Toughened or laminated safety glass', 'Part L: a U-value of 1.4&nbsp;W/m²K or better, or DSER band B (band C if more than 60%&nbsp;glazed)', 'Low thresholds available', 'PAS&nbsp;24 and Secured by Design options available', 'Building Regulations certificate on completion']
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
    pageType: 'CollectionPage',
    nav: cat,
    schema: [breadcrumbSchema(site, trail)],
    body,
  };
}

export function product(site, d, p) {
  const c = d.categories[p.category];
  const trail = [{ name: 'Home', href: '/' }, { name: c.name, href: `/${p.category}/` }, { name: p.name, href: `/${p.category}/${p.slug}/` }];
  const related = p.related.map((s) => d.products.find((x) => x.slug === s)).filter(Boolean);
  const wa = `Hi ${site.brand.short}, I’d like a quote for ${lc(p.name)}.`;
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
          ${btn(`/quote/?item=${p.slug}`, 'Start my quote', { ico: 'square-pen' })}
          ${btn(waLink(site, wa), 'Ask on WhatsApp', { variant: 'wa', ico: 'whatsapp', external: true })}
        </div>
      </div>
      <figure class="prod__fig sheet">
        <div class="sheet__bar"><span>${p.name}</span><span>Elevation · NTS</span></div>
        ${productDrawing(p.slug)}
        <figcaption>Viewed from outside. Dashed lines meet at the hinge side, as on an architect’s window schedule.</figcaption>
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
    ${sectionHead({ eyebrow: 'Features', title: `Why choose ${lc(p.name)}` })}
    <div class="fgrid">${p.features.map(([t, x], i) => `<div class="feat"><span class="idx">${pad(i + 1)}</span><h3>${t}</h3><p>${x}</p></div>`).join('')}</div>
  </div>
</section>

<section class="sec">
  <div class="wrap two-col">
    <div>${sectionHead({ eyebrow: 'Specification', title: 'At a glance' })}<p class="fineprint">Exact figures depend on the system and options you choose. We confirm them on your written quote.</p></div>
    <table class="spec-table"><tbody>${p.specs.map(([k, v]) => `<tr><th scope="row">${k}</th><td>${v}</td></tr>`).join('')}</tbody></table>
  </div>
</section>

<section class="sec sec--paper2">
  <div class="wrap faqwrap">
    <div>${sectionHead({ eyebrow: 'Questions', title: `About ${lc(p.name)}` })}</div>
    ${faqList(p.faqs, { open: 0 })}
  </div>
</section>

<section class="sec">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Compare', title: 'Similar styles' })}
    <div class="pgrid pgrid--3 pgrid--rel">${related.map(productCard).join('')}</div>
  </div>
</section>
${ctaBand(site, { title: `Get a price for ${lc(p.name)}.`, waText: wa })}`;
  return {
    path: `/${p.category}/${p.slug}/`,
    title: `${p.name}: made to measure & fitted`,
    description: p.metaDescription,
    nav: p.category,
    schema: [
      breadcrumbSchema(site, trail),
      serviceSchema(site, `/${p.category}/${p.slug}/`, { name: p.name, serviceType: `${p.name} supply and installation`, description: plain(p.lead), category: p.category === 'windows' ? 'Windows' : 'Doors' }),
      p.faqs?.length ? faqSchema(site, `/${p.category}/${p.slug}/`, p.faqs) : null,
    ].filter(Boolean),
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
  title: 'Fix the fault, keep the window',
  lead: 'Misted glass, broken locks, dropped doors, worn hinges, draughts and sticking patio doors. We repair uPVC windows and doors whoever installed them, and we’ll tell you straight if a repair isn’t worth doing.',
  trail,
  actions: btn(waLink(site, `Hi ${site.brand.short}, I need a repair. Photos attached:`), 'Send photos on WhatsApp', { variant: 'wa', ico: 'whatsapp', external: true }) + btn('/book/?type=repair', 'Book a repair', { variant: 'ghost', ico: 'calendar-days' }),
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
    ${sectionHead({ eyebrow: 'How a repair works', title: 'Photo first, so we bring the right part.' })}
    <ol class="process process--dark">
      <li><span class="process__n">01</span><h3>Send photos</h3><p>Photograph the problem, plus the lock edge or hinge if that’s where the fault is. WhatsApp is quickest.</p></li>
      <li><span class="process__n">02</span><h3>Diagnosis &amp; price</h3><p>We work out the likely cause and the part needed, and confirm any call-out or repair charge before we book.</p></li>
      <li><span class="process__n">03</span><h3>The visit</h3><p>Most repairs are done in one visit. New sealed units are made to measure, so glass needs a measuring visit first.</p></li>
      <li><span class="process__n">04</span><h3>Guaranteed</h3><p>The parts we fit and our workmanship are guaranteed for ${site.guarantee.repairMonths} months.</p></li>
    </ol>
  </div>
</section>
<section class="sec">
  <div class="wrap two-col">
    <div>${sectionHead({ eyebrow: 'Repair or replace?', title: 'We’ll tell you which makes sense' })}</div>
    <div class="prose">
      <p>A single failed part rarely justifies a new window. If the frame is sound, a new sealed unit, gearbox, hinge or gasket puts it right for a fraction of the cost of replacement.</p>
      <p>Replacement makes more sense when frames are cracked or badly discoloured, several parts are failing at once, parts are no longer made for an old system, or you want a real gain in energy performance. We will tell you which applies to your windows, and why.</p>
    </div>
  </div>
</section>
${ctaBand(site, { title: 'Something not working?', text: 'Send us a photo. We’ll identify the part and give you a price.', waText: `Hi ${site.brand.short}, I need a repair. Photos attached:` })}`;
  return {
    path: '/repairs/',
    title: 'uPVC window & door repairs',
    description: 'uPVC window and door repairs: misted double glazing, locks, handles, hinges, dropped doors, draughts, patio rollers and glass. Send photos on WhatsApp for a price.',
    nav: 'repairs',
    pageType: 'CollectionPage',
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
  eyebrow: 'uPVC repairs',
  title: r.name,
  lead: r.short,
  trail,
  actions: btn(waLink(site, wa), 'Send photos on WhatsApp', { variant: 'wa', ico: 'whatsapp', external: true }) + btn(`/book/?type=repair&repair=${r.slug}`, 'Book a repair', { variant: 'ghost', ico: 'calendar-days' }),
  aside: `<div class="diag-card"><span class="diag-card__ico">${icon(r.icon, { size: 40 })}</span><p class="eyebrow">Typical visit</p><p>${r.visit}</p></div>`,
})}
<section class="sec sec--tight">
  <div class="wrap"><div class="diag">
    <div class="diag__col"><h2 class="h3"><span class="idx">A</span>What you notice</h2>${list(r.symptoms)}</div>
    <div class="diag__col"><h2 class="h3"><span class="idx">B</span>Likely causes</h2>${list(r.causes)}</div>
    <div class="diag__col diag__col--fix"><h2 class="h3"><span class="idx">C</span>How we fix it</h2>${list(r.fix)}</div>
  </div></div>
</section>
<section class="sec sec--paper2">
  <div class="wrap two-col">
    <div>${sectionHead({ eyebrow: 'Before we visit', title: 'Worth knowing' })}</div>
    <div class="tips">${r.tips.map((t) => `<p class="tip">${icon('info', { size: 18 })}<span>${t}</span></p>`).join('')}</div>
  </div>
</section>
<section class="sec">
  <div class="wrap faqwrap">
    <div>${sectionHead({ eyebrow: 'Questions', title: 'Common questions' })}</div>
    ${faqList(r.faqs, { open: 0 })}
  </div>
</section>
<section class="sec sec--paper2">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Other repairs', title: 'We also fix', link: { href: '/repairs/', label: 'See all repairs' } })}
    <div class="rlist">${others.map(repairRow).join('')}</div>
  </div>
</section>
${ctaBand(site, { title: 'Send a photo, get a price.', text: 'A photo of the problem and your postcode on WhatsApp is the quickest way to get a repair booked.', waText: wa })}`;
  return {
    path: `/repairs/${r.slug}/`,
    title: `${r.name} — uPVC repairs`,
    description: r.metaDescription,
    nav: 'repairs',
    schema: [
      breadcrumbSchema(site, trail),
      serviceSchema(site, `/repairs/${r.slug}/`, { name: `${r.name} repair`, serviceType: 'uPVC window and door repair', description: plain(r.short) }),
      r.faqs?.length ? faqSchema(site, `/repairs/${r.slug}/`, r.faqs) : null,
    ].filter(Boolean),
    body,
  };
}

/* =========================================================
   SERVICES
   ========================================================= */
export function servicesHub(site, d) {
  const trail = [{ name: 'Home', href: '/' }, { name: 'Services', href: '/services/' }];
  const body = `
${pageHero({ eyebrow: 'Services', title: 'What we do', lead: 'Supply and installation, free surveys, repairs and servicing for homeowners, landlords and small businesses.', trail })}
<section class="sec sec--tight">
  <div class="wrap"><div class="sgrid">
    ${d.services.map((s, i) => `<a class="scard" href="/services/${s.slug}/"><span class="rcard__top"><span class="rcard__ico">${icon(s.icon, { size: 24 })}</span><span class="idx">${pad(i + 1)}</span></span><h2>${s.name}</h2><p>${s.short}</p><span class="pcard__more">How it works ${icon('arrow-right', { size: 16 })}</span></a>`).join('')}
    <a class="scard scard--dark" href="/repairs/"><span class="rcard__top"><span class="rcard__ico">${icon('wrench', { size: 24 })}</span><span class="idx">${pad(d.services.length + 1)}</span></span><h2>Repairs</h2><p>Misted glass, locks, hinges, handles, draughts and patio doors.</p><span class="pcard__more">See common repairs ${icon('arrow-right', { size: 16 })}</span></a>
    <a class="scard" href="/guarantee/"><span class="rcard__top"><span class="rcard__ico">${icon('badge-check', { size: 24 })}</span><span class="idx">${pad(d.services.length + 2)}</span></span><h2>Guarantees &amp; aftercare</h2><p>How long each guarantee lasts, what it covers and how to claim.</p><span class="pcard__more">Guarantee details ${icon('arrow-right', { size: 16 })}</span></a>
  </div></div>
</section>
${ctaBand(site)}`;
  return { path: '/services/', title: 'Services', description: 'uPVC window and door services: supply and installation, free surveys, repairs, servicing and maintenance, and work for landlords and businesses.', nav: 'services', pageType: 'CollectionPage', schema: [breadcrumbSchema(site, trail)], body };
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
  actions: btn(isSurvey ? '/book/?type=survey' : '/quote/', isSurvey ? 'Book a free survey' : 'Get my free quote', { ico: isSurvey ? 'calendar-days' : 'square-pen' }) + btn(waLink(site, `Hi ${site.brand.short}, I’m enquiring about ${s.name.toLowerCase()}.`), 'Ask on WhatsApp', { variant: 'wa', ico: 'whatsapp', external: true }),
  aside: `<div class="side-card side-card--brass"><h2 class="h4">What’s included</h2><ul class="checklist checklist--sm">${s.includes.map((x) => `<li>${icon('check', { size: 16 })}${x}</li>`).join('')}</ul></div>`,
})}
<section class="sec sec--tight">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'Step by step', title: 'How it works' })}
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
    schema: [breadcrumbSchema(site, trail), serviceSchema(site, `/services/${s.slug}/`, { name: s.name, description: s.metaDescription })],
    body,
  };
}

function installPrep() {
  return `<section class="sec sec--paper2">
  <div class="wrap two-col">
    <div>${sectionHead({ eyebrow: 'Before fitting day', title: 'How to get ready' })}</div>
    <ul class="checklist">
      <li>${icon('check', { size: 18 })}Take down curtains, blinds and poles near the windows being replaced.</li>
      <li>${icon('check', { size: 18 })}Move furniture and ornaments about a metre back from the windows.</li>
      <li>${icon('check', { size: 18 })}Clear a path from the front door and leave space outside for the frames.</li>
      <li>${icon('check', { size: 18 })}Tell us about any alarm sensors on the existing frames.</li>
      <li>${icon('check', { size: 18 })}Keep children and pets out of the rooms we’re working in.</li>
      <li>${icon('check', { size: 18 })}Let neighbours know if we’ll need shared access or parking.</li>
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
  const swatches = d.colours
    .map((c, i) => {
      const name = c.name.split(' · ')[0];
      return `<label class="sw" title="${name}"><input type="radio" name="cfg-colour" value="${name}"${i === 0 ? ' checked' : ''}><span class="sw__chip" style="--sw:${c.hex}"></span><span class="sw__name">${name}</span></label>`;
    })
    .join('');
  const rooms = ['Living room', 'Kitchen', 'Dining room', 'Bedroom 1', 'Bedroom 2', 'Bedroom 3', 'Bathroom', 'Hallway', 'Landing', 'Front door', 'Back door', 'Garden / patio', 'Conservatory', 'Utility room', 'Office'];
  const body = `
${pageHero({ eyebrow: 'Free quote · no obligation', title: 'Build your quote', lead: 'Pick a window or door, type the width and height onto the drawing, choose the details and add it to your list. When the list is done, send it to us on WhatsApp as one numbered schedule. We reply with an estimate, then confirm a fixed price after a free survey.', trail })}
<section class="sec sec--tight">
  <div class="wrap">
    <div class="cfg-head">
      <h2 class="h3"><span class="idx">01</span>Add your windows &amp; doors</h2>
      <p class="hint">Measure the existing frame in millimetres. Not sure of a size? Leave it blank and add a note, or read <a href="/guides/how-to-measure-windows-for-a-quote/">how to measure</a>.</p>
    </div>
    <div class="cfg" id="cfg" data-editing="">
      <div class="cfg__stage">
        <div class="cfg__badge"><span id="cfg-ref">W1</span><span id="cfg-mode">New item</span></div>
        <div class="cfg__draw" id="cfg-draw">
          <div class="dim dim--w"><label class="dim__in"><span class="sr">Width in millimetres</span><input id="cfg-w" type="number" inputmode="numeric" min="200" max="8000" step="1" placeholder="1200" autocomplete="off"><span class="dim__unit">mm</span></label></div>
          <div class="cfg__fig" id="cfg-fig" aria-live="polite"></div>
          <div class="dim dim--h"><label class="dim__in"><span class="sr">Height in millimetres</span><input id="cfg-h" type="number" inputmode="numeric" min="200" max="4000" step="1" placeholder="1250" autocomplete="off"><span class="dim__unit">mm</span></label></div>
        </div>
        <p class="cfg__note" id="cfg-note">Drawing updates as you type · viewed from outside · dashed lines meet at the hinge side</p>
      </div>
      <div class="cfg__fields">
        <div class="grid-6">
          <label class="f f--span6"><span>Window or door</span>
            <select id="cfg-type">
              <optgroup label="Windows">${opts('windows')}</optgroup>
              <optgroup label="Doors">${opts('doors')}</optgroup>
              <optgroup label="Other"><option value="sealed-unit">Replacement glass / sealed unit</option><option value="other">Other / not sure</option></optgroup>
            </select></label>
          <label class="f f--span4"><span>Room or location <em>(optional)</em></span><input id="cfg-room" type="text" list="cfg-rooms" maxlength="40" placeholder="e.g. Bedroom 1"><datalist id="cfg-rooms">${rooms.map((r) => `<option value="${r}"></option>`).join('')}</datalist></label>
          <div class="f f--span2"><span id="cfg-qty-l">Quantity</span>
            <div class="stepper" role="group" aria-labelledby="cfg-qty-l"><button type="button" data-step="-1" aria-label="Decrease quantity">${icon('minus', { size: 16 })}</button><input id="cfg-qty" type="number" inputmode="numeric" min="1" max="50" value="1" aria-labelledby="cfg-qty-l"><button type="button" data-step="1" aria-label="Increase quantity">${icon('plus', { size: 16 })}</button></div>
          </div>
          <label class="f f--span3" id="cfg-hinge-f"><span id="cfg-hinge-l">Opening side</span><select id="cfg-hinge"><option value="left">Hinged left</option><option value="right">Hinged right</option><option value="">Not sure / as existing</option></select></label>
          <label class="f f--span3"><span>Glazing</span><select id="cfg-glaze"><option>Double glazed</option><option>Triple glazed</option><option>Not sure</option></select></label>
          <label class="f f--span3"><span>Glass</span><select id="cfg-glass"><option>Clear</option><option>Obscure (privacy)</option><option>Acoustic</option><option>Toughened / laminated</option><option>Not sure</option></select></label>
          <label class="f f--span3"><span>Trickle vents</span><select id="cfg-vents"><option>As existing</option><option>Yes</option><option>No</option><option>Not sure</option></select></label>
          <fieldset class="f f--span6 swatches-f"><legend>Colour <span id="cfg-colour-name">White</span></legend><div class="sw-row">${swatches}<label class="sw" title="Other / not sure"><input type="radio" name="cfg-colour" value="Other / not sure"><span class="sw__chip sw__chip--other">?</span><span class="sw__name">Other</span></label></div></fieldset>
          <label class="f f--span6"><span>Notes for this item <em>(optional)</em></span><input id="cfg-note-in" type="text" maxlength="160" placeholder="e.g. first floor, escape hinges, Georgian bars"></label>
        </div>
        <div class="cfg__actions">
          <button type="button" class="btn btn--primary btn--lg" id="cfg-add">${icon('plus', { size: 18 })}<span>Add to list</span></button>
          <button type="button" class="btn btn--ghost btn--lg" id="cfg-cancel" hidden><span>Cancel editing</span></button>
          <p class="cfg__msg" id="cfg-msg" role="status" aria-live="polite"></p>
        </div>
      </div>
    </div>

    <div class="qlist" id="qlist">
      <div class="qlist__head">
        <h2 class="h3">Your schedule <span class="qlist__count" id="ql-count">0 items</span></h2>
        <dl class="qlist__totals"><div><dt>Units</dt><dd id="qs-units">0</dd></div><div><dt>Total area</dt><dd id="qs-area">—</dd></div></dl>
      </div>
      <ol class="qlist__items" id="ql-items" aria-live="polite"></ol>
      <div class="qlist__empty" id="ql-empty">
        ${icon('layers', { size: 28 })}
        <p><strong>Your list is empty.</strong> Set up a window or door above and press <em>Add to list</em>. Do the same for each one. You can edit, duplicate or remove items at any time.</p>
      </div>
      <div class="qlist__next" id="ql-next" hidden>
        <p><strong id="ql-next-sum">1 item</strong><span>Finished adding? Next, tell us about the job and where to send the quote.</span></p>
        <button type="button" class="btn btn--primary btn--lg" id="ql-continue" aria-controls="qd-body">${icon('send', { size: 18 })}<span>Send for quote</span></button>
      </div>
    </div>
  </div>
</section>

<section class="sec sec--paper2 qdetails" id="quote-details">
  <div class="wrap">
    <button type="button" class="qdetails__toggle" id="qd-toggle" aria-expanded="true" aria-controls="qd-body">
      <span class="qdetails__step"><span class="idx">02</span><span><strong>Job details &amp; your contact details</strong><small id="qd-hint">Then send your schedule to us on WhatsApp or by email</small></span></span>
      ${icon('chevron-down', { size: 22, cls: 'qdetails__chev' })}
    </button>
  </div>
  <div class="qdetails__body" id="qd-body">
  <div class="wrap qb">
    <form class="qb__form" id="quote-form" method="post" novalidate data-form="quote">
      <fieldset class="fs">
        <legend><span class="idx">02</span>About the job</legend>
        <div class="grid-6">
          <label class="f f--span3"><span>Property type</span><select name="property"><option>House</option><option>Bungalow</option><option>Flat / maisonette</option><option>Commercial</option></select></label>
          <label class="f f--span3"><span>When do you want to start?</span><select name="timeframe"><option>As soon as possible</option><option>Within 1–3 months</option><option>3–6 months</option><option>Just researching</option></select></label>
          <label class="f f--span6"><span>Anything we should know? <em>(optional)</em></span><textarea name="message" rows="3" maxlength="1000" placeholder="Listed building, conservation area, parking or access, a style you like…"></textarea></label>
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
        <button type="button" class="btn btn--ghost btn--lg" id="qb-sheet">${icon('file-text', { size: 20 })}<span>Save PDF only</span></button>
      </div>
      <div class="sendbox" id="qb-sendbox" hidden role="status" aria-live="polite">
        <p class="sendbox__ok">${icon('circle-check', { size: 22 })}<span><strong>Your quote PDF is ready</strong><span data-sb-pages></span></span></p>
        <ol class="sendbox__steps">
          <li><span class="sendbox__n">1</span><span><strong>Saved:</strong> <code data-sb-file></code> <button type="button" class="sendbox__link" data-sb-again>Save again</button></span></li>
          <li><span class="sendbox__n">2</span><span data-sb-how></span></li>
        </ol>
        <div class="sendbox__actions">
          <a class="btn btn--wa btn--lg" data-sb-open href="#">${brandIcon('whatsapp', { size: 20 })}<span>Open WhatsApp chat</span></a>
          <button type="button" class="btn btn--ghost btn--lg" data-sb-share hidden>${icon('send', { size: 18 })}<span>Share PDF</span></button>
        </div>
      </div>
      <p class="hint qb__after">We create a PDF of your list — one page per window or door, with its drawing and details — and save it to your device. You then attach it in the WhatsApp chat with us, with a photo of each window if you can.</p>
      <noscript><p class="form-msg">This form needs JavaScript. Please call ${telText(site)} or message us on WhatsApp instead.</p></noscript>
    </form>

    <aside class="qb__aside" aria-label="What happens next">
      <div class="side-card">
        <h2 class="h4">What happens next</h2>
        <ol class="numlist">
          <li>We reply with an estimate based on your list and photos.</li>
          <li>If the estimate suits you, we book a free survey to measure and check the details.</li>
          <li>You get a fixed, itemised written quote. Take as long as you need to decide.</li>
        </ol>
        <p class="side-card__tip">${icon('camera', { size: 18 })}<span>An outside photo of each window makes the estimate far more accurate.</span></p>
      </div>
      <div class="side-card side-card--dark">
        <h2 class="h4">Prefer to talk?</h2>
        <a class="big-phone" href="tel:${site.contact.phoneInternational}">${icon('phone', { size: 22 })}${telText(site)}</a>
        <p class="fineprint">${site.hours.filter((h) => h.open).map((h) => `${h.short} ${hoursText(h)}`).join(' · ')}</p>
      </div>
    </aside>
  </div>
  </div>
</section>`;
  return {
    path: '/quote/',
    title: 'Get a free quote',
    description: 'Build a free, no-obligation quote for uPVC windows and doors. Draw each window to size, add it to your schedule and send it to us on WhatsApp for an estimate.',
    nav: 'quote',
    scripts: ['draw', 'forms'],
    schema: [breadcrumbSchema(site, trail)],
    body,
  };
}

export function book(site, d) {
  const trail = [{ name: 'Home', href: '/' }, { name: 'Book', href: '/book/' }];
  const body = `
${pageHero({ eyebrow: 'Book online', title: 'Book a survey or repair', lead: 'Tell us what you need and when suits you. This form sends a request. We confirm the appointment by WhatsApp or phone.', trail })}
<section class="sec sec--tight">
  <div class="wrap qb">
    <form class="qb__form" id="book-form" method="post" novalidate data-form="book">
      <fieldset class="fs">
        <legend><span class="idx">01</span>What do you need?</legend>
        <div class="choice-grid" role="radiogroup">
          <label class="choice"><input type="radio" name="type" value="survey" checked><span>${icon('ruler', { size: 22 })}<strong>Free survey</strong><small>Measure and quote for new windows or doors</small></span></label>
          <label class="choice"><input type="radio" name="type" value="repair"><span>${icon('wrench', { size: 22 })}<strong>Repair visit</strong><small>Fix a fault on an existing window or door</small></span></label>
          <label class="choice"><input type="radio" name="type" value="service"><span>${icon('clipboard-check', { size: 22 })}<strong>Servicing</strong><small>Adjust, lubricate and check the hardware</small></span></label>
          <label class="choice"><input type="radio" name="type" value="other"><span>${icon('circle-help', { size: 22 })}<strong>Something else</strong><small>Landlord, business or general enquiry</small></span></label>
        </div>
        <div class="grid-6 mt">
          <label class="f f--span3" data-show-for="repair"><span>Type of repair</span><select name="repair"><option value="">Not sure</option>${d.repairs.map((r) => `<option value="${r.slug}">${r.name}</option>`).join('')}</select></label>
          <label class="f f--span3"><span>How many windows or doors?</span><select name="count"><option>1</option><option>2–3</option><option>4–6</option><option>7–10</option><option>More than 10</option><option>Not sure</option></select></label>
          <label class="f f--span6"><span>Briefly describe the job</span><textarea name="message" rows="3" maxlength="1000" placeholder="e.g. replace six white casements and a back door, or back door won’t lock"></textarea></label>
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
        <legend><span class="idx">03</span>Your details</legend>
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
        <button type="submit" class="btn btn--wa btn--lg" data-send="whatsapp">${brandIcon('whatsapp', { size: 20 })}<span>Request visit on WhatsApp</span></button>
        <button type="submit" class="btn btn--ghost btn--lg" data-send="email">${icon('mail', { size: 20 })}<span>Request visit by email</span></button>
      </div>
      <noscript><p class="form-msg">This form needs JavaScript. Please call ${telText(site)} or message us on WhatsApp instead.</p></noscript>
    </form>
    <aside class="qb__aside" aria-label="Summary and help">
      <div class="side-card">
        <h2 class="h4">Opening hours</h2>
        <table class="hours"><tbody>${site.hours.map((h) => `<tr><th scope="row">${h.days}</th><td>${hoursText(h)}</td></tr>`).join('')}</tbody></table>
        <p class="openstate" data-openstate></p>
      </div>
      <div class="side-card">
        <h2 class="h4">For repairs</h2>
        <p>After sending, add photos of the problem to the same WhatsApp chat. Include the lock edge or hinge if that’s where the fault is. It helps us bring the right parts.</p>
      </div>
      <div class="side-card side-card--dark">
        <h2 class="h4">Urgent?</h2>
        <p>If glass is broken or a door won’t lock, call us rather than booking online.</p>
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
    ['Survey before price', 'We don’t give a final price over the phone. We measure, check the structure, then put a fixed price in writing.'],
    ['Itemised quotes', 'Every window and door is listed with its size, style, glass, colour and hardware, so you can compare quotes line by line.'],
    ['No pressure', 'No today-only discounts and no salesperson who won’t leave. Take as long as you need to decide.'],
    ['Regulations handled', 'We check energy, ventilation, safety glass and escape requirements at survey, and the work is certified on completion.'],
    ['Respect for your home', 'Dust sheets down, floors covered, a tidy-up at the end of each day and the old frames taken away.'],
    ['Aftercare', 'If something isn’t right after we’ve gone, message us. We come back and fix it.'],
  ];
  const body = `
${pageHero({ eyebrow: 'About us', title: `About ${esc(site.brand.name)}`, lead: `We supply, fit and repair uPVC and composite windows and doors. We work in your home the way we’d want someone to work in ours.`, trail })}
<section class="sec sec--tight">
  <div class="wrap two-col">
    <div>${sectionHead({ eyebrow: 'Who we are', title: 'Windows and doors only' })}</div>
    <div class="prose">
      <p>${esc(site.brand.name)} is a specialist window and door company. We work with uPVC and composite products because those are the systems, hardware and faults we know well, from a 1990s casement with a worn friction hinge to a new A-rated flush sash in anthracite grey.</p>
      <p>That focus means we can often tell from a photo what is wrong with a window or door. We recommend the product that suits the opening rather than the one with the biggest margin, and we fit it to the standard the Building Regulations set.</p>
      <p>Some jobs are a full house of windows. Some are a back door that won’t lock. Either way, you deal with people who know the products and who still answer the phone once the job is done.</p>
    </div>
  </div>
</section>
<section class="sec sec--paper2">
  <div class="wrap">
    ${sectionHead({ eyebrow: 'How we work', title: 'What you can expect' })}
    <div class="fgrid fgrid--3">${principles.map(([t, x], i) => `<div class="feat"><span class="idx">${pad(i + 1)}</span><h3>${t}</h3><p>${x}</p></div>`).join('')}</div>
  </div>
</section>
${site.accreditations.length ? `<section class="sec"><div class="wrap">${sectionHead({ eyebrow: 'Accreditations', title: 'Registered & accredited' })}<ul class="tags tags--lg">${site.accreditations.map((a) => `<li>${esc(a.name)}</li>`).join('')}</ul></div></section>` : ''}
${ctaBand(site)}`;
  return { path: '/about/', title: 'About us', description: `About ${site.brand.name}: specialist uPVC window and door supply, installation and repairs. How we work and what you can expect.`, nav: 'about', pageType: 'AboutPage', schema: [breadcrumbSchema(site, trail)], body };
}

export function guarantee(site, d) {
  const trail = [{ name: 'Home', href: '/' }, { name: 'Guarantees', href: '/guarantee/' }];
  const g = site.guarantee;
  const body = `
${pageHero({ eyebrow: 'Aftercare', title: 'Guarantees & aftercare', lead: 'What is covered, for how long, and how to make a claim. Your guarantee certificate sets out the full terms for your installation.', trail })}
<section class="sec sec--tight">
  <div class="wrap"><div class="gcards">
    <div class="gbig"><span class="gbig__n">${g.installationYears}<small>years</small></span><h2 class="h3">Installation guarantee</h2><p>New windows and doors supplied and fitted by us are guaranteed against defects in manufacture and workmanship for ${g.installationYears} years from completion${g.insuranceBacked ? '. The guarantee is insurance-backed, so you remain protected even if we cease trading' : ''}.</p></div>
    <div class="gbig"><span class="gbig__n">${g.repairMonths}<small>months</small></span><h2 class="h3">Repair guarantee</h2><p>Parts we supply and fit during a repair, and our workmanship on that repair, are guaranteed for ${g.repairMonths} months.</p></div>
  </div></div>
</section>
<section class="sec sec--paper2">
  <div class="wrap two-col">
    <div>${sectionHead({ eyebrow: 'Covered', title: 'What the guarantee covers' })}
      <ul class="checklist">
        <li>${icon('check', { size: 18 })}Frames and sashes that warp, crack or discolour abnormally</li>
        <li>${icon('check', { size: 18 })}Sealed units that mist between the panes</li>
        <li>${icon('check', { size: 18 })}Locks, hinges and handles that fail in normal use</li>
        <li>${icon('check', { size: 18 })}Faults caused by our installation workmanship</li>
      </ul>
    </div>
    <div>${sectionHead({ eyebrow: 'Not covered', title: 'What it doesn’t cover' })}
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
      <li>Send photos or a short video if you can. It helps us bring the right part.</li>
      <li>We arrange a visit to inspect and, where covered, put it right at no cost to you.</li>
    </ol>
  </div>
</section>
<section class="sec sec--paper2">
  <div class="wrap two-col">
    <div>${sectionHead({ eyebrow: 'Keep it valid', title: 'Basic maintenance' })}</div>
    <div class="prose"><p>Clean the frames a few times a year, keep the drainage slots clear, and lubricate hinges and locking points once or twice a year. Our <a href="/guides/how-to-maintain-upvc-windows-and-doors/">care guide</a> explains exactly what to do.</p><p>Your statutory rights as a consumer are not affected by our guarantee.</p></div>
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
${pageHero({ eyebrow: 'Contact', title: 'Talk to us', lead: 'WhatsApp is usually quickest, especially if you can send photos. You can also call, email or use the form below.', trail })}
<section class="sec sec--tight">
  <div class="wrap"><div class="ccards">
    <a class="ccard ccard--wa" href="${waLink(site, `Hi ${site.brand.short}, `)}" target="_blank" rel="noopener">${brandIcon('whatsapp', { size: 28 })}<span class="eyebrow">WhatsApp</span><strong>${telText(site)}</strong><span>Messages, photos and quotes</span></a>
    <a class="ccard" href="tel:${site.contact.phoneInternational}">${icon('phone', { size: 28 })}<span class="eyebrow">Call</span><strong>${telText(site)}</strong><span data-openstate>During&nbsp;opening&nbsp;hours</span></a>
    <a class="ccard" href="mailto:${site.contact.email}">${icon('mail', { size: 28 })}<span class="eyebrow">Email</span><strong class="break">${site.contact.email}</strong><span>Best for documents and longer questions</span></a>
    ${addr.length ? `<div class="ccard">${icon('map-pin', { size: 28 })}<span class="eyebrow">Address</span><strong>${addr.map(esc).join('<br>')}</strong></div>` : ''}
  </div></div>
</section>
<section class="sec sec--paper2">
  <div class="wrap qb">
    <form class="qb__form" id="contact-form" method="post" novalidate data-form="contact">
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
          ? `<div class="side-card"><h2 class="h4">Do we cover your area?</h2><form class="pc-check" data-prefixes="${esc(site.postcodePrefixes.join(','))}"><label class="f"><span>Your postcode</span><input type="text" name="pc" class="upper" maxlength="8" autocomplete="postal-code"></label><button class="btn btn--primary" type="submit">Check postcode</button><p class="pc-check__out" aria-live="polite"></p></form></div>`
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
  return { path: '/contact/', title: 'Contact us', description: `Contact ${site.brand.name}: WhatsApp or call ${site.contact.phoneDisplay}, email ${site.contact.email}. Quotes, repairs and surveys for uPVC windows and doors.`, nav: 'contact', pageType: 'ContactPage', scripts: ['forms'], schema: [breadcrumbSchema(site, trail)], body };
}

/* =========================================================
   FAQ + GUIDES
   ========================================================= */
export function faqPage(site, d) {
  const trail = [{ name: 'Home', href: '/' }, { name: 'FAQs', href: '/faq/' }];
  const body = `
${pageHero({ eyebrow: 'Help centre', title: 'Frequently asked questions', lead: 'Plain answers about prices, surveys, Building Regulations, repairs and guarantees.', trail })}
<section class="sec sec--tight">
  <div class="wrap faqpage">
    <aside class="faqpage__nav" aria-label="Search and topics">
      <label class="search"><span class="sr">Search FAQs</span>${icon('search', { size: 18 })}<input type="search" id="faq-search" placeholder="Search questions…" autocomplete="off"></label>
      <nav aria-label="FAQ topics"><ul>${d.faqs.map((g) => `<li><a href="#${g.id}">${g.title}</a></li>`).join('')}</ul></nav>
    </aside>
    <div class="faqpage__main">
      ${d.faqs.map((g) => `<section class="faqgroup" id="${g.id}" aria-labelledby="h-${g.id}"><h2 class="h3" id="h-${g.id}">${g.title}</h2>${faqList(g.items)}</section>`).join('')}
      <p class="faq-empty" hidden>No questions match that search. Try other words, or <a href="/contact/">ask us directly</a>.</p>
    </div>
  </div>
</section>
${ctaBand(site, { title: 'Still have a question?', text: 'Message us on WhatsApp. We reply in person during opening hours.' })}`;
  return {
    path: '/faq/',
    title: 'FAQs',
    description: 'Answers to common questions about uPVC windows and doors: prices, surveys, installation, Building Regulations, FENSA, planning, repairs and guarantees.',
    nav: 'faq',
    scripts: ['faq'],
    schema: [
      breadcrumbSchema(site, trail),
      { ...faqSchema(site, '/faq/', d.allFaqs), mainOfPage: true },
    ],
    body,
  };
}

export function guidesHub(site, d) {
  const trail = [{ name: 'Home', href: '/' }, { name: 'Guides', href: '/guides/' }];
  const body = `
${pageHero({ eyebrow: 'Guides & advice', title: 'Know what you’re buying', lead: 'Plain-English guides to energy ratings, Building Regulations, repairs and maintenance. Worth a read before you compare quotes.', trail })}
<section class="sec sec--tight"><div class="wrap"><div class="ggrid ggrid--all">${d.guides.map(guideCard).join('')}</div></div></section>
${ctaBand(site)}`;
  return { path: '/guides/', title: 'Guides & advice', description: 'Guides to uPVC windows and doors: energy ratings, Building Regulations, misted glass, maintenance, measuring and choosing a front door.', nav: 'guides', pageType: 'CollectionPage', schema: [breadcrumbSchema(site, trail)], body };
}

export function guide(site, d, gd) {
  const updated = gd.updated && gd.updated > gd.date ? gd.updated : gd.date;
  const path = `/guides/${gd.slug}/`;
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
      <p class="article-meta">${updated !== gd.date ? `Updated <time datetime="${updated}">${fmtDate(updated)}</time> · ` : `<time datetime="${gd.date}">${fmtDate(gd.date)}</time> · `}${gd.read} read · By the <a href="/about/">${esc(site.brand.name)}</a> team</p>
    </div>
  </header>
  <div class="sec sec--tight"><div class="wrap wrap--text prose prose--article">${gd.body}</div></div>
</article>
<section class="sec sec--paper2"><div class="wrap">${sectionHead({ eyebrow: 'Keep reading', title: 'More guides', link: { href: '/guides/', label: 'See all guides' } })}<div class="ggrid">${more.map(guideCard).join('')}</div></div></section>
${ctaBand(site)}`;
  return {
    path: `/guides/${gd.slug}/`,
    title: gd.title,
    description: gd.metaDescription,
    nav: 'guides',
    ogType: 'article',
    schema: [
      breadcrumbSchema(site, trail),
      {
        '@type': 'Article',
        '@id': `${site.url}${path}#article`,
        mainOfPage: true,
        headline: gd.title,
        description: gd.metaDescription,
        abstract: plain(gd.summary),
        articleSection: gd.tag,
        datePublished: gd.date,
        dateModified: updated,
        inLanguage: 'en-GB',
        image: `${site.url}/assets/img/og-image.png`,
        author: { '@type': 'Organization', '@id': `${site.url}/#business`, name: site.brand.name, url: `${site.url}/about/` },
        publisher: { '@id': `${site.url}/#business` },
        isPartOf: { '@id': `${site.url}${path}#webpage` },
      },
    ],
    article: { published: gd.date, modified: updated },
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
<p>When you press a button to send a form or a chat message on WhatsApp, the website opens a WhatsApp link (wa.me) that contains your message. WhatsApp (part of Meta) receives the text of that link when it opens, under its own terms and privacy policy. Your message reaches us only when you press send in WhatsApp, and messages sent in the WhatsApp app are end-to-end encrypted. Similarly, the buttons to send by email open your own email app, and the message is sent by your email provider.</p>
${site.forms.endpoint ? `<p>When you press a send button, a copy of the form is also sent straight away to our form-processing provider${site.forms.provider ? ` (${esc(site.forms.provider)})` : ''}, which emails it to us. This happens whether or not you then send the WhatsApp or email message.</p>` : ''}

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
<p>Cookies are small files that websites store on your device. Your browser’s local and session storage work in much the same way. This page explains what this website uses.</p>
<h2>What we use</h2>
<table class="compare"><thead><tr><th scope="col">Name</th><th scope="col">Type</th><th scope="col">Purpose</th><th scope="col">Duration</th></tr></thead><tbody>
<tr><td><code>vx-chat</code></td><td>Session storage (strictly necessary)</td><td>Keeps your conversation with the website assistant while you move between pages</td><td>Until you close the tab</td></tr>
<tr><td><code>vx-quote</code></td><td>Session storage (strictly necessary)</td><td>Keeps the items you’ve added to the quote builder if you navigate away</td><td>Until you close the tab</td></tr>
<tr><td><code>vx-quote-ref</code></td><td>Session storage (strictly necessary)</td><td>Keeps the reference number of your quote request the same while you build it</td><td>Until you close the tab</td></tr>
<tr><td><code>vx-intro</code></td><td>Session storage (strictly necessary)</td><td>Remembers that the opening logo animation has already played, so it does not repeat on every page</td><td>Until you close the tab</td></tr>
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
  return legalShell(site, { path: '/cookies/', title: 'Cookie policy', lead: 'No tracking and no advertising cookies. This page lists what we do store, and why.', html, description: `Cookie policy for ${site.brand.name}. No analytics or advertising cookies — only strictly necessary storage for the website assistant and quote builder.` });
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
<li>Products are made to measure from our final survey. Please tell us about anything that could affect the work, such as alarm sensors, known structural issues or planning restrictions on your property.</li>
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
  return legalShell(site, { path: '/accessibility/', title: 'Accessibility', lead: 'How we make this website accessible, and how to get help if something doesn’t work for you.', html, description: `Accessibility statement for the ${site.brand.name} website.` });
}

export function notFound(site, d) {
  const body = `
<section class="phero phero--404">
  <div class="wrap">
    <p class="eyebrow">Error 404</p>
    <h1 class="display">This page has been <em>taken out</em>, like an old window.</h1>
    <p class="phero__lead">The page you wanted doesn’t exist or has moved. Try one of these instead.</p>
    <div class="phero__actions">
      ${btn('/', 'Back to home', { ico: 'house' })}
      ${btn('/windows/', 'See windows', { variant: 'ghost' })}
      ${btn('/doors/', 'See doors', { variant: 'ghost' })}
      ${btn('/repairs/', 'Repairs', { variant: 'ghost' })}
      ${btn('/contact/', 'Contact us', { variant: 'ghost' })}
    </div>
  </div>
</section>`;
  return { path: '/404.html', title: 'Page not found', description: 'Page not found.', noindex: true, body };
}
