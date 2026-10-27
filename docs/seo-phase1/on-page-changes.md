# On-page implementation and verification — Phase 1

27 October 2026. Baseline production commit: `e3b0e6ad17b5ac50e3a8f1d3c540f6f4bb310d7d`. Feature branch: `codex/veltrix-phase1-uk-seo`. **Review only; no merge or production deployment authorised by this task.**

## Scope and decisions

- [x] Fetch production and capture an immutable 48-page / 47-indexable baseline; map all 47 existing routes before changing intent.
- [x] Improve nine priority journeys/pages where content, intent or conversion wording had a demonstrated gap.
- [x] Qualify existing England regulatory examples, correct ventilation advice, preserve numerical contact hours and qualify insurance cover in page and chatbot.
- [x] Keep route architecture, styling, drawings, fonts, public contact details, configured coverage and endpoint settings unchanged.
- [x] Run generated-output, regression, browser, mobile, accessibility and lab-performance comparisons; independently review the source diff.
- [x] Prepare coverage/owner decisions and stop with a draft PR; no new public pages, cities, backend, analytics or account changes.

Generated pages **48 → 48**, indexable sitemap URLs **47 → 47**. Nine focal routes are described below. In total **31 existing routes** have changed title/description/H1/main text: the additional changes are necessary nation-scope corrections, contact-hour labels, guarantee qualification and shared product-name/related-card references. The remaining routes retain their main content; the shared header/footer now labels contact hours and shared business description is coverage-aware. This is not a claim that 31 pages gained rankings.

## Priority changes

| Existing route | Actual implemented change |
| --- | --- |
| / | Coverage-aware introduction and description; England energy/ventilation wording; conditional shared installation process; existing hero H1 retained. |
| /windows/ | Replacement-window intent, comparison section, room/opening choices, glass-only repair alternative, links to measuring, quote, installation and nation guidance. |
| /services/installation/ | Double-glazing installation intent; postcode and partner checks; supplier/installer responsibilities; written quote inclusions; nation-specific compliance. |
| /doors/composite-doors/ | Composite front door intent; retained technical explanation; conditional supplied-and-fitted quote and installation/comparison links. |
| /repairs/ | Explicit repair H1; symptom-led links to misted glass, locks, alignment and hinges; postcode/availability enquiry. |
| /repairs/misted-double-glazing/ | Misted/blown glazing service intent; separate from informational guide; size/spec/access quote factors, glass-unit request and repair-or-replace links. |
| /repairs/locks-and-mechanisms/ | Door-lock repair title/description; diagnostic link to alignment and separate window-hinge repairs. |
| /quote/ | Coverage/quote-request boundary; correct manual-PDF-attachment wording; download request rather than confirmed save; email fallback names the correct channel. |
| /book/ | Preferred-time request rather than confirmed attendance; contact hours label; postcode/service/partner checks. Existing validation and preference values retained. |

All product-specific technical explanations, model galleries and drawings remain. No new numerical price, lead time, customer/project, accreditation, office or partner fact was invented. Existing unsupported claims are recorded in owner-approvals-needed.md rather than treated as verified. The existing 10-year/12-month values are retained; insurance-backed protection is conditional on an issued policy and its terms.

## Before/after metadata and H1

The keyword CSV has the exact requested 12 columns and all 47 indexable routes. Current values are the captured production baseline; proposed values are the actual final feature output. Search terms are intent hypotheses unless supported only as vocabulary by the cited spot-check; there are no search-volume, difficulty, CPC, ranking or conversion estimates.

