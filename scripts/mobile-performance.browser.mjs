// Optional real-browser regression check. Run after npm run check.
// Supply PLAYWRIGHT_MODULE (an installed playwright/index.mjs path) and CHROME_PATH.
// Audit tools are deliberately separate from the dependency-free website build.
import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { readFile, stat } from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { gzipSync } from 'node:zlib';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE
  ? pathToFileURL(process.env.PLAYWRIGHT_MODULE).href : 'playwright');
const root = path.resolve(process.env.VX_AUDIT_ROOT || fileURLToPath(new URL('../dist/', import.meta.url)));
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.woff2': 'font/woff2', '.png': 'image/png', '.svg': 'image/svg+xml' };
const server = http.createServer(async (req, res) => {
  try {
    let file = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
    assert.ok(file === root || file.startsWith(root + path.sep));
    if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
    let body = await readFile(file);
    res.setHeader('Content-Type', types[path.extname(file)] || 'text/plain');
    if (/gzip/.test(req.headers['accept-encoding'] || '') && !/\.(woff2|png)$/.test(file)) {
      body = gzipSync(body); res.setHeader('Content-Encoding', 'gzip');
    }
    res.end(body);
  } catch { res.statusCode = 404; res.end('Not found'); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
after(async () => { await browser.close(); await new Promise(resolve => server.close(resolve)); });

async function visit(width, pathname = '/', reducedMotion = 'no-preference') {
  const context = await browser.newContext({ viewport: { width, height: 844 }, reducedMotion });
  const page = await context.newPage();
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  assert.equal((await page.goto(origin + pathname, { waitUntil: 'domcontentloaded' })).status(), 200);
  return { context, page, errors };
}

test('mobile hero headline and introduction are visible without waiting for an entrance animation', async () => {
  for (const width of [390, 760]) {
    const { context, page } = await visit(width);
    try {
      const styles = await page.locator('.hero .display .ln > span, .hero .hero__lead').evaluateAll(nodes => nodes.map(node => {
        const style = getComputedStyle(node);
        return { animation: style.animationName, opacity: style.opacity, transform: style.transform };
      }));
      assert.equal(styles.length, 4);
      for (const style of styles) assert.deepEqual(style, { animation: 'none', opacity: '1', transform: 'none' });
    } finally { await context.close(); }
  }
});

test('desktop keeps its existing hero entrance animations', async () => {
  for (const width of [761, 1440]) {
    const { context, page } = await visit(width);
    try {
      assert.equal(await page.locator('.hero .display .ln > span').first().evaluate(node => getComputedStyle(node).animationName), 'vxUp');
      assert.equal(await page.locator('.hero__lead').evaluate(node => getComputedStyle(node).animationName), 'vxFadeUp');
    } finally { await context.close(); }
  }
});

test('reduced-motion visitors see the same critical copy without prolonged entrance effects', async () => {
  const { context, page } = await visit(1440, '/', 'reduce');
  try {
    assert.equal(await page.locator('.hero__lead').evaluate(node => getComputedStyle(node).animationName), 'none');
    assert.equal(await page.locator('.hero .display .ln > span').first().evaluate(node => getComputedStyle(node).animationName), 'none');
  } finally { await context.close(); }
});

test('mobile navigation, chatbot, quote, booking and guide section links remain usable', async () => {
  const { context, page, errors } = await visit(390);
  try {
    await page.locator('.burger').click();
    assert.equal(await page.locator('.burger').getAttribute('aria-expanded'), 'true');
    await page.locator('.burger').click();
    await page.waitForFunction(() => !!window.VX?.assistant);
    await page.evaluate(() => window.VX.assistant.open());
    assert.equal(await page.locator('.vxa').isVisible(), true);
    const answer = await page.evaluate(() => window.VX.assistant.ask('What is your phone number?'));
    assert.ok(answer.title);
    await page.evaluate(() => window.VX.assistant.close());
    for (const pathname of ['/quote/', '/book/', '/contact/', '/guides/supply-only-vs-supply-and-fit-windows/', '/windows/casement-windows/']) {
      assert.equal((await page.goto(origin + pathname)).status(), 200);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, pathname);
      assert.equal(await page.evaluate(() => window.VX.leadCapture), false, pathname);
      if (pathname === '/quote/') {
        assert.ok(await page.locator('.qb').count());
        assert.ok(await page.locator('form').count());
        await page.locator('#cfg-w').fill('1200');
        await page.locator('#cfg-h').fill('1400');
        await page.locator('#cfg-add').click();
        assert.equal(await page.locator('#ql-items > li').count(), 1);
        assert.match(await page.locator('#ql-count').innerText(), /1 item/i);
      }
      if (pathname === '/book/') assert.ok(await page.locator('input[type=date]').count());
      if (pathname.startsWith('/guides/')) {
        const href = await page.locator('.article-toc a').first().getAttribute('href');
        assert.equal(await page.locator(href).count(), 1);
        await page.locator('.article-toc a').first().click();
        assert.equal(new URL(page.url()).hash, href);
      }
    }
    assert.deepEqual(errors, []);
  } finally { await context.close(); }
});
