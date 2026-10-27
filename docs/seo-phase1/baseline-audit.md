# Baseline technical SEO audit

Recorded 27 October 2026. Production reference SHA supplied for this baseline: `e3b0e6ad17b5ac50e3a8f1d3c540f6f4bb310d7d`. This report describes the immutable baseline, not the changed feature build or a deployment.

## Evidence and limits

- **Generated evidence inspected:** `C:/Users/appsf/AppData/Local/Temp/veltrix-phase1-tools/baseline.json` and its sibling `baseline-dist`, containing 48 generated HTML files, of which 47 permit indexing. Inventory SHA-256: `245f18cdf7b625a9afbb2b78385ad0ac1f46c0fcceb5ec5010ecc65396e717fb`.
- **Initial executable checks:** the parent task reports initial `npm run check` passed, including 8 tests. This auditor did not rerun that mutating build and does not count planned checks as passed.
- **Live evidence:** root-task HTTP/browser checks are pending integration here. Generated HTML does not prove live status codes, redirect behaviour, response headers, production parity or app delivery.
- **Unknown account/field evidence:** Search Console indexing/coverage, Google-selected canonicals, sitemap acceptance, impressions, clicks, rankings, backlinks, Google Business Profile state, analytics conversions and real-user Core Web Vitals have not been established. No account access or ranking/volume figures are assumed. Lab performance verification is pending the parent task; a localhost lab result cannot establish production or field performance.

## Generated technical findings

The baseline has **47 indexable routes and one intentionally noindexed 404 document**. Every indexable route has a non-empty title and description, exactly one main-content H1, a self-referencing HTTPS canonical and matching `og:url`. Duplicate titles: 0; duplicate descriptions: 0. These are extraction checks, not a guarantee that Google uses the supplied title, description or canonical.

The generated `robots.txt` allows `/`, disallows only `/assets/data/` and advertises `https://veltrixwindowsdoor.co.uk/sitemap.xml`. The generated sitemap contains 47 URLs, corresponding to all 47 indexable routes; the 404 is excluded. Live robots, sitemap retrieval and host/scheme redirects remain separate checks.

All 47 indexable pages have JSON-LD with `HomeAndConstructionBusiness` and `WebSite` plus their page-specific types below. This inventory establishes JSON parsing/type presence only, not rich-result eligibility or truth of business assertions. Address and area-served fields are absent in the baseline inventory. Empty location data is not an instruction to publish a private address, fabricate coverage, add doorway pages or invent named partnerships. Trust/guarantee/accreditation assertions need factual review; see [conversion audit](conversion-audit.md).

All 46 non-home indexable routes have a BreadcrumbList; its names are reproduced below. Homepage omission is normal. There are **no orphan indexable pages** in the generated graph. `/terms/` and `/accessibility/` have zero main-content inbound links but are linked from the shared footer, so they are not orphans. Inbound counts are distinct *source pages*, exclude self-links, include the generated 404 source where present, and are not traffic or authority metrics. Main-content counts exclude shared header/footer. Query strings/fragments are stripped by the extractor; counts do not measure repeated links or anchor quality.

Word counts use extracted text inside `<main>`, including labels, forms, model listings and repeated calls to action; they exclude the header/footer but are not a count of editorial prose. The six pages below have fewer than 250 extracted words. This is a review aid, **not an automatic thin-content SEO finding**: utility and service pages can satisfy their intent concisely. Evaluate usefulness, real evidence and conversion completion before adding copy.

| Route | Main words |
| --- | --- |
| /accessibility/ | 173 |
| /contact/ | 112 |
| /services/ | 188 |
| /services/landlords-and-commercial/ | 181 |
| /services/servicing-and-maintenance/ | 179 |
| /services/survey-and-quote/ | 211 |


## Complete metadata inventory (47 indexable routes)

Values below are the baseline title, meta description and H1. Proposed changes are kept separate in [keyword-map.csv](keyword-map.csv). A pipe in a title is escaped only for Markdown display.

