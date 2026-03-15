/**
 * insight-map.test.ts — Tests for deterministic insight mapping
 *
 * Validates:
 *  - Purpose → label mapping
 *  - Goal → label mapping
 *  - Pattern detection (single, dual_funnel, category_aligned, multi_threaded, ops_growth)
 *  - Industry topic openers
 *  - Sales personality modifiers
 *  - Advanced objective precision
 *  - Full observation composition
 *  - Edge cases (empty input, missing fields)
 */

import { describe, it, expect } from 'vitest';
import {
    PURPOSE_MAP,
    GOAL_MAP,
    formatSummaryData,
    type DiscoveryInput,
} from './insight-map.ts';

// ── Label Mapping ─────────────────────────────────────────

describe('PURPOSE_MAP', () => {
    it('maps all 5 primary purpose values', () => {
        const expected = ['monetization', 'lead_contact', 'promotion', 'operations', 'content_community'];
        for (const key of expected) {
            expect(PURPOSE_MAP[key]).toBeDefined();
            expect(PURPOSE_MAP[key].label).toBeTruthy();
            expect(PURPOSE_MAP[key].insight).toBeTruthy();
        }
    });

    it('returns human-readable labels, not raw enums', () => {
        expect(PURPOSE_MAP.monetization.label).toBe('Monetization & Sales');
        expect(PURPOSE_MAP.lead_contact.label).toBe('Lead & Contact Generation');
        expect(PURPOSE_MAP.promotion.label).toBe('Promotion & Visibility');
        expect(PURPOSE_MAP.operations.label).toBe('Operations & Admin');
        expect(PURPOSE_MAP.content_community.label).toBe('Content & Community');
    });
});

describe('GOAL_MAP', () => {
    it('maps all 15 conversion goal values', () => {
        const expected = [
            'sell_products', 'sell_services', 'subscriptions',
            'capture_leads', 'book_calls', 'get_inquiries',
            'showcase_portfolio', 'build_authority', 'attract_talent',
            'client_portal', 'internal_tools', 'documentation',
            'publish_content', 'build_audience', 'foster_community',
        ];
        for (const key of expected) {
            expect(GOAL_MAP[key]).toBeDefined();
            expect(GOAL_MAP[key].label).toBeTruthy();
            expect(GOAL_MAP[key].insight).toBeTruthy();
        }
    });
});

// ── formatSummaryData ───────────────────────────────────────

describe('formatSummaryData', () => {
    it('handles completely empty input', () => {
        const result = formatSummaryData({});
        expect(result.directionLabel).toBe('Digital Platform');
        expect(result.goalsLabel).toBe('Not specified');
        expect(result.supportingLabel).toBeNull();
        expect(result.observation).toBeTruthy();
    });

    it('maps primary purpose to Direction label', () => {
        const result = formatSummaryData({ primaryPurpose: 'lead_contact' });
        expect(result.directionLabel).toBe('Lead & Contact Generation');
    });

    it('maps conversion goals to human-readable dot-separated list', () => {
        const result = formatSummaryData({
            conversionGoals: ['book_calls', 'capture_leads'],
        });
        expect(result.goalsLabel).toBe('Call Booking · Lead Capture');
    });

    it('maps secondary purposes to supporting label with + prefix', () => {
        const result = formatSummaryData({
            primaryPurpose: 'lead_contact',
            secondaryPurposes: ['promotion'],
        });
        expect(result.supportingLabel).toBe('+ Promotion & Visibility');
    });

    it('returns null supportingLabel when no secondary purposes', () => {
        const result = formatSummaryData({
            primaryPurpose: 'lead_contact',
            secondaryPurposes: [],
        });
        expect(result.supportingLabel).toBeNull();
    });

    it('returns null supportingLabel when secondaryPurposes undefined', () => {
        const result = formatSummaryData({
            primaryPurpose: 'monetization',
        });
        expect(result.supportingLabel).toBeNull();
    });
});

// ── Observation Composition ─────────────────────────────────

