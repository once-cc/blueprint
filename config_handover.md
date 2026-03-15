# Blueprint Config — Handover for Next Agent

> Context document covering recent changes to `blueprint_config`, outstanding work, and next steps. Written March 15 2026.

---

## Project Overview

| Key | Value |
|-----|-------|
| **Repo** | `once-cc/blueprint` (GitHub) |
| **Supabase Project** | `ovfctbpwclkrbfjjzssj` |
| **Supabase URL** | `https://ovfctbpwclkrbfjjzssj.supabase.co` |
| **Local Path** | `/Users/kingjoshua/Desktop/Cleland.Studios/projects/blueprint_config` |
| **Access Token** | `sbp_bb8d469922612c08d71912b4cd0d22c962e0255c` |

The `blueprint_config` project (a.k.a. "Project A" / "Config") is the **configurator + scoring engine + email pipeline**. It receives user submissions via a public configurator, scores them, generates PDFs, sends emails, and hands submissions off to the Ops Console ("Project B").

---

## Architecture: Two-Project System

```
┌────────────────────────────┐        HMAC Handoff       ┌───────────────────────────┐
│   BLUEPRINT CONFIG (A)     │ ──────────────────────────▶│   OPS CONSOLE (B)         │
│                            │                            │                           │
│  • Configurator frontend   │                            │  • Operator dashboard      │
│  • submit-blueprint EF     │                            │  • receive-blueprint-sub   │
│  • Scoring engine          │                            │  • get-dashboard-snapshot  │
│  • PDF generation          │                            │  • Email override proxy    │
│  • Email 1 (Resend)        │                            │  • Archive proxy           │
│  • Nurture queue           │◀─────── HMAC Proxy ────────│  • proxy-soft-delete       │
│  • Email overrides         │                            │  • proxy-resend-email      │
│  • set-email-override EF   │                            │  • proxy-set-email-override│
│  • process-nurture-queue   │                            │                           │
│  • soft-delete-blueprint   │                            │                           │
│  • resend-email-1          │                            │                           │
└────────────────────────────┘                            └───────────────────────────┘
```

---

## Recent Changes (This Session)

### 1. Complexity Score in Handoff Payload ✅
**File:** `supabase/functions/submit-blueprint/index.ts` (line ~320)

Added `complexity_score: scores.complexity_score` to the HMAC handoff payload sent to Console's `receive-blueprint-submission`. Previously only `integrity_score` was sent, causing complexity to show as `0` in the Console UI.

### 2. Nurture Email Engine — New Functions ✅
Three new edge functions deployed:

| Function | Purpose | Status |
|----------|---------|--------|
| `process-nurture-queue` | Cron-triggered worker that processes pending emails from `nurture_email_queue` | Deployed |
| `set-email-override` | Accepts operator overrides (subject/body/CTA) for pending emails | Deployed |
| `_shared/nurture-renderer.ts` | Renders email bodies using insight data + submission context | Deployed (shared) |
| `_shared/email-summary.ts` | Generates HTML summary cards for emails | Deployed (shared) |
| `_shared/insight-map.ts` | Maps configurator answers to strategic insights | Deployed (shared) |

### 3. Database Migrations Applied ✅

| Migration | Purpose |
|-----------|---------|
| `20260315000000_nurture_email_sequences.sql` | Creates `nurture_email_queue` table + indexes |
| `20260315010000_nurture_cron_schedule.sql` | pg_cron schedule for `process-nurture-queue` |
| `20260315020000_email_override_columns.sql` | Adds `override_subject`, `override_body`, `override_cta_label`, `original_subject`, `original_body` columns to `nurture_email_queue` |

### 4. Config.toml Fix ✅
Corrected `project_id` from `nvbjevpuyxizqpqfftpy` to `ovfctbpwclkrbfjjzssj`.

---

## Edge Functions — Full Inventory