| Route | Title | Meta description | H1 |
| --- | --- | --- | --- |
| / | uPVC Windows, Doors & Repairs \| Veltrix Windows & Doors | uPVC windows, composite doors and repairs, made to measure and fitted properly. Free survey, itemised written quote and an online quote builder. | Windows & doors, made to measure, fitted properly. |
| /about/ | About us \| Veltrix Windows & Doors | About Veltrix Windows & Doors: specialist uPVC window and door supply, installation and repairs. How we work and what you can expect. | About Veltrix Windows & Doors |
| /accessibility/ | Accessibility \| Veltrix Windows & Doors | Accessibility statement for the Veltrix Windows & Doors website. | Accessibility |
| /book/ | Book a survey or repair \| Veltrix Windows & Doors | Book a free survey for new uPVC windows and doors, or a repair or servicing visit. Choose a date and time and send your request on WhatsApp or by email. | Book a survey or repair |
| /contact/ | Contact us \| Veltrix Windows & Doors | Contact Veltrix Windows & Doors: WhatsApp or call 07411 496356, email info@veltrixwindowsdoor.co.uk. Quotes, repairs and surveys for uPVC windows and doors. | Talk to us |
| /cookies/ | Cookie policy \| Veltrix Windows & Doors | Cookie policy for Veltrix Windows & Doors. No analytics or advertising cookies — only strictly necessary storage for the website assistant and quote builder. | Cookie policy |
| /doors/ | UPVC & composite doors \| Veltrix Windows & Doors | uPVC and composite front doors, French doors, sliding patio doors, bi-folds and stable doors. Multipoint locks and anti-snap cylinders. Free survey and quote. | uPVC & composite doors |
| /doors/bifold-doors/ | Bi-fold doors: made to measure & fitted \| Veltrix | uPVC bi-fold doors for extensions and garden rooms. Panels fold to one or both sides, with a traffic door for daily use and low threshold options. Free survey. | Bi-fold doors |
| /doors/composite-doors/ | Composite doors: made to measure & fitted \| Veltrix | Composite front doors with a thick core, timber-grain GRP skin and multipoint locking. PAS 24 and Secured by Design options, dual colour. Free survey and quote. | Composite doors |
| /doors/french-doors/ | French doors: made to measure & fitted \| Veltrix | uPVC French doors for gardens and patios. Opening outwards or inwards, with a multipoint lock, shoot bolts and side panels for wider openings. Free survey. | French doors |
| /doors/patio-doors/ | Sliding patio doors: made to measure & fitted \| Veltrix | uPVC in-line sliding patio doors with large glass panels, tandem rollers and anti-lift multipoint locking. 2, 3 and 4 panel layouts. Free survey and quote. | Sliding patio doors |
| /doors/stable-doors/ | Stable doors: made to measure & fitted \| Veltrix | uPVC and composite stable doors with top and bottom leaves that open together or separately. Multipoint locking on both leaves. Free survey and written quote. | Stable doors |
| /doors/upvc-doors/ | uPVC front & back doors: made to measure & fitted \| Veltrix | uPVC front and back doors with multipoint locks and TS 007 3-star or SS 312 Diamond cylinders. Choice of panels, glass and colours. Free survey and quote. | uPVC front & back doors |
| /faq/ | uPVC windows & doors: prices, repairs & fitting FAQs \| Veltrix | Answers to common questions about uPVC windows and doors: prices, surveys, installation, Building Regulations, FENSA, planning, repairs and guarantees. | Frequently asked questions |
| /guarantee/ | Guarantees & aftercare \| Veltrix Windows & Doors | Veltrix Windows & Doors guarantees: 10-year installation guarantee and 12-month repair guarantee. What’s covered and how to claim. | Guarantees & aftercare |
| /guides/ | Window & door guides: measuring, care & repairs \| Veltrix | Guides to uPVC windows and doors: energy ratings, Building Regulations, misted glass, maintenance, measuring and choosing a front door. | Know what you’re buying |
| /guides/building-regulations-for-replacement-windows/ | Replacement windows: Building Regulations in England \| Veltrix | The Building Regulations for replacement windows and doors in England: Part L energy, Part F trickle vents, Part K safety glass, Part B escape, and sign-off. | Replacement windows and Building Regulations: a homeowner’s guide |
| /guides/how-to-maintain-upvc-windows-and-doors/ | How to look after uPVC windows and doors \| Veltrix | A twice-yearly care routine for uPVC windows and doors: cleaning, drainage, lubrication and seals, the products to avoid, and early signs of a fault. | How to look after uPVC windows and doors |
| /guides/how-to-measure-windows-for-a-quote/ | How to measure your windows and doors for a quote \| Veltrix | How to measure windows and doors for a uPVC quote: which widths and heights to take, the photos to send, and how to enter sizes in our online quote builder. | How to measure your windows and doors for a quote |
| /guides/misted-double-glazing-repair-or-replace/ | Misted double glazing: repair or replace? \| Veltrix | Why double glazing mists up between the panes, why drill and dry rarely lasts, and when to replace only the sealed unit rather than the whole window. | Misted double glazing: repair or replace? |
| /guides/upvc-vs-composite-doors/ | uPVC or composite front door? How they compare \| Veltrix | uPVC and composite front doors compared on construction, security, insulation, looks and price, plus the lock and glass checks that matter on either door. | uPVC or composite front door? How they compare |
| /guides/window-energy-ratings-explained/ | Window energy ratings and U-values, explained \| Veltrix | What U-values and Window Energy Ratings (WER) mean, what Part L asks of replacement windows, and how Low-E glass, argon and warm-edge spacers cut heat loss. | Window energy ratings and U-values, explained |
| /privacy/ | Privacy policy \| Veltrix Windows & Doors | How Veltrix Windows & Doors collects, uses and protects personal information under UK GDPR and the Data Protection Act 2018. | Privacy policy |
| /quote/ | Window & door quote builder \| Veltrix Windows & Doors | Build a uPVC window and door quote request: choose layouts, enter sizes and send your numbered schedule on WhatsApp. Estimate first; fixed price after survey. | Build your quote |
| /repairs/ | uPVC window & door repairs \| Veltrix Windows & Doors | uPVC window and door repairs: misted double glazing, locks, handles, hinges, dropped doors, draughts, patio rollers and glass. Send photos on WhatsApp for a price. | Fix the fault, keep the window |
| /repairs/door-alignment/ | Dropped & misaligned doors — uPVC repairs \| Veltrix | Dropped or sagging uPVC door? We adjust the hinges, re-pack the glass or panel and reset the keeps so the door closes and locks without force. Book a repair visit. | Dropped & misaligned doors |
| /repairs/draughts-and-leaks/ | Draughts, leaks & seals — uPVC repairs \| Veltrix | Draughty or leaking uPVC windows and doors fixed. We replace worn gaskets and brush seals, clear blocked drainage, reseal outside joints and adjust the fit. | Draughts, leaks & seals |
| /repairs/glass-and-panel-replacement/ | Glass & door panel replacement — uPVC repairs \| Veltrix | Replacement glass for uPVC windows and doors. Cracked and broken units, toughened and laminated safety glass, obscure privacy glass and new uPVC door panels. | Glass & door panel replacement |
| /repairs/handles-and-hinges/ | Handles & hinges — uPVC repairs \| Veltrix Windows & Doors | uPVC window and door handle and hinge repairs. Friction stays, egress and easy-clean hinges, flag hinges, key-locking handles and restrictors fitted and adjusted. | Handles & hinges |
| /repairs/locks-and-mechanisms/ | Door locks & mechanisms — uPVC repairs \| Veltrix | uPVC and composite door lock repairs. Multipoint locks, gearboxes and handles replaced, and euro cylinders upgraded to anti-snap TS 007 3-star or SS 312 Diamond. | Door locks & mechanisms |
| /repairs/misted-double-glazing/ | Misted double glazing — uPVC repairs \| Veltrix | Misted double glazing fixed without replacing the frame. New sealed units made to size, with Low-E glass, argon and warm-edge spacers. Send a photo on WhatsApp. | Misted double glazing |
| /repairs/patio-and-bifold-repairs/ | Patio & bi-fold door repairs — uPVC repairs \| Veltrix | Sliding patio door and bi-fold door repairs. Worn rollers and damaged tracks replaced, panels realigned and locks repaired so the door slides and locks properly. | Patio & bi-fold door repairs |
| /repairs/safety-and-security-upgrades/ | Safety & security upgrades — uPVC repairs \| Veltrix | Make your uPVC windows and doors safer. Child-safety restrictors, key-locking handles, fire escape hinges, anti-snap cylinders, door viewers and chains fitted. | Safety & security upgrades |
| /services/ | uPVC window & door services \| Veltrix Windows & Doors | uPVC window and door services: supply and installation, free surveys, repairs, servicing and maintenance, and work for landlords and businesses. | What we do |
| /services/installation/ | uPVC window & door installation \| Veltrix Windows & Doors | uPVC window and door installation. Free survey, made-to-measure frames, careful fitting, making good inside and out, and Building Regulations certification. | Supply & installation |
| /services/landlords-and-commercial/ | Windows & doors for landlords and businesses \| Veltrix | uPVC window and door repairs and replacements for landlords, letting agents, property managers and businesses. Tenant liaison, photo reports and clear invoices. | Landlords & commercial |
| /services/servicing-and-maintenance/ | uPVC window & door servicing \| Veltrix Windows & Doors | uPVC window and door servicing for homes, landlords and businesses. Hinges and keeps adjusted, locks lubricated, seals and drainage checked, written report. | Servicing & maintenance |
| /services/survey-and-quote/ | Free window & door survey and quote \| Veltrix | Book a free, no-obligation survey for uPVC windows and doors. Accurate measurements, plain advice on glass, locks and regulations, and an itemised written quote. | Free survey & quote |
| /terms/ | Terms & conditions \| Veltrix Windows & Doors | Website terms and summary trading terms for Veltrix Windows & Doors: quotations, cancellation rights, installation, guarantees and liability. | Terms & conditions |
| /windows/ | UPVC windows \| Veltrix Windows & Doors | Made-to-measure uPVC windows, supplied and fitted. Casement, flush casement, tilt & turn, sash, bay and bow, sliding and shaped styles. Free survey and quote. | uPVC windows |
| /windows/bay-and-bow-windows/ | Bay & bow windows: made to measure & fitted \| Veltrix | Replacement uPVC bay and bow windows. We check whether the old bay carries load and fit support poles where needed. Casement, flush or sash facets. Free survey. | Bay & bow windows |
| /windows/casement-windows/ | Casement windows: made to measure & fitted \| Veltrix | uPVC casement windows made to measure and fitted. Side-hung, top-hung and fixed lights, multipoint locks, escape hinges and A-rated glass. Free survey. | Casement windows |
| /windows/flush-casement-windows/ | Flush casement windows: made to measure & fitted \| Veltrix | uPVC flush casement windows with the flat face of traditional timber joinery. Woodgrain and heritage colours, multipoint locks and A-rated glass. Free survey. | Flush casement windows |
| /windows/sash-windows/ | Sash windows: made to measure & fitted \| Veltrix | uPVC sliding sash windows for Victorian, Edwardian and Georgian homes. Run-through horns, Georgian bars, tilt-in cleaning and A-rated glass. Free survey. | Sash windows |
| /windows/shaped-and-feature-windows/ | Shaped & feature windows: made to measure & fitted \| Veltrix | Shaped uPVC windows templated to your opening. Arched heads, gable apexes, circles and large picture windows, matched to the rest of your windows. Free survey. | Shaped & feature windows |
| /windows/sliding-windows/ | Horizontal sliding windows: made to measure & fitted \| Veltrix | uPVC horizontal sliding windows for walkways, balconies and kitchens. Sashes slide sideways, so nothing projects in or out. 2- and 3-pane layouts. Free survey. | Horizontal sliding windows |
| /windows/tilt-and-turn-windows/ | Tilt & turn windows: made to measure & fitted \| Veltrix | uPVC tilt and turn windows made to measure. Tilt in to ventilate, open fully inward to clean or escape. Suits flats, upper floors and walkways. Free survey. | Tilt & turn windows |


