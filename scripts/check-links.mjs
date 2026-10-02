// Checks every internal link and asset reference in dist/ resolves to a file.
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = process.env.VX_OUT || join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const files = [];
const walk = (d) => readdirSync(d).forEach((f) => { const p = join(d, f); statSync(p).isDirectory() ? walk(p) : p.endsWith('.html') && files.push(p); });
walk(dist);

let bad = 0;
for (const f of files) {
  const html = readFileSync(f, 'utf8');
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  for (const [, url] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (url.startsWith('#')) { if (url.length > 1 && !ids.has(url.slice(1))) { bad++; console.log(`${f.replace(dist, '')}: missing anchor ${url}`); } continue; }
    if (!url.startsWith('/') || url.startsWith('//')) continue;
    const path = decodeURI(url.split(/[?#]/)[0]);
    const target = join(dist, path);
    const ok = path.endsWith('/') ? existsSync(join(target, 'index.html')) : existsSync(target);
    if (!ok) { bad++; console.log(`${f.replace(dist, '')}: broken ${url}`); }
  }
}
console.log(`${files.length} pages checked, ${bad} problem(s).`);
process.exit(bad ? 1 : 0);
