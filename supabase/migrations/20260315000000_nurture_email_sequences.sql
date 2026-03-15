-- ╔══════════════════════════════════════════════════════════════╗
-- ║  Extend email_sequences for Nurture Emails 2–5             ║
-- ║  Creates email_type enum if missing. Adds '1hr' and '72hr'.║
-- ║  Creates email_sequences table if missing.                 ║
-- ║  Adds email_number column for deterministic ordering.      ║
-- ╚══════════════════════════════════════════════════════════════╝


-- ── 1. Create email_type enum if it doesn't exist ───────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'email_type') THEN
    CREATE TYPE public.email_type AS ENUM ('initial', '1hr', '24hr', '72hr', '7day');
  ELSE
    -- Extend existing enum with new values
    BEGIN
      ALTER TYPE public.email_type ADD VALUE IF NOT EXISTS '1hr';
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
      ALTER TYPE public.email_type ADD VALUE IF NOT EXISTS '72hr';
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END IF;
END$$;


-- ── 2. Create email_sequences table if it doesn't exist ─────
CREATE TABLE IF NOT EXISTS public.email_sequences (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  blueprint_id uuid NOT NULL REFERENCES public.blueprints(id) ON DELETE CASCADE,
  email_type  public.email_type NOT NULL,
  email_number smallint,
  status      text NOT NULL DEFAULT 'pending'
              CHECK (status IN ('pending', 'sent', 'cancelled')),
  scheduled_for timestamptz NOT NULL,
  sent_at     timestamptz,
  cancelled_at timestamptz,
  resend_id   text,
  error       text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_email_sequence UNIQUE (blueprint_id, email_type)
);

ALTER TABLE public.email_sequences ENABLE ROW LEVEL SECURITY;

-- Service role can manage
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'email_sequences'
      AND policyname = 'service_manage_sequences'
  ) THEN
    CREATE POLICY "service_manage_sequences"
      ON public.email_sequences
      FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END$$;

COMMENT ON TABLE  public.email_sequences IS 'Scheduled email queue — one row per email per blueprint';
COMMENT ON COLUMN public.email_sequences.email_number IS 'Deterministic email order: 1=initial, 2=1hr, 3=24hr, 4=72hr, 5=7day';
COMMENT ON COLUMN public.email_sequences.resend_id IS 'Resend API message ID for tracking';
COMMENT ON COLUMN public.email_sequences.error IS 'Error message if send failed';


-- ── 3. Add columns if they don't exist (idempotent) ─────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'email_sequences'
      AND column_name = 'email_number'
  ) THEN
    ALTER TABLE public.email_sequences ADD COLUMN email_number smallint;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'email_sequences'
      AND column_name = 'resend_id'
  ) THEN
    ALTER TABLE public.email_sequences ADD COLUMN resend_id text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'email_sequences'
      AND column_name = 'error'
  ) THEN
    ALTER TABLE public.email_sequences ADD COLUMN error text;
  END IF;
END$$;


-- ── 4. Backfill existing rows ───────────────────────────────
UPDATE public.email_sequences SET email_number = 1 WHERE email_type = 'initial' AND email_number IS NULL;
UPDATE public.email_sequences SET email_number = 3 WHERE email_type = '24hr'    AND email_number IS NULL;
UPDATE public.email_sequences SET email_number = 5 WHERE email_type = '7day'    AND email_number IS NULL;
