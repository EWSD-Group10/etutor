-- Sync NotificationType enum to match current schema (add missing values, meeting_pending was never in DB)
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'meeting_accepted';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'meeting_rejected';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'meeting_updated';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'student_assigned';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'tutor_reallocated';
