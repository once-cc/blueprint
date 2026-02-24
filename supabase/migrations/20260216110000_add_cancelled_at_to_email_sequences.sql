-- Add cancelled_at timestamp to email_sequences for tracking when sequences were cancelled
ALTER TABLE public.email_sequences
ADD COLUMN IF NOT EXISTS cancelled_at timestamptz;
