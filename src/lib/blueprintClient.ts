/**
 * Centralized, memoized Supabase client for blueprint token-scoped operations.
 *
 * Replaces the 3 duplicate `createBlueprintClient` factory functions that were
 * scattered across useBlueprint.ts, BlueprintConfigurator.tsx, and ReferencesStep.tsx.
 *
 * A single client is cached per token value, so no matter how many times
 * `getBlueprintClient()` is called across the app, only ONE SupabaseClient
 * instance exists for the current session token. This eliminates the
 * "Multiple GoTrueClient instances detected" warnings.
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SESSION_TOKEN_KEY = 'blueprint_session_token';

let _cached: { client: SupabaseClient; token: string } | null = null;

/**
 * Returns a memoized, token-scoped Supabase client.
 *
 * - Reads the session token from localStorage
 * - Returns the cached client if the token hasn't changed
 * - Creates a new client only when the token changes
 * - Returns null if no token is found
 */
export function getBlueprintClient(): SupabaseClient | null {
    const token = localStorage.getItem(SESSION_TOKEN_KEY);
    if (!token) return null;

    // Return cached client if the token is the same
    if (_cached && _cached.token === token) {
        return _cached.client;
    }

    // Create a new client for this token
    const client = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        {
            global: {
                headers: { 'x-blueprint-token': token },
            },
            auth: {
                persistSession: false,
                autoRefreshToken: false,
                detectSessionInUrl: false,
            },
        }
    );

    _cached = { client, token };
    return client;
}

/**
 * Returns a memoized, token-scoped Supabase client using a provided token.
 * Used by useBlueprint.ts which reads the token itself.
 */
export function getBlueprintClientWithToken(token: string): SupabaseClient {
    if (_cached && _cached.token === token) {
        return _cached.client;
    }

    const client = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        {
            global: {
                headers: { 'x-blueprint-token': token },
            },
            auth: {
                persistSession: false,
                autoRefreshToken: false,
                detectSessionInUrl: false,
            },
        }
    );

    _cached = { client, token };
    return client;
}

/**
 * Clears the cached client. Call this when the session is reset
 * (e.g. on blueprint submission or reset).
 */
export function clearBlueprintClient(): void {
    _cached = null;
}
