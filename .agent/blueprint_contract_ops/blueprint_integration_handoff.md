# Blueprint Configurator ↔ Ops Console: Integration Handoff

> Everything the Blueprint Configurator project needs to implement for a seamless connection to the Ops Console.

---

## Architecture Summary

The two projects communicate **server-to-server** via HMAC-signed HTTP calls. There are two directions:

| Direction | Trigger | Auth |
|-----------|---------|------|
| **Blueprint → Console** | Blueprint submission completed | HMAC (`x-blueprint-signature` / `x-blueprint-timestamp`) |
| **Console → Blueprint** | Admin actions (view reports, resend email, archive) | HMAC (`X-Dashboard-Signature` / `X-Dashboard-Timestamp`) |

---

## Files to Carry Over / Reference

### 1. The Contract (Source of Truth)

#### [BLUEPRINT_CONTRACT.md](file:///Users/kingjoshua/Desktop/Cleland.Studios/projects/ops_console/docs/BLUEPRINT_CONTRACT.md)

The canonical contract. **This is the #1 file to reference.** It defines:
- Endpoint URL, required headers, HMAC algorithm
- Full payload schema with field constraints
- Response codes, idempotency rules, replay protection
- Versioning strategy and security model

---

### 2. HMAC — What Blueprint Must IMPLEMENT

Blueprint needs both a **signing** function (for outbound calls to Console) and a **verification** function (for inbound calls from Console).

#### Signing (Blueprint → Console)

