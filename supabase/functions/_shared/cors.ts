/**
 * cors.ts — Shared CORS utility for Blueprint Edge Functions
 *
 * Replaces the hardcoded `Access-Control-Allow-Origin: *` in every function
 * with domain-scoped origins. Only allows requests from known Cleland Studio
 * domains. In development, localhost origins are also permitted.
 */

const ALLOWED_ORIGINS: string[] = [
    "https://crafted.cleland.studio",
    "https://cleland.studio",
    "https://www.cleland.studio",
    "https://portal.clelandconsultancy.com",
];

// Development origins — only matched if the origin looks like localhost
const DEV_ORIGIN_RE = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

/**
 * Returns CORS headers with an origin scoped to the request.
 * If the request origin is in our allow-list, it's reflected back.
 * Otherwise, the first production origin is used as the default
 * (browsers will block the cross-origin request).
 */
export function getCorsHeaders(req: Request): Record<string, string> {
    const origin = req.headers.get("origin") || "";

    const isAllowed =
        ALLOWED_ORIGINS.includes(origin) || DEV_ORIGIN_RE.test(origin);

    return {
        "Access-Control-Allow-Origin": isAllowed ? origin : ALLOWED_ORIGINS[0],
        "Access-Control-Allow-Headers":
            "authorization, x-client-info, apikey, content-type, x-blueprint-token, x-dashboard-signature, x-dashboard-timestamp",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Vary": "Origin",
    };
}

/**
 * Convenience: build a preflight (OPTIONS) response.
 */
export function corsOptionsResponse(req: Request): Response {
    return new Response(null, { headers: getCorsHeaders(req) });
}
