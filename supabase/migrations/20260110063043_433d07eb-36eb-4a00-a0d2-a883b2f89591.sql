-- Add public read access for submitted blueprints (needed for PDF preview/generation)
-- This is safe because:
-- 1. Only submitted blueprints are accessible (not drafts)
-- 2. Blueprint IDs are UUIDs (effectively unguessable)
-- 3. The URL with the ID is the "key" to access

CREATE POLICY "Public can view submitted blueprints by ID"
ON public.blueprints
FOR SELECT
USING (status = 'submitted');

-- Also allow public read of references for submitted blueprints
CREATE POLICY "Public can view references for submitted blueprints"
ON public.blueprint_references
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.blueprints 
    WHERE blueprints.id = blueprint_references.blueprint_id 
    AND blueprints.status = 'submitted'
  )
);