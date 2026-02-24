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
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 48px 24px; background: #0a0a0f; color: #f5f3ee;">
        <h1 style="font-size: 28px; font-weight: 300; margin-bottom: 24px;">Your Blueprint Has Been Crafted</h1>
        <p style="font-size: 16px; line-height: 1.6; color: #b0b0b8;">Hi ${firstName},</p>
        <p style="font-size: 16px; line-height: 1.6; color: #b0b0b8;">
          Your Blueprint for <strong style="color:#f5f3ee;">${businessName}</strong> is ready.
        </p>
        <div style="padding: 24px; background: #12121a; border: 1px solid #1a1a1f; margin: 24px 0;">
          <table style="width: 100%; font-size: 14px; color: #b0b0b8;">
            <tr>
              <td style="padding: 6px 0; color: #7a7a85;">Complexity Tier</td>
              <td style="padding: 6px 0; text-align: right;">
                <span style="padding: 4px 12px; background: ${tierLabel === 'Enterprise' ? '#d4a853' : tierLabel === 'Growth' ? '#2150de' : '#4a9b6b'}; color: ${tierLabel === 'Enterprise' ? '#0a0a0f' : '#f5f3ee'}; font-size: 11px; text-transform: uppercase;">
                  ${tierLabel}
                </span>
              </td>
            </tr>
          </table>
        </div>
        ${bp.pdf_url ? `<div style="margin: 36px 0; text-align: center;">
          <a href="${bp.pdf_url}" style="display:inline-block;padding:16px 40px;background:#d4a853;color:#0a0a0f;text-decoration:none;font-weight:500;font-size:14px;text-transform:uppercase;">
            Download Your Blueprint PDF
          </a>
        </div>` : ''}
        <p style="margin-top:48px;font-size:12px;color:#6b6b75;">Cleland Studio</p>
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
