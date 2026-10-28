// Verify actual SQLite migration and lead Worker database statements (not a live Cloudflare deployment).
// Node.js >= 22, SQLite experimental in this runtime; mocked Turnstile and email.
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import leads from '../src/server/leads.mjs';

const migration = ['0001_leads.sql', '0002_notification_leases.sql'].map((file) =>
  readFileSync(fileURLToPath(new URL('../migrations/' + file, import.meta.url)), 'utf8')).join('\n');
const origin = 'https://veltrixwindowsdoor.co.uk';
const originalFetch = globalThis.fetch;
after(() => { globalThis.fetch = originalFetch; });

function staging() {
  const db = new DatabaseSync(':memory:');
  db.exec(migration);
  const messages = [];
  let emailDown = false;
  const env = {
    SITE_ORIGIN: origin,
    TURNSTILE_SECRET: 'mock-secret-never-deploy',
    FROM_EMAIL: 'notice@example.test',
    OPS_EMAIL: 'ops@example.test',
    LEADS_DB: {
      prepare(sql) {
        const statement = db.prepare(sql);
        const wrap = (params = []) => ({
          async run() {
            const v = statement.run(...params);
            return { success: true, meta: { changes: v.changes } };
          },
          async first() { return statement.get(...params) || null; },
          async all() { return { results: statement.all(...params) }; },
        });
        return { ...wrap(), bind(...args) { return wrap(args); } };
      },
    },
    NOTIFY_OPS: {
      async send(m) {
        if (emailDown) throw new Error('simulated temporary mail outage');
        messages.push(m);
        return { messageId: 'mock-accepted' };
      },
    },
  };
  return { db, env, messages, setEmailDown: v => { emailDown = v; } };
}

const input = (overrides = {}) => ({
  kind: 'quote',
  name: 'Synthetic Customer',
  phone: '07123456789',
  email: 'test@example.test',
  postcode: 'M12 6AB',
  summary: "Quote for 2 front windows 1200 x 1200, glass and white frames",
  reference: 'W1',
  source: '/quote/',
  consent: true,
  turnstileToken: 'dummy-not-real',
  requestKey: '4a5ebc1e-f893-4d6e-84d4-9800eb7d23f6',
  ...overrides,
});
const request = (body) => new Request(origin + '/api/leads', {
  method: 'POST',
  headers: { origin, 'content-type': 'application/json' },
  body: JSON.stringify(body),
});
function passTurnstile() {
  globalThis.fetch = async () => Response.json({
    success: true, hostname: 'veltrixwindowsdoor.co.uk', action: 'lead',
  });
}

test('real SQLite migration stores one receipt, and retry is idempotent', async () => {
  const x = staging();
  try {
    passTurnstile();
    const first = await leads.fetch(request(input()), x.env);
    assert.equal(first.status, 201);
    const a = await first.json();
    assert.equal(a.saved, true);
    assert.equal(a.notificationAccepted, true);
    const second = await leads.fetch(request(input()), x.env);
    assert.equal(second.status, 201);
    const b = await second.json();
    assert.equal(b.reference, a.reference);
    assert.equal(b.reused, true);
    assert.equal(x.db.prepare('SELECT COUNT(*) AS n FROM leads').get().n, 1);
    assert.equal(x.messages.length, 1);
    assert.equal(x.db.prepare('SELECT notify_state FROM leads').get().notify_state, 'accepted');
  } finally { x.db.close(); }
});

test('same submission key with different details is rejected without second record', async () => {
  const x = staging();
  try {
    passTurnstile();
    assert.equal((await leads.fetch(request(input()), x.env)).status, 201);
    const replay = await leads.fetch(request(input({ phone: '07777777777' })), x.env);
    assert.equal(replay.status, 409);
    assert.equal(x.db.prepare('SELECT COUNT(*) AS n FROM leads').get().n, 1);
    assert.equal(x.messages.length, 1);
  } finally { x.db.close(); }
});

test('email outage persists pending lead and cron sends later, but does not resend accepted lead', async () => {
  const x = staging();
  try {
    passTurnstile();
    x.setEmailDown(true);
    const res = await leads.fetch(request(input()), x.env);
    assert.equal(res.status, 201);
    assert.equal((await res.json()).notificationAccepted, false);
    assert.equal(x.db.prepare('SELECT notify_state FROM leads').get().notify_state, 'pending');
    assert.equal(x.messages.length, 0);
    x.setEmailDown(false);
    await leads.scheduled({}, x.env);
    assert.equal(x.db.prepare('SELECT notify_state FROM leads').get().notify_state, 'accepted');
    assert.equal(x.messages.length, 1);
    await leads.scheduled({}, x.env);
    assert.equal(x.messages.length, 1);
  } finally { x.db.close(); }
});

