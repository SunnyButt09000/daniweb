# Issue #11: profile, indexing and website verification

27 October 2026. **Website checks and proposed accessibility corrections: PASS. Account diagnosis and production changes: PENDING.** This report records checks performed in this pass; it does not claim a Google listing is published or a URL indexed.

## Existing work preserved

- Production baseline: `e4a787235ab5b89180aa07d34c3d63b0a951bc10`; PRs #1, #8 and #10 are already merged. Baseline `npm run check`: **40/40**.
- [PR #12](https://github.com/SunnyButt09000/daniweb/pull/12), head `fe57ef33fa7f7cde0fa00f6f8eea53ba6466502f`, remains draft/unmerged. Its UK-calendar booking checks, six qualified FAQ claims and two trust FAQs were reviewed rather than recreated. Its four-file diff also contains the expected homepage/FAQ fingerprints; the PR body lists three source/test files, not that generated fourth file. Local tests **42/42**; GitHub regression check and automatic Cloudflare branch preview **SUCCESS** at review.
- [PR #9](https://github.com/SunnyButt09000/daniweb/pull/9) was not checked out, edited, deployed, merged or activated. Its independently tested private lead staging remains separate. Existing staging PASS is prior evidence, not a test rerun in this task.
- Existing 82-entry research register, ten deep dives, two merged buyer guides and 25-task backlog were reused. No competitor research was repeated. See the [C01–C25 reconciliation](issue11-backlog-status.md).

## Actual account access and GBP diagnosis

**GBP: UNVERIFIED—NO ACCOUNT SESSION.** Browser inventory returned no available browser/session. Attempting the built-in browser returned `Browser is not available: iab`. No GBP, Search Console or Bing Webmaster connector is exposed. A narrow search of the connected mailbox found no relevant Google/Bing notifications; that mailbox search does not establish ownership or profile status. The owner was asked to connect an authorised signed-in browser while public/repository checks continued. No browser profile files, cookies, passwords or unrelated accounts were inspected to work around this limit.

Consequently the existing profile's verification, publication, approval/restriction, pending edits, ownership notifications, Maps share link and exact current fields remain **unknown**. Historical statements of “Verified” or “You manage this profile” do not establish today's public visibility. Direct public Search/Maps retrieval was unavailable in the web tool; general indexed searches did not establish a definitive matching Maps listing. **No absence, suspension or ranking conclusion is drawn.**

A public [MyBuilder Bury directory result](https://www.mybuilder.com/windows-door-fitting/glazier-tradespeople/bury?internalNavigation=true&page=27) contains a similarly named windows/doors/repair listing. Its ownership, phone and connection to this website are unconfirmed. No citation, review claim or `sameAs` link was added. Unrelated similarly named electricians/companies are not Veltrix evidence.

The reason for the owner's visibility problem cannot be established without the actual profile. The following are review questions, not diagnoses:

| Item | Evidence/decision required | Prepared action; not applied |
| --- | --- | --- |
| Verification/publication | Open the existing business in its managing Google account; record the exact verification, processing, restriction and public visibility messages privately | If pending, follow the stated Google review process. If restricted, review the notice/evidence before any appeal. Do not create another profile |
| Eligibility | Evidence that this business genuinely visits/delivers to customers or otherwise qualifies, and its actual responsibility for supply/survey/fitting versus lead referral | Owner must establish the real operating model. Do not assume a partner enquiry coordinator is either eligible or ineligible without those facts |
| Name/category/contact | Compare current values with real-world trading evidence and website: Veltrix Windows & Doors, existing public business phone, HTTPS website | Prepare exact differences first. Name/category changes require approval; no changes made here |
| Address | Whether customers are genuinely received at an eligible staffed location | Keep any residential address hidden. No private address/postcode belongs on the public website or report |
| Areas | Evidence of actual operations for each previously reported distant city | Review the existing cities against genuine coverage. Do not add them to empty website service-area fields or remove/add profile cities without approval |
| Hours | Actual customer-facing/in-person availability and whether the business is appointment-only | Website 07:00–24:00 remains contact/enquiry availability. Do not copy it blindly into GBP fitting/service hours |
| Service edits | Exact accepted/pending/not-approved state for the previously proposed installation services | Review Google notifications and status; avoid repeated speculative edits |

Google separates [verification/discoverability](https://support.google.com/business/answer/145585), [edit review](https://support.google.com/business/answer/3038311), [eligibility](https://support.google.com/business/answer/13763036) and [service-area rules](https://support.google.com/business/answer/9157481). Its eligibility rules exclude lead-generation/online-only businesses. Area guidance allows up to 20 genuine areas, normally within about two hours' drive, with exceptions described by Google. Its [representation guidance](https://support.google.com/business/answer/3038177) requires truthful customer-facing hours. These are policy review gates, not evidence of enforcement against Veltrix.

**Prepared description for owner review only, after eligibility is established:** “Veltrix Windows & Doors supplies uPVC windows and doors and handles installation and repair enquiries. Tell us about your job so we can check availability for your postcode. Survey, fitting and repair arrangements must be confirmed before an appointment or order is agreed.” This draft is not submitted, does not verify coverage and should not be used to disguise a lead-generation model.

## Search Console and Bing

**Both PENDING—NO ACCOUNT SESSION.** Current property verification, submitted sitemap status, Page Indexing/Coverage, Google-selected canonical, last crawl, URL Inspection, security/manual actions, Bing errors and requested actions were not accessible. Historical sitemap Success/processing reports are not treated as current. No resubmission, indexing request or account edit was made without evidence of a problem.

Once the authorised sessions are available, the exact read-only checklist is:

1. Select the existing domain property for `veltrixwindowsdoor.co.uk`; confirm ownership/property type without creating another property or changing verification DNS.
2. Inspect the existing `/sitemap.xml` submission: current status, last read, discovered URLs and specific errors. The **live file has 49 URLs**; a historical dashboard count of 47 can be a stale read rather than a bad sitemap. Resubmit the existing file only if a verified issue and authorised action require it.
3. Inspect homepage, `/contact/`, `/windows/`, `/services/installation/` and the two merged guides: indexed/not-indexed reason, Google-selected/user canonical, last crawl and live-test result. Record facts privately, with redacted aggregates publicly.
4. Read Page Indexing, manual actions and security issues. In Bing inspect the existing site's sitemap, Site Explorer/URL Inspection and any crawl/index errors. Only correct specific substantiated problems; do not bulk-submit or change accounts speculatively.

## Live website evidence

Read-only requests and isolated Chrome tests were performed against production. No enquiry was submitted. Initial PowerShell/web-tool TLS/transport failures were inconclusive. Certificate-validating curl and Chrome succeeded; failed curl requests were rechecked without disabling TLS validation.

| Check | Observed result |
| --- | --- |
| Public HTTPS and page HTML | **49/49 sitemap pages returned 200**, with server-rendered content; 50 generated pages include the non-indexable error document |
| Sitemap | **49 unique indexable URLs**, compared with historical 47; correct HTTPS apex paths and lastmod fields |
| Titles/descriptions | Present and unique across all 49 fetched pages |
| H1/canonical/Open Graph | One H1 per page; self canonical and OG URL equal each fetched sitemap URL; no duplicates |
| Robots/indexing directives | robots and llms endpoints 200; robots allows public pages and disallows the assistant-data directory; no fetched page has meta/header noindex |
| Structured data | All fetched JSON-LD parses; private address/postcode not published in business JSON-LD; no unconfirmed public areaServed list added. Syntax validity is not Google rich-result eligibility |
| Internal links | Live HTML internal page targets all resolve to the fetched sitemap route set; generated link/SEO checks have zero errors |
| Missing URL | Deliberately nonexistent URL returned **404**, not a homepage soft-404 |
| Crawler-UA sample | Contact page returned 200 with Googlebot and Bingbot user-agent strings. This is a UA simulation from this environment, **not an actual Google/Bing crawl or proof of indexing** |
| HTTP/host variants | Apex HTTP, www HTTP and www HTTPS each returned 200 with no canonical-host redirect; HTML canonical points to HTTPS apex |
| Live browser sample | Homepage/contact, 1440px and 390px: no horizontal overflow or page errors; production direct lead capture remains false with empty endpoint |
| Live accessibility defects | Reproduced header logo label/content mismatch and focusable aria-hidden rotating mobile WhatsApp link. Fix proposed in this new branch, not deployed |

There is no evidence here of a site-wide robots/noindex block or hard outage explaining GBP non-publication. Indexability does not establish index inclusion; Google's [technical requirements](https://developers.google.com/search/docs/essentials/technical) do not guarantee indexing. A hidden address must not be invented merely to satisfy a LocalBusiness rich-result requirement. Existing unconfirmed manufacturer/partner/survey claims remain owner-evidence items, not verified business facts.

### Redirect proposal awaiting explicit approval

Prepare one narrow Free Cloudflare redirect rule for these two exact website hosts only: when scheme is HTTP **or** host is `www.veltrixwindowsdoor.co.uk`, permanently redirect to `https://veltrixwindowsdoor.co.uk` plus the unchanged path/query, using 301. Exclude workers.dev and staging hosts; do not touch Worker routes, email DNS or A/AAAA/CNAME records. Inspect existing zone redirect/SSL rules first to avoid loops/conflicts; test `/`, `/contact/?source=test`, an asset and a missing path on all host/scheme variants. If the account lacks the required free rule capability/permissions, stop rather than purchase or change the deployment architecture.

This is **documentation only**. No production redirect rule was created. Cloudflare Workers static-assets [`_redirects` does not support domain-level redirects](https://developers.cloudflare.com/workers/static-assets/redirects/), so an unsupported host rule was not added to the build. HTTPS canonical tags already exist; the recommendation strengthens consolidation, not a claim that this causes the profile issue.

## Website correction and verification

Only shared accessibility behaviour is changed:

- `lib/layout.mjs`: visible logo text supplies its accessible name, with hidden “home” context and explicit text separation. Appearance and destination are retained.
- `src/assets/js/main.js`: inactive rotating bar items become inert as well as aria-hidden; desktop/reduced-motion modes restore focusability. Rotation does not hide a currently focused contact action.
- `scripts/accessibility.test.mjs` and package check: four dependency-free regression tests. Before correction three fail/one passes; afterward all four pass.

**New branch: 44/44 tests PASS.** PR #12 alone: **42/42 PASS**. An isolated integration worktree containing PR #12 plus this patch: **46/46 PASS**, with clean patch application; neither PR branch was merged or edited. Each build remains 50 generated/49 indexable with zero link/SEO errors. No new pages or business facts were added. Shared header/script changes do not change main-content fingerprints, so `lastmod.json` is unchanged.

Isolated installed-Chrome tests at desktop 1440px/mobile 390px verified navigation/keyboard/Escape, chatbot guarantee response, contact validation and intercepted WhatsApp destination, quote list entry and actual PDF header. Zero external requests/enquiries or page errors. PR #12 additionally rejects past preferred/alternative dates, permits a valid next-day handoff, preserves repair context and displays both new mobile trust FAQs. This review exercised built local PR #12 code; its existing Cloudflare preview check is separately green.

Six pages (`/`, contact, book, quote, FAQ and doors) at both widths have **zero axe A/AA violations in stable reduced-motion tests**. Normal-motion mobile targeted axe and focus/rotation checks also pass after the fix. Early normal-motion full scans produced animation-sensitive contrast findings while opacity reveals ran; the stable scan is explicitly distinguished from that transient state. These samples and unit tests are not a complete manual accessibility certification.

One local mobile Lighthouse **13.5.0** run: **performance 76, accessibility 100, best practices 100, SEO 100**; LCP approximately **4.36s**, TBT **28ms**, CLS **0**. This is a lab sample, not field Core Web Vitals or a paired performance comparison. The performance score/LCP leaves optimisation work; no indexing/ranking benefit is promised and the site was not restyled to improve a score.

Screenshots, raw HTTP/browser reports, synthetic PDFs and account-access diagnostics are kept outside Git. Public documentation contains no private credentials, customer/test records or Google account identifiers.

## Exact outstanding actions

| Action | Needed from owner/reviewer | Status |
| --- | --- | --- |
| Account diagnosis | Connect existing authorised signed-in browser for GBP/GSC/Bing read-only inspection; no new credentials need to be pasted | PENDING access |
| Profile eligibility, hours and areas | Supply genuine operating model/service evidence; then approve exact consequential corrections, if needed | PENDING evidence and explicit change approval |
| Redirect consolidation | Approve the exact HTTP/www-to-HTTPS-apex proposal after existing-rule inspection; no DNS changes proposed | PENDING approval; not applied |
| PR #12 and this new PR | Independent review and separate explicit merge/deployment approval | PENDING; both remain draft/unmerged |
| Backlog business-dependent features | Named manufacturer written terms, genuine partner operations/qualifications, prices/contracts and consented assets as listed in the reconciliation | PENDING evidence; no fabricated substitute |

No paid service, DNS/email-routing/authentication/Turnstile setting, production route, production lead endpoint or production deployment was changed. No PR was merged. Stop here for independent review; account-dependent conclusions remain open.
