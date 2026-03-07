# Operations Console — Handoff Contract

> Canonical reference for all Blueprint Configurator → Operations Console server-to-server communication.
> Last updated: 2026-03-07

## Authentication

All requests are HMAC-SHA256 signed using a shared secret (`BLUEPRINT_HMAC_SECRET`).

### Signing Format (Blueprint → Console — Outbound)

```
message = ${timestamp}${body}   ← NO separator
signature = HMAC-SHA256(secret, message)
```

Headers sent:
| Header | Value |
|---|---|
| `x-blueprint-signature` | Hex-encoded HMAC signature |
| `x-blueprint-timestamp` | Unix epoch seconds (string) |
| `Content-Type` | `application/json` |

**Drift tolerance:** 5 minutes (300 seconds).

**Implementation:** [`_shared/hmac.ts → signForConsole()`](../supabase/functions/_shared/hmac.ts)

### Verification Format (Console → Blueprint — Inbound)

```
message = ${timestamp}:${body}   ← COLON separator
```

Headers expected:
| Header | Value |
|---|---|
| `X-Dashboard-Signature` | Hex-encoded HMAC signature |
| `X-Dashboard-Timestamp` | Unix epoch seconds (string) |

**Implementation:** [`_shared/hmac.ts → validateFromConsole()`](../supabase/functions/_shared/hmac.ts)

> **CRITICAL:** The two directions use DIFFERENT concatenation formats. Do not mix them up.

---

## Endpoint 1: Blueprint Submission

**Console endpoint:** `POST {OPS_CONSOLE_URL}/functions/v1/receive-blueprint-submission`

**Triggered by:** `submit-blueprint` Edge Function (Phase 2, async fire-and-forget with retry)

### Payload

```json
{
  "version": "1.0",
  "submission_id": "uuid-v4",
  "created_at": "2026-01-15T10:30:00.000Z",
  "lead": {
    "first_name": "Jane",
    "last_name": "Smith",
    "email": "jane@example.com"
  },
  "tier": "growth",
  "integrity_score": 72,
  "pdf_url": "https://ovfctbpwclkrbfjjzssj.supabase.co/storage/v1/..."
}
```

### Field Constraints

| Field | Type | Constraint |
|---|---|---|
| `version` | string | Always `"1.0"` |
| `submission_id` | string | UUID v4 (Supabase-generated) |
| `created_at` | string | ISO 8601 datetime |
| `lead.first_name` | string | May be empty `""` |
| `lead.last_name` | string | May be empty `""` |
| `lead.email` | string | Valid email, always lowercase |
| `lead.company` | string | **Omitted entirely** if not provided (never `null`) |
| `tier` | string | One of: `"essential"`, `"growth"`, `"enterprise"` |
| `integrity_score` | number | 0–100 integer |
| `pdf_url` | string | **Omitted entirely** if PDF generation failed; otherwise starts with `https://` |

### Expected Responses

| Status | Body | Blueprint Action |
|---|---|---|
| `200` | `{ received: true }` | Log success |
| `200` | `{ received: true, duplicate: true }` | Log duplicate flag, not an error |
| `400` | Validation error | Log error, **no retry** |
| `401` | HMAC failure | Log error, **no retry** |
| `500` | Server error | **Retry** with exponential backoff (max 2 retries: 1s, 2s) |

---

## Endpoint 2: Strategy Session Request

**Console endpoint:** `POST {OPS_CONSOLE_URL}/functions/v1/receive-clarity-call-request`

**Triggered by:** `request-clarity-call` Edge Function (called from SuccessState UI or /strategy landing page)

### Payload

```json
{
  "version": "1.0",
  "event": "clarity_call_requested",
  "blueprint_id": "uuid-v4",
  "lead": {
    "first_name": "Jane",
    "last_name": "Smith",
    "email": "jane@example.com"
  },
  "tier": "growth",
  "requested_at": "2026-01-15T14:22:00.000Z"
}
```

### Field Constraints

| Field | Type | Constraint |
|---|---|---|
| `version` | string | Always `"1.0"` |
| `event` | string | Always `"clarity_call_requested"` |
| `blueprint_id` | string | UUID v4 — matches `submission_id` from Endpoint 1 |
| `lead.first_name` | string | May be empty `""` |
| `lead.last_name` | string | May be empty `""` |
| `lead.email` | string | Valid email, always lowercase |
| `lead.company` | string | **Omitted entirely** if not provided |
| `tier` | string | One of: `"essential"`, `"growth"`, `"enterprise"`, or `"unknown"` |
| `requested_at` | string | ISO 8601 datetime |

### Idempotency

The Blueprint side prevents double-requests by checking `clarity_call_requested_at` on the blueprint record. However, the console should also handle duplicates gracefully.

---

## Environment Variables

| Var | Set on | Value |
|---|---|---|
| `OPS_CONSOLE_URL` | Blueprint Edge Function secrets | `https://ipomygtomouybmnwmbic.supabase.co` |
| `BLUEPRINT_HMAC_SECRET` | Both projects' Edge Function secrets | Shared secret (confirmed matching) |

---

## Audit Trail

All handoff attempts are logged in the `blueprint_audit_log` table:

| Event Type | Meaning |
|---|---|
| `hmac_handoff_success` | Submission delivered to console |
| `hmac_handoff_failed` | Submission delivery failed (includes status + response) |
| `clarity_call_requested` | User clicked "Request Strategy Session" |
| `clarity_call_notified` | Console notified of strategy session request |
| `clarity_call_notify_failed` | Console notification failed |
