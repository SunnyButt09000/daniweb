# Issue #11: contact-hours semantics and cross-site promises

**Review-only follow-up to the Issue #11 comment posted at 23:47 UTC on 27 October 2026. No production deployment or Google account change.** This branch builds on PR #12 head `fe57ef3`; it does not repeat or modify that PR's branch. The proposed PR is intentionally stacked against `chatgpt/veltrix-trust-booking-fixes-20261027`, not production, so its diff contains only this follow-up. PR #9 is untouched.

## Confirmed discrepancy and correction

`site.hours` is owner-confirmed **contact/enquiry** availability, 07:00–24:00 every day. It was emitted as business `openingHoursSpecification`, despite visible wording saying it is not guaranteed survey/fitting attendance. The generated business entity now emits those unchanged times under **`contactPoint.hoursAvailable`**, with midnight represented as `00:00` on the following day. Business opening/attendance hours remain omitted until verified. [Schema.org](https://schema.org/hoursAvailable) explicitly supports this property on ContactPoint with OpeningHoursSpecification values. This is a factual semantic correction, not proof of Google rich-result eligibility or GBP approval.

Public phone, email, trading name, hidden/empty address, empty service areas, visible hours, booking slot options and browser opening/contact calculations are unchanged. Existing hours and generated SEO checks now verify the correct contact property and reject a renewed business-attendance assertion.

## Promise consistency across website and assistant

The existing owner-approval document does not establish universal free survey/travel availability, bundled waste disposal/protection/making-good, repair completion times or blanket return visits. PR #12 fixes six FAQ answers but does not reconcile the shared templates, metadata, service lists, PDF or assistant's hard-coded survey flow. This follow-up:

- Changes shared survey/quote CTAs into enquiries and fee/availability checks; keeps all destinations and form field values intact.
- Preserves the possibility of a free survey in the direct FAQ answer, explicitly requiring postcode/job availability and agreement of any survey, travel or diagnostic charges. It does **not** assert that every survey has a fee or that no free offer exists.
- Replaces unqualified “Free survey” product metadata, survey service title/description, booking display labels, guide text, quotation PDF line, llms quote summary and hard-coded chatbot replies with consistent qualification.
- Presents installation/service lists as **Confirm in your quote**, distinguishing agreed scope, waste/protection responsibilities, charges and separate guarantee terms instead of automatic inclusions.
- Changes about-page removal/aftercare promises to written scope and named aftercare checks; removes unsupported “usually/most/one visit/about an hour” repair expectations while retaining fault, part, measurement and access explanations.
- Keeps PR #12's six corrected FAQ answers, two trust FAQs and UK-calendar booking validation unchanged; the additional FAQ changes concern survey pricing, making-good and the remaining fixed glass-replacement timing claim.

No supplier, partner, price, accreditation, review, physical presence, guaranteed appointment or new coverage has been invented. This is not a substitute for genuine operational evidence. Product guarantee scope remains the owner-confirmed 10 years on new products by the manufacturer; written manufacturer terms still require review. No new marketing tracker or receipt backend was activated.

## Scope and tests

All existing routes remain: **50 generated HTML documents / 49 indexable URLs / no new pages**, with zero link/SEO errors. Shared CTA text occurs on many pages, so the correction spans the site. `lastmod.json` is regenerated from genuinely changed page title/description/main-body fingerprints; it is not used as evidence of Google crawl or indexing. Shell/schema-only changes by themselves are not represented as substantive main-content updates.

**`npm run check`: 47/47 PASS** on this branch, including PR #12's 42 existing tests and five new consistency regressions. The first four new tests were observed failing before implementation; the repair expectation test was also run failing against the unsupported visit/FAQ wording before its correction. Existing hours and SEO checks were adapted to require ContactPoint availability rather than weakened or removed.

The tests inspect all 50 rendered HTML files, 49 business graphs, current FAQ answers, generated chatbot knowledge, hard-coded chatbot replies, PDF text and llms summary for the targeted inconsistencies. JSON-LD parses and contact midnight values agree. The non-indexable 404 document has no business graph and is checked separately for noindex.

An isolated integration tree with PR #12, this patch and the separate accessibility patch passes **51/51**. Its package command explicitly retains **both** new test suites; a future approved merge may need this one-line package-script conflict resolution. No branch was merged to production or into another PR. The shared layout changes applied cleanly in that integration tree.

The combined tree was checked in isolated Chrome at 1440px/390px: navigation, keyboard/Escape, focused mobile contact action, hidden-link inert behaviour, chatbot guarantee answer, contact validation/intercepted WhatsApp destination, quote list and actual PDF generation pass, with zero external sends/page errors. Six pages at both widths have zero axe A/AA violations in stable reduced-motion tests. These are bounded browser samples, not a full accessibility certification; the accessibility fix is separately reviewed in PR #13. PR #12 booking/trust-FAQ browser checks remain valid and unchanged.

Raw screenshots, test PDFs and logs stay outside Git. No private customer/test values, keys, populated Cloudflare config or Google identifiers are published.

## Release and remaining work

Keep this PR, PR #12 and PR #13 draft until independent review and explicit release approval. PR #12 is this PR's base; do not retarget to production until its reviewed changes are present there. Retain both accessibility and promise tests when eventually combining approved work. Production lead settings remain empty, the release flag is unset and PR #9 remains draft/unmerged.

Actual GBP publication/eligibility and GSC/Bing coverage remain **UNVERIFIED—NO ACCOUNT SESSION**; the separate Issue #11 verification report records the access failure and read-only checklist. Nothing here changes Google profile hours, category, name or areas. HTTP/www canonical redirect changes remain a separately documented approval request. Manufacturer terms, actual partner/aftercare responsibilities and precise survey/repair charges still need owner evidence. No DNS, Worker routes, credentials, authentication, Turnstile, email routing, paid service or production deployment was changed.
