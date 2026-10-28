# HTTPS apex redirect — prepared only, owner approval required

28 October 2026. No rule, DNS, SSL, routing or production setting was changed.

## Current evidence and access limit

Certificate-validating public requests to `http://veltrixwindowsdoor.co.uk/contact/?source=seo-audit` and the HTTP www equivalent returned **200 with no Location header**. A deliberately missing HTTPS apex path returned **404**. Some HTTPS curl requests encountered transient connection resets; they are not evidence of an outage. See the accompanying technical audit for successful HTTPS rechecks.

The existing Cloudflare CLI authorisation was tested using a GET-only zone lookup. It returned **403 / 9109 Invalid access token**. Browser control also failed to initialise. Therefore existing Redirect Rules, Page Rules, Bulk Redirects, Always Use HTTPS, SSL mode and active Worker custom-domain/routes **have not been inspected in this session**. Do not assume they are empty or change them to match this proposal.

The repository uses Workers static assets (`wrangler.jsonc`), auto trailing slashes, and custom error handling. No hostname redirect exists in the repository. Canonical HTML already points at the HTTPS apex. An assets `_redirects` file is not the mechanism for domain-level redirects ([Workers documentation](https://developers.cloudflare.com/workers/static-assets/redirects/)).

## Exact proposed rule

Zone: `veltrixwindowsdoor.co.uk` → Rules → Redirect Rules → Single Redirect.

Name: **Veltrix canonical HTTPS apex**. Custom filter expression:

```text
(http.host in {"veltrixwindowsdoor.co.uk" "www.veltrixwindowsdoor.co.uk"}
 and (http.request.scheme eq "http" or http.host eq "www.veltrixwindowsdoor.co.uk"))
```

Action: Dynamic redirect. Target expression:

```text
concat("https://veltrixwindowsdoor.co.uk", http.request.uri.path)
```

Status **301**. **Preserve query string: Enabled**. The target expression must not append the query itself, otherwise it can be duplicated. The HTTPS apex does not match, so the proposed rule alone cannot loop. Exact host matching excludes workers.dev, preview/staging hosts, mail, and other subdomains. It does not redirect every path to the homepage. Existing Cloudflare URL normalization still applies; this proposal does not change it. Test encoded paths and queries before approval to ensure the required behaviour under the actual zone settings.

Reviewable API rule object (reference only; do not replace an existing ruleset with it):

```json
{
  "description": "Veltrix canonical HTTPS apex",
  "expression": "(http.host in {\"veltrixwindowsdoor.co.uk\" \"www.veltrixwindowsdoor.co.uk\"} and (http.request.scheme eq \"http\" or http.host eq \"www.veltrixwindowsdoor.co.uk\"))",
  "action": "redirect",
  "action_parameters": {
    "from_value": {
      "target_url": {
        "expression": "concat(\"https://veltrixwindowsdoor.co.uk\", http.request.uri.path)"
      },
      "status_code": 301,
      "preserve_query_string": true
    }
  },
  "enabled": false
}
```

`enabled: false` is intentional in this proposal. Creating even a disabled production account rule requires owner approval. Use the zone's `http_request_dynamic_redirect` phase. Preserve every unrelated rule; do not PUT a replacement ruleset. A Free plan supports 10 Single Redirect rules without regex; verify there is a free slot instead of buying an upgrade. Redirect Rules require the website hosts to be proxied through Cloudflare; if the actual setup differs, stop and revise the plan rather than changing DNS.

Sources checked 28 October: [availability and execution order](https://developers.cloudflare.com/rules/url-forwarding/), [dynamic redirect settings](https://developers.cloudflare.com/rules/url-forwarding/single-redirects/settings/), [hostname redirect example](https://developers.cloudflare.com/rules/url-forwarding/examples/redirect-all-different-hostname/). Account state and rule acceptance remain unverified.

## Approval and activation checklist

1. Re-establish authorised read-only access. Record current rules/order, normalization, SSL mode, Always Use HTTPS and Worker custom-domain/routes privately. Confirm both website hosts already work through Cloudflare with valid certificates. The existence of an HSTS header does not establish SSL mode.
2. Inspect overlapping Single/Bulk/Page Rules and application redirects. A prior redirect can add hops or an opposing www rule can create a loop. Review placement with Cloudflare Trace. Do not disable existing controls or alter SSL mode as an incidental fix.
3. Obtain explicit owner approval for this exact rule and its placement. No DNS/email records, Worker route, SSL mode, application code or lead-capture configuration changes are proposed.
4. After approval, add only this rule. Test with fresh curl requests, which do not inherit a browser's HSTS/301 cache. A browser's internal 307 HSTS upgrade is not proof of the requested server 301.
5. Test GET and HEAD on all four scheme/host combinations for every path below. Check the initial response **without** following redirects, then the final response with a small redirect limit.

| Test path | Expected initial result on HTTP apex / HTTP www / HTTPS www | Expected HTTPS apex result |
| --- | --- | --- |
| `/` | 301, Location `https://veltrixwindowsdoor.co.uk/` | 200; no canonical-host redirect |
| `/contact/?source=seo-audit&item=door%20handle&item=lock` | 301; same path, query order, repeated keys and encoded values | 200; query retained |
| `/guides/supply-only-vs-supply-and-fit-windows/` | 301 to the same HTTPS apex path | 200 |
| `/assets/fonts/archivo-var.woff2` | 301 to the same HTTPS apex path | 200 font response |
| `/__redirect-audit-missing-20261028/` | 301 to the same missing path | **404**, not a homepage or 200 fallback |
| `/encoded%20path/?a=%2F&b=%26&empty=` | 301; inspect normalization and exact query encoding | Real 404 for the missing path; no double encoding |

Also check `/contact` without a trailing slash: an additional existing asset-slash redirect may be expected, but no host loop is acceptable. A fragment is not sent to the server and cannot be validated from HTTP headers. Preview/Workers and unrelated hosts must not match this rule. The public enquiry API is disabled; this is not approval to activate it. A 301 can change POST into GET in clients, so any future API launch needs its own canonical-URL/method review.

Example read-only commands after approved activation:

```powershell
curl.exe --silent --show-error --max-time 30 --output NUL --dump-header - 'http://www.veltrixwindowsdoor.co.uk/contact/?source=seo-audit&item=door%20handle&item=lock'
curl.exe --silent --show-error --max-time 30 --location --max-redirs 3 --output NUL --write-out '%{http_code} %{url_effective} %{num_redirects}' 'http://www.veltrixwindowsdoor.co.uk/contact/?source=seo-audit&item=door%20handle&item=lock'
```

## Rollback

Record the new rule's identifier privately. If any test fails, disable **only that new rule**, confirm the previous responses return, and review the cause. Do not delete existing rules or restore an entire ruleset over concurrent edits. Do not change DNS/SSL/Worker routing. Permanent redirects can remain cached by clients after rollback; use uncached requests to verify the server and communicate that limitation before activation. The approved action must include permission to disable this same rule immediately if validation fails.
