CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
BEGIN;

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: activity_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.activity_type AS ENUM (
    'document',
    'message',
    'meeting',
    'milestone',
    'billing',
    'system'
);


--
-- Name: agreement_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.agreement_status AS ENUM (
    'draft',
    'sent',
    'viewed',
    'signed',
    'expired'
);


--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'studio',
    'client'
);


--
-- Name: billing_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.billing_status AS ENUM (
    'draft',
    'sent',
    'paid',
    'overdue',
    'cancelled'
);


--
-- Name: contact_category; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.contact_category AS ENUM (
    'client',
    'studio',
    'supplier'
);


--
-- Name: deliverable_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.deliverable_status AS ENUM (
    'pending',
    'in_progress',
    'review',
    'approved',
    'revision'
);


--
-- Name: document_category; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.document_category AS ENUM (
    'contract',
    'invoice',
    'deliverable',
    'reference',
    'other'
);


--
-- Name: meeting_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.meeting_status AS ENUM (
    'scheduled',
    'confirmed',
    'completed',
    'cancelled',
    'rescheduled'
);


--
-- Name: milestone_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.milestone_status AS ENUM (
    'pending',
    'in_progress',
    'completed',
    'blocked'
);


--
-- Name: project_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.project_role AS ENUM (
    'owner',
    'manager',
    'viewer'
);


--
-- Name: project_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.project_status AS ENUM (
    'active',
    'paused',
    'completed',
    'archived'
);


--
-- Name: stage_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.stage_status AS ENUM (
    'locked',
    'current',
    'completed'
);


--
-- Name: can_write_project(uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.can_write_project(_user_id uuid, _project_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.project_memberships pm
    WHERE pm.user_id = _user_id 
      AND pm.project_id = _project_id 
      AND (pm.role IN ('owner', 'manager') OR public.is_studio_user(_user_id))
  )
$$;


--
-- Name: create_blueprint(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_blueprint() RETURNS TABLE(id uuid, session_token uuid, status text, current_step integer, created_at timestamp with time zone, updated_at timestamp with time zone, discovery jsonb, design jsonb, deliver jsonb, dream_intent text, user_email text, user_name text, business_name text, pdf_url text)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  new_blueprint blueprints;
BEGIN
  INSERT INTO blueprints (status)
  VALUES ('draft')
  RETURNING * INTO new_blueprint;
  
  RETURN QUERY SELECT 
    new_blueprint.id,
    new_blueprint.session_token,
    new_blueprint.status,
    new_blueprint.current_step,
    new_blueprint.created_at,
    new_blueprint.updated_at,
    new_blueprint.discovery,
    new_blueprint.design,
    new_blueprint.deliver,
    new_blueprint.dream_intent,
    new_blueprint.user_email,
    new_blueprint.user_name,
    new_blueprint.business_name,
    new_blueprint.pdf_url;
END;
$$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.email));
  
  -- Default to client role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'client');
  
  RETURN NEW;
END;
$$;


--
-- Name: handle_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;


