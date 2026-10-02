// Static site build — no dependencies. Run: node build.mjs
// Output goes to ./dist, which is what the host (Cloudflare Pages) publishes.

import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { products, categories, colours } from './src/content/products.mjs';
import { repairs, services } from './src/content/repairs.mjs';
import { faqGroups, allFaqs } from './src/content/faqs.mjs';
import { guides } from './src/content/guides.mjs';
import { documentShell } from './lib/layout.mjs';
import * as P from './lib/pages.mjs';

const root = dirname(fileURLToPath(import.meta.url));
const out = join(root, 'dist');
const site = JSON.parse(readFileSync(join(root, 'src/data/site.json'), 'utf8'));
site.url = site.url.replace(/\/$/, '');

const data = { products, categories, colours, repairs, services, faqs: faqGroups, allFaqs, guides };

// cache-busting version from asset contents
const hash = createHash('sha1');
for (const f of ['css/main.css', 'js/main.js', 'js/draw.js', 'js/forms.js', 'js/faq.js', 'js/assistant.js']) {
  hash.update(readFileSync(join(root, 'src/assets', f)));
}
hash.update(JSON.stringify(site));
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
const strip = (s) => s.replace(/<[^>]+>/g, '');
const kb = {
  business: {
    name: site.brand.name,
    short: site.brand.short,
    phone: site.contact.phoneDisplay,
    phoneIntl: site.contact.phoneInternational,
    whatsapp: site.contact.whatsapp,
    email: site.contact.email,
    hours: site.hours,
    areaServed: site.areaServed,
    serviceAreas: site.serviceAreas,
    postcodePrefixes: site.postcodePrefixes,
    address: [site.contact.address.street, site.contact.address.locality, site.contact.address.postcode].filter(Boolean).join(', '),
    guarantee: site.guarantee,
  },
  faqs: allFaqs.map((f) => ({ q: f.q, a: f.a, k: f.k || [], group: f.group })),
  repairs: repairs.map((r) => ({ name: r.name, url: `/repairs/${r.slug}/`, short: r.short, k: r.keywords, fix: r.fix.slice(0, 3), visit: r.visit })),
  products: products.map((p) => ({ name: p.name, url: `/${p.category}/${p.slug}/`, short: p.short, cat: p.category, k: [p.name.toLowerCase(), p.slug.replace(/-/g, ' '), ...p.slug.split('-').filter((w) => w.length > 3)] })),
  services: services.map((s) => ({ name: s.name, url: `/services/${s.slug}/`, short: s.short })),
  guides: guides.map((g) => ({ title: g.title, url: `/guides/${g.slug}/`, summary: strip(g.summary) })),
};
mkdirSync(join(out, 'assets/data'), { recursive: true });
writeFileSync(join(out, 'assets/data/kb.json'), JSON.stringify(kb));

/* ---------- SEO & host files ---------- */
const today = new Date().toISOString().slice(0, 10);
const urls = pages.filter((p) => !p.noindex).map((p) => p.path);
writeFileSync(
  join(out, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url><loc>${site.url}${u}</loc><lastmod>${today}</lastmod><priority>${u === '/' ? '1.0' : u.split('/').length > 3 ? '0.7' : '0.8'}</priority></url>`)
    .join('\n')}\n</urlset>\n`
);
writeFileSync(join(out, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${site.url}/sitemap.xml\n`);
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
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'${site.forms.endpoint ? ' ' + new URL(site.forms.endpoint).origin : ''}; frame-src https://www.google.com https://maps.google.com; form-action 'self' https://wa.me mailto:; base-uri 'self'; frame-ancestors 'self'

/assets/*
  Cache-Control: public, max-age=31536000, immutable

/assets/data/*
  Cache-Control: public, max-age=300
`
);

console.log(`Built ${pages.length} pages → dist/ (assets v${assetV})`);
if (!existsSync(join(root, 'src/assets/img/og-image.png'))) console.warn('Note: og-image.png missing — run `npm run images`.');