| Function | Auth | Purpose |
|----------|------|---------|
| `submit-blueprint` | CORS (public) | Main submission endpoint. Scores, generates PDF, sends Email 1, HMAC handoff to Console |
| `soft-delete-blueprint` | HMAC from Console | Archives a blueprint (sets `archived_at`) |
| `resend-email-1` | HMAC from Console | Re-triggers Email 1 for a blueprint |
| `set-email-override` | HMAC from Console | Accepts operator overrides for pending nurture emails |
| `process-nurture-queue` | Cron (pg_cron) | Processes pending emails from `nurture_email_queue`, sends via Resend |

---

## DB Schema (Key Tables)

### `blueprints`
Main submissions table. Contains all configurator answers, scoring results, `archived_at` for soft-delete.

### `blueprint_audit_log`
Audit trail for all events (submission, email sent, archived, etc.)

### `nurture_email_queue`
Nurture email pipeline. Each row = one scheduled email.

| Column | Type | Notes |
|--------|------|-------|
| `blueprint_id` | uuid | FK to blueprints |
| `email_number` | int | 1-5 (email sequence position) |
| `status` | text | `pending`, `sent`, `failed`, `cancelled` |
| `scheduled_for` | timestamptz | When to send |
| `override_subject` | text | Operator override (nullable) |
| `override_body` | text | Operator override (nullable) |
| `override_cta_label` | text | Operator override (nullable) |
| `original_subject` | text | System-generated (preserved) |
| `original_body` | text | System-generated (preserved) |

---

## Environment Secrets (Config Supabase)

| Secret | Purpose |
|--------|---------|
| `RESEND_API_KEY` | Resend.com API key for sending emails |
| `BLUEPRINT_HMAC_SECRET` | Shared secret for signing handoffs to Console |
| `OPS_CONSOLE_URL` | Console's Supabase URL for HMAC handoff |
| `SUPABASE_URL` | Auto-set by Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto-set by Supabase |

---

## Outstanding Work / Next Steps

### 1. Complexity Score Verification
The pipeline is wired but needs a **real submission** to verify end-to-end:
- User submits via configurator
- `submit-blueprint` scores and sends `complexity_score` in handoff
- Console `receive-blueprint-submission` stores it
- Console `get-dashboard-snapshot` returns it to UI
- **Expected:** Complexity shows as a real non-zero number in the Console

### 2. Nurture Email Queue Population
Currently `process-nurture-queue` is deployed but the queue needs to be populated. When a submission comes in, `submit-blueprint` should enqueue emails 2-5 into `nurture_email_queue`. This logic may need to be added to the submit flow or triggered separately.

### 3. Email Override End-to-End
The `set-email-override` function is deployed. The Console has a `proxy-set-email-override` BFF function planned but **not yet created**. Required for operators to edit pending emails from the Console UI.

### 4. Email Design Consistency
The initial Email 1 uses a premium "White-Paper Editorial" design (see KI: `cleland_studio_whitepaper_editorial_system`). Nurture emails 2-5 should match this same design. The `nurture-renderer.ts` handles rendering but may need design alignment with the editorial standard.

### 5. Nurture Cron Verification
The `pg_cron` schedule migration was applied. Verify that `cron.schedule` is correctly calling `process-nurture-queue` at the expected interval.

---

## How to Deploy Config Edge Functions

```bash
cd /Users/kingjoshua/Desktop/Cleland.Studios/projects/blueprint_config

# Deploy a specific function
SUPABASE_ACCESS_TOKEN="sbp_bb8d469922612c08d71912b4cd0d22c962e0255c" \
  npx supabase functions deploy <function-name> --project-ref ovfctbpwclkrbfjjzssj

# Example: deploy submit-blueprint
SUPABASE_ACCESS_TOKEN="sbp_bb8d469922612c08d71912b4cd0d22c962e0255c" \
  npx supabase functions deploy submit-blueprint --project-ref ovfctbpwclkrbfjjzssj
```

## How to Apply Migrations

Use the Supabase SQL Editor at:
`https://supabase.com/dashboard/project/ovfctbpwclkrbfjjzssj/sql`

Or via MCP:
```
mcp_supabase-mcp-server_apply_migration(project_id="ovfctbpwclkrbfjjzssj", ...)
```
