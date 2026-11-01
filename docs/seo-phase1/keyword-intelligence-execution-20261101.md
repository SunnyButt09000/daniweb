# Veltrix — first-party keyword intelligence and controlled SEO rollout

**Evidence snapshot:** Google Search Console, property `sc-domain:veltrixwindowsdoor.co.uk`, 2026-10-01 to 2026-10-29. Connected Bing Webmaster property: `https://veltrixwindowsdoor.co.uk/`. Captured 2026-11-01. These are **property-specific reported search queries**, NOT UK-wide search volumes, demand forecasts, lead forecasts or keyword-difficulty scores.

## Evidence integrity

- The Google query-only extraction returned **82 rows**, **334 reported impressions**, and **0 clicks** (not a complete property total because anonymised queries may be absent).
- Separately querying country produced **81 UK query rows / 332 impressions / 0 clicks**, and two non-UK rows (India and Brazil, one impression each). Query and query+country dimensions may differ; do not silently combine or double-count.
- Bing Webmaster connected successfully but its query extraction returned **zero rows** for the period. This does **not** mean UK Bing search demand is zero.
- Search Console positions are average observed search positions for impressions, not a stable daily rank; do not promise ranking movements or clicks based on a single small sample.
- Avoid fabricated monthly search volume, CPC, KD scores, competitor traffic or conversion numbers. Research candidates remain unverified until supported by a named source with date and scope.

## Observed Google search signals (examples)

| Keyword/query (actual) | 1–29 Oct impressions (query-level extraction) | Current mapped landing page |
| --- | ---: | --- |
| sliding windows | 45 | `/windows/sliding-windows/` |
| horizontal sliding windows | 38 | `/windows/sliding-windows/` |
| horizontal sliding windows uk | 16 | `/windows/sliding-windows/` |
| horizontal sliding windows upvc | 13 | `/windows/sliding-windows/` |
| large tilt and turn windows | 13 | `/windows/tilt-and-turn-windows/` |
| building regulations windows | 12 | `/guides/building-regulations-for-replacement-windows/` |
| double glazing regulations | 11 | `/guides/building-regulations-for-replacement-windows/` |
| best casement windows | 10 | `/windows/casement-windows/` |
| upvc door mechanism repair | 4 | `/repairs/locks-and-mechanisms/` |
| industrial sliding folding doors repairs | 4 | `/repairs/patio-and-bifold-repairs/` |
| misted double glazing repairs | 3 | `/repairs/misted-double-glazing/` |
| misted glass units | 3 | `/repairs/misted-double-glazing/` |
| upvc door leaking | 2 | `/repairs/draughts-and-leaks/` |
| upvc door glass panel replacement | 1 | `/repairs/glass-and-panel-replacement/` |

## Keyword intelligence rules: no blind scaling

1. **Group by service and intent**, not solely search volume: glass-only/sealed units, misted glazing, locks/gearboxes, handles/hinges, alignment, draughts/leaks, patio/bifold, security, every door category, every window category, fitting, maintenance, landlord/commercial.
2. **Separate problem searches from replacement searches**. `misted double glazing` should primarily map to `/repairs/misted-double-glazing/`, and `broken glass only` to `/repairs/glass-and-panel-replacement/`. Provide contextual links between these related but distinct services.
3. **Existing page first**: update existing well-matched URLs before adding new landing pages. No near-identical repair pages for slight keyword variants.
4. **Local search only with serviceable geography**: postcode-first UK-wide enquiry wording and honest travel/partner availability. No invented local offices, customer reviews, accreditation, prices or turnaround times. No mass programmatic city-doorway pages.
5. **Measurement**: track qualified enquiries, WhatsApp leads, calls, repair bookings and ultimately confirmed jobs, in addition to GSC clicks and impressions.
6. **External demand validation pending**: UK-specific Bing Keyword Research, Google Keyword Planner (where accessible) and competitor SERP samples are needed before declaring a market-wide volume, difficulty or numerical ranking.

## Controlled implementation order

- **Sprint A — glass-only / broken glazing:** Clarify in existing repair page that a sound frame can be retained; distinguish double-glazed sealed-unit replacement from single-pane repair. Add truthful cost factors and FAQ. Link appropriately to misted glazing. **First implementation in the separate review branch.**
- **Sprint B — misted glazing / sealed unit:** Review actual observed Google queries; preserve dedicated page and repair-vs-replace guide; ensure quote flows work and no unsupported same-day promise.
- **Sprint C — door mechanisms, hinges, seals, patio/bifold:** Confirm problem phrases against query evidence, update existing pages with distinct diagnostic questions, safely check booking conversion and internal links.
- **Sprint D — all six door and seven window categories:** Respect existing routes, avoid title cannibalisation, enhance pricing-factor explanation and quote journeys. Protect the already visible horizontal sliding windows page.
- **Sprint E — selective guides and geography:** Add original content only where a distinct customer question is not already answered. Grow coverage based on verified enquiries, not a target of 100 AI posts per month.

## Release and acceptance gates

- Content changes should be deployed through a reviewed PR and passing `npm run check`, including `src/data/lastmod.json` synchronisation. Never remove or bypass the CI diff safety check.
- Confirm built canonical/title/meta/H1 consistency and links. No product review or price schema without real data.
- Verify both `https://veltrixwindowsdoor.co.uk/robots.txt` and `/sitemap.xml` are accessible; third-party crawler robots verification failures are not by themselves Google block evidence.
- Verify normal quote + repair booking + WhatsApp paths on the preview before production.
- Keep Cloudflare and GitHub changes isolated; no direct production deployment until checked.
- Recheck first-party data after indexing settles; do not declare an SEO outcome solely from CI passing.

## Work history

2026-11-01: First review-branch source change updates `src/content/repairs.mjs` glass-only landing-page intent. This document does not claim production deployment or completed performance validation.