--
-- Name: is_project_member(uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_project_member(_user_id uuid, _project_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.project_memberships
    WHERE user_id = _user_id
      AND project_id = _project_id
  )
$$;


--
-- Name: is_studio_user(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_studio_user(_user_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT public.has_role(_user_id, 'studio')
$$;


--
-- Name: remap_stage_records(uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.remap_stage_records(_old_stage_id uuid, _new_stage_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  -- Documents
  UPDATE documents SET stage_id = _new_stage_id WHERE stage_id = _old_stage_id;
  
  -- Milestones
  UPDATE milestones SET stage_id = _new_stage_id WHERE stage_id = _old_stage_id;
  
  -- Deliverables
  UPDATE deliverables SET stage_id = _new_stage_id WHERE stage_id = _old_stage_id;
  
  -- Agreements
  UPDATE agreements SET stage_id = _new_stage_id WHERE stage_id = _old_stage_id;
  
  -- Billing Items
  UPDATE billing_items SET stage_id = _new_stage_id WHERE stage_id = _old_stage_id;
  
  -- Meetings
  UPDATE meetings SET stage_id = _new_stage_id WHERE stage_id = _old_stage_id;
  
  -- Meeting Records
  UPDATE meeting_records SET stage_id = _new_stage_id WHERE stage_id = _old_stage_id;
  
  -- Activity Items
  UPDATE activity_items SET stage_id = _new_stage_id WHERE stage_id = _old_stage_id;
  
  -- Feedback Entries
  UPDATE feedback_entries SET stage_id = _new_stage_id WHERE stage_id = _old_stage_id;
  
  -- Message Threads
  UPDATE message_threads SET stage_id = _new_stage_id WHERE stage_id = _old_stage_id;
END;
$$;


--
-- Name: switch_project_template(uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.switch_project_template(_project_id uuid, _new_template_id uuid) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  _old_template_id UUID;
  _old_current_stage_id UUID;
  _old_current_stage_key TEXT;
  _new_current_stage_id UUID;
  _unassigned_stage_id UUID;
  _old_stage RECORD;
  _new_stage RECORD;
  _new_stage_id UUID;
  _key_mapping JSONB := '{}';
  _first_new_stage_id UUID;
BEGIN
  -- Verify caller is studio user
  IF NOT public.is_studio_user(auth.uid()) THEN
    RAISE EXCEPTION 'Only studio users can switch templates';
  END IF;

  -- Get current project info
  SELECT stage_template_id, current_stage_id 
  INTO _old_template_id, _old_current_stage_id
  FROM projects WHERE id = _project_id;
  
  IF _old_template_id IS NULL THEN
    RAISE EXCEPTION 'Project has no template assigned';
  END IF;
  
  IF _old_template_id = _new_template_id THEN
    RETURN jsonb_build_object('success', true, 'message', 'Template unchanged');
  END IF;

  -- Get current stage key for preservation
  IF _old_current_stage_id IS NOT NULL THEN
    SELECT key INTO _old_current_stage_key
    FROM project_stages WHERE id = _old_current_stage_id;
  END IF;

  -- Create new project stages from new template
  FOR _new_stage IN 
    SELECT * FROM stage_template_stages 
    WHERE stage_template_id = _new_template_id 
    ORDER BY sort_order
  LOOP
    INSERT INTO project_stages (
      project_id, template_stage_id, key, name, short_name, 
      description, color, status, sort_order
    ) VALUES (
      _project_id, _new_stage.id, _new_stage.key, _new_stage.name, 
      _new_stage.short_name, _new_stage.description, _new_stage.color, 
      'locked', _new_stage.sort_order
    )
    RETURNING id INTO _new_stage_id;
    
    -- Track first stage for fallback current
    IF _first_new_stage_id IS NULL THEN
      _first_new_stage_id := _new_stage_id;
    END IF;
    
    -- Build key mapping (key -> new stage id)
    _key_mapping := _key_mapping || jsonb_build_object(_new_stage.key, _new_stage_id::text);
  END LOOP;

  -- Determine new current stage (match by key or use first)
  IF _old_current_stage_key IS NOT NULL AND _key_mapping ? _old_current_stage_key THEN
    _new_current_stage_id := (_key_mapping ->> _old_current_stage_key)::UUID;
  ELSE
    _new_current_stage_id := _first_new_stage_id;
  END IF;

  -- Set the current stage status
  IF _new_current_stage_id IS NOT NULL THEN
    UPDATE project_stages SET status = 'current' 
    WHERE id = _new_current_stage_id;
  END IF;

  -- Re-map all stage-linked records from old stages
  FOR _old_stage IN
    SELECT ps.id AS old_id, ps.key 
    FROM project_stages ps
    WHERE ps.project_id = _project_id 
      AND ps.template_stage_id IN (
        SELECT id FROM stage_template_stages WHERE stage_template_id = _old_template_id
      )
  LOOP
    IF _key_mapping ? _old_stage.key THEN
      -- Map to new stage with same key
      PERFORM remap_stage_records(_old_stage.old_id, (_key_mapping ->> _old_stage.key)::UUID);
    ELSE
      -- Create unassigned stage if needed
      IF _unassigned_stage_id IS NULL THEN
        INSERT INTO project_stages (
          project_id, key, name, short_name, description, status, sort_order
        ) VALUES (
          _project_id, 'unassigned', 'Unassigned', 'U', 
          'Items from previous template that could not be mapped.', 'locked', 999
        )
        RETURNING id INTO _unassigned_stage_id;
      END IF;
      
      PERFORM remap_stage_records(_old_stage.old_id, _unassigned_stage_id);
    END IF;
  END LOOP;

  -- Delete old project stages (records have been remapped)
  DELETE FROM project_stages 
  WHERE project_id = _project_id 
    AND template_stage_id IN (
      SELECT id FROM stage_template_stages WHERE stage_template_id = _old_template_id
    );

  -- Update project with new template
  UPDATE projects 
  SET stage_template_id = _new_template_id,
      current_stage_id = _new_current_stage_id,
      updated_at = now()
  WHERE id = _project_id;

  -- Log activity
  INSERT INTO activity_items (
    project_id, type, title, description, metadata
  ) VALUES (
    _project_id, 'system', 'Stage template changed',
    'Project stage template has been updated.',
    jsonb_build_object('old_template_id', _old_template_id, 'new_template_id', _new_template_id)
  );

  RETURN jsonb_build_object(
    'success', true, 
    'new_current_stage_id', _new_current_stage_id,
    'unassigned_created', _unassigned_stage_id IS NOT NULL
  );
END;
$$;


SET default_table_access_method = heap;

--
-- Name: activity_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.activity_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid NOT NULL,
    stage_id uuid,
    type public.activity_type NOT NULL,
    title text NOT NULL,
    description text,
    actor_id uuid,
    actor_name text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: agenda_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.agenda_templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid,
    stage_key text,
    name text NOT NULL,
    description text,
    duration_minutes integer DEFAULT 60 NOT NULL,
    default_agenda_items jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: agreements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.agreements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid NOT NULL,
    stage_id uuid,
    title text NOT NULL,
    type text NOT NULL,
    status public.agreement_status DEFAULT 'draft'::public.agreement_status NOT NULL,
    document_url text,
    sent_at timestamp with time zone,
    viewed_at timestamp with time zone,
    signed_at timestamp with time zone,
    expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: billing_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.billing_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid NOT NULL,
    stage_id uuid,
    description text NOT NULL,
    amount integer NOT NULL,
    currency text DEFAULT 'NZD'::text NOT NULL,
    status public.billing_status DEFAULT 'draft'::public.billing_status NOT NULL,
    due_date date,
    paid_at timestamp with time zone,
    invoice_number text,
    invoice_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: blueprint_references; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.blueprint_references (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    blueprint_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    type text NOT NULL,
    url text NOT NULL,
    filename text,
    notes text,
    storage_path text,
    role text,
    label text,
    CONSTRAINT blueprint_references_type_check CHECK ((type = ANY (ARRAY['image'::text, 'pdf'::text, 'link'::text])))
);


--
-- Name: blueprints; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.blueprints (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    submitted_at timestamp with time zone,
    status text DEFAULT 'draft'::text NOT NULL,
    user_email text,
    user_name text,
    business_name text,
    vision jsonb DEFAULT '{}'::jsonb NOT NULL,
    scope jsonb DEFAULT '{}'::jsonb NOT NULL,
    refinement jsonb DEFAULT '{}'::jsonb NOT NULL,
    pdf_url text,
    current_step integer DEFAULT 1 NOT NULL,
    discovery jsonb DEFAULT '{}'::jsonb NOT NULL,
    dream_intent text,
    design jsonb DEFAULT '{}'::jsonb NOT NULL,
    deliver jsonb DEFAULT '{}'::jsonb NOT NULL,
    session_token uuid DEFAULT gen_random_uuid() NOT NULL,
    CONSTRAINT blueprints_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'submitted'::text, 'generated'::text])))
);


--
-- Name: brief_prompts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.brief_prompts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    section_id uuid NOT NULL,
    key text NOT NULL,
    label text NOT NULL,
    type text DEFAULT 'textarea'::text NOT NULL,
    placeholder text,
    options jsonb,
    required boolean DEFAULT false,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: brief_responses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.brief_responses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    brief_id uuid NOT NULL,
    prompt_id uuid NOT NULL,
    value text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: brief_sections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.brief_sections (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid,
    key text NOT NULL,
    title text NOT NULL,
    description text,
    sort_order integer DEFAULT 0 NOT NULL,
    is_template boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: briefs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.briefs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    is_locked boolean DEFAULT false,
    submitted_at timestamp with time zone,
    approved_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT briefs_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'submitted'::text, 'approved'::text])))
);


