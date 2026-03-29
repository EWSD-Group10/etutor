-- Add ip_address capture for login events
-- This supports recording the client IP (from X-Forwarded-For / remote IP). 

ALTER TABLE "user_activity_events"
ADD COLUMN IF NOT EXISTS "ip_address" varchar(100);
