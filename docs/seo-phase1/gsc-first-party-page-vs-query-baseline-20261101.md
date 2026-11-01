# Veltrix organic SEO baseline — distinguish reported page clicks from query-only rows

**Captured 1 November 2026; Search Console property:** `sc-domain:veltrixwindowsdoor.co.uk` via the connected Windsor.ai Search Console connector. **Reporting window:** 1–29 October 2026 inclusive. Last days after Oct 29 are not included due to normal Search Console processing lag. Numbers in separate dimensioned exports should **not be added together**.

## Most important correction to the historical project notes

| Search Console extraction | Rows | Impressions | Clicks | Interpretation |
| --- | ---: | ---: | ---: | --- |
| **Page-only** (`page,impressions,clicks,position`) | 41 | **918** | **23** | Reported page-level Google Search activity across the property, including one `www` URL entry; this is **not** a lead or sales count |
| **Query+page** (`query,page,impressions,clicks,position`) | 82 | **334** | **0** | Only returned *identified query-page rows*. Many clicks/impressions do not appear here due to privacy/anonymisation and API/query dimensions; **do not say the website had zero Google clicks** |
| **Date-only** (`date,impressions,clicks`) for 17–29 October | 4 reported active dates (26–29 Oct) | **476** | **15** | Different date scope and grouping, **not an additive source** |

Search Console anonymises some searches. A low/imputed query count, sparse query data or an empty Bing query export must not be interpreted as no organic traffic. These are observational reports, not paid market search volumes, confirmed bookings, number of users, or attribution proof for individual keywords.

## Page-level evidence — selected URLs (1–29 October)

| Canonical path or returned page | Impressions | Clicks | Mean observed position |
| --- | ---: | ---: | ---: |
| `/windows/sliding-windows/` | 159 | 0 | 23.21 |
| `/` | 88 | 12 | 3.36 |
| `/about/` | 70 | 1 | 3.76 |
| `/contact/` | 69 | 4 | 5.64 |
| `/windows/` | 58 | 1 | 4.57 |
| `/quote/` | 56 | 1 | 6.18 |
| `/services/` | 56 | 0 | 7.27 |
| `/guides/building-regulations-for-replacement-windows/` | 54 | 0 | 81.94 |
| `/services/installation/` | 44 | 0 | 9.02 |
| `/windows/tilt-and-turn-windows/` | 44 | 0 | 63.68 |
| `/doors/` | 38 | 1 | 5.39 |
| `/doors/upvc-doors/` | 28 | 1 | 11.79 |
| `/book/` | 12 | 1 | 5.83 |
| `/repairs/glass-and-panel-replacement/` | 9 | 0 | 11.11 |
| `www.veltrixwindowsdoor.co.uk/windows/shaped-and-feature-windows/` | 3 | 1 | 22.00 |

**Non-www note:** one legacy `www` host URL appears in page-level analytics (one click). Its presence alone does **not** prove canonical redirect failure; inspect current redirect behavior, canonical link and Google-selected canonical separately before touching Cloudflare.

### Service/section aggregates from the same page-only extraction

| Path prefix | Reported impressions | Clicks |
| --- | ---: | ---: |
| `/windows/` including hub | **301** | **2** |
| `/services/` including hub | **102** | **0** |
| `/guides/` including hub | **96** | **0** |
| `/doors/` including hub | **74** | **2** |
| `/repairs/` including hub | **42** | **0** |

A home-page click can be a branded/navigational search rather than a lead. No click-to-enquiry or confirmed-job source is established by this dataset.

## Closest relevant non-brand keyword evidence

The `/windows/sliding-windows/` page is already surfaced for:

| Actual returned query | Impressions | Average position | Clicks |
| --- | ---: | ---: | ---: |
| `sliding windows` | 45 | 29.02 | 0 |
| `horizontal sliding windows` | 38 | 18.63 | 0 |
| `horizontal sliding windows uk` | 16 | 11.94 | 0 |
| `horizontal sliding windows upvc` | 13 | 9.62 | 0 |

These values are **not national monthly demand**, and average position is not a fixed ranking. A query that returns no clicks at 9.62 does not prove a bad title: search appearance, device, intent, competitor result, and limited sample size matter.

## Actions justified by this evidence

1. **Protect & clarify the existing high-impression slider page**. Use a succinct SEO title accurately reflecting uPVC horizontal sliding windows in the UK, while preserving its H1, four illustrative layouts, prices-as-quote-only policy and the existing canonical URL. Explain that horizontal sliders differ from traditional up/down sash windows; link to the existing appropriate sash page. Do not create another near-duplicate URL.
2. **Give the repair hub an editorial entry into the new repair-vs-replace checklist**. Replace unsupported “fraction of the cost” statements with a quote-based, component-condition discussion. Help visitors choose a repair before a replacement.
3. **Monitor the correct metrics by dimension**. Track 28-day finalised `page` clicks/impressions separately from `query+page` impressions. Avoid accumulating overlap and avoid daily ranking claims or re-editing titles every few days. A useful checkpoint is 3–4 weeks after Google recrawling, using comparable periods.
4. **Check lead receipt independently** before claiming commercial improvement: WhatsApp/email click, actual sent enquiry, qualified service request and confirmed job are four different things; the website's customer-controlled draft is not a submitted lead.
5. **Backlinks remain a separate workstream**: research-only prospects, no publisher acceptance or acquired backlink verified; do not infer referring domain traffic from these GSC performance pulls.

## Release integrity

Any source changes need a reviewable PR, generated lastmod hashes synced, all build/SEO/mobile checks passing, Cloudflare Workers success and public HTML confirmation. **No paid backlink programme, fabricated local offices or unexplained mass page publishing.**

Reference: [Google: influence title links](https://developers.google.com/search/docs/appearance/title-link); [Google: link best practices](https://developers.google.com/search/docs/crawling-indexing/links-crawlable); [Search Console anonymised queries documentation](https://support.google.com/webmasters/answer/7576553).
