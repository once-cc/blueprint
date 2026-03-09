/**
 * get-blueprint-report-snapshot Edge Function v2
 *
 * Console reads from Blueprint — returns paginated BlueprintSnapshot[].
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
        const signature = req.headers.get("x-dashboard-signature");
        const timestamp = req.headers.get("x-dashboard-timestamp");

        const hmacResult = await validateFromConsole(signature, timestamp, body, HMAC_SECRET);
        if (!hmacResult.valid) {
            return respond({ success: false, error: hmacResult.error }, 401);
        }

        const params = body ? JSON.parse(body) : {};
        const page = params.page || 1;
        const pageSize = Math.min(params.page_size || 25, 100);
        const offset = (page - 1) * pageSize;

        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

        // ── Fetch Blueprints ───────────────────────────────
        const { data: blueprints, error, count } = await supabase
            .from("blueprints")
            .select("*", { count: "exact" })
            .is("archived_at", null)
            .eq("status", "submitted")
            .order("submitted_at", { ascending: false })
            .range(offset, offset + pageSize - 1);

        if (error) {
            return respond({ success: false, error: error.message }, 500);
        }

        // ── Build Snapshots ────────────────────────────────
        const snapshots = await Promise.all(
            (blueprints || []).map(async (bp) => {
                // Fetch Email 1 record
                const { data: emails } = await supabase
                    .from("blueprint_emails")
                    .select("*")
                    .eq("blueprint_id", bp.id)
                    .limit(10);

                // Fetch audit log
                const { data: auditLogs } = await supabase
                    .from("blueprint_audit_log")
                    .select("*")
                    .eq("blueprint_id", bp.id)
                    .order("created_at", { ascending: false })
                    .limit(20);

                return {
                    id: bp.id,
                    status: bp.status,
                    first_name: bp.first_name,
                    last_name: bp.last_name,
                    user_email: bp.user_email,
                    business_name: bp.business_name,
                    dream_intent: bp.dream_intent,
                    complexity_score: bp.complexity_score,
                    integrity_score: bp.integrity_score,
                    complexity_tier: bp.complexity_tier,
                    pdf_url: bp.pdf_url,
                    clarity_call_requested_at: bp.clarity_call_requested_at,
                    created_at: bp.created_at,
                    submitted_at: bp.submitted_at,
                    email_sequences: (emails || []).map((e) => ({
                        id: e.id,
                        type: e.email_type,
                        status: e.status,
                        sent_at: e.sent_at,
                    })),
                    bookings: [], // Console owns bookings
                    security_events: (auditLogs || []).map((a) => ({
                        id: a.id,
                        event_type: a.event_type,
                        description: a.description,
                        created_at: a.created_at,
                    })),
                };
            }),
        );

        return respond({
            success: true,
            data: snapshots,
            pagination: {
                page,
                page_size: pageSize,
                total: count || 0,
                total_pages: Math.ceil((count || 0) / pageSize),
            },
        });
    } catch (err) {
        console.error("[get-blueprint-report-snapshot] Error:", err);
        return respond(
            { success: false, error: err instanceof Error ? err.message : "Unknown error" },
            500,
        );
    }
});
