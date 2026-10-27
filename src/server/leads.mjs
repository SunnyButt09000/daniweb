// Veltrix opt-in lead receipt API. Dedicated Worker route: /api/leads
// Never deploy without D1 migration, verified email binding, Turnstile, privacy approval.
const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' },
});
const fail = (status, code) => json({ ok: false, code }, status);
const maxLen = (text, n) => typeof text === 'string' ? text.trim().slice(0, n) : '';
const POSTCODE = /^[A-Z]{1,2}[0-9][A-Z0-9]?\s*[0-9][A-Z]{2}$/i;
const PHONE = /^[+()\d\s.-]{10,30}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TYPES = new Set(['quote', 'booking', 'contact']);
const YR = 365 * 24 * 60 * 60 * 1000;

function validate(body) {
  if (!body || Array.isArray(body) || typeof body !== 'object') return null;
  if (body.consent !== true || !TYPES.has(body.kind)) return null;
  const name = maxLen(body.name, 100);
  const phone = maxLen(body.phone, 30);
  const email = maxLen(body.email, 180);
  const postcode = maxLen(body.postcode, 9).toUpperCase().replace(/\s+/g, '');
  const summary = maxLen(body.summary, 8000);
  const reference = maxLen(body.reference, 60);
  const source = maxLen(body.source, 130);
  const token = maxLen(body.turnstileToken, 2048);
  if (!name || !PHONE.test(phone) || (email && !EMAIL.test(email))) return null;
  if (!summary || summary.length > 8000 || summary.length < 10) return null;
  if (body.kind !== 'contact' && !POSTCODE.test(postcode)) return null;
  if (postcode && !POSTCODE.test(postcode)) return null;
  if (!token || !source.startsWith('/') || source.startsWith('//')) return null;
  return { kind: body.kind, name, phone, email, postcode, summary, reference, source, token };
}

async function turnstileCheck(token, secret, hostname, fetcher) {
  try {
    const form = new FormData();
    form.set('secret', secret);
    form.set('response', token);
    const response = await fetcher('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST', body: form, signal: AbortSignal.timeout(6000),
    });
    if (!response.ok) return false;
    const data = await response.json();
    return data.success === true && data.hostname === hostname;
  } catch { return false; }
}

function configured(env) {
  return env?.LEADS_DB && typeof env.LEADS_DB.prepare === 'function' &&
    env?.NOTIFY_OPS && typeof env.NOTIFY_OPS.send === 'function' &&
    typeof env?.TURNSTILE_SECRET === 'string' && !!env.TURNSTILE_SECRET &&
    typeof env?.OPS_EMAIL === 'string' && EMAIL.test(env.OPS_EMAIL) &&
    typeof env?.FROM_EMAIL === 'string' && EMAIL.test(env.FROM_EMAIL) &&
    typeof env?.SITE_ORIGIN === 'string' && env.SITE_ORIGIN.startsWith('https://');
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== '/api/leads') return fail(404, 'not_found');
    if (request.method !== 'POST') return fail(405, 'method_not_allowed');
    if (!configured(env)) return fail(503, 'not_configured');
    // Both checks matter: dedicated Worker may also have a workers.dev hostname.
    if (request.headers.get('origin') !== env.SITE_ORIGIN ||
        url.origin !== env.SITE_ORIGIN) return fail(403, 'origin_not_allowed');
    if (!/^application\/json(?:;|$)/i.test(request.headers.get('content-type') || '')) return fail(415, 'json_required');
    if (Number(request.headers.get('content-length') || 0) > 15000) return fail(413, 'too_large');
    let body;
    try {
      const raw = await request.text();
      if (raw.length > 15000) return fail(413, 'too_large');
      body = JSON.parse(raw);
    } catch { return fail(400, 'invalid_json'); }
    const lead = validate(body);
    if (!lead) return fail(422, 'invalid_details');
    const host = new URL(env.SITE_ORIGIN).hostname;
    if (!await turnstileCheck(lead.token, env.TURNSTILE_SECRET, host, fetch)) return fail(403, 'challenge_failed');
    const id = 'VX-' + crypto.randomUUID();
    const created = new Date().toISOString();
    try {
      const write = await env.LEADS_DB.prepare(
        'INSERT INTO leads (id, created_at, kind, name, phone, email, postcode, summary, customer_reference, source, notify_state) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      ).bind(id, created, lead.kind, lead.name, lead.phone, lead.email, lead.postcode, lead.summary, lead.reference, lead.source, 'pending').run();
      if (!write?.success) return fail(503, 'storage_unavailable');
    } catch { return fail(503, 'storage_unavailable'); }
    // Inbound receipt is confirmed by D1 persistence, NOT inbox delivery.
    let notification = 'pending';
    try {
      const result = await env.NOTIFY_OPS.send({
        from: env.FROM_EMAIL,
        to: env.OPS_EMAIL,
        subject: `Veltrix ${lead.kind} enquiry ${id}`,
        text: [
          `Enquiry ID: ${id}`, `Received: ${created}`, `Type: ${lead.kind}`,
          `Name: ${lead.name}`, `Phone: ${lead.phone}`,
          `Email: ${lead.email || 'not supplied'}`,
          `Postcode: ${lead.postcode || 'not supplied'}`,
          `Customer reference: ${lead.reference || 'none'}`,
          `Source: ${lead.source}`, '', lead.summary,
          '', 'Original enquiry persists in private D1. Check it before contacting a customer.'
        ].join('\n'),
      });
      if (result?.messageId) {
        notification = 'accepted';
        await env.LEADS_DB.prepare('UPDATE leads SET notify_state = ? WHERE id = ?')
          .bind('accepted', id).run().catch(() => {});
      }
    } catch {
      // Do not pretend delivery. Owner must inspect pending leads in private D1.
    }
    return json({ ok: true, reference: id, saved: true, notificationAccepted: notification === 'accepted' }, 201);
  },
  async scheduled(_event, env) {
    if (!env?.LEADS_DB?.prepare) return;
    const cutoff = new Date(Date.now() - 730 * 24 * 60 * 60 * 1000).toISOString();
    await env.LEADS_DB.prepare('DELETE FROM leads WHERE created_at < ?').bind(cutoff).run();
  },
};
