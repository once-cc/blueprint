import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    escapeHtml,
    hashToken,
    uploadPdf,
    updateBlueprintRecord,
    sendEmails,
} from './index';

describe('generate-and-send-blueprint Pipeline', () => {
    let mockFetch: any;
    let mockSupabase: any;
    const originalFetch = globalThis.fetch;

    const createMockChain = (overrides: Record<string, any> = {}) => {
        const chain: any = {
            from: vi.fn(() => chain),
            select: vi.fn(() => chain),
            eq: vi.fn(() => chain),
            is: vi.fn(() => chain),
            single: vi.fn(() => chain),
            update: vi.fn(() => Promise.resolve({ data: {}, error: null })),
            insert: vi.fn(() => Promise.resolve({ error: null })),
            storage: {
                from: vi.fn(() => ({
                    upload: vi.fn(() => Promise.resolve({ error: null })),
                    createSignedUrl: vi.fn(() => Promise.resolve({ data: { signedUrl: 'https://mock.signed/url' }, error: null })),
                })),
            },
            ...overrides,
        };
        return chain;
    };

    beforeEach(() => {
        mockFetch = vi.fn();
        globalThis.fetch = mockFetch;
        mockSupabase = createMockChain();
    });

    afterEach(() => {
        globalThis.fetch = originalFetch;
        vi.restoreAllMocks();
    });

    // ── Helper Tests ──

    describe('escapeHtml', () => {
        it('escapes HTML entities', () => {
            expect(escapeHtml('<script>"test"&\'xss\'</script>')).toBe(
                '&lt;script&gt;&quot;test&quot;&amp;&#039;xss&#039;&lt;/script&gt;'
            );
        });
    });

    describe('hashToken', () => {
        it('produces a 64-char hex string (SHA-256)', async () => {
            const hash = await hashToken('test-token');
            expect(hash).toMatch(/^[a-f0-9]{64}$/);
        });

        it('produces deterministic output', async () => {
            const hash1 = await hashToken('same-input');
            const hash2 = await hashToken('same-input');
            expect(hash1).toBe(hash2);
        });

        it('produces unique hashes for different inputs', async () => {
            const hash1 = await hashToken('token-a');
            const hash2 = await hashToken('token-b');
            expect(hash1).not.toBe(hash2);
        });
    });

    // ── Step 2: Upload PDF ──

    describe('uploadPdf', () => {
        it('uploads a PDF buffer and returns a storage path and signed URL', async () => {
            const mockUpload = vi.fn(() => Promise.resolve({ error: null }));
            const mockSignedUrl = vi.fn(() => Promise.resolve({
                data: { signedUrl: 'https://signed.url/pdf' },
                error: null,
            }));

            const storageMock = {
                from: vi.fn(() => ({
                    upload: mockUpload,
                    createSignedUrl: mockSignedUrl,
                })),
            };
            const supabase = { ...mockSupabase, storage: storageMock };

            const pdfBuffer = new Uint8Array([1, 2, 3, 4]);
            const result = await uploadPdf(supabase as any, 'bp-123', pdfBuffer);

            expect(result.storagePath).toContain('bp-123/');
            expect(result.storagePath).toContain('-crafted-blueprint.pdf');
            expect(result.signedUrl).toBe('https://signed.url/pdf');
            expect(mockUpload).toHaveBeenCalledWith(
                expect.stringContaining('bp-123/'),
                pdfBuffer,
                expect.objectContaining({ contentType: 'application/pdf' })
            );
        });

        it('throws if upload fails', async () => {
            const supabase = createMockChain();
            supabase.storage = {
                from: vi.fn(() => ({
                    upload: vi.fn(() => Promise.resolve({ error: { message: 'Bucket full' } })),
                    createSignedUrl: vi.fn(),
                })),
            };

            await expect(uploadPdf(supabase as any, 'bp-123', new Uint8Array([1])))
                .rejects.toThrow('Storage upload failed');
        });
    });

    // ── Step 3: Update Blueprint Record ──

    describe('updateBlueprintRecord', () => {
        it('updates the blueprint with PDF path, signed URL, and timestamp', async () => {
            const updateMock = vi.fn(() => Promise.resolve({ error: null }));
            const supabase = createMockChain();
            // Override update to track calls
            supabase.update = vi.fn((...args: any[]) => {
                updateMock(...args);
                return supabase; // so .eq() can chain
            });

            await updateBlueprintRecord(supabase as any, 'bp-123', 'path/to/pdf', 'https://signed/url');

            expect(supabase.update).toHaveBeenCalledWith(expect.objectContaining({
                pdf_url: 'https://signed/url',
                pdf_object_path: 'path/to/pdf',
            }));
        });
    });

    // ── Step 4: Send Emails ──

    describe('sendEmails', () => {
        it('sends client email with PDF attachment via Resend', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                text: async () => '',
            });

            const blueprint = {
                id: 'bp-123',
                status: 'submitted',
                user_email: 'client@example.com',
                user_name: 'John Doe',
                business_name: 'Acme Corp',
                pdf_url: null,
                discovery: {},
                design: {},
                deliver: {},
            };

            await sendEmails(blueprint, new Uint8Array([65, 66, 67]), 'preview-token', 'https://studio.signed/url');

            // Client email
            const clientCall = mockFetch.mock.calls.find(
                (c: any) => c[0] === 'https://api.resend.com/emails' && JSON.parse(c[1].body).to?.[0] === 'client@example.com'
            );
            expect(clientCall).toBeDefined();

            const clientPayload = JSON.parse(clientCall[1].body);
            expect(clientPayload.attachments).toBeDefined();
            expect(clientPayload.attachments[0].filename).toBe('Crafted-Blueprint.pdf');
            expect(clientPayload.subject).toContain('Acme Corp');
        });

        it('skips email if no recipient', async () => {
            const blueprint = {
                id: 'bp-123',
                status: 'submitted',
                user_email: null,
                user_name: null,
                business_name: null,
                pdf_url: null,
                discovery: {},
                design: {},
                deliver: {},
            };

            await sendEmails(blueprint, new Uint8Array([1]), 'token', 'https://url');

            // No fetch calls should have been made
            expect(mockFetch).not.toHaveBeenCalled();
        });
    });

});
