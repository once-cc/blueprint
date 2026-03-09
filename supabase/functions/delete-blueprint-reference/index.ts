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
interface DeleteRequest {
  blueprint_id: string;
  session_token: string;
  reference_id: string;
}

/* ──────────────────────────────────────────────
   HELPERS
────────────────────────────────────────────── */
function log(step: string, message: string, data?: Record<string, unknown>) {
  console.log(`[delete-blueprint-reference] ${step}: ${message}`, data ? JSON.stringify(data) : "");
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
    const { blueprint_id, session_token, reference_id }: DeleteRequest = await req.json();

    if (!blueprint_id || !session_token || !reference_id) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    log("VALIDATE", "Validating session for delete", { blueprint_id, reference_id });

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

    if (blueprint.status === "submitted") {
      return new Response(
        JSON.stringify({ error: "Cannot modify submitted blueprint" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get reference to find storage path
    const { data: reference, error: refError } = await supabase
      .from("blueprint_references")
      .select("id, storage_path, blueprint_id")
      .eq("id", reference_id)
      .eq("blueprint_id", blueprint_id)
      .single();

    if (refError || !reference) {
      return new Response(
        JSON.stringify({ error: "Reference not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Delete from storage if path exists
    if (reference.storage_path) {
      log("DELETE", "Removing from storage", { path: reference.storage_path });
      const { error: storageError } = await supabase.storage
        .from("blueprint-uploads")
        .remove([reference.storage_path]);

      if (storageError) {
        log("WARN", "Storage delete failed (continuing)", { error: storageError.message });
        // Don't fail - continue to delete the reference record
      }
    }

    // Delete reference record
    const { error: deleteError } = await supabase
      .from("blueprint_references")
      .delete()
      .eq("id", reference_id);

    if (deleteError) {
      log("ERROR", "Failed to delete reference record", { error: deleteError.message });
      return new Response(
        JSON.stringify({ error: "Failed to delete reference" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    log("SUCCESS", "Reference deleted", { reference_id });

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[delete-blueprint-reference] ERROR:", errorMessage, error);

    return new Response(
      JSON.stringify({ error: "Delete failed" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
