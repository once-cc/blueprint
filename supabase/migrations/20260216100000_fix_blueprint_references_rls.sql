-- Fix: Restore session-token-based RLS policies for blueprint_references
-- The 20260110082254 migration dropped these, breaking the configurator's
-- ability to add references (images/links) during the intake flow.

-- Drop the overly restrictive studio-only policy
DROP POLICY IF EXISTS "Studio users can manage references" ON public.blueprint_references;

-- Restore session-token-based policies for configurator users
-- SELECT: Users can view references if they have the matching session token OR are studio users
CREATE POLICY "Users can view references via session token or studio"
ON public.blueprint_references FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.blueprints b
    WHERE b.id = blueprint_references.blueprint_id
    AND (
      (b.session_token)::text = COALESCE(
        ((current_setting('request.headers'::text, true))::json ->> 'x-blueprint-token'::text),
        ''::text
      )
      OR (auth.uid() IS NOT NULL AND public.is_studio_user(auth.uid()))
    )
  )
);

-- INSERT: Users can add references if they have the matching session token OR are studio users
CREATE POLICY "Users can insert references via session token or studio"
ON public.blueprint_references FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.blueprints b
    WHERE b.id = blueprint_references.blueprint_id
    AND (
      (b.session_token)::text = COALESCE(
        ((current_setting('request.headers'::text, true))::json ->> 'x-blueprint-token'::text),
        ''::text
      )
      OR (auth.uid() IS NOT NULL AND public.is_studio_user(auth.uid()))
    )
  )
);

-- UPDATE: Users can update references (notes, role) via session token or studio
CREATE POLICY "Users can update references via session token or studio"
ON public.blueprint_references FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.blueprints b
    WHERE b.id = blueprint_references.blueprint_id
    AND (
      (b.session_token)::text = COALESCE(
        ((current_setting('request.headers'::text, true))::json ->> 'x-blueprint-token'::text),
        ''::text
      )
      OR (auth.uid() IS NOT NULL AND public.is_studio_user(auth.uid()))
    )
  )
);

-- DELETE: Users can remove references via session token or studio
CREATE POLICY "Users can delete references via session token or studio"
ON public.blueprint_references FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.blueprints b
    WHERE b.id = blueprint_references.blueprint_id
    AND (
      (b.session_token)::text = COALESCE(
        ((current_setting('request.headers'::text, true))::json ->> 'x-blueprint-token'::text),
        ''::text
      )
      OR (auth.uid() IS NOT NULL AND public.is_studio_user(auth.uid()))
    )
  )
);

-- Also ensure the blueprint-references storage bucket exists and has proper policies
-- (The bucket may have been created via Supabase dashboard)
INSERT INTO storage.buckets (id, name, public)
VALUES ('blueprint-references', 'blueprint-references', false)
ON CONFLICT (id) DO NOTHING;

-- Storage: Allow uploads via anon key (the configurator is unauthenticated)
-- The bucket is private but we allow uploads and signed URL generation
DROP POLICY IF EXISTS "Anyone can upload to blueprint-references" ON storage.objects;
CREATE POLICY "Anyone can upload to blueprint-references" ON storage.objects
FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id = 'blueprint-references');

DROP POLICY IF EXISTS "Anyone can view blueprint-references" ON storage.objects;
CREATE POLICY "Anyone can view blueprint-references" ON storage.objects
FOR SELECT TO anon, authenticated
USING (bucket_id = 'blueprint-references');

DROP POLICY IF EXISTS "Anyone can delete from blueprint-references" ON storage.objects;
CREATE POLICY "Anyone can delete from blueprint-references" ON storage.objects
FOR DELETE TO anon, authenticated
USING (bucket_id = 'blueprint-references');
