import { describe, it, expect } from 'vitest';
import {
    getDisplayLabel,
    getDisplayLabels,
    getDisplayNumber,
    formatContractDate,
    PURPOSE_LABELS,
    VISUAL_STYLE_LABELS,
    TIMELINE_LABELS,
    BUDGET_LABELS,
} from './blueprintDataContract';

describe('blueprintDataContract.ts - Display Helpers & Label Maps', () => {

    describe('getDisplayLabel', () => {
        it('returns the mapped label for a known value', () => {
            expect(getDisplayLabel('monetization', PURPOSE_LABELS)).toBe('Monetization & Sales');
            expect(getDisplayLabel('minimal', VISUAL_STYLE_LABELS)).toBe('Minimal');
        });

        it('returns the raw value if no label mapping exists', () => {
            expect(getDisplayLabel('custom_value', PURPOSE_LABELS)).toBe('custom_value');
        });

        it('returns "Not provided" for null or undefined', () => {
            expect(getDisplayLabel(null, PURPOSE_LABELS)).toBe('Not provided');
            expect(getDisplayLabel(undefined, PURPOSE_LABELS)).toBe('Not provided');
        });

        it('returns "Not provided" for empty string', () => {
            expect(getDisplayLabel('', PURPOSE_LABELS)).toBe('Not provided');
        });
    });

    describe('getDisplayLabels', () => {
        it('returns comma-separated labels for an array of known values', () => {
            const result = getDisplayLabels(['urgent', 'flexible'], TIMELINE_LABELS);
            expect(result).toBe('Urgent (within 1 month), Flexible');
        });

        it('returns "None selected" for null or empty array', () => {
            expect(getDisplayLabels(null, TIMELINE_LABELS)).toBe('None selected');
            expect(getDisplayLabels([], TIMELINE_LABELS)).toBe('None selected');
            expect(getDisplayLabels(undefined, TIMELINE_LABELS)).toBe('None selected');
        });

        it('falls back to raw values for unmapped entries', () => {
            const result = getDisplayLabels(['under_5k', 'custom_budget'], BUDGET_LABELS);
            expect(result).toBe('Under $5,000, custom_budget');
        });
    });

    describe('getDisplayNumber', () => {
        it('formats a number with an optional suffix', () => {
            expect(getDisplayNumber(7, '/10')).toBe('7/10');
            expect(getDisplayNumber(100, '%')).toBe('100%');
        });

        it('returns "Not provided" for null or undefined', () => {
            expect(getDisplayNumber(null)).toBe('Not provided');
            expect(getDisplayNumber(undefined)).toBe('Not provided');
        });

        it('handles zero correctly (not treated as falsy)', () => {
            expect(getDisplayNumber(0, ' items')).toBe('0 items');
        });
    });

    describe('formatContractDate', () => {
        it('formats a valid ISO date to a readable string', () => {
            const result = formatContractDate('2025-03-15T10:30:00.000Z');
            // en-GB format: "15 March 2025"
            expect(result).toContain('March');
            expect(result).toContain('2025');
        });

        it('returns "Not provided" for null', () => {
            expect(formatContractDate(null)).toBe('Not provided');
        });

        it('returns "Not provided" for invalid date strings', () => {
            expect(formatContractDate('not-a-date')).toBe('Not provided');
        });
    });

    describe('Label Map Completeness', () => {
        it('PURPOSE_LABELS covers all expected keys', () => {
            const expectedKeys = ['monetization', 'lead_contact', 'promotion', 'operations', 'content_community'];
            for (const key of expectedKeys) {
                expect(PURPOSE_LABELS[key]).toBeDefined();
            }
        });

        it('BUDGET_LABELS covers all expected keys', () => {
            const expectedKeys = ['under_5k', '5_10k', '10_25k', 'flexible'];
            for (const key of expectedKeys) {
                expect(BUDGET_LABELS[key]).toBeDefined();
            }
        });

        it('TIMELINE_LABELS covers all expected keys', () => {
            const expectedKeys = ['urgent', '4_6_weeks', '6_10_weeks', 'flexible'];
            for (const key of expectedKeys) {
                expect(TIMELINE_LABELS[key]).toBeDefined();
            }
        });
    });

});
