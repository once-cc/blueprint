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
const FROM_EMAIL = "Cleland Studio <crafted@cleland.studio>";

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

// ── Retry Helper ────────────────────────────────────────────

async function fetchWithRetry(
    url: string,
    options: RequestInit,
    maxRetries = 3,
): Promise<Response> {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        const res = await fetch(url, options);

        // Never retry client errors (400/401/404) — these are permanent failures
        if (res.status < 500) return res;

        // On server error, retry with exponential backoff
        if (attempt < maxRetries) {
            const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
            await new Promise((r) => setTimeout(r, delay));
        } else {
            return res; // Final attempt, return whatever we got
        }
    }
    // TypeScript safety — unreachable
    throw new Error("fetchWithRetry: exhausted retries");
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

            // Extract discovery data for summary
            const discovery = (blueprint.discovery || {}) as Record<string, unknown>;
            const primaryPurpose = escapeHtml((discovery.primaryPurpose as string) || '');
            const conversionGoals = (discovery.conversionGoals as string[]) || [];
            const secondaryPurposes = (discovery.secondaryPurposes as string[]) || [];

            // Build dynamic summary rows (using · separator)
            const goalsText = primaryPurpose
                ? [primaryPurpose, ...secondaryPurposes.map(s => escapeHtml(s))].join(' · ')
                : null;
            const constraintsText = conversionGoals.length
                ? conversionGoals.map(g => escapeHtml(g)).join(' · ')
                : null;

            const emailHtml = `
        <div style="font-family: system-ui, -apple-system, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 48px 32px; background: #fcfcfc; color: #111111;">

          <!-- Headline -->
          <h1 style="font-family: Georgia, 'Times New Roman', serif; font-size: 28px; font-weight: 400; font-style: italic; margin: 0 0 24px 0; color: #111111;">
            Your Strategic Blueprint is Ready
          </h1>

          <p style="font-size: 15px; line-height: 1.7; color: #555555; margin-bottom: 8px;">
            Hi ${firstName},
          </p>
          <p style="font-size: 15px; line-height: 1.7; color: #555555; margin-bottom: 8px;">
            Your Strategic Blueprint for <strong style="color: #111111;">${businessName}</strong> has been prepared for you.
          </p>
          <p style="font-size: 15px; line-height: 1.7; color: #555555; margin-bottom: 8px;">
            We've mapped the discovery, design, and delivery of the digital architecture and direction required to support your next stage of growth.
          </p>
          <p style="font-size: 15px; line-height: 1.7; color: #555555; margin-bottom: 32px;">
            This document defines this direction before design, development, or investment begins.
          </p>

          <!-- Transition -->
          <p style="font-size: 15px; line-height: 1.7; color: #555555; margin-bottom: 4px;">
            Several useful signals emerged from your responses.
          </p>
          <p style="font-size: 15px; line-height: 1.7; color: #555555; margin-bottom: 20px;">
            Below is a short summary.
          </p>

          <!-- Blueprint Summary Card -->
          <div style="padding: 24px; background: #ffffff; border: 1px solid #e5e5e5; margin-bottom: 32px;">
            <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #888888; margin: 0 0 16px 0;">
              Blueprint Summary
            </p>
            <table style="width: 100%; font-size: 14px; color: #555555; border-collapse: collapse;">
              ${constraintsText ? `<tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; color: #888888; vertical-align: top;">Primary Constraints</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; text-align: right; color: #111111;">${constraintsText}</td>
              </tr>` : ''}
              ${goalsText ? `<tr>
                <td style="padding: 8px 0; color: #888888; vertical-align: top;">Primary Objectives</td>
                <td style="padding: 8px 0; text-align: right; color: #111111;">${goalsText}</td>
              </tr>` : ''}
            </table>
          </div>

          <!-- PDF Download CTA -->
          ${pdfUrl ? `<div style="text-align: center; margin-bottom: 40px;">
            <a href="${pdfUrl}" style="display: inline-block; padding: 14px 36px; border: 1px solid #111111; color: #111111; text-decoration: none; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase;">
              Open Your Blueprint
            </a>
          </div>` : ''}

          <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 0 0 32px 0;" />

          <!-- What Happens Next -->
          <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #888888; margin-bottom: 20px;">
            What Happens Next
          </p>

          <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 16px 10px 0; vertical-align: top; font-family: Georgia, serif; color: #888888; width: 28px;">01</td>
              <td style="padding: 10px 0;">
                <strong style="color: #111111; font-size: 14px;">Review</strong><br/>
                <span style="color: #888888; font-size: 13px;">Our team reviews your blueprint and its strategic signals within the next 24 hours.</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 16px 10px 0; vertical-align: top; font-family: Georgia, serif; color: #888888;">02</td>
              <td style="padding: 10px 0;">
                <strong style="color: #111111; font-size: 14px;">Introduction</strong><br/>
                <span style="color: #888888; font-size: 13px;">We'll reach out briefly to introduce ourselves and see whether a deeper strategy conversation would be valuable.</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 16px 10px 0; vertical-align: top; font-family: Georgia, serif; color: #888888;">03</td>
              <td style="padding: 10px 0;">
                <strong style="color: #111111; font-size: 14px;">Walkthrough</strong><br/>
                <span style="color: #888888; font-size: 13px;">If it makes sense, we can walk through your blueprint, clarify key opportunities, and outline potential next steps.</span>
              </td>
            </tr>
          </table>

          <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 32px 0;" />

          <!-- Continue the Conversation -->
          <p style="font-size: 14px; color: #555555; text-align: center; margin-bottom: 8px;">
            <strong style="color: #111111;">Continue the Conversation</strong>
          </p>
          <p style="font-size: 13px; color: #888888; text-align: center; margin-bottom: 20px;">
            If you'd like to explore the blueprint further, you can request a short clarity call here.
          </p>
          <div style="text-align: center; margin-bottom: 8px;">
            <a href="https://cleland.studio/clarity" style="display: inline-block; padding: 14px 36px; border: 1px solid #111111; color: #111111; text-decoration: none; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase;">
              Request a Clarity Call
            </a>
          </div>
          <p style="font-size: 11px; color: #aaaaaa; text-align: center; margin-bottom: 0;">
            No obligation · We'll respond within 24 hours
          </p>

          <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 40px 0 24px 0;" />

          <!-- Footer -->
          <p style="font-size: 11px; color: #aaaaaa; margin: 0;">
            Cleland Studio<br/>Crafted Digital Systems for Owners and Operators
          </p>
        </div>
      `;

            const emailPayload: Record<string, unknown> = {
                from: FROM_EMAIL,
                to: [blueprint.user_email],
                subject: `Your Strategic Blueprint is Ready — ${businessName}`,
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
                    email: (blueprint.user_email || "").toLowerCase(),
                    company: blueprint.business_name || undefined,
                },
                tier: scores.complexity_tier,
                integrity_score: scores.integrity_score,
                ...(pdfUrl ? { pdf_url: pdfUrl } : {}),
            };

            const body = JSON.stringify(handoffPayload);
            const { signature, timestamp } = await signForConsole(body, HMAC_SECRET);

            const handoffRes = await fetchWithRetry(
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

            // Parse response for duplicate flag and logging
            let responseData: Record<string, unknown> = {};
            try {
                responseData = await handoffRes.json();
            } catch { /* non-JSON response */ }

            const isDuplicate = responseData?.duplicate === true;

            await auditLog(
                supabase,
                handoffRes.ok ? "hmac_handoff_success" : "hmac_handoff_failed",
                blueprintId,
                req,
                {
                    status: handoffRes.status,
                    ...(isDuplicate ? { duplicate: true } : {}),
                    ...(handoffRes.ok ? {} : { response: responseData }),
                },
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
            // @ts-expect-error - EdgeRuntime may not be in types
            if (typeof EdgeRuntime !== "undefined" && EdgeRuntime.waitUntil) {
                // @ts-expect-error - EdgeRuntime.waitUntil is a global function, but not part of standard TS types
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
