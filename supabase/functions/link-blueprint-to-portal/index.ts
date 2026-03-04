/**
 * link-blueprint-to-portal Edge Function
 * 
 * Called when a user signs up to the Client Portal.
 * Queries blueprints by email to link existing blueprints to the portal user.
 * 
 * Input: { email: string }
 * Output: { blueprints: BlueprintSummary[] }
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ── ENV ─────────────────────────────────────────────────────

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// ── CORS ────────────────────────────────────────────────────

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ── Logging ─────────────────────────────────────────────────

function log(step: string, message: string, data?: Record<string, unknown>) {
    console.log(`[link-blueprint-to-portal] ${step}: ${message}`, data ? JSON.stringify(data) : "");
}

// ── MAIN SERVER ─────────────────────────────────────────────

serve(async (req: Request): Promise<Response> => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { email } = await req.json();

        if (!email || typeof email !== "string") {
            return new Response(
                JSON.stringify({ error: "email is required" }),
                { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
            );
        }

        log("QUERY", "Looking up blueprints by email", { email });

        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

        // Fetch all submitted blueprints for this email
        const { data: blueprints, error: bpError } = await supabase
            .from("blueprints")
            .select("id, business_name, user_name, status, created_at, submitted_at")
            .eq("user_email", email)
            .in("status", ["submitted", "generated"])
            .order("submitted_at", { ascending: false });

        if (bpError) throw new Error(`Blueprint query failed: ${bpError.message}`);

        if (!blueprints || blueprints.length === 0) {
            log("RESULT", "No blueprints found", { email });
            return new Response(
                JSON.stringify({ blueprints: [] }),
                { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
            );
        }

        const blueprintIds = blueprints.map((b) => b.id);

        // Fetch latest contract artifacts for each blueprint
        const { data: artifacts } = await supabase
            .from("blueprint_artifacts")
            .select("blueprint_id, artifact_type, payload, file_url, version")
            .in("blueprint_id", blueprintIds)
            .eq("artifact_type", "contract");

        // Fetch scores (complexity only — integrity is internal)
        const { data: scores } = await supabase
            .from("blueprint_scores")
            .select("blueprint_id, complexity_score")
            .in("blueprint_id", blueprintIds);

        // Map artifacts and scores — only keep LATEST version per blueprint
        const artifactMap = new Map<string, Record<string, unknown>>();
        for (const a of (artifacts || []) as Record<string, unknown>[]) {
            const existing = artifactMap.get(a.blueprint_id as string);
            if (!existing || (a.version as number) > (existing.version as number)) {
                artifactMap.set(a.blueprint_id as string, a);
            }
        }
        const scoreMap = new Map((scores || []).map((s: Record<string, unknown>) => [s.blueprint_id as string, s]));

        const result = blueprints.map((bp) => ({
            id: bp.id,
            business_name: bp.business_name,
            user_name: bp.user_name,
            status: bp.status,
            created_at: bp.created_at,
            submitted_at: bp.submitted_at,
            contract: artifactMap.get(bp.id)?.payload || null,
            scores: scoreMap.get(bp.id) ? {
                complexity: (scoreMap.get(bp.id) as Record<string, unknown>).complexity_score,
            } : null,
        }));

        log("RESULT", `Found ${result.length} blueprints`, { email });

        return new Response(
            JSON.stringify({ blueprints: result }),
            { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error(`[link-blueprint-to-portal] ERROR: ${errorMessage}`, error);

        return new Response(
            JSON.stringify({ error: errorMessage }),
            { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
    }
});
