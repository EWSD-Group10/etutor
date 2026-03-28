-- Revert browser/OS columns on user_activity_events (feature removed).
-- IF EXISTS: no error on fresh DBs or if columns were never added.

DROP INDEX IF EXISTS "user_activity_events_browser_family_created_at_idx";

ALTER TABLE "user_activity_events" DROP COLUMN IF EXISTS "browser_family";
ALTER TABLE "user_activity_events" DROP COLUMN IF EXISTS "os_family";
