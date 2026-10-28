// IndexNow: notify Bing and other participating engines about new/changed canonical URLs.
// NOT a Google submission. Runs only after a production push; no analytics or visitor data.
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const origin = 'https://veltrixwindowsdoor.co.uk';
const host = new URL(origin).host;
const manifestPath = 'src/data/lastmod.json';
const keyPath = 'src/data/indexnow-key.txt';

export function selectIndexNowUrls(sitemap, current, previous, bootstrap = false) {
  const listed = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const urls = new Set();
  for (const url of listed) {
    const target = new URL(url);
    if (target.origin !== origin || target.search || target.hash) {
      throw new Error('IndexNow only permits canonical URLs on the verified host');
    }
    const path = target.pathname;
    if (!current[path]) throw new Error('Sitemap URL missing from lastmod.json: ' + path);
    if (bootstrap || !previous || current[path].h !== previous[path]?.h) urls.add(url);
  }
  return [...urls];
}

function readOld(path) {
  try { return execFileSync('git', ['show', 'HEAD^:' + path], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }); }
  catch { return null; }
}
function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

export async function submitIndexNow() {
  const key = readFileSync(join(root, keyPath), 'utf8').trim();
  if (!/^[a-f0-9]{32}$/.test(key)) throw new Error('IndexNow public key format invalid');
  const keyLocation = origin + '/' + key + '.txt';
  const builtKey = readFileSync(join(root, 'dist', key + '.txt'), 'utf8').trim();
  if (builtKey !== key) throw new Error('IndexNow verification key not in generated public site');

  const sitemap = readFileSync(join(root, 'dist/sitemap.xml'), 'utf8');
  const current = JSON.parse(readFileSync(join(root, manifestPath), 'utf8'));
  const oldManifest = readOld(manifestPath);
  const previous = oldManifest ? JSON.parse(oldManifest) : null;
  const bootstrap = !readOld(keyPath);
  const urls = selectIndexNowUrls(sitemap, current, previous, bootstrap);
  if (!urls.length) {
    console.log('IndexNow: no new or updated sitemap URLs; skipping submission');
    return;
  }
  // Cloudflare's Git-linked production deployment can finish after the GitHub push.
  // Verify the live public key, never submit a key that is not yet deployed.
  let verified = false;
  for (let attempt = 0; attempt < 24; attempt++) {
    try {
      const r = await fetch(keyLocation, { cache: 'no-store', signal: AbortSignal.timeout(15000) });
      if (r.ok && (await r.text()).trim() === key) { verified = true; break; }
    } catch { /* Site may still be deploying; retry. */ }
    if (attempt !== 23) await sleep(10000);
  }
  if (!verified) throw new Error('IndexNow: public key not yet live; no submission attempted. Retry workflow after deploying site.');
  const response = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host, key, keyLocation, urlList: urls }),
    signal: AbortSignal.timeout(30000),
  });
  const message = (await response.text()).slice(0,400);
  if (![200, 202].includes(response.status)) {
    throw new Error('IndexNow HTTP ' + response.status + ': ' + message);
  }
  console.log('IndexNow: API accepted ' + urls.length + ' canonical URL notifications (HTTP ' + response.status + ').');
  console.log('IndexNow submission is NOT a guarantee of crawling or indexing.');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  submitIndexNow().catch((err) => { console.error(err.message); process.exitCode = 1; });
}
