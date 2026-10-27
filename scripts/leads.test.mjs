import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import handler from '../src/server/leads.mjs';

const realFetch = globalThis.fetch;
after(() => { globalThis.fetch = realFetch; });
const ORIGIN = 'https://veltrixwindowsdoor.co.uk';
const req = (body, origin = ORIGIN) => new Request(ORIGIN + '/api/leads', {
  method: 'POST',
  headers: { origin, 'content-type': 'application/json' },
  body: JSON.stringify(body),
});
const payload = () => ({
  kind: 'contact', name: 'Sample Customer', phone: '07123456789', email: 'sample@example.test',
  postcode: 'M12 6AB', summary: 'I would like a quote for a replacement front door.',
  source: '/contact/', consent: true, turnstileToken: 'test-valid',
  requestKey: '747bd158-e72b-4dcf-989a-9cc4f4de9f9a',
});
function mockEnv({ storageFails = false, emailFails = false } = {}) {
  const leads = [];
  const emails = [];
  const env = {
    SITE_ORIGIN: ORIGIN, TURNSTILE_SECRET: 'test-private', OPS_EMAIL: 'ops@example.test',
    FROM_EMAIL: 'notifications@example.test',
    LEADS_DB: {
      prepare(sql) {
        return {
          bind(...args) {
            return {
              async run() {
                if (storageFails) throw new Error('simulated D1 failure');
                if (sql.startsWith('INSERT OR IGNORE')) {
                  const [id, key, created, kind, name, phone, email, postcode, summary,
                    customer_reference, source, notify_state] = args;
                  if (!leads.some(row => row.request_key === key)) {
                    leads.push({ id, request_key: key, created, kind, name, phone, email, postcode,
                      summary, customer_reference, source, notify_state });
                  }
                }
                if (sql.startsWith('UPDATE leads')) {
                  const [, id] = args;
                  const row = leads.find(x => x.id === id);
                  if (row) row.notify_state = 'accepted';
                }
                return { success: true };
              },
              async first() {
                if (storageFails) throw new Error('simulated D1 failure');
                return leads.find(x => x.request_key === args[0]) || null;
              },
            };
          },
        };
      },
    },
    NOTIFY_OPS: { async send(msg) {
      if (emailFails) throw new Error('simulated email outage');
      emails.push(msg); return { messageId: 'accepted-email-id' };
    } },
  };
  return { env, leads, emails };
}
function allowChallenge(overrides = {}) {
  globalThis.fetch = async () => Response.json({ success: true, hostname: 'veltrixwindowsdoor.co.uk', action: 'lead', ...overrides });
}

test('fails closed without configured D1, sending binding and Turnstile', async () => {
  const reply = await handler.fetch(req(payload()), {});
  assert.equal(reply.status, 503);
  assert.equal((await reply.json()).code, 'not_configured');
});

test('origin and consent are validated before any storage', async () => {
  allowChallenge();
  const x = mockEnv();
  assert.equal((await handler.fetch(req(payload(), 'https://other.test'), x.env)).status, 403);
  assert.equal((await handler.fetch(req({ ...payload(), consent: false }), x.env)).status, 422);
  assert.equal(x.leads.length, 0);
});

test('Turnstile hostname and action must both match', async () => {
  const x = mockEnv();
  allowChallenge({ hostname: 'other.test' });
  assert.equal((await handler.fetch(req(payload()), x.env)).status, 403);
  allowChallenge({ action: 'wrong' });
  assert.equal((await handler.fetch(req(payload()), x.env)).status, 403);
  assert.equal(x.leads.length, 0);
});

test('valid lead is persisted before acknowledging; send is only accepted for processing', async () => {
  allowChallenge();
  const x = mockEnv();
  const response = await handler.fetch(req(payload()), x.env);
  const body = await response.json();
  assert.equal(response.status, 201);
  assert.equal(body.saved, true);
  assert.equal(body.notificationAccepted, true);
  assert.match(body.reference, /^VX-[a-f0-9-]{36}$/);
  assert.equal(x.leads.length, 1);
  assert.equal(x.emails.length, 1);
  assert.match(x.emails[0].text, /Sample Customer/);
  assert.ok(!JSON.stringify(body).includes('Sample Customer'));
});

test('D1 failure never claims a receipt and never sends email', async () => {
  allowChallenge();
  const x = mockEnv({ storageFails: true });
  assert.equal((await handler.fetch(req(payload()), x.env)).status, 503);
  assert.equal(x.emails.length, 0);
});

test('email delivery outage does not erase durable lead receipt', async () => {
  allowChallenge();
  const x = mockEnv({ emailFails: true });
  const response = await handler.fetch(req(payload()), x.env);
  const body = await response.json();
  assert.equal(response.status, 201);
  assert.equal(body.saved, true);
  assert.equal(body.notificationAccepted, false);
  assert.equal(x.leads.length, 1);
});

test('rejects oversized text, invalid postcode and unavailable HTTP methods', async () => {
  allowChallenge();
  const x = mockEnv();
  assert.equal((await handler.fetch(req({ ...payload(), summary: 'x'.repeat(8001) }), x.env)).status, 422);
  assert.equal((await handler.fetch(req({ ...payload(), postcode: 'INVALID' }), x.env)).status, 422);
  assert.equal((await handler.fetch(new Request(ORIGIN+'/api/leads'), x.env)).status, 405);
  assert.equal(x.leads.length, 0);
});

test('scheduled retention job deletes entries over 730 days old', async () => {
  let sql = '', args = [];
  await handler.scheduled({}, { LEADS_DB: { prepare(s) { sql = s; return { bind(...p) { args = p; return { run: async () => ({ success: true }) }; } }; } } });
  assert.match(sql, /DELETE FROM leads WHERE created_at/);
  assert.match(args[0], /^\d{4}-\d\d-\d\dT/);
});


test('retry with the same request key reuses the saved receipt with no second email', async () => {
  allowChallenge();
  const x = mockEnv();
  const first = await (await handler.fetch(req(payload()), x.env)).json();
  const secondRes = await handler.fetch(req(payload()), x.env);
  const second = await secondRes.json();
  assert.equal(secondRes.status, 201);
  assert.equal(second.reference, first.reference);
  assert.equal(second.reused, true);
  assert.equal(x.leads.length, 1);
  assert.equal(x.emails.length, 1);
});

test('same request key cannot be replayed for a different customer or altered job', async () => {
  allowChallenge();
  const x = mockEnv();
  assert.equal((await handler.fetch(req(payload()), x.env)).status, 201);
  const changed = { ...payload(), phone: '07777777777' };
  const response = await handler.fetch(req(changed), x.env);
  assert.equal(response.status, 409);
  assert.equal((await response.json()).code, 'request_key_reused');
  assert.equal(x.leads.length, 1);
  assert.equal(x.emails.length, 1);
});

test('requires a stable UUID submission key and cannot claim success for missing DB row', async () => {
  allowChallenge();
  const x = mockEnv();
  assert.equal((await handler.fetch(req({ ...payload(), requestKey: '' }), x.env)).status, 422);
  assert.equal((await handler.fetch(req({ ...payload(), requestKey: 'guess' }), x.env)).status, 422);
  assert.equal(x.leads.length, 0);
});
