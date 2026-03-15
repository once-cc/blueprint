# Handover: Fix `get-submission-detail` — Detail Data Not Loading

## Activation Prompt

> Read the skills at `@/.agent/skills/backend-architect/SKILL.md` and `@/.agent/skills/audit-pro.md`, then read this handover document at `@detail_endpoint_handover.md`. Fix the broken `get-submission-detail` edge function on the Console project. The Artifacts tab and Overview tab both show "No detail data available" — the entire detail object is null. The edge function was recently redeployed and is now broken. Do NOT use the browser — debug via direct curl tests, edge function logs, and code inspection only.

---

## The Problem

After redeploying `get-submission-detail` on the **Console Supabase project** (`ipomygtomouybmnwmbic`), the entire submission detail endpoint is broken. When you click any submission in `ops.cleland.studio`, the drawer shows:
- **Overview tab**: Client info + Scores load (from list data), but Blueprint Summary is missing (from detail data)
- **Artifacts tab**: "No detail data available"
- The `detail` object in `SubmissionDrawer.tsx` is `null` — meaning the `callBFF` call to `get-submission-detail` is either erroring or returning data that fails Zod validation

## Architecture

Two Supabase projects:
1. **Config** (`ovfctbpwclkrbfjjzssj`) — stores blueprints, generates PDFs, handles nurture emails
2. **Console** (`ipomygtomouybmnwmbic`) — the ops dashboard, BFF edge functions, frontend on Vercel

**Data flow for detail:**
```
Frontend (Vercel) → callBFF("get-submission-detail") → Console EF → HMAC → Config EF (get-blueprint-report-snapshot) → response
                                                                  → also fetches nurture status from Config
                                                                  → enriches with Console DB data (notes, tags, overrides, dashboard_submission_state)
                                                                  → Zod validation via SubmissionDetailSchema
```

## What Changed (Root Cause Candidates)

### Change 1: `get-submission-detail` artifacts initialization (PRIME SUSPECT)
**File**: `ops_console/supabase/functions/get-submission-detail/index.ts` (lines 133-145)

**Before** (working):
```ts
if (local?.pdf_url && enrichedData.artifacts?.latest) {
    if (!enrichedData.artifacts.latest.pdf?.url) {
        enrichedData.artifacts.latest.pdf = { version: 1, url: local.pdf_url };
    }
}
```

**After** (broken):
```ts
const pdfUrlSource = local?.pdf_url || enrichedData.artifacts?.latest?.pdf?.url;
if (pdfUrlSource) {
    if (!enrichedData.artifacts) enrichedData.artifacts = {};
    if (!enrichedData.artifacts.latest) enrichedData.artifacts.latest = {};
    if (!enrichedData.artifacts.latest.pdf?.url) {
        enrichedData.artifacts.latest.pdf = {
            version: enrichedData.artifacts.latest.pdf?.version || 1,
            url: pdfUrlSource,
        };
    }
}
```

This initializes `artifacts = {}` and `artifacts.latest = {}` when they don't exist. The Zod schema expects `artifacts.latest.contract` and `artifacts.latest.assetFactoryInput` — but these won't exist with the bare `{}`. However, the schema has `.default()` values so this SHOULD be fine.

### Change 2: Deploy flag
First deploy was `npx supabase functions deploy get-submission-detail --project-ref ipomygtomouybmnwmbic` (without `--no-verify-jwt`). Second deploy added `--no-verify-jwt`. Still broken after second deploy.

### Change 3: OverviewTab PDF removal
Removed the PDF quick-access `<section>` from `OverviewTab.tsx`. This is purely UI — won't affect detail loading.

## Key Files to Inspect

### Console Project (`ops_console/`)
| File | Purpose |
|------|---------|
| `supabase/functions/get-submission-detail/index.ts` | **THE BROKEN EDGE FUNCTION** — deployed to `ipomygtomouybmnwmbic` |
| `supabase/functions/_shared/auth.ts` | JWT auth + HMAC signing for outbound calls |
| `supabase/functions/_shared/hmac.ts` | HMAC signing utility |
| `src/services/bff/client.ts` | `callBFF()` — makes the fetch + Zod validation |
| `src/services/bff/schemas.ts` | `SubmissionDetailSchema` — Zod schema that validates the response |
| `src/services/bff/reporting.ts` | `getSubmissionDetailBFF()` — calls `callBFF("get-submission-detail")` |
| `src/components/drawer/SubmissionDrawer.tsx` | Uses `api.getSubmissionDetail()` — sets `detail = null` on error |

### Config Project (`blueprint_config/`)
| File | Purpose |
|------|---------|
| `supabase/functions/get-blueprint-report-snapshot/index.ts` | Returns blueprint data to Console |
| `supabase/functions/get-nurture-status/index.ts` | Returns nurture email data |

## Verified Working

- Config's `get-blueprint-report-snapshot` returns correct data (tested via direct HMAC curl)
- Config's `get-nurture-status` returns correct data
- Vercel build is `READY`
- `BLUEPRINT_API_URL` and `BLUEPRINT_HMAC_SECRET` are set as Supabase secrets on Console project

## Debugging Strategy

1. **Check edge function logs**: `npx supabase functions logs get-submission-detail --project-ref ipomygtomouybmnwmbic` (run from `ops_console/` directory)
2. **Curl test the detail endpoint directly** using a valid JWT from the Console Supabase project
3. **Check `callBFF` in client.ts** — does it log Zod validation errors to console?
4. **Compare the response shape** from the edge function against `SubmissionDetailSchema` in `schemas.ts`
5. **Consider reverting** the artifacts initialization code back to the original if the fix is non-obvious

## Deploy Commands

```bash
# Console edge functions (from ops_console/)
cd ~/Desktop/Cleland.Studios/projects/ops_console
npx supabase functions deploy get-submission-detail --project-ref ipomygtomouybmnwmbic --no-verify-jwt

# Config edge functions (from blueprint_config/)
cd ~/Desktop/Cleland.Studios/projects/blueprint_config
npx supabase functions deploy get-nurture-status --project-ref ovfctbpwclkrbfjjzssj --no-verify-jwt

# Console frontend — auto-deploys on git push to main
cd ~/Desktop/Cleland.Studios/projects/ops_console
git add -A && git commit -m "fix: description" && git push origin main
```

## Supabase Project IDs
- **Config**: `ovfctbpwclkrbfjjzssj`
- **Console**: `ipomygtomouybmnwmbic`

## HMAC Secret (for direct testing)
`395af72d3cad0f2a19c80e36cddbbc3816ddf9f334de041630d9686c195f4c87`
