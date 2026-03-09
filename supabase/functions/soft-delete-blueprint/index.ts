/**
 * soft-delete-blueprint Edge Function v2
 *
 * Console archives a blueprint (sets archived_at).
 * Auth: HMAC verification (Console → Blueprint, colon separator)
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { validateFromConsole } from "../_shared/hmac.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const HMAC_SECRET = Deno.env.get("BLUEPRINT_HMAC_SECRET") || "";

// CORS headers are now dynamic per-request — see _shared/cors.ts
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
        return new Response(null, { headers: _corsHeaders });
    }

    try {
        // ── HMAC Verification ──────────────────────────────
        const body = await req.text();
        const hmacResult = await validateFromConsole(
            req.headers.get("x-dashboard-signature"),
            req.headers.get("x-dashboard-timestamp"),
            body,
            HMAC_SECRET,
        );
        if (!hmacResult.valid) {
            return respond({ success: false, error: hmacResult.error }, 401);
        }

        const { blueprint_id } = JSON.parse(body);
        if (!blueprint_id) return respond({ success: false, error: "blueprint_id required" }, 400);

        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

        // ── Soft Delete ────────────────────────────────────
        const { error } = await supabase
            .from("blueprints")
            .update({ archived_at: new Date().toISOString() })
            .eq("id", blueprint_id)
            .is("archived_at", null);

        if (error) {
            return respond({ success: false, error: error.message }, 500);
        }

        // Audit log
        await supabase.from("blueprint_audit_log").insert({
            blueprint_id,
            event_type: "blueprint_archived",
            description: "Blueprint soft-deleted via Console",
            metadata: { triggered_by: "console" },
        });

        return respond({ success: true });
    } catch (err) {
        console.error("[soft-delete-blueprint] Error:", err);
        return respond(
            { success: false, error: err instanceof Error ? err.message : "Unknown error" },
            500,
        );
    }
});
