# Dashboard Migration — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrate the Studio Dashboard into a standalone Vite + React project at `/projects/dashboard/` with strict boundary enforcement (BFF + HMAC), own Supabase Project B for auth/data, and reporting-only access to Blueprint data via Edge Functions.

**Architecture:** Dashboard UI authenticates users via Project B, calls Project B BFF Edge Functions which validate roles + audit, then call Project A Edge Functions server-to-server via HMAC. Dashboard never touches Blueprint DB directly.

**Tech Stack:** Vite 5, React 18, TypeScript, TailwindCSS, react-router-dom, @tanstack/react-query, Supabase, sonner, lucide-react

---

## Phase 1: Blueprint-Side Edge Functions + Cleanup

### Task 1: Create `get-blueprint-report-snapshot` Edge Function

**Files:**
- Create: `supabase/functions/get-blueprint-report-snapshot/index.ts`
- Modify: `supabase/config.toml` (register function)

**Step 1: Create the Edge Function**

```typescript
// supabase/functions/get-blueprint-report-snapshot/index.ts
// Accepts HMAC-signed requests from Dashboard BFF
// Returns sanitized reporting DTO: submission metadata, scores, email status, booking status, security events
// Uses service role key server-side only
```

Key fields in the reporting DTO:
- `id`, `business_name`, `user_name`, `user_email`, `status`, `created_at`, `submitted_at`
- `integrity_score`, `complexity_score`, `complexity_tier`
- `pdf_url` (signed URL, 10 min expiry)
- `email_sequences` summary
- `bookings` summary
- `security_events` summary (last 20 events)
- `archived_at` (null if active)

HMAC validation: SHA-256 HMAC of `timestamp:body` with shared secret. Reject if timestamp drift > 5 minutes.

**Step 2: Register in config.toml**

Add `[functions.get-blueprint-report-snapshot]` with `verify_jwt = false` (HMAC-authenticated instead).

**Step 3: Verify function deploys locally**

Run: `supabase functions serve get-blueprint-report-snapshot --no-verify-jwt`

---

### Task 2: Create `soft-delete-blueprint` Edge Function (stub)

**Files:**
- Create: `supabase/functions/soft-delete-blueprint/index.ts`
- Modify: `supabase/config.toml`

**Step 1: Create the Edge Function**

Sets `archived_at = now()` on the blueprint. Never hard-deletes.
HMAC-authenticated. Logs action to `security_events` or console.
Returns `{ success: true, archived_at: string }`.

**Step 2: Register in config.toml**

---

### Task 3: Create `resend-email-1` Edge Function (stub)

**Files:**
- Create: `supabase/functions/resend-email-1/index.ts`
- Modify: `supabase/config.toml`

**Step 1: Create the Edge Function**

Re-triggers email 1 for a given blueprint_id. HMAC-authenticated.
Validates blueprint exists and is in `submitted` status.
Returns `{ success: true, email_status: string }`.

**Step 2: Register in config.toml**

---

### Task 4: Create shared HMAC validation utility

**Files:**
- Create: `supabase/functions/_shared/hmac.ts`

**Step 1: Create HMAC helper**

```typescript
// Validates HMAC signature: SHA-256 of `${timestamp}:${body}` with DASHBOARD_HMAC_SECRET
// Rejects if timestamp drift > 300 seconds
// Returns { valid: boolean, error?: string }
```

---

### Task 5: Clean up Blueprint.Configurator

**Files:**
- Delete: `dashboard.html`
- Delete: `src/dashboard-entry.tsx`
- Delete: `src/pages/DashboardAuth.tsx`
- Delete: `vite.dashboard.config.ts`
- Modify: `package.json` (remove `dev:dashboard` script)

**Step 1: Delete intermediate dashboard files**
**Step 2: Remove script from package.json**
**Step 3: Verify main app still builds**

Run: `npm run dev` — should start on port 8080 without errors.

---

## Phase 2: Dashboard Project Scaffold

### Task 6: Create project structure

**Files:**
- Create: `/projects/dashboard/package.json`
- Create: `/projects/dashboard/vite.config.ts`
- Create: `/projects/dashboard/tsconfig.json`
- Create: `/projects/dashboard/tsconfig.app.json`
- Create: `/projects/dashboard/tsconfig.node.json`
- Create: `/projects/dashboard/tailwind.config.ts`
- Create: `/projects/dashboard/postcss.config.js`
- Create: `/projects/dashboard/index.html`
- Create: `/projects/dashboard/.env.example`

**Step 1: Create all config files**

