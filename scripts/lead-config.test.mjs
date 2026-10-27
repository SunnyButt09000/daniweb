import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { checkLeadReleaseConfig } from '../lib/lead-config.mjs';

const file = fileURLToPath(new URL('../src/data/site.json', import.meta.url));
test('customer lead collection is disabled in committed public settings', () => {
  const site = JSON.parse(readFileSync(file, 'utf8'));
  assert.equal(site.forms.endpoint, '');
  assert.equal(site.forms.turnstileSiteKey, '');
  assert.equal(checkLeadReleaseConfig(site.forms).enabled, false);
});
test('cannot inadvertently turn on D1 collection by editing only the sitekey and endpoint', () => {
  const sample = { endpoint: '/api/leads', provider: 'Cloudflare D1', turnstileSiteKey: '0x4AAAA-demo-placeholder-key' };
  assert.throws(() => checkLeadReleaseConfig(sample), /missing explicit/);
  assert.equal(checkLeadReleaseConfig(sample, { VELTRIX_LEADS_LAUNCH_APPROVED: 'yes' }).enabled, true);
});
test('requires D1 provider label and a plausible public Turnstile key', () => {
  assert.throws(() => checkLeadReleaseConfig({ endpoint: '/api/leads', provider: '', turnstileSiteKey: '0x4AAAA-demo-placeholder-key' }, { VELTRIX_LEADS_LAUNCH_APPROVED: 'yes' }), /provider/);
  assert.throws(() => checkLeadReleaseConfig({ endpoint: '/api/leads', provider: 'Cloudflare D1', turnstileSiteKey: '' }, { VELTRIX_LEADS_LAUNCH_APPROVED: 'yes' }), /site key/);
});
test('prevents leftover Turnstile widget key when API is disabled', () => {
  assert.throws(() => checkLeadReleaseConfig({ endpoint: '', turnstileSiteKey: 'test-public-key' }), /remain empty/);
});
