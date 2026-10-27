# CODEX HANDOFF — Veltrix lead receipt infrastructure (not production approval)

**Created:** 27 October 2026 · **Target repository:** `SunnyButt09000/daniweb` · **Production branch:** `claude/upvc-windows-doors-site-jj8slj` · **Status:** Ready for implementation *planning and isolated staging only*.

## Your mission

Complete the technically complex **Cloudflare Worker + D1 + Turnstile + verified business-inbox email** setup and end-to-end verification for the previously built native quote/contact/booking lead receipt system. This is **not authorisation to change customer-facing production, collect real data, create a paid plan, or enable any service without an explicit owner go-ahead**.

The client website `https://veltrixwindowsdoor.co.uk` runs on Cloudflare Workers static assets. The optional receipt backend is currently disabled in `src/data/site.json`: `forms.endpoint: ""`, `forms.turnstileSiteKey: ""`. Preserve this default until authorised.

## Mandatory discovery (before commands that mutate Cloudflare)

1. Inspect `wrangler.jsonc`, `wrangler.leads.example.jsonc`, `src/server/leads.mjs`, `migrations/0001_leads.sql`, `src/assets/js/forms.js`, `lib/pages.mjs`, `lib/layout.mjs`, `build.mjs`, `src/data/site.json`, `scripts/leads.test.mjs`, `docs/seo-phase1/lead-capture-pilot.md`, and `lib/lead-config.mjs`.
2. Discover the **real** Cloudflare deployment type, Worker name, hostname association, route ordering and existing build/deploy automation, *without modifying anything*. Do not assume the old `DEPLOY.md` Pages instructions match production; `wrangler.jsonc` currently defines a static-assets Worker.
3. Check whether a dedicated `/api/leads` Worker route can coexist with the site Worker **and** custom domain. If there is routing ambiguity, stage/test an alternative Worker `main` + `env.ASSETS.fetch` architecture in an isolated branch, not production.
4. Inspect whether the Cloudflare user already has D1, a verified email destination and Turnstile. **Never create a duplicate resource or paid subscription** just to satisfy examples. Do not output account identifiers, credentials, tokens or customer records into GitHub, logs or ChatGPT.
5. Consult current first-party Cloudflare docs for `send_email`, D1 migrations, Turnstile CSP/hostname and Worker routes instead of guessing.

## Free-first email requirements

Cloudflare Email Service currently allows sending **to verified destination addresses free on Workers Free**, including accounts using only Email Routing. Arbitrary external-recipient emailing can require Workers Paid. For Veltrix we only need an internal notification to the owner's one verified mailbox; do **not** purchase a paid plan.

However, a `send_email` sender must be from an eligible **Cloudflare Email Service / routing domain**. Distinguish **sender/domain eligibility** from **recipient verification**; do not assume a random From address is valid.

Sources:
- https://developers.cloudflare.com/email-service/platform/pricing/
- https://developers.cloudflare.com/email-service/platform/limits/
- https://developers.cloudflare.com/email-service/configuration/send-bindings/
- https://developers.cloudflare.com/email-service/api/send-emails/workers-api/
- https://developers.cloudflare.com/email-service/configuration/email-routing-addresses/

On the verified destination path use the binding's `send()` API as documented, with restricted `destination_address`. A returned `messageId` only means **accepted by email service**, not actual inbox delivery. Reconcile D1 `notify_state='pending'`, review spam/inbox, and test the daily retry. Do not expose full customer enquiry records in any public route.

## Staged implementation

1. Create a **new feature branch**, e.g. `codex/veltrix-leads-cloudflare-staging`. Do not modify default/production or merge.
2. Audit and improve the existing `src/server/leads.mjs`: origin enforcement, Turnstile token+hostname+`action=lead`, payload length/type, no CORS to random sites, UUID idempotency, D1 acknowledgement only after persistence, no duplicate notifications on retry, cron bound to 20 pending records, 730-day planned retention subject to owner/privacy approval. If a more restrictive data policy is required, propose it rather than silently substituting one.
3. Validate or correct `wrangler.leads.example.jsonc` **offline**. Never commit populated `database_id`, `OPS_EMAIL`, `FROM_EMAIL`, private Turnstile secret, or any personal data. A domain sender may be public but do not assume its owner has verified it.
4. Run all existing checks plus security edge cases (malformed body, empty consent, wrong site origin, replayed Turnstile token, repeat UUID, DB failure, email failure, cron).
5. Obtain owner approval separately for **any Cloudflare create/configure action**, verified inbox setup, D1 storage, Turnstile widget registration, API route or Worker deployment. Report any pricing or terms before approval; use free-tier resources only where available.
6. After that explicit approval, do an isolated staging setup, using **only synthetic test data**. Test request and confirmation, fake/invalid challenges, duplicate retries, database row retrieval via authenticated D1, failed notification recovery and correct 2xx/4xx/5xx outputs. If staging hostname differs from live hostname, configure a separate staging `SITE_ORIGIN` and a hostname-specific Turnstile test configuration **without weakening production checks**.
7. Check browser and mobile UX on staged form: no double-submit, busy/timeout state, form preserves inputs, accessible Turnstile, WhatsApp/email manual-send fallback, and quote PDF is not incorrectly claimed as uploaded.
8. Ensure `npm run check` green, no unexpected `lastmod` drift, no regression to 48 pages/47 indexable URLs, no unverified nationwide installers or fabricated warranty coverage.
9. Provide PR with changed files, tests, safety notes, setup resources requested, and exact **owner approval gates**. **Do not merge/deploy production, don't enable `/api/leads` in site.json, and don't modify DNS on your own.**

## Safeguard already implemented on review branch

The build includes `lib/lead-config.mjs`, which prevents `forms.endpoint='/api/leads'` from being published unless both a plausible Turnstile site key/provider are configured **and** an explicit build environment variable `VELTRIX_LEADS_LAUNCH_APPROVED=yes` is set. In other words, editing `site.json` alone must fail the build. Treat the variable as an **owner-controlled release acknowledgement**, not proof of Cloudflare resource readiness or a substitute for privacy approval.

Do not set this variable or commit activation changes without a clear owner-approved go-live request.

## Acceptance evidence format

Provide a concise, factual report:
- **Discovery**: actual Cloudflare Worker route deployment architecture with evidence (no secret values).
- **Setup**: resources present vs missing; whether each requires action or permission; whether a free plan supports it.
- **Implementation**: commits, files, PR branch, code audit findings and fixes.
- **Test**: exact `npm run check` result, verified preview/staging URLs (only if actually deployed), mock vs real integration tests separated.
- **Privacy**: lawful basis/retention awaiting approval, consent and deletion procedures.
- **Release gate**: BLOCKED/PARTIAL/READY FOR OWNER RELEASE (never mark complete from mock tests alone).
- **Rollback**: plan restoring site.json endpoint to empty, removing route, preserving customer records securely, and restoring former static Worker.

**Never store a customer's real enquiry in a GitHub issue, code diff, logs, or a public test.**
