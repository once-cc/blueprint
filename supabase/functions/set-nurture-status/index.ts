import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { validateFromConsole } from "../_shared/hmac.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

/**
 * set-nurture-status — HMAC-Secured Endpoint for Pausing/Resuming
 *
 * Auth: HMAC verification (Console → Blueprint, colon separator)
 * Input: { blueprint_id: string, status: "active" | "manually_disabled" }
 * Output: success boolean
 */

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
        return new Response(null, { headers: _corsHeaders });
    }

    if (req.method !== "POST") {
        return respond({ error: "Method Not Allowed" }, 405);
    }

    try {
        const body = await req.text();
        const signature = req.headers.get("x-dashboard-signature");
        const timestamp = req.headers.get("x-dashboard-timestamp");

        const hmacResult = await validateFromConsole(signature, timestamp, body, HMAC_SECRET);
        if (!hmacResult.valid) {
            return respond({ success: false, error: hmacResult.error }, 401);
        }

        const params = JSON.parse(body);

        if (!params.blueprint_id || !params.status) {
            return respond({ success: false, error: "Missing blueprint_id or status" }, 400);
        }

        if (params.status !== "active" && params.status !== "manually_disabled") {
            return respond({ success: false, error: "Invalid status" }, 400);
        }

        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

        if (params.status === "manually_disabled") {
            // Cancel pending emails
            const { error: updateErr } = await supabase
                .from("email_sequences")
                .update({
                    status: "cancelled",
                    cancelled_at: new Date().toISOString(),
                    error: "manually_disabled"
                })
                .eq("blueprint_id", params.blueprint_id)
                .eq("status", "pending");

            if (updateErr) {
                console.error("[set-nurture-status] Error disabling:", updateErr);
                return respond({ success: false, error: "Database error" }, 500);
            }
        } else if (params.status === "active") {
            // Restore naturally cancelled emails (due to manual disable)
            // Note: we want to restore emails that were cancelled specifically by manual action.
            const { error: updateErr } = await supabase
                .from("email_sequences")
                .update({
                    status: "pending",
                    cancelled_at: null,
                    error: null
                })
                .eq("blueprint_id", params.blueprint_id)
                .eq("status", "cancelled")
                .in("error", ["manually_disabled", "manually_disabled_by_operator", "auto_disabled_booking_received"]);

            if (updateErr) {
                console.error("[set-nurture-status] Error enabling:", updateErr);
                return respond({ success: false, error: "Database error" }, 500);
            }
        }

        // Add to audit log
        await supabase.from("blueprint_audit_log").insert({
            blueprint_id: params.blueprint_id,
            event_type: "nurture_status_changed",
            metadata: {
                new_status: params.status,
                source: "ops_console",
            },
        }).catch(() => { /* audit must not throw */ });

        return respond({ success: true, status: params.status });
    } catch (err) {
        console.error("[set-nurture-status] Exception:", err);
        return respond({ success: false, error: err instanceof Error ? err.message : "Unknown error" }, 500);
    }
});
