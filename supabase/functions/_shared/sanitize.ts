/**
 * sanitize.ts — Shared sanitization utilities for Blueprint Edge Functions
 * 
 * All free-text inputs MUST pass through sanitizeText() before storage or rendering.
 * URLs are validated via validateUrl() and never embedded as raw HTML.
 */

// ── HTML Tag Strip ──────────────────────────────────────────

const HTML_TAG_RE = /<\/?[^>]+(>|$)/g;

export function stripHtml(text: string): string {
    return text.replace(HTML_TAG_RE, "");
}

// ── Special Character Escaping ──────────────────────────────

const ESCAPE_MAP: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
};

export function escapeSpecialChars(text: string): string {
    return text.replace(/[&<>"'/]/g, (char) => ESCAPE_MAP[char] || char);
}

// ── Max Length Enforcement ──────────────────────────────────

export function enforceMaxLength(text: string, maxLength: number = 2000): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength);
}

// ── Whitespace Normalization ────────────────────────────────

export function normalizeWhitespace(text: string): string {
    return text
        .replace(/\r\n/g, "\n")         // Normalize line endings
        .replace(/\r/g, "\n")           // Normalize remaining CRs
        .replace(/[ \t]+/g, " ")        // Collapse horizontal whitespace
        .replace(/\n{3,}/g, "\n\n")     // Max two consecutive newlines
        .trim();
}

// ── Full Sanitization Pipeline ──────────────────────────────

export function sanitizeText(text: string, maxLength: number = 2000): string {
    if (!text || typeof text !== "string") return "";
    return enforceMaxLength(
        normalizeWhitespace(
            escapeSpecialChars(
                stripHtml(text)
            )
        ),
        maxLength
    );
}

// ── URL Validation ──────────────────────────────────────────

const URL_RE = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;

export function validateUrl(url: string): boolean {
    if (!url || typeof url !== "string") return false;
    if (url.length > 2048) return false;
    return URL_RE.test(url);
}

// ── Sanitize an entire object recursively ───────────────────

export function sanitizeObject<T extends Record<string, unknown>>(
    obj: T,
    maxLength: number = 2000
): T {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === "string") {
            result[key] = sanitizeText(value, maxLength);
        } else if (Array.isArray(value)) {
            result[key] = value.map((item) =>
                typeof item === "string"
                    ? sanitizeText(item, maxLength)
                    : typeof item === "object" && item !== null
                        ? sanitizeObject(item as Record<string, unknown>, maxLength)
                        : item
            );
        } else if (typeof value === "object" && value !== null) {
            result[key] = sanitizeObject(value as Record<string, unknown>, maxLength);
        } else {
            result[key] = value;
        }
    }
    return result as T;
}
