import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';
import { hoursLine, chatLine, businessSchema } from '../lib/layout.mjs';
import { allFaqs } from '../src/content/faqs.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const site = JSON.parse(readFileSync(join(root, 'src/data/site.json'), 'utf8'));

test('owner-confirmed contact and enquiry hours end at midnight every day', () => {
  assert.equal(site.hours.length, 1);
  assert.deepEqual(site.hours[0].dow, [0, 1, 2, 3, 4, 5, 6]);
  assert.equal(site.hours[0].open, '07:00');
  assert.equal(site.hours[0].close, '24:00');
  assert.equal(site.chatHours.open, '07:00');
  assert.equal(site.chatHours.close, '24:00');
  assert.equal(hoursLine(site), '7am–midnight daily');
  assert.equal(chatLine(site), '7am–midnight');
  const faq = allFaqs.find((f) => f.a.includes('Our contact hours are'));
  assert.ok(faq?.a.includes('7am to midnight, seven days a week'));
});

test('JSON-LD encodes closing as midnight on the following day', () => {
  const hours = businessSchema(site).openingHoursSpecification;
  assert.equal(hours.length, 1);
  assert.equal(hours[0].opens, '07:00');
  assert.equal(hours[0].closes, '00:00');
  assert.equal(new Set(hours[0].dayOfWeek).size, 7);
});

test('real browser status code handles opening and midnight in UK winter, summer and DST transition days', () => {
  const main = readFileSync(join(root, 'src/assets/js/main.js'), 'utf8');
  const start = main.indexOf('/* ---------- opening hours (UK time) ---------- */');
  const end = main.indexOf('/* ---------- click-to-load map ---------- */');
  assert.ok(start >= 0 && end > start, 'opening-hours code section exists');
  // Exercise the actual browser hours code without changing production exports or
  // navigation. The only DOM call here updates status labels; there are none in this fixture.
  for (const [instant, open] of [
    ['2026-12-06T06:59:59Z', false],
    ['2026-12-06T07:00:00Z', true],
    ['2026-12-06T23:59:59Z', true],
    ['2026-12-07T00:00:00Z', false],
    ['2026-07-05T05:59:59Z', false],
    ['2026-07-05T06:00:00Z', true],
    ['2026-07-05T22:59:59Z', true],
    ['2026-07-05T23:00:00Z', false],
    ['2026-03-29T05:59:59Z', false],
    ['2026-03-29T06:00:00Z', true],
    ['2026-10-25T06:59:59Z', false],
    ['2026-10-25T07:00:00Z', true],
  ]) {
    class FixedDate extends Date {
      constructor(...args) { super(...(args.length ? args : [instant])); }
    }
    const VX = { hours: site.hours, chatHours: site.chatHours };
    runInNewContext(main.slice(start, end), { VX, Date: FixedDate, Intl, document: { querySelectorAll: () => [] } });
    assert.equal(VX.openStatus().open, open, 'service at ' + instant);
    assert.equal(VX.chatStatus().open, open, 'enquiries at ' + instant);
    assert.match(VX.openStatus().text, open ? /until midnight/ : /at 7am/);
    assert.match(VX.chatStatus().text, open ? /until midnight/ : /at 7am/);
  }
});

test('generated pages, booking slots, assistant knowledge and llms.txt agree on midnight', () => {
  const dist = join(root, 'dist');
  const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]);
  const htmlFiles = walk(dist).filter((path) => path.endsWith('.html'));
  assert.equal(htmlFiles.length, 48);
  for (const file of htmlFiles) {
    const html = readFileSync(file, 'utf8');
    assert.doesNotMatch(html, /23:59|11:59pm/, file);
    assert.match(html, /7am–midnight daily/, file);
    const config = JSON.parse(html.match(/<script>window.VX=(.*?);<\/script>/s)[1]);
    assert.equal(config.hours[0].close, '24:00', file);
    assert.equal(config.chatHours.close, '24:00', file);
    const jsonld = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s);
    if (jsonld) {
      const business = JSON.parse(jsonld[1])['@graph'].find((n) => n['@type'] === 'HomeAndConstructionBusiness');
      assert.equal(business.openingHoursSpecification[0].closes, '00:00', file);
    }
  }
  const book = readFileSync(join(dist, 'book/index.html'), 'utf8');
  assert.match(book, /<option>Late evening \(8pm – midnight\)<\/option>/);
  const kb = JSON.parse(readFileSync(join(dist, 'assets/data/kb.json'), 'utf8'));
  assert.equal(kb.business.hours[0].close, '24:00');
  assert.equal(kb.business.chatHours.close, '24:00');
  assert.ok(kb.faqs.some((f) => f.a.includes('Our contact hours are 7am to midnight')));
  const llms = readFileSync(join(dist, 'llms.txt'), 'utf8');
  assert.match(llms, /Contact hours: Monday – Sunday: 7am–midnight/);
  assert.match(llms, /WhatsApp and chat replies: 7am–midnight, every day/);
  assert.doesNotMatch(llms, /23:59|11:59pm/);
});
