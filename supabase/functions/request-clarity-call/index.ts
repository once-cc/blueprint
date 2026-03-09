/**
 * request-clarity-call Edge Function v2
 *
 * Called by the frontend when a user clicks "Request a Clarity Call" on the success screen.
 * Sets clarity_call_requested_at on the blueprint and fires an HMAC-signed notification to Console.
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { signForConsole } from "../_shared/hmac.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const HMAC_SECRET = Deno.env.get("BLUEPRINT_HMAC_SECRET") || "";
const OPS_CONSOLE_URL = Deno.env.get("OPS_CONSOLE_URL") || "";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
const FROM_EMAIL = "Cleland Studio <crafted@cleland.studio>";

// CORS headers are now dynamic per-request — see _shared/cors.ts
let _corsHeaders: Record<string, string> = {};

function respond(body: Record<string, unknown>, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json", ..._corsHeaders },
    });
}

// ── Retry Helper ────────────────────────────────────────────

async function fetchWithRetry(
    url: string,
    options: RequestInit,
    maxRetries = 3,
): Promise<Response> {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        const res = await fetch(url, options);
        if (res.status < 500) return res;
        if (attempt < maxRetries) {
            const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
            await new Promise((r) => setTimeout(r, delay));
        } else {
            return res;
        }
    }
    throw new Error("fetchWithRetry: exhausted retries");
}

Deno.serve(async (req: Request) => {
    _corsHeaders = getCorsHeaders(req);

    if (req.method === "OPTIONS") {
        return new Response(null, { headers: _corsHeaders });
    }

    try {
        const { blueprint_id } = await req.json();
        if (!blueprint_id) return respond({ success: false, error: "blueprint_id required" }, 400);

        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

        // ── Fetch Blueprint ────────────────────────────────
        const { data: bp, error: fetchError } = await supabase
            .from("blueprints")
            .select("*")
            .eq("id", blueprint_id)
            .single();

        if (fetchError || !bp) return respond({ success: false, error: "Blueprint not found" }, 404);

        // Prevent double-requests
        if (bp.clarity_call_requested_at) {
            return respond({ success: true, message: "Clarity call already requested" });
        }

        // ── Set clarity_call_requested_at ───────────────────
        const now = new Date().toISOString();
        const { error: updateError } = await supabase
            .from("blueprints")
            .update({ clarity_call_requested_at: now })
            .eq("id", blueprint_id);

        if (updateError) {
            return respond({ success: false, error: "Failed to update blueprint" }, 500);
        }

        // ── Audit Log ──────────────────────────────────────
        await supabase.from("blueprint_audit_log").insert({
            blueprint_id,
            event_type: "clarity_call_requested",
            description: "User requested a clarity call from the success screen",
            ip_address: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null,
            user_agent: req.headers.get("user-agent")?.slice(0, 500) || null,
        });

        // ── Send Confirmation Email via Resend ─────────────
        if (RESEND_API_KEY && bp.user_email) {
            try {
                const firstName = (bp.first_name || "there").replace(/[&<>"']/g, (m: string) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[m] || m));

                const confirmHtml = `
        <div style="font-family: system-ui, -apple-system, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 48px 32px; background: #fcfcfc; color: #111111;">

          <h1 style="font-family: Georgia, 'Times New Roman', serif; font-size: 28px; font-weight: 400; font-style: italic; margin: 0 0 24px 0; color: #111111;">
            Your Clarity Call Request
          </h1>

          <p style="font-size: 15px; line-height: 1.7; color: #555555; margin-bottom: 8px;">
            Hi ${firstName},
          </p>
          <p style="font-size: 15px; line-height: 1.7; color: #555555; margin-bottom: 8px;">
            We've received your request for a clarity call and will be reviewing your blueprint shortly.
          </p>
          <p style="font-size: 15px; line-height: 1.7; color: #555555; margin-bottom: 32px;">
            One of our team will reach out within <strong style="color: #111111;">24 hours</strong> to introduce ourselves, discuss what stood out in your blueprint, and arrange a time to walk through it together.
          </p>

          <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 0 0 32px 0;" />

          <p style="font-size: 14px; color: #555555; margin-bottom: 8px;">
            In the meantime, if you have any questions, reply directly to this email.
          </p>

          <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 32px 0 24px 0;" />

          <p style="font-size: 11px; color: #aaaaaa; margin: 0;">
            Cleland Studio<br/>Crafted Digital Systems for Owners and Operators
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
                        bcc: ["crafted@cleland.studio"],
                        subject: "Your Clarity Call Request — Cleland Studio",
                        html: confirmHtml,
                    }),
                });

                const emailResult = await emailRes.json();

                await supabase.from("blueprint_emails").insert({
                    blueprint_id,
                    email_type: "clarity_call_confirmation",
                    status: emailRes.ok ? "sent" : "failed",
                    recipient: bp.user_email as string,
                    resend_id: emailResult?.id || null,
                    error: emailRes.ok ? null : JSON.stringify(emailResult),
                    sent_at: emailRes.ok ? new Date().toISOString() : null,
                });
            } catch (emailErr) {
                // Email failure must never break the clarity call request
                console.warn("[request-clarity-call] Confirmation email failed:", emailErr);
            }
        }

        // ── HMAC Notification to Console ───────────────────
        if (HMAC_SECRET && OPS_CONSOLE_URL) {
            try {
                const notificationPayload = {
                    version: "1.0",
                    event: "clarity_call_requested",
                    blueprint_id: bp.id,
                    lead: {
                        first_name: bp.first_name || "",
                        last_name: bp.last_name || "",
                        email: (bp.user_email || "").toLowerCase(),
                        company: bp.business_name || undefined,
                    },
                    tier: bp.complexity_tier || "unknown",
                    requested_at: now,
                };

                const body = JSON.stringify(notificationPayload);
                const { signature, timestamp } = await signForConsole(body, HMAC_SECRET);

                const notifyRes = await fetchWithRetry(
                    `${OPS_CONSOLE_URL}/functions/v1/receive-clarity-call-request`,
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

                await supabase.from("blueprint_audit_log").insert({
                    blueprint_id,
                    event_type: notifyRes.ok ? "clarity_call_notified" : "clarity_call_notify_failed",
                    description: notifyRes.ok
                        ? "Console notified of clarity call request"
                        : `Console notification failed: ${notifyRes.status}`,
                    metadata: { status: notifyRes.status },
                });
            } catch (err) {
                // Don't fail the user request if Console notification fails
                await supabase.from("blueprint_audit_log").insert({
                    blueprint_id,
                    event_type: "clarity_call_notify_failed",
                    description: `Console notification error: ${String(err)}`,
                });
            }
        }

        return respond({ success: true, requested_at: now });
    } catch (err) {
        console.error("[request-clarity-call] Error:", err);
        return respond(
            { success: false, error: err instanceof Error ? err.message : "Unknown error" },
            500,
        );
    }
});