## Complete technical inventory (same 47 routes)

For every row, **C = O = `https://veltrixwindowsdoor.co.uk` + the displayed route**, where C is the exact canonical and O is exact `og:url`; all have been checked individually against that rule. Every row has robots **I = `index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1`**. All pages share `HomeAndConstructionBusiness` and `WebSite` schema; the Schema column lists the additional types. Breadcrumbs list schema item names in order. All / Main are distinct inbound source-page counts as defined above.

| Route | Canonical / OG URL | Robots | Additional schema | Breadcrumb names | All / Main inbound | Main words |
| --- | --- | --- | --- | --- | --- | --- |
| / | C = O = host + route | I | WebPage, FAQPage | None (homepage) | 47 / 47 | 1942 |
| /about/ | C = O = host + route | I | AboutPage, BreadcrumbList | Home > About | 47 / 6 | 353 |
| /accessibility/ | C = O = host + route | I | WebPage, BreadcrumbList | Home > Accessibility | 47 / 0 | 173 |
| /book/ | C = O = host + route | I | WebPage, BreadcrumbList | Home > Book | 47 / 13 | 304 |
| /contact/ | C = O = host + route | I | ContactPage, BreadcrumbList | Home > Contact | 47 / 3 | 112 |
| /cookies/ | C = O = host + route | I | WebPage, BreadcrumbList | Home > Cookie policy | 47 / 1 | 306 |
| /doors/ | C = O = host + route | I | CollectionPage, BreadcrumbList | Home > Doors | 47 / 10 | 373 |
| /doors/bifold-doors/ | C = O = host + route | I | WebPage, BreadcrumbList, Service, FAQPage | Home > Doors > Bi-fold doors | 47 / 4 | 1000 |
| /doors/composite-doors/ | C = O = host + route | I | WebPage, BreadcrumbList, Service, FAQPage | Home > Doors > Composite doors | 47 / 7 | 2125 |
| /doors/french-doors/ | C = O = host + route | I | WebPage, BreadcrumbList, Service, FAQPage | Home > Doors > French doors | 47 / 8 | 976 |
| /doors/patio-doors/ | C = O = host + route | I | WebPage, BreadcrumbList, Service, FAQPage | Home > Doors > Sliding patio doors | 47 / 5 | 799 |
| /doors/stable-doors/ | C = O = host + route | I | WebPage, BreadcrumbList, Service, FAQPage | Home > Doors > Stable doors | 47 / 4 | 900 |
| /doors/upvc-doors/ | C = O = host + route | I | WebPage, BreadcrumbList, Service, FAQPage | Home > Doors > uPVC front & back doors | 47 / 5 | 1862 |
| /faq/ | C = O = host + route | I | WebPage, BreadcrumbList, FAQPage | Home > FAQs | 47 / 2 | 2262 |
| /guarantee/ | C = O = host + route | I | WebPage, BreadcrumbList | Home > Guarantees | 47 / 3 | 303 |
| /guides/ | C = O = host + route | I | CollectionPage, BreadcrumbList | Home > Guides | 47 / 7 | 258 |
| /guides/building-regulations-for-replacement-windows/ | C = O = host + route | I | WebPage, BreadcrumbList, Article | Home > Guides > Replacement windows and Building Regulations: a homeowner’s guide | 47 / 8 | 1005 |
| /guides/how-to-maintain-upvc-windows-and-doors/ | C = O = host + route | I | WebPage, BreadcrumbList, Article | Home > Guides > How to look after uPVC windows and doors | 3 / 3 | 743 |
| /guides/how-to-measure-windows-for-a-quote/ | C = O = host + route | I | WebPage, BreadcrumbList, Article | Home > Guides > How to measure your windows and doors for a quote | 8 / 8 | 1045 |
| /guides/misted-double-glazing-repair-or-replace/ | C = O = host + route | I | WebPage, BreadcrumbList, Article | Home > Guides > Misted double glazing: repair or replace? | 5 / 5 | 766 |
| /guides/upvc-vs-composite-doors/ | C = O = host + route | I | WebPage, BreadcrumbList, Article | Home > Guides > uPVC or composite front door? How they compare | 3 / 3 | 698 |
| /guides/window-energy-ratings-explained/ | C = O = host + route | I | WebPage, BreadcrumbList, Article | Home > Guides > Window energy ratings and U-values, explained | 7 / 7 | 808 |
| /privacy/ | C = O = host + route | I | WebPage, BreadcrumbList | Home > Privacy policy | 47 / 4 | 896 |
| /quote/ | C = O = host + route | I | WebPage, BreadcrumbList | Home > Get a quote | 47 / 40 | 555 |
| /repairs/ | C = O = host + route | I | CollectionPage, BreadcrumbList | Home > Repairs | 47 / 13 | 489 |
| /repairs/door-alignment/ | C = O = host + route | I | WebPage, BreadcrumbList, Service, FAQPage | Home > Repairs > Dropped & misaligned doors | 47 / 12 | 543 |
| /repairs/draughts-and-leaks/ | C = O = host + route | I | WebPage, BreadcrumbList, Service, FAQPage | Home > Repairs > Draughts, leaks & seals | 47 / 7 | 590 |
| /repairs/glass-and-panel-replacement/ | C = O = host + route | I | WebPage, BreadcrumbList, Service, FAQPage | Home > Repairs > Glass & door panel replacement | 47 / 2 | 563 |
| /repairs/handles-and-hinges/ | C = O = host + route | I | WebPage, BreadcrumbList, Service, FAQPage | Home > Repairs > Handles & hinges | 47 / 11 | 615 |
| /repairs/locks-and-mechanisms/ | C = O = host + route | I | WebPage, BreadcrumbList, Service, FAQPage | Home > Repairs > Door locks & mechanisms | 47 / 10 | 678 |
| /repairs/misted-double-glazing/ | C = O = host + route | I | WebPage, BreadcrumbList, Service, FAQPage | Home > Repairs > Misted double glazing | 47 / 12 | 649 |
| /repairs/patio-and-bifold-repairs/ | C = O = host + route | I | WebPage, BreadcrumbList, Service, FAQPage | Home > Repairs > Patio & bi-fold door repairs | 47 / 4 | 502 |
| /repairs/safety-and-security-upgrades/ | C = O = host + route | I | WebPage, BreadcrumbList, Service, FAQPage | Home > Repairs > Safety & security upgrades | 47 / 2 | 522 |
| /services/ | C = O = host + route | I | CollectionPage, BreadcrumbList | Home > Services | 47 / 4 | 188 |
| /services/installation/ | C = O = host + route | I | WebPage, BreadcrumbList, Service | Home > Services > Supply & installation | 47 / 2 | 413 |
| /services/landlords-and-commercial/ | C = O = host + route | I | WebPage, BreadcrumbList, Service | Home > Services > Landlords & commercial | 47 / 1 | 181 |
| /services/servicing-and-maintenance/ | C = O = host + route | I | WebPage, BreadcrumbList, Service | Home > Services > Servicing & maintenance | 47 / 2 | 179 |
| /services/survey-and-quote/ | C = O = host + route | I | WebPage, BreadcrumbList, Service | Home > Services > Free survey & quote | 47 / 1 | 211 |
| /terms/ | C = O = host + route | I | WebPage, BreadcrumbList | Home > Terms & conditions | 47 / 0 | 525 |
| /windows/ | C = O = host + route | I | CollectionPage, BreadcrumbList | Home > Windows | 47 / 14 | 502 |
| /windows/bay-and-bow-windows/ | C = O = host + route | I | WebPage, BreadcrumbList, Service, FAQPage | Home > Windows > Bay & bow windows | 47 / 5 | 1007 |
| /windows/casement-windows/ | C = O = host + route | I | WebPage, BreadcrumbList, Service, FAQPage | Home > Windows > Casement windows | 47 / 9 | 2313 |
| /windows/flush-casement-windows/ | C = O = host + route | I | WebPage, BreadcrumbList, Service, FAQPage | Home > Windows > Flush casement windows | 47 / 6 | 1110 |
| /windows/sash-windows/ | C = O = host + route | I | WebPage, BreadcrumbList, Service, FAQPage | Home > Windows > Sash windows | 47 / 4 | 1051 |
| /windows/shaped-and-feature-windows/ | C = O = host + route | I | WebPage, BreadcrumbList, Service, FAQPage | Home > Windows > Shaped & feature windows | 47 / 2 | 897 |
| /windows/sliding-windows/ | C = O = host + route | I | WebPage, BreadcrumbList, Service, FAQPage | Home > Windows > Horizontal sliding windows | 47 / 4 | 917 |
| /windows/tilt-and-turn-windows/ | C = O = host + route | I | WebPage, BreadcrumbList, Service, FAQPage | Home > Windows > Tilt & turn windows | 47 / 6 | 1207 |


