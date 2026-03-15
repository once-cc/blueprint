/**
 * get-nurture-status — Expose nurture email data to Ops Console
 *
 * Auth: HMAC verification (Console → Blueprint, colon separator)
 * Input: { blueprint_id } or { blueprint_ids: string[] } for batch
 * Output: { emails: NurtureEmailStatus[], sequenceStatus }
 *
 * Returns email_sequences rows enriched with:
 *   - Rendered subject/bodyPreview from nurture-renderer.ts
 *   - Override data (if present)
 *   - Insight metadata for operator call-prep
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { validateFromConsole } from "../_shared/hmac.ts";
import { getCorsHeaders } from "../_shared/cors.ts";
import { renderNurtureEmail, type BlueprintData } from "../_shared/nurture-renderer.ts";
import { formatSummaryData, type DiscoveryInput } from "../_shared/insight-map.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const HMAC_SECRET = Deno.env.get("BLUEPRINT_HMAC_SECRET") || "";

let _corsHeaders: Record<string, string> = {};

function respond(body: Record<string, unknown>, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json", ..._corsHeaders },
    });
}

// ── Email metadata ──────────────────────────────────────────

interface EmailMeta {
    name: string;
    timingLabel: string;
}

const EMAIL_META: Record<number, EmailMeta> = {
    2: { name: "Email 2 — The Echo", timingLabel: "+1 hour" },
    3: { name: "Email 3 — The Observation Gap", timingLabel: "+24 hours" },
    4: { name: "Email 4 — Authority Positioning", timingLabel: "+72 hours" },
    5: { name: "Email 5 — Scarcity of Attention", timingLabel: "+7 days" },
};

// ── Insight metadata extraction ─────────────────────────────

interface InsightMeta {
    sourceFields: string[];
    patternKey: string | null;
    observationSummary: string;
    ctaPresent: boolean;
    insightDelivered: string;
    whyItMatters: string;
    useOnCall: string;
    basedOnHuman: string[];
}

function extractInsightMeta(
    blueprint: BlueprintData,
    emailNumber: 2 | 3 | 4 | 5,
): InsightMeta | null {
    const d = blueprint.discovery;
    const del = blueprint.deliver;

    switch (emailNumber) {
        case 2: {
            const { observation } = formatSummaryData(d as DiscoveryInput);
            return {
                sourceFields: ["siteTopic", "primaryPurpose", "conversionGoals", "salesPersonality"],
                patternKey: d.primaryPurpose || null,
                observationSummary: observation,
                ctaPresent: false,
                insightDelivered: `Echoed their strategic pattern: ${observation.slice(0, 120)}…`,
                whyItMatters: "Demonstrates we actually read the submission — not a generic follow-up.",
                useOnCall: "Reference the specific pattern detected. Ask if their sales approach has evolved since submitting.",
                basedOnHuman: ["Sales Personality", "Primary Purpose", "Conversion Goals"],
            };
        }
        case 3: {
            const tone = d.brandVoice?.tone;
            const presence = d.brandVoice?.presence;
            const risk = del.riskTolerance;
            return {
                sourceFields: ["brandVoice.tone", "brandVoice.presence", "riskTolerance"],
                patternKey: tone && presence ? `tone_${tone}_presence_${presence}` : null,
                observationSummary: `Brand voice analysis: tone=${tone}, presence=${presence}, risk=${risk}`,
                ctaPresent: false,
                insightDelivered: "Surfaced contradictions between their brand voice settings and risk tolerance.",
                whyItMatters: "Contradictions reveal where the client is unsure — that's where we add most value.",
                useOnCall: "Ask about the gap between their brand positioning (how they want to feel) and their risk tolerance (how far they'll go to get there).",
                basedOnHuman: ["Brand Voice", "Risk Tolerance"],
            };
        }
        case 4: {
            const pages = del.pages?.length ?? 0;
            const features = del.features?.length ?? 0;
            return {
                sourceFields: ["deliver.pages", "deliver.features", "deliver.timeline", "deliver.budget"],
                patternKey: del.timeline || null,
                observationSummary: `Scope: ${pages} pages, ${features} features, timeline=${del.timeline}, budget=${del.budget}`,
                ctaPresent: false,
                insightDelivered: `Analysed scope: ${pages} pages, ${features} features — positioned our ability to handle complexity.`,
                whyItMatters: "Shows technical depth. Most competitors skip scope analysis entirely.",
                useOnCall: "Reference their specific page count and feature set. Ask if anything has changed since submitting.",
                basedOnHuman: ["Page List", "Feature Set", "Timeline", "Budget"],
            };
        }
        case 5: {
            return {
                sourceFields: ["ctaPrimaryLabel", "salesPersonality"],
                patternKey: d.salesPersonality || null,
                observationSummary: `Final CTA: Clarity Call invitation, personality=${d.salesPersonality}`,
                ctaPresent: true,
                insightDelivered: "Final invitation to book a Clarity Call — positioned as a strategic conversation, not a sales call.",
                whyItMatters: "This is the last automated touchpoint. If they don't book, the next move is manual outreach.",
                useOnCall: "If they booked: prepare to reference all 4 emails' insights. If they didn't: this is your opening for a personal follow-up.",
                basedOnHuman: ["CTA Label", "Sales Personality"],
            };
        }
    }
}

// ── Body text extraction ────────────────────────────────────

function stripHtmlToText(html: string): string {
    return html
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&#39;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/\s+/g, " ")
        .trim();
}

function extractBodyPreview(html: string, maxLength = 200): string {
    const text = stripHtmlToText(html);
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).replace(/\s+\S*$/, "") + "…";
}

function extractBodyFull(html: string): string {
    return stripHtmlToText(html);
}

// ── Status mapping ──────────────────────────────────────────

function mapDeliveryStatus(
    dbStatus: string,
    scheduledFor: string | null,
): string {
    if (dbStatus === "sent") return "sent";
    if (dbStatus === "cancelled") return "cancelled";
    if (dbStatus === "failed") return "failed";
    if (dbStatus === "skipped") return "skipped";
    if (dbStatus === "pending" && scheduledFor) {
        const now = new Date();
        const scheduled = new Date(scheduledFor);
        return scheduled <= now ? "scheduled" : "pending";
    }
    return "pending";
}

// ── Main Handler ────────────────────────────────────────────

Deno.serve(async (req: Request) => {
    _corsHeaders = getCorsHeaders(req);

    if (req.method === "OPTIONS") {
        return new Response(null, { headers: _corsHeaders });
    }

    try {
        // ── HMAC Verification ──────────────────────────────
        const body = await req.text();
        const signature = req.headers.get("x-dashboard-signature");
        const timestamp = req.headers.get("x-dashboard-timestamp");

        const hmacResult = await validateFromConsole(signature, timestamp, body, HMAC_SECRET);
        if (!hmacResult.valid) {
            return respond({ success: false, error: hmacResult.error }, 401);
        }

        const params = body ? JSON.parse(body) : {};

        // Support both single and batch
        const blueprintIds: string[] = params.blueprint_ids
            ? params.blueprint_ids
            : params.blueprint_id
                ? [params.blueprint_id]
                : [];

        if (blueprintIds.length === 0) {
            return respond({ success: false, error: "Missing blueprint_id or blueprint_ids" }, 400);
        }

        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

        // ── Fetch email_sequences for all requested blueprints ──
        const { data: sequences, error: seqError } = await supabase
            .from("email_sequences")
            .select("*")
            .in("blueprint_id", blueprintIds)
            .order("email_number", { ascending: true });

        if (seqError) {
            console.error("[get-nurture-status] DB error:", seqError);
            return respond({ success: false, error: "Database error" }, 500);
        }

        // ── Fetch blueprint data for rendering ──
        const { data: blueprints, error: bpError } = await supabase
            .from("blueprints")
            .select("id, first_name, business_name, user_email, discovery, deliver")
            .in("id", blueprintIds);

        if (bpError) {
            console.error("[get-nurture-status] Blueprint fetch error:", bpError);
            return respond({ success: false, error: "Database error" }, 500);
        }

        const blueprintMap = new Map(
            (blueprints || []).map((bp: BlueprintData) => [bp.id, bp]),
        );

        // ── Build response per blueprint ──
        const result: Record<string, unknown> = {};

        for (const bpId of blueprintIds) {
            const bpSequences = (sequences || []).filter(
                (s: { blueprint_id: string }) => s.blueprint_id === bpId,
            );
            const bp = blueprintMap.get(bpId);

            if (bpSequences.length === 0) {
                result[bpId] = { sequenceStatus: "active", emails: [] };
                continue;
            }

            // Determine overall sequence status
            const allSent = bpSequences.every((s: { status: string }) => s.status === "sent");
            const anyCancelled = bpSequences.some(
                (s: { cancelled_at: string | null }) => s.cancelled_at !== null,
            );

            let sequenceStatus = "active";
            if (allSent) sequenceStatus = "completed";
            else if (anyCancelled) sequenceStatus = "manually_disabled";

            // Build email array
            const emails = bpSequences.map((seq: {
                email_number: number;
                email_type: string;
                status: string;
                scheduled_for: string | null;
                sent_at: string | null;
                cancelled_at: string | null;
                override_subject: string | null;
                override_body: string | null;
                override_cta_label: string | null;
                override_by: string | null;
                override_at: string | null;
                created_at: string;
            }) => {
                const emailNum = seq.email_number as 2 | 3 | 4 | 5;
                const meta = EMAIL_META[emailNum] || {
                    name: `Email ${emailNum}`,
                    timingLabel: "Unknown",
                };

                // Render system-generated content
                let subject = "";
                let bodyPreview = "";
                let bodyFull = "";
                let insight: InsightMeta | null = null;

                if (bp && emailNum >= 2 && emailNum <= 5) {
                    try {
                        const rendered = renderNurtureEmail(bp, emailNum);
                        subject = rendered.subject;
                        bodyPreview = extractBodyPreview(rendered.html);
                        bodyFull = extractBodyFull(rendered.html);
                        insight = extractInsightMeta(bp, emailNum);
                    } catch (err) {
                        console.warn(
                            `[get-nurture-status] Render failed for bp=${bpId} email=${emailNum}:`,
                            err,
                        );
                    }
                }

                // Build manual override if present
                const manualOverride = seq.override_subject || seq.override_body
                    ? {
                        subject: seq.override_subject || subject,
                        bodyPreview: seq.override_body
                            ? extractBodyPreview(seq.override_body)
                            : bodyPreview,
                        bodyFull: seq.override_body
                            ? stripHtmlToText(seq.override_body)
                            : bodyFull,
                        ctaLabel: seq.override_cta_label || undefined,
                        editedBy: seq.override_by || "unknown",
                        editedAt: seq.override_at || seq.created_at,
                    }
                    : undefined;

                return {
                    emailNumber: emailNum,
                    name: meta.name,
                    timingLabel: meta.timingLabel,
                    scheduledFor: seq.scheduled_for,
                    sentAt: seq.sent_at,
                    deliveryStatus: mapDeliveryStatus(seq.status, seq.scheduled_for),
                    insight,
                    subject,
                    bodyPreview,
                    bodyFull,
                    manualOverride,
                };
            });

            result[bpId] = {
                sequenceStatus,
                emails,
                updatedAt: bpSequences[bpSequences.length - 1]?.created_at || new Date().toISOString(),
            };
        }

        return respond({ success: true, data: result });
    } catch (err) {
        console.error("[get-nurture-status] Error:", err);
        return respond(
            { success: false, error: err instanceof Error ? err.message : "Unknown error" },
            500,
        );
    }
});