describe('observation composition', () => {
    it('uses industry opener when siteTopic provided', () => {
        const result = formatSummaryData({
            siteTopic: 'photography',
            primaryPurpose: 'lead_contact',
            conversionGoals: ['book_calls'],
        });
        expect(result.observation).toContain('Your photography platform');
    });

    it('falls back to generic opener when no siteTopic', () => {
        const result = formatSummaryData({
            primaryPurpose: 'monetization',
            conversionGoals: ['sell_products'],
        });
        expect(result.observation).toContain('Your platform');
    });

    it('detects single-goal pattern', () => {
        const result = formatSummaryData({
            siteTopic: 'ecommerce',
            primaryPurpose: 'monetization',
            conversionGoals: ['sell_products'],
        });
        expect(result.observation).toContain('one job');
        expect(result.observation).toContain('Product Sales');
    });

    it('detects dual-funnel pattern with decision friction implication', () => {
        const result = formatSummaryData({
            primaryPurpose: 'promotion',
            conversionGoals: ['showcase_portfolio', 'book_calls'],
        });
        expect(result.observation).toContain('two conversion paths');
        expect(result.observation).toContain('decide what the site is for');
    });

    it('detects category-aligned pattern', () => {
        const result = formatSummaryData({
            primaryPurpose: 'lead_contact',
            conversionGoals: ['capture_leads', 'book_calls', 'get_inquiries'],
        });
        expect(result.observation).toContain('aligned goals');
    });

    it('detects multi-threaded pattern with dilution implication', () => {
        const result = formatSummaryData({
            primaryPurpose: 'monetization',
            secondaryPurposes: ['content_community'],
            conversionGoals: ['sell_products', 'publish_content', 'build_audience'],
        });
        expect(result.observation).toContain('multiple objectives');
        expect(result.observation).toContain('visitor will decide for you');
    });

    it('detects ops_growth pattern with audience tension implication', () => {
        const result = formatSummaryData({
            primaryPurpose: 'operations',
            secondaryPurposes: ['lead_contact'],
            conversionGoals: ['client_portal', 'get_inquiries'],
        });
        expect(result.observation).toContain('pulling double duty');
        expect(result.observation).toContain('completely different things');
    });
});

// ── Contradiction Detection ─────────────────────────────────

