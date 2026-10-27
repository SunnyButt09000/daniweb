# Partner installation coverage — evidence and publication plan

Reviewed 27 October 2026. Status: **coverage page awaiting owner evidence and approval; no new public page or city pages created**.

The owner describes supply and a plan to coordinate installation through partners in different UK cities. This is not evidence of current nationwide delivery, installation, a contracted partner, an office, a survey appointment or common accreditation. `src/data/site.json` currently has empty `areaServed`, `serviceAreas` and `postcodePrefixes`. Keep them empty. No service-area or postal-address structured data is introduced.

## Coverage verification matrix

These are research rows for the four UK jurisdictions, not confirmed service areas. No city is populated because no city-level operating evidence was supplied. A blank verification date means unverified; the review date above is not a partner-verification date.

| City or region | Installation partner confirmed? | Services supported | Survey availability | Geographic coverage | Relevant qualifications or certification method | Availability restrictions | Supporting evidence provided | Approved for public website? | Last verified date |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| England — scope to be specified | Unverified | Unverified per partner/job | Unverified | No postcode boundary verified | Verify current installer registration/work scope or agreed building-control route | Unverified | None supplied | No coverage claim approved | Not verified |
| Wales — scope to be specified | Unverified | Unverified per partner/job | Unverified | No postcode boundary verified | Welsh requirements; verify scheme work scope or building control; safety glazing Part N | Unverified | None supplied | No coverage claim approved | Not verified |
| Scotland — scope to be specified | Unverified | Unverified per partner/job | Unverified | No postcode boundary verified | Scottish standards and local verifier; warrant exemption does not remove standards | Unverified | None supplied | No coverage claim approved | Not verified |
| Northern Ireland — scope to be specified | Unverified | Unverified per partner/job | Unverified | No postcode boundary verified | NI regulations, technical booklets and council building control; check application exemption | Unverified | None supplied | No coverage claim approved | Not verified |

For each real partner, maintain a private operating register: contracting legal entity, services, exact boundary, survey responsibility, availability, competency/registration and insurance evidence, expiry/recheck dates, contracting/payment/warranty/complaints responsibilities, owner approval. Publish only approved aggregate coverage information; do not publish residential addresses, customer postcodes, contracts, personal contacts, identity or insurance documents. “No evidence supplied” does not establish that a partner does not exist.

## One possible national page

Recommended candidate: `/installation-coverage/`, H1 “Check window and door installation availability”. Its distinct intent would be **checking eligibility and understanding partner coordination**, while `/services/installation/` owns installation process/commercial intent. The existing installation page now explains checks sufficiently for Phase 1. Do not add the candidate unless verified facts and a materially useful process make it distinct; otherwise retain one installation page to avoid cannibalisation.

Proposed structure: what can be enquired about; how postcode/job checks work; survey and fitting responsibilities; who the customer contracts with; relevant national compliance route; availability restrictions; written quote/guarantee/aftercare; how to request a check. Do not imply supply-only shipping coverage either: it too needs confirmation. No instant postcode “yes”, office map or blanket UK `areaServed` is justified. Do not create a Google Business Profile for a partner or an office that is not an eligible genuine Veltrix location.

### Proposed copy — DOCUMENTATION ONLY, AWAITING APPROVAL

> Ask us to check installation availability for your postcode and the work you need. An enquiry does not reserve a survey or fitting date. If installation through a suitable partner can be arranged, we will identify the supplier and installer, the work included, applicable compliance arrangements, and the written guarantee and aftercare contact before you agree. Availability differs by location and job. Contact hours are 7am to midnight every day; these are not guaranteed installation times.

Proposed implementation fragment (not imported by `build.mjs`; do not copy into public output until approved):

```html
<section class="sec"><div class="wrap prose">
  <h1>Check window and door installation availability</h1>
  <p>Tell us what you need so we can check postcode, service and installer availability. An enquiry is not a confirmed appointment.</p>
  <h2>Before you agree to partner installation</h2>
  <p>Confirm the supplier, installer, work, compliance route, written guarantee and aftercare contact in your quote.</p>
  <p><a href="/services/installation/">Understand the installation process</a> or <a href="/contact/">request an availability check</a>.</p>
</div></section>
```

Release gates: verified register and boundaries; customer contract and responsibility model approved; nation-specific competence/compliance checks; realistic survey/scheduling policy; privacy notice/data-sharing basis; unique useful content; owner approval; tested postcode and handoff behaviour; sitemap/internal links and appropriate lastmod only on actual publication. Structured data must describe verified services/areas only. City pages require real operations plus original location-specific usefulness, not copied text with a city substituted.