--
-- Name: budget_lines; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.budget_lines (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    brief_id uuid NOT NULL,
    item text NOT NULL,
    description text,
    quantity integer DEFAULT 1 NOT NULL,
    unit_cost integer NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: contacts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contacts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid NOT NULL,
    user_id uuid,
    name text NOT NULL,
    role text,
    email text,
    phone text,
    avatar_url text,
    category public.contact_category DEFAULT 'client'::public.contact_category NOT NULL,
    is_primary boolean DEFAULT false,
    tags text[] DEFAULT '{}'::text[],
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: deliverables; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.deliverables (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid NOT NULL,
    stage_id uuid,
    milestone_id uuid,
    title text NOT NULL,
    description text,
    status public.deliverable_status DEFAULT 'pending'::public.deliverable_status NOT NULL,
    due_date date,
    completed_at timestamp with time zone,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.documents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid NOT NULL,
    stage_id uuid,
    title text NOT NULL,
    type text NOT NULL,
    category public.document_category DEFAULT 'other'::public.document_category NOT NULL,
    storage_path text,
    url text,
    file_size integer,
    uploaded_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: feedback_entries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.feedback_entries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid NOT NULL,
    stage_id uuid,
    overall_rating integer,
    overall_reflection text,
    worked_well text,
    could_improve text,
    testimonial text,
    testimonial_permission boolean DEFAULT false,
    would_work_again text,
    additional_comments text,
    submitted_by uuid,
    submitted_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT feedback_entries_overall_rating_check CHECK (((overall_rating >= 1) AND (overall_rating <= 5))),
    CONSTRAINT feedback_entries_would_work_again_check CHECK ((would_work_again = ANY (ARRAY['definitely'::text, 'probably'::text, 'unsure'::text, 'unlikely'::text])))
);


--
-- Name: meeting_attendees; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.meeting_attendees (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    meeting_id uuid NOT NULL,
    contact_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: meeting_records; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.meeting_records (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    meeting_id uuid NOT NULL,
    project_id uuid NOT NULL,
    stage_id uuid,
    summary text,
    notes text,
    action_items jsonb DEFAULT '[]'::jsonb,
    recording_url text,
    transcript_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: meetings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.meetings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid NOT NULL,
    stage_id uuid,
    agenda_template_id uuid,
    title text NOT NULL,
    description text,
    location text,
    meeting_link text,
    starts_at timestamp with time zone NOT NULL,
    ends_at timestamp with time zone NOT NULL,
    status public.meeting_status DEFAULT 'scheduled'::public.meeting_status NOT NULL,
    agenda_items jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: message_threads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.message_threads (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid NOT NULL,
    stage_id uuid,
    subject text NOT NULL,
    is_internal boolean DEFAULT false,
    last_message_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    thread_id uuid NOT NULL,
    sender_id uuid,
    sender_name text,
    content text NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: milestones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.milestones (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid NOT NULL,
    stage_id uuid,
    title text NOT NULL,
    description text,
    status public.milestone_status DEFAULT 'pending'::public.milestone_status NOT NULL,
    due_date date,
    completed_at timestamp with time zone,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    email text NOT NULL,
    display_name text,
    avatar_url text,
    timezone text DEFAULT 'Pacific/Auckland'::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: project_memberships; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_memberships (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid NOT NULL,
    user_id uuid NOT NULL,
    role public.project_role DEFAULT 'viewer'::public.project_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: project_stages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_stages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid NOT NULL,
    template_stage_id uuid,
    key text NOT NULL,
    name text NOT NULL,
    short_name text NOT NULL,
    description text,
    color text,
    status public.stage_status DEFAULT 'locked'::public.stage_status NOT NULL,
    sort_order integer NOT NULL,
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: projects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.projects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    stage_template_id uuid,
    current_stage_id uuid,
    status public.project_status DEFAULT 'active'::public.project_status NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: stage_template_stages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stage_template_stages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    stage_template_id uuid NOT NULL,
    key text NOT NULL,
    name text NOT NULL,
    short_name text NOT NULL,
    description text,
    color text,
    sort_order integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: stage_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stage_templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    is_default boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: activity_items activity_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_items
    ADD CONSTRAINT activity_items_pkey PRIMARY KEY (id);


--
-- Name: agenda_templates agenda_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agenda_templates
    ADD CONSTRAINT agenda_templates_pkey PRIMARY KEY (id);


--
-- Name: agreements agreements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agreements
    ADD CONSTRAINT agreements_pkey PRIMARY KEY (id);


--
-- Name: billing_items billing_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.billing_items
    ADD CONSTRAINT billing_items_pkey PRIMARY KEY (id);


--
-- Name: blueprint_references blueprint_references_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blueprint_references
    ADD CONSTRAINT blueprint_references_pkey PRIMARY KEY (id);


--
-- Name: blueprints blueprints_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blueprints
    ADD CONSTRAINT blueprints_pkey PRIMARY KEY (id);


--
-- Name: brief_prompts brief_prompts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brief_prompts
    ADD CONSTRAINT brief_prompts_pkey PRIMARY KEY (id);


--
-- Name: brief_responses brief_responses_brief_id_prompt_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brief_responses
    ADD CONSTRAINT brief_responses_brief_id_prompt_id_key UNIQUE (brief_id, prompt_id);


--
-- Name: brief_responses brief_responses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brief_responses
    ADD CONSTRAINT brief_responses_pkey PRIMARY KEY (id);


--
-- Name: brief_sections brief_sections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brief_sections
    ADD CONSTRAINT brief_sections_pkey PRIMARY KEY (id);


--
-- Name: briefs briefs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.briefs
    ADD CONSTRAINT briefs_pkey PRIMARY KEY (id);


--
-- Name: budget_lines budget_lines_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.budget_lines
    ADD CONSTRAINT budget_lines_pkey PRIMARY KEY (id);


--
-- Name: contacts contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contacts
    ADD CONSTRAINT contacts_pkey PRIMARY KEY (id);


--
-- Name: deliverables deliverables_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deliverables
    ADD CONSTRAINT deliverables_pkey PRIMARY KEY (id);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- Name: feedback_entries feedback_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feedback_entries
    ADD CONSTRAINT feedback_entries_pkey PRIMARY KEY (id);


--
-- Name: meeting_attendees meeting_attendees_meeting_id_contact_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting_attendees
    ADD CONSTRAINT meeting_attendees_meeting_id_contact_id_key UNIQUE (meeting_id, contact_id);


--
-- Name: meeting_attendees meeting_attendees_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting_attendees
    ADD CONSTRAINT meeting_attendees_pkey PRIMARY KEY (id);


--
-- Name: meeting_records meeting_records_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting_records
    ADD CONSTRAINT meeting_records_pkey PRIMARY KEY (id);


--
-- Name: meetings meetings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meetings
    ADD CONSTRAINT meetings_pkey PRIMARY KEY (id);


--
-- Name: message_threads message_threads_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_threads
    ADD CONSTRAINT message_threads_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: milestones milestones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.milestones
    ADD CONSTRAINT milestones_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: project_memberships project_memberships_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_memberships
    ADD CONSTRAINT project_memberships_pkey PRIMARY KEY (id);


--
-- Name: project_memberships project_memberships_project_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_memberships
    ADD CONSTRAINT project_memberships_project_id_user_id_key UNIQUE (project_id, user_id);


--
-- Name: project_stages project_stages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_stages
    ADD CONSTRAINT project_stages_pkey PRIMARY KEY (id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: stage_template_stages stage_template_stages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stage_template_stages
    ADD CONSTRAINT stage_template_stages_pkey PRIMARY KEY (id);


--
-- Name: stage_templates stage_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stage_templates
    ADD CONSTRAINT stage_templates_pkey PRIMARY KEY (id);


--
-- Name: stage_template_stages unique_template_stage_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stage_template_stages
    ADD CONSTRAINT unique_template_stage_key UNIQUE (stage_template_id, key);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: idx_activity_items_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activity_items_created_at ON public.activity_items USING btree (created_at DESC);


--
-- Name: idx_activity_items_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activity_items_project_id ON public.activity_items USING btree (project_id);


--
-- Name: idx_agreements_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_agreements_project_id ON public.agreements USING btree (project_id);


--
-- Name: idx_billing_items_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_billing_items_project_id ON public.billing_items USING btree (project_id);


--
-- Name: idx_blueprints_session_token; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_blueprints_session_token ON public.blueprints USING btree (session_token);


--
-- Name: idx_deliverables_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_deliverables_project_id ON public.deliverables USING btree (project_id);


--
-- Name: idx_documents_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_documents_project_id ON public.documents USING btree (project_id);


--
-- Name: idx_documents_stage_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_documents_stage_id ON public.documents USING btree (stage_id);


--
-- Name: idx_meetings_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_meetings_project_id ON public.meetings USING btree (project_id);


--
-- Name: idx_messages_thread_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_messages_thread_id ON public.messages USING btree (thread_id);


--
-- Name: idx_milestones_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_milestones_project_id ON public.milestones USING btree (project_id);


--
-- Name: idx_project_memberships_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_project_memberships_project_id ON public.project_memberships USING btree (project_id);


--
-- Name: idx_project_memberships_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_project_memberships_user_id ON public.project_memberships USING btree (user_id);


--
-- Name: idx_project_stages_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_project_stages_project_id ON public.project_stages USING btree (project_id);


--
-- Name: idx_user_roles_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_roles_user_id ON public.user_roles USING btree (user_id);


--
-- Name: stage_templates handle_stage_templates_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER handle_stage_templates_updated_at BEFORE UPDATE ON public.stage_templates FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: agreements update_agreements_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_agreements_updated_at BEFORE UPDATE ON public.agreements FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: billing_items update_billing_items_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_billing_items_updated_at BEFORE UPDATE ON public.billing_items FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: blueprints update_blueprints_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_blueprints_updated_at BEFORE UPDATE ON public.blueprints FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: brief_responses update_brief_responses_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_brief_responses_updated_at BEFORE UPDATE ON public.brief_responses FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: briefs update_briefs_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_briefs_updated_at BEFORE UPDATE ON public.briefs FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: contacts update_contacts_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON public.contacts FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: deliverables update_deliverables_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_deliverables_updated_at BEFORE UPDATE ON public.deliverables FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: documents update_documents_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: feedback_entries update_feedback_entries_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_feedback_entries_updated_at BEFORE UPDATE ON public.feedback_entries FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: meeting_records update_meeting_records_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_meeting_records_updated_at BEFORE UPDATE ON public.meeting_records FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: meetings update_meetings_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_meetings_updated_at BEFORE UPDATE ON public.meetings FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: message_threads update_message_threads_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_message_threads_updated_at BEFORE UPDATE ON public.message_threads FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: milestones update_milestones_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_milestones_updated_at BEFORE UPDATE ON public.milestones FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: project_stages update_project_stages_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_project_stages_updated_at BEFORE UPDATE ON public.project_stages FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: projects update_projects_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- Name: activity_items activity_items_actor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_items
    ADD CONSTRAINT activity_items_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: activity_items activity_items_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_items
    ADD CONSTRAINT activity_items_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: activity_items activity_items_stage_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_items
    ADD CONSTRAINT activity_items_stage_id_fkey FOREIGN KEY (stage_id) REFERENCES public.project_stages(id) ON DELETE SET NULL;


--
-- Name: agenda_templates agenda_templates_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agenda_templates
    ADD CONSTRAINT agenda_templates_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: agreements agreements_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agreements
    ADD CONSTRAINT agreements_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: agreements agreements_stage_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agreements
    ADD CONSTRAINT agreements_stage_id_fkey FOREIGN KEY (stage_id) REFERENCES public.project_stages(id) ON DELETE SET NULL;


--
-- Name: billing_items billing_items_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.billing_items
    ADD CONSTRAINT billing_items_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: billing_items billing_items_stage_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.billing_items
    ADD CONSTRAINT billing_items_stage_id_fkey FOREIGN KEY (stage_id) REFERENCES public.project_stages(id) ON DELETE SET NULL;


--
-- Name: blueprint_references blueprint_references_blueprint_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blueprint_references
    ADD CONSTRAINT blueprint_references_blueprint_id_fkey FOREIGN KEY (blueprint_id) REFERENCES public.blueprints(id) ON DELETE CASCADE;


--
-- Name: brief_prompts brief_prompts_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brief_prompts
    ADD CONSTRAINT brief_prompts_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.brief_sections(id) ON DELETE CASCADE;


--
-- Name: brief_responses brief_responses_brief_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brief_responses
    ADD CONSTRAINT brief_responses_brief_id_fkey FOREIGN KEY (brief_id) REFERENCES public.briefs(id) ON DELETE CASCADE;


--
-- Name: brief_responses brief_responses_prompt_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brief_responses
    ADD CONSTRAINT brief_responses_prompt_id_fkey FOREIGN KEY (prompt_id) REFERENCES public.brief_prompts(id) ON DELETE CASCADE;


--
-- Name: brief_sections brief_sections_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.brief_sections
    ADD CONSTRAINT brief_sections_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: briefs briefs_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.briefs
    ADD CONSTRAINT briefs_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: budget_lines budget_lines_brief_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.budget_lines
    ADD CONSTRAINT budget_lines_brief_id_fkey FOREIGN KEY (brief_id) REFERENCES public.briefs(id) ON DELETE CASCADE;


--
-- Name: contacts contacts_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contacts
    ADD CONSTRAINT contacts_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: contacts contacts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contacts
    ADD CONSTRAINT contacts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: deliverables deliverables_milestone_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deliverables
    ADD CONSTRAINT deliverables_milestone_id_fkey FOREIGN KEY (milestone_id) REFERENCES public.milestones(id) ON DELETE SET NULL;


--
-- Name: deliverables deliverables_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deliverables
    ADD CONSTRAINT deliverables_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: deliverables deliverables_stage_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deliverables
    ADD CONSTRAINT deliverables_stage_id_fkey FOREIGN KEY (stage_id) REFERENCES public.project_stages(id) ON DELETE SET NULL;


--
-- Name: documents documents_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: documents documents_stage_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_stage_id_fkey FOREIGN KEY (stage_id) REFERENCES public.project_stages(id) ON DELETE SET NULL;


--
-- Name: documents documents_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: feedback_entries feedback_entries_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feedback_entries
    ADD CONSTRAINT feedback_entries_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: feedback_entries feedback_entries_stage_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feedback_entries
    ADD CONSTRAINT feedback_entries_stage_id_fkey FOREIGN KEY (stage_id) REFERENCES public.project_stages(id) ON DELETE SET NULL;


--
-- Name: feedback_entries feedback_entries_submitted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.feedback_entries
    ADD CONSTRAINT feedback_entries_submitted_by_fkey FOREIGN KEY (submitted_by) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: projects fk_projects_current_stage; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT fk_projects_current_stage FOREIGN KEY (current_stage_id) REFERENCES public.project_stages(id);


--
-- Name: meeting_attendees meeting_attendees_contact_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting_attendees
    ADD CONSTRAINT meeting_attendees_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES public.contacts(id) ON DELETE CASCADE;


--
-- Name: meeting_attendees meeting_attendees_meeting_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting_attendees
    ADD CONSTRAINT meeting_attendees_meeting_id_fkey FOREIGN KEY (meeting_id) REFERENCES public.meetings(id) ON DELETE CASCADE;


--
-- Name: meeting_records meeting_records_meeting_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting_records
    ADD CONSTRAINT meeting_records_meeting_id_fkey FOREIGN KEY (meeting_id) REFERENCES public.meetings(id) ON DELETE CASCADE;


--
-- Name: meeting_records meeting_records_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting_records
    ADD CONSTRAINT meeting_records_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: meeting_records meeting_records_stage_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meeting_records
    ADD CONSTRAINT meeting_records_stage_id_fkey FOREIGN KEY (stage_id) REFERENCES public.project_stages(id) ON DELETE SET NULL;


--
-- Name: meetings meetings_agenda_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meetings
    ADD CONSTRAINT meetings_agenda_template_id_fkey FOREIGN KEY (agenda_template_id) REFERENCES public.agenda_templates(id) ON DELETE SET NULL;


--
-- Name: meetings meetings_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meetings
    ADD CONSTRAINT meetings_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: meetings meetings_stage_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meetings
    ADD CONSTRAINT meetings_stage_id_fkey FOREIGN KEY (stage_id) REFERENCES public.project_stages(id) ON DELETE SET NULL;


--
-- Name: message_threads message_threads_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_threads
    ADD CONSTRAINT message_threads_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: message_threads message_threads_stage_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.message_threads
    ADD CONSTRAINT message_threads_stage_id_fkey FOREIGN KEY (stage_id) REFERENCES public.project_stages(id) ON DELETE SET NULL;


--
-- Name: messages messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: messages messages_thread_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_thread_id_fkey FOREIGN KEY (thread_id) REFERENCES public.message_threads(id) ON DELETE CASCADE;


--
-- Name: milestones milestones_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.milestones
    ADD CONSTRAINT milestones_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: milestones milestones_stage_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.milestones
    ADD CONSTRAINT milestones_stage_id_fkey FOREIGN KEY (stage_id) REFERENCES public.project_stages(id) ON DELETE SET NULL;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: project_memberships project_memberships_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_memberships
    ADD CONSTRAINT project_memberships_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: project_memberships project_memberships_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_memberships
    ADD CONSTRAINT project_memberships_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: project_stages project_stages_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_stages
    ADD CONSTRAINT project_stages_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: project_stages project_stages_template_stage_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_stages
    ADD CONSTRAINT project_stages_template_stage_id_fkey FOREIGN KEY (template_stage_id) REFERENCES public.stage_template_stages(id);


--
-- Name: projects projects_stage_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_stage_template_id_fkey FOREIGN KEY (stage_template_id) REFERENCES public.stage_templates(id);


--
-- Name: stage_template_stages stage_template_stages_stage_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stage_template_stages
    ADD CONSTRAINT stage_template_stages_stage_template_id_fkey FOREIGN KEY (stage_template_id) REFERENCES public.stage_templates(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: blueprints Anyone can create draft blueprints; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can create draft blueprints" ON public.blueprints FOR INSERT WITH CHECK ((status = 'draft'::text));


--
-- Name: stage_templates Anyone can view stage templates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view stage templates" ON public.stage_templates FOR SELECT TO authenticated USING (true);


--
-- Name: stage_template_stages Anyone can view template stages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view template stages" ON public.stage_template_stages FOR SELECT TO authenticated USING (true);


--
-- Name: agenda_templates Authenticated users can view agenda templates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view agenda templates" ON public.agenda_templates FOR SELECT TO authenticated USING (((project_id IS NULL) OR public.is_project_member(auth.uid(), project_id)));


--
-- Name: brief_prompts Authenticated users can view brief prompts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view brief prompts" ON public.brief_prompts FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.brief_sections bs
  WHERE ((bs.id = brief_prompts.section_id) AND ((bs.is_template = true) OR (bs.project_id IS NULL) OR public.is_project_member(auth.uid(), bs.project_id))))));


--
-- Name: brief_sections Authenticated users can view brief sections; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view brief sections" ON public.brief_sections FOR SELECT TO authenticated USING (((is_template = true) OR (project_id IS NULL) OR public.is_project_member(auth.uid(), project_id)));


--
-- Name: feedback_entries Feedback submitter can update own feedback; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Feedback submitter can update own feedback" ON public.feedback_entries FOR UPDATE TO authenticated USING (((submitted_by = auth.uid()) OR public.is_studio_user(auth.uid())));


--
-- Name: activity_items Project members can create activity; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Project members can create activity" ON public.activity_items FOR INSERT TO authenticated WITH CHECK (public.is_project_member(auth.uid(), project_id));


--
-- Name: message_threads Project members can create message threads; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Project members can create message threads" ON public.message_threads FOR INSERT TO authenticated WITH CHECK (public.is_project_member(auth.uid(), project_id));


--
-- Name: messages Project members can create messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Project members can create messages" ON public.messages FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.message_threads mt
  WHERE ((mt.id = messages.thread_id) AND public.is_project_member(auth.uid(), mt.project_id)))));


--
-- Name: brief_responses Project members can manage brief responses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Project members can manage brief responses" ON public.brief_responses TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.briefs b
  WHERE ((b.id = brief_responses.brief_id) AND public.is_project_member(auth.uid(), b.project_id)))));


