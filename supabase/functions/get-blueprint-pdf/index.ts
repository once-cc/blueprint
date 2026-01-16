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
interface PdfRequest {
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
  console.log(`[get-blueprint-pdf] ${step}: ${message}`, data ? JSON.stringify(data) : "");
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
    const { blueprint_id, token }: PdfRequest = await req.json();

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

    log("VALIDATE", "Validating download token", { blueprint_id });

    // Create service role client (bypasses RLS)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Hash the provided token
    const tokenHash = await hashToken(token);

    // Check for valid download token
    const { data: accessToken, error: tokenError } = await supabase
      .from("blueprint_access_tokens")
      .select("*")
      .eq("blueprint_id", blueprint_id)
      .eq("token_hash", tokenHash)
      .eq("scope", "download")
      .gt("expires_at", new Date().toISOString())
      .is("revoked_at", null)
      .limit(1)
      .single();

    if (tokenError || !accessToken) {
      log("DENIED", "Invalid or expired download token", { blueprint_id });
      return new Response(
        JSON.stringify({ error: "Invalid or expired download link" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Mark token as used
    await supabase
      .from("blueprint_access_tokens")
      .update({ used_at: new Date().toISOString() })
      .eq("id", accessToken.id);

    log("VALIDATED", "Download token valid", { token_id: accessToken.id });

    // Get PDF path from database
    const { data: blueprint, error: blueprintError } = await supabase
      .from("blueprints")
      .select("pdf_object_path, status")
      .eq("id", blueprint_id)
      .single();

    if (blueprintError || !blueprint) {
      log("NOT_FOUND", "Blueprint not found", { blueprint_id });
      return new Response(
        JSON.stringify({ error: "Blueprint not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!blueprint.pdf_object_path) {
      log("NOT_FOUND", "PDF not generated yet", { blueprint_id });
      return new Response(
        JSON.stringify({ error: "PDF not available" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Generate signed URL (10 minute expiry)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from("blueprint-uploads")
      .createSignedUrl(blueprint.pdf_object_path, 600);

    if (signedUrlError || !signedUrlData?.signedUrl) {
      log("ERROR", "Failed to generate signed URL", { error: signedUrlError });
      return new Response(
        JSON.stringify({ error: "Failed to generate download link" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    log("SUCCESS", "Returning signed PDF URL", { blueprint_id, expires_in: 600 });

    return new Response(
      JSON.stringify({
        url: signedUrlData.signedUrl,
        expires_in: 600,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[get-blueprint-pdf] ERROR:", errorMessage, error);

    return new Response(
      JSON.stringify({ error: "Failed to generate PDF link" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