## Open Graph and sharing checks

Each indexable HTML file was also read directly from baseline-dist to compare `og:title` with its title and `og:description` with its description. Matches: **1/47 titles** and **47/47 descriptions**. All 47 provide the same 1200 by 630 shared image at `https://veltrixwindowsdoor.co.uk/assets/img/og-image.png`, with image alt text, `og:site_name`, `og:locale=en_GB` and `twitter:card=summary_large_image`. OG type is `article` for the six guide articles and `website` elsewhere. No claim is made that social preview crawlers fetched the production image successfully. Per-route OG URL values are fully defined in the technical inventory.

## 404 and HTTP boundary

The generated `/404.html` has title “Page not found | Veltrix Windows & Doors”, description “Page not found.”, one H1, canonical/OG URL `https://veltrixwindowsdoor.co.uk/404.html`, robots `noindex, follow`, 37 main words and no JSON-LD/breadcrumb. It has no inbound source-page links, which is appropriate for the error template. Its actual HTTP status, and the status of a random missing route, require live checks; a file named 404.html does not prove a 404 response.

## Last-modified provenance

Baseline sitemap dates by value: 2026-10-27 (13 routes); 2026-10-03 (34 routes). These values were observed in the generated baseline, not independently proven as editorial publication/modification dates.

The build's lastmod fingerprint in `build.mjs` hashes `page.title + page.description + page.body`; `src/data/lastmod.json` stores the hash and date. A content fingerprint change sets the date to the UTC build day. The later guide article-modified value can override it. **Shared shell, shared navigation/footer, and schema-only edits outside page.body are excluded**, so a date remaining unchanged is not proof that the complete rendered page never changed. Equally, a rebuild-created date is not independent proof of a substantial editorial change. Do not replace every sitemap date merely to appear fresh. Audit inherited article dates and material edits against actual change history before making provenance claims.

