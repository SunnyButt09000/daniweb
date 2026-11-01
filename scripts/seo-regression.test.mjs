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
  unconfigured.schemaCoverageCountry = '';
  unconfigured.contact.address = { street: '', locality: '', region: '', postcode: '', country: 'United Kingdom' };
  const business = businessSchema(unconfigured, data);
  assert.equal(business.priceRange, undefined);
  assert.equal(business.contactPoint.areaServed, undefined);
  assert.equal(business.areaServed, undefined);
  assert.equal(business.address, undefined);
  assert.equal(business.review, undefined);
  assert.equal(business.aggregateRating, undefined);
});
test('owner-confirmed UK travel coverage is included on business and service schema, not a GBP local zone', () => {
  assert.deepEqual(businessSchema(site, data).areaServed, { '@type': 'Country', name: 'United Kingdom' });
  const graph = graphFor(service(site, data, services[0]));
  assert.deepEqual(graph.find((n) => n['@type'] === 'Service').areaServed, { '@type': 'Country', name: 'United Kingdom' });
  assert.ok(!businessSchema(site, data).address, 'No private service-base address may be published');
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
    const article = page.body.match(/<article>[\s\S]*?<\/article>/)?.[0] || "";
    const ids = [...article.matchAll(/<h2\b[^>]*\bid="([^"]+)"[^>]*>/g)].map((m) => m[1]);
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

test('product and repair detail pages directly link to relevant existing buyer guidance', () => {
  const cases = [
    ['windows/casement-windows', ['how-to-measure-windows-for-a-quote', 'window-energy-ratings-explained']],
    ['doors/composite-doors', ['upvc-vs-composite-doors', 'how-to-maintain-upvc-windows-and-doors']],
    ['doors/upvc-doors', ['upvc-vs-composite-doors', 'how-to-maintain-upvc-windows-and-doors']],
    ['repairs/misted-double-glazing', ['misted-double-glazing-repair-or-replace']],
    ['repairs/handles-and-hinges', ['how-to-maintain-upvc-windows-and-doors']],
  ];
  for (const [route, expected] of cases) {
    const html = readFileSync(new URL(`../dist/${route}/index.html`, import.meta.url), 'utf8');
    const advice = html.match(/<aside class="prose" aria-label="Related buyer advice">[\s\S]*?<\/aside>/)?.[0];
    assert.ok(advice, `No contextual buyer advice: ${route}`);
    for (const slug of expected) assert.ok(advice.includes(`href="/guides/${slug}/"`), `Missing ${slug} from ${route}`);
    assert.equal((advice.match(/<a /g) || []).length, expected.length);
  }
});

test('detail advice links are unique, published and limited to applicable repair topics', () => {
  for (const item of [...products, ...repairs.map((r) => ({ ...r, category: 'repairs' }))]) {
    const html = readFileSync(new URL(`../dist/${item.category}/${item.slug}/index.html`, import.meta.url), 'utf8');
    const advice = html.match(/<aside class="prose" aria-label="Related buyer advice">[\s\S]*?<\/aside>/)?.[0] || '';
    const slugs = [...advice.matchAll(/href="\/guides\/([^/]+)\/"/g)].map((m) => m[1]);
    const applicable = item.category !== 'repairs' || [
      'misted-double-glazing', 'locks-and-mechanisms', 'handles-and-hinges',
      'door-alignment', 'draughts-and-leaks', 'patio-and-bifold-repairs',
    ].includes(item.slug);
    assert.equal(slugs.length > 0, applicable, `Incorrect advice availability: ${item.slug}`);
    assert.equal(new Set(slugs).size, slugs.length, item.slug);
    for (const slug of slugs) assert.ok(guides.some((g) => g.slug === slug), `Unpublished advice ${slug}`);
    if (['glass-and-panel-replacement', 'safety-and-security-upgrades'].includes(item.slug)) assert.equal(slugs.length, 0, 'No directly matching guide exists');
  }
});


test('illustrative product layouts never claim real popularity, frequent installations or verified standard sizes', () => {
  // Product layout diagrams come from illustrative model data, not sales records.
  for (const p of products) {
    const html = readFileSync(new URL('../dist/' + p.category + '/' + p.slug + '/index.html', import.meta.url), 'utf8');
    const section = html.match(/<section class="sec sec--paper2" id="models"[\s\S]*?<\/section>/)?.[0];
    assert.ok(section, 'Missing model examples for ' + p.slug);
    assert.match(section, /id="models-title"/);
    assert.match(section, /example (?:layouts|designs)/i);
    assert.match(section, /Example dimensions/);
    assert.match(section, /planning, not manufacturing or fitting/);
    assert.doesNotMatch(section, /we fit most|<dt>Typical size<\/dt>|>Popular<\/span>|standard (layouts|designs)/i);
    assert.match(section, /href="\/quote\/\?item=[^"]+&amp;model=[^"]+"/);
    assert.match(section, /Request a quote/);
  }
});


test('category specifications are checks for a written quote, not unconditional inclusions', () => {
  for (const category of ['windows', 'doors']) {
    const html = readFileSync(new URL('../dist/' + category + '/index.html', import.meta.url), 'utf8');
    assert.match(html, new RegExp(category === 'windows' ? 'Window specifications to check' : 'Door specifications to check'));
    assert.match(html, /Confirm the final details and any required compliance arrangements in your written quote/);
    assert.doesNotMatch(html, /What every (window|door) includes|As standard/);
    assert.match(html, /href="\/quote\/"/);
  }
});

test('product options and homepage finishes do not claim unverified popularity', () => {
  const home = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
  assert.match(home, /Ask which finishes are offered for your chosen product/);
  assert.doesNotMatch(home, /some of the most popular/);
  for (const p of products) {
    const html = readFileSync(new URL('../dist/' + p.category + '/' + p.slug + '/index.html', import.meta.url), 'utf8');
    assert.match(html, /<h2 class="h4">Options to discuss<\/h2>/, p.slug);
    assert.doesNotMatch(html, /<h2 class="h4">Popular options<\/h2>/, p.slug);
  }
});

test('glass-only replacement page targets a distinct repair intent without inventing a frame replacement', () => {
  const glass = readFileSync(new URL('../dist/repairs/glass-and-panel-replacement/index.html', import.meta.url), 'utf8');
  assert.match(glass, /Window glass replacement/i);
  assert.match(glass, /Can you replace just the window glass without replacing the frame\?/);
  assert.match(glass, /double-glazed sealed unit/i);
  assert.match(glass, /\/repairs\/misted-double-glazing\//);
  assert.match(glass, /\/book\/\?type=repair/);
  assert.match(glass, /postcode/i);
  const misted = readFileSync(new URL('../dist/repairs/misted-double-glazing/index.html', import.meta.url), 'utf8');
  assert.match(misted, /sealed unit/i);
  assert.match(misted, /\/guides\/misted-double-glazing-repair-or-replace\//);
});

test('real UK sliding-window and back-door buying questions have scoped answers', () => {
  const sliding = readFileSync(new URL('../dist/windows/sliding-windows/index.html', import.meta.url), 'utf8');
  assert.match(sliding, /Are horizontal sliding windows available in uPVC for UK homes\?/);
  assert.match(sliding, /How much do horizontal sliding windows cost\?/);
  assert.match(sliding, /\/repairs\/glass-and-panel-replacement\//);
  assert.match(sliding, /postcode/i);
  const backDoor = readFileSync(new URL('../dist/doors/upvc-doors/index.html', import.meta.url), 'utf8');
  assert.match(backDoor, /fully fitted uPVC back door or supply-only\?/);
  assert.match(backDoor, /How much does a fully fitted uPVC back door cost\?/);
  assert.match(backDoor, /written quote/i);
  assert.doesNotMatch(backDoor, /guaranteed installation slot/i);
});

test('misted-glazing guide distinguishes failed seals from broken glass with contextual service links', () => {
  const html = readFileSync(new URL('../dist/guides/misted-double-glazing-repair-or-replace/index.html', import.meta.url), 'utf8');
  assert.match(html, /Is the glass cracked rather than misted\?/);
  assert.match(html, /href="\/repairs\/glass-and-panel-replacement\/"/);
  assert.match(html, /href="\/repairs\/misted-double-glazing\/"/);
  assert.match(html, /window glass-only and sealed-unit replacement service/);
});

test('repair-intent FAQ pages link to the appropriate next service without invented promises', () => {
  const locks = readFileSync(new URL('../dist/repairs/locks-and-mechanisms/index.html', import.meta.url), 'utf8');
  assert.match(locks, /Can a failed uPVC or composite door lock be repaired without replacing the whole door\?/);
  assert.match(locks, /What should I send for a door-lock repair quote\?/);
  assert.match(locks, /href="\/repairs\/safety-and-security-upgrades\/"/);
  assert.match(locks, /postcode/i);
  const draughts = readFileSync(new URL('../dist/repairs/draughts-and-leaks/index.html', import.meta.url), 'utf8');
  assert.match(draughts, /Can you fix a leaking uPVC back door without replacing the door\?/);
  assert.match(draughts, /Is a draughty window always a sign it needs replacing\?/);
  assert.match(draughts, /href="\/repairs\/door-alignment\/"/);
  assert.match(draughts, /href="\/repairs\/misted-double-glazing\/"/);
  const handles = readFileSync(new URL('../dist/repairs/handles-and-hinges/index.html', import.meta.url), 'utf8');
  assert.match(handles, /href="\/repairs\/safety-and-security-upgrades\/"/);
  assert.doesNotMatch(locks + draughts + handles, /guaranteed same-day|guaranteed emergency callout/i);
});

test('composite door buyer intent and linked repair alternatives remain transparent', () => {
  const html = readFileSync(new URL('../dist/doors/composite-doors/index.html', import.meta.url), 'utf8');
  assert.match(html, /How much does a fully fitted composite front door cost\?/);
  assert.match(html, /Can I order a composite door supply-only or supplied and fitted\?/);
  assert.match(html, /Can I repair a composite front door lock instead of replacing the door\?/);
  assert.match(html, /Can you replace broken glass in a composite door without replacing the door\?/);
  for (const path of ['/repairs/locks-and-mechanisms/', '/repairs/door-alignment/', '/repairs/glass-and-panel-replacement/']) {
    assert.ok(html.includes('href="' + path + '"'), 'Missing contextual composite repair link: ' + path);
  }
  assert.match(html, /written quote/i);
});
test('patio repairs and security upgrade pages route distinct repair questions safely', () => {
  const patio = readFileSync(new URL('../dist/repairs/patio-and-bifold-repairs/index.html', import.meta.url), 'utf8');
  assert.match(patio, /Can a patio door with worn rollers be repaired instead of replaced\?/);
  assert.match(patio, /What affects the cost of a sliding patio or bifold door repair\?/);
  assert.match(patio, /href="\/repairs\/glass-and-panel-replacement\/"/);
  const security = readFileSync(new URL('../dist/repairs/safety-and-security-upgrades/index.html', import.meta.url), 'utf8');
  assert.match(security, /Can I upgrade a front-door lock without replacing the whole door\?/);
  assert.match(security, /Are child-safety window restrictors suitable for every window\?/);
  assert.match(security, /href="\/repairs\/locks-and-mechanisms\/"/);
  assert.match(security, /escape arrangements/i);
});

test('four service landing pages use the right enquiry type and contextual next steps', () => {
  const readService = (slug) => readFileSync(new URL('../dist/services/' + slug + '/index.html', import.meta.url), 'utf8');
  const servicing = readService('servicing-and-maintenance');
  assert.match(servicing, /href="\/book\/\?type=service"/);
  assert.match(servicing, /Request a servicing visit/);
  assert.match(servicing, /Do I need a service or a specific repair\?/);
  assert.match(servicing, /href="\/guides\/how-to-maintain-upvc-windows-and-doors\/"/);
  assert.doesNotMatch(servicing, /<a[^>]+href="\/quote\/"[^>]*>[^<]*Build my quote request/);

  const landlord = readService('landlords-and-commercial');
  assert.match(landlord, /href="\/book\/\?type=other"/);
  assert.match(landlord, /Enquire about property repairs/);
  assert.match(landlord, /Can I ask about repairs for several rental properties\?/);
  assert.match(landlord, /href="\/repairs\/glass-and-panel-replacement\/"/);

  const survey = readService('survey-and-quote');
  assert.match(survey, /href="\/book\/\?type=survey"/);
  assert.match(survey, /Request a free survey/);
  assert.match(survey, /Is a window or door survey free\?/);
  assert.match(survey, /href="\/guides\/how-to-measure-windows-for-a-quote\/"/);
  assert.match(survey, /travel costs/i);

  const install = readService('installation');
  assert.match(install, /href="\/quote\/"/);
  assert.match(install, /Build an installation quote/);
  assert.match(install, /Can you arrange supplied-and-fitted windows and doors for my postcode\?/);
  assert.match(install, /href="\/doors\/composite-doors\/"/);
  assert.match(install, /href="\/guides\/building-regulations-for-replacement-windows\/"/);
  for (const html of [servicing, landlord, survey, install]) {
    assert.match(html, /<h2[^>]*>Practical answers and related help<\/h2>/);
    assert.doesNotMatch(html, /guaranteed appointment|guaranteed same.day fitting/i);
  }
  // Booking form accepts and honours the named type parameters; this test does not submit a lead.
  const forms = readFileSync(new URL('../src/assets/js/forms.js', import.meta.url), 'utf8');
  assert.match(forms, /params\.get\('type'\)/);
  assert.match(forms, /if \(radio\) radio\.checked = true/);
});

test('service booking CTAs expose a whitelisted customer-visible page origin', () => {
  const page = (slug) => readFileSync(new URL('../dist/services/' + slug + '/index.html', import.meta.url), 'utf8');
  const refs = [
    ['servicing-and-maintenance', 'service'],
    ['landlords-and-commercial', 'other'],
    ['survey-and-quote', 'survey'],
  ];
  for (const [slug, type] of refs) {
    const html = page(slug);
    assert.ok(html.includes('type=' + type + '&amp;from=' + slug)
      || html.includes('type=' + type + '&from=' + slug), 'Missing source-aware booking CTA for ' + slug);
  }
  const js = readFileSync(new URL('../src/assets/js/forms.js', import.meta.url), 'utf8');
  assert.match(js, /new Map\(\[/);
  assert.match(js, /\]\.get\(params\.get\('from'\)\) \|\| ''/);
  assert.match(js, /Enquiry page: \$\{bookingSource\}/);
  assert.match(js, /bookingSource \? `Enquiry page:/);
  assert.doesNotMatch(js, /Enquiry page: \$\{params\.get\(/);
  // Product quotation is not falsely labelled as one of the service booking types.
  assert.doesNotMatch(page('installation'), /type=service&amp;from=|type=other&amp;from=/);
});
