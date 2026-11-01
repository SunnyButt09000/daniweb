import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('built website CSP permits consented Google Analytics 4 requests', () => {
  const headers = readFileSync(new URL('../dist/_headers', import.meta.url), 'utf8');
  const policy = headers.match(/^  Content-Security-Policy: (.*)$/m)?.[1];
  assert.ok(policy, 'Cloudflare Pages needs a CSP header');
  assert.match(policy, /script-src [^;]*https:\/\/www\.googletagmanager\.com/);
  assert.match(policy, /connect-src [^;]*https:\/\/\*\.google-analytics\.com/);
  assert.match(policy, /img-src [^;]*https:\/\/\*\.google-analytics\.com/);
});

test('GA4 consent defaults to denied and only loads tag on opt-in', () => {
  const js = readFileSync(new URL('../dist/assets/js/consent.js', import.meta.url), 'utf8');
  assert.match(js, /analytics_storage: 'denied'/);
  assert.match(js, /'https:\/\/www\.googletagmanager\.com\/gtag\/js\?id='/);
  assert.match(js, /if \(allow\) enableAnalytics\(\)/);
});
