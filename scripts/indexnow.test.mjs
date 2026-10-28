import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { selectIndexNowUrls } from './indexnow-submit.mjs';

const root = new URL('../', import.meta.url);
const read = (path) => readFileSync(new URL(path, root), 'utf8');
const origin = 'https://veltrixwindowsdoor.co.uk';
const current = JSON.parse(read('src/data/lastmod.json'));
const sitemap = read('dist/sitemap.xml');

test('IndexNow ownership key is included in static output without user data', () => {
  const key = read('src/data/indexnow-key.txt').trim();
  assert.match(key, /^[a-f0-9]{32}$/);
  assert.equal(read('dist/' + key + '.txt'), key + '\n');
  assert.doesNotMatch(read('dist/robots.txt'), new RegExp('Disallow: /' + key));
});

test('IndexNow bootstrap sends unique, canonical sitemap URLs only', () => {
  const urls = selectIndexNowUrls(sitemap, current, null, true);
  assert.equal(urls.length, 49);
  assert.equal(new Set(urls).size, urls.length);
  assert.ok(urls.every((u) => new URL(u).origin === origin));
});

test('IndexNow subsequent pushes include only genuinely new or changed indexable URLs', () => {
  const old = structuredClone(current);
  assert.deepEqual(selectIndexNowUrls(sitemap, current, old), []);
  old['/'].h = 'previous';
  old['/faq/'].h = 'previous';
  const urls = selectIndexNowUrls(sitemap, current, old);
  assert.deepEqual(urls, [origin + '/', origin + '/faq/']);
  assert.ok(!urls.some((u) => u.includes('/404/')));
});

test('IndexNow refuses off-domain sitemap entries', () => {
  assert.throws(() => selectIndexNowUrls('<loc>https://example.com/</loc>', current, null, true), /verified host/);
});