| Route | Previous title | Revised title | Previous H1 | Revised H1 |
| --- | --- | --- | --- | --- |
| / | uPVC Windows, Doors & Repairs \| Veltrix Windows & Doors | uPVC Windows, Doors & Repairs \| Veltrix Windows & Doors | Windows & doors, made to measure, fitted properly. | Windows & doors, made to measure, fitted properly. |
| /about/ | About us \| Veltrix Windows & Doors | About us \| Veltrix Windows & Doors | About Veltrix Windows & Doors | About Veltrix Windows & Doors |
| /book/ | Book a survey or repair \| Veltrix Windows & Doors | Book a survey or repair \| Veltrix Windows & Doors | Book a survey or repair | Book a survey or repair |
| /contact/ | Contact us \| Veltrix Windows & Doors | Contact us \| Veltrix Windows & Doors | Talk to us | Talk to us |
| /doors/ | UPVC & composite doors \| Veltrix Windows & Doors | uPVC & composite doors \| Veltrix Windows & Doors | uPVC & composite doors | uPVC & composite doors |
| /doors/bifold-doors/ | Bi-fold doors: made to measure & fitted \| Veltrix | Bi-fold doors: made to measure & fitted \| Veltrix | Bi-fold doors | Bi-fold doors |
| /doors/composite-doors/ | Composite doors: made to measure & fitted \| Veltrix | Composite front doors \| Veltrix Windows & Doors | Composite doors | Composite front doors |
| /doors/french-doors/ | French doors: made to measure & fitted \| Veltrix | French doors: made to measure & fitted \| Veltrix | French doors | French doors |
| /doors/patio-doors/ | Sliding patio doors: made to measure & fitted \| Veltrix | Sliding patio doors: made to measure & fitted \| Veltrix | Sliding patio doors | Sliding patio doors |
| /doors/stable-doors/ | Stable doors: made to measure & fitted \| Veltrix | Stable doors: made to measure & fitted \| Veltrix | Stable doors | Stable doors |
| /doors/upvc-doors/ | uPVC front & back doors: made to measure & fitted \| Veltrix | uPVC front & back doors: made to measure & fitted \| Veltrix | uPVC front & back doors | uPVC front & back doors |
| /faq/ | uPVC windows & doors: prices, repairs & fitting FAQs \| Veltrix | uPVC windows & doors: prices, repairs & fitting FAQs \| Veltrix | Frequently asked questions | Frequently asked questions |
| /guarantee/ | Guarantees & aftercare \| Veltrix Windows & Doors | Guarantees & aftercare \| Veltrix Windows & Doors | Guarantees & aftercare | Guarantees & aftercare |
| /guides/building-regulations-for-replacement-windows/ | Replacement windows: Building Regulations in England \| Veltrix | Replacement windows: Building Regulations in England \| Veltrix | Replacement windows and Building Regulations: a homeowner’s guide | Replacement windows and Building Regulations: a homeowner’s guide |
| /quote/ | Window & door quote builder \| Veltrix Windows & Doors | Window & door quote builder \| Veltrix Windows & Doors | Build your quote | Build your quote |
| /repairs/ | uPVC window & door repairs \| Veltrix Windows & Doors | uPVC window & door repairs \| Veltrix Windows & Doors | Fix the fault, keep the window | uPVC window & door repairs |
| /repairs/glass-and-panel-replacement/ | Glass & door panel replacement — uPVC repairs \| Veltrix | Glass & door panel replacement — uPVC repairs \| Veltrix | Glass & door panel replacement | Glass & door panel replacement |
| /repairs/handles-and-hinges/ | Handles & hinges — uPVC repairs \| Veltrix Windows & Doors | Handles & hinges — uPVC repairs \| Veltrix Windows & Doors | Handles & hinges | Handles & hinges |
| /repairs/locks-and-mechanisms/ | Door locks & mechanisms — uPVC repairs \| Veltrix | uPVC door lock & mechanism repair \| Veltrix Windows & Doors | Door locks & mechanisms | Door locks & mechanisms |
| /repairs/misted-double-glazing/ | Misted double glazing — uPVC repairs \| Veltrix | Misted double glazing repair \| Veltrix Windows & Doors | Misted double glazing | Misted double glazing |
| /repairs/safety-and-security-upgrades/ | Safety & security upgrades — uPVC repairs \| Veltrix | Safety & security upgrades — uPVC repairs \| Veltrix | Safety & security upgrades | Safety & security upgrades |
| /services/ | uPVC window & door services \| Veltrix Windows & Doors | uPVC window & door services \| Veltrix Windows & Doors | What we do | What we do |
| /services/installation/ | uPVC window & door installation \| Veltrix Windows & Doors | Double glazing installation \| Veltrix Windows & Doors | Supply & installation | Double glazing installation |
| /windows/ | UPVC windows \| Veltrix Windows & Doors | Replacement uPVC windows \| Veltrix Windows & Doors | uPVC windows | Replacement uPVC windows |
| /windows/bay-and-bow-windows/ | Bay & bow windows: made to measure & fitted \| Veltrix | Bay & bow windows: made to measure & fitted \| Veltrix | Bay & bow windows | Bay & bow windows |
| /windows/casement-windows/ | Casement windows: made to measure & fitted \| Veltrix | Casement windows: made to measure & fitted \| Veltrix | Casement windows | Casement windows |
| /windows/flush-casement-windows/ | Flush casement windows: made to measure & fitted \| Veltrix | Flush casement windows: made to measure & fitted \| Veltrix | Flush casement windows | Flush casement windows |
| /windows/sash-windows/ | Sash windows: made to measure & fitted \| Veltrix | Sash windows: made to measure & fitted \| Veltrix | Sash windows | Sash windows |
| /windows/shaped-and-feature-windows/ | Shaped & feature windows: made to measure & fitted \| Veltrix | Shaped & feature windows: made to measure & fitted \| Veltrix | Shaped & feature windows | Shaped & feature windows |
| /windows/sliding-windows/ | Horizontal sliding windows: made to measure & fitted \| Veltrix | Horizontal sliding windows: made to measure & fitted \| Veltrix | Horizontal sliding windows | Horizontal sliding windows |
| /windows/tilt-and-turn-windows/ | Tilt & turn windows: made to measure & fitted \| Veltrix | Tilt & turn windows: made to measure & fitted \| Veltrix | Tilt & turn windows | Tilt & turn windows |

