# Mobile rendering audit — 28 October 2026

Review-only continuation of [Issue #17](https://github.com/SunnyButt09000/daniweb/issues/17), based on default commit `6ceee5c1deb5ab6c2fcafee1d074bc48ce9bf904`. PRs #9/#12/#13/#14/#15/#16 are preserved. No deployment, production enquiry activation, account edit or enquiry submission.

## Delivered change

Only the homepage headline and introductory paragraph stop waiting for entrance animations at widths **up to 760px**. The desktop timing, final layout, fonts, colours, headline wrapping, CTA animations, ticks, SVG artwork and drawing animations remain unchanged. Existing reduced-motion behaviour and PR #16's article navigation remain intact.

Production change: `src/assets/css/main.css`, seven added and three removed lines. Verification: optional browser regression and measurement scripts; CI browser job; this report and [machine-readable samples](mobile-performance-20261028.json).

## Actual LCP and bottleneck

On fixed-throttle cold loads of the default-branch homepage, the final LCP was the first headline span, **“Windows & doors,”**. Initially only the eyebrow was visible; the headline had opacity zero and a translated position under the `vxUp` entrance animation. The lead had its own delayed fade. The intended critical introduction was therefore waiting on presentation even after it could be rendered. After the change, the larger `.hero__lead` paragraph is visible on the first contentful paint and becomes LCP.

The control guide's LCP is its `h1`; the casement product's LCP is `p.phero__lead`. This is a **text-rendering** issue, not a slow hero-image request. The facade is inline SVG and is below the mobile copy. Lighthouse's simulated runs sometimes selected the eyebrow or a CTA instead of the headline; the repeated PerformanceObserver traces give a more consistent diagnosis here.

## Comparable measurements

Final evidence was collected with the committed `scripts/measure-mobile.mjs` against two local builds: unchanged default branch and this CSS change. Chrome **156.0.8078.48**, Playwright **1.64.1**, 412×823 viewport, DPR 1.75, mobile/touch, 4× CPU slowdown, 150ms network latency, 200,000 bytes/s download and 93,750 bytes/s upload. Each navigation used a fresh browser context and disabled cache. Local HTML/CSS/JS used gzip. Observe for 4.5 seconds after network idle, without interaction; three samples per page. First samples also saved Chrome performance traces locally. Only one audit browser ran at a time.

| Page | Before LCP samples (ms) | After LCP samples (ms) | Median change | CLS |
| --- | --- | --- | --- | --- |
| Home | 2524, 2424, 2400 | 2016, 1936, 1836 | **2424 → 1936ms; 488ms / 20.1% faster** | 0 in all six samples |
| Supply-only vs fitted guide | 1596, 1580, 1568 | 1560, 1580, 1576 | 1580 → 1576ms; effectively unchanged | 0 |
| Casement product | 1684, 1612, 1668 | 1704, 1632, 1684 | 1668 → 1684ms; 16ms variation, no gain claimed | 0 |

An earlier diagnostic series, before the final trace-enabled runner, independently showed home median 2464 → 1872ms. The final table above is the primary claim. Removing the facade drawing animation alone produced no clear improvement, so that experiment was not implemented. Font subsetting was also investigated outside the repository and not shipped.

Lighthouse **13.6.0**, default simulated mobile settings, gave local home performance samples **95/87/96 before** and **92/93/92 after**. Median score **95 → 92** did **not** improve; no score gain is claimed. Simulated median LCP was 1542 → 1394ms and Speed Index 3055 → 1786ms, but changing animated LCP candidates and long-task variation make those results less robust than the repeated fixed-throttle text-visibility measurements. Lighthouse TBT medians were approximately 235 → 330ms; the fixed-throttle observation-window long-task excess was 343 → 364ms. This patch removes the visible text delay; it does **not** solve the remaining main-thread work. Observation-window long-task excess is not Lighthouse TBT or field INP.

Separate deployed HTTPS mobile samples (before any proposed deployment): home **91**, guide **94**, casement product **98**; simulated LCP respectively **1.411s / 2.369s / 1.565s**. Accessibility, best practices and SEO were **100** in every local/deployed Lighthouse sample. Do not compare the deployed numbers directly with localhost or the historical ~75 score: transport, browser version, simulation and selected element differ. No production speed improvement is claimed.

These are **lab** observations, not a Core Web Vitals field pass. PageSpeed Insights' public API returned **429 RESOURCE_EXHAUSTED**, so field LCP/INP/CLS percentiles remain unavailable. No tracking was installed to obtain them. Future approved deployment should be checked on real devices and later against available CrUX/Search Console field data. Google's [LCP optimisation guidance](https://web.dev/articles/optimize-lcp) distinguishes field experience from diagnostic lab runs.

## Font, CSS, JavaScript, SVG and animation findings

| Area | Evidence | Decision |
| --- | --- | --- |
| Fonts | Self-hosted WOFF2, `font-display: swap`; Archivo and regular Plex Sans already preloaded. Archivo is 90,104 bytes and supports variable weight/stretch; other faces load as needed | Keep typography and preloads. No extra competing preload, third-party font origin, narrowed font axes or font replacement |
| CSS | Main CSS is render blocking, roughly 21KB gzip locally; Lighthouse reports unused rules because one stylesheet serves many page types | Change only mobile critical-text animation eligibility. Do not purge selectors for other pages, quote UI, chatbot or #16 TOC |
| JavaScript | Existing scripts use `defer`; assistant KB loads on demand. Script evaluation is small relative to style/layout/render work in traces | Preserve navigation, chatbot, drawing, forms and disabled lead guard. No speculative lazy chatbot rewrite |
| SVG | Inline facade/product diagrams; no external hero-image fetch. SVG-only diagnostic did not establish a meaningful gain | Preserve artwork and animation |
| Animations | Mobile headline and introduction start invisible; fixed-throttle LCP shifts later as they enter | Remove just their mobile entrance delay. Keep desktop and all remaining effects |

## Verification and reproduction

- `npm run check`: **68/68** tests, 50 HTML pages, 49 indexable routes; link and SEO checks report zero problems.
- `node --test scripts/mobile-performance.browser.mjs`: **4/4**. Covers 390/760/761/1440px boundaries, reduced motion, mobile navigation, chatbot opening/answering, adding a window to the quote schedule, booking/date field, contact page, guide anchors, disabled direct lead capture, page errors and overflow on sampled routes.
- Red/green evidence: the new mobile assertion failed on unchanged CSS with `animation: vxUp`, opacity 0 and translated text; the three other browser checks passed. All four passed after the fix.
- The CI workflow runs the existing suite and an independent browser job with pinned Playwright. No site runtime dependency was added.
- Independent review found no actionable issues in the CSS change and browser regression coverage.

For local Windows checks, install audit tooling in a separate temporary folder (free tools), then point to it:

```powershell
npm.cmd install --prefix "$env:TEMP/veltrix-audit-tools" --no-package-lock --no-audit --no-fund playwright@1.64.1 lighthouse@13.6.0
$env:PLAYWRIGHT_MODULE = "$env:TEMP/veltrix-audit-tools/node_modules/playwright/index.mjs"
$env:CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
npm.cmd run check
node --test scripts/mobile-performance.browser.mjs
node scripts/measure-mobile.mjs "$env:TEMP/veltrix-after"
```

To measure the control with the exact same runner, build a separate checkout of the base commit, set `VX_AUDIT_ROOT` to its `dist` directory, and rerun into another output directory. Remove that environment override before measuring the changed build. Compare medians and all individual samples; do not cherry-pick the fastest run. Lighthouse can be reproduced with the pinned CLI and `--chrome-flags="--headless=new" --only-categories=performance,accessibility,best-practices,seo` against a local server or the deployed HTTPS URL. Keep the origin and throttling mode consistent within a comparison.

Raw traces and full Lighthouse reports stay in the local audit folder, not the public repository. The compact committed JSON records the samples, browser/settings, candidates and limitations needed to assess the claim.
