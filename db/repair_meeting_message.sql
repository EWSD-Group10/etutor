CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) allocations table (old installs used "allocation")
DO $$
BEGIN
  IF to_regclass('public.allocations') IS NULL AND to_regclass('public.allocation') IS NOT NULL THEN
    ALTER TABLE public.allocation RENAME TO allocations;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  tutor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reallocated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  reason TEXT,
  notes TEXT,
  allocated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS allocations_student_id_key ON public.allocations(student_id);
CREATE INDEX IF NOT EXISTS allocations_tutor_id_idx ON public.allocations(tutor_id);

-- 2) messages table alignment
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP(3)
);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='messages' AND column_name='message_body'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='messages' AND column_name='content'
  ) THEN
    ALTER TABLE public.messages RENAME COLUMN message_body TO content;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='messages' AND column_name='sent_at'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='messages' AND column_name='created_at'
  ) THEN
    ALTER TABLE public.messages RENAME COLUMN sent_at TO created_at;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='messages' AND column_name='is_read'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='messages' AND column_name='read_at'
  ) THEN
    ALTER TABLE public.messages ADD COLUMN read_at TIMESTAMP(3);
    UPDATE public.messages SET read_at = created_at WHERE is_read = true AND read_at IS NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS messages_sender_id_idx ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS messages_recipient_id_idx ON public.messages(recipient_id);
CREATE INDEX IF NOT EXISTS messages_created_at_idx ON public.messages(created_at);

-- 3) meetings table alignment (old installs may have meeting/scheduledAt/meeting_creator)
DO $$
BEGIN
  IF to_regclass('public.meetings') IS NULL AND to_regclass('public.meeting') IS NOT NULL THEN
    ALTER TABLE public.meeting RENAME TO meetings;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  tutor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_by_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  meeting_type VARCHAR(20) NOT NULL DEFAULT 'virtual',
  meeting_status VARCHAR(20) NOT NULL DEFAULT 'scheduled',
  scheduled_at TIMESTAMP(3) NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  location VARCHAR(255),
  meeting_link VARCHAR(500),
  notes TEXT,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='meetings' AND column_name='scheduledAt'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='meetings' AND column_name='scheduled_at'
  ) THEN
    ALTER TABLE public.meetings RENAME COLUMN "scheduledAt" TO scheduled_at;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='meetings' AND column_name='meeting_creator'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='meetings' AND column_name='created_by_id'
  ) THEN
    ALTER TABLE public.meetings RENAME COLUMN meeting_creator TO created_by_id;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS meetings_student_id_idx ON public.meetings(student_id);
CREATE INDEX IF NOT EXISTS meetings_tutor_id_idx ON public.meetings(tutor_id);
CREATE INDEX IF NOT EXISTS meetings_scheduled_at_idx ON public.meetings(scheduled_at);