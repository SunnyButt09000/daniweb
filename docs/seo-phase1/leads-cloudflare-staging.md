# Lead receipt staging: configuration and evidence

**27 October 2026 — PARTIAL; not approved for production.** Tracks [Issue #7](https://github.com/SunnyButt09000/daniweb/issues/7) and the [technical handoff](CODEX-LEADS-CLOUDFLARE-HANDOFF.md). The owner's latest instruction authorises free, isolated staging resources. It does not authorise production changes or DNS changes.

## Email follow-up: owner-selected destination

The owner subsequently supplied the notification/forwarding destination privately and authorised requesting Cloudflare verification. The destination was created successfully through the authenticated Email Routing API (HTTP 200), which requested the verification message. A subsequent authenticated API check confirmed its `verified` timestamp: **destination verification is complete**. The address, destination identifier and populated forwarding/binding configuration are deliberately absent from GitHub.

The exact-match `info@veltrixwindowsdoor.co.uk` forwarding rule was created **disabled** and read back successfully after verifying the destination. Every existing email rule was compared and remained unchanged; Email Routing remains disabled. A staging-only, destination-restricted `NOTIFY_OPS` configuration is prepared privately and has not been deployed. No catch-all forwarding is proposed. The existing disabled catch-all/drop rule is preserved.

Cloudflare's read-only Email Routing DNS endpoint returned five required records: three apex MX records for its route1/route2/route3 mail servers, apex SPF TXT and DKIM TXT at `cf2024-1._domainkey`. Public DNS preflight found no existing apex MX or SPF. A concrete private approval plan contains Cloudflare's exact record values and rollback. **Explicit owner approval is pending before these production email DNS additions.** Website records, Worker domains/routes and production lead collection remain unchanged.

The existing OAuth session can inspect Email Routing settings, but the generic DNS-record-list endpoint returned HTTP 403 / code 10000. This does not mean that DNS was modified or that generic DNS write access exists. No extra credentials were requested. Any approved onboarding must use the authorised email-specific operation and stop if it requires unrelated records, deletion of existing settings, an additional sending-domain DNS set or a paid upgrade.

After approved sender-domain readiness, the prepared private staging configuration can be deployed and real notification tests resumed. At present neither actual inbox delivery nor a real challenge-to-D1 receipt is newly claimed. The initial test evidence below remains explicitly separated from these pending checks.

## What exists

| Component | Observed/configured state |
| --- | --- |
| Production | Existing static-assets Worker `daniweb`, custom domains for the root and `www` website; no separate Worker routes or D1 bindings at discovery. |
| Staging Worker | Separate `veltrix-leads-staging`, deployed successfully on Workers Free with its own `workers.dev` hostname, assets and API entry point. No production route. |
| Test database | New D1 `veltrix-leads-staging`, EU jurisdiction, both migrations applied remotely. Correct binding verified through Cloudflare's authenticated API. No pre-existing D1 database was found. |
| Spam protection | New managed Turnstile staging widget restricted to the exact staging hostname; secret stored as an encrypted Worker secret. No pre-existing widget was found. A real successful challenge remains unverified. |
| Private access | Random staging access secret, encrypted in the Worker. Same-origin login sets a Secure, HttpOnly, SameSite=Strict, one-hour cookie. Unauthenticated assets/API return 404. |
| Retry schedule | `0 4 * * *` (04:00 UTC daily) configured and read back. The same handler was invoked manually in staging; an overnight scheduled execution has not been observed. |
| Email | **Destination verified; forwarding disabled; Worker binding unconfigured.** Initial discovery found no destinations. The authorised follow-up created and verified the owner's private destination and prepared a disabled exact-match rule. No eligible sender has been established; Email Routing/DNS activation awaits approval. No synthetic notification has been sent. |
| Website activation | `forms.endpoint` and `forms.turnstileSiteKey` remain empty. The release acknowledgement variable was not set. Production build configuration, site data and last-modified data were not edited. |

Staging: <https://veltrix-leads-staging.pakizrulz9.workers.dev/staging-access>. Access requires the privately stored operator key; it is deliberately absent from this repository, URLs and reports. Protected pages carry `noindex, nofollow, noarchive` and `no-store`. The login screen contains no lead records. There is no public database-read endpoint.

Account IDs, database IDs, widget credentials, populated configuration and operational logs are outside the repository in a private operator directory. The example files contain placeholders only. Do not upload that directory or paste its contents into GitHub. Rotate the staging access key before wider review and use an approved secret store for continued operation.

## Baseline and production isolation

The repository was found outside `system32`, with a clean working tree. The feature branch is `codex/veltrix-leads-cloudflare-staging`. GitHub was fetched and authenticated Wrangler OAuth login completed using the normal interactive flow; `wrangler whoami` confirmed access privately.

The initial production baseline was `e67995b8efcaf18da16126377d5b4d7e2bb2fbd4`: 48 generated pages, 47 indexable URLs and 38 passing tests. Another actor merged PR #8 while staging work was underway. The feature branch was advanced without conflicts to `8f1649c1da8940a94363559b6e3083868af4c9e4`, which adds two guides and one regression test. The current result is **50 generated pages / 49 indexable URLs / 49 passing tests**, including this PR's ten new tests. No pages were added by this staging change.

Authenticated before/after inspection confirmed unchanged production Worker settings/bindings, custom-domain associations and route list. The production Worker deployment timestamp changed externally with PR #8; this report does not claim the production artifact stayed unchanged throughout the session. This task deployed only the separate staging Worker. It made no production deployment, DNS, account, routing or credential changes beyond the authorised staging resources and normal CLI login.

Cloudflare documents [Routes and Custom Domains together](https://developers.cloudflare.com/workers/configuration/routing/routes/): a specific route may precede an existing custom-domain origin. A future API route would require a separately approved release. Staging instead uses its own Worker `main` plus `ASSETS.fetch`, avoiding any production routing change.

## Code changes

- Reject wrong field types, overlong strings, malformed UUIDs, punctuation-only phone values and unsafe source paths instead of truncating values into apparent validity.
- Read at most 15,000 UTF-8 **bytes**, including streamed bodies without a trustworthy Content-Length. Reject invalid UTF-8/JSON and cancel oversized streams.
- Add migration `0002_notification_leases.sql`. An atomic conditional D1 update grants a five-minute notification lease shared by initial sends and cron retries. Failed attempts release their own lease; crashed attempts become eligible after expiry. Cron remains limited to 20 records per invocation.
- Keep an unchanged form's request key after acknowledgement as well as timeout; editing the submitted details rotates it. Add an explicit busy guard to the quote form, including PDF handoff.
- Add a staging-only wrapper: exact `workers.dev` origin, private access, synthetic contact patterns, no indexing/cache, no production-host operation, and private retry control.
- Keep missing staging email visibly pending through an adapter that throws. It does not simulate email acceptance. The normal backend still fails closed without its required bindings.
- Supply an isolated staging template; remove the active production route from the general example. Neither example is a populated deployment configuration.

Receipt uniqueness is enforced by D1's unique request key and comparison with persisted contents. Concurrent notification attempts are claimed atomically. **Exactly-once inbox delivery is not guaranteed**: if the email service accepts a message and the subsequent D1 state write fails, a later retry can send again. The documented email API does not supply a provider idempotency key here. Reconcile pending records before manual re-sends. A returned `messageId` means service acceptance, not proof of inbox delivery.

## Verification performed

Machine-readable summary: [leads-staging-results.json](leads-staging-results.json). It intentionally contains no records, receipt IDs, secret values or Cloudflare resource IDs.

| Test layer | Result and limit |
| --- | --- |
| `npm run check` | **49/49 pass**, 50 generated / 49 indexable; link and SEO checks clean. Covers origin/hostname/action checks, consent, token replay simulation, persistence failure, idempotency/conflicts, notification failure/retry, retention, bounds, leases and staging gates. |
| Actual SQLite | Both migrations exercised against SQLite, including concurrent cron/POST claims and expired-lease recovery. Turnstile and email are mocked in these tests. |
| Wrangler configuration | Both committed examples bundle successfully with `wrangler deploy --dry-run --config …`. Private staging deployment succeeded. No production example was deployed. |
| Real deployed negative requests | **10/10**: invalid real challenge 403, missing consent 422, malformed UUID 422, UUID suffix 422, wrong optional field type 422, non-synthetic payload 422, malformed JSON 400, UTF-8 byte overflow 413, wrong content type 415, authenticated manual retry 200. |
| Real remote D1 / retry / retention | Two synthetic fixtures inserted directly using authenticated D1 SQL. Retry handler invoked on the deployed Worker. Query confirmed one current pending record with its lease released after unavailable email, and deletion of the expired fixture. This is **not** evidence of a successful form/API submission or delivered notification. |
| Browser UI | Playwright/Chrome exercised real deployed form JavaScript at mobile width: contact, booking and quote error preservation, busy handling, unchanged retry/repeat UUID, edited UUID, timeout, source/consent fields, address minimisation and PDF disclosure. API responses and successful challenge tokens were explicitly mocked for these UI tests. Seven scenario groups passed. |
| Manual fallback | WhatsApp opens intercepted without sending; existing destination preserved. Email links inspected, PDF actually generated with PDF header. No API POST from manual fallback. No external enquiry or booking sent. |
| Real managed Turnstile | **Incomplete.** Neither headless nor the owner-facing visible Chrome session obtained a valid token. No dummy token was accepted as real proof and checks were not weakened. |
| Real receipt / duplicate API receipt | **Incomplete.** Local SQLite and mock UI tests pass, but a real successful challenge-to-Worker-to-D1 201 receipt and repeat request have not been verified. |
| Notification acceptance/inbox delivery | **Incomplete.** No eligible sender/verified inbox binding; no acceptance or inbox delivery claimed. Successful recovery after restoring a real email service is also unverified. |

The screenshot captured during the real-widget attempt shows only synthetic inputs and an uncompleted submission; it is retained privately, not presented as success evidence. Browser console warnings from the challenge are diagnostic observations, not an established root cause.

## Free services and limits

No paid plan, subscription, upgrade, purchase or metered third-party service was used. This staging path uses [Workers Free](https://developers.cloudflare.com/workers/platform/pricing/), [D1 Free](https://developers.cloudflare.com/d1/platform/pricing/) and [Turnstile Free](https://developers.cloudflare.com/turnstile/plans/). Free quotas still apply; these resources are for small controlled synthetic tests. This is not an account-wide billing audit.

An optional custom CPU-limit setting was rejected with Cloudflare error **100328**, “CPU limits are not supported for the Free plan.” It was removed; the subsequent deployment used the fixed Workers Free limit. No upgrade was made. The D1 database was created with EU jurisdiction; Wrangler's binding schema does not accept `jurisdiction`, so that unsupported binding property was removed while the actual database jurisdiction was verified through the API.

[Cloudflare Email Service pricing](https://developers.cloudflare.com/email-service/platform/pricing/) permits free sending to verified destinations. [Restricted send bindings](https://developers.cloudflare.com/email-service/configuration/send-bindings/) still require an eligible sender domain. [Domain onboarding](https://developers.cloudflare.com/email-service/configuration/domains/) can require DNS records. Existing sender eligibility has not been established, and the owner's prohibition on DNS changes remains in force. There is no reason to buy a paid email service to work around this approval gap.

## Remaining owner actions and review gates

1. Approve or decline the prepared five-record Email Routing DNS plan. The selected destination is now verified, but recipient verification alone does not establish sender eligibility. If additional sender-domain/DNS setup is needed beyond that plan, obtain separate approval; no DNS changes have been made. Do not send credentials in chat or GitHub.
2. Complete a real Turnstile challenge through the private staging page in a supported browser. Then submit a synthetic lead and confirm a 201 receipt against authenticated D1. Obtain a fresh challenge and repeat the unchanged UUID; confirm the same receipt and one database record. Replayed tokens must fail. Check hostname and `action=lead` remain enforced.
3. After sender and recipient eligibility are confirmed, add a private restricted `send_email` binding named `NOTIFY_OPS` with one verified `destination_address`, and private `OPS_EMAIL` / `FROM_EMAIL`. Deploy **only staging**. Confirm accepted status, inspect the actual inbox/spam, force a controlled failure, restore service, invoke retry and confirm recovery without duplicate leads.
4. Review the privacy wording, lawful basis, access owners, deletion process and the existing **planned 730-day retention** before any real customer collection. This PR preserves that planned policy rather than silently replacing it. EU D1 jurisdiction is not a claim that every Cloudflare processing operation occurs only in the EU.
5. Complete security/business review and a separate production release approval. Do not set the launch flag, endpoint, production route or production bindings based on this partial report.

Only reserved synthetic contact values were used. The wrapper restricts names to `Synthetic …`, phone numbers to the reserved `07700900xxx` pattern, email to `synthetic…@example.test`, postcode to the synthetic test pattern, and requires `[STAGING SYNTHETIC]` in the summary. These guards cannot detect every possible personal detail in free text: operator access and synthetic-only discipline remain required. Booking street addresses are stripped from the API payload. No IP address, attachment or payment data is stored by application code; provider operational processing remains subject to Cloudflare's policies. Application payload logging/observability is disabled in staging.

## Operator runbook (staging only)

Use the existing authenticated Wrangler login. Never replace root `wrangler.jsonc` or enable the site's build release flag. Keep populated configuration and secrets outside Git. Both examples are **offline templates**, not commands to provision duplicates.

1. Run `npm run check`; inspect the branch/base and endpoint defaults.
2. Reuse the resources named above. Make a private copy of `wrangler.leads.staging.example.jsonc`; populate the existing account/database/widget information privately. When the copy is outside the repository, resolve `main`, assets and migration paths to the repository's absolute paths.
3. Confirm `name=veltrix-leads-staging`, `routes=[]`, `STAGING_ONLY=true`, exact staging `SITE_ORIGIN` and the correct D1 binding. Never use this wrapper for the production hostname.
4. Store `STAGING_ACCESS_KEY` and `TURNSTILE_SECRET` with Wrangler secrets. Do not put either in `vars`, URLs, command-line arguments, screenshots or source control. Restrict local secret-file access and remove temporary copies after secure handover.
5. Apply migrations **0001 and 0002** against the staging database with the private config. Validate with `wrangler deploy --dry-run --config <private-config>`, then deploy only that config if an authorised staging update is needed.
6. Open `/staging-access`, enter the private access key, and use synthetic values only. Do not add global Authorization headers to a browser context: that could send the access key to third-party challenge requests. The same-origin session cookie is the browser access mechanism.
7. For a retry, make an authenticated, same-origin POST to `/_staging/retry`. A 200 confirms handler invocation, **not** email success. Inspect D1 state using authenticated tooling and verify the actual destination inbox. No records are exposed through this endpoint.
8. Retain only sanitised aggregate results. A current synthetic pending fixture is intentionally left for inspection; the old fixture was deleted by retention testing. Remove test fixtures securely when review is complete.

For production, migration 0002 must precede any eventual deployment of the updated handler. A clean-site merge alone does not activate it: production activation needs its own reviewed configuration, confirmed email delivery, privacy approval, migrations and release acknowledgement.

## Rollback / teardown

No production rollback is needed for this task. To halt staging, remove its cron and disable/delete **only** the dedicated staging Worker, then retire its widget and database after confirming that they contain synthetic data only. Do not remove similarly named production resources or alter website domains/routes. Retiring the staging key prevents subsequent operator access.

For any future approved production release, first disable the site endpoint in an owner-approved release; remove only that release's dedicated API route or restore its prior static Worker architecture; preserve any real records securely under the approved retention/deletion policy. D1 migration 0002 is additive: rolling the handler back does not require deleting records or dropping lease columns. Never use the synthetic-only staging wrapper as a production rollback artifact.
