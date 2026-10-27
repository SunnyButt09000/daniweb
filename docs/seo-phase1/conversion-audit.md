# Conversion audit — Phase 1

Audit date: 27 October 2026. Scope: source inspection in the supplied feature checkout. This document records the initial implementation observed during the audit; subsequent Phase 1 changes should be checked against the findings below.

**Evidence boundary:** this is a static code audit, not a browser or delivery test. No enquiries, emails, WhatsApp messages, PDF uploads or bookings were sent. No accounts or production configuration were changed. The parent task is conducting browser checks separately; their results must be recorded separately. A working link or generated file does not prove that the business received an enquiry.

## Current configuration and delivery boundaries

`src/data/site.json` supplies the public contact destinations, with `forms.endpoint`, `forms.provider` and `quoteUpload.endpoint` all empty. `lib/layout.mjs` (`documentShell`, around line 534) serialises these as `VX.endpoint` and `VX.drive`. Consequently there is currently **no configured website-to-inbox form capture and no configured PDF upload**. Existing WhatsApp and email handoffs are intentional client-side features, not direct submissions to the business.

Keep the confirmed daily **07:00–24:00 contact hours**. These do not establish appointment availability, a guaranteed immediate response or an emergency attendance service. Do not add unverified service areas, private addresses or postcodes, accreditations, reviews or partnerships to improve conversion.

| Journey | Implemented in source | Customer or configuration step still required |
| --- | --- | --- |
| Homepage WhatsApp | Hero anchor uses `waLink` with a greeting; opens the configured WhatsApp destination. | Customer must open WhatsApp and press Send; photos must be attached there. No website lead record is created. |
| Product/model quote CTA | Product card/detail and model links pass `?item=` and optional `&model=`. Builder accepts matching values and selects the product/model. | Customer must add the configured item to the schedule, enter details, generate the PDF and finish the external send. This does not calculate or display a price. |
| Quote builder, WhatsApp | Validates details, prepares an A4 PDF cover plus one page per item, triggers a local download and reveals the send panel. The WhatsApp draft contains a short schedule and filename. | With upload unset, customer must find the downloaded PDF, attach it as a document and press Send. A download trigger cannot prove a completed save or attachment. |
| Quote builder, email | Same local PDF preparation; opens a `mailto:` draft with the short summary. | A configured mail app, manual PDF attachment and Send are required. `mailto:` cannot attach the PDF automatically. |
| Quote PDF upload option | `uploadPdf` can POST the PDF and full summary to an Apps Script endpoint, wait up to 45 seconds, and use a validated Drive URL. | Endpoint is unset. Deployment/account setup and an authorised delivery check would be needed. An upload failure falls back to local download and manual attachment. |
| Booking: survey / repair / service | Form composes a booking request with preferred date/time, contact details and repair context; query parameters preselect valid type/repair values. | WhatsApp/mail app must open and customer must send. This does not reserve a slot. Team must confirm availability. Repair photos are added manually. |
| Contact form | Validates required name, phone, message and checkbox, then composes WhatsApp or email draft. | Customer must send externally. No configured direct capture; phone is required even for email handoff. |
| Assistant: quote / repair / survey | Local rule-based guided flows collect context, optionally name/postcode, display a message and provide WhatsApp/copy actions. | Customer must open WhatsApp, send and optionally attach photos. Assistant is automated, not a live staff inbox or confirmed booking. It does not invoke the form-copy or PDF-upload integrations. |
| Mobile quick actions | Fixed Call / WhatsApp / Quote / Ask us bar, safe-area padding, compact quote/booking launcher and assistant visual-viewport handling exist. | Real-device app handoff, downloads/file picker, keyboard, focus and overlap checks remain necessary. Static CSS is not evidence of mobile usability passing. |

Sources: `lib/pages.mjs` (`home`, `product`, `modelCard`, `quote`, `book`, `contact`); `lib/layout.mjs` (`waLink`, `productCard`, footer action bar); `src/assets/js/forms.js` (lines 52–104, 427–434, 520–536, 748–891, 896–979); `src/assets/js/assistant.js` (guided flows around 1098–1149, WhatsApp message renderer around 1442–1464 and flow completion around 1669–1687).

## Lead-loss findings and priorities

1. **Highest priority: the external handoff is the conversion boundary.** `forms.js` opens WhatsApp/mailto and reports that the visitor must send; it does not receive delivery receipts. With both optional endpoints empty, someone can complete every website field and leave without the business receiving anything. Keep this distinction visible before the action, not only in the post-action message. Offer a visible call fallback and copyable summary; do not label a click or draft as a lead received.

