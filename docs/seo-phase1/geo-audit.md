# Veltrix — GEO / AI-search readiness audit

**Audit date:** 27 October 2026  
**Basis:** Phase 1 candidate code at commit `4905082a2e91241c661143ada5f98769c6e94710` plus official Google/Bing webmaster guidance. This is an evidence-and-implementation audit, **not** a claim of AI-system ranking, citation, or indexing.

## What GEO means here

Generative Engine Optimisation (GEO) is making public content accurate, accessible, unambiguous and useful for search and AI answers. Google explicitly states there are **no additional technical requirements** for AI Overviews or AI Mode beyond being eligible for indexed search with snippets. Avoid “AI magic tags”, invented entity IDs and unsupported markup. Sources: [Google AI features](https://developers.google.com/search/docs/appearance/ai-features), [Google AI optimisation guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide).

## Verified in candidate source

| Area | Verified source and state | Assessment |
| --- | --- | --- |
| Canonical identity | `src/data/site.json`, `lib/layout.mjs`: site URL, name, published phone/email, `WebSite` and stable business `@id` | Present. Preserve the existing identifiers. |
| Cross-page structured data | `lib/layout.mjs` generates connected business/site/webpage graph; product, repair, article and FAQ nodes generated where appropriate | Good foundation. Continue validating against visible on-page text. |
| Crawl and discoverability | `build.mjs`: sitemap, canonical URLs, robots allowing public pages, private chatbot dataset excluded from robots, page metadata | Present. Crawl permissions do not equal indexing. |
| Optional `llms.txt` | `build.mjs` generates public business, product, guide and FAQ summary with canonical links | Useful machine-readable reference for consumers that choose to use it; **not** a Google ranking factor or guaranteed AI inclusion mechanism. |
| Partner service accuracy | Candidate `site.json` has empty `areaServed`, `serviceAreas`, `postcodePrefixes` and no public address; installation/booking text requires postcode/partner checks | Correctly does not assert national coverage, individual offices or pre-contracted installers. |
| Public contact hours | 07:00–24:00, every day; Phase 1 candidate explains these are **contact hours** | Human-facing clarification exists. **Review risk:** business `openingHoursSpecification` in JSON-LD is sourced from `hours` while on-page text describes contact availability. Decide whether to move hours semantics to `ContactPoint.hoursAvailable` before future release; do not change without agreement or tests. |
| Claims and authority | FAQs, guides and service pages contain practical windows/doors information and national-regulation distinctions | Useful topical evidence, but **actual guarantees, insurance, partner scheme membership, and product ratings remain owner-evidence-dependent**. |
| Google indexing | GSC reported sitemap Success/47 URLs discovered while Page Indexing and Performance were processing on 27 Oct | No confirmed indexed count, clicks or impressions yet. |
| Bing submission | Owner reported site verification and submitted sitemap “Processing” | No confirmed Bing indexed count or AI citations yet. |

## Implemented GEO hardening on this follow-up branch

1. Add two straightforward, customer-facing questions about installation across UK cities and the identity of the fitter, using cautious wording. They flow through the existing FAQ page, assistant knowledge base, `llms.txt` and visible FAQ markup.
2. Add regression checks for the new factual answers and public/private data boundaries without adding unverified `areaServed` or fake reviews.
3. Preserve working schema identity, route structure, contact hours, contact methods, service coverage configuration and existing deployment settings.

## What we deliberately did not do

- No duplicate doorway city pages, fictional service addresses or fabricated customer projects.
- No “AI-optimised” schema type that isn't supported, fake `sameAs`, fake local `Place`, review stars, prices or blanket `areaServed: United Kingdom`.
- No claim that `llms.txt`, `FAQPage`, AI bot allowlists or a sitemap will cause a particular model to recommend Veltrix.
- No vendor-specific crawler-policy changes. Google-Extended controls certain Google AI uses, **not** ranking in Google Search; deliberate crawler-access policy changes should be owner-approved. [Google common crawlers](https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers).

## Next evidence-driven checkpoints

1. When GSC data appears, compare actual indexed URLs to canonical sitemap; correct specific indexing reasons rather than republishing the sitemap.
2. In Bing Webmaster Tools, inspect sitemap and, if available, **AI Performance**: Total Citations, Average Cited Pages, grounding queries, page-level citations, time trends. These are actual observations, not rankings or guaranteed availability. [Bing AI Performance announcement, February 2026](https://blogs.bing.com/webmaster/2026/2/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview/).
3. Once owner confirms real partner regions, create accurate coverage info; **do not** create dozens of templated city pages.
4. Seek documentary evidence for insurance-backed protection and numerical warranty claims before treating those as verified facts.
5. Check on-page and JSON-LD contact-hour semantics with stakeholder approval.
6. Review any content edits for factual provenance and test chatbot/FAQ/structured data parity.

## Release gate

This follow-up is **on a review-only branch** stacked on Phase 1 PR #2. Do not merge into the production branch or deploy without explicit final owner approval. Any generated FAQ availability statement is **conditional**, not a service promise.
