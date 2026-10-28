import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CHECKS, createTargets, auditCanonicalRedirects } from './audit-canonical-redirects.mjs';

const targets = createTargets();
const lookup = new Map(targets.map(item => [item.url, item]));
const mock = (changes = new Map()) => async (url, options) => {
  assert.equal(options.method, 'GET');
  assert.equal(options.redirect, 'manual');
  const target = lookup.get(url);
  assert.ok(target, 'Unexpected HTTP request: ' + url);
  if (changes.has(url)) {
    const custom = changes.get(url);
    if (custom instanceof Error) throw custom;
    return custom;
  }
  return target.redirect
    ? new Response(null, { status: 301, headers: { location: target.expected } })
    : new Response(null, { status: target.status });
};

test('probes only the intended 3 source hosts plus HTTPS apex, preserving paths and queries', () => {
  assert.equal(targets.length, CHECKS.length * 4);
  assert.equal(targets.filter(t => t.redirect).length, CHECKS.length * 3);
  assert.ok(targets.some(t => t.url.includes('item=door%20handle&item=lock')));
  assert.ok(targets.some(t => t.url.includes('/encoded%20path/?a=%2F&b=%26&empty=')));
  assert.equal(new Set(targets.map(t => t.url)).size, targets.length);
});

test('all correctly configured 301 host redirects and original 200/404 statuses pass', async () => {
  const result = await auditCanonicalRedirects({ request: mock() });
  assert.equal(result.ok, true, result.errors.join('\n'));
  assert.equal(result.checked, targets.length);
});

test('a 200 on an HTTP alias fails instead of being mistaken for canonicalisation', async () => {
  const t = targets.find(t => t.redirect);
  const result = await auditCanonicalRedirects({
    request: mock(new Map([[t.url, new Response(null, { status: 200 })]])),
  });
  assert.equal(result.ok, false);
  assert.match(result.errors.join('\n'), /expected direct 301/);
});

test('redirect to www or other incorrect host fails', async () => {
  const t = targets.find(t => t.redirect);
  const result = await auditCanonicalRedirects({
    request: mock(new Map([[t.url, new Response(null, {
      status: 301, headers: { location: 'https://www.veltrixwindowsdoor.co.uk/' },
    })]])),
  });
  assert.equal(result.ok, false);
  assert.match(result.errors.join('\n'), /expected Location/);
});

test('lost repeated query parameters are detected', async () => {
  const t = targets.find(t => t.redirect && t.url.includes('/contact/?'));
  const result = await auditCanonicalRedirects({
    request: mock(new Map([[t.url, new Response(null, {
      status: 301,
      headers: { location: t.expected.replace('&item=lock', '') },
    })]])),
  });
  assert.equal(result.ok, false);
  assert.match(result.errors.join('\n'), /expected Location/);
});

test('canonical apex redirect loop is rejected', async () => {
  const t = targets.find(t => !t.redirect && t.status === 200);
  const result = await auditCanonicalRedirects({
    request: mock(new Map([[t.url, new Response(null, {
      status: 301, headers: { location: t.url },
    })]])),
  });
  assert.equal(result.ok, false);
  assert.match(result.errors.join('\n'), /canonical HTTPS endpoint expected HTTP 200/);
});

test('a missing route must remain a real 404, not a soft-404 fallback', async () => {
  const t = targets.find(t => !t.redirect && t.status === 404);
  const result = await auditCanonicalRedirects({
    request: mock(new Map([[t.url, new Response(null, { status: 200 })]])),
  });
  assert.equal(result.ok, false);
  assert.match(result.errors.join('\n'), /expected HTTP 404/);
});

test('unavailable network fails closed without attempting to modify the site', async () => {
  const first = targets[0];
  const result = await auditCanonicalRedirects({
    request: mock(new Map([[first.url, new TypeError('No network')]])),
  });
  assert.equal(result.ok, false);
  assert.match(result.errors.join('\n'), /transport error/);
});
