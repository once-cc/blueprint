-- ============================================
-- Blueprint Intake Engine v2 — Phase 1 Migration
-- Artifact tables, scoring, email sequences, bookings
-- ============================================

-- ────────────────────────────────────────────
-- ENUM TYPES
-- ────────────────────────────────────────────

CREATE TYPE public.artifact_type AS ENUM ('contract', 'asset_input', 'pdf');

CREATE TYPE public.email_type AS ENUM ('initial', '24hr', '7day');

CREATE TYPE public.email_status AS ENUM ('pending', 'sent', 'cancelled');

CREATE TYPE public.booking_source AS ENUM ('post-submit', 'email', 'manual');

-- ────────────────────────────────────────────
-- TABLE: blueprint_artifacts
-- Immutable, versioned artifact store
-- ────────────────────────────────────────────

CREATE TABLE public.blueprint_artifacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blueprint_id uuid NOT NULL REFERENCES public.blueprints(id) ON DELETE CASCADE,
  artifact_type public.artifact_type NOT NULL,
  version integer NOT NULL DEFAULT 1,
  payload jsonb,
  file_url text,
  hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),

  -- Enforce unique version per blueprint + artifact type
  CONSTRAINT unique_artifact_version UNIQUE (blueprint_id, artifact_type, version)
);

-- Indexes for fast lookups
CREATE INDEX idx_blueprint_artifacts_blueprint ON public.blueprint_artifacts(blueprint_id);
CREATE INDEX idx_blueprint_artifacts_type ON public.blueprint_artifacts(artifact_type);
CREATE INDEX idx_blueprint_artifacts_hash ON public.blueprint_artifacts(hash);

-- RLS
ALTER TABLE public.blueprint_artifacts ENABLE ROW LEVEL SECURITY;

-- Service role has full access (Edge Functions use service role)
-- No public access
CREATE POLICY "Service role only on blueprint_artifacts"
  ON public.blueprint_artifacts FOR ALL USING (false);

-- Studio users can view all artifacts
CREATE POLICY "Studio users can view artifacts"
  ON public.blueprint_artifacts FOR SELECT TO authenticated
  USING (public.is_studio_user(auth.uid()));

-- ────────────────────────────────────────────
-- TABLE: blueprint_scores
-- Integrity + Complexity scoring
-- ────────────────────────────────────────────

CREATE TABLE public.blueprint_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blueprint_id uuid NOT NULL REFERENCES public.blueprints(id) ON DELETE CASCADE,
  integrity_score integer NOT NULL CHECK (integrity_score >= 0 AND integrity_score <= 100),
  complexity_score integer NOT NULL CHECK (complexity_score >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),

  -- One score row per blueprint (can be extended with version later)
  CONSTRAINT unique_blueprint_score UNIQUE (blueprint_id)
);

CREATE INDEX idx_blueprint_scores_blueprint ON public.blueprint_scores(blueprint_id);
CREATE INDEX idx_blueprint_scores_integrity ON public.blueprint_scores(integrity_score);
CREATE INDEX idx_blueprint_scores_complexity ON public.blueprint_scores(complexity_score);

-- RLS
ALTER TABLE public.blueprint_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only on blueprint_scores"
  ON public.blueprint_scores FOR ALL USING (false);

CREATE POLICY "Studio users can view scores"
  ON public.blueprint_scores FOR SELECT TO authenticated
  USING (public.is_studio_user(auth.uid()));

-- ────────────────────────────────────────────
-- TABLE: email_sequences
-- Automated email scheduling
-- ────────────────────────────────────────────

CREATE TABLE public.email_sequences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blueprint_id uuid NOT NULL REFERENCES public.blueprints(id) ON DELETE CASCADE,
  email_type public.email_type NOT NULL,
  status public.email_status NOT NULL DEFAULT 'pending',
  scheduled_for timestamptz NOT NULL,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),

  -- One sequence entry per email type per blueprint
  CONSTRAINT unique_email_sequence UNIQUE (blueprint_id, email_type)
);

CREATE INDEX idx_email_sequences_blueprint ON public.email_sequences(blueprint_id);
CREATE INDEX idx_email_sequences_status ON public.email_sequences(status);
CREATE INDEX idx_email_sequences_scheduled ON public.email_sequences(scheduled_for);
-- Composite index for the cron polling query
CREATE INDEX idx_email_sequences_pending_due ON public.email_sequences(status, scheduled_for)
  WHERE status = 'pending';

-- RLS
ALTER TABLE public.email_sequences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only on email_sequences"
  ON public.email_sequences FOR ALL USING (false);

CREATE POLICY "Studio users can view email sequences"
  ON public.email_sequences FOR SELECT TO authenticated
  USING (public.is_studio_user(auth.uid()));

CREATE POLICY "Studio users can update email sequences"
  ON public.email_sequences FOR UPDATE TO authenticated
  USING (public.is_studio_user(auth.uid()));

-- ────────────────────────────────────────────
-- TABLE: bookings
-- Booking tracking (Calendly webhook target)
-- ────────────────────────────────────────────

CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blueprint_id uuid REFERENCES public.blueprints(id) ON DELETE SET NULL,
  email text NOT NULL,
  booked_at timestamptz NOT NULL DEFAULT now(),
  source public.booking_source NOT NULL DEFAULT 'manual',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_bookings_blueprint ON public.bookings(blueprint_id);
CREATE INDEX idx_bookings_email ON public.bookings(email);

-- RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only on bookings"
  ON public.bookings FOR ALL USING (false);

CREATE POLICY "Studio users can view bookings"
  ON public.bookings FOR SELECT TO authenticated
  USING (public.is_studio_user(auth.uid()));

CREATE POLICY "Studio users can manage bookings"
  ON public.bookings FOR ALL TO authenticated
  USING (public.is_studio_user(auth.uid()));

-- ────────────────────────────────────────────
-- TABLE: security_events
-- Silent abuse logging
-- ────────────────────────────────────────────

CREATE TABLE public.security_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  ip_address text,
  email text,
  blueprint_id uuid,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_security_events_type ON public.security_events(event_type);
CREATE INDEX idx_security_events_ip ON public.security_events(ip_address);
CREATE INDEX idx_security_events_created ON public.security_events(created_at);

-- RLS: service role only
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only on security_events"
  ON public.security_events FOR ALL USING (false);

CREATE POLICY "Studio users can view security events"
  ON public.security_events FOR SELECT TO authenticated
  USING (public.is_studio_user(auth.uid()));

-- ────────────────────────────────────────────
-- MODIFY: blueprints table
-- Add url_metadata column for Phase 3 prep
-- ────────────────────────────────────────────

ALTER TABLE public.blueprints
  ADD COLUMN IF NOT EXISTS url_metadata jsonb DEFAULT '[]'::jsonb;

-- ────────────────────────────────────────────
-- FUNCTION: get_next_artifact_version
-- Auto-increment version per blueprint + type
-- ────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.get_next_artifact_version(
  _blueprint_id uuid,
  _artifact_type public.artifact_type
) RETURNS integer
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(MAX(version), 0) + 1
  FROM public.blueprint_artifacts
  WHERE blueprint_id = _blueprint_id
    AND artifact_type = _artifact_type
$$;