--
-- Name: briefs Project members can manage briefs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Project members can manage briefs" ON public.briefs TO authenticated USING (public.is_project_member(auth.uid(), project_id));


--
-- Name: feedback_entries Project members can submit feedback; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Project members can submit feedback" ON public.feedback_entries FOR INSERT TO authenticated WITH CHECK (public.is_project_member(auth.uid(), project_id));


--
-- Name: activity_items Project members can view activity; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Project members can view activity" ON public.activity_items FOR SELECT TO authenticated USING (public.is_project_member(auth.uid(), project_id));


--
-- Name: agreements Project members can view agreements; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Project members can view agreements" ON public.agreements FOR SELECT TO authenticated USING (public.is_project_member(auth.uid(), project_id));


--
-- Name: billing_items Project members can view billing items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Project members can view billing items" ON public.billing_items FOR SELECT TO authenticated USING (public.is_project_member(auth.uid(), project_id));


--
-- Name: brief_responses Project members can view brief responses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Project members can view brief responses" ON public.brief_responses FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.briefs b
  WHERE ((b.id = brief_responses.brief_id) AND public.is_project_member(auth.uid(), b.project_id)))));


--
-- Name: briefs Project members can view briefs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Project members can view briefs" ON public.briefs FOR SELECT TO authenticated USING (public.is_project_member(auth.uid(), project_id));


