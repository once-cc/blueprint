-- ╔══════════════════════════════════════════════════════════════╗
-- ║  Add operator override columns to email_sequences           ║
-- ║  Supports Console-driven email editing for pending emails   ║
-- ╚══════════════════════════════════════════════════════════════╝

-- Override columns — populated by Console via set-email-override edge function
-- When present, process-nurture-queue uses these instead of deterministic render
ALTER TABLE public.email_sequences
  ADD COLUMN IF NOT EXISTS override_subject text,
  ADD COLUMN IF NOT EXISTS override_body text,
  ADD COLUMN IF NOT EXISTS override_cta_label text,
  ADD COLUMN IF NOT EXISTS override_by text,
  ADD COLUMN IF NOT EXISTS override_at timestamptz;

COMMENT ON COLUMN public.email_sequences.override_subject IS 'Operator-edited subject line — takes precedence over rendered subject';
COMMENT ON COLUMN public.email_sequences.override_body IS 'Operator-edited body text (plain paragraphs) — re-wrapped in template at send time';
COMMENT ON COLUMN public.email_sequences.override_cta_label IS 'Operator-edited CTA button label (Email 5 only)';
COMMENT ON COLUMN public.email_sequences.override_by IS 'Email of the operator who last edited';
COMMENT ON COLUMN public.email_sequences.override_at IS 'Timestamp of the last operator edit';
