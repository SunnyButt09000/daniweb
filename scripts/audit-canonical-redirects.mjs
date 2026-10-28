// Read-only, opt-in release check for the proposed Cloudflare canonical-host 301.
// This file does NOT create or change DNS, rules, deployments or customer records.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const site = JSON.parse(readFileSync(new URL('../src/data/site.json', import.meta.url), 'utf8'));
export const CHECKS = Object.freeze([
  { path: '/', status: 200 },
  { path: '/contact/?source=seo-audit&item=door%20handle&item=lock', status: 200 },
  { path: '/guides/supply-only-vs-supply-and-fit-windows/', status: 200 },
  { path: '/assets/fonts/archivo-var.woff2', status: 200 },
  { path: '/__redirect-audit-missing-20261028/', status: 404 },
  { path: '/encoded%20path/?a=%2F&b=%26&empty=', status: 404 },
]);

// Explicitly test 3 aliases and the sole canonical host. No preview or API hosts.
export function createTargets(origin = site.url, checks = CHECKS) {
  const target = new URL(origin);
  if (target.protocol !== 'https:' || target.hostname.startsWith('www.') ||
      target.search || target.hash || (target.pathname !== '/' && target.pathname !== '')) {
    throw new Error('Expected configured canonical origin to be the HTTPS apex hostname');
  }
  const base = target.origin;
  const aliases = ['http://' + target.host, 'http://www.' + target.host, 'https://www.' + target.host];
  return checks.flatMap(({ path: route, status }) => {
    if (!route.startsWith('/') || route.startsWith('//')) throw new Error('Invalid audit path');
    const expected = base + route;
    return [
      ...aliases.map(alias => ({
        url: alias + route, expected, redirect: true, label: alias + route,
      })),
      { url: expected, status, redirect: false, label: expected },
    ];
  });
}

export async function auditCanonicalRedirects({ origin = site.url, request = fetch,
  checks = CHECKS, timeoutMs = 10000 } = {}) {
  const errors = [];
  let checked = 0;
  let transportFailures = 0;
  for (const target of createTargets(origin, checks)) {
    let response;
    try {
      // redirect:manual is essential. Following automatically hides broken host rules.
      response = await request(target.url, {
        method: 'GET', redirect: 'manual', signal: AbortSignal.timeout(timeoutMs),
      });
      checked++;
      if (target.redirect) {
        const location = response.headers.get('location');
        if (response.status !== 301) {
          errors.push(target.label + ': expected direct 301, received HTTP ' + response.status);
        } else if (!location) {
          errors.push(target.label + ': 301 has no Location header');
        } else {
          let actual;
          try { actual = new URL(location, target.url).href; }
          catch { errors.push(target.label + ': invalid Location header'); }
          if (actual && actual !== target.expected) {
            errors.push(target.label + ': expected Location ' + target.expected + ', got ' + actual);
          }
        }
      } else if (response.status !== target.status) {
        errors.push(target.label + ': canonical HTTPS endpoint expected HTTP ' +
          target.status + ', received ' + response.status);
      } else if (response.headers.get('location')) {
        errors.push(target.label + ': canonical HTTPS endpoint sent an unexpected Location header');
      }
    } catch (e) {
      transportFailures++;
      errors.push(target.label + ': transport error (' + (e?.name || 'request failed') + ')');
      // Avoid a long sequence of timeouts when the audit environment has no DNS access.
      if (transportFailures >= 3) break;
    } finally {
      try { await response?.body?.cancel?.(); } catch { /* no response body to drain */ }
    }
  }
  return { ok: errors.length === 0, errors, checked };
}

// The existing standard CI suite tests a mocked transport only. Running this
// explicit command is the operator's choice when they can reach the live host.
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await auditCanonicalRedirects();
  console.log('Canonical redirect checks: ' + result.checked + ' HTTP requests inspected.');
  if (result.ok) console.log('PASS: 301 host consolidation, paths, queries, 200s and 404s.');
  else {
    for (const issue of result.errors) console.error('FAIL: ' + issue);
    console.error('No Cloudflare settings have been changed. Review the rule and rerun.');
    process.exitCode = 1;
  }
}
