// Read-only, zero-dependency internal-link audit of built canonical pages.
// The existing check-links.mjs validates broken links and fragments; this reports
// site structure and editorial opportunities without encouraging keyword stuffing.
import { readFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(process.env.VX_OUT || join(root, 'dist'));
const site = JSON.parse(readFileSync(join(root, 'src/data/site.json'), 'utf8'));
const origin = new URL(site.url).origin;
const xml = readFileSync(join(dist, 'sitemap.xml'), 'utf8');
const paths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map((m) => new URL(m[1].replaceAll('&amp;', '&')).pathname);
if (paths.length === 0 || new Set(paths).size !== paths.length) {
  throw new Error('Canonical sitemap URLs missing or duplicated');
}
const canonical = new Set(paths);
const incoming = new Map(paths.map((path) => [path, new Set()]));
const editorialIncoming = new Map(paths.map((path) => [path, new Set()]));
const outgoing = new Map(paths.map((path) => [path, new Set()]));
let mainMissing = 0;
let crossLinks = 0;

for (const source of paths) {
  const filename = join(dist, source.slice(1), 'index.html');
  const html = readFileSync(filename, 'utf8');
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1];
  if (!main) mainMissing += 1;

  const scan = (markup, editorial) => {
    for (const match of markup.matchAll(/<a\b[^>]*\bhref\s*=\s*"([^"]+)"/gi)) {
      let link;
      try { link = new URL(match[1].replaceAll('&amp;', '&'), origin + source); }
      catch { continue; }
      if (link.origin !== origin || !canonical.has(link.pathname) || link.pathname === source) continue;
      if (editorial) editorialIncoming.get(link.pathname).add(source);
      else {
        incoming.get(link.pathname).add(source);
        outgoing.get(source).add(link.pathname);
        crossLinks += 1;
      }
    }
  };
  scan(html, false);
  if (main) scan(main, true);
}

const orphaned = paths.filter((path) => incoming.get(path).size === 0);
const underlinked = [...paths].sort((a, b) => editorialIncoming.get(a).size - editorialIncoming.get(b).size)
  .slice(0, 15);
console.log('Internal linking graph: ' + paths.length + ' canonical pages; ' +
  crossLinks + ' same-site anchor occurrences; ' +
  orphaned.length + ' pages with no inbound canonical links; ' +
  mainMissing + ' pages without detected <main>.');
console.log('Editorial incoming links (different canonical source pages), least first:');
for (const path of underlinked) {
  console.log('  ' + String(editorialIncoming.get(path).size).padStart(2) +
    ' editorial | ' + String(incoming.get(path).size).padStart(2) +
    ' total sources | ' + path);
}
if (orphaned.length) {
  console.warn('Pages without a canonical inbound link: ' + orphaned.join(', '));
  // Report-only: do not fail a deployment on unrelated existing navigation issues.
}
console.log('Use these findings for human-reviewed contextual links only; no fixed link quota.');
