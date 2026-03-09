import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { phase2, auditLog } from './index';

describe('submit-blueprint Pipeline Health (Phase 2)', () => {
    let mockFetch: any;
    let mockSupabase: any;

    beforeEach(() => {
        mockFetch = vi.fn();
        globalThis.fetch = mockFetch;

        // Reset supabase mocks
        const createMockChain = () => {
            const chain: any = {
                from: vi.fn(() => chain),
                select: vi.fn(() => chain),
                eq: vi.fn(() => chain),
                single: vi.fn(() => chain),
                update: vi.fn(() => chain),
                insert: vi.fn(() => chain),
            };
            return chain;
        };
        mockSupabase = createMockChain();

        // Reset Deno env
        (globalThis as any).Deno.env.get = vi.fn((key: string) => {
            if (key === 'SUPABASE_URL') return 'https://mock.supabase.co';
            if (key === 'SUPABASE_SERVICE_ROLE_KEY') return 'mock-key';
            if (key === 'RESEND_API_KEY') return 'mock-resend-key';
            if (key === 'BLUEPRINT_HMAC_SECRET') return 'mock-hmac-secret';
            if (key === 'OPS_CONSOLE_URL') return 'https://mock.opsconsole.com';
            return `mock-${key}`;
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('successfully executes email dispatch, ops console handoff, and audit logging', async () => {
        // Setup successful fetch requests (Resend & Ops Console)
        mockFetch.mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({ id: 'mock-id', duplicate: false }),
        });

        const mockBlueprint = {
            id: 'bp-123',
            user_email: 'client@example.com',
            first_name: 'John',
            business_name: 'Acme Corp',
            discovery: { primaryPurpose: 'Leads' },
            created_at: '2023-01-01T00:00:00Z',
        };

        const scores = { complexity_score: 80, integrity_score: 80, complexity_tier: 'enterprise' };
        const mockPdfUrl = 'https://mock.pdf/file';
        const req = new Request('https://functions.supabase.com/submit-blueprint', { method: 'POST' });

        // ── Execute Phase 2 directly ──
        await phase2(mockSupabase, mockBlueprint, scores, mockPdfUrl, req);

        // 1. Audit logger called (insertions into blueprint_audit_log)
        expect(mockSupabase.insert).toHaveBeenCalled();
        const insertCalls = mockSupabase.insert.mock.calls;
        const loggedEvents = insertCalls
            .filter((c: any) => c[0] && c[0].event_type !== undefined)
            .map((c: any) => c[0].event_type);

        expect(loggedEvents).toContain('email_sent');
        expect(loggedEvents).toContain('hmac_handoff_success');

        // 2. Email sent via Resend API
        const emailCall = mockFetch.mock.calls.find((c: any) => c[0] === 'https://api.resend.com/emails');
        expect(emailCall).toBeDefined();
        const emailPayload = JSON.parse(emailCall[1].body);
        expect(emailPayload.to).toContain('client@example.com');
        expect(emailPayload.html).toContain(mockPdfUrl);

        // Tracked in database
        const dbEmailLog = insertCalls.find((c: any) => c[0] && c[0].email_type === 'submission_receipt');
        expect(dbEmailLog).toBeDefined();
        expect(dbEmailLog[0].status).toBe('sent');

        // 3. Ops Console notified via HTTP fetch
        const opsCall = mockFetch.mock.calls.find((c: any) => c[0].includes('receive-blueprint-submission'));
        expect(opsCall).toBeDefined();
        expect(opsCall[1].headers).toHaveProperty('x-blueprint-signature'); // HMAC signing happened
    });

    it('audit logs failures securely without crashing the pipeline', async () => {
        // Simulate a complete failure of the Ops Console and Resend APIs
        mockFetch.mockResolvedValue({
            ok: false,
            status: 500,
            json: async () => ({ error: 'Internal Server Error' }),
            text: async () => 'Internal Server Error',
        });

        const mockBlueprint = { id: 'bp-123', user_email: 'client@example.com' };

        // Mock setTimeout to immediately execute the callback, bypassing the 7s total retry delay
        const originalSetTimeout = globalThis.setTimeout;
        globalThis.setTimeout = ((cb: any) => cb()) as any;

        // This should not throw, we want it to silently log the failure
        await phase2(mockSupabase, mockBlueprint, { complexity_score: 50, integrity_score: 50, complexity_tier: 'growth' }, null, new Request('https://mock.com'));

        globalThis.setTimeout = originalSetTimeout;

        const insertCalls = mockSupabase.insert.mock.calls;
        const loggedEvents = insertCalls
            .filter((c: any) => c[0] && c[0].event_type !== undefined)
            .map((c: any) => c[0].event_type);

        expect(loggedEvents).toContain('email_failed');
        expect(loggedEvents).toContain('hmac_handoff_failed');

        // DB Email log is marked failed
        const dbEmailLog = insertCalls.find((c: any) => c[0] && c[0].email_type === 'submission_receipt');
        expect(dbEmailLog[0].status).toBe('failed');
    });
});