--
-- Name: budget_lines Project members can view budget lines; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Project members can view budget lines" ON public.budget_lines FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.briefs b
  WHERE ((b.id = budget_lines.brief_id) AND public.is_project_member(auth.uid(), b.project_id)))));


--
-- Name: contacts Project members can view contacts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Project members can view contacts" ON public.contacts FOR SELECT TO authenticated USING (public.is_project_member(auth.uid(), project_id));


--
-- Name: deliverables Project members can view deliverables; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Project members can view deliverables" ON public.deliverables FOR SELECT TO authenticated USING (public.is_project_member(auth.uid(), project_id));


--
-- Name: documents Project members can view documents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Project members can view documents" ON public.documents FOR SELECT TO authenticated USING (public.is_project_member(auth.uid(), project_id));


--
-- Name: feedback_entries Project members can view feedback; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Project members can view feedback" ON public.feedback_entries FOR SELECT TO authenticated USING (public.is_project_member(auth.uid(), project_id));


--
-- Name: meeting_attendees Project members can view meeting attendees; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Project members can view meeting attendees" ON public.meeting_attendees FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.meetings m
  WHERE ((m.id = meeting_attendees.meeting_id) AND public.is_project_member(auth.uid(), m.project_id)))));


--
-- Name: meeting_records Project members can view meeting records; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Project members can view meeting records" ON public.meeting_records FOR SELECT TO authenticated USING (public.is_project_member(auth.uid(), project_id));


