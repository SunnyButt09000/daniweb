// Static site build — no dependencies. Run: node build.mjs
// Output goes to ./dist, which is what the host (Cloudflare Pages) publishes.

import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { products, categories, colours } from './src/content/products.mjs';
import { repairs, services } from './src/content/repairs.mjs';
import { faqGroups, allFaqs } from './src/content/faqs.mjs';
import { guides } from './src/content/guides.mjs';
import { documentShell } from './lib/layout.mjs';
import * as P from './lib/pages.mjs';

const root = dirname(fileURLToPath(import.meta.url));
// VX_OUT lets a second build run side by side (e.g. previews) without touching ./dist
const out = process.env.VX_OUT ? resolve(process.env.VX_OUT) : join(root, 'dist');
const site = JSON.parse(readFileSync(join(root, 'src/data/site.json'), 'utf8'));
site.url = site.url.replace(/\/$/, '');
// quote PDF upload (Google Apps Script web app): only accept a real Apps Script /exec URL
site.quoteUpload = site.quoteUpload || {};
const qu = String(site.quoteUpload.endpoint || '').trim();
site.quoteUpload.endpoint = /^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(qu) ? qu : '';
if (qu && !site.quoteUpload.endpoint) console.warn('Note: quoteUpload.endpoint in site.json is not a Google Apps Script /exec URL, so it is ignored.');
site.quoteUpload.keepDays = Number(site.quoteUpload.keepDays) || 30;

const data = { products, categories, colours, repairs, services, faqs: faqGroups, allFaqs, guides };

// cache-busting version from asset contents
const hash = createHash('sha1');
for (const f of ['css/main.css', 'css/assistant.css', 'js/main.js', 'js/draw.js', 'js/forms.js', 'js/faq.js', 'js/assistant.js']) {
  hash.update(readFileSync(join(root, 'src/assets', f)));
}
hash.update(JSON.stringify(site));
for (const f of ['products.mjs', 'repairs.mjs', 'faqs.mjs', 'guides.mjs']) hash.update(readFileSync(join(root, 'src/content', f)));
const assetV = hash.digest('hex').slice(0, 10);

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
cpSync(join(root, 'src/assets'), join(out, 'assets'), { recursive: true });
cpSync(join(root, 'src/static'), out, { recursive: true });

/* ---------- pages ---------- */
const pages = [
  P.home(site, data),
  P.category(site, data, 'windows'),
  P.category(site, data, 'doors'),
  ...products.map((p) => P.product(site, data, p)),
  P.repairsHub(site, data),
  ...repairs.map((r) => P.repair(site, data, r)),
  P.servicesHub(site, data),
  ...services.map((s) => P.service(site, data, s)),
  P.quote(site, data),
  P.book(site, data),
  P.about(site, data),
  P.guarantee(site, data),
  P.contact(site, data),
  P.faqPage(site, data),
  P.guidesHub(site, data),
  ...guides.map((g) => P.guide(site, data, g)),
  P.privacy(site),
  P.cookies(site),
  P.terms(site),
  P.accessibility(site),
  P.notFound(site, data),
];

// Real "last modified" dates: a page keeps its date until its content changes.
// src/data/lastmod.json stores a fingerprint and date per page; commit it with your edits.
const today = new Date().toISOString().slice(0, 10);
const lmFile = join(root, 'src/data/lastmod.json');
const lm = existsSync(lmFile) ? JSON.parse(readFileSync(lmFile, 'utf8')) : {};
let lmChanged = false;
for (const page of pages) {
  if (page.noindex) continue;
  const fp = createHash('sha1').update(`${page.title}\n${page.description}\n${page.body}`).digest('hex').slice(0, 12);
  if (!lm[page.path] || lm[page.path].h !== fp) { lm[page.path] = { h: fp, d: today }; lmChanged = true; }
  page.lastmod = page.article && page.article.modified > lm[page.path].d ? page.article.modified : lm[page.path].d;
}
for (const k of Object.keys(lm)) if (!pages.some((p) => p.path === k && !p.noindex)) { delete lm[k]; lmChanged = true; }
if (lmChanged) writeFileSync(lmFile, JSON.stringify(Object.fromEntries(Object.entries(lm).sort()), null, 1) + '\n');

const seen = new Set();
for (const page of pages) {
  if (seen.has(page.path)) throw new Error(`Duplicate path ${page.path}`);
  seen.add(page.path);
  const html = documentShell({ site, data, page, body: page.body, assetV });
  const file = page.path.endsWith('.html') ? join(out, page.path) : join(out, page.path, 'index.html');
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
}

