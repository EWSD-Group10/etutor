-- Add user agent capture for login events
-- This supports storing the browser/device User-Agent string for each login activity event.

ALTER TABLE "user_activity_events"
ADD COLUMN IF NOT EXISTS "user_agent" text;