--
-- Name: meetings Project members can view meetings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Project members can view meetings" ON public.meetings FOR SELECT TO authenticated USING (public.is_project_member(auth.uid(), project_id));


--
-- Name: project_memberships Project members can view memberships; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Project members can view memberships" ON public.project_memberships FOR SELECT TO authenticated USING (public.is_project_member(auth.uid(), project_id));


--
-- Name: message_threads Project members can view message threads; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Project members can view message threads" ON public.message_threads FOR SELECT TO authenticated USING ((public.is_project_member(auth.uid(), project_id) AND ((is_internal = false) OR public.is_studio_user(auth.uid()))));


--
-- Name: messages Project members can view messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Project members can view messages" ON public.messages FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.message_threads mt
  WHERE ((mt.id = messages.thread_id) AND public.is_project_member(auth.uid(), mt.project_id) AND ((mt.is_internal = false) OR public.is_studio_user(auth.uid()))))));


--
-- Name: milestones Project members can view milestones; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Project members can view milestones" ON public.milestones FOR SELECT TO authenticated USING (public.is_project_member(auth.uid(), project_id));


--
-- Name: project_stages Project members can view project stages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Project members can view project stages" ON public.project_stages FOR SELECT TO authenticated USING (public.is_project_member(auth.uid(), project_id));


