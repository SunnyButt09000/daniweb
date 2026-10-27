import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';
import { allFaqs } from '../src/content/faqs.mjs';

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
  assert.equal(html.length, 50);
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

test('original buyer and renovation guides stay indexable and avoid unsupported sales claims', () => {
  const one = read('guides/supply-only-vs-supply-and-fit-windows/index.html');
  const two = read('guides/window-door-schedule-for-builders-and-renovators/index.html');
  const index = read('guides/index.html');
  const llms = read('llms.txt');
  for (const [html, slug] of [
    [one, 'supply-only-vs-supply-and-fit-windows'],
    [two, 'window-door-schedule-for-builders-and-renovators'],
  ]) {
    assert.match(html, new RegExp('rel="canonical" href="https://veltrixwindowsdoor\\.co\\.uk/guides/' + slug + '/"'));
    assert.ok(index.includes('/guides/' + slug + '/'));
    assert.ok(llms.includes('/guides/' + slug + '/'));
    assert.match(html, /manufacturer/i);
    assert.match(html, /postcode/i);
    assert.doesNotMatch(html, /guaranteed nationwide supply|guaranteed lowest price/i);
  }
  assert.match(one, /VAT/i);
  assert.match(one, /certification/i);
  assert.match(two, /W1/);
  assert.match(two, /fictional examples only/);
  assert.ok(one.includes('/guides/window-door-schedule-for-builders-and-renovators/'));
  assert.ok(two.includes('/guides/supply-only-vs-supply-and-fit-windows/'));
  assert.match(read('guides/how-to-measure-windows-for-a-quote/index.html'), /multi-opening schedule for renovations/);
});

test('booking dates are checked at submission using the UK calendar, not just an HTML min attribute', () => {
  const js = readFileSync(join(root, 'src/assets/js/forms.js'), 'utf8');
  const start = js.indexOf('  function ukTomorrowIso(');
  const end = js.indexOf('\n  function validate(form)', start);
  assert.ok(start > -1 && end > start, 'UK-day helper is present');
  const nextDay = runInNewContext('(' + js.slice(start, end).trim() + ')', { Date, Intl, Object });
  for (const [instant, expected] of [
    ['2026-10-27T23:30:00Z', '2026-10-29'],
    ['2026-07-01T22:30:00Z', '2026-07-02'],
    ['2026-07-01T23:30:00Z', '2026-07-03'],
    ['2026-03-29T00:30:00Z', '2026-03-30'],
    ['2026-03-29T01:30:00Z', '2026-03-30'],
    ['2026-10-25T00:30:00Z', '2026-10-26'],
    ['2026-10-25T01:30:00Z', '2026-10-26'],
  ]) assert.equal(nextDay(new Date(instant)), expected, instant);
  assert.match(js, /if \(form\.id === 'book-form'\)/);
  assert.match(js, /for \(const name of \['date', 'date2'\]\)/);
  assert.match(js, /date < earliest/);
  assert.match(js, /el\.min = ukTomorrowIso\(\)/);
});

test('competitor-informed buyer guidance avoids unevidenced installation promises', () => {
  const faq = read('faq/index.html');
  const installer = allFaqs.find((f) => f.q === 'How can I check a window installer before agreeing to work?');
  const quote = allFaqs.find((f) => f.q === 'What should be included in a written window and door quotation?');
  assert.ok(installer && quote);
  assert.match(faq, /How can I check a window installer/);
  assert.match(faq, /What should be included in a written window/);
  assert.match(installer.a, /independently verify/);
  assert.match(installer.a, /Northern Ireland/);
  assert.match(quote.a, /VAT/);
  assert.match(quote.a, /manufacturer product and installer workmanship/);
  const removal = allFaqs.find((f) => f.q === 'Do you take away the old windows and doors?');
  assert.match(removal.a, /not automatically included/);
  const timeline = allFaqs.find((f) => f.q === 'How long does it take to fit new windows?');
  assert.doesNotMatch(timeline.a, /two to four hours|one to three days/i);
});