Blueprint must sign its outbound [receive-blueprint-submission](file:///Users/kingjoshua/Desktop/Cleland.Studios/projects/ops_console/supabase/functions/receive-blueprint-submission) calls. The algorithm the Console expects is in [hmac_verify.ts](file:///Users/kingjoshua/Desktop/Cleland.Studios/projects/ops_console/supabase/functions/_shared/hmac_verify.ts):

```
signature = HMAC_SHA256(key: BLUEPRINT_HMAC_SECRET, message: timestamp + body)
```

- `timestamp` = Unix epoch seconds (string), sent as `x-blueprint-timestamp` header
- `body` = raw JSON string (not reformatted)
- `signature` = lowercase hex, sent as `x-blueprint-signature` header
- Max drift: **5 minutes** (300 seconds)

> [!CAUTION]
> The Console's **verification** side concatenates as `timestamp + body` (no separator).
> The Console's **signing** side ([hmac.ts](file:///Users/kingjoshua/Desktop/Cleland.Studios/projects/ops_console/supabase/functions/_shared/hmac.ts)) concatenates as `timestamp:body` (with colon).
> Blueprint must match whichever side it's talking to. For **outbound** submissions → Console, use **no separator** (`timestamp + body`).

#### Verification (Console → Blueprint)

When Console calls Blueprint (via the 3 proxy functions), it signs with [hmac.ts](file:///Users/kingjoshua/Desktop/Cleland.Studios/projects/ops_console/supabase/functions/_shared/hmac.ts):

```
signature = HMAC_SHA256(key: BLUEPRINT_HMAC_SECRET, message: timestamp + ":" + body)
```

- Arrives as `X-Dashboard-Signature` and `X-Dashboard-Timestamp` headers
- Blueprint must verify these using the same colon-separated format

---

### 3. Payload Schema — What Blueprint Must SEND

From the contract and [receive-blueprint-submission/index.ts](file:///Users/kingjoshua/Desktop/Cleland.Studios/projects/ops_console/supabase/functions/receive-blueprint-submission/index.ts):

```json
{
  "version": "1.0",
  "submission_id": "UUID v4",
  "created_at": "2026-02-22T00:00:00Z",
  "lead": {
    "first_name": "string",
    "last_name": "string",
    "email": "user@example.com",
    "company": "optional string"
  },
  "tier": "string",
  "integrity_score": 85,
  "pdf_url": "https://..."
}
```

**Validation rules enforced by Console:**
- `version` must be `"1.0"`
- `submission_id` must be UUID v4 format (idempotent — retries are safe)
- `lead.email` must match `^[^\s@]+@[^\s@]+\.[^\s@]+$` (stored lowercase)
- `pdf_url` must start with `https://`
- `integrity_score` must be a finite number

---

### 4. Edge Functions Blueprint Must EXPOSE

The 3 Console proxy functions call these endpoints on Blueprint:

| Console Proxy | Blueprint Endpoint to Build | Purpose |
|---------------|----------------------------|---------|
| [proxy-blueprint-report](file:///Users/kingjoshua/Desktop/Cleland.Studios/projects/ops_console/supabase/functions/proxy-blueprint-report/index.ts) | `GET /get-blueprint-report-snapshot` | Fetch paginated blueprint snapshots |
| [proxy-resend-email](file:///Users/kingjoshua/Desktop/Cleland.Studios/projects/ops_console/supabase/functions/proxy-resend-email/index.ts) | `POST /resend-email-1` | Re-trigger Email 1 for a blueprint |
| [proxy-soft-delete](file:///Users/kingjoshua/Desktop/Cleland.Studios/projects/ops_console/supabase/functions/proxy-soft-delete/index.ts) | `POST /soft-delete-blueprint` | Archive/soft-delete a blueprint |

All 3 arrive with:
- `X-Dashboard-Signature` header (HMAC hex)
- `X-Dashboard-Timestamp` header (Unix epoch string)
- JSON body with `actor_email` injected (for resend-email and soft-delete)

---

### 5. Response Shape — What Console Expects Back

From [blueprintApi.ts](file:///Users/kingjoshua/Desktop/Cleland.Studios/projects/ops_console/src/services/blueprintApi.ts), the [BlueprintSnapshot](file:///Users/kingjoshua/Desktop/Cleland.Studios/projects/ops_console/src/services/blueprintApi.ts#20-50) type defines the expected response shape from `get-blueprint-report-snapshot`:

```typescript
interface BlueprintSnapshot {
  id: string;
  business_name: string | null;
  user_name: string | null;
  user_email: string | null;
  status: string;                    // ← Blueprint-owned status
  created_at: string;
  submitted_at: string | null;
  archived_at: string | null;
  integrity_score: number;
  complexity_score: number;
  complexity_tier: string;
  pdf_url: string | null;
  email_sequences: Array<{
    email_type: string;
    status: string;
    sent_at: string | null;
    scheduled_for: string | null;
  }>;
  bookings: Array<{
    booked_at: string;
    source: string;
  }>;
  security_events: Array<{
    event_type: string;
    description: string;
    created_at: string;
    ip_address: string | null;
  }>;
}

// Paginated wrapper
interface SnapshotResponse {
  snapshots: BlueprintSnapshot[];
  total: number;
  page: number;
  page_size: number;
}
```

---

### 6. Submission Status — Console-Side Lifecycle

The Console tracks its own `sequence_status` per submission in `dashboard_submission_state` (from [005_booking_notifications.sql](file:///Users/kingjoshua/Desktop/Cleland.Studios/projects/ops_console/supabase/migrations/005_booking_notifications.sql)):

| Status | Meaning |
|--------|---------|
| `active` | Default on ingest — sequence running |
| `auto_disabled_due_to_booking` | Auto-stopped when lead books a meeting |
| `manually_disabled` | Admin manually paused |

> [!NOTE]
> This is **Console-owned state**, not something Blueprint sends. Blueprint sends `status` in the snapshot response (see §5), which is Blueprint's own concept of the submission lifecycle.

---

### 7. Shared Secret

Both systems must share the same `BLUEPRINT_HMAC_SECRET`:
- **Console side**: Set as a Supabase Edge Function secret
- **Blueprint side**: Must be stored equivalently (env var / secret)
- Format: 32-byte hex string
- Must **never** appear in frontend code or `.env` files accessible to clients

---

## Quick Reference: What Blueprint Needs to Build

| # | What | Direction | Priority |
|---|------|-----------|----------|
| 1 | **HMAC signing function** (no-separator format) | Blueprint → Console | 🔴 Critical |
| 2 | **Submission sender** matching the payload schema | Blueprint → Console | 🔴 Critical |
| 3 | **HMAC verification function** (colon-separator format) | Console → Blueprint | 🟡 Required |
| 4 | **`get-blueprint-report-snapshot`** endpoint | Console → Blueprint | 🟡 Required |
| 5 | **`resend-email-1`** endpoint | Console → Blueprint | 🟠 Important |
| 6 | **`soft-delete-blueprint`** endpoint | Console → Blueprint | 🟠 Important |
| 7 | **Shared secret coordination** | Both | 🔴 Critical |

---

## File Manifest (Copy / Reference from ops_console)

| File | Purpose | Action |
|------|---------|--------|
| [docs/BLUEPRINT_CONTRACT.md](file:///Users/kingjoshua/Desktop/Cleland.Studios/projects/ops_console/docs/BLUEPRINT_CONTRACT.md) | Integration contract | **Copy** — reference doc for both sides |
| [supabase/functions/_shared/hmac_verify.ts](file:///Users/kingjoshua/Desktop/Cleland.Studios/projects/ops_console/supabase/functions/_shared/hmac_verify.ts) | How Console verifies Blueprint signatures | **Reference** — implement the inverse (signing) in Blueprint |
| [supabase/functions/_shared/hmac.ts](file:///Users/kingjoshua/Desktop/Cleland.Studios/projects/ops_console/supabase/functions/_shared/hmac.ts) | How Console signs outbound calls to Blueprint | **Reference** — implement the inverse (verification) in Blueprint |
| [supabase/functions/receive-blueprint-submission/index.ts](file:///Users/kingjoshua/Desktop/Cleland.Studios/projects/ops_console/supabase/functions/receive-blueprint-submission/index.ts) | Console's ingest endpoint | **Reference** — shows exact validation + payload expectations |
| [supabase/functions/proxy-blueprint-report/index.ts](file:///Users/kingjoshua/Desktop/Cleland.Studios/projects/ops_console/supabase/functions/proxy-blueprint-report/index.ts) | Console calls Blueprint's report endpoint | **Reference** — shows request shape + headers Blueprint will receive |
| [supabase/functions/proxy-resend-email/index.ts](file:///Users/kingjoshua/Desktop/Cleland.Studios/projects/ops_console/supabase/functions/proxy-resend-email/index.ts) | Console calls Blueprint's resend endpoint | **Reference** — shows enriched body format |
| [supabase/functions/proxy-soft-delete/index.ts](file:///Users/kingjoshua/Desktop/Cleland.Studios/projects/ops_console/supabase/functions/proxy-soft-delete/index.ts) | Console calls Blueprint's archive endpoint | **Reference** — shows enriched body format |
| [src/services/blueprintApi.ts](file:///Users/kingjoshua/Desktop/Cleland.Studios/projects/ops_console/src/services/blueprintApi.ts) | Frontend types for snapshot response | **Reference** — defines [BlueprintSnapshot](file:///Users/kingjoshua/Desktop/Cleland.Studios/projects/ops_console/src/services/blueprintApi.ts#20-50) type Blueprint must return |
| [supabase/migrations/005_booking_notifications.sql](file:///Users/kingjoshua/Desktop/Cleland.Studios/projects/ops_console/supabase/migrations/005_booking_notifications.sql) | Console DB schema (sequence_status) | **Reference** — Console-side only, not needed in Blueprint |
| [supabase/migrations/008_blueprint_ingest_contract.sql](file:///Users/kingjoshua/Desktop/Cleland.Studios/projects/ops_console/supabase/migrations/008_blueprint_ingest_contract.sql) | Blueprint ingest columns | **Reference** — Console-side only, not needed in Blueprint |
