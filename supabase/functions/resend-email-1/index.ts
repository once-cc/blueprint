/**
 * resend-email-1 Edge Function v2
 *
 * Console triggers re-send of Email 1 for a blueprint.
 * Auth: HMAC verification (Console → Blueprint, colon separator)
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { validateFromConsole } from "../_shared/hmac.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const HMAC_SECRET = Deno.env.get("BLUEPRINT_HMAC_SECRET") || "";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
const FROM_EMAIL = "Cleland Studio <blueprints@clelandconsultancy.com>";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-dashboard-signature, x-dashboard-timestamp",
};

function respond(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ── HMAC Verification ──────────────────────────────
    const body = await req.text();
    const hmacResult = await validateFromConsole(
      req.headers.get("x-dashboard-signature"),
      req.headers.get("x-dashboard-timestamp"),
      body,
      HMAC_SECRET,
    );
    if (!hmacResult.valid) {
      return respond({ success: false, error: hmacResult.error }, 401);
    }

    const { blueprint_id } = JSON.parse(body);
    if (!blueprint_id) return respond({ success: false, error: "blueprint_id required" }, 400);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // ── Fetch Blueprint ────────────────────────────────
    const { data: bp, error } = await supabase
      .from("blueprints")
      .select("*")
      .eq("id", blueprint_id)
      .single();

    if (error || !bp) return respond({ success: false, error: "Blueprint not found" }, 404);
    if (!bp.user_email) return respond({ success: false, error: "No email on blueprint" }, 400);

    // ── Re-send Email 1 ────────────────────────────────
    const firstName = escapeHtml(bp.first_name || "there");
    const businessName = escapeHtml(bp.business_name || "Your Project");
    const tierLabel = bp.complexity_tier === "enterprise" ? "Enterprise"
      : bp.complexity_tier === "growth" ? "Growth" : "Essential";

    const emailHtml = `
      <div style="font-family: system-ui, -apple-system, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 48px 32px; background: #fcfcfc; color: #111111;">

        <!-- Eyebrow -->
        <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; color: #888888; margin-bottom: 8px;">
          Crafted Blueprint
        </p>

        <!-- Headline -->
        <h1 style="font-family: Georgia, 'Times New Roman', serif; font-size: 28px; font-weight: 400; font-style: italic; margin: 0 0 24px 0; color: #111111;">
          Your Blueprint Has Been Crafted
        </h1>

        <p style="font-size: 15px; line-height: 1.7; color: #555555; margin-bottom: 8px;">
          Hi ${firstName},
        </p>
        <p style="font-size: 15px; line-height: 1.7; color: #555555; margin-bottom: 32px;">
          Your Crafted Blueprint for <strong style="color: #111111;">${businessName}</strong> has been received and is ready for review.
        </p>

        <!-- Blueprint Summary Card -->
        <div style="padding: 24px; background: #ffffff; border: 1px solid #e5e5e5; margin-bottom: 32px;">
          <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #888888; margin: 0 0 16px 0;">
            Blueprint Summary
          </p>
          <table style="width: 100%; font-size: 14px; color: #555555; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; color: #888888;">Complexity Tier</td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; text-align: right;">
                <span style="display: inline-block; padding: 4px 14px; border: 1px solid #111111; font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: #111111;">
                  ${tierLabel}
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #888888;">Integrity Score</td>
              <td style="padding: 8px 0; text-align: right; font-family: Georgia, serif; color: #111111;">${bp.integrity_score || '—'}/100</td>
            </tr>
          </table>
        </div>

        <!-- PDF Download CTA -->
        ${bp.pdf_url ? `<div style="text-align: center; margin-bottom: 40px;">
          <a href="${bp.pdf_url}" style="display: inline-block; padding: 14px 36px; border: 1px solid #111111; color: #111111; text-decoration: none; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase;">
            Download Your Blueprint PDF
          </a>
        </div>` : ''}

        <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 0 0 32px 0;" />

        <!-- What Happens Next -->
        <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #888888; margin-bottom: 20px;">
          What happens next
        </p>

        <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 16px 10px 0; vertical-align: top; font-family: Georgia, serif; color: #888888; width: 28px;">01</td>
            <td style="padding: 10px 0;">
              <strong style="color: #111111; font-size: 14px;">Blueprint Review</strong><br/>
              <span style="color: #888888; font-size: 13px;">Our team reviews your Blueprint within 24 hours.</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 16px 10px 0; vertical-align: top; font-family: Georgia, serif; color: #888888;">02</td>
            <td style="padding: 10px 0;">
              <strong style="color: #111111; font-size: 14px;">Personalised Strategy</strong><br/>
              <span style="color: #888888; font-size: 13px;">You receive a tailored proposal — no generic templates.</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 16px 10px 0; vertical-align: top; font-family: Georgia, serif; color: #888888;">03</td>
            <td style="padding: 10px 0;">
              <strong style="color: #111111; font-size: 14px;">Strategy Call</strong><br/>
              <span style="color: #888888; font-size: 13px;">We walk through your roadmap and answer every question.</span>
            </td>
          </tr>
        </table>

        <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 32px 0;" />

        <!-- Request Strategy CTA -->
        <p style="font-size: 14px; color: #555555; text-align: center; margin-bottom: 8px;">
          <strong style="color: #111111;">Ready to take the next step?</strong>
        </p>
        <p style="font-size: 13px; color: #888888; text-align: center; margin-bottom: 20px;">
          Request a strategy call and we'll be in touch within 24 hours.
        </p>
        <div style="text-align: center; margin-bottom: 8px;">
          <a href="https://cleland.studio/strategy" style="display: inline-block; padding: 14px 36px; border: 1px solid #111111; color: #111111; text-decoration: none; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase;">
            Request a Strategy Call
          </a>
        </div>
        <p style="font-size: 11px; color: #aaaaaa; text-align: center; margin-bottom: 0;">
          No obligation · We'll reach out within 24 hours
        </p>

        <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 40px 0 24px 0;" />

        <!-- Footer -->
        <p style="font-size: 11px; color: #aaaaaa; margin: 0;">
          Cleland Studio<br/>Crafted digital systems for serious operators
        </p>
      </div>
    `;

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [bp.user_email],
        subject: `Your Blueprint Has Been Crafted — ${businessName}`,
        html: emailHtml,
      }),
    });

    const emailResult = await emailRes.json();

    // Track in blueprint_emails
    await supabase.from("blueprint_emails").insert({
      blueprint_id,
      email_type: "submission_receipt",
      status: emailRes.ok ? "sent" : "failed",
      recipient: bp.user_email,
      resend_id: emailResult?.id || null,
      error: emailRes.ok ? null : JSON.stringify(emailResult),
      sent_at: emailRes.ok ? new Date().toISOString() : null,
    });

    // Audit log
    await supabase.from("blueprint_audit_log").insert({
      blueprint_id,
      event_type: "email_resent",
      description: emailRes.ok ? "Email 1 re-sent successfully" : "Email 1 re-send failed",
      metadata: { resend_id: emailResult?.id, triggered_by: "console" },
    });

    return respond({ success: emailRes.ok, resend_id: emailResult?.id });
  } catch (err) {
    console.error("[resend-email-1] Error:", err);
    return respond(
      { success: false, error: err instanceof Error ? err.message : "Unknown error" },
      500,
    );
  }
});
