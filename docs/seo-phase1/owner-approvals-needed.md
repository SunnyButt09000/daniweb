# Owner approvals and evidence needed before further publication

27 October 2026. **This feature branch and PR must not be merged or deployed without explicit final owner approval.** No Google/Bing account, DNS, credential, Cloudflare or production-branch settings were changed.

## Business evidence

| Topic | Evidence / decision needed | Phase 1 treatment |
| --- | --- | --- |
| Partner coverage | Contracted entity, service and survey scope, actual boundary, availability, insurance and competence evidence for each partner | No partners/cities invented; coverage lists remain empty; no location pages |
| Contracting model | Who sells, surveys, installs, takes payment, handles defects, complaints and cancellations; responsibility if partner unavailable | Conditional “if a partner is proposed”; explicit confirmations before agreement |
| Contact versus attendance | Confirm survey/fitting/repair attendance policy separately from 07:00–24:00 contact hours | Exact contact hours retained; existing preference labels retained and explicitly not availability |
| Guarantees | **Owner confirms manufacturer provides 10-year guarantee on NEW PRODUCTS only.** Written terms still needed: manufacturer's legal name and policy issuer, included components, fitting-workmanship boundary, remedies, exclusions, territory, claim process and partner responsibility. Repair duration not confirmed. | New-product guarantee set to 10 years; no 10-year installation promise; removed previously advertised 12-month repair term pending evidence. |
| Insurance-backed protection | **Owner confirms NO insurance-backed guarantee policy has been arranged.** Future cover must not be advertised until purchased and evidenced. | Changed `insuranceBacked` to `false`; removed/negated policy claims from public guarantee, FAQs, assistant, summary and privacy text. |
| Free surveys | Actual availability, geographic limits, repair/diagnostic charges versus a free installation survey | Existing offer retained; coverage/appointment checks qualified; do not promise free travel nationwide |
| FENSA / Certass / other registration | Active registration of the actual fitting entity and work scope, with evidence and expiry checks | No badges, registrations or common partner accreditation invented; scheme names are explanatory examples |
| Product performance | Exact quoted configuration’s Uw/WER/DSER, PAS 24/Secured by Design and TS 007/SS 312 evidence | Existing options not strengthened. “A-rated glass” wording corrected; product claims still need supplier evidence |
| Timings and project history | Evidence for existing “most repairs one visit”, fitting/lead-time statements, “most fitted” language and examples | Existing non-priority claims retained as audit debt, no new figures or case studies |
| Public business identity | Owner-approved legal/trading identity and any eligible public business location | Never use a private residential address/postcode. Address/legal fields remain empty; no storefront assertion |
| Enquiry receipt | Choose an approved capture backend, inbox ownership, failure recovery and receipt ID | Both optional endpoints remain blank; website handoff is not delivery |
| Personal-data sharing | Define partner sharing, controller/processor roles, minimised fields, lawful basis, privacy notice, retention, deletion, access controls and supplier contracts | No new trackers, third-party endpoints or automatic partner data sharing |

**Owner clarification 27 October 2026:** The manufacturer will provide a 10-year guarantee on new products, but the specific manufacturer and written terms are not yet supplied. No insurance-backed policy exists. The product-only scope and lack of insurance are now reflected in the draft code. Written terms, free-survey coverage, repair warranty, fitters' responsibilities and individual product evidence still need verification before publication. No review, performance, partnership or office claim was invented to fill a gap.

## Nation-specific checks

Have the actual installer check the property, work scope and current rules. England and Wales use separate Approved Documents and appropriate scheme/building-control routes. Wales safety glazing is Part N. Scotland has a separate standards/verifier system and straightforward replacements may not require a warrant. Northern Ireland has its own regulations/booklets and application exemptions do not remove technical duties. FENSA/Certass references do not establish Veltrix membership or universal UK coverage. Published future England/Wales 2026 guidance has 2027 commencement/transitional provisions; do not apply it prematurely.

Evidence checked 27 October 2026:

- [England competent person schemes](https://www.gov.uk/building-regulations-competent-person-schemes), [current England AD L](https://assets.publishing.service.gov.uk/media/662a2e3e55e1582b6ca7e592/Approved_Document_L__Conservation_of_fuel_and_power__Volume_1_Dwellings__2021_edition_incorporating_2023_amendments.pdf), [England ventilation guidance §§3.14–3.15](https://assets.publishing.service.gov.uk/media/61deba42d3bf7f054fcc243d/ADF1.pdf).
- [Welsh doors/windows guidance](https://www.gov.wales/building-regulations-doors-and-windows), [Welsh Part N](https://www.gov.wales/approved-document-n-glazing-safety-relation-impact-opening-and-cleaning), [Welsh AD L](https://www.gov.wales/sites/default/files/publications/2024-05/building-regulations-approved-document-l-vol-1.pdf).
- [Scottish April 2026 domestic handbook](https://www.gov.scot/publications/building-standards-technical-handbook-domestic-april-2026-pdf/), [Scottish Schedule 3](https://www.legislation.gov.uk/ssi/2004/406/schedule/3).
- [NI regulations, regulation 9](https://www.legislation.gov.uk/nisr/2012/192/body/2025-05-06/data.xht), [NI technical booklets](https://www.finance-ni.gov.uk/articles/building-regulations-technical-booklets).
- [FENSA registration scope](https://fensahelp.zendesk.com/hc/en-gb/articles/1500000620121-Types-of-Jobs-You-Can-Register-with-FENSA), [IBG explanation](https://fensahelp.zendesk.com/hc/en-gb/articles/1500000934341-Insurance-Backed-Guarantee-IBG), [CAP guarantee advertising rules 3.55–3.56](https://www.asa.org.uk/type/non_broadcast/code_section/03.html).

## Existing technical / conversion debt

Keep separate from deployment approval: booking uses `novalidate` and the custom date check does not fully enforce HTML date minimum/validity; revalidate dates server-side if a capture/scheduling backend is approved. Contact form requires phone even for email. App launch, download completion, attachment and actual Send cannot be proven from the website. Real-device app/mail/file-picker and inbox delivery require an authorised owner-controlled test. Homepage combines repairs and installation in one generic visit link; explicit repair links elsewhere correctly preserve context.

Accessibility baseline findings include desktop logo label-content-name mismatch; Lighthouse also flags aria-hidden-focus. These were not introduced and should be investigated in a separate focused accessibility change. Current mobile automated samples have no A/AA findings, which is not a full accessibility certification.

## Release instructions — approval still required

1. Review this PR, six deliverables and browser evidence. Supply/resolve business evidence above, or explicitly approve a follow-up correction for unresolved existing claims.
2. Reconfirm PR head/base and successful project checks. Do not merge until explicit final approval.
3. An authorised maintainer may then squash merge to `claude/upvc-windows-doors-site-jj8slj`. Existing Cloudflare Git integration should handle the production build. Do not change deployment commands or manually deploy as part of this PR.
4. Verify Cloudflare’s check for the exact merge SHA, version/deployment result and live pages/handoffs without submitting real enquiries. A successful preview alone does not establish production success.
5. Search Console/Bing may still be processing. Review real first-party data later; never claim indexing from sitemap inclusion or expected AI-search inclusion.
