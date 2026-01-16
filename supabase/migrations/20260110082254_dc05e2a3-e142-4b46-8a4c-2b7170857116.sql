-- ============================================
-- SECURITY HARDENING: Blueprint Access & PDF Artifacts
-- ============================================

-- Phase 1: Add secure columns to blueprints table
ALTER TABLE public.blueprints 
ADD COLUMN IF NOT EXISTS pdf_object_path text,
ADD COLUMN IF NOT EXISTS session_token_hash text;

-- Create index for hash lookups
CREATE INDEX IF NOT EXISTS idx_blueprints_session_token_hash 
ON public.blueprints(session_token_hash);

-- Phase 2: Create blueprint_access_tokens table for secure, auditable access
CREATE TABLE IF NOT EXISTS public.blueprint_access_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blueprint_id uuid REFERENCES blueprints(id) ON DELETE CASCADE NOT NULL,
  token_hash text NOT NULL,
  scope text NOT NULL CHECK (scope IN ('preview', 'download', 'internal')),
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  used_at timestamptz,
  revoked_at timestamptz
);

ALTER TABLE public.blueprint_access_tokens ENABLE ROW LEVEL SECURITY;

-- Only service role can manage tokens (Edge Functions use service role)
CREATE POLICY "Service role only" ON public.blueprint_access_tokens
FOR ALL USING (false);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_access_tokens_hash ON public.blueprint_access_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_access_tokens_blueprint ON public.blueprint_access_tokens(blueprint_id);
CREATE INDEX IF NOT EXISTS idx_access_tokens_expires ON public.blueprint_access_tokens(expires_at);

-- Phase 3: Simplify RLS Policies (Remove fragile header-based logic)

-- BLUEPRINTS TABLE: Drop header-based policies
DROP POLICY IF EXISTS "Users can view own blueprint via session token" ON public.blueprints;
DROP POLICY IF EXISTS "Users can update own blueprint via session token" ON public.blueprints;
DROP POLICY IF EXISTS "Public can view submitted blueprints by ID" ON public.blueprints;

-- Keep the insert policy for creating drafts
-- "Anyone can create draft blueprints" already exists

-- Studio users can view all blueprints
CREATE POLICY "Studio users can view all blueprints" ON public.blueprints
FOR SELECT TO authenticated
USING (is_studio_user(auth.uid()));

-- Studio users can update all blueprints  
CREATE POLICY "Studio users can update all blueprints" ON public.blueprints
FOR UPDATE TO authenticated
USING (is_studio_user(auth.uid()));

-- BLUEPRINT REFERENCES TABLE: Drop public access policies
DROP POLICY IF EXISTS "Public can view references for submitted blueprints" ON public.blueprint_references;
DROP POLICY IF EXISTS "Users can view references via blueprint session token" ON public.blueprint_references;
DROP POLICY IF EXISTS "Users can insert references via blueprint session token" ON public.blueprint_references;
DROP POLICY IF EXISTS "Users can delete references via blueprint session token" ON public.blueprint_references;

-- Studio users can manage all references
CREATE POLICY "Studio users can manage references" ON public.blueprint_references
FOR ALL TO authenticated
USING (is_studio_user(auth.uid()));

-- Phase 4: Make storage bucket private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'blueprint-uploads';

-- Remove public access storage policies
DROP POLICY IF EXISTS "Anyone can view blueprint uploads" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete their blueprint uploads" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload blueprint files" ON storage.objects;

-- Studio users can access all blueprint uploads
CREATE POLICY "Studio users can access blueprint uploads" ON storage.objects
FOR ALL TO authenticated
USING (
  bucket_id = 'blueprint-uploads' 
  AND is_studio_user(auth.uid())
)
WITH CHECK (
  bucket_id = 'blueprint-uploads' 
  AND is_studio_user(auth.uid())
);