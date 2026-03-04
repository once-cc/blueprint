import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

/* ──────────────────────────────────────────────
   ENV
────────────────────────────────────────────── */
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const PDFSHIFT_API_KEY = Deno.env.get("PDFSHIFT_API_KEY");
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY_BLUEPRINTS");
const STUDIO_EMAIL = Deno.env.get("STUDIO_EMAIL") || "";

const FROM_EMAIL = "Cleland Studio <blueprints@clelandconsultancy.com>";
const PORTAL_URL = "https://portal.clelandconsultancy.com";
const ACCESS_CODE = "CCH0R$369";

// Base URL for the preview (Lovable app domain)
const APP_BASE_URL = SUPABASE_URL.replace(".supabase.co", ".lovableproject.com");

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
interface GenerateAndSendRequest {
  blueprint_id: string;
}

interface BlueprintRecord {
  id: string;
  status: string;
  user_email: string | null;
  user_name: string | null;
  business_name: string | null;
  pdf_url: string | null;
  discovery: Record<string, unknown>;
  design: Record<string, unknown>;
  deliver: Record<string, unknown>;
}

/* ──────────────────────────────────────────────
   HELPERS
────────────────────────────────────────────── */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function log(step: string, message: string, data?: Record<string, unknown>) {
  console.log(`[generate-and-send-blueprint] ${step}: ${message}`, data ? JSON.stringify(data) : "");
}

function logError(step: string, message: string, error?: unknown) {
  console.error(`[generate-and-send-blueprint] ${step} ERROR: ${message}`, error);
}

/* ──────────────────────────────────────────────
   STEP 0: Generate Access Tokens
────────────────────────────────────────────── */
async function generateAccessTokens(
  supabase: SupabaseClient,
  blueprintId: string
): Promise<{ previewToken: string; downloadToken: string; internalToken: string }> {
  log("TOKENS", "Generating access tokens", { blueprintId });

  // Revoke any existing tokens for this blueprint
  await supabase
    .from("blueprint_access_tokens")
    .update({ revoked_at: new Date().toISOString() })
    .eq("blueprint_id", blueprintId)
    .is("revoked_at", null);

  // Generate new tokens
  const previewToken = crypto.randomUUID();
  const downloadToken = crypto.randomUUID();
  const internalToken = crypto.randomUUID();

  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

  // Hash tokens before storage
  const previewTokenHash = await hashToken(previewToken);
  const downloadTokenHash = await hashToken(downloadToken);
  const internalTokenHash = await hashToken(internalToken);

  // Insert new tokens
  const { error: tokenError } = await supabase.from("blueprint_access_tokens").insert([
    {
      blueprint_id: blueprintId,
      token_hash: previewTokenHash,
      scope: "preview",
      expires_at: sevenDaysFromNow.toISOString(),
    },
    {
      blueprint_id: blueprintId,
      token_hash: downloadTokenHash,
      scope: "download",
      expires_at: sevenDaysFromNow.toISOString(),
    },
    {
      blueprint_id: blueprintId,
      token_hash: internalTokenHash,
      scope: "internal",
      expires_at: fiveMinutesFromNow.toISOString(), // Short-lived for PDFShift
    },
  ]);

  if (tokenError) {
    throw new Error(`Failed to create access tokens: ${tokenError.message}`);
  }

  log("TOKENS", "Access tokens generated", {
    previewExpiry: sevenDaysFromNow.toISOString(),
    internalExpiry: fiveMinutesFromNow.toISOString()
  });

  return { previewToken, downloadToken, internalToken };
}

