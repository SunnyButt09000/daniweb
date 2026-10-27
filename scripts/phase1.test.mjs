import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const dist = join(root, 'dist');
const read = (path) => readFileSync(join(dist, path), 'utf8');
const site = JSON.parse(readFileSync(join(root, 'src/data/site.json'), 'utf8'));

test('enquiry hours are not advertised as guaranteed installation appointments', () => {
  const book = read('book/index.html');
  assert.match(book, /Contact hours/);
  assert.match(book, /preferred time.*not a confirmed appointment/i);
  assert.match(read('llms.txt'), /Contact hours:/);
  const kb = JSON.parse(read('assets/data/kb.json'));
  assert.ok(kb.faqs.some((f) => /contact hours.*7am to midnight/i.test(f.a) && /availability/i.test(f.a)));
});

test('installation and enquiry journeys require coverage and partner checks', () => {
  for (const file of ['services/installation/index.html', 'quote/index.html', 'book/index.html']) {
    const html = read(file);
    assert.match(html, /postcode/i, file);
    assert.match(html, /availability/i, file);
    assert.match(html, /confirm/i, file);
  }
  const installation = read('services/installation/index.html');
  assert.match(installation, /partner installer/i);
  assert.match(installation, /England/);
  assert.match(installation, /Scotland/);
  assert.match(installation, /Northern Ireland/);
  const warranty = read('guarantee/index.html');
  assert.match(warranty, /New product guarantee/);
  assert.match(warranty, /No insurance-backed guarantee policy is currently in place/);
  assert.doesNotMatch(warranty, /12-month repair guarantee|Installation guarantee/);
  assert.doesNotMatch(read('assets/js/assistant.js'), /It’s insurance-backed, so it still stands/);
});

test('UK regulations guide distinguishes nations and ventilation without existing vents', () => {
  const html = read('guides/building-regulations-for-replacement-windows/index.html');
  assert.match(html, /id="uk-nations"/);
  assert.match(html, /gov\.wales/);
  assert.match(html, /gov\.scot/);
  assert.match(html, /finance-ni\.gov\.uk/);
  assert.match(html, /even where the old windows had no vents/);
  assert.doesNotMatch(html, /trickle vents are still worth considering/);
});

test('all original routes remain and unverified locations are absent from public data', () => {
  const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]);
  const html = walk(dist).filter((p) => p.endsWith('.html'));
  assert.equal(html.length, 48);
  const expected = JSON.parse(readFileSync(new URL('./fixtures/phase1-routes.json', import.meta.url), 'utf8'));
  const sitemap = read('sitemap.xml');
  assert.deepEqual([...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => new URL(m[1]).pathname).sort(), expected);
  if (!site.serviceAreas.length && !site.areaServed) {
    for (const file of html) {
      const graph = readFileSync(file, 'utf8').match(/<script type="application\/ld\+json">(.*?)<\/script>/s)?.[1];
      if (graph) assert.doesNotMatch(graph, /"areaServed"|"PostalAddress"|"streetAddress"|"postalCode"/, file);
    }
    const kb = JSON.parse(read('assets/data/kb.json'));
    assert.equal(kb.business.address, '');
    assert.deepEqual(kb.business.serviceAreas, []);
    assert.deepEqual(kb.business.postcodePrefixes, []);
  }
});
