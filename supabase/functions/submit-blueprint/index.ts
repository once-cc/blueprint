/**
 * submit-blueprint Edge Function v2
 *
 * Two-phase submission architecture:
 *   Phase 1 (sync) → Validate + score + status update → return 200 immediately
 *   Phase 2 (async) → Email 1 via Resend + HMAC handoff to Console
 *
 * Depends on:
 *   - _shared/scoring.ts (weighted scoring engine)
 *   - _shared/hmac.ts (signForConsole)
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { scoreBlueprint } from "../_shared/scoring.ts";
import { signForConsole } from "../_shared/hmac.ts";

// ── ENV ─────────────────────────────────────────────────────

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
const HMAC_SECRET = Deno.env.get("BLUEPRINT_HMAC_SECRET") || "";
const OPS_CONSOLE_URL = Deno.env.get("OPS_CONSOLE_URL") || "";
const FROM_EMAIL = "Cleland Studio <blueprints@clelandconsultancy.com>";

// ── CORS ────────────────────────────────────────────────────

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type, x-blueprint-token",
};

function respond(body: Record<string, unknown>, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json", ...corsHeaders },
    });
}

// ── Helpers ─────────────────────────────────────────────────

function escapeHtml(text: string): string {
    const map: Record<string, string> = {
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
}

// ── Audit Logger ────────────────────────────────────────────

async function auditLog(
    supabase: ReturnType<typeof createClient>,
    eventType: string,
    blueprintId: string | null,
    req: Request,
    metadata?: Record<string, unknown>,
) {
    try {
        await supabase.from("blueprint_audit_log").insert({
            blueprint_id: blueprintId,
            event_type: eventType,
            ip_address: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null,
            user_agent: req.headers.get("user-agent")?.slice(0, 500) || null,
            metadata: metadata ?? null,
        });
    } catch {
        // Audit logging must never break the pipeline
    }
}

// ── Phase 2: Async Email + HMAC Handoff ─────────────────────

async function phase2(
    supabase: ReturnType<typeof createClient>,
    blueprint: Record<string, unknown>,
    scores: { complexity_score: number; integrity_score: number; complexity_tier: string },
    pdfUrl: string | null,
    req: Request,
) {
    const blueprintId = blueprint.id as string;

    // ── Send Email 1 via Resend ────────────────────────────
    if (RESEND_API_KEY && blueprint.user_email) {
        try {
            const firstName = escapeHtml((blueprint.first_name as string) || "there");
            const businessName = escapeHtml((blueprint.business_name as string) || "Your Project");
            const tierLabel = scores.complexity_tier === "enterprise"
                ? "Enterprise"
                : scores.complexity_tier === "growth"
                    ? "Growth"
                    : "Essential";

            const emailHtml = `
        <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 48px 24px; background: #0a0a0f; color: #f5f3ee;">
          <h1 style="font-size: 28px; font-weight: 300; margin-bottom: 24px;">
            Your Blueprint Has Been Crafted
          </h1>
          <p style="font-size: 16px; line-height: 1.6; color: #b0b0b8;">
            Hi ${firstName},
          </p>
          <p style="font-size: 16px; line-height: 1.6; color: #b0b0b8;">
            Your Blueprint for <strong style="color:#f5f3ee;">${businessName}</strong> is ready.
          </p>
          <div style="padding: 24px; background: #12121a; border: 1px solid #1a1a1f; margin: 24px 0;">
            <p style="font-size: 13px; color: #7a7a85; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 16px;">
              Blueprint Summary
            </p>
            <table style="width: 100%; font-size: 14px; color: #b0b0b8;">
              <tr>
                <td style="padding: 6px 0; color: #7a7a85;">Complexity Tier</td>
                <td style="padding: 6px 0; text-align: right;">
                  <span style="display: inline-block; padding: 4px 12px; background: ${tierLabel === 'Enterprise' ? '#d4a853' : tierLabel === 'Growth' ? '#2150de' : '#4a9b6b'}; color: ${tierLabel === 'Enterprise' ? '#0a0a0f' : '#f5f3ee'}; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em;">
                    ${tierLabel}
                  </span>
                </td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #7a7a85;">Integrity Score</td>
                <td style="padding: 6px 0; text-align: right; color: #f5f3ee;">${scores.integrity_score}/100</td>
              </tr>
            </table>
          </div>
          ${pdfUrl ? `<div style="margin: 36px 0; text-align: center;">
            <a href="${pdfUrl}" style="display:inline-block;padding:16px 40px;background:#d4a853;color:#0a0a0f;text-decoration:none;font-weight:500;font-size:14px;letter-spacing:0.04em;text-transform:uppercase;">
              Download Your Blueprint PDF
            </a>
          </div>` : ''}
          <hr style="border:none;border-top:1px solid #1a1a1f;margin:40px 0;" />
          <p style="margin-top:48px;font-size:12px;color:#6b6b75;">
            Cleland Studio<br/>Crafted digital systems for serious operators
          </p>
        </div>
      `;

            const emailPayload: Record<string, unknown> = {
                from: FROM_EMAIL,
                to: [blueprint.user_email],
                subject: `Your Blueprint Has Been Crafted — ${businessName}`,
                html: emailHtml,
            };

            const emailRes = await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${RESEND_API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(emailPayload),
            });

            const emailResult = await emailRes.json();

            // Track in blueprint_emails
            await supabase.from("blueprint_emails").insert({
                blueprint_id: blueprintId,
                email_type: "submission_receipt",
                status: emailRes.ok ? "sent" : "failed",
                recipient: blueprint.user_email as string,
                resend_id: emailResult?.id || null,
                error: emailRes.ok ? null : JSON.stringify(emailResult),
                sent_at: emailRes.ok ? new Date().toISOString() : null,
            });

            await auditLog(
                supabase,
                emailRes.ok ? "email_sent" : "email_failed",
                blueprintId,
                req,
                { resend_id: emailResult?.id, status: emailRes.status },
            );
        } catch (err) {
            await auditLog(supabase, "email_failed", blueprintId, req, {
                error: String(err),
            });
        }
    }

    // ── HMAC Handoff to Console ────────────────────────────
    if (HMAC_SECRET && OPS_CONSOLE_URL) {
        try {
            const handoffPayload = {
                version: "1.0",
                submission_id: blueprintId,
                created_at: blueprint.created_at,
                lead: {
                    first_name: blueprint.first_name || "",
                    last_name: blueprint.last_name || "",
                    email: blueprint.user_email || "",
                    company: blueprint.business_name || undefined,
                },
                tier: scores.complexity_tier,
                integrity_score: scores.integrity_score,
                pdf_url: pdfUrl || "",
            };

            const body = JSON.stringify(handoffPayload);
            const { signature, timestamp } = await signForConsole(body, HMAC_SECRET);

            const handoffRes = await fetch(
                `${OPS_CONSOLE_URL}/functions/v1/receive-blueprint-submission`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "x-blueprint-signature": signature,
                        "x-blueprint-timestamp": timestamp,
                    },
                    body,
                },
            );

            await auditLog(
                supabase,
                handoffRes.ok ? "hmac_handoff_success" : "hmac_handoff_failed",
                blueprintId,
                req,
                { status: handoffRes.status },
            );
        } catch (err) {
            await auditLog(supabase, "hmac_handoff_failed", blueprintId, req, {
                error: String(err),
            });
        }
    }
}

// ── MAIN SERVER ─────────────────────────────────────────────

Deno.serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { blueprint_id, pdf_url } = await req.json();
        if (!blueprint_id) return respond({ success: false, error: "blueprint_id is required" }, 400);

        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

        // ── Fetch Blueprint ──────────────────────────────────
        const { data: blueprint, error: fetchError } = await supabase
            .from("blueprints")
            .select("*")
            .eq("id", blueprint_id)
            .single();

        if (fetchError || !blueprint) {
            return respond({ success: false, error: "Blueprint not found" }, 404);
        }
        if (blueprint.status === "submitted") {
            return respond({ success: false, error: "Blueprint already submitted" }, 409);
        }

        // ── Validate ─────────────────────────────────────────
        if (!blueprint.user_email) {
            return respond({ success: false, error: "Email is required" }, 400);
        }
        if (!blueprint.first_name) {
            return respond({ success: false, error: "First name is required" }, 400);
        }

        // ── Phase 1 (sync): Score + Status Update ────────────
        const { data: refs } = await supabase
            .from("blueprint_references")
            .select("id")
            .eq("blueprint_id", blueprint_id);

        const scoringInput = {
            discovery: blueprint.discovery || {},
            design: blueprint.design || {},
            deliver: blueprint.deliver || {},
            references_count: refs?.length || 0,
            dream_intent: blueprint.dream_intent,
            first_name: blueprint.first_name,
            last_name: blueprint.last_name,
            user_email: blueprint.user_email,
            business_name: blueprint.business_name,
        };

        const scores = scoreBlueprint(scoringInput);

        // Update blueprint record
        const { error: updateError } = await supabase
            .from("blueprints")
            .update({
                status: "submitted",
                submitted_at: new Date().toISOString(),
                pdf_url: pdf_url || null,
                integrity_score: scores.integrity_score,
                complexity_score: scores.complexity_score,
                complexity_tier: scores.complexity_tier,
            })
            .eq("id", blueprint_id);

        if (updateError) {
            return respond({ success: false, error: "Failed to update blueprint" }, 500);
        }

        // Log submission
        await auditLog(supabase, "submission_created", blueprint_id, req, {
            scores,
            pdf_url: pdf_url || null,
        });

        // ── Phase 2 (async): Email + HMAC ────────────────────
        // Fire and forget — user gets their response immediately
        const phase2Promise = phase2(supabase, blueprint, scores, pdf_url || null, req);

        // Use EdgeRuntime.waitUntil if available, otherwise fire and forget
        try {
            // @ts-ignore — EdgeRuntime may not be in types
            if (typeof EdgeRuntime !== "undefined" && EdgeRuntime.waitUntil) {
                // @ts-ignore
                EdgeRuntime.waitUntil(phase2Promise);
            } else {
                phase2Promise.catch((err) =>
                    console.error("[submit-blueprint] Phase 2 error:", err)
                );
            }
        } catch {
            phase2Promise.catch((err) =>
                console.error("[submit-blueprint] Phase 2 error:", err)
            );
        }

        // ── Return immediately ───────────────────────────────
        return respond({
            success: true,
            scores: {
                integrity: scores.integrity_score,
                complexity: scores.complexity_score,
                tier: scores.complexity_tier,
            },
        });
    } catch (err) {
        console.error("[submit-blueprint] Error:", err);
        return respond(
            { success: false, error: err instanceof Error ? err.message : "Unknown error" },
            500,
        );
    }
});
