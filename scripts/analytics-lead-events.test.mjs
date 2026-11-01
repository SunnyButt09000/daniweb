import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const file = (p) => readFileSync(new URL('../dist/' + p, import.meta.url), 'utf8');

test('contact-intent clicks report only an anonymous channel', () => {
  const tracking = [];
  const listeners = [];
  vm.runInNewContext(file('assets/js/analytics.js'), {
    window: { VXAnalytics: { track: (name, params) => tracking.push({ name, ...params }) } },
    document: { addEventListener: (name, callback) => {
      if (name === 'click') listeners.push(callback);
    } }
  });
  assert.equal(listeners.length, 1);
  const click = (href, quote = false) => listeners[0]({
    target: { closest: () => ({
      getAttribute: () => href,
      matches: (s) => s === '[data-sb-open]' && quote
    }) }
  });
  click('tel:+441234567890');
  click('mailto:example@example.com');
  click('https://wa.me/441234567890?text=PRIVATE%20MESSAGE');
  click('https://wa.me/441234567890?text=PRIVATE%20MESSAGE', true);
  click('/windows/');
  assert.equal(tracking.length, 4);
  assert.deepEqual(tracking.map(({ name, contact_method }) => [name, contact_method]), [
    ['contact_click','phone'],
    ['contact_click','email'],
    ['contact_click','whatsapp'],
    ['lead_handoff','whatsapp']
  ]);
  assert.equal(JSON.stringify(tracking).includes('PRIVATE'), false, 'Never report personal message bodies');
});

test('key lead event only fires in the confirmed server-receipt path', () => {
  const forms = file('assets/js/forms.js');
  assert.equal((forms.match(/\.track\('generate_lead'/g) || []).length, 2);
  assert.match(forms, /const receipt = await submitReceipt\([\s\S]*?\.track\('generate_lead'/);
  assert.match(forms, /const receipt = await submitReceipt\('quote'[\s\S]*?\.track\('generate_lead'/);
  assert.match(forms, /\.track\('lead_handoff'/);
  assert.match(forms, /\.track\('quote_prepared'/);
  assert.equal(forms.includes('gtag(\'event\', \'generate_lead\''), false);
});

test('analytics event helper is consent-gated, with strictly whitelisted values', () => {
  const consent = file('assets/js/consent.js');
  assert.match(consent, /if \(!analyticsConsent \|\| !tagLoaded \|\| !permittedEvents\.has\(eventName\)\) return false/);
  assert.match(consent, /allowedParams\[key\]\?\.has\(value\)/);
  assert.match(consent, /analyticsConsent = allow === true/);
  const homepage = file('index.html');
  assert.match(homepage, /assets\/js\/consent\.js/);
  assert.match(homepage, /assets\/js\/analytics\.js/);
});
