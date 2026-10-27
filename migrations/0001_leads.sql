-- Customer enquiry storage only. No payment details, attachments or IP tracking.
-- Limit database access to owner-approved Cloudflare staff accounts.
CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  request_key TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  kind TEXT NOT NULL CHECK(kind IN ('quote','booking','contact')),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL DEFAULT '',
  postcode TEXT NOT NULL DEFAULT '',
  summary TEXT NOT NULL,
  customer_reference TEXT NOT NULL DEFAULT '',
  source TEXT NOT NULL,
  notify_state TEXT NOT NULL DEFAULT 'pending'
    CHECK(notify_state IN ('pending','accepted'))
);
CREATE INDEX IF NOT EXISTS idx_leads_received ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_notification ON leads(notify_state, created_at);
