import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/* ──────────────────────────────────────────────
   ENV
────────────────────────────────────────────── */
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY_BLUEPRINTS");
const STUDIO_EMAIL = Deno.env.get("STUDIO_EMAIL") || "";
const FROM_EMAIL = "Cleland Studio <blueprints@clelandconsultancy.com>";
const PORTAL_URL = "https://portal.clelandconsultancy.com";

// Static access code for Phase 3 (v1)
const ACCESS_CODE = "CCH0R$369";

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
interface SendBlueprintEmailRequest {
  blueprint_id: string;
  recipient_email: string;
  include_studio?: boolean;
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

async function sendEmail(to: string[], subject: string, html: string) {
  if (!RESEND_API_KEY) {
    throw new Error("Missing RESEND_API_KEY_BLUEPRINTS secret");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Resend API error: ${error}`);
  }

  return response.json();
}

/* ──────────────────────────────────────────────
   SERVER
────────────────────────────────────────────── */
serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { blueprint_id, recipient_email, include_studio = true }: SendBlueprintEmailRequest = await req.json();

    if (!blueprint_id || !recipient_email) {
      throw new Error("blueprint_id and recipient_email are required");
    }

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: blueprint, error } = await supabase.from("blueprints").select("*").eq("id", blueprint_id).single();

    if (error || !blueprint) {
      throw new Error(`Blueprint not found: ${blueprint_id}`);
    }

    const businessName = escapeHtml(blueprint.business_name || "Your Project");
    const clientName = escapeHtml(blueprint.user_name || "there");

    const previewUrl =
      `${Deno.env.get("SUPABASE_URL")!.replace(".supabase.co", ".lovable.app")}` + `/blueprint-preview/${blueprint_id}`;

    /* ──────────────────────────────────────────────
       CLIENT EMAIL
    ────────────────────────────────────────────── */
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

        <!-- Primary CTA: View Blueprint -->
        <div style="margin: 36px 0; text-align: center;">
          <a href="${previewUrl}"
             style="display:inline-block;padding:16px 40px;background:#d4a853;color:#0a0a0f;text-decoration:none;font-weight:500;font-size:14px;letter-spacing:0.04em;text-transform:uppercase;">
            View Your Blueprint
          </a>
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

    /* ──────────────────────────────────────────────
       STUDIO EMAIL
    ────────────────────────────────────────────── */
    const studioEmailHtml = `
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
        <h2>New Blueprint Submitted</h2>
        <p><strong>Business:</strong> ${businessName}</p>
        <p><strong>Client:</strong> ${clientName}</p>
        <p><strong>Email:</strong> ${escapeHtml(recipient_email)}</p>
        <p style="margin-top:24px;">
          <a href="${previewUrl}">View Blueprint →</a>
        </p>
      </div>
    `;

    await sendEmail([recipient_email], `Your Crafted Blueprint — ${businessName}`, clientEmailHtml);

    if (include_studio && STUDIO_EMAIL) {
      await sendEmail([STUDIO_EMAIL], `New Blueprint: ${businessName}`, studioEmailHtml);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("[send-blueprint-email]", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
