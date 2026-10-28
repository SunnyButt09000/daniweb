// GEO/AEO: verify public, answer-first content stays consistent across output surfaces.
// These checks assert content/parity, not whether a search engine has indexed or cited it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = (name) => readFileSync(join(root, 'dist', name), 'utf8');
const questions = [
  'Can Veltrix arrange installation in different UK cities?',
  'Who will install my windows or doors?',
];

test('UK partner installer answers appear on FAQ page, assistant data and optional llms summary', () => {
  const html = read('faq/index.html');
  const llms = read('llms.txt');
  const kb = JSON.parse(read('assets/data/kb.json'));
  for (const question of questions) {
    assert.ok(html.includes(question), question + ' absent from human-readable FAQ page');
    assert.ok(llms.includes(question), question + ' absent from llms.txt');
    const answer = kb.faqs.find((f) => f.q === question);
    assert.ok(answer, question + ' absent from chatbot knowledge base');
    assert.match(answer.a, /partner installer/i);
    assert.match(answer.a, /postcode/i);
  }
});

test('new answers are represented in honest, visible FAQ structured data', () => {
  const html = read('faq/index.html');
  const match = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  assert.ok(match, 'FAQ page should have valid JSON-LD');
  const nodes = JSON.parse(match[1])['@graph'];
  assert.ok(Array.isArray(nodes), 'schema graph should be an array');
  const faq = nodes.find((x) => x['@type'] === 'FAQPage');
  assert.ok(faq, 'FAQPage schema is missing');
  for (const question of questions) {
    assert.ok(faq.mainEntity.some((x) => x.name === question), question + ' missing from FAQPage');
  }
});

test('AI discovery endpoints do not invent service areas or publish a private address', () => {
  const site = JSON.parse(readFileSync(join(root, 'src/data/site.json'), 'utf8'));
  const robots = read('robots.txt');
  const llms = read('llms.txt');
  const home = read('index.html');
  assert.match(robots, /User-agent: \*/);
  assert.match(robots, /Sitemap: https:\/\/veltrixwindowsdoor\.co\.uk\/sitemap\.xml/);
  assert.match(llms, /Coverage: UK-wide window, door and repair enquiries welcome/i);
  assert.match(llms, /a fitter may travel from another area/i);
  assert.match(llms, /require postcode\/job confirmation/i);
  assert.match(llms, /not installation appointment availability/i);
  if (!site.serviceAreas.length && !site.areaServed) {
    const schema = JSON.parse(home.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
    const business = schema['@graph'].find((x) => x['@id'] === site.url + '/#business');
    assert.ok(business, 'Stable business identifier missing');
    assert.deepEqual(business.areaServed, { '@type': 'Country', name: site.schemaCoverageCountry });
    assert.equal(business.contactPoint.areaServed, undefined);
    assert.equal(business.address, undefined);
  }
  assert.equal(site.contact.address.street, '');
  assert.equal(site.contact.address.postcode, '');
});

test('owner-confirmed product guarantee is consistent across public and AI answers', () => {
  const site = JSON.parse(readFileSync(join(root, 'src/data/site.json'), 'utf8'));
  assert.equal(site.guarantee.productYears, 10);
  assert.equal(site.guarantee.repairMonths, 0);
  assert.equal(site.guarantee.insuranceBacked, false);
  const html = read('guarantee/index.html');
  const llms = read('llms.txt');
  const kb = JSON.parse(read('assets/data/kb.json'));
  assert.match(html, /10.year guarantee on new window and door products/i);
  assert.match(html, /No insurance-backed guarantee policy is currently in place/i);
  assert.match(llms, /10-year guarantee on new products/i);
  assert.match(llms, /No insurance-backed guarantee policy currently in place/i);
  assert.ok(kb.faqs.some(f => /What guarantee do I get/.test(f.q) && /manufacturer provides a 10-year guarantee on new window and door products/i.test(f.a)));
  assert.doesNotMatch(read('privacy/index.html'), /registering insurance-backed guarantees|insurance-backed guarantee providers/);
});

test('competition buyer FAQs explain pricing scope and manufacturer guarantee', () => {
  const html = read('faq/index.html');
  const llms = read('llms.txt');
  const kb = JSON.parse(read('assets/data/kb.json'));
  const cases = [
    ['Why is a supply-only online window price cheaper than a fitted quote?', /VAT.*delivery.*surveys/i],
    ['Does the 10-year manufacturer guarantee cover fitting and labour?', /not automatically/i],
  ];
  for (const [q, expected] of cases) {
    assert.ok(html.includes(q) && llms.includes(q), q + ' missing from public output');
    const entry = kb.faqs.find(f => f.q === q);
    assert.ok(entry, q + ' missing from chatbot knowledge');
    assert.match(entry.a, expected);
  }
});
