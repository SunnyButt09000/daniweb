import { test } from 'node:test';
import assert from 'node:assert/strict';
import staging from '../src/server/leads-staging.mjs';

const origin = 'https://veltrix-leads-staging.synthetic.workers.dev';
const key = 'a'.repeat(64);
const env = { STAGING_ONLY: 'true', SITE_ORIGIN: origin, STAGING_ACCESS_KEY: key };
const request = (path, init = {}) => new Request(origin + path, init);
const data = { name: 'Synthetic Test', phone: '07700900000', email: 'synthetic@example.test', postcode: 'ZZ1 1ZZ', summary: '[STAGING SYNTHETIC] Contact enquiry' };

test('staging fails closed on the production hostname or missing access key', async () => {
  assert.equal((await staging.fetch(request('/'), {})).status, 503);
  assert.equal((await staging.fetch(new Request('https://veltrixwindowsdoor.co.uk/'), { ...env, SITE_ORIGIN: 'https://veltrixwindowsdoor.co.uk' })).status, 503);
});
test('staging data and assets require a private access credential', async () => {
  for (const path of ['/', '/api/leads', '/assets/data/kb.json', '/_staging/retry']) {
    const response = await staging.fetch(request(path), env);
    assert.equal(response.status, 404);
    assert.match(response.headers.get('x-robots-tag'), /noindex/);
    assert.equal(response.headers.get('cache-control'), 'no-store');
  }
});
test('login cookie authenticates homepage and contact assets, while omitted cookies never reach ASSETS', async () => {
  const calls = [];
  const assetsEnv = { ...env, ASSETS: { async fetch(received) {
    calls.push(new URL(received.url).pathname);
    return new Response('Private asset served', { headers: { 'content-type': 'text/plain' } });
  } } };
  const login = await staging.fetch(request('/staging-access', { method: 'POST', headers: { origin }, body: new URLSearchParams({ key }) }), assetsEnv);
  assert.equal(login.status, 303);
  const cookie = login.headers.get('set-cookie').split(';')[0];
  for (const path of ['/', '/contact/']) {
    const denied = await staging.fetch(request(path), assetsEnv);
    assert.equal(denied.status, 404);
    assert.equal(await denied.text(), 'Not found');
    assert.equal(calls.length, path === '/' ? 0 : 1);
    const response = await staging.fetch(request(path, { headers: { cookie } }), assetsEnv);
    assert.equal(response.status, 200);
    assert.equal(await response.text(), 'Private asset served');
  }
  assert.deepEqual(calls, ['/', '/contact/']);
  assert.match(login.headers.get('set-cookie'), /SameSite=Strict/);
});
test('access form sets only a secure HttpOnly same-site cookie after same-origin verification', async () => {
  const init = { method: 'POST', headers: { origin, 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ key }) };
  const response = await staging.fetch(request('/staging-access', init), env);
  assert.equal(response.status, 303);
  assert.match(response.headers.get('set-cookie'), /Secure; HttpOnly; SameSite=Strict/);
  assert.equal(response.headers.get('location'), '/');
  assert.equal((await staging.fetch(request('/staging-access', { ...init, headers: { origin: 'https://other.test' } }), env)).status, 404);
});
test('login document preserves same-origin form Origin while private assets retain no-referrer', async () => {
  const response = await staging.fetch(request('/staging-access'), env);
  assert.equal(response.status, 200);
  // Chrome native POST navigation sends Origin: null under no-referrer.
  // Preserve its real origin without allowing referrer disclosure off-site.
  assert.equal(response.headers.get('referrer-policy'), 'same-origin');
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.match(response.headers.get('x-robots-tag'), /noindex/);
  assert.equal((await staging.fetch(request('/'), env)).headers.get('referrer-policy'), 'no-referrer');
});
test('login still rejects null, absent and foreign origins even with the correct key', async () => {
  for (const suppliedOrigin of [undefined, 'null', 'https://other.test', origin + '/']) {
    const headers = { 'content-type': 'application/x-www-form-urlencoded' };
    if (suppliedOrigin !== undefined) headers.origin = suppliedOrigin;
    const response = await staging.fetch(request('/staging-access', { method: 'POST', headers, body: new URLSearchParams({ key }) }), env);
    assert.equal(response.status, 404);
    assert.equal(response.headers.get('set-cookie'), null);
  }
});
test('login still rejects incorrect keys and oversized access forms', async () => {
  for (const submittedKey of ['b'.repeat(64), 'a'.repeat(513)]) {
    const response = await staging.fetch(request('/staging-access', { method: 'POST', headers: { origin, 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ key: submittedKey }) }), env);
    assert.equal(response.status, 404);
    assert.equal(response.headers.get('set-cookie'), null);
  }
});
test('staging rejects non-synthetic submissions and malformed fields without throwing', async () => {
  for (const bad of [{ name: 'Actual Customer' }, { phone: '07123456789' }, { email: 'customer@example.com' }, { postcode: {} }, { name: { toString: null } }]) {
    const response = await staging.fetch(request('/api/leads', { method: 'POST', headers: { origin, authorization: 'Bearer ' + key, 'content-type': 'application/json' }, body: JSON.stringify({ ...data, ...bad }) }), env);
    assert.equal(response.status, 422);
    assert.equal((await response.json()).code, 'synthetic_only');
  }
});
test('staging enforces the same byte body limit before parsing synthetic payloads', async () => {
  const response = await staging.fetch(request('/api/leads', { method: 'POST', headers: { authorization: 'Bearer ' + key }, body: JSON.stringify({ ...data, summary: 'é'.repeat(7900) }) }), env);
  assert.equal(response.status, 413);
});
