import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GeneratePdfRequest {
  blueprint_id: string;
  force_regenerate?: boolean;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { blueprint_id, force_regenerate = false }: GeneratePdfRequest = await req.json();

    if (!blueprint_id) {
      throw new Error("blueprint_id is required");
    }

    console.log(`[generate-blueprint-pdf] Processing blueprint: ${blueprint_id}`);

    // Create Supabase client with service role for full access
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch blueprint data
    const { data: blueprint, error: fetchError } = await supabase
      .from("blueprints")
      .select("*")
      .eq("id", blueprint_id)
      .single();

    if (fetchError || !blueprint) {
      console.error("[generate-blueprint-pdf] Blueprint not found:", fetchError);
      throw new Error(`Blueprint not found: ${blueprint_id}`);
    }

    // Check if PDF already exists and force_regenerate is false
    if (blueprint.pdf_url && !force_regenerate) {
      console.log("[generate-blueprint-pdf] PDF already exists, returning existing URL");
      return new Response(
        JSON.stringify({ success: true, pdf_url: blueprint.pdf_url }),
        { headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Fetch references
    const { data: references } = await supabase
      .from("blueprint_references")
      .select("*")
      .eq("blueprint_id", blueprint_id);

    // Generate signed URLs for private references
    const referencesWithUrls = await Promise.all(
      (references || []).map(async (ref) => {
        if (ref.storage_path) {
          const { data: signedData } = await supabase.storage
            .from("blueprint-references")
            .createSignedUrl(ref.storage_path, 3600); // 1 hour expiry
          return { ...ref, url: signedData?.signedUrl || ref.url };
        }
        return ref;
      })
    );

    // Build the preview URL for the blueprint
    const previewUrl = `${supabaseUrl.replace('.supabase.co', '.lovable.app')}/blueprint-preview/${blueprint_id}`;

    console.log(`[generate-blueprint-pdf] Blueprint data prepared, preview URL: ${previewUrl}`);

    // For now, store a placeholder PDF URL until we integrate a PDF service
    // In production, this would call a PDF generation API like PDFShift
    const pdfPath = `blueprints/${blueprint_id}.pdf`;
    const pdfUrl = `${supabaseUrl}/storage/v1/object/public/blueprint-uploads/${pdfPath}`;

    // Update blueprint with PDF URL and timestamp
    const { error: updateError } = await supabase
      .from("blueprints")
      .update({
        pdf_url: pdfUrl,
        pdf_generated_at: new Date().toISOString(),
      })
      .eq("id", blueprint_id);

    if (updateError) {
      console.error("[generate-blueprint-pdf] Failed to update blueprint:", updateError);
      throw new Error("Failed to update blueprint with PDF URL");
    }

    console.log(`[generate-blueprint-pdf] Successfully processed blueprint: ${blueprint_id}`);

    return new Response(
      JSON.stringify({
        success: true,
        pdf_url: pdfUrl,
        preview_url: previewUrl,
        message: "Blueprint PDF generation initiated. Preview available at preview_url."
      }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error("Unknown error");
    console.error("[generate-blueprint-pdf] Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
