// Optional lab audit: npm run build, then node scripts/measure-mobile.mjs <output-dir>.
// PLAYWRIGHT_MODULE and CHROME_PATH work as in mobile-performance.browser.mjs.
// Fresh browser contexts, disabled cache, fixed mobile viewport/CPU/network, no submissions.
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { gzipSync } from 'node:zlib';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ? pathToFileURL(process.env.PLAYWRIGHT_MODULE).href : 'playwright');
if (!process.argv[2]) throw Error('Usage: node scripts/measure-mobile.mjs <output-dir>');
const output = path.resolve(process.argv[2]);
await fs.mkdir(output, { recursive: true });
const root = path.resolve(process.env.VX_AUDIT_ROOT || fileURLToPath(new URL('../dist/', import.meta.url)));
const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.woff2': 'font/woff2', '.png': 'image/png', '.svg': 'image/svg+xml' };
const server = http.createServer(async (req, res) => {
  try {
    let file = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
    if (file !== root && !file.startsWith(root + path.sep)) throw Error('Outside build');
    if ((await fs.stat(file)).isDirectory()) file = path.join(file, 'index.html');
    let body = await fs.readFile(file);
    res.setHeader('Content-Type', mime[path.extname(file)] || 'text/plain');
    if (/gzip/.test(req.headers['accept-encoding'] || '') && !/\.(woff2|png)$/.test(file)) { body = gzipSync(body); res.setHeader('Content-Encoding', 'gzip'); }
    res.end(body);
  } catch { res.statusCode = 404; res.end('Not found'); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
const settings = { viewport: { width: 412, height: 823 }, deviceScaleFactor: 1.75, cpuSlowdown: 4, latencyMs: 150, downloadBytesPerSecond: 200000, uploadBytesPerSecond: 93750, observationMsAfterNetworkIdle: 4500 };
const results = [];
try {
  for (const route of ['/', '/guides/supply-only-vs-supply-and-fit-windows/', '/windows/casement-windows/']) for (let run = 1; run <= 3; run++) {
    const context = await browser.newContext({ viewport: settings.viewport, deviceScaleFactor: settings.deviceScaleFactor, isMobile: true, hasTouch: true });
    try {
      const page = await context.newPage(); const errors = []; page.on('pageerror', e => errors.push(e.message));
      await page.addInitScript(() => {
        window.lab = { lcp: [], cls: 0, longTasks: [] };
        new PerformanceObserver(list => list.getEntries().forEach(e => window.lab.lcp.push({ time: e.startTime, size: e.size, element: e.element?.outerHTML.slice(0, 600) }))).observe({ type: 'largest-contentful-paint', buffered: true });
        new PerformanceObserver(list => list.getEntries().forEach(e => { if (!e.hadRecentInput) window.lab.cls += e.value; })).observe({ type: 'layout-shift', buffered: true });
        new PerformanceObserver(list => list.getEntries().forEach(e => window.lab.longTasks.push({ start: e.startTime, duration: e.duration }))).observe({ type: 'longtask', buffered: true });
      });
      const cdp = await context.newCDPSession(page);
      await cdp.send('Network.enable'); await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
      await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: settings.latencyMs, downloadThroughput: settings.downloadBytesPerSecond, uploadThroughput: settings.uploadBytesPerSecond, connectionType: 'cellular4g' });
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: settings.cpuSlowdown });
      if (run === 1) await cdp.send('Tracing.start', { categories: 'devtools.timeline,loading,blink.user_timing', transferMode: 'ReturnAsStream' });
      const response = await page.goto(origin + route, { waitUntil: 'networkidle' });
      await page.waitForTimeout(settings.observationMsAfterNetworkIdle);
      const result = { route, run, status: response.status(), errors, ...await page.evaluate(() => ({ ...window.lab, overflow: document.documentElement.scrollWidth > innerWidth, leadCapture: window.VX?.leadCapture, resources: performance.getEntriesByType('resource').map(e => ({ path: new URL(e.name).pathname, start: e.startTime, end: e.responseEnd, bytes: e.transferSize })) })) };
      if (run === 1) {
        const finished = new Promise(resolve => cdp.once('Tracing.tracingComplete', resolve));
        await cdp.send('Tracing.end'); const { stream } = await finished;
        let trace = ''; let eof = false;
        while (!eof) { const part = await cdp.send('IO.read', { handle: stream }); trace += part.data; eof = part.eof; }
        await cdp.send('IO.close', { handle: stream });
        await fs.writeFile(path.join(output, (route === '/' ? 'home' : route.split('/').filter(Boolean).pop()) + '-trace.json'), trace);
      }
      results.push(result); console.log(JSON.stringify({ route, run, lcp: result.lcp.at(-1)?.time, cls: result.cls, status: result.status }));
    } finally { await context.close(); }
  }
  await fs.writeFile(path.join(output, 'measurements.json'), JSON.stringify({ date: new Date().toISOString(), chrome: browser.version(), settings, results }, null, 2));
} finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