describe('contradiction detection', () => {
    it('detects luxury_gatekeeper + visible pricing tension', () => {
        const result = formatSummaryData({
            siteTopic: 'consulting_services',
            primaryPurpose: 'monetization',
            conversionGoals: ['sell_services'],
            salesPersonality: 'luxury_gatekeeper',
            advancedObjectives: { pricing_model: 'value_based', visibility: 'yes' },
        });
        expect(result.observation).toContain('selective access');
        expect(result.observation).toContain('self-qualify');
    });

    it('detects fast_freemium + service sales tension', () => {
        const result = formatSummaryData({
            siteTopic: 'saas_software',
            primaryPurpose: 'monetization',
            conversionGoals: ['subscriptions', 'sell_services'],
            salesPersonality: 'fast_freemium',
        });
        expect(result.observation).toContain('zero-friction entry');
        expect(result.observation).toContain('trust-building');
    });

    it('detects educator + aggressive monetization tension', () => {
        const result = formatSummaryData({
            siteTopic: 'education',
            primaryPurpose: 'monetization',
            conversionGoals: ['subscriptions'],
            salesPersonality: 'educator',
        });
        expect(result.observation).toContain('teach before you sell');
        expect(result.observation).toContain('toll booth');
    });

    it('detects movement_starter + operations tension', () => {
        const result = formatSummaryData({
            primaryPurpose: 'operations',
            secondaryPurposes: ['promotion'],
            conversionGoals: ['client_portal', 'build_authority'],
            salesPersonality: 'movement_starter',
        });
        expect(result.observation).toContain('build a movement');
        expect(result.observation).toContain('operational');
    });

    it('detects quietly_authoritative + portfolio + authority tension', () => {
        const result = formatSummaryData({
            siteTopic: 'design_creative',
            primaryPurpose: 'promotion',
            conversionGoals: ['build_authority', 'showcase_portfolio'],
            salesPersonality: 'quietly_authoritative',
        });
        expect(result.observation).toContain('restraint and display');
        expect(result.observation).toContain('Curation over volume');
    });

    it('detects algorithmic_closer + content_community tension', () => {
        const result = formatSummaryData({
            primaryPurpose: 'content_community',
            conversionGoals: ['publish_content', 'build_audience'],
            salesPersonality: 'algorithmic_closer',
        });
        expect(result.observation).toContain('funnel-driven');
        expect(result.observation).toContain('guided discovery');
    });

    it('detects slow_burn_strategist + monetization tension', () => {
        const result = formatSummaryData({
            primaryPurpose: 'monetization',
            conversionGoals: ['sell_services'],
            salesPersonality: 'slow_burn_strategist',
        });
        expect(result.observation).toContain('long game');
        expect(result.observation).toContain('nurture and convert simultaneously');
    });

    it('contradiction takes priority over advanced precision', () => {
        const result = formatSummaryData({
            siteTopic: 'saas_software',
            primaryPurpose: 'monetization',
            conversionGoals: ['subscriptions', 'sell_services'],
            salesPersonality: 'fast_freemium',
            advancedObjectives: { pricing_model: 'value_based', visibility: 'yes' },
        });
        // Should contain contradiction, not pricing precision
        expect(result.observation).toContain('zero-friction entry');
        expect(result.observation).not.toContain('self-qualification tool');
    });

    it('falls through to advanced precision when no contradiction', () => {
        const result = formatSummaryData({
            primaryPurpose: 'lead_contact',
            conversionGoals: ['book_calls'],
            salesPersonality: 'guided_sherpa',
            advancedObjectives: { booking_type: 'discovery_call' },
        });
        // No contradiction between guided_sherpa + book_calls, so advanced precision fires
        expect(result.observation).toContain('discovery calls');
    });
});

// ── Sales Personality Modifiers ─────────────────────────────

describe('sales personality modifiers', () => {
    it('includes personality insight when no advanced objectives and no contradiction', () => {
        const result = formatSummaryData({
            siteTopic: 'consulting_services',
            primaryPurpose: 'lead_contact',
            conversionGoals: ['book_calls'],
            salesPersonality: 'luxury_gatekeeper',
        });
        expect(result.observation).toContain('gate');
    });

    it('prefers advanced precision over personality when both present', () => {
        const result = formatSummaryData({
            siteTopic: 'consulting_services',
            primaryPurpose: 'lead_contact',
            conversionGoals: ['book_calls'],
            salesPersonality: 'luxury_gatekeeper',
            advancedObjectives: { booking_type: 'consultation' },
        });
        // Should use advanced precision (consultation) not personality
        expect(result.observation).toContain('Paid consultations');
    });
});

// ── Advanced Objective Precision ────────────────────────────

describe('advanced objective precision', () => {
    it('adds booking_type precision', () => {
        const result = formatSummaryData({
            primaryPurpose: 'lead_contact',
            conversionGoals: ['book_calls'],
            advancedObjectives: { booking_type: 'discovery_call' },
        });
        expect(result.observation).toContain('discovery calls');
    });

    it('adds lead_type precision', () => {
        const result = formatSummaryData({
            primaryPurpose: 'lead_contact',
            conversionGoals: ['capture_leads'],
            advancedObjectives: { lead_type: 'gated_content' },
        });
        expect(result.observation).toContain('Gated resources');
    });

    it('adds pricing visibility precision', () => {
        const result = formatSummaryData({
            primaryPurpose: 'monetization',
            conversionGoals: ['sell_services'],
            advancedObjectives: { pricing_model: 'value_based', visibility: 'no' },
        });
        expect(result.observation).toContain('perceived value');
    });

    it('adds content_format precision', () => {
        const result = formatSummaryData({
            primaryPurpose: 'content_community',
            conversionGoals: ['publish_content'],
            advancedObjectives: { content_format: 'video' },
        });
        expect(result.observation).toContain('Video');
    });
});