## Priority interpretation and keyword ownership

Exact extracted main-text duplicates across the 47 indexable pages: **0**. A simple token-set review (lowercase words of at least four ASCII letters, Jaccard intersection/union) found the closest pairs to be sliding versus tilt-and-turn windows (0.504), bifold versus French doors (0.501), stable versus uPVC doors (0.495), and bifold versus patio doors (0.494). Shared specifications and model/CTA text explain much of that overlap; these scores are an audit heuristic, not a search-engine threshold or evidence of ranking cannibalisation. Distinct opening/design needs justify the existing product pages. Retain their specific intent; do not add a second broad installation page without a distinct eligibility purpose and verified content.

[Keyword map](keyword-map.csv) assigns one primary theme per existing indexable route, secondary variants, search intent, implementation priority, current/proposed metadata and evidence status. Priority is a business/content judgement, not estimated search demand. The nine first-priority routes are homepage, windows hub, installation, composite doors, repairs hub, misted glazing, lock/mechanism repairs, quote and booking. Proposed title bases/H1s match the scoped Phase 1 direction; all other titles/H1s are retained absent evidence.

Use the transactional repair page for hiring/price intent and the misted-glazing guide for repair-versus-replace research. Keep the survey service explanation, quote builder and booking request distinct rather than duplicating one broad “free quote” page. No locations are added while service coverage is unverified. “Partner fitting” describes the supplied business-model direction; it does not establish a named installer partnership, accreditation or certification.

