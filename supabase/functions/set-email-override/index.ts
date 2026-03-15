/**
 * set-email-override — HMAC-Secured Endpoint for Console Email Edits
 *
 * Called by the Ops Console when an operator saves or reverts an email override.
 * Writes override columns to the email_sequences row.
 *
 * Auth: Console → Blueprint HMAC (colon separator)
 * Headers: X-Dashboard-Signature, X-Dashboard-Timestamp
 *
 * POST body:
 *   { blueprint_id, email_number, action: "set" | "revert",
 *     subject?, body?, cta_label?, edited_by? }
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { validateFromConsole } from "../_shared/hmac.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const HMAC_SECRET = Deno.env.get("BLUEPRINT_HMAC_SECRET") || "";

let _corsHeaders: Record<string, string> = {};

function respond(body: Record<string, unknown>, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json", ..._corsHeaders },
    });
}

Deno.serve(async (req: Request) => {
    _corsHeaders = getCorsHeaders(req);

    if (req.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: _corsHeaders });
    }

    if (req.method !== "POST") {
        return respond({ error: "Method not allowed" }, 405);
    }

    // ── HMAC Validation ─────────────────────────────────────
    const rawBody = await req.text();

    if (HMAC_SECRET) {
        const validation = await validateFromConsole(
            req.headers.get("X-Dashboard-Signature"),
            req.headers.get("X-Dashboard-Timestamp"),
            rawBody,
            HMAC_SECRET,
        );
        if (!validation.valid) {
            console.warn("[set-email-override] HMAC validation failed:", validation.error);
            return respond({ error: "Unauthorized" }, 401);
        }
    }

    // ── Parse Payload ───────────────────────────────────────
    let payload: {
        blueprint_id: string;
        email_number: number;
        action: "set" | "revert";
        subject?: string;
        body?: string;
        cta_label?: string;
        edited_by?: string;
    };

    try {
        payload = JSON.parse(rawBody);
    } catch {
        return respond({ error: "Invalid JSON" }, 400);
    }

    if (!payload.blueprint_id || !payload.email_number || !payload.action) {
        return respond({ error: "Missing required fields: blueprint_id, email_number, action" }, 400);
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // ── Find the email_sequences row ────────────────────────
    const { data: row, error: findErr } = await supabase
        .from("email_sequences")
        .select("id, status")
        .eq("blueprint_id", payload.blueprint_id)
        .eq("email_number", payload.email_number)
        .single();

    if (findErr || !row) {
        return respond({ error: "Email sequence row not found" }, 404);
    }

    // Guard: only pending emails can be edited
    if (row.status !== "pending") {
        return respond({ error: `Cannot edit email with status '${row.status}'` }, 409);
    }

    // ── Apply Override or Revert ─────────────────────────────
    if (payload.action === "set") {
        if (!payload.subject || !payload.body) {
            return respond({ error: "Override requires subject and body" }, 400);
        }

        const { error: updateErr } = await supabase
            .from("email_sequences")
            .update({
                override_subject: payload.subject,
                override_body: payload.body,
                override_cta_label: payload.cta_label || null,
                override_by: payload.edited_by || "operator",
                override_at: new Date().toISOString(),
            })
            .eq("id", row.id);

        if (updateErr) {
            console.error("[set-email-override] Update error:", updateErr);
            return respond({ error: "Failed to save override" }, 500);
        }

        // Audit log
        await supabase.from("blueprint_audit_log").insert({
            blueprint_id: payload.blueprint_id,
            event_type: "email_override_set",
            metadata: {
                email_number: payload.email_number,
                edited_by: payload.edited_by,
                subject_preview: (payload.subject || "").slice(0, 80),
            },
        }).catch(() => { /* audit must never break pipeline */ });

        console.info(`[set-email-override] Override saved for blueprint=${payload.blueprint_id} email=${payload.email_number}`);
        return respond({ success: true, action: "set" });

    } else if (payload.action === "revert") {
        const { error: updateErr } = await supabase
            .from("email_sequences")
            .update({
                override_subject: null,
                override_body: null,
                override_cta_label: null,
                override_by: null,
                override_at: null,
            })
            .eq("id", row.id);

        if (updateErr) {
            console.error("[set-email-override] Revert error:", updateErr);
            return respond({ error: "Failed to revert override" }, 500);
        }

        // Audit log
        await supabase.from("blueprint_audit_log").insert({
            blueprint_id: payload.blueprint_id,
            event_type: "email_override_reverted",
            metadata: {
                email_number: payload.email_number,
                reverted_by: payload.edited_by,
            },
        }).catch(() => { /* audit must never break pipeline */ });

        console.info(`[set-email-override] Override reverted for blueprint=${payload.blueprint_id} email=${payload.email_number}`);
        return respond({ success: true, action: "revert" });

    } else {
        return respond({ error: "Invalid action — must be 'set' or 'revert'" }, 400);
    }
});