Keyword ownership: windows hub = replacement uPVC windows; installation = double glazing installation / installers (availability checked); composite = composite front doors / supplied-and-fitted enquiry; repairs hub = uPVC window and door repairs; misted service = misted/blown double glazing repair / replacement units; locks service = uPVC door lock repair. The existing misted-glazing guide retains informational repair-versus-replace intent. Quote builder remains a request tool; booking remains a visit-preference request. No new national/city page competes with these pages.

## Verification evidence

| Check | Result and limit |
| --- | --- |
| `npm run check` | PASS: 48 generated pages, 47 indexable URLs, zero link/SEO problems, 12/12 regression tests (eight existing plus four Phase 1). Hours boundary/DST, graph identity, unverified coverage/address and original route contract included. |
| Metadata / schema / crawling | Unique titles, descriptions, canonicals; one H1 per page; canonical=OG URL; connected parseable JSON-LD; visible FAQ parity; no accidental noindex; 404 remains noindex. |
| Live baseline | Chromium fetched all 47 production paths: HTTP 200, metadata/canonical/OG/robots match captured baseline, one H1 each. Sitemap/robots/llms HTTP 200; 47 sitemap URLs. A random nonexistent path returns HTTP 404. Direct `/404.html` redirects to `/404` and returns 200 with noindex error content; this existing host behaviour is documented, not changed. |
| Local browser functional checks | PASS: product/model preselection and drawing; quote invalid size/required validation, add/edit/duplicate/remove, totals, PDF generation, WhatsApp and email drafts; repair query context; booking/contact required validation; FAQ search; hours/coverage/accreditation/conditional-guarantee chatbot answers; UK winter/summer contact boundaries. |
| Delivery safety | No browser write requests or real enquiries/bookings sent. WhatsApp window opening intercepted locally for booking/contact; quote external link inspected without opening. PDF generated locally. End-to-end inbox/app delivery remains unverified. |
| Mobile | 390×844 homepage/windows/quote/booking: no horizontal overflow; CTA bar, navigation open/close and chatbot pass. Desktop samples 1440×1000. Actual mobile OS app/file-picker delivery not claimed. |
| axe-core | 11 matching desktop routes, WCAG 2 A/AA + 2.1 A/AA: no new violation targets. Existing desktop logo label-content-name mismatch persists. Four candidate mobile pages tested with WCAG 2 A/AA have no violations; automated scans are not full accessibility conformance. Tests use reduced motion for stable comparison. |
| Lighthouse 13.5.0 | Same local Chrome/mobile simulated conditions, one run each: performance 76→75; accessibility 96→96; LCP 4363→4354ms; TBT 0→20ms; CLS 0→0. No material observed regression; single lab runs are noisy, not field CWV or an SLA. Existing Lighthouse aria-hidden-focus and logo-label findings remain. |
| Independent review | Reviewer identified unconditional chatbot insurance wording and standalone England scope gaps; both corrected. Numerical contact data, coverage lists and optional endpoint settings independently compared against base. |

Main CSS, assistant CSS, main navigation/hours logic, drawing JS, images and fonts are unchanged. JavaScript changes are limited to assistant factual wording and quote handoff/error wording. The build entry point and deployment configuration/commands are unchanged; `build.mjs` changes only public summary wording. The test command now includes Phase 1 regressions.

## Dates and discovery

`src/data/lastmod.json` is regenerated by the existing content fingerprint process for changed page titles, descriptions and bodies on 27 October 2026. Unchanged page fingerprints/dates are retained; no bulk freshness reset. Shared-shell/schema-only differences do not drive this pre-existing fingerprint, as documented in baseline-audit.md. Historical inherited dates are not independently proven. No indexing is inferred from dates, sitemap inclusion or passing checks. `llms.txt` remains an accurate optional summary, not a special AI ranking requirement.

## Screenshots

Screenshots show the local candidate, not a production deployment. No customer details were entered in these captured views.

- [Desktop homepage](screenshots/home-desktop.png)
- [Desktop windows](screenshots/windows-desktop.png)
- [Desktop installation](screenshots/installation-desktop.png)
- [Mobile windows](screenshots/windows-mobile.png)
- [Mobile assistant](screenshots/chat-mobile.png)

## Deferred decisions and release

See [partner-coverage-plan.md](partner-coverage-plan.md), [conversion-audit.md](conversion-audit.md) and [owner-approvals-needed.md](owner-approvals-needed.md). The national coverage page is a documentation-only proposal. Existing guarantee/free-survey/product evidence, partner contracts, scheduling, privacy choices, lead capture and baseline accessibility debt remain explicit owner decisions. No DNS, credentials, Google/Bing settings, production merge or manual Cloudflare deployment performed. Follow the approval-first release instructions in owner-approvals-needed.md.
