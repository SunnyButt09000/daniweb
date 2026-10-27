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
