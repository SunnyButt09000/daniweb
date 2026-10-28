# Measured mobile performance implementation plan

**Goal:** Reduce mobile hero text render delay without changing the finished design or any enquiry workflow.

**Architecture:** Keep the current static build, font files, deferred scripts, SVG artwork and desktop motion. Limit the existing headline and introduction entrance animations to widths above 760px. Ship browser evidence alongside the CSS change. Implement inline in this fresh checkout; do not merge or deploy.

**Tech stack:** Node static generator; CSS media queries; isolated Playwright/Chrome and Lighthouse audit tools (no new site dependencies).

**Spec:** Owner request and GitHub Issue #17, based on default commit `6ceee5c1deb5ab6c2fcafee1d074bc48ce9bf904`.

## Constraints

- Preserve PR #16 article navigation and all existing content.
- No production deployment, Cloudflare/DNS/SSL/routing change or lead activation.
- No invented business evidence or new commercial claims.
- Compare cold-cache local builds under identical mobile/network/CPU settings; deployed results are a separate baseline.

## Task 1: Make mobile hero text immediately visible

Files: `src/assets/css/main.css`; optional browser checks in `scripts/mobile-performance.browser.mjs`; evidence in `docs/seo-phase1/mobile-performance-20261028.md` and a compact JSON result file.

- [ ] Before editing CSS, run a browser assertion that `.hero__lead` and `.display .ln > span` have no entrance animation at 390px. It must fail against the baseline; check desktop still animates and reduced-motion preferences still apply.
- [ ] Move only headline/lead rules into `@media (min-width: 761px) and (prefers-reduced-motion: no-preference)`. Keep actions, ticks and SVG animation rules in their existing media block.
- [ ] Rerun the browser assertion, `npm run check`, three fixed-throttle samples per home/guide/product, and Lighthouse comparisons. Reject any regression in layout, chatbot, forms, navigation, article anchors or reduced motion.
- [ ] Review diff and obtain independent review. Commit and open a review-only performance PR against the latest default branch.

## Task 2: Separate technical SEO continuation

- [ ] On another branch from the latest default, prepare a concrete Cloudflare Single Redirect rule and rollback/test checklist. Match exactly the apex/www hosts and HTTP or www; dynamic target `concat("https://veltrixwindowsdoor.co.uk", http.request.uri.path)`; 301; preserve query string. Do not apply it.
- [ ] Reconcile all C01–C25 statuses with the merged work. Review existing product/repair detail links for actual missing routes to already-published buyer advice, leaving guide navigation unchanged.
- [ ] If a genuine link gap exists, write generated-page assertions first, implement a small link-only correction, run the full suite and browser checks, and open a separate PR.
- [ ] Report exact files, PRs, lab measurements, field-data limitations, account access and business evidence blockers.
