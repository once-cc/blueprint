/**
 * hmac.ts — HMAC Utilities for Blueprint ↔ Console Server-to-Server Auth
 *
 * Two directions with DIFFERENT concatenation formats:
 *
 *   Blueprint → Console (outbound submissions):
 *     signature = HMAC-SHA256(key, timestamp + body)  ← NO separator
 *     Headers: x-blueprint-signature, x-blueprint-timestamp
 *
 *   Console → Blueprint (admin proxy calls):
 *     signature = HMAC-SHA256(key, timestamp + ":" + body)  ← COLON separator
 *     Headers: X-Dashboard-Signature, X-Dashboard-Timestamp
 */

const MAX_DRIFT_SECONDS = 300; // 5 minutes
const encoder = new TextEncoder();

// ---- Core HMAC ----

async function hmacSha256(secret: string, message: string): Promise<string> {
    const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign'],
    );
    const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
    return Array.from(new Uint8Array(sig))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
}

/** Constant-time string comparison to prevent timing attacks */
function constantTimeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    let mismatch = 0;
    for (let i = 0; i < a.length; i++) {
        mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return mismatch === 0;
}

// ---- Blueprint → Console (Outbound) ----

/**
 * Sign a payload for outbound requests to the Console.
 * Uses NO separator: HMAC(key, timestamp + body)
 */
export async function signForConsole(
    body: string,
    secret: string,
): Promise<{ signature: string; timestamp: string }> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = await hmacSha256(secret, `${timestamp}${body}`);
    return { signature, timestamp };
}

// ---- Console → Blueprint (Inbound) ----

export interface HmacValidationResult {
    valid: boolean;
    error?: string;
}

/**
 * Validate an incoming HMAC-signed request from the Console.
 * Uses COLON separator: HMAC(key, timestamp + ":" + body)
 */
export async function validateFromConsole(
    signature: string | null,
    timestamp: string | null,
    body: string,
    secret: string,
): Promise<HmacValidationResult> {
    if (!signature || !timestamp) {
        return {
            valid: false,
            error: 'Missing X-Dashboard-Signature or X-Dashboard-Timestamp header',
        };
    }

    // Check timestamp drift
    const requestTime = parseInt(timestamp, 10);
    if (isNaN(requestTime)) {
        return { valid: false, error: 'Invalid timestamp format' };
    }

    const now = Math.floor(Date.now() / 1000);
    const drift = Math.abs(now - requestTime);
    if (drift > MAX_DRIFT_SECONDS) {
        return {
            valid: false,
            error: `Timestamp drift too large: ${drift}s (max ${MAX_DRIFT_SECONDS}s)`,
        };
    }

    // Compute expected HMAC (colon-separated)
    const expected = await hmacSha256(secret, `${timestamp}:${body}`);

    if (!constantTimeEqual(expected, signature)) {
        return { valid: false, error: 'Invalid signature' };
    }

    return { valid: true };
}

// ---- Legacy aliases (backward compat) ----

/** @deprecated Use validateFromConsole instead */
export const validateHmac = validateFromConsole;

/** @deprecated Use signForConsole instead */
export const signHmac = async (
    body: string,
    secret: string,
): Promise<{ signature: string; timestamp: string }> => {
    // Legacy signHmac used colon separator (Dashboard BFF signing)
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = await hmacSha256(secret, `${timestamp}:${body}`);
    return { signature, timestamp };
};
