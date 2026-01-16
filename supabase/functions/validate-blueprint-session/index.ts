import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/* ──────────────────────────────────────────────
   ENV
────────────────────────────────────────────── */
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

/* ──────────────────────────────────────────────
   CORS
────────────────────────────────────────────── */
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/* ──────────────────────────────────────────────
   TYPES
────────────────────────────────────────────── */
interface SessionRequest {
  blueprint_id: string;
  session_token: string;
}

/* ──────────────────────────────────────────────
   HELPERS
────────────────────────────────────────────── */
function log(step: string, message: string, data?: Record<string, unknown>) {
  console.log(`[validate-blueprint-session] ${step}: ${message}`, data ? JSON.stringify(data) : "");
}

/* ──────────────────────────────────────────────
   MAIN SERVER
────────────────────────────────────────────── */
serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { blueprint_id, session_token }: SessionRequest = await req.json();

    if (!blueprint_id || !session_token) {
      return new Response(
        JSON.stringify({ valid: false, error: "Missing blueprint_id or session_token" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    log("VALIDATE", "Validating session", { blueprint_id });

    // Create service role client (bypasses RLS)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Verify session token matches the blueprint
    const { data: blueprint, error: blueprintError } = await supabase
      .from("blueprints")
      .select("id, session_token, status")
      .eq("id", blueprint_id)
      .single();

    if (blueprintError || !blueprint) {
      log("NOT_FOUND", "Blueprint not found", { blueprint_id });
      return new Response(
        JSON.stringify({ valid: false, error: "Blueprint not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Compare session tokens
    if (blueprint.session_token !== session_token) {
      log("DENIED", "Session token mismatch", { blueprint_id });
      return new Response(
        JSON.stringify({ valid: false, error: "Invalid session" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if already submitted
    if (blueprint.status === "submitted") {
      log("DENIED", "Blueprint already submitted", { blueprint_id });
      return new Response(
        JSON.stringify({ valid: false, error: "Blueprint already submitted" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    log("VALIDATED", "Session valid", { blueprint_id, status: blueprint.status });

    return new Response(
      JSON.stringify({ valid: true, status: blueprint.status }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[validate-blueprint-session] ERROR:", errorMessage, error);

    return new Response(
      JSON.stringify({ valid: false, error: "Validation failed" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