/* ──────────────────────────────────────────────
   STEP 1: Generate PDF via PDFShift
────────────────────────────────────────────── */
async function generatePdf(blueprintId: string, internalToken: string): Promise<Uint8Array> {
  if (!PDFSHIFT_API_KEY) {
    throw new Error("Missing PDFSHIFT_API_KEY secret");
  }

  // Use internal token for PDFShift access (short-lived, secure)
  const previewUrl = `${APP_BASE_URL}/blueprint/pdf-preview?blueprint_id=${blueprintId}&token=${internalToken}`;
  log("PDF", "Generating from URL", { previewUrl: previewUrl.replace(internalToken, "[REDACTED]") });

  const response = await fetch("https://api.pdfshift.io/v3/convert/pdf", {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`api:${PDFSHIFT_API_KEY}`)}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      source: previewUrl,
      format: "A4",
      use_print: true,
      delay: 3000, // Wait 3s for fonts/animations to load
      css: `
        @media print {
          body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`PDFShift error: ${response.status} - ${errorText}`);
  }

  const pdfBuffer = await response.arrayBuffer();
  log("PDF", "Generated successfully", { size: pdfBuffer.byteLength });

  return new Uint8Array(pdfBuffer);
}

/* ──────────────────────────────────────────────
   STEP 2: Upload PDF to Storage (with randomized path)
────────────────────────────────────────────── */
async function uploadPdf(
  supabase: SupabaseClient,
  blueprintId: string,
  pdfBuffer: Uint8Array
): Promise<{ storagePath: string; signedUrl: string }> {
  // Generate non-guessable filename
  const randomSuffix = crypto.randomUUID().slice(0, 8);
  const storagePath = `${blueprintId}/${randomSuffix}-crafted-blueprint.pdf`;

  log("UPLOAD", "Uploading to storage", { path: storagePath, size: pdfBuffer.byteLength });

  const { error: uploadError } = await supabase.storage
    .from("blueprint-uploads")
    .upload(storagePath, pdfBuffer, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Storage upload failed: ${uploadError.message}`);
  }

  // Generate signed URL for studio access (bucket is now private)
  const { data: signedData, error: signedError } = await supabase.storage
    .from("blueprint-uploads")
    .createSignedUrl(storagePath, 3600); // 1 hour for studio notification email

  if (signedError) {
    throw new Error(`Failed to generate signed URL: ${signedError.message}`);
  }

  log("UPLOAD", "Upload complete", { storagePath });

  return { storagePath, signedUrl: signedData.signedUrl };
}

/* ──────────────────────────────────────────────
   STEP 3: Update Blueprint Record
────────────────────────────────────────────── */
async function updateBlueprintRecord(
  supabase: SupabaseClient,
  blueprintId: string,
  storagePath: string,
  signedUrl: string
): Promise<void> {
  log("UPDATE", "Updating blueprint record", { blueprintId, storagePath });

  const { error } = await supabase
    .from("blueprints")
    .update({
      pdf_url: signedUrl, // Store signed URL (will expire, but for reference)
      pdf_object_path: storagePath, // Store actual path for secure access
      pdf_generated_at: new Date().toISOString(),
    })
    .eq("id", blueprintId);

  if (error) {
    throw new Error(`Failed to update blueprint: ${error.message}`);
  }

  log("UPDATE", "Blueprint record updated");
}

