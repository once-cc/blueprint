/**
 * booking-webhook Edge Function
 * 
 * Receives webhook callbacks from Calendly (or compatible booking platform).
 * On booking creation:
 *   1. Extract client email and booking time
 *   2. Look up associated blueprint by email
 *   3. Insert into bookings table
 *   4. Cancel pending email sequences for that blueprint
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ── ENV ─────────────────────────────────────────────────────

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const CALENDLY_WEBHOOK_SECRET = Deno.env.get("CALENDLY_WEBHOOK_SECRET") || "";

// ── CORS ────────────────────────────────────────────────────

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, calendly-webhook-signature",
};

// ── Logging ─────────────────────────────────────────────────

function log(step: string, message: string, data?: Record<string, unknown>) {
    console.log(`[booking-webhook] ${step}: ${message}`, data ? JSON.stringify(data) : "");
}

function logError(step: string, message: string, error?: unknown) {
    console.error(`[booking-webhook] ${step} ERROR: ${message}`, error);
}

// ── Webhook Signature Verification (Calendly format) ────────

async function verifyWebhookSignature(
    payload: string,
    signature: string | null,
    secret: string
): Promise<boolean> {
    if (!secret || !signature) return !secret; // Skip verification if no secret configured

    try {
        // Calendly uses HMAC SHA-256
        const encoder = new TextEncoder();
        const key = await crypto.subtle.importKey(
            "raw",
            encoder.encode(secret),
            { name: "HMAC", hash: "SHA-256" },
            false,
            ["sign"]
        );

        const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
        const computedSignature = Array.from(new Uint8Array(signatureBuffer))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");

        // Calendly sends: v1,<timestamp>,<signature>
        const signatureParts = signature.split(",");
        const receivedSig = signatureParts.length >= 3 ? signatureParts[2] : signature;

        return computedSignature === receivedSig;
    } catch {
        return false;
    }
}

// ── Extract Email from Calendly Payload ─────────────────────

interface CalendlyPayload {
    event: string;
    payload: {
        email?: string;
        name?: string;
        scheduled_event?: {
            start_time?: string;
            end_time?: string;
        };
        invitee?: {
            email?: string;
            name?: string;
        };
        questions_and_answers?: Array<{
            question: string;
            answer: string;
        }>;
    };
}

function extractBookingInfo(body: CalendlyPayload): {
    email: string | null;
    name: string | null;
    bookedAt: string | null;
} {
    const p = body.payload || {};

    // Try invitee email first (newer Calendly API), then fallback
    const email = p.invitee?.email || p.email || null;
    const name = p.invitee?.name || p.name || null;
    const bookedAt = p.scheduled_event?.start_time || new Date().toISOString();

    return { email, name, bookedAt };
}

// ── MAIN SERVER ─────────────────────────────────────────────

serve(async (req: Request): Promise<Response> => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const rawBody = await req.text();
        const signature = req.headers.get("calendly-webhook-signature");

        // Verify webhook signature
        if (CALENDLY_WEBHOOK_SECRET) {
            const isValid = await verifyWebhookSignature(rawBody, signature, CALENDLY_WEBHOOK_SECRET);
            if (!isValid) {
                log("AUTH", "Invalid webhook signature");
                return new Response(
                    JSON.stringify({ error: "Invalid signature" }),
                    { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
                );
            }
        }

        const body: CalendlyPayload = JSON.parse(rawBody);
        log("WEBHOOK", "Received booking webhook", { event: body.event });

        // Only process invitee.created events (new bookings)
        if (body.event !== "invitee.created") {
            log("SKIP", "Not a booking creation event", { event: body.event });
            return new Response(
                JSON.stringify({ success: true, action: "skipped" }),
                { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
            );
        }

        const { email, name, bookedAt } = extractBookingInfo(body);

        if (!email) {
            log("SKIP", "No email in webhook payload");
            return new Response(
                JSON.stringify({ success: true, action: "skipped_no_email" }),
                { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
            );
        }

        log("BOOKING", "Processing booking", { email, bookedAt });

        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

        // Look up the most recent blueprint by email
        const { data: blueprint } = await supabase
            .from("blueprints")
            .select("id")
            .eq("user_email", email)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

        const blueprintId = blueprint?.id || null;

        // Insert booking record
        const { error: bookingError } = await supabase.from("bookings").insert({
            blueprint_id: blueprintId,
            email,
            booked_at: bookedAt,
            source: "post-submit",
            metadata: {
                name,
                raw_event: body.event,
                scheduled_start: body.payload?.scheduled_event?.start_time,
                scheduled_end: body.payload?.scheduled_event?.end_time,
            },
        });

        if (bookingError) {
            logError("BOOKING", "Failed to insert booking", bookingError);
            throw new Error(`Failed to insert booking: ${bookingError.message}`);
        }

        log("BOOKING", "Booking recorded", { blueprintId, email });

        // Cancel pending email sequences for this blueprint
        if (blueprintId) {
            const { data: cancelled, error: cancelError } = await supabase
                .from("email_sequences")
                .update({
                    status: "cancelled",
                    cancelled_at: new Date().toISOString(),
                })
                .eq("blueprint_id", blueprintId)
                .eq("status", "pending")
                .select("id");

            if (cancelError) {
                logError("CANCEL", "Failed to cancel email sequences", cancelError);
            } else {
                log("CANCEL", `Cancelled ${cancelled?.length || 0} pending email sequences`);
            }

            // Update blueprint status to 'booked'
            const { error: statusError } = await supabase
                .from("blueprints")
                .update({ status: "booked" })
                .eq("id", blueprintId)
                .in("status", ["submitted", "generated"]);

            if (statusError) {
                logError("STATUS", "Failed to update blueprint status to booked", statusError);
            } else {
                log("STATUS", "Blueprint status updated to booked", { blueprintId });
            }
        }

        // Log security event for booking creation
        try {
            await supabase.from("security_events").insert({
                event_type: "booking_created",
                email,
                blueprint_id: blueprintId,
                metadata: {
                    booked_at: bookedAt,
                    source: "calendly_webhook",
                },
            });
        } catch {
            // Silent — security logging should never break the webhook
        }

        return new Response(
            JSON.stringify({
                success: true,
                action: "booking_created",
                blueprint_id: blueprintId,
            }),
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