Vocabulary spot-check, fetched 27 October 2026: [Everest replacement windows](https://www.everest.co.uk/windows/replacement-windows/?d=1) and [Everest uPVC windows](https://www.everest.co.uk/windows/upvc-windows/?d=0) use replacement/uPVC category language; [Safestyle composite doors](https://www.safestyle-windows.co.uk/doors/composite-doors/) uses composite-front-door terminology. This supports familiar UK vocabulary only. It is not a representative UK SERP study, demand measurement, competitive ranking assessment or evidence of any relationship with Veltrix. The suggested Everest /windows/upvc/ URL did not open in the web tool; the actually retrieved alternatives above are the cited sources. Other mapped terms are explicit content/intent hypotheses derived from existing routes.

## Outstanding verification record

| Evidence layer | Status at document creation | Required interpretation |
| --- | --- | --- |
| Immutable generated inventory | Inspected: all 48 HTML files represented, 47 indexable | Baseline facts only; feature changes are a separate comparison |
| Initial npm run check | Parent reports pass, 8 tests | No production-delivery or indexing inference |
| Live HTTPS routes, redirects, robots, sitemap, error responses | Pending parent-task results | Record exact requested URL, final URL, status and time before claiming live pass |
| Desktop/mobile browser and accessibility/conversion checks | Pending parent-task results | See conversion audit for handoff boundaries; no send/upload test performed here |
| Lab performance | Pending parent-task results | Identify URL, environment, device/throttling and run timestamp |
| Search Console, GBP, analytics, field CWV | Unknown/not accessed | No impressions, rankings, indexing, leads or field-performance claims |

No merge, deployment, account changes or enquiries are part of this audit.

## Integrated verification — 27 October 2026

The “pending” statuses above record the baseline document’s creation stage. The completed integration evidence is in [on-page-changes.md](on-page-changes.md). A fresh Chromium crawl of all 47 production indexable paths returned HTTP 200, one main H1, unique titles and canonical URLs. Production still contains the baseline content; the feature is tested locally and is not deployed. Local baseline/candidate axe comparisons cover 11 desktop paths; candidate mobile samples cover homepage/windows/quote/booking. No delivery or indexing claims follow from these checks.

Homepage Lighthouse 13.5.0, same local server/Chrome/mobile simulated environment, one run per tree: performance 76→75, accessibility 96→96, LCP 4363→4354ms, TBT 0→20ms, CLS 0→0. These noisy single lab runs show no material observed regression; they are not field Core Web Vitals or a UK-device performance guarantee. Existing accessibility findings remain documented.

Google’s [AI features guidance](https://developers.google.com/search/docs/appearance/ai-features) says normal SEO fundamentals apply and a special AI text file or schema is not required. Retain accurate `llms.txt` as an optional human/machine summary; it is not an inclusion or ranking mechanism. Sitemap inclusion signals discovery, not indexing. No search-engine accounts were changed.