2. **Quote attachments add several failure points.** The normal path says `Saved:` after triggering an anchor download, then tells the customer to attach the file. The short draft says `(attached)` before any attachment exists (`forms.js`, `shortMessage`). A customer sending only that draft loses glazing, colour, opening, vents and notes held in the PDF. Change the draft to say that the PDF will be attached and make the manual attachment requirement prominent. A future direct capture path should retain the full structured schedule after a server acknowledgement and show an explicit receipt reference. That integration is a proposal, not enabled in Phase 1.

3. **Homepage repair intent is not preserved by the combined visit CTA.** `lib/pages.mjs:105` sends “Repairs & installation” to `/book/`, whose default is the free-survey radio. Separate repair and survey intent, or make the repair action use `/book/?type=repair`. Repair detail links already carry type/repair context; keep those intact.

4. **Contact hours currently generate appointment choices.** `slotOptions` and `dateHint` at the top of `lib/pages.mjs`, booking closed-day logic in `forms.js`, and assistant `whenOpts` derive availability from `site.hours`. Daily contact hours therefore produce late-evening and weekend visit preferences without separate confirmed scheduling data. Preserve 07:00–24:00 contact hours, label appointment timing as a preference subject to confirmation, and introduce distinct appointment availability only when supplied. Do not infer attendance hours or make them up.

5. **Preferred-date constraints are incomplete.** Booking sets native date `min` to tomorrow, but the forms use `novalidate` and custom `validate` checks presence/phone/email/postcode, not date range or native validity. A stale/past date can therefore reach the draft if entered programmatically or retained across dates. Add explicit date checks before an external handoff; retain the warning that a request is not a reservation. Closed-day advice is currently a warning rather than a block.

6. **Optional capture does not provide a customer-visible receipt.** `postCopy` is fire-and-forget: non-OK/network failure goes only to console, and handoff continues. If later configured, it sends filled form fields plus full text summary before the external send, excluding the checkbox. Do not claim inbox receipt on this basis. Use an acknowledged server response with a receipt ID, useful failure/retry text and deduplication before measuring a captured lead. For quote PDFs, Apps Script can return upload success even when `MailApp.sendEmail` fails; Drive upload success and email delivery must be represented separately.

7. **App/device failures need explicit recovery.** Booking/contact use a popup with navigation fallback for WhatsApp; mailto relies on the visitor's email setup. Quote normally requires an additional click after asynchronous PDF preparation, which is sensible for popup restrictions. PDF-generation failure falls back to a full-text draft, but its status text always says WhatsApp even when email was selected (`forms.js:870–874`). Correct this channel-specific text. Very large schedules can still exceed external URL limits after the condensed fallback; provide copy/download recovery and test realistic large lists.

8. **Reduce effort before a visitor has a reliable send route.** Current quote/contact require a phone; booking also requires full street address at request time. Consider asking for one preferred reply channel and collecting full address when a visit is being arranged. Keep detailed drawings optional: blank sizes already work, and the assistant supplies a shorter quote route. Preserve optional/skip choices rather than adding fields for measurement purposes.

## Specific copy changes to review

| Location | Recommended copy or treatment |
| --- | --- |
| Product-card “Get a price” (`lib/layout.mjs`, `productCard`) | “Request a quote”, to set the expectation that the builder collects a request rather than returning an instant price. |
| Quote main buttons (`lib/pages.mjs`, `quote`) | “Prepare WhatsApp request” / “Prepare email request”; helper: “We’ll create your PDF. Attach it in WhatsApp or email, then press Send.” Use upload-aware wording only when upload actually succeeds. |
| Quote draft (`forms.js`, `shortMessage`) | “Full schedule with drawings: [filename]. I’ll attach the PDF.” Do not predeclare `(attached)`. |
| Download status (`forms.js`, `showSendBox`) | “PDF download started: [filename]. Check your downloads, then attach it below.” Avoid asserting the file was saved. |
| Booking lead (`lib/pages.mjs`, `book`) | “Choose your preferred date and time. Continue to WhatsApp or your email app and press Send to request a visit. We’ll confirm availability with you.” |
| Contact form helper | “Continue to WhatsApp or your email app, then press Send. Your message is only delivered when you send it there.” Adjust if acknowledged direct capture is later enabled. |
| Assistant completion (`assistant.js`, `finishFlow`) | “Open WhatsApp, check your message and press Send. Your request has not been sent yet.” Preserve manual photo guidance and booking confirmation wording. |
| Contact/booking hours labels | “Contact hours: 7am–midnight, every day. Appointments are arranged separately and confirmed by the team.” Preserve the underlying 07:00–24:00 contact data. |
| Photo-prefill links (`layout.mjs`, `pages.mjs`) | Prefer “I can send photos” over “Photos attached” before the customer has attached anything. |

