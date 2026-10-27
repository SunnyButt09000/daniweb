# Veltrix — AEO / customer-answer audit

**Audit date:** 27 October 2026. **Scope:** Candidate from Phase 1 PR #2, public FAQ/guide structure and website assistant. AEO = making real user questions easy to find and answer accurately; not a separate paid ranking service.

## Existing answer surfaces

- `src/content/faqs.mjs` supplies visible `/faq/` question-and-answer content, `llms.txt`, website assistant data and FAQ markup. This single source reduces the risk of conflicting answers.
- Product pages have natural, product-specific questions about suitability and options. Repair pages have symptoms, causes, fixes and relevant FAQs.
- `src/content/guides.mjs` covers measuring, energy ratings, regulations, repair-or-replace decisions and other practical topics, with visible related links.
- `lib/layout.mjs` embeds one connected JSON-LD graph for each indexable page, which must remain aligned with actual page text.
- Phase 1 already clarified **enquiry hours are not confirmed appointment times** and postcodes are checked before bookings.

## Answer intent map

| Customer question | Preferred canonical destination | Direct answer rule |
| --- | --- | --- |
| What types of windows are available? | `/windows/` | Compare casement, flush, sash, tilt-and-turn using real specification and suitability |
| How much does window replacement cost? | `/faq/`, `/quote/` | No universal invented price: depends on dimensions, glass, product and job; request an estimate |
| Who fits my windows in another UK city? | `/faq/`, `/services/installation/` | May arrange a partner subject to postcode/job suitability; actual fitter and responsibilities confirmed before work |
| Can you serve my postcode? | `/book/`, `/quote/`, `/faq/` | Ask for postcode and job; **never auto-confirm UK-wide coverage** |
| How are fittings certified? | `/guides/building-regulations-for-replacement-windows/` | Correct national framework; actual installer/scheme registration must be verified |
| Can a misted sealed unit be replaced without the frame? | `/repairs/misted-double-glazing/` | Depends on frame condition; explain replacement-unit option |
| What if a door won't lock? | `/repairs/locks-and-mechanisms/`, `/repairs/door-alignment/` | Separate lock mechanism faults from misalignment, then offer photos and conditional visit |
| Can I book an evening visit? | `/faq/`, `/book/` | 07:00–24:00 are **contact**, not guaranteed attendance hours |
| What guarantees apply? | `/guarantee/` | Written terms, issuer and policy (if issued); insurance or partner coverage must not be assumed |

## Current gaps and implementation

**Gap A — direct nationwide/partner question:** Existing general FAQ has weekend and survey explanations, but an explicit nationwide-enquiry and partner-installer answer was not clearly represented in the installation FAQ group. Add two short questions with non-promissory answers. They are reused by the assistant and `llms.txt` automatically.

**Gap B — SEO phrase versus real answer:** A phrase like “installers across the UK” cannot imply verified coverage in every postcode. Keep the answer precise: enquire, check service/job, identify fitter, confirm terms, then schedule.

**Gap C — evidence and answer consistency:** Keep the 10-year/12-month and insurance-backed assertions under owner review. Do not invent provider, registration, logos, testimonials or coverage. Answer should point customers to written quotes and actual policy/terms instead of asserting universal protection.

**Gap D — rich-result assumptions:** FAQ markup can describe genuine visible questions, but Google normally limits FAQ rich-result display to eligible, authoritative government or health sites. **Do not promise FAQ rich snippets for a window company**. [Google FAQ rich results change](https://developers.google.com/search/blog/2023/08/howto-faq-changes).

## Answer formatting rules

- Put a concise, directly responsive first sentence before supporting qualification.
- Follow with conditions that materially affect the answer (postcode coverage, final survey, UK nation, specific product, partner competence).
- Explain the practical next step: give postcode, rough size and photos; get a written quote and confirmed fitting details.
- Avoid fictitious cost figures, “near me” office claims, guarantees, urgent response promises and overconfident AI-system statements.
- Cross-link relevant existing products, repairs and guides only where the answer actually benefits.
- Make the same fact consistent across website, chatbot, `llms.txt` and schema.
- Treat customer delivery as complete only on actual submission/receipt; a WhatsApp deep link or mailto draft does not prove an enquiry.

## QA / acceptance

1. New question strings exist on `/faq/` and in generated `llms.txt` and assistant knowledge base.
2. Answers do not promise universal coverage, a city office, a confirmed appointment or identical partner certification.
3. No private address is published; empty service areas stay empty.
4. Canonical, metadata, FAQ parity, internal links, XML sitemap and chatbot tests continue to pass.
5. No new route is needed and page counts should remain 48 HTML / 47 indexable.
6. Record actual test evidence; an automated test not executed is **not passed**.

This is review-only until the owner explicitly approves production merge/deployment.
