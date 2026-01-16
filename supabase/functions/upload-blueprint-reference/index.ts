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
interface UploadRequest {
  blueprint_id: string;
  session_token: string;
  filename: string;
  content_type: string;
  file_base64: string;
  role?: string;
  label?: string;
}

/* ──────────────────────────────────────────────
   HELPERS
────────────────────────────────────────────── */
function log(step: string, message: string, data?: Record<string, unknown>) {
  console.log(`[upload-blueprint-reference] ${step}: ${message}`, data ? JSON.stringify(data) : "");
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
    const { 
      blueprint_id, 
      session_token, 
      filename, 
      content_type, 
      file_base64,
      role,
      label 
    }: UploadRequest = await req.json();

    if (!blueprint_id || !session_token || !filename || !file_base64) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    log("VALIDATE", "Validating session for upload", { blueprint_id, filename });

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

    // Decode base64 file
    const binaryString = atob(file_base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Generate unique storage path
    const randomSuffix = crypto.randomUUID().slice(0, 8);
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
    const storagePath = `${blueprint_id}/references/${randomSuffix}-${sanitizedFilename}`;

    log("UPLOAD", "Uploading to storage", { storagePath, size: bytes.length });

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from("blueprint-uploads")
      .upload(storagePath, bytes, {
        contentType: content_type || "application/octet-stream",
        upsert: false,
      });

    if (uploadError) {
      log("ERROR", "Storage upload failed", { error: uploadError.message });
      return new Response(
        JSON.stringify({ error: "Upload failed" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create reference record
    const { data: reference, error: refError } = await supabase
      .from("blueprint_references")
      .insert({
        blueprint_id,
        type: "image",
        url: storagePath, // Temporary - will be replaced with signed URL when fetched
        storage_path: storagePath,
        filename: sanitizedFilename,
        role: role || null,
        label: label || null,
      })
      .select()
      .single();

    if (refError) {
      log("ERROR", "Failed to create reference record", { error: refError.message });
      return new Response(
        JSON.stringify({ error: "Failed to save reference" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Generate signed URL for immediate use
    const { data: signedData } = await supabase.storage
      .from("blueprint-uploads")
      .createSignedUrl(storagePath, 3600); // 1 hour for editing session

    log("SUCCESS", "Reference uploaded", { reference_id: reference.id });

    return new Response(
      JSON.stringify({
        success: true,
        reference: {
          id: reference.id,
          url: signedData?.signedUrl || storagePath,
          storage_path: storagePath,
          filename: sanitizedFilename,
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[upload-blueprint-reference] ERROR:", errorMessage, error);

    return new Response(
      JSON.stringify({ error: "Upload failed" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
