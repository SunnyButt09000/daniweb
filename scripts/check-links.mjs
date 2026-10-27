// Check local and same-origin links, asset references, and cross-page anchors.
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(process.env.VX_OUT || join(root, 'dist'));
const site = JSON.parse(readFileSync(join(root, 'src/data/site.json'), 'utf8'));
const origin = new URL(site.url).origin;
const files = [];
const walk = (d) => readdirSync(d).forEach((f) => { const p = join(d, f); statSync(p).isDirectory() ? walk(p) : p.endsWith('.html') && files.push(p); });
walk(dist);
const idsFor = (html) => new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
const anchors = new Map(files.map((f) => [f, idsFor(readFileSync(f, 'utf8'))]));
let bad = 0;
for (const file of files) {
  const html = readFileSync(file, 'utf8');
  const route = '/' + relative(dist, file).replace(/\\/g, '/').replace(/index\.html$/, '');
  for (const [, raw] of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const value = raw.replace(/&amp;/g, '&');
    let url;
    try { url = new URL(value, origin + route); } catch { bad++; console.error(route + ': invalid URL ' + raw); continue; }
    if (url.origin !== origin) continue;
    let path, fragment;
    try { path = decodeURIComponent(url.pathname); fragment = decodeURIComponent(url.hash.slice(1)); }
    catch { bad++; console.error(route + ': invalid URL encoding ' + raw); continue; }
    let target = resolve(dist, '.' + path);
    const local = relative(dist, target);
    if (local.startsWith('..')) { bad++; console.error(route + ': URL outside output ' + raw); continue; }
    if (existsSync(target) && statSync(target).isDirectory()) target = join(target, 'index.html');
    if (!existsSync(target)) { bad++; console.error(route + ': broken ' + raw); continue; }
    if (fragment && target.endsWith('.html') && !anchors.get(target)?.has(fragment)) {
      bad++; console.error(route + ': missing anchor ' + raw);
    }
  }
}
console.log(files.length + ' pages checked, ' + bad + ' problem(s).');
process.exitCode = bad ? 1 : 0;
