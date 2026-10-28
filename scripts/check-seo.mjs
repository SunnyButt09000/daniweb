// Validate the generated site's metadata, graph relationships and discovery files.
// These checks target our output contract; they do not replace a full Schema.org
// validator or Google's eligibility tests.
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const dist = resolve(process.env.VX_OUT || join(root, 'dist'));
const site = JSON.parse(readFileSync(join(root, 'src/data/site.json'), 'utf8'));
const origin = site.url.replace(/\/$/, '');
const files = [];
function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path);
    else if (path.endsWith('.html')) files.push(path);
  }
}
walk(dist);
let bad = 0;
const check = (condition, label) => { if (!condition) { bad++; console.error(label); } };
const decode = (text) => String(text).replace(/&(?:amp|lt|gt|quot|apos|#39|nbsp);/g, (entity) => ({
  '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&apos;': "'", '&#39;': "'", '&nbsp;': ' ',
})[entity]).replace(/&#(x[0-9a-f]+|\d+);/gi, (_, n) => String.fromCodePoint(n[0].toLowerCase() === 'x' ? parseInt(n.slice(1), 16) : Number(n)));
const plain = (html) => decode(html.replace(/<[^>]*>/g, '')).replace(/\s+/g, ' ').trim();
const today = new Date().toISOString().slice(0, 10);
const validDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value || '') &&
  !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value && value <= today;