## Privacy-conscious capture and measurement proposal

This is a product/data-minimisation proposal, not a claim that new tracking is installed or a legal assessment.

- Keep enquiries and measurement separate. Capture only details needed to respond or arrange the requested visit. No marketing enrolment should be implied by an enquiry checkbox. Avoid collecting tenant access details, sensitive free text or unnecessary property information in an initial request.
- Current assistant conversation and quote items/reference live in session storage; assistant has a reset control. `assistant.js` fetches only the site's generated knowledge base, not an external language-model service. Do not start recording chat transcripts or abandoned form contents for analytics. Privacy/cookies copy currently says there is no analytics or advertising tracking; any later measurement change must be reviewed alongside those statements.
- Use a small event vocabulary: `cta_click`, `quote_item_added`, `form_validation_error`, `pdf_prepared`, `pdf_failed`, `handoff_opened`, `capture_acknowledged`. Allow only coarse route type, CTA location, enquiry kind, selected channel, item-count band and a field-name/error-code enum. Never include names, numbers, emails, street addresses, postcodes, free text, quote contents, generated PDF URLs, full external link URLs/query strings, chat transcripts or persistent cross-site identifiers.
- An outbound click means handoff started. A prepared PDF means a file was generated. `navigator.share` resolution does not prove a message reached staff. Only an acknowledged capture endpoint can support “website enquiry received”; qualified/replied/booked outcomes need business-side confirmation. Publish funnel counts with these definitions, and do not combine them into a misleading single “lead” total.
- If direct capture is approved later, identify the actual provider, document what is sent and when, set retention/access controls, deduplicate retries and test failure behaviour. Current form-copy payload includes hidden or inactive filled fields; only submit the fields relevant to the selected journey. Keep analytics free of the capture payload.
- If Drive upload is enabled later, verify the actual account, folder permissions, private link access, email failure handling and cleanup trigger. `scripts/google-drive/Code.gs` has a separate fixed `KEEP_DAYS = 30`; changing website `keepDays` changes policy text but not that script. Keep both in sync. Do not enable link-public sharing to reduce friction.

Sources: `src/assets/js/forms.js` (`postCopy`, session `store`, `uploadPdf`, `showSendBox`); `src/assets/js/assistant.js` (header, `loadKB`, session save/reset and guided handoff); `lib/pages.mjs` (`privacy`, `cookies`); `scripts/google-drive/Code.gs` (`doPost`, `setup`, `cleanup`); `build.mjs` (upload URL validation and generated CSP).

## Browser and delivery verification still outstanding

Browser checks should use synthetic, non-identifying inputs and stop before external sends/uploads. Check homepage WhatsApp destination and draft; product/model preselection; add/edit/remove and no-size quote items; required-field errors; quote PDF generation and send-panel instructions; channel-correct fallback messages; survey/repair preselection; date validation; assistant skip/cancel/reset and final message; and mobile widths with keyboard/focus, sticky-bar overlap and PDF share availability. Real WhatsApp, mail-client, downloads/file-picker and endpoint inbox delivery require separate explicit test arrangements. This audit makes no claim those checks passed.

## Implemented and tested in this feature

The initial findings above remain an audit trail. Phase 1 corrected the quote draft’s premature “attached” claim, changed “Saved” to “Download requested” and fixed the PDF-error fallback channel label. Quote/booking introductions and time preference notes now distinguish an enquiry/availability check from a confirmed appointment. Assistant contact hours and partner availability answers were aligned; numeric hours and endpoint values did not change.

Actual local Chromium checks passed for quote configuration, validation, editing, PDF generation, WhatsApp/email destinations, booking repair preselection/required fields/message composition, contact form, FAQ and chatbot handoffs. No write requests were made; external booking/contact opens were intercepted. Quote files downloaded locally and PDF headers were verified. Four mobile samples passed layout checks. These checks do not prove app launch, file attachment, sending, inbox delivery or a reserved slot. Booking minimum-date validation and the generic homepage visit CTA remain the explicitly documented backlog above.

See on-page-changes.md for the full browser/accessibility/performance evidence and screenshots. Keep future capture metrics separate: `cta_click`, `draft_prepared`, `download_requested`, server-acknowledged `enquiry_received`, and team-confirmed appointment are different events. No tracking or backend was added.
