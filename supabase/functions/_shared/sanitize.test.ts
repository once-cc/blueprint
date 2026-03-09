import { describe, it, expect } from 'vitest';
import {
    stripHtml,
    escapeSpecialChars,
    enforceMaxLength,
    normalizeWhitespace,
    sanitizeText,
    validateUrl,
    sanitizeObject,
} from './sanitize';

describe('sanitize.ts - Security Utility Tests', () => {

    describe('stripHtml', () => {
        it('removes basic HTML tags', () => {
            expect(stripHtml('<b>Hello</b> world')).toBe('Hello world');
        });

        it('removes script tags and attributes (but not content unless parsed properly, which regex doesnt perfectly do, but strips tag)', () => {
            expect(stripHtml('<script>alert("xss")</script>')).toBe('alert("xss")');
            expect(stripHtml('<a href="javascript:alert(1)">Click</a>')).toBe('Click');
        });

        it('handles text without HTML', () => {
            expect(stripHtml('Just plain text')).toBe('Just plain text');
        });
    });

    describe('escapeSpecialChars', () => {
        it('escapes standard HTML entities', () => {
            expect(escapeSpecialChars('<>&"\'/')).toBe('&lt;&gt;&amp;&quot;&#x27;&#x2F;');
        });

        it('does not alter safe characters', () => {
            expect(escapeSpecialChars('Hello 123 !@#%^*()')).toBe('Hello 123 !@#%^*()');
        });
    });

    describe('enforceMaxLength', () => {
        it('truncates strings exceeding max length', () => {
            expect(enforceMaxLength('12345', 3)).toBe('123');
        });

        it('allows strings exactly at max length', () => {
            expect(enforceMaxLength('123', 3)).toBe('123');
        });
    });

    describe('normalizeWhitespace', () => {
        it('collapses multiple spaces to one', () => {
            expect(normalizeWhitespace('Too    many    spaces')).toBe('Too many spaces');
        });

        it('limits consecutive newlines to two', () => {
            expect(normalizeWhitespace('A\n\n\n\nB')).toBe('A\n\nB');
        });

        it('trims leading and trailing whitespace', () => {
            expect(normalizeWhitespace('  hello \n')).toBe('hello');
        });
    });

    describe('sanitizeText', () => {
        it('runs the full pipeline (strip, escape, normalize, truncate)', () => {
            const riskyInput = '  <script>   alert("hello" & \'world\'); \n\n\n  </script>    ';
            // Expected transformations:
            // 1. stripHtml: '   alert("hello" & \'world\'); \n\n\n      '
            // 2. escapeChars: '   alert(&quot;hello&quot; &amp; &#x27;world&#x27;); \n\n\n      '
            // 3. normalize: 'alert(&quot;hello&quot; &amp; &#x27;world&#x27;);\n\n' -> trim -> 'alert(&quot;hello&quot; &amp; &#x27;world&#x27;);'
            const result = sanitizeText(riskyInput);
            expect(result).toBe('alert(&quot;hello&quot; &amp; &#x27;world&#x27;);');
        });

        it('safely handles null/undefined/non-strings by returning empty string', () => {
            expect(sanitizeText(null as any)).toBe('');
            expect(sanitizeText(undefined as any)).toBe('');
            expect(sanitizeText(123 as any)).toBe('');
        });
    });

    describe('validateUrl', () => {
        it('accepts valid https URLs', () => {
            expect(validateUrl('https://cleland.studio')).toBe(true);
            expect(validateUrl('https://example.com/path?query=yes')).toBe(true);
        });

        it('rejects malicious or invalid URLs', () => {
            expect(validateUrl('javascript:alert("xss")')).toBe(false); // XSS
            expect(validateUrl('data:text/html,<script>alert(1)</script>')).toBe(false); // Data URI
            expect(validateUrl('not-a-url')).toBe(false);
            expect(validateUrl('')).toBe(false);
        });

        it('rejects URLs over the 2048 character limit', () => {
            const longUrl = 'https://example.com/' + 'a'.repeat(2050);
            expect(validateUrl(longUrl)).toBe(false);
        });
    });

    describe('sanitizeObject', () => {
        it('recursively sanitizes strings inside an object', () => {
            const rawObj = {
                firstName: ' <script>Alert</script> ',
                meta: {
                    details: 'hello & welcome',
                    tags: ['  tag1  ', '<bad>tag2</bad>'],
                },
                count: 42,
                nullable: null
            };

            const cleanObj = sanitizeObject(rawObj);

            expect(cleanObj).toEqual({
                firstName: 'Alert',
                meta: {
                    details: 'hello &amp; welcome',
                    tags: ['tag1', 'tag2'],
                },
                count: 42,
                nullable: null
            });
        });
    });

});
