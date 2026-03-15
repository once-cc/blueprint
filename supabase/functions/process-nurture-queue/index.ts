/**
 * process-nurture-queue — Cron-Invoked Nurture Email Dispatcher
 *
 * Polls email_sequences for pending + due rows, checks Console eligibility,
 * renders + sends the nurture email via Resend, and updates the row status.
 *
 * Designed to be invoked every 5 minutes via pg_cron or Supabase scheduled function.
 *
 * Flow:
 *   1. Query up to 10 pending email_sequences where scheduled_for <= now()
 *   2. For each: fetch blueprint data, check Console eligibility
 *   3. If eligible: render email → send via Resend → mark 'sent'
 *   4. If ineligible: mark 'cancelled'
 *   5. Log everything to blueprint_emails + blueprint_audit_log
 *
 * verify_jwt: false (invoked by cron, not by users)
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { renderNurtureEmail, wrapOverrideBody, type BlueprintData } from "../_shared/nurture-renderer.ts";
import { signForConsole } from "../_shared/hmac.ts";

// ── ENV ─────────────────────────────────────────────────────

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
const HMAC_SECRET = Deno.env.get("BLUEPRINT_HMAC_SECRET") || "";
const OPS_CONSOLE_URL = Deno.env.get("OPS_CONSOLE_URL") || "";
const FROM_EMAIL = "Cleland Studio <crafted@cleland.studio>";

const MAX_BATCH = 10;

// ── Types ───────────────────────────────────────────────────

interface PendingEmail {
    id: string;
    blueprint_id: string;
    email_type: string;
    email_number: number;
    scheduled_for: string;
    override_subject: string | null;
    override_body: string | null;
    override_cta_label: string | null;
    override_by: string | null;
}

interface EligibilityResponse {
    eligible: boolean;
    sequence_status?: string;
    reason?: string;
}

// ── Eligibility Check ───────────────────────────────────────

async function checkEligibility(submissionId: string): Promise<EligibilityResponse> {
    if (!HMAC_SECRET || !OPS_CONSOLE_URL) {
        // If Console isn't configured, assume eligible (graceful degradation)
        console.warn("[process-nurture-queue] Console not configured — assuming eligible");
        return { eligible: true, reason: "console_not_configured" };
    }

    try {
        const body = JSON.stringify({ submission_id: submissionId });
        const { signature, timestamp } = await signForConsole(body, HMAC_SECRET);

        const res = await fetch(`${OPS_CONSOLE_URL}/functions/v1/check-nurture-eligibility`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-blueprint-signature": signature,
                "x-blueprint-timestamp": timestamp,
            },
            body,
        });

        if (!res.ok) {
            console.warn(`[process-nurture-queue] Eligibility check failed: ${res.status}`);
            // On 5xx, defer (don't cancel) — the Console might be temporarily down
            if (res.status >= 500) {
                return { eligible: true, reason: "console_unavailable_deferred" };
            }
            // On 4xx, something is misconfigured — defer to avoid data loss
            return { eligible: true, reason: "console_error_deferred" };
        }

        return await res.json() as EligibilityResponse;
    } catch (err) {
        console.error("[process-nurture-queue] Eligibility check error:", err);
        // Network error — defer, don't cancel
        return { eligible: true, reason: "network_error_deferred" };
    }
}

// ── Send Email ──────────────────────────────────────────────

async function sendEmail(
    to: string,
    subject: string,
    html: string,
): Promise<{ ok: boolean; resendId?: string; error?: string }> {
    if (!RESEND_API_KEY) {
        return { ok: false, error: "RESEND_API_KEY not configured" };
    }

    try {
        const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${RESEND_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                from: FROM_EMAIL,
                to: [to],
                bcc: ["crafted@cleland.studio"],
                subject,
                html,
            }),
        });

        const data = await res.json();
        if (res.ok) {
            return { ok: true, resendId: data?.id };
        }
        return { ok: false, error: JSON.stringify(data) };
    } catch (err) {
        return { ok: false, error: String(err) };
    }
}

// ── Main Handler ────────────────────────────────────────────

Deno.serve(async (_req: Request) => {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const results: Array<{ id: string; status: string; email_number: number }> = [];

    try {
        // ── 1. Poll for pending + due emails ────────────────
        const { data: pending, error: queryError } = await supabase
            .from("email_sequences")
            .select("id, blueprint_id, email_type, email_number, scheduled_for, override_subject, override_body, override_cta_label, override_by")
            .eq("status", "pending")
            .lte("scheduled_for", new Date().toISOString())
            .order("scheduled_for", { ascending: true })
            .limit(MAX_BATCH);

        if (queryError) {
            console.error("[process-nurture-queue] Query error:", queryError);
            return new Response(JSON.stringify({ error: "Query failed" }), { status: 500 });
        }

        if (!pending || pending.length === 0) {
            return new Response(JSON.stringify({ processed: 0 }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        }

        // ── 2. Process each pending email ────────────────────
        for (const entry of pending as PendingEmail[]) {
            try {
                // Fetch the full blueprint
                const { data: blueprint, error: bpError } = await supabase
                    .from("blueprints")
                    .select("id, first_name, business_name, user_email, discovery, deliver")
                    .eq("id", entry.blueprint_id)
                    .single();

                if (bpError || !blueprint) {
                    console.error(`[process-nurture-queue] Blueprint not found: ${entry.blueprint_id}`);
                    await markCancelled(supabase, entry.id, "blueprint_not_found");
                    results.push({ id: entry.id, status: "cancelled", email_number: entry.email_number });
                    continue;
                }

                if (!blueprint.user_email) {
                    await markCancelled(supabase, entry.id, "no_email");
                    results.push({ id: entry.id, status: "cancelled", email_number: entry.email_number });
                    continue;
                }

                // Check Console eligibility
                const eligibility = await checkEligibility(entry.blueprint_id);

                if (!eligibility.eligible) {
                    await markCancelled(supabase, entry.id, eligibility.reason || "ineligible");

                    // Log to audit
                    await supabase.from("blueprint_audit_log").insert({
                        blueprint_id: entry.blueprint_id,
                        event_type: "nurture_skipped",
                        metadata: {
                            email_number: entry.email_number,
                            email_type: entry.email_type,
                            reason: eligibility.reason,
                            sequence_status: eligibility.sequence_status,
                        },
                    }).catch(() => { /* audit must never break pipeline */ });

                    results.push({ id: entry.id, status: "cancelled", email_number: entry.email_number });
                    continue;
                }

                // Render the email
                const emailNumber = entry.email_number as 2 | 3 | 4 | 5;
                if (emailNumber < 2 || emailNumber > 5) {
                    await markCancelled(supabase, entry.id, "invalid_email_number");
                    results.push({ id: entry.id, status: "cancelled", email_number: entry.email_number });
                    continue;
                }

                const bpData: BlueprintData = {
                    id: blueprint.id,
                    first_name: blueprint.first_name || "there",
                    business_name: blueprint.business_name || "Your Project",
                    user_email: blueprint.user_email,
                    discovery: blueprint.discovery || {},
                    deliver: blueprint.deliver || {},
                };

                const rendered = renderNurtureEmail(bpData, emailNumber);

                // Override promotion — operator edits take precedence
                const hasOverride = !!(entry.override_subject || entry.override_body);
                const finalSubject = entry.override_subject ?? rendered.subject;
                const finalHtml = entry.override_body
                    ? wrapOverrideBody(bpData, entry.override_body, entry.override_cta_label, emailNumber)
                    : rendered.html;

                if (hasOverride) {
                    console.info(`[process-nurture-queue] Using operator override for email ${emailNumber} (by ${entry.override_by})`);
                }

                // Send via Resend
                const sendResult = await sendEmail(
                    blueprint.user_email,
                    finalSubject,
                    finalHtml,
                );

                if (sendResult.ok) {
                    // Mark sent
                    await supabase
                        .from("email_sequences")
                        .update({
                            status: "sent",
                            sent_at: new Date().toISOString(),
                            resend_id: sendResult.resendId || null,
                        })
                        .eq("id", entry.id);

                    // Track in blueprint_emails
                    await supabase.from("blueprint_emails").insert({
                        blueprint_id: entry.blueprint_id,
                        email_type: `nurture_${entry.email_number}`,
                        status: "sent",
                        recipient: blueprint.user_email,
                        resend_id: sendResult.resendId || null,
                        sent_at: new Date().toISOString(),
                    }).catch(() => { /* tracking must never break pipeline */ });

                    // Audit log
                    await supabase.from("blueprint_audit_log").insert({
                        blueprint_id: entry.blueprint_id,
                        event_type: "nurture_sent",
                        metadata: {
                            email_number: entry.email_number,
                            email_type: entry.email_type,
                            resend_id: sendResult.resendId,
                            subject: finalSubject,
                            override_used: hasOverride,
                            override_by: entry.override_by,
                        },
                    }).catch(() => { /* audit must never break pipeline */ });

                    results.push({ id: entry.id, status: "sent", email_number: entry.email_number });
                } else {
                    // Mark as error but don't cancel — allow retry on next cron run
                    await supabase
                        .from("email_sequences")
                        .update({ error: sendResult.error })
                        .eq("id", entry.id);

                    await supabase.from("blueprint_audit_log").insert({
                        blueprint_id: entry.blueprint_id,
                        event_type: "nurture_send_failed",
                        metadata: {
                            email_number: entry.email_number,
                            email_type: entry.email_type,
                            error: sendResult.error,
                        },
                    }).catch(() => { /* audit must never break pipeline */ });

                    results.push({ id: entry.id, status: "failed", email_number: entry.email_number });
                }
            } catch (entryErr) {
                console.error(`[process-nurture-queue] Error processing ${entry.id}:`, entryErr);
                results.push({ id: entry.id, status: "error", email_number: entry.email_number });
            }
        }

        console.info(`[process-nurture-queue] Processed ${results.length} emails:`,
            JSON.stringify(results.map(r => `#${r.email_number}:${r.status}`)));

        return new Response(JSON.stringify({
            processed: results.length,
            results,
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (err) {
        console.error("[process-nurture-queue] Unhandled error:", err);
        return new Response(JSON.stringify({
            error: err instanceof Error ? err.message : "Unknown error",
        }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
});

// ── Helpers ─────────────────────────────────────────────────

async function markCancelled(
    supabase: ReturnType<typeof createClient>,
    sequenceId: string,
    reason: string,
) {
    await supabase
        .from("email_sequences")
        .update({
            status: "cancelled",
            cancelled_at: new Date().toISOString(),
            error: reason,
        })
        .eq("id", sequenceId);
}