// ── Real-World Scenario Tests ───────────────────────────────

describe('real-world scenarios', () => {
    it('Scenario A: Photographer booking shoots', () => {
        const result = formatSummaryData({
            siteTopic: 'photography',
            primaryPurpose: 'lead_contact',
            secondaryPurposes: ['promotion'],
            conversionGoals: ['book_calls', 'showcase_portfolio'],
            salesPersonality: 'quietly_authoritative',
            advancedObjectives: { booking_type: 'discovery_call' },
        });
        expect(result.directionLabel).toBe('Lead & Contact Generation');
        expect(result.goalsLabel).toBe('Call Booking · Portfolio Showcase');
        expect(result.supportingLabel).toBe('+ Promotion & Visibility');
        expect(result.observation).toContain('Your photography platform');
        expect(result.observation).toContain('two conversion paths');
    });

    it('Scenario B: SaaS selling subscriptions (triggers freemium + services contradiction)', () => {
        const result = formatSummaryData({
            siteTopic: 'saas_software',
            primaryPurpose: 'monetization',
            secondaryPurposes: [],
            conversionGoals: ['subscriptions', 'sell_services'],
            salesPersonality: 'fast_freemium',
            advancedObjectives: { pricing_model: 'value_based', visibility: 'yes' },
        });
        expect(result.directionLabel).toBe('Monetization & Sales');
        expect(result.goalsLabel).toBe('Subscriptions · Service Sales');
        expect(result.supportingLabel).toBeNull();
        expect(result.observation).toContain('Your software platform');
        // Should fire freemium + services contradiction (checked before gatekeeper + visibility)
        expect(result.observation).toContain('zero-friction entry');
    });

    it('Scenario C: Wellness coach content-led nurture', () => {
        const result = formatSummaryData({
            siteTopic: 'health_wellness',
            primaryPurpose: 'content_community',
            secondaryPurposes: ['lead_contact'],
            conversionGoals: ['publish_content', 'build_audience', 'capture_leads'],
            salesPersonality: 'slow_burn_strategist',
            advancedObjectives: { content_format: 'mixed', lead_type: 'gated_content' },
        });
        expect(result.directionLabel).toBe('Content & Community');
        expect(result.goalsLabel).toContain('Content Publishing');
        expect(result.supportingLabel).toBe('+ Lead & Contact Generation');
        expect(result.observation).toContain('Your wellness platform');
    });

    it('Scenario D: Construction company ops-first', () => {
        const result = formatSummaryData({
            siteTopic: 'construction_trades',
            primaryPurpose: 'operations',
            secondaryPurposes: ['lead_contact'],
            conversionGoals: ['client_portal', 'get_inquiries'],
            salesPersonality: 'natural_approachable',
        });
        expect(result.directionLabel).toBe('Operations & Admin');
        expect(result.goalsLabel).toContain('Client Portal');
        expect(result.supportingLabel).toBe('+ Lead & Contact Generation');
        expect(result.observation).toContain('pulling double duty');
    });

    it('Scenario E: Personal brand luxury gatekeeper', () => {
        const result = formatSummaryData({
            siteTopic: 'personal_brand',
            primaryPurpose: 'promotion',
            secondaryPurposes: ['monetization'],
            conversionGoals: ['build_authority', 'sell_services'],
            salesPersonality: 'luxury_gatekeeper',
            advancedObjectives: { pricing_model: 'value_based', visibility: 'no' },
        });
        expect(result.directionLabel).toBe('Promotion & Visibility');
        expect(result.goalsLabel).toBe('Authority Building · Service Sales');
        expect(result.supportingLabel).toBe('+ Monetization & Sales');
        expect(result.observation).toContain('Your platform');
    });
});