const canonicals = new Map();
const titles = new Set();
const descriptions = new Set();
for (const file of files) {
  const html = readFileSync(file, 'utf8');
  const path = '/' + relative(dist, file).replace(/\\/g, '/').replace(/index\.html$/, '');
  const label = (message) => path + ': ' + message;
  const head = html.match(/<head>(.*?)<\/head>/s)?.[1] || '';
  const main = html.match(/<main\b[^>]*>(.*?)<\/main>/s)?.[1] || '';
  const text = plain(main);
  const values = (pattern) => [...head.matchAll(pattern)].map((m) => decode(m[1]));
  const title = values(/<title>(.*?)<\/title>/gs);
  const description = values(/<meta name="description" content="([^"]*)">/g);
  const canonical = values(/<link rel="canonical" href="([^"]*)">/g);
  check(title.length === 1 && title[0].trim(), label('expected one non-empty title'));
  check(description.length === 1 && description[0].trim(), label('expected one non-empty meta description'));
  check(canonical.length === 1 && canonical[0] === origin + path, label('canonical must use the production origin and exact route'));
  check(values(/<meta property="og:url" content="([^"]*)">/g)[0] === canonical[0], label('Open Graph URL must match canonical'));
  check((main.match(/<h1\b/g) || []).length === 1, label('expected one main heading'));
  const robots = values(/<meta name="robots" content="([^"]*)">/g);
  check(robots.length === 1, label('expected one robots meta tag'));
  const noindex = /\bnoindex\b/.test(robots[0] || '');
  const scripts = [...head.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)];
  if (noindex) {
    check(path === '/404.html', label('unexpected noindex route'));
    check(scripts.length === 0, label('error page should not publish a graph'));
    continue;
  }
  check(!titles.has(title[0]), label('duplicate title'));
  check(!descriptions.has(description[0]), label('duplicate meta description'));
  titles.add(title[0]);
  descriptions.add(description[0]);
  canonicals.set(canonical[0], path);
  check(scripts.length === 1, label('expected exactly one JSON-LD block'));
  if (scripts.length !== 1) continue;
  let schema;
  try { schema = JSON.parse(scripts[0][1]); } catch { check(false, label('invalid JSON-LD')); continue; }
  check(schema['@context'] === 'https://schema.org' && Array.isArray(schema['@graph']), label('expected one Schema.org graph'));
  if (!Array.isArray(schema['@graph'])) continue;
  const graph = schema['@graph'];
  const ids = graph.map((n) => n['@id']);
  check(ids.every(Boolean) && new Set(ids).size === ids.length, label('missing or duplicate graph IDs'));
  const page = graph.find((n) => n['@id'] === canonical[0] + '#webpage');
  const business = graph.find((n) => n['@id'] === origin + '/#business');
  const website = graph.find((n) => n['@id'] === origin + '/#website');
  check(page?.url === canonical[0] && page?.name === title[0] && page?.description === description[0], label('WebPage metadata mismatch'));
  check(website?.url === origin + '/', label('website URL mismatch'));
  check(business?.name === site.brand.name && business?.telephone === site.contact.phoneInternational && business?.email === site.contact.email, label('business identity mismatch'));
  const expectedHours = site.hours.filter((h) => h.open).map((h) => [h.open, h.close === '24:00' ? '00:00' : h.close]);
  check(!business?.openingHoursSpecification, label('contact-only hours must not imply business attendance hours'));
  check(JSON.stringify(business?.contactPoint?.hoursAvailable?.map((h) => [h.opens, h.closes])) === JSON.stringify(expectedHours), label('schema contact hours differ from configured hours'));
  if (!site.areaServed && !site.serviceAreas.length) {
    check(!business?.areaServed && !business?.contactPoint?.areaServed, label('unconfirmed service area'));
  }
  if (!site.contact.address.street && !site.contact.address.locality && !site.contact.address.postcode) {
    check(!business?.address, label('unconfigured address published'));
  }
  if (!site.testimonials.length) check(!business?.review && !business?.aggregateRating, label('unverified reviews published'));
  const definitions = new Set();
  function visit(value, callback) {
    if (Array.isArray(value)) value.forEach((item) => visit(item, callback));
    else if (value && typeof value === 'object') { callback(value); Object.values(value).forEach((item) => visit(item, callback)); }
  }
  visit(graph, (node) => { if (node['@id'] && Object.keys(node).length > 1) definitions.add(node['@id']); });
  visit(graph, (node) => {
    check(!('mainOfPage' in node), label('internal mainOfPage marker leaked'));
    if (node['@id'] && Object.keys(node).length === 1) check(definitions.has(node['@id']), label('unresolved schema reference ' + node['@id']));
  });
  if (page?.mainEntity) {
    const entity = graph.find((n) => n['@id'] === page.mainEntity['@id']);
    check(entity?.mainEntityOfPage?.['@id'] === page['@id'], label('main entity must link back to WebPage'));
  }
  for (const node of graph) {
    if (node['@type'] === 'FAQPage') for (const question of node.mainEntity || []) {
      check(question['@type'] === 'Question' && question.acceptedAnswer?.['@type'] === 'Answer', label('invalid FAQ structure'));
      check(text.includes(plain(question.name)) && text.includes(plain(question.acceptedAnswer?.text || '')), label('FAQ markup does not match visible content'));
    }
    if (node['@type'] === 'BreadcrumbList') (node.itemListElement || []).forEach((item, index) => {
      check(item.position === index + 1 && item.name && item.item.startsWith(origin + '/'), label('invalid breadcrumb'));
    });
    if (node['@type'] === 'Article') {
      check(validDate(node.datePublished) && validDate(node.dateModified) && node.dateModified >= node.datePublished, label('invalid article dates'));
      check(text.includes(plain(node.headline)) && node.author?.['@id'] === business?.['@id'], label('article headline or author mismatch'));
    }
  }
}
const sitemap = readFileSync(join(dist, 'sitemap.xml'), 'utf8');
check(/<urlset xmlns="http:\/\/www.sitemaps.org\/schemas\/sitemap\/0.9">/.test(sitemap), 'sitemap: incorrect namespace');
const entries = [...sitemap.matchAll(/<url><loc>([^<]+)<\/loc><lastmod>([^<]+)<\/lastmod><\/url>/g)];
const locations = entries.map((m) => decode(m[1]));
check(entries.length === (sitemap.match(/<url>/g) || []).length, 'sitemap: malformed entries');
check(new Set(locations).size === locations.length, 'sitemap: duplicate URLs');
check(locations.length === canonicals.size, 'sitemap: indexable page count mismatch');
for (const [, loc, date] of entries) {
  check(canonicals.has(decode(loc)), 'sitemap: unknown or noindex URL ' + loc);
  check(validDate(date), 'sitemap: invalid lastmod for ' + loc);
}
for (const url of canonicals.keys()) check(locations.includes(url), 'sitemap: missing ' + url);
const robots = readFileSync(join(dist, 'robots.txt'), 'utf8');
check(robots.includes('User-agent: *\nAllow: /\n'), 'robots: public crawling must remain allowed');
check(robots.includes('Sitemap: ' + origin + '/sitemap.xml'), 'robots: sitemap URL mismatch');
const llms = readFileSync(join(dist, 'llms.txt'), 'utf8');
check(llms.startsWith('# ' + site.brand.name + '\n'), 'llms.txt: business identity mismatch');
for (const [, url] of llms.matchAll(/\]\((https:[^)]+)\)/g)) check(canonicals.has(url), 'llms.txt: unknown URL ' + url);
console.log(files.length + ' HTML pages, ' + canonicals.size + ' indexable URLs: metadata, JSON-LD, sitemap, robots and llms.txt checked; ' + bad + ' problem(s).');
process.exitCode = bad ? 1 : 0;
