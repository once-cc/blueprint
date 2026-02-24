-- Fix: Resolve RLS insert error for blueprint_references
-- The previous policy (20260216100000_fix_blueprint_references_rls.sql)
-- caused a 42501 error on INSERT because it referenced:
--   WHERE b.id = blueprint_references.blueprint_id
-- In an INSERT's WITH CHECK, the new row is not yet in the table,
-- causing the reference to evaluate to NULL.
-- The correct syntax is to just use 'blueprint_id' to refer to the NEW row.

BEGIN;

DROP POLICY IF EXISTS "Users can insert references via session token or studio" ON public.blueprint_references;

CREATE POLICY "Users can insert references via session token or studio"
ON public.blueprint_references FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.blueprints b
    WHERE b.id = blueprint_id
    AND (
      (b.session_token)::text = COALESCE(
        ((current_setting('request.headers'::text, true))::json ->> 'x-blueprint-token'::text),
        ''::text
      )
      OR (auth.uid() IS NOT NULL AND public.is_studio_user(auth.uid()))
    )
  )
);

COMMIT;
