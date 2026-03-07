/**
 * request-clarity-call Edge Function v2
 *
 * Called by the frontend when a user clicks "Request a Clarity Call" on the success screen.
 * Sets clarity_call_requested_at on the blueprint and fires an HMAC-signed notification to Console.
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { signForConsole } from "../_shared/hmac.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const HMAC_SECRET = Deno.env.get("BLUEPRINT_HMAC_SECRET") || "";
const OPS_CONSOLE_URL = Deno.env.get("OPS_CONSOLE_URL") || "";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type, x-blueprint-token",
};

function respond(body: Record<string, unknown>, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json", ...corsHeaders },
    });
}

Deno.serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { blueprint_id } = await req.json();
        if (!blueprint_id) return respond({ success: false, error: "blueprint_id required" }, 400);

        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

        // ── Fetch Blueprint ────────────────────────────────
        const { data: bp, error: fetchError } = await supabase
            .from("blueprints")
            .select("*")
            .eq("id", blueprint_id)
            .single();

        if (fetchError || !bp) return respond({ success: false, error: "Blueprint not found" }, 404);

        // Prevent double-requests
        if (bp.clarity_call_requested_at) {
            return respond({ success: true, message: "Clarity call already requested" });
        }

        // ── Set clarity_call_requested_at ───────────────────
        const now = new Date().toISOString();
        const { error: updateError } = await supabase
            .from("blueprints")
            .update({ clarity_call_requested_at: now })
            .eq("id", blueprint_id);

        if (updateError) {
            return respond({ success: false, error: "Failed to update blueprint" }, 500);
        }

        // ── Audit Log ──────────────────────────────────────
        await supabase.from("blueprint_audit_log").insert({
            blueprint_id,
            event_type: "clarity_call_requested",
            description: "User requested a clarity call from the success screen",
            ip_address: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null,
            user_agent: req.headers.get("user-agent")?.slice(0, 500) || null,
        });

        // ── HMAC Notification to Console ───────────────────
        if (HMAC_SECRET && OPS_CONSOLE_URL) {
            try {
                const notificationPayload = {
                    version: "1.0",
                    event: "clarity_call_requested",
                    blueprint_id: bp.id,
                    lead: {
                        first_name: bp.first_name || "",
                        last_name: bp.last_name || "",
                        email: (bp.user_email || "").toLowerCase(),
                        company: bp.business_name || undefined,
                    },
                    tier: bp.complexity_tier || "unknown",
                    requested_at: now,
                };

                const body = JSON.stringify(notificationPayload);
                const { signature, timestamp } = await signForConsole(body, HMAC_SECRET);

                const notifyRes = await fetch(
                    `${OPS_CONSOLE_URL}/functions/v1/receive-clarity-call-request`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "x-blueprint-signature": signature,
                            "x-blueprint-timestamp": timestamp,
                        },
                        body,
                    },
                );

                await supabase.from("blueprint_audit_log").insert({
                    blueprint_id,
                    event_type: notifyRes.ok ? "clarity_call_notified" : "clarity_call_notify_failed",
                    description: notifyRes.ok
                        ? "Console notified of clarity call request"
                        : `Console notification failed: ${notifyRes.status}`,
                    metadata: { status: notifyRes.status },
                });
            } catch (err) {
                // Don't fail the user request if Console notification fails
                await supabase.from("blueprint_audit_log").insert({
                    blueprint_id,
                    event_type: "clarity_call_notified",
                    description: `Console notification error: ${String(err)}`,
                });
            }
        }

        return respond({ success: true, requested_at: now });
    } catch (err) {
        console.error("[request-clarity-call] Error:", err);
        return respond(
            { success: false, error: err instanceof Error ? err.message : "Unknown error" },
            500,
        );
    }
});
