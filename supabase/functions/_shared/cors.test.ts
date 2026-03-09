import { describe, it, expect } from 'vitest';
import { getCorsHeaders } from './cors';

describe('cors.ts - Edge Function CORS Boundary', () => {

    describe('getCorsHeaders', () => {
        it('reflects allowed production domains exactly', () => {
            const origin = 'https://crafted.cleland.studio';
            const req = new Request('https://functions.supabase.com/my-endpoint', {
                headers: new Headers({ 'origin': origin })
            });

            const headers = getCorsHeaders(req);
            expect(headers['Access-Control-Allow-Origin']).toBe(origin);
        });

        it('reflects allowed localhost domains in development', () => {
            const originPort = 'http://localhost:5173';
            const reqPort = new Request('https://functions.supabase.com/my-endpoint', {
                headers: new Headers({ 'origin': originPort })
            });

            const originBase = 'http://127.0.0.1';
            const reqBase = new Request('https://functions.supabase.com/my-endpoint', {
                headers: new Headers({ 'origin': originBase })
            });

            expect(getCorsHeaders(reqPort)['Access-Control-Allow-Origin']).toBe(originPort);
            expect(getCorsHeaders(reqBase)['Access-Control-Allow-Origin']).toBe(originBase);
        });

        it('blocks unauthorized domains by defaulting to the primary production domain', () => {
            const maliciousOrigin = 'https://hacker-website.com';
            const req = new Request('https://functions.supabase.com/my-endpoint', {
                headers: new Headers({ 'origin': maliciousOrigin })
            });

            const headers = getCorsHeaders(req);
            // It should NOT reflect the malicious origin. It defaults to the first permitted one.
            expect(headers['Access-Control-Allow-Origin']).toBe('https://crafted.cleland.studio');
            expect(headers['Access-Control-Allow-Origin']).not.toBe(maliciousOrigin);
        });

        it('handles requests with no origin gracefully', () => {
            const req = new Request('https://functions.supabase.com/my-endpoint'); // Server-to-server usually lacks 'origin'

            const headers = getCorsHeaders(req);
            expect(headers['Access-Control-Allow-Origin']).toBe('https://crafted.cleland.studio');
        });

        it('includes the correct standard CORS headers', () => {
            const req = new Request('https://functions.supabase.com/my-endpoint');
            const headers = getCorsHeaders(req);

            expect(headers['Access-Control-Allow-Methods']).toBe('POST, GET, OPTIONS');
            expect(headers['Vary']).toBe('Origin');
            expect(headers['Access-Control-Allow-Headers']).toContain('authorization');
            expect(headers['Access-Control-Allow-Headers']).toContain('x-blueprint-token');
        });
    });

});