test('invalid consent does not write, and quotation content remains parameterised', async () => {
  const x = staging();
  try {
    passTurnstile();
    assert.equal((await leads.fetch(request(input({ consent: false })), x.env)).status, 422);
    assert.equal(x.db.prepare('SELECT COUNT(*) AS n FROM leads').get().n, 0);
    const sentence = "Quotation for windows; note O'Hara's house requires a check";
    const res = await leads.fetch(request(input({ summary: sentence })), x.env);
    assert.equal(res.status, 201);
    assert.equal(x.db.prepare('SELECT summary FROM leads').get().summary, sentence);
  } finally { x.db.close(); }
});

test('retention job removes only records older than 730 days', async () => {
  const x = staging();
  try {
    passTurnstile();
    const res = await leads.fetch(request(input()), x.env);
    assert.equal(res.status, 201);
    const id = (await res.json()).reference;
    // Synthetic expired row is inserted via parameterised SQL; no real customer data.
    x.db.prepare(
      "INSERT INTO leads (id,request_key,created_at,kind,name,phone,email,postcode,summary,customer_reference,source,notify_state) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)"
    ).run('VX-old-synthetic', 'f3341bc0-5223-40ae-98c4-b02449dc6449',
      '2020-01-01T00:00:00.000Z', 'contact', 'Old synthetic', '07123456789', '',
      '', 'Old synthetic enquiry', '', '/contact/', 'pending');
    await leads.scheduled({}, x.env);
    assert.equal(x.db.prepare('SELECT COUNT(*) AS n FROM leads').get().n, 1);
    assert.equal(x.db.prepare('SELECT id FROM leads').get().id, id);
  } finally { x.db.close(); }
});

test('invalid types, overlong fields, UUID suffixes and punctuation-only phones never persist', async () => {
  const x = staging();
  try {
    passTurnstile();
    for (const bad of [{ name: 'x'.repeat(101) }, { email: {} }, { reference: [] },
      { requestKey: input().requestKey + 'junk' }, { phone: '..........' },
      { turnstileToken: 'x'.repeat(2049) }]) {
      assert.equal((await leads.fetch(request(input(bad)), x.env)).status, 422, JSON.stringify(Object.keys(bad)));
    }
    assert.equal(x.db.prepare('SELECT COUNT(*) AS n FROM leads').get().n, 0);
  } finally { x.db.close(); }
});

test('body limit counts UTF-8 bytes even without Content-Length', async () => {
  const x = staging();
  try {
    passTurnstile();
    const req = request(input({ summary: 'é'.repeat(7900) }));
    assert.equal(req.headers.get('content-length'), null);
    assert.equal((await leads.fetch(req, x.env)).status, 413);
    assert.equal(x.db.prepare('SELECT COUNT(*) AS n FROM leads').get().n, 0);
  } finally { x.db.close(); }
});

test('overlapping notification retries claim a pending lead only once', async () => {
  const x = staging();
  try {
    passTurnstile(); x.setEmailDown(true);
    assert.equal((await leads.fetch(request(input()), x.env)).status, 201);
    x.setEmailDown(false);
    await Promise.all([leads.scheduled({}, x.env), leads.scheduled({}, x.env)]);
    assert.equal(x.messages.length, 1);
    assert.equal(x.db.prepare('SELECT notify_state FROM leads').get().notify_state, 'accepted');
  } finally { x.db.close(); }
});

test('cron cannot send a second notification while the original request is sending', async () => {
  const x = staging();
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  let started;
  const signal = new Promise(resolve => { started = resolve; });
  let calls = 0;
  try {
    passTurnstile();
    x.env.NOTIFY_OPS.send = async () => { calls++; started(); await gate; return { messageId: 'synthetic-accepted' }; };
    const first = leads.fetch(request(input()), x.env);
    await signal;
    const cron = leads.scheduled({}, x.env);
    await new Promise(resolve => setTimeout(resolve, 10));
    const observed = calls;
    release();
    assert.equal((await first).status, 201);
    await cron;
    assert.equal(observed, 1);
  } finally { release(); x.db.close(); }
});

test('an interrupted notification lease expires and a later retry can recover', async () => {
  const x = staging();
  try {
    passTurnstile(); x.setEmailDown(true);
    const response = await leads.fetch(request(input()), x.env);
    const { reference } = await response.json();
    x.db.prepare('UPDATE leads SET notify_lease_token = ?, notify_lease_until = ? WHERE id = ?')
      .run('synthetic-interrupted-attempt', new Date(Date.now() + 60000).toISOString(), reference);
    x.setEmailDown(false);
    await leads.scheduled({}, x.env);
    assert.equal(x.messages.length, 0);
    x.db.prepare('UPDATE leads SET notify_lease_until = ? WHERE id = ?')
      .run('2000-01-01T00:00:00.000Z', reference);
    await leads.scheduled({}, x.env);
    assert.equal(x.messages.length, 1);
    assert.equal(x.db.prepare('SELECT notify_state FROM leads').get().notify_state, 'accepted');
  } finally { x.db.close(); }
});
