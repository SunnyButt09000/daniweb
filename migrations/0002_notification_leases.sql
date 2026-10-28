-- Atomic, expiring notification claims shared by initial sends and cron retries.
-- Existing receipt/request-key data and retention policy are preserved.
ALTER TABLE leads ADD COLUMN notify_lease_token TEXT NOT NULL DEFAULT '';
ALTER TABLE leads ADD COLUMN notify_lease_until TEXT NOT NULL DEFAULT '';
