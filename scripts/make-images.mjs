// Renders PNG icons and the social share image from SVG/HTML using the
// globally installed Playwright Chromium. Run once after changing brand
// details: `npm run images`. Output is committed to src/assets/img and src/static.
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require(join(execSync('npm root -g').toString().trim(), 'playwright'))); }

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const site = JSON.parse(readFileSync(join(root, 'src/data/site.json'), 'utf8'));
const img = join(root, 'src/assets/img');
mkdirSync(img, { recursive: true });
const fav = readFileSync(join(root, 'src/static/favicon.svg'), 'utf8');
const font = (f) => `data:font/woff2;base64,${readFileSync(join(root, 'src/assets/fonts', f)).toString('base64')}`;

const { heroHouse } = await import('../lib/svg.mjs');
const css = readFileSync(join(root, 'src/assets/css/main.css'), 'utf8').replace(/url\('\.\.\/fonts\/([^']+)'\)/g, (_, f) => `url('${font(f)}')`);

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const page = await browser.newPage();

async function shot(html, w, h, file) {
  await page.setViewportSize({ width: w, height: h });
  await page.setContent(html, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  writeFileSync(file, await page.screenshot({ type: 'png', omitBackground: false }));
  console.log('wrote', file);
}

const iconHtml = (size, pad = 0) => `<html><body style="margin:0;background:#23292D;display:grid;place-items:center;width:${size}px;height:${size}px">${fav.replace('<svg ', `<svg width="${size - pad * 2}" height="${size - pad * 2}" `)}</body></html>`;
await shot(iconHtml(180, 0), 180, 180, join(img, 'apple-touch-icon.png'));
await shot(iconHtml(192, 0), 192, 192, join(img, 'icon-192.png'));
await shot(iconHtml(512, 0), 512, 512, join(img, 'icon-512.png'));
await shot(iconHtml(32, 0), 32, 32, join(img, 'favicon-32.png'));

// favicon.ico containing a single 32x32 PNG
const png = readFileSync(join(img, 'favicon-32.png'));
const ico = Buffer.alloc(22);
ico.writeUInt16LE(0, 0); ico.writeUInt16LE(1, 2); ico.writeUInt16LE(1, 4);
ico.writeUInt8(32, 6); ico.writeUInt8(32, 7); ico.writeUInt8(0, 8); ico.writeUInt8(0, 9);
ico.writeUInt16LE(1, 10); ico.writeUInt16LE(32, 12); ico.writeUInt32LE(png.length, 14); ico.writeUInt32LE(22, 18);
writeFileSync(join(root, 'src/static/favicon.ico'), Buffer.concat([ico, png]));

const og = `<html><head><style>${css}
body{margin:0;width:1200px;height:630px;overflow:hidden;background:var(--paper);padding:0}
.og{display:grid;grid-template-columns:560px 1fr;height:630px}
.og__l{padding:64px 56px;display:flex;flex-direction:column;background:var(--ink);color:#b9bfc2}
.og__l .logo{color:var(--paper)} .og__l .logo__sub{color:#9aa1a5}
.og h1{color:var(--paper);font-size:58px;line-height:1.02;margin-top:auto;font-stretch:112%;letter-spacing:-.03em}
.og h1 em{font-style:normal;color:var(--brass)}
.og p{margin-top:22px;font-size:21px;color:#aab0b3}
.og__url{margin-top:28px;font:500 15px var(--f-mono);letter-spacing:.12em;text-transform:uppercase;color:var(--brass)}
.og__r{padding:40px 36px;background:radial-gradient(ellipse at 45% 40%,#fff,var(--paper) 70%);display:grid;place-items:center}
</style></head><body><div class="og"><div class="og__l"><span class="logo">${fav.replace('<svg ', '<svg width="44" height="44" ')}<span class="logo__word"><span class="logo__name" style="font-size:28px">${site.brand.short}</span><span class="logo__sub" style="font-size:12px">Windows &amp; Doors</span></span></span>
<h1>uPVC windows &amp; doors, <em>fitted properly.</em></h1><p>Supply · installation · repairs. Free survey and written quote.</p><span class="og__url">${site.url.replace(/^https?:\/\//, '')}</span></div>
<div class="og__r">${heroHouse()}</div></div></body></html>`;
await shot(og, 1200, 630, join(img, 'og-image.png'));

await browser.close();