--
-- Name: projects Project members can view projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Project members can view projects" ON public.projects FOR SELECT TO authenticated USING (public.is_project_member(auth.uid(), id));


--
-- Name: agenda_templates Project writers can manage agenda templates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Project writers can manage agenda templates" ON public.agenda_templates TO authenticated USING ((((project_id IS NULL) AND public.is_studio_user(auth.uid())) OR public.can_write_project(auth.uid(), project_id)));


--
-- Name: agreements Project writers can manage agreements; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Project writers can manage agreements" ON public.agreements TO authenticated USING (public.can_write_project(auth.uid(), project_id));


--
-- Name: billing_items Project writers can manage billing items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Project writers can manage billing items" ON public.billing_items TO authenticated USING (public.can_write_project(auth.uid(), project_id));


--
-- Name: budget_lines Project writers can manage budget lines; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Project writers can manage budget lines" ON public.budget_lines TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.briefs b
  WHERE ((b.id = budget_lines.brief_id) AND public.can_write_project(auth.uid(), b.project_id)))));


--
-- Name: contacts Project writers can manage contacts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Project writers can manage contacts" ON public.contacts TO authenticated USING (public.can_write_project(auth.uid(), project_id));


--
-- Name: deliverables Project writers can manage deliverables; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Project writers can manage deliverables" ON public.deliverables TO authenticated USING (public.can_write_project(auth.uid(), project_id));


--
-- Name: documents Project writers can manage documents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Project writers can manage documents" ON public.documents TO authenticated USING (public.can_write_project(auth.uid(), project_id));


--
-- Name: meeting_attendees Project writers can manage meeting attendees; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Project writers can manage meeting attendees" ON public.meeting_attendees TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.meetings m
  WHERE ((m.id = meeting_attendees.meeting_id) AND public.can_write_project(auth.uid(), m.project_id)))));


--
-- Name: meeting_records Project writers can manage meeting records; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Project writers can manage meeting records" ON public.meeting_records TO authenticated USING (public.can_write_project(auth.uid(), project_id));


--
-- Name: meetings Project writers can manage meetings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Project writers can manage meetings" ON public.meetings TO authenticated USING (public.can_write_project(auth.uid(), project_id));


