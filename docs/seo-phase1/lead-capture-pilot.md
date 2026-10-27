# Veltrix — native lead-receipt pilot (REVIEW ONLY)

**27 October 2026.** This is a *staged implementation*, not a live customer collection service. Default public config deliberately keeps the new route OFF.

## Why this exists

Today, `/contact/`, `/book/` and `/quote/` open WhatsApp or an email draft. Clicking a button does **not** prove that a message was sent. The optional `forms.endpoint` has not been configured. A real lead is an enquiry **persisted on a backend**, with a receipt acknowledgement to the customer. Even email API acceptance does not prove inbox delivery.

Cloudflare's published free allowances are suitable for an early-stage low-volume pilot; they are limits, not a promise that any third-party integrations or human support are free forever.

- [Cloudflare D1 free tier](https://developers.cloudflare.com/d1/platform/pricing/): 5 million rows read/day, 100,000 rows written/day, 5 GB total storage at date of research.
- [Cloudflare Workers free limits](https://developers.cloudflare.com/workers/platform/limits/): 100,000 HTTP requests/day at date of research.
- [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/): require server-side token verification; tokens are not to be trusted client-side.
- [Cloudflare Email Service Workers API](https://developers.cloudflare.com/email-service/api/send-emails/workers-api/): the binding's `send()` returns an email message identifier on acceptance; acceptance is not proof the recipient opened or received it.
- [Cloudflare Email Service pricing](https://developers.cloudflare.com/email-service/platform/pricing/): internal alerts to a **verified destination address** are free even on Workers Free. Arbitrary-recipient sending needs a paid plan, and is NOT needed for the Veltrix pilot. The From address must be eligible under a Cloudflare routing/Email Service domain.
- [Sender and destination binding rules](https://developers.cloudflare.com/email-service/configuration/send-bindings/): keep the destination restricted to the verified business inbox.

## Files in this pilot

- `src/server/leads.mjs` — separate Cloudflare Worker API on `POST /api/leads` only; no public browse/read endpoint. Each request has a random client UUID; an unchanged retry returns the **same saved receipt** rather than inserting a duplicate lead.
- `migrations/0001_leads.sql` — private D1 table for enquiry data, including unique `request_key`. This is a **new, undeployed schema**; if a real DB was created before this update, migrate carefully and do not reapply the create-only script as an alteration.
- `wrangler.leads.example.jsonc` — separate worker route, D1 binding, verified email binding, daily 730-day cleanup. Template contains **no working database ID, sender or recipient**.
- `src/assets/js/forms.js` — optional direct website submission, explicit receipt ID only when D1 confirms save; WhatsApp/email remain available.
- `lib/pages.mjs` / `lib/layout.mjs` — Turnstile and direct button rendered only when configured.
- `src/data/site.json` — new `forms.turnstileSiteKey` default empty; `forms.endpoint` still empty.
- `scripts/leads.test.mjs` — server tests for origin, consent, Turnstile hostname/action, persistence, email outage and 730-day retention.

## User experience when enabled

1. Choose windows/doors quote, a visit request or contact form; enter name, phone, optional email, postcode and job details, then give enquiry-only consent.
2. Turnstile validates human interaction (server verifies hostname `veltrixwindowsdoor.co.uk` and action `lead`).
3. Click **Send directly to Veltrix**. Only after D1 `INSERT` succeeds does user see a `VX-...` receipt code. That is **not a booked appointment**, a final quote, nor proof that notification email reached the operator's inbox.
4. Worker attempts to send an internal notification email. If that fails, persisted row remains `notify_state='pending'`; owner must manually reconcile pending rows.
5. Quote details are sent as **text** (items, types, approximate sizes, options, reference); **not** PDF drawings or files. PDF can still be downloaded and sent separately.
6. If direct service fails, the form keeps the user's details, shows a failure and suggests WhatsApp/email instead. Clicking WhatsApp/email still requires the customer to press Send manually. No third-party tracking is activated by default.

## Security and legal gates — DO NOT skip

- **No secrets in GitHub:** Turnstile secret is an encrypted Worker secret; only public sitekey appears in site config.
- **Same-origin restriction** to the business website, explicit consent, input length/type checks, Turnstile proof validation against hostname/action, no external CORS permission.
- **Fail closed** when any binding or secret is absent. No GET endpoint exposing customers.
- No payment-card data, uploads, ID documents or full address in the D1 pilot. The optional booking form currently collects an address for customer-prepared WhatsApp messages, but the native Worker only persists supplied **name, phone, email, postcode, typed summary and source**. The direct-route booking summary strips the street-address line before submitting to D1; postcode is enough for initial enquiry routing. Free-text messages can still contain whatever a visitor volunteers, so the privacy notice and access controls remain essential.
- **Privacy review needed:** Cloudflare D1 and Turnstile as processors, legitimate/contractual basis, customer rights process, 24-month unconverted enquiry retention, roles/access, backup/delete duties and partner sharing after separate consent/notice.
- Restrict Cloudflare dashboard access and audit it. Never share D1 rows through public URLs or in code/logs.
- A 730-day scheduled cleanup exists; **verify cron enabled and functioning** and perform manual removal on verified lawful requests. Future contracted customer records belong in a separate properly retained accounting/job system.
- Email binding must target **owner-verified destination** and use **Cloudflare Email Service onboarded domain sender**.
- Before production, run a truly controlled end-to-end **test enquiry with owner approval**: verify Turnstile, D1 row insertion, receipt ID, actual inbox receipt (including spam), pending fallback, CRM/manual reconciliation and deletion.
- Confirm route precedence with the existing separate Cloudflare Workers static-assets app. Do not reroute or break the homepage.
- Never add a fallback that silently accepts `200` while dropping leads. Health checks and notification alerts should be planned once real leads arrive.

## Owner setup checklist — only when explicitly approved

1. Verify legal trading identity / contact channels; approve privacy text and lawful processing. Confirm whether first-enquiry data can be retained in D1.
2. Create D1 database `veltrix-leads` in the owner's Cloudflare account; apply `migrations/0001_leads.sql`. Put its ID into a private deployment copy of `wrangler.leads.example.jsonc` (e.g. `wrangler.leads.jsonc`; do not commit local secrets).
3. Onboard an approved sender domain to Cloudflare Email Service; verify the intended operations inbox destination. Fill binding's destination, `OPS_EMAIL`, `FROM_EMAIL`. Email Routing-only inbound forwarding is NOT equivalent to configured outbound sending.
4. Create Turnstile widget with hostname `veltrixwindowsdoor.co.uk`; inject its secret via Wrangler's encrypted secret store, **not** site.json or repository.
5. Deploy isolated API Worker with exact same-origin `/api/leads` route and HTTPS; test safely with mock/demo contact data. Monitor Worker logs without printing personal details.
6. Confirm read/write access to the private D1 dashboard for the actual team, and rehearse recovery if emails fail. `notify_state='pending'` must be checked operationally, not ignored.
7. **Only after all prior steps work**, approve the separate static-site config change from empty endpoint to `"/api/leads"`, `provider: "Cloudflare D1"`, and the Turnstile public sitekey. This reveals the new direct-submit buttons and script. Rebuild/test preview before production merge.
8. Test real delivery, spam filtering, response workflows and data deletion. Publish only with final owner approval.

## Owner's safe daily enquiry reconciliation

Once the pilot is actually live, use **Cloudflare dashboard's authenticated D1 console** (not public website URLs) and compare the database records against your business inbox. Useful queries:

```sql
-- Recent enquiry metadata (do not paste customer data into public issue trackers)
SELECT id, created_at, kind, postcode, notify_state
FROM leads
ORDER BY created_at DESC
LIMIT 25;

-- Pending internal email notifications (read from private D1 only)
SELECT id, created_at, kind, postcode
FROM leads
WHERE notify_state = 'pending'
ORDER BY created_at ASC
LIMIT 25;
```

A pending status means only that email acceptance was not recorded; it does **not** mean the lead itself was lost. Access the full private row only to contact the customer or meet lawful record requests. Daily email retry processes up to 20 rows; manual reconciliation is still mandatory. If an API response times out, a retry of the exact same form content uses the same random request key and reuses the existing receipt without sending a duplicate initial notification. Changing form content creates a new request key.

**Before enabling production:** confirm D1 table has `request_key TEXT NOT NULL UNIQUE`, deployment routing and Turnstile secrets, email-service onboarding, customer privacy, actual inbox delivery and availability of authorised staff to follow up. No real leads are captured by this review-only branch.

## Smoke-test evidence required to call Phase 2 lead capture 'COMPLETE'

- [ ] API returns 503 if unconfigured, 403 on invalid Origin/Turnstile, 422 on invalid consent/data and 201 only after confirmed DB insertion.
- [ ] False-positive statuses tested: D1 failure never shows success; email outage keeps the record pending.
- [ ] Regular regression: `npm run check` passes on the new feature branch.
- [ ] The contact, booking and quote website forms each receive an actual recorded test ID, retrievable privately in D1.
- [ ] Receipt UI does not claim appointment or email delivery. Existing quote-PDF, WhatsApp and mailto flows still work.
- [ ] The operator's verified mailbox receives an actual test; pending notification recovery is rehearsed.
- [ ] Privacy/retention has been reviewed and the actual manufacturer warranty/installer coverage claims remain factual.
- [ ] Mobile browser manual tests and Cloudflare preview complete.
- [ ] User explicitly approves production deployment. Until then, this is **code prepared, not live lead capture**.

## Important independent operational blockers

Actual UK coverage/partner agreements, manufacturer warranty PDF and terms, customer communication policy, legal entity identification, rate-limiting under live load, test acceptance and verified mailbox are all owner actions. These are **not** inferred from competitor intelligence.

## Pre-launch safety gate (new)

The static website's `build.mjs` now runs `checkLeadReleaseConfig(site.forms, process.env)`. The existing disabled settings are safe. If someone edits `site.json` to turn on `/api/leads` before approval, the build fails unless `forms.provider` is `Cloudflare D1`, a valid-format public Turnstile site key is present, and the Cloudflare build environment explicitly has `VELTRIX_LEADS_LAUNCH_APPROVED=yes`. This is **not permission to activate**; it is a fail-closed control. The backend still requires private bindings, owner privacy approval, and an end-to-end test. The guard's regression tests run under `npm run check`. See [`CODEX-LEADS-CLOUDFLARE-HANDOFF.md`](./CODEX-LEADS-CLOUDFLARE-HANDOFF.md) for the complete Codex task.
