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
interface PreviewRequest {
  blueprint_id: string;
  token: string;
}

/* ──────────────────────────────────────────────
   HELPERS
────────────────────────────────────────────── */
async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function log(step: string, message: string, data?: Record<string, unknown>) {
  console.log(`[get-blueprint-preview] ${step}: ${message}`, data ? JSON.stringify(data) : "");
}

/**
 * Sanitize blueprint data for preview - remove PII and internal fields
 */
function sanitizeForPreview(blueprint: Record<string, unknown>): Record<string, unknown> {
  return {
    id: blueprint.id,
    business_name: blueprint.business_name,
    dream_intent: blueprint.dream_intent,
    discovery: blueprint.discovery,
    design: blueprint.design,
    deliver: blueprint.deliver,
    created_at: blueprint.created_at,
    submitted_at: blueprint.submitted_at,
    // EXCLUDED: user_email, user_name, session_token, session_token_hash, pdf_url, pdf_object_path
  };
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
    const { blueprint_id, token }: PreviewRequest = await req.json();

    if (!blueprint_id) {
      return new Response(
        JSON.stringify({ error: "blueprint_id is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!token) {
      return new Response(
        JSON.stringify({ error: "Access token is required" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    log("VALIDATE", "Validating access token", { blueprint_id });

    // Create service role client (bypasses RLS)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Hash the provided token
    const tokenHash = await hashToken(token);

    // Check for valid access token in blueprint_access_tokens table
    const { data: accessToken, error: tokenError } = await supabase
      .from("blueprint_access_tokens")
      .select("*")
      .eq("blueprint_id", blueprint_id)
      .eq("token_hash", tokenHash)
      .in("scope", ["preview", "internal"])
      .gt("expires_at", new Date().toISOString())
      .is("revoked_at", null)
      .limit(1)
      .single();

    if (tokenError || !accessToken) {
      log("DENIED", "Invalid or expired access token", { blueprint_id });
      return new Response(
        JSON.stringify({ error: "Invalid or expired access link" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Mark token as used (for audit trail)
    await supabase
      .from("blueprint_access_tokens")
      .update({ used_at: new Date().toISOString() })
      .eq("id", accessToken.id);

    log("VALIDATED", "Access token valid", { token_id: accessToken.id, scope: accessToken.scope });

    // Fetch blueprint data
    const { data: blueprint, error: blueprintError } = await supabase
      .from("blueprints")
      .select("*")
      .eq("id", blueprint_id)
      .eq("status", "submitted")
      .single();

    if (blueprintError || !blueprint) {
      log("NOT_FOUND", "Blueprint not found or not submitted", { blueprint_id });
      return new Response(
        JSON.stringify({ error: "Blueprint not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Fetch references
    const { data: references } = await supabase
      .from("blueprint_references")
      .select("*")
      .eq("blueprint_id", blueprint_id);

    // Generate signed URLs for reference images
    const referencesWithSignedUrls = await Promise.all(
      (references || []).map(async (ref) => {
        if (ref.storage_path) {
          const { data: signedData } = await supabase.storage
            .from("blueprint-uploads")
            .createSignedUrl(ref.storage_path, 600); // 10 minute expiry

          return {
            ...ref,
            url: signedData?.signedUrl || ref.url,
          };
        }
        return ref;
      })
    );

    log("SUCCESS", "Returning sanitized blueprint", { blueprint_id });

    return new Response(
      JSON.stringify({
        blueprint: sanitizeForPreview(blueprint),
        references: referencesWithSignedUrls,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[get-blueprint-preview] ERROR:", errorMessage, error);

    return new Response(
      JSON.stringify({ error: "Failed to load blueprint" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
