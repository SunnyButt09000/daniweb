# Lead receipt staging: configuration and evidence

**27 October 2026 — PARTIAL; website production release not approved.** Tracks [Issue #7](https://github.com/SunnyButt09000/daniweb/issues/7) and the [technical handoff](CODEX-LEADS-CLOUDFLARE-HANDOFF.md). The owner authorised free isolated staging, then explicitly approved exactly five Email Routing DNS records and the exact business-address forwarding rule. Website deployment, website DNS/routes and live lead capture remain outside that approval.

## Native Chrome login fix and PR #10 synchronisation

The reported `Not found` login was reproduced with the correct privately stored key. The private operator page contains the complete matching 64-character value, and its copy handler passes the actual value rather than password-mask dots. A real clipboard write/read test confirmed the complete matching key without logging it; the previous clipboard was restored. A hidden copy fallback was added to the private helper and tested under simulated Clipboard API denial. No key rotation was necessary.

The cause was the staging wrapper's `Referrer-Policy: no-referrer` on the login document. Chrome's native form navigation sent `Origin: null`, even though the destination was the same staging origin and the body contained the correct key. The server correctly rejected that POST with 404. This [referrer-policy effect on form Origin](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Referrer-Policy#effect_on_the_origin_header) differs from default CORS-mode fetch, explaining why the earlier direct request test succeeded while the owner's form failed.

Only **GET `/staging-access`** now uses `Referrer-Policy: same-origin`. Other private responses retain `no-referrer`. The exact-origin guard, secret comparison, body limit, session-cookie protections and Turnstile validation are unchanged. The fix was deployed only to the isolated staging Worker.

| Deployed Chrome test | Result |
| --- | --- |
| Explicit-origin direct POST, redirects disabled | 303; private key matches deployed secret; no redirect followed |
| Native form before fix | Correct key, 68-byte encoded body; `Origin: null`; 404; no cookie |
| Native form after fix | Exact configured staging Origin; 303; authenticated `/contact/` 200 |
| Full private helper link flow | Local instruction file → noreferrer popup → native login → `/contact/`: 303 then 200; no forced Origin header |
| Session cookie | Secure, HttpOnly, SameSite=Strict; correct private value; no value published |
| Secret/copy | Complete matching key verified; not rotated; normal copy and hidden fallback tested |

The feature branch incorporates production **`e4a7872` after PR #10**. The package-script conflict was resolved by retaining the staging suite and exactly one invocation of the shared asset-syntax test. `assistant.js` and `scripts/assets-syntax.test.mjs` match production, so the chatbot fix is no longer a separate PR #9 change. The current suite passes **53/53**, with 50 generated pages / 49 indexable URLs. Three new regression tests cover the login document policy and continued rejection of null/missing/foreign origins, incorrect keys and oversized forms. The policy regression failed before the fix and passed afterward.

The updated private instructions were opened in ordinary Chrome for the owner. Successful login is verified with Chrome's real native form flow; a real human Turnstile-to-receipt submission remains a separate pending check.

## Email follow-up: owner-selected destination

The owner subsequently supplied the notification/forwarding destination privately and authorised requesting Cloudflare verification. The destination was created successfully through the authenticated Email Routing API (HTTP 200), which requested the verification message. A subsequent authenticated API check confirmed its `verified` timestamp: **destination verification is complete**. The address, destination identifier and populated forwarding/binding configuration are deliberately absent from GitHub.

The exact-match `info@veltrixwindowsdoor.co.uk` forwarding rule was initially created disabled. After the owner's specific DNS/forwarding approval, it was enabled and read back successfully. Every other email rule was compared and remained unchanged; the existing disabled catch-all/drop rule is preserved. No catch-all forwarding was added.

Cloudflare's current five required records matched the approved plan exactly: three apex MX records for its route1/route2/route3 mail servers (priorities 94/99/21), one apex SPF TXT and one DKIM TXT at `cf2024-1._domainkey`. Immediately before the write, public DNS preflight found no existing apex MX, SPF or DKIM at that selector, so no existing mail service or SPF needed replacement. Cloudflare's documented Email Routing enable operation succeeded. Public resolver read-back then showed all three MX records, **exactly one SPF** and the DKIM record. Email Routing reports `ready`. Only these approved email DNS additions were performed; no website DNS operation was made.

The generic DNS-record-list endpoint returned HTTP 403 / code 10000, while the existing OAuth session was permitted to inspect and enable Email Routing through its documented email-specific API. That permitted operation succeeded without changing credentials or seeking another access path. Its documented permission is **Zone Settings Write**; generic DNS API access was not obtained. Existing website Worker settings, domains and routes were compared before/after and remained unchanged.

A single synthetic forwarding email, subject `Veltrix synthetic forwarding test 20261027-VT7-A`, was sent from the connected Gmail account to the business address. The connected account differs from the private forwarding destination. A subject-filtered Cloudflare activity query returned `action=forward`, `status=delivered`, no error, at **17:46:54 UTC**. This proves destination-server acceptance; **Inbox/Spam placement still awaits the destination owner's confirmation**. [Cloudflare distinguishes delivery status from inbox placement](https://developers.cloudflare.com/email-service/reference/troubleshooting/).

Worker notification sending was tested separately. A private `NOTIFY_OPS` binding restricted to the verified destination, plus the eligible business-domain sender, was deployed only to `veltrix-leads-staging`. Binding restriction and domain readiness were read back. Invoking its real retry handler moved the current synthetic SQL fixture from `pending` to `accepted`, with the notification lease released. A subject-filtered Email Routing activity query then showed the matching `newEmail` event as `delivered`, no error, at **17:50:23 UTC**; one distinct delivered notification was observed after subsequent retries. This is real recovery and destination-server acceptance, not a mocked send or proof of Inbox placement. **No additional Email Sending domain onboarding, `cf-bounce`/DMARC DNS records, paid plan or paid service was configured.** Any future need for those changes requires separate approval. A real challenge-to-D1 API receipt remains unverified.

## What exists

| Component | Observed/configured state |
| --- | --- |
| Production | Existing static-assets Worker `daniweb`, custom domains for the root and `www` website; no separate Worker routes or D1 bindings at discovery. |
| Staging Worker | Separate `veltrix-leads-staging`, deployed successfully on Workers Free with its own `workers.dev` hostname, assets and API entry point. No production route. |
| Test database | New D1 `veltrix-leads-staging`, EU jurisdiction, both migrations applied remotely. Correct binding verified through Cloudflare's authenticated API. No pre-existing D1 database was found. |
| Spam protection | New managed Turnstile staging widget restricted to the exact staging hostname; secret stored as an encrypted Worker secret. No pre-existing widget was found. A real successful challenge remains unverified. |
| Private access | Random staging access secret, encrypted in the Worker. Same-origin login sets a Secure, HttpOnly, SameSite=Strict, one-hour cookie. Unauthenticated assets/API return 404. |
| Retry schedule | `0 4 * * *` (04:00 UTC daily) configured and read back. The same handler was invoked manually in staging; an overnight scheduled execution has not been observed. |
| Email | **Destination verified; Email Routing ready; exact forwarding enabled; restricted staging binding deployed.** Approved five-record email DNS setup applied. Incoming test has provider `delivered` evidence; real synthetic D1 retry has notification `accepted` evidence. Actual Inbox/Spam placement awaits owner confirmation. |
| Website activation | `forms.endpoint` and `forms.turnstileSiteKey` remain empty. The release acknowledgement variable was not set. Production build configuration, site data and last-modified data were not edited. |

Staging: <https://veltrix-leads-staging.pakizrulz9.workers.dev/staging-access>. Access requires the privately stored operator key; it is deliberately absent from this repository, URLs and reports. Protected pages carry `noindex, nofollow, noarchive` and `no-store`. The login screen contains no lead records. There is no public database-read endpoint.

Account IDs, database IDs, widget credentials, populated configuration and operational logs are outside the repository in a private operator directory. The example files contain placeholders only. Do not upload that directory or paste its contents into GitHub. Rotate the staging access key before wider review and use an approved secret store for continued operation.

## Baseline and production isolation

The repository was found outside `system32`, with a clean working tree. The feature branch is `codex/veltrix-leads-cloudflare-staging`. GitHub was fetched and authenticated Wrangler OAuth login completed using the normal interactive flow; `wrangler whoami` confirmed access privately.

The initial production baseline was `e67995b8efcaf18da16126377d5b4d7e2bb2fbd4`: 48 generated pages, 47 indexable URLs and 38 passing tests. Another actor merged PR #8, adding two guides and one regression test, and later PR #10, publishing the shared chatbot syntax fix/test. The feature branch is synchronised with production `e4a7872`: 40 baseline tests. The current result is **50 generated pages / 49 indexable URLs / 53 passing tests**, including this PR's thirteen additional tests. No pages were added by this staging change.

Authenticated before/after inspection confirmed unchanged production Worker settings/bindings, custom-domain associations and route list. Production deployments changed externally with PRs #8 and #10; this report does not claim the production artifact stayed unchanged throughout the campaign. This task deployed only the separate staging Worker. Its production-domain changes were limited to the previously approved email DNS records and exact Email Routing rule. The login fix made no DNS, route, production website deployment or live capture change.

Cloudflare documents [Routes and Custom Domains together](https://developers.cloudflare.com/workers/configuration/routing/routes/): a specific route may precede an existing custom-domain origin. A future API route would require a separately approved release. Staging instead uses its own Worker `main` plus `ASSETS.fetch`, avoiding any production routing change.

## Code changes

- Reject wrong field types, overlong strings, malformed UUIDs, punctuation-only phone values and unsafe source paths instead of truncating values into apparent validity.
- Read at most 15,000 UTF-8 **bytes**, including streamed bodies without a trustworthy Content-Length. Reject invalid UTF-8/JSON and cancel oversized streams.
- Add migration `0002_notification_leases.sql`. An atomic conditional D1 update grants a five-minute notification lease shared by initial sends and cron retries. Failed attempts release their own lease; crashed attempts become eligible after expiry. Cron remains limited to 20 records per invocation.
- Keep an unchanged form's request key after acknowledgement as well as timeout; editing the submitted details rotates it. Add an explicit busy guard to the quote form, including PDF handoff.
- Add a staging-only wrapper: exact `workers.dev` origin, private access, synthetic contact patterns, no indexing/cache, no production-host operation, and private retry control.
- Keep missing staging email visibly pending through an adapter that throws. It does not simulate email acceptance. The normal backend still fails closed without its required bindings.
- Supply an isolated staging template; remove the active production route from the general example. Neither example is a populated deployment configuration.
- Retain the shared chatbot syntax fix and built-JavaScript test now published independently through PR #10. Their files match the latest production branch; the shared test runs once.
- Fix the staging login document's referrer policy so native form POSTs preserve their real Origin. Do not accept null origins or change the key guard. Add regression coverage and verify the deployed native Chrome login/cookie/contact flow.

Receipt uniqueness is enforced by D1's unique request key and comparison with persisted contents. Concurrent notification attempts are claimed atomically. **Exactly-once inbox delivery is not guaranteed**: if the email service accepts a message and the subsequent D1 state write fails, a later retry can send again. The documented email API does not supply a provider idempotency key here. Reconcile pending records before manual re-sends. A returned `messageId` means service acceptance, not proof of inbox delivery.

## Verification performed

Machine-readable summary: [leads-staging-results.json](leads-staging-results.json). It intentionally contains no records, receipt IDs, secret values or Cloudflare resource IDs.

| Test layer | Result and limit |
| --- | --- |
| `npm run check` | **53/53 pass**, 50 generated / 49 indexable; link and SEO checks clean. Covers origin/hostname/action checks, consent, token replay simulation, persistence failure, idempotency/conflicts, notification failure/retry, retention, bounds, leases, staging/login gates and published JavaScript syntax. |
| Actual SQLite | Both migrations exercised against SQLite, including concurrent cron/POST claims and expired-lease recovery. Turnstile and email are mocked in these tests. |
| Wrangler configuration | Both committed examples bundle successfully with `wrangler deploy --dry-run --config …`. Private staging deployment succeeded. No production example was deployed. |
| Real deployed negative requests | **10/10**: invalid real challenge 403, missing consent 422, malformed UUID 422, UUID suffix 422, wrong optional field type 422, non-synthetic payload 422, malformed JSON 400, UTF-8 byte overflow 413, wrong content type 415, authenticated manual retry 200. |
| Real remote D1 / retry / retention | Two synthetic fixtures inserted directly using authenticated D1 SQL. Earlier unavailable-mail retry left one pending row with released lease and deleted the expired fixture. After real email binding setup, another retry changed the current fixture to `accepted`; subsequent retry did not create another lead. This is **not** evidence of a successful challenge/form/API receipt or inbox placement. |
| Browser UI | Playwright/Chrome exercised real deployed form JavaScript at mobile width: contact, booking and quote error preservation, busy handling, unchanged retry/repeat UUID, edited UUID, timeout, source/consent fields, address minimisation and PDF disclosure. API responses and successful challenge tokens were explicitly mocked for these UI tests. Seven scenario groups passed. |
| Manual fallback | WhatsApp opens intercepted without sending; existing destination preserved. Email links inspected, PDF actually generated with PDF header. No API POST from manual fallback. No external enquiry or booking sent. |
| Chatbot real browser | On refreshed staging assets, desktop chat opens and renders the 10-year manufacturer's-guarantee answer; mobile action-bar chat opens with no horizontal overflow. Zero page errors. No external message sent. Seven mocked form/UI scenario groups were also rerun successfully after this fix. |
| Real managed Turnstile | **Incomplete.** The actual checkbox was clicked in visible automated Chrome after rendering; Turnstile returned **600010**. The API/iframe load and hostname restriction are correct. No valid token obtained; no dummy proof or weakened checks. Ordinary-browser owner instructions were prepared privately. |
| Real receipt / duplicate API receipt | **Incomplete.** Local SQLite and mock UI tests pass, but a real successful challenge-to-Worker-to-D1 201 receipt and repeat request have not been verified. |
| Incoming forwarding delivery | **Provider delivery confirmed.** Real test sent through Gmail to the business address; matching Cloudflare event says `forward` / `delivered` with no error. Destination Inbox/Spam placement still unconfirmed. |
| Staging notification acceptance | **PASS for real retry of the SQL fixture.** Real restricted binding send returned acceptance and D1 changed from pending to accepted, with a released lease. The matching provider event reports `newEmail` / `delivered`; one distinct delivered notification was observed after subsequent retries. No separate sending-domain DNS added. Actual Inbox/Spam arrival remains unconfirmed. |

Screenshots retained privately show the native real widget and synthetic test inputs, plus the repaired chatbot. Turnstile's API and iframe load; no top-level CSP violation was observed; the native human checkbox is visible. An ordinary UI click in automated Chrome produced error **600010**, which Cloudflare documents under [generic challenge failures associated with detected bot behaviour](https://developers.cloudflare.com/turnstile/troubleshooting/client-side-errors/error-codes/). The owner was given private instructions for a genuinely ordinary browser; the access key is masked there and never placed in a URL or public artifact. The first-party syntax error was traced to and removed from the chatbot; this does not substitute for successful real challenge completion. No automation-evasion settings, dummy proof or weakened hostname/action checks were used.

## Free services and limits

No paid plan, subscription, upgrade, purchase or metered third-party service was used. This staging path uses [Workers Free](https://developers.cloudflare.com/workers/platform/pricing/), [D1 Free](https://developers.cloudflare.com/d1/platform/pricing/) and [Turnstile Free](https://developers.cloudflare.com/turnstile/plans/). Free quotas still apply; these resources are for small controlled synthetic tests. This is not an account-wide billing audit.

An optional custom CPU-limit setting was rejected with Cloudflare error **100328**, “CPU limits are not supported for the Free plan.” It was removed; the subsequent deployment used the fixed Workers Free limit. No upgrade was made. The D1 database was created with EU jurisdiction; Wrangler's binding schema does not accept `jurisdiction`, so that unsupported binding property was removed while the actual database jurisdiction was verified through the API.

[Cloudflare Email Service pricing](https://developers.cloudflare.com/email-service/platform/pricing/) permits free sending to verified destinations, including an account configured only for Email Routing. [Restricted send bindings](https://developers.cloudflare.com/email-service/configuration/send-bindings/) require an eligible sender domain. This staging binding successfully sent from the domain after the approved Email Routing setup; no separate Email Sending onboarding was performed. Further [domain onboarding](https://developers.cloudflare.com/email-service/configuration/domains/), extra DNS records or paid sending remain outside approval. No purchase is required by the verified staging notification path.

## Remaining owner actions and review gates

1. Confirm Inbox/Spam arrival of the named incoming forwarding test and the synthetic Worker notification in the privately selected destination. DNS approval has already been given and applied; do not ask for it again. Additional sending-domain DNS or paid services still require separate approval.
2. Complete a real Turnstile challenge through the private staging page in a supported browser. Then submit a synthetic lead and confirm a 201 receipt against authenticated D1. Obtain a fresh challenge and repeat the unchanged UUID; confirm the same receipt and one database record. Replayed tokens must fail. Check hostname and `action=lead` remain enforced.
3. Keep the deployed `NOTIFY_OPS` destination restriction and privately populated `OPS_EMAIL` / `FROM_EMAIL`. Real recovery from unavailable mail to accepted notification is verified; finish Inbox/Spam confirmation and real API-receipt duplicate testing before sign-off. Do not confuse an accepted SQL-fixture notification with a successful form receipt.
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
8. Retain only sanitised aggregate results. A current synthetic fixture with notification accepted is intentionally left for inspection; the old fixture was deleted by retention testing. Remove test fixtures securely when review is complete.

For production, migration 0002 must precede any eventual deployment of the updated handler. A clean-site merge alone does not activate it: production activation needs its own reviewed configuration, confirmed email delivery, privacy approval, migrations and release acknowledgement.

## Rollback / teardown

No website rollback is needed for this task. To halt staging, remove its cron and disable/delete **only** the dedicated staging Worker, then retire its widget and database after confirming that they contain synthetic data only. Do not remove similarly named production resources or alter website domains/routes. Retiring the staging key prevents subsequent operator access.

The business email setup is a separate, owner-approved change. An email rollback should first disable only the exact forwarding rule and then, with owner approval, retire only the five added Email Routing DNS records through the documented email operation. Preserve other TXT records, website records and Worker routes. Do not silently undo working business forwarding as part of staging teardown.

For any future approved production release, first disable the site endpoint in an owner-approved release; remove only that release's dedicated API route or restore its prior static Worker architecture; preserve any real records securely under the approved retention/deletion policy. D1 migration 0002 is additive: rolling the handler back does not require deleting records or dropping lease columns. Never use the synthetic-only staging wrapper as a production rollback artifact.