- `package.json`: Vite 5, React 18, TS, TailwindCSS, react-query, react-router-dom, supabase-js, sonner, lucide-react, zod
- `vite.config.ts`: Port 3001, `@/` path alias
- Tailwind: Dark theme design system subset (cinematic dark palette)
- `.env.example`: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_BLUEPRINT_API_URL` (Project A functions URL)

**Step 2: Install dependencies**

Run: `cd /projects/dashboard && npm install`

---

### Task 7: Create app entry + routing + CSS

**Files:**
- Create: `/projects/dashboard/src/main.tsx`
- Create: `/projects/dashboard/src/App.tsx`
- Create: `/projects/dashboard/src/index.css`

**Step 1: Create entry point and router**

Routes: `/` → Dashboard (guarded), `/auth` → Login page, `*` → redirect to `/`
Providers: QueryClientProvider, Toaster (sonner)

**Step 2: Create CSS with dark theme tokens**

Subset of Cleland design system for dashboard context.

---

### Task 8: Create Supabase client + auth hook

**Files:**
- Create: `/projects/dashboard/src/integrations/supabase/client.ts`
- Create: `/projects/dashboard/src/hooks/useAuth.ts`
- Create: `/projects/dashboard/src/types/roles.ts`

**Step 1: Create Supabase client**

Reads from `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (Project B credentials).

**Step 2: Create auth hook with role hierarchy**

Roles: `owner` > `admin` > `viewer`. Exposes `isOwner`, `isAdmin`, `isViewer`, `role` fields.
Queries `dashboard_user_roles` table (Project B).

**Step 3: Create role types**

```typescript
export type DashboardRole = 'owner' | 'admin' | 'viewer';
export const ROLE_HIERARCHY: Record<DashboardRole, number> = { owner: 3, admin: 2, viewer: 1 };
```

---

### Task 9: Create Auth page

**Files:**
- Create: `/projects/dashboard/src/pages/Auth.tsx`

**Step 1: Create sign-in only auth page**

- No sign-up UI (accounts provisioned by owner)
- Email + password form
- Redirects to `/` on success
- Dark theme, Cleland brand marks

---

### Task 10: Create Dashboard page (read-only via BFF)

**Files:**
- Create: `/projects/dashboard/src/pages/Dashboard.tsx`
- Create: `/projects/dashboard/src/services/blueprintApi.ts`
- Create: `/projects/dashboard/src/components/AuthGuard.tsx`

**Step 1: Create BFF API service**

Calls Project B Edge Functions (BFF layer). Initially calls placeholder URL.
Functions: `fetchBlueprintSnapshots()`, `softDeleteBlueprint(id)`, `resendEmail1(id)`

**Step 2: Create AuthGuard component**

Wraps routes, redirects to `/auth` if unauthenticated.

**Step 3: Create Dashboard page**

Migrated from Blueprint.Configurator's Dashboard.tsx but refactored:
- Data comes from `blueprintApi.fetchBlueprintSnapshots()` instead of direct Supabase queries
- Admin/owner actions use BFF endpoints
- Artifact modal shows PDF link from snapshot DTO
- Security events tab (read-only)
- Internal notes + tagging placeholders (stored in Project B)

**Step 4: Verify dev server starts**

Run: `npm run dev` — should start on port 3001.

---

## Phase 3: Documentation

### Task 11: Create ARCHITECTURE.md

**Files:**
- Create: `/projects/dashboard/ARCHITECTURE.md`

Covers: purpose, boundaries, BFF+HMAC auth flow, role hierarchy, mutation policy, what Dashboard must NEVER do.

---

### Task 12: Create ROADMAP.md

**Files:**
- Create: `/projects/dashboard/ROADMAP.md`

Covers: current capabilities, planned features, amendment system, override scoring, Project B schema roadmap.

---

## Phase 4: Project B Schema (Migrations)

### Task 13: Create Project B migration files

**Files:**
- Create: `/projects/dashboard/supabase/migrations/001_initial_schema.sql`
- Create: `/projects/dashboard/supabase/config.toml`

**Step 1: Create schema for dashboard-owned tables**

Tables:
- `dashboard_user_roles` (user_id, role, created_at)
- `internal_notes` (id, blueprint_id, content, author_id, created_at)
- `blueprint_tags` (id, blueprint_id, tag, created_at)
- `studio_overrides` (id, blueprint_id, field, system_value, override_value, comment, author_id, created_at)
- `audit_log` (id, action, actor_id, target_type, target_id, metadata, created_at)

RLS: Users can only read data matching their role level.

---

### Task 14: Create Project B BFF Edge Functions (stubs)

**Files:**
- Create: `/projects/dashboard/supabase/functions/proxy-blueprint-report/index.ts`
- Create: `/projects/dashboard/supabase/functions/proxy-soft-delete/index.ts`
- Create: `/projects/dashboard/supabase/functions/proxy-resend-email/index.ts`
- Create: `/projects/dashboard/supabase/functions/_shared/hmac.ts`

**Step 1: Create BFF functions**

Each:
1. Validates JWT (Project B auth)
2. Checks role from `dashboard_user_roles`
3. Logs to `audit_log`
4. Signs HMAC and calls corresponding Project A Edge Function
5. Returns sanitized result

---