/* ──────────────────────────────────────────────
   STEP 4: Send Emails via Resend
────────────────────────────────────────────── */
async function sendEmails(
  blueprint: BlueprintRecord,
  pdfBuffer: Uint8Array,
  previewToken: string,
  studioSignedUrl: string
): Promise<void> {
  if (!RESEND_API_KEY) {
    throw new Error("Missing RESEND_API_KEY_BLUEPRINTS secret");
  }

  const businessName = escapeHtml(blueprint.business_name || "Your Project");
  const clientName = escapeHtml(blueprint.user_name || "there");
  const recipientEmail = blueprint.user_email;

  if (!recipientEmail) {
    log("EMAIL", "Skipping - no recipient email");
    return;
  }

  // Convert PDF buffer to base64 for attachment
  const pdfBase64 = btoa(String.fromCharCode(...pdfBuffer));

  // Build secure preview URL with time-limited token
  const securePreviewUrl = `${APP_BASE_URL}/blueprint-preview/${blueprint.id}?token=${previewToken}`;

  const clientEmailHtml = `
    <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 48px 24px; background: #0a0a0f; color: #f5f3ee;">
      <h1 style="font-size: 28px; font-weight: 300; margin-bottom: 24px;">
        Your Crafted Blueprint is Ready
      </h1>

      <p style="font-size: 16px; line-height: 1.6; color: #b0b0b8;">
        Hi ${clientName},
      </p>

      <p style="font-size: 16px; line-height: 1.6; color: #b0b0b8;">
        Your Crafted Blueprint for
        <strong style="color:#f5f3ee;">${businessName}</strong>
        is complete.
        This document captures your intent, structure, and direction — distilled into a studio-grade plan.
      </p>

      <p style="font-size: 14px; line-height: 1.6; color: #b0b0b8; margin-top: 16px;">
        Your Blueprint PDF is attached to this email.
      </p>

      <!-- Primary CTA: View Blueprint Online (secure link) -->
      <div style="margin: 36px 0; text-align: center;">
        <a href="${securePreviewUrl}"
           style="display:inline-block;padding:16px 40px;background:#d4a853;color:#0a0a0f;text-decoration:none;font-weight:500;font-size:14px;letter-spacing:0.04em;text-transform:uppercase;">
          View Your Blueprint
        </a>
        <p style="font-size:11px;color:#7a7a85;margin-top:12px;">
          (Secure link expires in 7 days)
        </p>
      </div>

      <hr style="border:none;border-top:1px solid #1a1a1f;margin:40px 0;" />

      <!-- Portal Access Section -->
      <p style="font-size:14px;color:#b0b0b8;line-height:1.6;">
        Your Blueprint also unlocks access to our private client workspace, where alignment and next steps continue.
      </p>

      <!-- Secondary CTA: Enter Client Portal -->
      <div style="margin: 24px 0; text-align: center;">
        <a href="${PORTAL_URL}"
           style="display:inline-block;padding:14px 32px;border:1px solid #2150de;color:#2150de;text-decoration:none;font-size:13px;">
          Enter the Client Portal
        </a>
      </div>

      <p style="font-size:12px;color:#7a7a85;text-align:center;margin-bottom:24px;">
        Your private workspace for next steps, documents, and correspondence.
      </p>

      <!-- Access Code Block -->
      <div style="text-align:center;padding:24px;background:#12121a;border:1px solid #1a1a1f;margin:24px 0;">
        <p style="font-size:12px;color:#7a7a85;margin-bottom:12px;text-transform:uppercase;letter-spacing:0.05em;">
          Client Portal Access Code
        </p>
        <code style="display:inline-block;padding:12px 24px;background:#0a0a0f;border:1px solid #d4a853;font-family:monospace;font-size:18px;letter-spacing:0.12em;color:#d4a853;">
          ${ACCESS_CODE}
        </code>
      </div>

      <hr style="border:none;border-top:1px solid #1a1a1f;margin:32px 0;" />

      <!-- Tertiary CTA: Book a Clarity Call -->
      <p style="font-size:14px;color:#7a7a85;text-align:center;">
        When you're ready to discuss next steps:
      </p>
      <p style="text-align:center;">
        <a href="${PORTAL_URL}" style="color:#7a7a85;text-decoration:none;font-size:13px;">
          Book a Clarity Call →
        </a>
      </p>

      <p style="margin-top:48px;font-size:12px;color:#6b6b75;">
        Cleland Studio<br/>
        Crafted digital systems for serious operators
      </p>
    </div>
  `;

  // Send client email with PDF attachment
  log("EMAIL", "Sending to client", { email: recipientEmail });

  const clientEmailResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [recipientEmail],
      subject: `Your Crafted Blueprint — ${businessName}`,
      html: clientEmailHtml,
      attachments: [
        {
          filename: "Crafted-Blueprint.pdf",
          content: pdfBase64,
        },
      ],
    }),
  });

  if (!clientEmailResponse.ok) {
    const errorText = await clientEmailResponse.text();
    logError("EMAIL", `Client email failed: ${errorText}`);
    throw new Error(`Resend API error: ${errorText}`);
  }

  log("EMAIL", "Client email sent successfully");

  // Send studio notification (with signed URL for studio access)
  if (STUDIO_EMAIL) {
    const studioEmailHtml = `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
        <h2>New Blueprint Submitted</h2>
        <p><strong>Business:</strong> ${businessName}</p>
        <p><strong>Client:</strong> ${clientName}</p>
        <p><strong>Email:</strong> ${escapeHtml(recipientEmail)}</p>
        <p style="margin-top:24px;">
          <a href="${securePreviewUrl}">View Blueprint →</a>
        </p>
        <p style="margin-top:16px;">
          <a href="${studioSignedUrl}">Download PDF (1 hour link) →</a>
        </p>
        <p style="font-size:12px;color:#666;margin-top:24px;">
          Note: PDF download link expires in 1 hour. Use the studio portal for permanent access.
        </p>
      </div>
    `;

    log("EMAIL", "Sending to studio", { email: STUDIO_EMAIL });

    const studioEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [STUDIO_EMAIL],
        subject: `New Blueprint: ${businessName}`,
        html: studioEmailHtml,
      }),
    });

    if (!studioEmailResponse.ok) {
      const errorText = await studioEmailResponse.text();
      logError("EMAIL", `Studio email failed: ${errorText}`);
      // Don't throw - studio email failure shouldn't block client delivery
    } else {
      log("EMAIL", "Studio email sent successfully");
    }
  }
}

