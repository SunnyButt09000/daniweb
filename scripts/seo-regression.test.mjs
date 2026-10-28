import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { businessSchema, documentShell } from '../lib/layout.mjs';
import { products, categories } from '../src/content/products.mjs';
import { repairs, services } from '../src/content/repairs.mjs';
import { guides } from '../src/content/guides.mjs';
import { guide, service } from '../lib/pages.mjs';
const site = JSON.parse(readFileSync(new URL('../src/data/site.json', import.meta.url), 'utf8'));
const data = { products, categories, repairs, services, guides };
const graphFor = (page) => JSON.parse(documentShell({ site, data, page, body: '', assetV: 'test' }).match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1])['@graph'];
test('business markup does not invent prices or nationwide coverage', () => {
  const unconfigured = structuredClone(site);
  unconfigured.areaServed = '';
  unconfigured.serviceAreas = [];
  unconfigured.contact.address = { street: '', locality: '', region: '', postcode: '', country: 'United Kingdom' };
  const business = businessSchema(unconfigured, data);
  assert.equal(business.priceRange, undefined);
  assert.equal(business.contactPoint.areaServed, undefined);
  assert.equal(business.areaServed, undefined);
  assert.equal(business.address, undefined);
  assert.equal(business.review, undefined);
  assert.equal(business.aggregateRating, undefined);
});
test('main services and articles link back to their canonical web page', () => {
  for (const page of [service(site, data, services[0]), guide(site, data, guides[0])]) {
    const graph = graphFor(page);
    const webpage = graph.find((n) => n['@id'] === site.url + page.path + '#webpage');
    const entity = graph.find((n) => n['@id'] === webpage.mainEntity['@id']);
    assert.deepEqual(entity.mainEntityOfPage, { '@id': webpage['@id'] });
    assert.equal(entity.mainOfPage, undefined);
  }
});
test('article author refers to the one canonical business identity', () => {
  const graph = graphFor(guide(site, data, guides[0]));
  assert.deepEqual(graph.find((n) => n['@type'] === 'Article').author, { '@id': site.url + '/#business' });
});


test('confirmed service areas are preserved when supplied by the owner', () => {
  const configured = structuredClone(site);
  configured.serviceAreas = ['Owner-confirmed locality (test fixture)'];
  assert.deepEqual(businessSchema(configured, data).areaServed, [
    { '@type': 'City', name: configured.serviceAreas[0] },
  ]);
});

test('illustrative model cards are not marked up as retail Product snippets', () => {
  for (const p of products) {
    const path = new URL(`../dist/${p.category}/${p.slug}/index.html`, import.meta.url);
    const html = readFileSync(path, 'utf8');
    const match = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s);
    assert.ok(match, `Missing JSON-LD on ${p.slug}`);
    const graph = JSON.parse(match[1])['@graph'];
    assert.ok(graph.some((n) => n['@type'] === 'Service'), `Service schema removed: ${p.slug}`);
    // Google requires offers, reviews or aggregate ratings on Product items.
    // No real retail prices/product reviews are established for model layouts.
    assert.doesNotMatch(JSON.stringify(graph), /"@type":"Product"/, `Unqualified Product item: ${p.slug}`);
    assert.match(html, /\bprod__models\b/, `Visible model navigation removed: ${p.slug}`);
  }
});


test('buyer guides have readable direct-section links matching unique H2 anchors', () => {
  for (const gd of guides) {
    const page = guide(site, { ...data, guides }, gd);
    const toc = page.body.match(/<nav class="article-toc"[\s\S]*?<\/nav>/)?.[0];
    assert.ok(toc, 'Missing section navigation: ' + gd.slug);
    const ids = [...page.body.matchAll(/<h2\b[^>]*\bid="([^"]+)"[^>]*>/g)].map((m) => m[1]);
    const links = [...toc.matchAll(/<a href="#([^"]+)">/g)].map((m) => m[1]);
    assert.ok(ids.length >= 4, 'Too few article sections: ' + gd.slug);
    assert.deepEqual(links, ids, 'Inaccurate section links: ' + gd.slug);
    assert.equal(new Set(ids).size, ids.length, 'Duplicate heading anchor: ' + gd.slug);
    assert.equal((page.body.match(/<h1\b/g) || []).length, 1);
    assert.ok(page.body.includes(gd.summary), 'Article summary changed: ' + gd.slug);
  }
  const regs = guide(site, { ...data, guides }, guides.find((g) => g.slug === 'building-regulations-for-replacement-windows'));
  assert.match(regs.body, /href="#uk-nations"/);
  assert.match(regs.body, /<h2 id="uk-nations">/);
});

test('related articles have three distinct existing non-self guide links', () => {
  for (const gd of guides) {
    const page = guide(site, { ...data, guides }, gd);
    const section = page.body.split('Keep reading')[1]?.split('</section>')[0] || '';
    const slugs = [...section.matchAll(/href="\/guides\/([^/]+)\/"/g)].map((m) => m[1]);
    assert.equal(slugs.length, 3, 'Expected three recommendations for ' + gd.slug);
    assert.equal(new Set(slugs).size, 3, 'Repeated recommendations for ' + gd.slug);
    assert.ok(!slugs.includes(gd.slug), 'Self-recommended article: ' + gd.slug);
    for (const slug of slugs) assert.ok(guides.some((g) => g.slug === slug), 'Broken guide link ' + slug);
  }
});
