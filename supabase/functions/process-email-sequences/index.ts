/**
 * process-email-sequences Edge Function
 * 
 * This function is invoked by a cron job (or manual call) to process
 * pending email sequences that are due for sending.
 * 
 * It queries email_sequences WHERE status='pending' AND scheduled_for <= now(),
 * sends the appropriate email template (Email 2 or Email 3), and updates status.
 * 
 * Email 2 (24hr): "We're Processing Your Blueprint"
 *   - Reinforces quality, outlines what happens next
 *   - Includes booking CTA
 * 
 * Email 3 (7day): "Your Blueprint Strategy Window"
 *   - Creates subtle urgency
 *   - Includes booking CTA and portal link
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ── ENV ─────────────────────────────────────────────────────

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY_BLUEPRINTS");

const FROM_EMAIL = "Cleland Studio <blueprints@clelandconsultancy.com>";
const PORTAL_URL = "https://portal.clelandconsultancy.com";
const BOOKING_URL = "https://calendly.com/cleland-studio/strategy-call";

// ── CORS ────────────────────────────────────────────────────

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ── Logging ─────────────────────────────────────────────────

function log(step: string, message: string, data?: Record<string, unknown>) {
  console.log(`[process-email-sequences] ${step}: ${message}`, data ? JSON.stringify(data) : "");
}

function logError(step: string, message: string, error?: unknown) {
  console.error(`[process-email-sequences] ${step} ERROR: ${message}`, error);
}

// ── Helpers ─────────────────────────────────────────────────

function escapeHtml(text: string): string {
  const map: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

function getComplexityTier(score: number): string {
  if (score >= 60) return "Enterprise";
  if (score >= 30) return "Professional";
  return "Essential";
}

function getTierColor(tier: string): string {
  if (tier === "Enterprise") return "#d4a853";
  if (tier === "Professional") return "#2150de";
  return "#4a9b6b";
}

function getTierTextColor(tier: string): string {
  return tier === "Enterprise" ? "#0a0a0f" : "#f5f3ee";
}

// ── Email Templates ─────────────────────────────────────────

function buildEmail2Html(clientName: string, businessName: string, complexityScore?: number): string {
  const tier = complexityScore != null ? getComplexityTier(complexityScore) : null;
  const tierBadgeHtml = tier ? `
      <div style="text-align:center;margin:16px 0;">
        <span style="display:inline-block;padding:6px 16px;background:${getTierColor(tier)};color:${getTierTextColor(tier)};font-size:11px;text-transform:uppercase;letter-spacing:0.05em;font-weight:600;">
          ${tier} Tier
        </span>
      </div>` : '';
  const tierReviewMessage = tier
    ? `Your <strong style="color:#f5f3ee;">${tier}</strong> tier Blueprint is being reviewed by our senior team.`
    : `Your Blueprint is being reviewed by our team.`;

  return `
    <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 48px 24px; background: #0a0a0f; color: #f5f3ee;">
      <h1 style="font-size: 24px; font-weight: 300; margin-bottom: 24px;">
        One question
      </h1>

      <p style="font-size: 16px; line-height: 1.6; color: #b0b0b8;">
        Hi ${clientName},
      </p>

      <p style="font-size: 18px; line-height: 1.6; color: #f5f3ee; font-weight: 400;">
        Who is driving the execution of this Blueprint?
      </p>

      <p style="font-size: 16px; line-height: 1.6; color: #b0b0b8;">
        ${tierReviewMessage}
      </p>

      ${tierBadgeHtml}

      <p style="font-size: 14px; line-height: 1.6; color: #b0b0b8;">
        The decisions you make in the next 48 hours determine whether
        <strong style="color:#f5f3ee;">${businessName}</strong>
        launches with clarity — or stalls with assumptions.
      </p>

      <hr style="border:none;border-top:1px solid #1a1a1f;margin:32px 0;" />

      <div style="margin: 24px 0; text-align: center;">
        <a href="${BOOKING_URL}"
           style="display:inline-block;padding:14px 32px;background:#d4a853;color:#0a0a0f;text-decoration:none;font-weight:500;font-size:13px;letter-spacing:0.04em;text-transform:uppercase;">
          Schedule Your Blueprint Review →
        </a>
      </div>

      <p style="margin-top:48px;font-size:12px;color:#6b6b75;">
        Cleland Studio<br/>
        Crafted digital systems for serious operators
      </p>
    </div>
  `;
}

function buildEmail3Html(clientName: string, _businessName: string): string {
  return `
    <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 48px 24px; background: #0a0a0f; color: #f5f3ee;">
      <p style="font-size: 18px; line-height: 1.6; color: #f5f3ee; font-weight: 400;">
        ${clientName} — if you want this Blueprint built properly, choose your review slot.
      </p>

      <!-- Primary CTA -->
      <div style="margin: 36px 0; text-align: center;">
        <a href="${BOOKING_URL}"
           style="display:inline-block;padding:16px 40px;background:#d4a853;color:#0a0a0f;text-decoration:none;font-weight:600;font-size:14px;letter-spacing:0.04em;text-transform:uppercase;">
          Choose Your Blueprint Review Slot
        </a>
      </div>

      <p style="margin-top:48px;font-size:12px;color:#6b6b75;">
        Cleland Studio<br/>
        Crafted digital systems for serious operators
      </p>
    </div>
  `;
}

// ── MAIN SERVER ─────────────────────────────────────────────

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    if (!RESEND_API_KEY) throw new Error("Missing RESEND_API_KEY_BLUEPRINTS");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Query for pending emails that are due
    log("QUERY", "Fetching due email sequences");
    const { data: dueEmails, error: queryError } = await supabase
      .from("email_sequences")
      .select(`
        id,
        blueprint_id,
        email_type,
        status,
        scheduled_for,
        blueprints!inner (
          id,
          user_email,
          user_name,
          business_name,
          status
        )
      `)
      .eq("status", "pending")
      .lte("scheduled_for", new Date().toISOString())
      .limit(50); // Process in batches of 50

    if (queryError) throw new Error(`Query failed: ${queryError.message}`);
    if (!dueEmails || dueEmails.length === 0) {
      log("DONE", "No due emails to process");
      return new Response(
        JSON.stringify({ success: true, processed: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    log("PROCESS", `Processing ${dueEmails.length} due emails`);

    let processed = 0;
    let errors = 0;

    for (const emailRecord of dueEmails) {
      try {
        // deno-lint-ignore no-explicit-any
        const blueprint = (emailRecord as any).blueprints;
        if (!blueprint || !blueprint.user_email) {
          log("SKIP", "No blueprint or email", { id: emailRecord.id });
          continue;
        }

        // Check if a booking exists — if so, cancel remaining sequence
        const { count: bookingCount } = await supabase
          .from("bookings")
          .select("*", { count: "exact", head: true })
          .eq("email", blueprint.user_email);

        if (bookingCount && bookingCount > 0) {
          log("CANCEL", "Booking found — cancelling email sequence", { id: emailRecord.id });
          await supabase
            .from("email_sequences")
            .update({ status: "cancelled" })
            .eq("id", emailRecord.id);
          continue;
        }

        const clientName = escapeHtml(blueprint.user_name || "there");
        const businessName = escapeHtml(blueprint.business_name || "Your Project");

        // Fetch complexity score for this blueprint
        let complexityScore: number | undefined;
        const { data: scoreData } = await supabase
          .from("blueprint_scores")
          .select("complexity_score")
          .eq("blueprint_id", emailRecord.blueprint_id)
          .single();
        if (scoreData) {
          complexityScore = scoreData.complexity_score;
        }

        let subject: string;
        let html: string;

        if (emailRecord.email_type === "24hr") {
          subject = `We're Processing Your Blueprint — ${businessName}`;
          html = buildEmail2Html(clientName, businessName, complexityScore);
        } else if (emailRecord.email_type === "7day") {
          subject = `One question, ${clientName}`;
          html = buildEmail3Html(clientName, businessName);
        } else {
          log("SKIP", "Unknown email type", { emailType: emailRecord.email_type });
          continue;
        }

        // Send via Resend
        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: FROM_EMAIL,
            to: [blueprint.user_email],
            subject,
            html,
          }),
        });

        if (!emailResponse.ok) {
          const errorText = await emailResponse.text();
          logError("SEND", `Failed to send ${emailRecord.email_type}`, errorText);
          errors++;
          continue;
        }

        // Mark as sent
        await supabase
          .from("email_sequences")
          .update({
            status: "sent",
            sent_at: new Date().toISOString(),
          })
          .eq("id", emailRecord.id);

        processed++;
        log("SENT", `${emailRecord.email_type} email sent`, {
          blueprintId: emailRecord.blueprint_id,
          email: blueprint.user_email,
        });
      } catch (err) {
        logError("PROCESS", `Error processing email ${emailRecord.id}`, err);
        errors++;
      }
    }

    const duration = Date.now() - startTime;
    log("COMPLETE", `Processed ${processed} emails, ${errors} errors`, { duration_ms: duration });

    return new Response(
      JSON.stringify({ success: true, processed, errors, duration_ms: duration }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    logError("FAILED", errorMessage, error);

    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