--
-- Name: milestones Project writers can manage milestones; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Project writers can manage milestones" ON public.milestones TO authenticated USING (public.can_write_project(auth.uid(), project_id));


--
-- Name: project_stages Project writers can update project stages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Project writers can update project stages" ON public.project_stages FOR UPDATE TO authenticated USING (public.can_write_project(auth.uid(), project_id));


--
-- Name: projects Project writers can update projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Project writers can update projects" ON public.projects FOR UPDATE TO authenticated USING (public.can_write_project(auth.uid(), id));


--
-- Name: projects Studio users can create projects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Studio users can create projects" ON public.projects FOR INSERT TO authenticated WITH CHECK (public.is_studio_user(auth.uid()));


--
-- Name: project_memberships Studio users can manage memberships; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Studio users can manage memberships" ON public.project_memberships TO authenticated USING (public.is_studio_user(auth.uid()));


--
-- Name: stage_templates Studio users can manage stage templates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Studio users can manage stage templates" ON public.stage_templates TO authenticated USING (public.is_studio_user(auth.uid())) WITH CHECK (public.is_studio_user(auth.uid()));


--
-- Name: stage_template_stages Studio users can manage template stages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Studio users can manage template stages" ON public.stage_template_stages TO authenticated USING (public.is_studio_user(auth.uid())) WITH CHECK (public.is_studio_user(auth.uid()));


--
-- Name: blueprint_references Users can delete references via blueprint session token; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete references via blueprint session token" ON public.blueprint_references FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.blueprints b
  WHERE ((b.id = blueprint_references.blueprint_id) AND (((b.session_token)::text = COALESCE(((current_setting('request.headers'::text, true))::json ->> 'x-blueprint-token'::text), ''::text)) OR ((auth.uid() IS NOT NULL) AND public.is_studio_user(auth.uid())))))));


--
-- Name: blueprint_references Users can insert references via blueprint session token; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert references via blueprint session token" ON public.blueprint_references FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.blueprints b
  WHERE ((b.id = blueprint_references.blueprint_id) AND (((b.session_token)::text = COALESCE(((current_setting('request.headers'::text, true))::json ->> 'x-blueprint-token'::text), ''::text)) OR ((auth.uid() IS NOT NULL) AND public.is_studio_user(auth.uid())))))));


--
-- Name: blueprints Users can update own blueprint via session token; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own blueprint via session token" ON public.blueprints FOR UPDATE USING ((((session_token)::text = COALESCE(((current_setting('request.headers'::text, true))::json ->> 'x-blueprint-token'::text), ''::text)) OR ((auth.uid() IS NOT NULL) AND public.is_studio_user(auth.uid()))));


--
-- Name: profiles Users can update own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING ((id = auth.uid()));


--
-- Name: blueprints Users can view own blueprint via session token; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own blueprint via session token" ON public.blueprints FOR SELECT USING ((((session_token)::text = COALESCE(((current_setting('request.headers'::text, true))::json ->> 'x-blueprint-token'::text), ''::text)) OR ((auth.uid() IS NOT NULL) AND public.is_studio_user(auth.uid()))));


--
-- Name: profiles Users can view own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING ((id = auth.uid()));


--
-- Name: user_roles Users can view own roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING ((user_id = auth.uid()));


--
-- Name: blueprint_references Users can view references via blueprint session token; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view references via blueprint session token" ON public.blueprint_references FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.blueprints b
  WHERE ((b.id = blueprint_references.blueprint_id) AND (((b.session_token)::text = COALESCE(((current_setting('request.headers'::text, true))::json ->> 'x-blueprint-token'::text), ''::text)) OR ((auth.uid() IS NOT NULL) AND public.is_studio_user(auth.uid())))))));


--
-- Name: activity_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.activity_items ENABLE ROW LEVEL SECURITY;

--
-- Name: agenda_templates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.agenda_templates ENABLE ROW LEVEL SECURITY;

--
-- Name: agreements; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.agreements ENABLE ROW LEVEL SECURITY;

--
-- Name: billing_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.billing_items ENABLE ROW LEVEL SECURITY;

--
-- Name: blueprint_references; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.blueprint_references ENABLE ROW LEVEL SECURITY;

--
-- Name: blueprints; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.blueprints ENABLE ROW LEVEL SECURITY;

--
-- Name: brief_prompts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.brief_prompts ENABLE ROW LEVEL SECURITY;

--
-- Name: brief_responses; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.brief_responses ENABLE ROW LEVEL SECURITY;

--
-- Name: brief_sections; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.brief_sections ENABLE ROW LEVEL SECURITY;

--
-- Name: briefs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.briefs ENABLE ROW LEVEL SECURITY;

--
-- Name: budget_lines; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.budget_lines ENABLE ROW LEVEL SECURITY;

--
-- Name: contacts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

--
-- Name: deliverables; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.deliverables ENABLE ROW LEVEL SECURITY;

--
-- Name: documents; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

--
-- Name: feedback_entries; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.feedback_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: meeting_attendees; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.meeting_attendees ENABLE ROW LEVEL SECURITY;

--
-- Name: meeting_records; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.meeting_records ENABLE ROW LEVEL SECURITY;

--
-- Name: meetings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

--
-- Name: message_threads; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.message_threads ENABLE ROW LEVEL SECURITY;

--
-- Name: messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: milestones; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: project_memberships; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.project_memberships ENABLE ROW LEVEL SECURITY;

--
-- Name: project_stages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.project_stages ENABLE ROW LEVEL SECURITY;

--
-- Name: projects; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

--
-- Name: stage_template_stages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.stage_template_stages ENABLE ROW LEVEL SECURITY;

--
-- Name: stage_templates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.stage_templates ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--




COMMIT;