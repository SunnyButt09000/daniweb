# Technical SEO and buyer-advice continuation — 28 October 2026

Based on latest default commit `6ceee5c1deb5ab6c2fcafee1d074bc48ce9bf904`, [Issue #17](https://github.com/SunnyButt09000/daniweb/issues/17) and the latest [Issue #11](https://github.com/SunnyButt09000/daniweb/issues/11) comments. PRs #9/#12/#13/#14/#15/#16 are merged and preserved. This branch is independent of the mobile-performance PR, with no merge or production deployment authorisation.

## Code changes

Existing product/repair **detail** pages did not link directly to applicable buyer guides. Guide recommendations within articles, added by #16, did not cover visitors beginning on these service pages.

Added a small, labelled “Useful guides” aside beside existing detail-page FAQs, using existing typography:

- All window products: existing measuring and energy-rating guides.
- uPVC/composite front-door products: existing comparison and maintenance guides.
- Other door products: existing general maintenance guide.
- Misted-glass repair: existing repair-or-replace guide.
- Lock, hinge, alignment, draught and patio/bifold repairs: existing maintenance guide.
- Glass/panel replacement and security-upgrade repair pages receive no generic recommendation without a directly matching article.

**19 existing routes** gain contextual advice. No new page, article, price, product specification, commercial promise, schema type, review, location or certification. Original guide bodies, table of contents and related-guide selections are unchanged. Existing links and primary quote/contact actions stay in place. Generated content hashes/dates are refreshed for those 19 changed routes only; a date is not evidence of a new Google crawl.

Files: `lib/pages.mjs`, `scripts/seo-regression.test.mjs`, `src/data/lastmod.json`, updated `docs/seo-phase1/issue11-backlog-status.md`, this report, and `docs/seo-phase1/cloudflare-canonical-redirect-20261028.md`.

## Live technical audit

Read-only public checks around 02:50 UTC, 28 October. No enquiry submission or Google/account change.

| Check | Observed evidence |
| --- | --- |
| Sitemap | HTTPS `sitemap.xml` returned 200; **49 URLs** |
| HTTP HTML crawl | **47/49** URLs returned 200 through Node fetch, with one H1, self canonical, unique title and description, and no meta/header noindex. Two URLs had transport failures, not HTTP errors |
| Independent transport recheck | Isolated certificate-validating Chrome loaded the two affected pages, `/windows/casement-windows/` and `/windows/bay-and-bow-windows/`, with **200**, one H1, correct canonical/metadata, index/follow and direct lead capture false. Combined clients therefore accessed **all 49**, not a claim that the original HTTP crawl was flawless |
| Completed #16 work | All **eight** live buyer guides contain article section navigation. Do not recreate it |
| Product schema | No ineligible retail `Product` node found in the 47 successful HTTP page bodies, including other product pages; no invented price/review data added. Google's historical invalid-item count was not rechecked |
| Robots and machine summary | `robots.txt` and `llms.txt` returned 200. These endpoints do not establish actual indexing or AI citations |
| Missing path | A deliberately nonexistent HTTPS path returned **404** |
| Host consolidation | HTTP apex, HTTP www, HTTPS www and HTTPS apex `/contact/?source=seo-audit&x=a%20b&x=c` all returned **200** with no Location header. Required canonical-host 301s are absent in this sample |
| Google field metrics | Public PageSpeed API returned **429 RESOURCE_EXHAUSTED**. No CrUX percentile or field CWV pass obtained |
| Cloudflare account | Existing CLI token rejected by GET-only zone lookup: **403 / 9109 Invalid access token**. Browser runtime unavailable. Existing rule order, SSL mode and Worker custom-domain/routes remain **unverified** |

Successful indexability checks are not proof of Google index inclusion, rankings, public Maps visibility or rich-result acceptance. Mixed-client success is documented explicitly so transport limitations are not misreported as a production outage. An asset hash alone was not treated as deployment-SHA evidence; platform line endings can change the build asset hash.

## Redirect proposal — not applied

The [exact Cloudflare Single Redirect proposal](cloudflare-canonical-redirect-20261028.md) matches only the apex/www website hosts when HTTP or www is requested, sends 301 to HTTPS apex plus the same path, and preserves the original query string. It includes a disabled reference rule object, account preflight, rule-order/SSL/Worker inspection, encoded query/path tests, real 404 tests, HSTS-aware verification and rollback. It requires no paid feature.

**Owner approval and working account access are required before creation or activation.** No account rule, DNS, SSL, Worker route, production build or lead-capture setting was changed. Existing conflicting redirects must be inspected first; local examples cannot validate an inaccessible production ruleset.

## Backlog and business evidence

The [C01–C25 reconciliation](issue11-backlog-status.md) now reflects the actual merged PRs. Previously delivered FAQs, warranty distinctions, booking validation, accessibility repairs, Product-schema correction, isolated lead staging and article navigation were not repeated. This PR closes only the detail-page advice gap.

Further commercial claims/features need actual supplier/manufacturer terms, approved legal/contracting responsibilities, real partner/coverage and scheme evidence, confirmed price/SKU data, or genuine consented work/reviews. No verified new source for those facts was available. No duplicate local pages, generic new articles, paid research, outreach, fabricated authority signals or scheduled monitoring were introduced.

Google verification is deferred as requested: the latest handoff says GBP Verified and Search Console sitemap Success (47 on its last read versus 49 live). Actual public listing visibility, current indexing/performance counts, recrawl resolution of historical Product warnings and Bing status have not been independently verified in this continuation. Account access does not block this development PR.

## Validation

- `npm run check`: **70/70 tests passed**, including the existing #16 navigation assertions and two new generated-page link regressions.
- All **50** generated HTML pages and **49** indexable routes pass link/SEO checks with zero problems; no additional route is generated.
- Red/green: the contextual-advice test failed on the unmodified build with “No contextual buyer advice: windows/casement-windows”; passed after the helper/links were added.
- Browser smoke checks cover mobile navigation, chatbot, quote schedule, booking and contact without submitting personal data. Direct capture stays disabled.
- Independent review and exact PR/check links are supplied in the completion report. No PR merge or production deployment.
