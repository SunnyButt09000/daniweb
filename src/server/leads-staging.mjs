// Separate synthetic-only staging entry point. Never use for the live website.
import leads, { limitedBody } from './leads.mjs';

const forbidden = () => new Response('Not found', { status: 404 });
const safe = (response) => {
  const headers = new Headers(response.headers);
  headers.set('x-robots-tag', 'noindex, nofollow, noarchive');
  headers.set('cache-control', 'no-store');
  headers.set('x-content-type-options', 'nosniff');
  headers.set('referrer-policy', 'no-referrer');
  return new Response(response.body, { status: response.status, headers });
};
const stageConfigured = (env, url) => env.STAGING_ONLY === 'true' &&
  typeof env.STAGING_ACCESS_KEY === 'string' && env.STAGING_ACCESS_KEY.length >= 64 &&
  typeof env.SITE_ORIGIN === 'string' && /^https:\/\/[a-z0-9-]+\.[a-z0-9-]+\.workers\.dev$/.test(env.SITE_ORIGIN) &&
  (!url || url.origin === env.SITE_ORIGIN);

async function equalKey(value, expected) {
  const enc = new TextEncoder();
  const a = new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(value || '')));
  const b = new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(expected)));
  let different = 0;
  for (let i = 0; i < a.length; i++) different |= a[i] ^ b[i];
  return different === 0;
}
async function authenticated(request, env) {
  const bearer = request.headers.get('authorization')?.replace(/^Bearer /, '');
  const cookie = request.headers.get('cookie')?.split(';').map(v => v.trim()).find(v => v.startsWith('veltrix_staging='))?.slice(16);
  return equalKey(bearer || cookie || '', env.STAGING_ACCESS_KEY);
}

// An absent email service must remain visibly pending, never fake acceptance.
const serviceEnv = (env) => ({ ...env,
  NOTIFY_OPS: env.NOTIFY_OPS || { send: async () => { throw new Error('Staging email service is not configured'); } },
  OPS_EMAIL: env.OPS_EMAIL || 'unconfigured@example.test',
  FROM_EMAIL: env.FROM_EMAIL || 'unconfigured@example.test',
});
export const syntheticLead = (body) => body && typeof body === 'object' && !Array.isArray(body) &&
  typeof body.name === 'string' && /^Synthetic(?: [A-Za-z0-9-]+){0,8}$/.test(body.name) &&
  typeof body.phone === 'string' && /^07700900\d{3}$/.test(body.phone) &&
  (body.email === undefined || typeof body.email === 'string' && (!body.email || /^synthetic(?:[+.-][a-z0-9-]+)?@example\.test$/i.test(body.email))) &&
  (body.postcode === undefined || typeof body.postcode === 'string' && (!body.postcode || ['ZZ11ZZ', 'ZZ1 1ZZ'].includes(body.postcode.toUpperCase()))) &&
  typeof body.summary === 'string' && body.summary.includes('[STAGING SYNTHETIC]');

const accessPage = () => new Response(`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Veltrix staging access</title><h1>Private synthetic testing</h1><p>Use the staging access key stored privately by the operator. Do not enter customer information.</p><form method="post"><label>Staging access key <input type="password" name="key" required autocomplete="off"></label><button>Open staging</button></form></html>`, { headers: { 'content-type': 'text/html; charset=utf-8' } });

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!stageConfigured(env, url)) return safe(new Response('Staging is not configured', { status: 503 }));
    if (url.pathname === '/staging-access') {
      if (request.method === 'GET') {
        const response = safe(accessPage());
        // Native Chrome form navigation uses Origin: null under no-referrer.
        // Keep the real same-origin POST header; never permit a null origin.
        response.headers.set('referrer-policy', 'same-origin');
        return response;
      }
      if (request.method !== 'POST' || request.headers.get('origin') !== env.SITE_ORIGIN) return safe(forbidden());
      if (Number(request.headers.get('content-length') || 0) > 512) return safe(forbidden());
      const text = await limitedBody(request).catch(() => '');
      const key = text.length <= 512 ? new URLSearchParams(text).get('key') : '';
      if (!await equalKey(key, env.STAGING_ACCESS_KEY)) return safe(forbidden());
      return safe(new Response(null, { status: 303, headers: { location: '/', 'set-cookie': `veltrix_staging=${key}; Secure; HttpOnly; SameSite=Strict; Path=/; Max-Age=3600` } }));
    }
    if (!await authenticated(request, env)) return safe(forbidden());
    if (url.pathname === '/_staging/retry') {
      if (request.method !== 'POST' || request.headers.get('origin') !== env.SITE_ORIGIN) return safe(forbidden());
      await leads.scheduled({}, serviceEnv(env));
      return safe(Response.json({ ok: true, retryInvoked: true }));
    }
    if (url.pathname === '/api/leads') {
      if (request.method !== 'POST') return safe(await leads.fetch(request, serviceEnv(env)));
      let raw, body;
      try { raw = await limitedBody(request); body = JSON.parse(raw); }
      catch (error) { return safe(Response.json({ ok: false, code: error?.code === 'too_large' ? 'too_large' : 'invalid_json' }, { status: error?.code === 'too_large' ? 413 : 400 })); }
      if (!syntheticLead(body)) return safe(Response.json({ ok: false, code: 'synthetic_only' }, { status: 422 }));
      return safe(await leads.fetch(new Request(request, { body: raw }), serviceEnv(env)));
    }
    if (!env.ASSETS?.fetch) return safe(forbidden());
    const response = await env.ASSETS.fetch(request);
    if (!response.headers.get('content-type')?.includes('text/html')) return safe(response);
    const key = env.TURNSTILE_SITE_KEY;
    if (!/^[a-zA-Z0-9_-]{12,180}$/.test(key || '')) return safe(new Response('Staging widget unavailable', { status: 503 }));
    const html = new HTMLRewriter()
      .on('body', { element(el) { el.prepend('<aside role="note"><strong>PRIVATE STAGING — SYNTHETIC DATA ONLY.</strong> Name must begin Synthetic; use the reserved test phone, example.test email and test postcode supplied by the operator. Put [STAGING SYNTHETIC] in the job/message field. This is not the live website.<p><a href="/contact/" data-staging-contact>Open synthetic staging contact form</a></p></aside>', { html: true }); } })
      .on('form .qb__submit', { element(el) { el.append(`<div class="lead-direct"><p class="hint">Synthetic test only. A receipt confirms staging storage, not an appointment or email delivery.</p><div class="cf-turnstile" data-sitekey="${key}" data-action="lead"></div><button type="submit" class="btn btn--primary" data-send="website"><span>Save synthetic staging enquiry</span></button></div>`, { html: true }); } })
      .on('script[src]', { element(el) { if ((el.getAttribute('src') || '').startsWith('/assets/js/forms.js')) el.before('<script>Object.assign(window.VX,{endpoint:"/api/leads",leadCapture:true});</script><script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>', { html: true }); } })
      .transform(response);
    const result = safe(html);
    result.headers.set('content-security-policy', "default-src 'self'; script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' https://challenges.cloudflare.com; frame-src https://challenges.cloudflare.com https://www.google.com https://maps.google.com; form-action 'self' https://wa.me mailto:; base-uri 'self'; frame-ancestors 'none'");
    return result;
  },
  async scheduled(event, env) {
    if (!stageConfigured(env)) return;
    await leads.scheduled(event, serviceEnv(env));
  },
};
