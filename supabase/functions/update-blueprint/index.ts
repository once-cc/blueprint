import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";

/* ──────────────────────────────────────────────
   ENV
────────────────────────────────────────────── */
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

/* ──────────────────────────────────────────────
   CORS
────────────────────────────────────────────── */
// CORS headers are now dynamic per-request — see _shared/cors.ts

/* ──────────────────────────────────────────────
   TYPES
────────────────────────────────────────────── */
interface UpdateRequest {
  blueprint_id: string;
  session_token: string;
  updates: {
    discovery?: Record<string, unknown>;
    design?: Record<string, unknown>;
    deliver?: Record<string, unknown>;
    dream_intent?: string;
    current_step?: number;
    user_name?: string;
    user_email?: string;
    business_name?: string;
    status?: string;
  };
}

/* ──────────────────────────────────────────────
   HELPERS
────────────────────────────────────────────── */
function log(step: string, message: string, data?: Record<string, unknown>) {
  console.log(`[update-blueprint] ${step}: ${message}`, data ? JSON.stringify(data) : "");
}

/* ──────────────────────────────────────────────
   MAIN SERVER
────────────────────────────────────────────── */
serve(async (req: Request): Promise<Response> => {
  const corsHeaders = getCorsHeaders(req);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { blueprint_id, session_token, updates }: UpdateRequest = await req.json();

    if (!blueprint_id || !session_token) {
      return new Response(
        JSON.stringify({ error: "Missing blueprint_id or session_token" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    log("VALIDATE", "Validating session for update", { blueprint_id });

    // Create service role client (bypasses RLS)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Verify session token
    const { data: blueprint, error: blueprintError } = await supabase
      .from("blueprints")
      .select("id, session_token, status")
      .eq("id", blueprint_id)
      .single();

    if (blueprintError || !blueprint) {
      return new Response(
        JSON.stringify({ error: "Blueprint not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (blueprint.session_token !== session_token) {
      return new Response(
        JSON.stringify({ error: "Invalid session" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Only allow updates to draft blueprints (unless changing to submitted)
    if (blueprint.status === "submitted" && updates.status !== "submitted") {
      return new Response(
        JSON.stringify({ error: "Cannot modify submitted blueprint" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Build update object with only allowed fields
    const allowedUpdates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.discovery !== undefined) allowedUpdates.discovery = updates.discovery;
    if (updates.design !== undefined) allowedUpdates.design = updates.design;
    if (updates.deliver !== undefined) allowedUpdates.deliver = updates.deliver;
    if (updates.dream_intent !== undefined) allowedUpdates.dream_intent = updates.dream_intent;
    if (updates.current_step !== undefined) allowedUpdates.current_step = updates.current_step;
    if (updates.user_name !== undefined) allowedUpdates.user_name = updates.user_name;
    if (updates.user_email !== undefined) allowedUpdates.user_email = updates.user_email;
    if (updates.business_name !== undefined) allowedUpdates.business_name = updates.business_name;

    // Handle status change to submitted
    if (updates.status === "submitted" && blueprint.status !== "submitted") {
      allowedUpdates.status = "submitted";
      allowedUpdates.submitted_at = new Date().toISOString();
    }

    log("UPDATE", "Applying updates", { fields: Object.keys(allowedUpdates) });

    // Apply updates
    const { data: updatedBlueprint, error: updateError } = await supabase
      .from("blueprints")
      .update(allowedUpdates)
      .eq("id", blueprint_id)
      .select()
      .single();

    if (updateError) {
      log("ERROR", "Update failed", { error: updateError.message });
      return new Response(
        JSON.stringify({ error: "Update failed" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    log("SUCCESS", "Blueprint updated", { blueprint_id });

    return new Response(
      JSON.stringify({
        success: true,
        blueprint: {
          id: updatedBlueprint.id,
          status: updatedBlueprint.status,
          current_step: updatedBlueprint.current_step,
          updated_at: updatedBlueprint.updated_at,
        }
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[update-blueprint] ERROR:", errorMessage, error);

    return new Response(
      JSON.stringify({ error: "Update failed" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