/* ---------- assistant knowledge base ---------- */
// Plain text only: the assistant renders every string with textContent, never as HTML.
// Everything here comes from site.json and src/content, so the assistant never states a fact
// the website doesn't. Keep the file small (it loads when the chat opens): lists are trimmed.
const strip = (s) => String(s ?? '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const list = (a, n = 99) => (Array.isArray(a) ? a : []).map((x) => strip(Array.isArray(x) ? x[0] : x)).filter(Boolean).slice(0, n);
const words = (a) => [...new Set(list(a).map((x) => x.toLowerCase()))];
const setOnly = (o) => Object.fromEntries(Object.entries(o || {}).filter(([k, v]) => !k.startsWith('_') && typeof v === 'string' && v.trim()).map(([k, v]) => [k, strip(v)]));
const kb = {
  v: 2,
  business: {
    name: site.brand.name,
    short: site.brand.short,
    about: strip(site.brand.description),
    phone: site.contact.phoneDisplay,
    phoneIntl: site.contact.phoneInternational,
    whatsapp: site.contact.whatsapp,
    email: site.contact.email,
    hours: site.hours,
    chatHours: site.chatHours?.open ? { open: site.chatHours.open, close: site.chatHours.close } : null,
    areaServed: site.areaServed,
    serviceAreas: site.serviceAreas,
    postcodePrefixes: site.postcodePrefixes,
    address: [site.contact.address.street, site.contact.address.locality, site.contact.address.postcode].filter(Boolean).join(', '),
    guarantee: site.guarantee,
    // only what is actually filled in; empty means "don't claim it"
    accreditations: (site.accreditations || []).map((a) => strip(typeof a === 'string' ? a : a?.name)).filter(Boolean),
    company: setOnly(site.company),
  },
  faqs: allFaqs.map((f) => ({ q: strip(f.q), a: strip(f.a), k: f.k || [], group: f.group })),
  repairs: repairs.map((r) => ({
    name: r.name,
    slug: r.slug,
    url: `/repairs/${r.slug}/`,
    short: strip(r.short),
    k: r.keywords || [],
    symptoms: list(r.symptoms, 2),
    fix: list(r.fix, 3),
    visit: strip(r.visit),
    tip: list(r.tips, 1)[0] || '',
  })),
  products: products.map((p) => ({
    name: p.name,
    slug: p.slug,
    url: `/${p.category}/${p.slug}/`,
    short: strip(p.short),
    cat: p.category,
    tag: strip(p.tag),
    k: [...new Set([p.name.toLowerCase(), p.slug.replace(/-/g, ' '), ...p.slug.split('-').filter((w) => w.length > 3), ...words(p.chips)])],
    goodFor: list(p.goodFor, 3),
    options: list(p.options, 5),
  })),
  services: services.map((s) => ({ name: s.name, slug: s.slug, url: `/services/${s.slug}/`, short: strip(s.short), steps: list(s.steps, 6) })),
  guides: guides.map((g) => ({ title: strip(g.title), slug: g.slug, url: `/guides/${g.slug}/`, summary: strip(g.summary) })),
  colours: (colours || []).map((c) => ({ name: strip(c.name), hex: /^#[0-9a-f]{6}$/i.test(c.hex) ? c.hex : '' })),
  categories: Object.fromEntries(Object.entries(categories || {}).map(([k, c]) => [k, { name: strip(c.name), lead: strip(c.lead) }])),
};
mkdirSync(join(out, 'assets/data'), { recursive: true });
const kbJson = JSON.stringify(kb);
writeFileSync(join(out, 'assets/data/kb.json'), kbJson);
if (kbJson.length > 64000) console.warn(`Note: assistant kb.json is ${Math.round(kbJson.length / 1024)} KB; trim FAQ keywords to keep the chat quick to open.`);

/* ---------- SEO & host files ---------- */
const indexable = pages.filter((p) => !p.noindex);
writeFileSync(
  join(out, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexable
    .map((p) => `  <url><loc>${site.url}${p.path}</loc><lastmod>${p.lastmod}</lastmod></url>`)
    .join('\n')}\n</urlset>\n`
);
// Search engines and AI search crawlers are all welcome: the site is public information about the business.
writeFileSync(join(out, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /assets/data/\n\nSitemap: ${site.url}/sitemap.xml\n`);

// llms.txt: a plain summary of the site for AI assistants (Google does not use it; others do)
{
  const u = (p) => `${site.url}${p}`;
  const area = site.serviceAreas.length ? site.serviceAreas.join(', ') : site.areaServed;
  const t12 = (t) => { if (t === '24:00' || t === '00:00') return 'midnight'; const [h, m] = t.split(':').map(Number); return `${h % 12 || 12}${m ? `:${String(m).padStart(2, '0')}` : ''}${h >= 12 ? 'pm' : 'am'}`; };
  const hrs = site.hours.map((h) => `${h.days}: ${h.open ? `${t12(h.open)}–${t12(h.close)}` : 'closed'}`).join('; ');
  const md = [
    `# ${site.brand.name}`,
    '',
    `> ${strip(site.brand.description)}`,
    '',
    `- Phone and WhatsApp: ${site.contact.phoneDisplay} (${site.contact.phoneInternational})`,
    `- Email: ${site.contact.email}`,
    `- Service hours: ${hrs}`,
    site.chatHours?.open ? `- WhatsApp and chat replies: ${t12(site.chatHours.open)}–${t12(site.chatHours.close)}, every day` : null,
    area ? `- Area served: ${area}` : null,
    `- Guarantees: ${site.guarantee.installationYears}-year installation guarantee, ${site.guarantee.repairMonths}-month guarantee on repairs`,
    `- Quotes: free survey and itemised written quote. Online quote builder: ${u('/quote/')}`,
    '',
    '## Windows',
    ...products.filter((p) => p.category === 'windows').map((p) => `- [${p.name}](${u(`/windows/${p.slug}/`)}): ${strip(p.short)}`),
    '',
    '## Doors',
    ...products.filter((p) => p.category === 'doors').map((p) => `- [${p.name}](${u(`/doors/${p.slug}/`)}): ${strip(p.short)}`),
    '',
    '## Repairs',
    ...repairs.map((r) => `- [${r.name}](${u(`/repairs/${r.slug}/`)}): ${strip(r.short)}`),
    '',
    '## Services',
    ...services.map((x) => `- [${x.name}](${u(`/services/${x.slug}/`)}): ${strip(x.short)}`),
    '',
    '## Guides',
    ...guides.map((g) => `- [${strip(g.title)}](${u(`/guides/${g.slug}/`)}): ${strip(g.summary)}`),
    '',
    '## Frequently asked questions',
    ...allFaqs.map((f) => `### ${strip(f.q)}\n${strip(f.a)}\n`),
    '## More',
    `- [All FAQs](${u('/faq/')})`,
    `- [Guarantees](${u('/guarantee/')})`,
    `- [About](${u('/about/')})`,
    `- [Contact](${u('/contact/')})`,
    `- [Privacy policy](${u('/privacy/')})`,
    '',
  ].filter((l) => l !== null);
  writeFileSync(join(out, 'llms.txt'), md.join('\n'));
}
writeFileSync(
  join(out, 'site.webmanifest'),
  JSON.stringify(
    {
      name: site.brand.name,
      short_name: site.brand.short,
      start_url: '/',
      display: 'standalone',
      background_color: '#F4F1EA',
      theme_color: '#23292D',
      icons: [
        { src: '/assets/img/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/assets/img/icon-512.png', sizes: '512x512', type: 'image/png' },
        { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' },
      ],
    },
    null,
    2
  )
);

// Cloudflare Pages headers: security + long cache for fingerprinted assets
writeFileSync(
  join(out, '_headers'),
  `/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: SAMEORIGIN
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'${site.forms.endpoint ? ' ' + new URL(site.forms.endpoint).origin : ''}${site.quoteUpload.endpoint ? ' https://script.google.com https://script.googleusercontent.com' : ''}; frame-src https://www.google.com https://maps.google.com; form-action 'self' https://wa.me mailto:; base-uri 'self'; frame-ancestors 'self'

/assets/css/*
  Cache-Control: public, max-age=31536000, immutable

/assets/js/*
  Cache-Control: public, max-age=31536000, immutable

/assets/fonts/*
  Cache-Control: public, max-age=2592000

/assets/img/*
  Cache-Control: public, max-age=604800

/assets/data/*
  Cache-Control: public, max-age=300
`
);

if (!site.company.legalName || !(site.company.registeredOffice || (site.contact.address.street && site.contact.address.postcode))) {
  console.warn('Note: add your trading/legal name and a geographic address in src/data/site.json (company / contact.address) before launch. UK law requires traders to show them.');
}
console.log(`Built ${pages.length} pages → dist/ (assets v${assetV})`);
if (!existsSync(join(root, 'src/assets/img/og-image.png'))) console.warn('Note: og-image.png missing — run `npm run images`.');