/* ──────────────────────────────────────────────
   MAIN SERVER
────────────────────────────────────────────── */
serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    // Parse input
    const { blueprint_id }: GenerateAndSendRequest = await req.json();

    if (!blueprint_id) {
      throw new Error("blueprint_id is required");
    }

    log("START", "Beginning delivery pipeline", { blueprint_id });

    // Create service-role client (bypasses RLS)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch blueprint
    log("FETCH", "Fetching blueprint", { blueprint_id });
    const { data: blueprint, error: fetchError } = await supabase
      .from("blueprints")
      .select("*")
      .eq("id", blueprint_id)
      .single();

    if (fetchError || !blueprint) {
      throw new Error(`Blueprint not found: ${blueprint_id}`);
    }

    // Validate status
    if (blueprint.status !== "submitted") {
      throw new Error(`Blueprint status must be 'submitted', got '${blueprint.status}'`);
    }

    log("FETCH", "Blueprint fetched", {
      businessName: blueprint.business_name,
      userEmail: blueprint.user_email,
      status: blueprint.status
    });

    // Step 0: Generate access tokens (revokes old ones first)
    const { previewToken, internalToken } = await generateAccessTokens(supabase, blueprint_id);

    // Step 1: Generate PDF (using internal token for secure PDFShift access)
    const pdfBuffer = await generatePdf(blueprint_id, internalToken);

    // Step 2: Upload to storage (randomized path)
    const { storagePath, signedUrl } = await uploadPdf(supabase, blueprint_id, pdfBuffer);

    // Step 3: Update blueprint record with secure path
    await updateBlueprintRecord(supabase, blueprint_id, storagePath, signedUrl);

    // Step 4: Send emails with secure preview token
    await sendEmails(blueprint as BlueprintRecord, pdfBuffer, previewToken, signedUrl);

    const duration = Date.now() - startTime;
    log("COMPLETE", "Delivery pipeline finished", {
      blueprint_id,
      duration_ms: duration
    });

    return new Response(
      JSON.stringify({
        success: true,
        duration_ms: duration
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logError("FAILED", errorMessage, error);

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
