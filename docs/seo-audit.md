# SEO, GEO and AEO audit

Review date: 27 October 2026. Repository: SunnyButt09000/daniweb.
Base: `claude/upvc-windows-doors-site-jj8slj` at `ddef06a`.
Development branch: `codex/seo-geo-aeo-audit-20261027`.

## Scope and findings

The existing static build already produces one JSON-LD graph per indexable
page, a sitemap, robots.txt, visible FAQs and llms.txt. These were retained;
no parallel schema blocks, duplicate FAQs, extra sitemap or AI file were added.

| Finding | Action |
| --- | --- |
| Generic titles on services, FAQ, guides and quote pages | Added descriptive search titles using existing page subjects; retained visible headings and navigation. The regulations guide title now identifies England. |
| Quote description could read like an immediate price | Clarified that the builder sends a schedule for an estimate, with the fixed price after survey. |
| Business schema asserted a price range of ££ and a GB-wide contact service area | Removed these unsupported assertions. Confirmed service-area fields are empty; no towns, postcodes or coverage claims were added. |
| Service and Article entities linked from WebPage but lacked the inverse relationship | Added mainEntityOfPage using the existing WebPage ID, without adding another entity. |
| Article author redefined the business ID with an /about/ URL instead of its homepage URL | Referenced the existing business entity, which already contains its name and canonical URL. Visible team bylines remain intact. |
| Canonical URLs, Open Graph URLs and sitemap | Already consistently use https://veltrixwindowsdoor.co.uk and existing trailing-slash routes. Retained and added validation. |
| Internal links | No broken links found. Extended the checker to cover relative links, same-origin absolute URLs and fragments on other pages. |
| Helpful original content | Improved the measuring guide with a comparison checklist, advice to avoid subtracting fitting allowances, and a survey link when safe measurement is not possible. Retained blank dimensions: the builder labels them “to be confirmed.” |
| Existing SEO documentation contained unsupported dated search-update claims | Replaced those claims with links to Google's published guidance. |
| Private address protection | Address fields and registered office are blank and were left blank. No residential address was sought, added or exposed. Build/documentation advice now explicitly excludes private residential addresses. |

## Owner confirmation required

**Business hours conflict:** the website's configured service hours and chat
hours are **07:00–23:59, Monday–Sunday**. The Google Business Profile is
**reported by the owner/request to show 24-hour hours**. This profile setting
was not independently authenticated in this audit.

The owner needs to confirm the actual service hours and message-response hours,
and whether any 24-hour availability has a different meaning. Then reconcile
the website, FAQs, structured data, assistant information and Business Profile
together. **No hours were changed automatically**, and no Profile edits were made.

**Service area:** areaServed, serviceAreas and postcodePrefixes are empty.
Supply the real coverage before introducing local content or local keywords.
No location pages or claims of national coverage were added.

**Business identity and existing guarantees:** confirm the appropriate public
business identity and any publishable business address without exposing a
private home. Existing configuration includes a 10-year installation guarantee,
12-month repair guarantee and insurance-backed flag; these were not newly
introduced or independently verified. Confirm them against actual terms.
Accreditations, testimonials and social/review URLs remain empty.

## Structured-data interpretation

The HomeAndConstructionBusiness graph remains useful descriptive Schema.org
data. An address is required for Google's LocalBusiness rich-result eligibility;
with the address intentionally absent, do not claim that this audit makes it
eligible. Do not invent an address to satisfy a tool.

The existing product-model catalogues are descriptions of made-to-measure
options, not priced stock. No prices, ratings, availability, certifications or
review markup were invented to chase Product rich results. Existing FAQs are
kept in sync with visible answers; no FAQ rich-result promise is made.

The checks validate JSON syntax, unique graph IDs, reference resolution,
identity/hours consistency, main-entity relationships, FAQ visibility,
breadcrumbs, Article dates and metadata. They are targeted output checks, not
a complete Schema.org vocabulary validator or a substitute for Google's Rich
Results Test. Search indexing, rich results and inclusion in AI answers are not
guaranteed.

## Verification

- Baseline: npm run check passed, 48 pages and no broken internal links.
- Final: npm run check builds all 48 pages, checks local links and fragments,
  verifies SEO/discovery output for 47 indexable pages, and runs four schema
  regression tests.
- html-validate 10.17.0 with the standard preset: all generated HTML passed;
  baseline and final JSON reports contained no findings.
- sitemap.xml parsed with an XML parser: 47 URLs, no duplicates, all matching
  indexable canonical URLs; 404 remains noindex and outside the sitemap.
- Negative controls in a separate temporary output copy: a broken cross-page
  fragment, wrong canonical origin, invisible FAQ and duplicate sitemap entry
  were each rejected by the new checks.
- Baseline/output comparison: identical output file/route sets; 47 page bodies
  unchanged after cache-version normalization. Only the measuring-guide body
  changed. All form markup and runtime configuration remained identical after
  cache-version normalization.
- All generated assets, including CSS, JavaScript and assistant kb.json, remained
  byte-identical. robots.txt, llms.txt, manifest and host headers also remained
  byte-identical. No interactive browser or live enquiry submission was needed
  to validate these unchanged files; no browser interaction test is claimed.
- lastmod changes are limited to pages whose titles, descriptions or body
  changed. Only the edited measuring guide received a new visible article date.
- Review the complete diff and run git diff --check before committing.
- No Cloudflare, production branch, deployment configuration or Business
  Profile changes were made. Submit a draft PR only; merging or deploying
  requires the owner's explicit approval.

Reproduce with Node 18+:

```sh
npm run check
npm exec --yes --package html-validate@10.17.0 -- html-validate --preset standard dist
git diff --check
```

The optional HTML validator may require a newer Node version than the site's
dependency-free build; this audit ran on Node 26.3.0. It is not a runtime
dependency.

## Sources

- [Google: AI features and your website](https://developers.google.com/search/docs/appearance/ai-features):
  ordinary SEO, crawlable helpful content and consistent structured data remain
  relevant; no special AI schema or text file is required.
- [Google: title links](https://developers.google.com/search/docs/appearance/title-link):
  descriptive, concise titles; search-result truncation is based on available
  width, not a mandatory character limit.
- [Google: local business structured data](https://developers.google.com/search/docs/appearance/structured-data/local-business):
  eligibility requirements, including address, and limits on review markup.
- [Schema.org: mainEntityOfPage](https://schema.org/mainEntityOfPage):
  the inverse of mainEntity.
