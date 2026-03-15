-- ╔══════════════════════════════════════════════════════════════╗
-- ║  Cron Schedule: process-nurture-queue every 5 minutes      ║
-- ║  Uses pg_cron + pg_net to call the Edge Function.          ║
-- ║                                                            ║
-- ║  NOTE: This migration was applied with the service_role    ║
-- ║  key inline. The key has been scrubbed from this file      ║
-- ║  post-deployment. The cron job in the database retains     ║
-- ║  the key. Do NOT re-run this migration without             ║
-- ║  re-inserting the key.                                     ║
-- ╚══════════════════════════════════════════════════════════════╝

-- ── 1. Enable required extensions ───────────────────────────
CREATE EXTENSION IF NOT EXISTS pg_cron SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net SCHEMA extensions;

-- ── 2. Schedule the nurture queue processor ─────────────────
--    Runs every 5 minutes. Calls the Edge Function via HTTP POST.
--    Uses service_role key for authentication.
--    KEY SCRUBBED — see cron.job table for live schedule.

-- SELECT cron.schedule(
--   'process-nurture-queue',
--   '*/5 * * * *',
--   $$
--   SELECT net.http_post(
--     url := 'https://ovfctbpwclkrbfjjzssj.supabase.co/functions/v1/process-nurture-queue',
--     headers := jsonb_build_object(
--       'Content-Type', 'application/json',
--       'Authorization', 'Bearer <SERVICE_ROLE_KEY>'
--     ),
--     body := '{}'::jsonb
--   ) AS request_id;
--   $$
-- );
