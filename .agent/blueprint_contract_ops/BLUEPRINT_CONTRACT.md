# Blueprint → Ops Console Contract

> **Required reading before Blueprint implementation.**
> Defines the trust contract between `blueprint.cleland.studio` and `ops.cleland.studio`.
> Last updated: 2026-02-18

---

## 1. Endpoint

```
POST https://ops.cleland.studio/functions/v1/receive-blueprint-submission
```

- **Authentication**: HMAC-SHA256 (no JWT)
- **Edge Function Config**: `verify_jwt: false`
- **Direction**: Blueprint → Console (inbound only)

---

## 2. Required Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Content-Type` | string | ✅ | Must be `application/json` |
| `x-blueprint-signature` | string | ✅ | HMAC-SHA256 hex signature |
| `x-blueprint-timestamp` | string | ✅ | Unix epoch seconds (string) |

---

## 3. HMAC Algorithm

```
signature = HMAC_SHA256(
  key:     BLUEPRINT_HMAC_SECRET,
  message: timestamp + body
)
```

- `timestamp` — Unix epoch in seconds (string), same value as `x-blueprint-timestamp`
- `body` — Raw JSON request body (not parsed/reformatted)
- `BLUEPRINT_HMAC_SECRET` — 32-byte hex secret, shared between both systems
- Output — Lowercase hex string

### Pseudocode (sender side)

```typescript
const timestamp = Math.floor(Date.now() / 1000).toString();
const message = `${timestamp}${JSON.stringify(payload)}`;
const signature = hmacSha256(BLUEPRINT_HMAC_SECRET, message);

fetch(endpoint, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-blueprint-signature": signature,
    "x-blueprint-timestamp": timestamp,
  },
  body: JSON.stringify(payload),
});
```

---

## 4. Timestamp Drift

Maximum allowed drift: **5 minutes** (300 seconds).

Requests with a timestamp older than 5 minutes are rejected with `401 Unauthorized`.

This prevents replay attacks with captured signatures.

---

## 5. Payload Schema

```json
{
  "version": "1.0",
  "submission_id": "UUID",
  "created_at": "ISO 8601 string",
  "lead": {
    "first_name": "string",
    "last_name": "string",
    "email": "string",
    "company": "string (optional)"
  },
  "tier": "string",
  "integrity_score": "number",
  "pdf_url": "string (HTTPS only)"
}
```

### Field Constraints

| Field | Type | Constraint |
|-------|------|------------|
| `version` | string | Must be `"1.0"`. Unknown versions rejected (400). |
| `submission_id` | string | Valid UUID v4 format. UNIQUE — reuse triggers idempotent response. |
| `created_at` | string | Valid ISO 8601 date. |
| `lead.first_name` | string | Non-empty after trim. |
| `lead.last_name` | string | Non-empty after trim. |
| `lead.email` | string | Must match `^[^\s@]+@[^\s@]+\.[^\s@]+$`. Stored lowercase. |
| `lead.company` | string? | Optional. Stored as null if omitted. |
| `tier` | string | Non-empty string. |
| `integrity_score` | number | Finite number. |
| `pdf_url` | string | Must begin with `https://`. |

---

## 6. Response Codes

| Status | Meaning | Body |
|--------|---------|------|
| `200` | Submission received (or duplicate) | `{ "received": true, "submission_id": "...", "duplicate"?: true }` |
| `400` | Payload validation failed | `{ "error": "reason" }` |
| `401` | HMAC verification failed | `{ "error": "Unauthorized" }` |
| `405` | Non-POST method | `{ "error": "Method not allowed" }` |
| `500` | Server error | `{ "error": "Internal server error" }` |

---

## 7. Idempotency Rule

If `submission_id` already exists in the database:

- **No re-insertion occurs**
- Response: `200 OK` with `{ "received": true, "duplicate": true }`
- Audit log entry: `blueprint_duplicate_attempt`

This prevents:
- Replay attacks with valid signatures
- Network retry double-inserts
- Race conditions (handled by UNIQUE constraint)

---

## 8. Replay Protection

Two layers:

1. **Timestamp drift** — Signatures older than 5 minutes are rejected
2. **Idempotency** — Duplicate `submission_id` values return `200` without re-insertion

---

## 9. Versioning Rule

The `version` field is **mandatory** and must match a supported version.

Currently supported: `"1.0"`

When the contract evolves:
1. New version added to supported list
2. Old versions remain valid until explicitly deprecated
3. Breaking changes require a new version number

---

## 10. Security Model

| Property | Value |
|----------|-------|
| JWT required | ❌ No (server-to-server) |
| HMAC required | ✅ Yes |
| RLS write access | ❌ No (anon/authenticated cannot write) |
| Insert method | `service_role` only |
| Audit logging | ✅ All events (success, failure, duplicate) |
| Outbox triggered | ❌ No (Blueprint owns follow-up emails) |
| Frontend access to secrets | ❌ No (secrets in Edge Function env only) |

---

## 11. Audit Log Events

| Event | `action` value | Trigger |
|-------|----------------|---------|
| Submission received | `blueprint_submission_received` | Successful insert |
| Duplicate attempt | `blueprint_duplicate_attempt` | Existing `submission_id` |
| HMAC failure | `blueprint_hmac_failure` | Invalid/missing signature or timestamp drift |
| Payload invalid | `blueprint_payload_invalid` | Schema validation failure |

---

## 12. What the Console Does NOT Do

- ❌ Send emails on Blueprint ingest
- ❌ Trigger outbox jobs
- ❌ Store the actual PDF file (URL reference only)
- ❌ Modify Blueprint system data
- ❌ Initiate any outbound communication

The console **receives and stores** — nothing more.
Blueprint owns all follow-up communication.

---

## 13. Required Secrets (Production)

Configure as Supabase Edge Function secrets:

```
BLUEPRINT_API_URL=https://blueprint.cleland.studio
BLUEPRINT_HMAC_SECRET=<32-byte hex secret>
```

These secrets:
- Must NOT appear in `src/`
- Must NOT appear in `.env` (frontend)
- Are only accessible inside Edge Functions
- Must be coordinated between both systems before activation

---

## 14. Blueprint Sender Checklist

When implementing the Blueprint sender:

1. ✅ Generate `submission_id` (UUID v4)
2. ✅ Generate PDF → upload → get HTTPS URL
3. ✅ Sign payload with shared HMAC secret
4. ✅ POST to `ops.cleland.studio/functions/v1/receive-blueprint-submission`
5. ✅ Handle `200` response (check `duplicate` flag)
6. ✅ Handle `400`/`401` errors with logging
7. ✅ Implement retry with backoff for `500` errors

---

*This document is the source of truth for Blueprint → Console integration.*
*Any changes to this contract must be reflected in both systems.*
