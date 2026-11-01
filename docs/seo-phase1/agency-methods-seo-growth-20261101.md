# Veltrix UK SEO growth: agency-method research and implementation playbook

**Research date:** 2026-11-01. **Scope:** commercial, service and informational organic Google/Bing search for verified Veltrix UK windows/doors/glazing/repair services. **Owner goal:** qualified enquiries, free-survey requests and completed jobs, not arbitrary article volume. **Status:** research+implementation playbook; no traffic gain asserted by this document.

## Executive conclusion

Professional SEO campaigns typically combine technical availability and indexability; high-intent keyword/page mapping; distinct, useful page copy; editorial internal links; genuine third-party trust signals; and ongoing conversion measurement. *No legitimate tactic guarantees organic traffic in days*. Google says ordinary recrawling often takes three days or more, while the effect of SEO changes can take weeks to months. A 100-article monthly quota is not a Google rule.

**Why fast traffic case studies cannot be copied wholesale:** [The SEO Works — WallpaperMural](https://www.seoworks.co.uk/case-studies/internal-linking-seo/) claims +65,000 monthly users from a broader category/content/linking initiative; [Semrush — Picsart](https://www.semrush.com/company/stories/picsart/) reports 20% click growth after mass contextual linking on 300+ pages; [Slingshot Marketing — national glass structure installer](https://www.slingshot-marketing.co.uk/glass-structure-seo-case-study) reports organic clicks 248 to 831 from May 2025 to March 2026 following structural and SEO improvements. These are marketing case studies, not isolated, independent proof that one technique produces the same results for a new 49-URL site. Massive automated internal links are inappropriate for Veltrix.

## The two distinct link systems

- **Internal links** connect Veltrix service pages, guides and category hubs. They help people navigate, reveal relationships and make URLs discoverable. Use real `<a href>` HTML anchors and descriptive, non-stuffed text. Every important indexable page should have at least one incoming crawlable link; there is **no magic link number**. Source: [Google link best practices](https://developers.google.com/search/docs/crawling-indexing/links-crawlable), [Bing Webmaster Guidelines](https://www.bing.com/webmasters/help/bing-webmaster-guidelines-30fba23a), [Ahrefs internal linking](https://ahrefs.com/blog/internal-links-for-seo/).
- **Backlinks** are editorial links from other businesses or publications to Veltrix. Focus on legitimate supplier relationships, completed joint project references, accurate industry directories, recognised trade associations where eligible, and useful original resources. Never buy PageRank links, automate spammy link placement, create private blog networks, or swap reciprocal links solely to manipulate rankings. Source: [Google spam/link schemes](https://developers.google.com/search/docs/essentials/spam-policies), [Bing link guidance](https://www.bing.com/webmasters/help/link-building-7a3f99b7), [Ahrefs legitimate local outreach](https://ahrefs.com/blog/local-link-building/).

## Search-first commercial priorities for this site

| Cluster | Primary existing URL | Distinct customer intent / route |
| --- | --- | --- |
| Broken glass; glass-only pane/sealed-unit replacement | `/repairs/glass-and-panel-replacement/` | Broken window/door glass; keep sound frame; measured quote |
| Misted/blown glazing | `/repairs/misted-double-glazing/` | Failed seal vs surface condensation; replace sealed unit |
| Door lock / multipoint gearbox | `/repairs/locks-and-mechanisms/` | Repair a jammed or stiff lock, not necessarily replace door |
| Hinges, handles, window mechanisms | `/repairs/handles-and-hinges/` | Repair window/door hardware |
| Dropped doors | `/repairs/door-alignment/` | Realign first, decide if lock replacement required |
| Drafts, leaks, seals | `/repairs/draughts-and-leaks/` | Distinguish seal/drainage issues from new glazing |
| Patio/bifold repair | `/repairs/patio-and-bifold-repairs/` | Roller, track, hinge, lock, panel adjustments |
| New uPVC / composite / French / patio / bifold / stable doors | `/doors/` and six existing category pages | Survey, supply-only/fitted, security, accurate quote |
| New casement / flush / tilt-turn / sash / bay/bow / sliding / shaped windows | `/windows/` and seven existing pages | Sizes, applications, materials, quote |
| Installation/maintenance | Existing `/services/` routes | Separate supply/fitting/repair; postcode and partner availability |
| Informational comparison and regulations | Existing `/guides/` articles | Answer question, contextual link to matching commercial service |

**Current first-party evidence:** 1–29 Oct 2026 Google Search Console query extraction yielded 82 query rows, 334 reported impressions and zero clicks; UK-by-country query extraction yielded 81 rows and 332 impressions, zero clicks. A Bing query extraction returned no rows. These figures are *not the market's monthly search volumes*; minor 1-impression rankings alone are not a sound national priority signal.

## Internal-link architecture and the first fixes

Use: **homepage → windows/doors/repairs hub → individual service/product → appropriate guide → matching quote/booking**, with distinct contextual links in both directions. No universal sitewide exact-match links.

1. `/guides/misted-double-glazing-repair-or-replace/` already links to `/repairs/misted-double-glazing/`. Add a *different* contextual link from the guide to `/repairs/glass-and-panel-replacement/` specifically for **cracked glass instead of mist**. (Implement via review branch; this PR.)
2. Preserve new `/repairs/glass-and-panel-replacement/` → `/repairs/misted-double-glazing/` link introduced by PR #28.
3. Preserve sliding-windows → glass-only repair link introduced by PR #30. Do not repeat the same link six times per page.
4. Existing maintenance guide already links to five repair categories: **do not duplicate** those anchors for a cosmetic SEO score.
5. Run zero-dependency `npm run audit:internal-links` to quantify the canonical URL graph, inbound links, and editorial-context link coverage. Investigate underlinked pages; reports are not ranking or link-authority scores.
6. Use Search Console page-query mapping, actual customer enquiries and internal audit together to select the next contextual link. Document source, target, anchor wording and intent before change.

## Ethical, zero-paid-spend authority acquisition

- Verify actual supplier/product partner relationships and request that genuine partner pages reference the relevant Veltrix category page where helpful.
- Create a *real* completed project example only after owner supplies permission, factual before/after evidence, actual work location (coarse if appropriate), specification, photos and responsibilities.
- Claim existing accurate unlinked brand references **only after verifying they refer to this exact business**. Local citations can help consistency but bulk low-quality directories are not useful.
- Offer a technically accurate original homeowner resource (for instance repair-vs-replace troubleshooting or glass measurement guidance), supported by qualified trade evidence; only pitch genuinely relevant editors/partners.
- No fabricated Manchester office, false geographic claims, fake accreditation, unqualified emergency/24-hour fitting promise, fictitious customer quotes, bought follow links, paid SEO vendor probes, fake reviews or AI mass link networks.
- GBP policy issue: in-person customer contact/lead-generation eligibility matters even if an existing GBP is verified. Do not edit the listing without evidence and separate review. [Google Business eligibility](https://support.google.com/business/answer/13763036) and [service-area guidelines](https://support.google.com/business/answer/9157481).

## Outcomes timeline and acceptance criteria

**Days 1–7: prove changes, not traffic.**
- Collect baseline page/query impressions, clicks, CTR, position, canonical/index status; distinguish missing values from zero.
- Verify internal links, robots/sitemap and real mobile booking/WhatsApp paths; match live deployed code to tested PR commit.
- Implement the highest-confidence missing internal links and content gaps first; no URL churn or duplicate page creation.
- Report: pass/fail checks, pages updated, canonical routes reachable, *actual* conversions if independently tracked. Organic impressions may be unchanged.

**Days 8–30: monitor discovery and initial search reaction.**
- Compare Google Search Console *same-window, same-dimension, similar finalised dates*, exclude incomplete recent days. Segment by service and URL rather than presenting property totals as UK search demand.
- Watch existing query positions 4–20 with credible impression volume, snippet CTR, missing internal link routes and service clusters with genuine intent.
- Do a manual SERP sample with location/device/intent recorded; avoid claiming a global rank from one personalised session.
- Publish only distinct needed content; source meaningful evidence, rather than 100 AI articles.

**Days 31–90: scale what produces qualified enquiries.**
- Track organic assisted phone calls, WhatsApp and repair forms using consent/privacy-aware event measurement and agreed definitions for qualified leads. No live API lead capture activation without approval.
- Evidence-led category expansion, conversion optimisation and follow-up with verified partners.
- Maintain original photos, real service areas/availability, industry-grade technical accuracy and editorial outreach logs.

## Metrics and reporting

**Leading indicators:** live 200/indexable route; correct canonical; no broken links; incoming editorial links; impressions per target URL/query; average position with impressions context; click-through rate only where defined; page speed (LCP, INP, CLS) without inventing field data.

**Business indicators:** tracked organic sessions, enquiries, WhatsApp message submissions, calls, surveys booked, qualified quotes, completed jobs, revenue per channel. Attribute source carefully—site clicks are not sales.

**Guardrails:** no multiple sitemap resubmissions daily; no attempt to use Google Indexing API for ordinary window/door pages (limited to JobPosting/BroadcastEvent VideoObject). [Google recrawl expectations](https://developers.google.com/search/docs/crawling-indexing/troubleshoot-crawling-errors), [Indexing API scope](https://developers.google.com/search/apis/indexing-api/v3/quickstart), [Core Web Vitals](https://developers.google.com/search/docs/appearance/core-web-vitals).

## Owner backlog integration

The existing GitHub SEO execution tracker issue #29 remains open. Next workflow after this internal-link PR is to take a **distinct** existing repair page (locks, hinges, leaks, patio/bifold) and enrich it only where query evidence, gaps or conversion friction demonstrate a need. Separate that work from Google/Cloudflare configuration, keep tests + lastmod + production visibility gating mandatory.
