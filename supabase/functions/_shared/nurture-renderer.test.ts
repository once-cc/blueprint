/**
 * nurture-renderer.test.ts — Tests for Email 2–5 renderer
 *
 * Validates:
 *   - All 4 emails render valid HTML with correct structure
 *   - Subject lines are goal/context-specific
 *   - Brand tensions are detected correctly
 *   - Scope insights produce relevant analysis
 *   - CTA interpretation uses the right phrasing
 *   - No CTA in Emails 2–4, CTA present in Email 5
 */

import { describe, it, expect } from 'vitest';
import { renderNurtureEmail, type BlueprintData } from './nurture-renderer.ts';

// ── Test Data ───────────────────────────────────────────────

const photographerBp: BlueprintData = {
    id: 'bp-001',
    first_name: 'Aria',
    business_name: 'Aethera Aesthetics',
    user_email: 'aria@example.com',
    discovery: {
        siteTopic: 'photography',
        primaryPurpose: 'lead_contact',
        secondaryPurposes: ['promotion'],
        conversionGoals: ['book_calls', 'showcase_portfolio'],
        salesPersonality: 'quietly_authoritative',
        advancedObjectives: { booking_type: 'discovery_call' },
        brandVoice: { tone: 4, presence: 5, personality: 4, visitorFeeling: { energy: 4 } },
        ctaPrimaryLabel: "Let's Talk",
    },
    deliver: {
        pages: ['home', 'about', 'services', 'portfolio', 'blog', 'contact', 'faq'],
        features: ['booking_system', 'lead_funnel', 'cms_blog'],
        timeline: '4_6_weeks',
        budget: '5_10k',
        riskTolerance: 7,
    },
};

const saasBp: BlueprintData = {
    id: 'bp-002',
    first_name: 'Marcus',
    business_name: 'FlowEngine',
    user_email: 'marcus@example.com',
    discovery: {
        siteTopic: 'saas_software',
        primaryPurpose: 'monetization',
        secondaryPurposes: [],
        conversionGoals: ['subscriptions', 'sell_services'],
        salesPersonality: 'fast_freemium',
        advancedObjectives: { pricing_model: 'value_based', visibility: 'yes' },
        brandVoice: { tone: 2, presence: 2, personality: 3, visitorFeeling: { energy: 3 } },
        ctaPrimaryLabel: 'Start Free',
    },
    deliver: {
        pages: ['home', 'pricing', 'features', 'docs'],
        features: ['ecommerce', 'analytics', 'custom_forms', 'chatbot', 'seo_tools'],
        timeline: 'urgent',
        budget: 'under_5k',
        riskTolerance: 4,
    },
};

const minimalBp: BlueprintData = {
    id: 'bp-003',
    first_name: 'Sam',
    business_name: 'Sam Co',
    user_email: 'sam@example.com',
    discovery: {},
    deliver: {},
};

// ── Email 2: The Echo ───────────────────────────────────────

describe('Email 2 — The Echo (1hr)', () => {
    it('renders with portfolio-specific subject for photographer', () => {
        const email = renderNurtureEmail(photographerBp, 2);
        expect(email.subject).toContain('portfolio');
        expect(email.emailNumber).toBe(2);
    });

    it('includes personality insight for quietly_authoritative', () => {
        const email = renderNurtureEmail(photographerBp, 2);
        expect(email.html).toContain('quietly authoritative');
        expect(email.html).toContain('undeniable proof');
    });

    it('includes open loop exit line', () => {
        const email = renderNurtureEmail(photographerBp, 2);
        expect(email.html).toContain('one signal');
    });

    it('does NOT contain Clarity Call CTA', () => {
        const email = renderNurtureEmail(photographerBp, 2);
        expect(email.html).not.toContain('Book a Clarity Call');
    });

    it('renders subscription subject for SaaS', () => {
        const email = renderNurtureEmail(saasBp, 2);
        expect(email.subject).toContain('pricing');
    });

    it('includes freemium personality insight for fast_freemium', () => {
        const email = renderNurtureEmail(saasBp, 2);
        expect(email.html).toContain('Zero-friction');
    });

    it('renders graceful fallback with minimal data', () => {
        const email = renderNurtureEmail(minimalBp, 2);
        expect(email.html).toContain('Sam');
        expect(email.subject).toBeTruthy();
        expect(email.emailNumber).toBe(2);
    });
});

// ── Email 3: The Deeper Read ────────────────────────────────

describe('Email 3 — The Deeper Read (24hr)', () => {
    it('detects brand voice values', () => {
        const email = renderNurtureEmail(photographerBp, 3);
        expect(email.html).toContain('approachable');
        expect(email.html).toContain('bold');
    });

    it('has correct subject', () => {
        const email = renderNurtureEmail(photographerBp, 3);
        expect(email.subject).toBe('Something in your brand positioning stood out');
    });

    it('includes mitigation language', () => {
        const email = renderNurtureEmail(photographerBp, 3);
        expect(email.html).toContain('Correct me if I');
    });

    it('does NOT contain Clarity Call CTA', () => {
        const email = renderNurtureEmail(photographerBp, 3);
        expect(email.html).not.toContain('Book a Clarity Call');
    });

    it('renders tension for formal + subtle SaaS brand', () => {
        const email = renderNurtureEmail(saasBp, 3);
        // Professional + Minimal = formal/subtle flavour
        expect(email.html).toContain('Professional');
    });
});

// ── Email 4: The Strategic Scope ────────────────────────────

describe('Email 4 — The Strategic Scope (72hr)', () => {
    it('references page count and features', () => {
        const email = renderNurtureEmail(photographerBp, 4);
        expect(email.html).toContain('7 pages');
        expect(email.html).toContain('Booking System');
    });

    it('includes timeline and budget', () => {
        const email = renderNurtureEmail(photographerBp, 4);
        expect(email.html).toContain('Standard');
        expect(email.html).toContain('$5–10K');
    });

    it('has correct subject', () => {
        const email = renderNurtureEmail(photographerBp, 4);
        expect(email.subject).toBe('Your scope contains a decision');
    });

    it('does NOT contain Clarity Call CTA', () => {
        const email = renderNurtureEmail(photographerBp, 4);
        expect(email.html).not.toContain('Book a Clarity Call');
    });

    it('detects ambitious scope with tight constraints (SaaS)', () => {
        const email = renderNurtureEmail(saasBp, 4);
        // 5 features + urgent + under_5k = ambitious + constrained → first branch fires
        expect(email.html).toContain('E-commerce');
        expect(email.html).toContain('Urgent');
    });

    it('renders graceful fallback with minimal deliver data', () => {
        const email = renderNurtureEmail(minimalBp, 4);
        expect(email.html).toContain('Sam');
        expect(email.subject).toBe('Your scope contains a decision');
    });
});

// ── Email 5: The Invitation ─────────────────────────────────

describe('Email 5 — The Invitation (7d)', () => {
    it('has correct subject', () => {
        const email = renderNurtureEmail(photographerBp, 5);
        expect(email.subject).toBe('One last thing before we go quiet');
    });

    it('interprets conversational CTA "Let\'s Talk"', () => {
        const email = renderNurtureEmail(photographerBp, 5);
        // Apostrophe is HTML-escaped in the output
        expect(email.html).toContain('Talk');
        expect(email.html).toContain('conversation opener');
    });

    it('includes Clarity Call CTA', () => {
        const email = renderNurtureEmail(photographerBp, 5);
        expect(email.html).toContain('Book a Clarity Call');
        expect(email.html).toContain('No pitch');
    });

    it('includes blueprint-specific CTA URL', () => {
        const email = renderNurtureEmail(photographerBp, 5);
        expect(email.html).toContain('clarity?id=bp-001');
    });

    it('interprets action CTA "Start Free"', () => {
        const email = renderNurtureEmail(saasBp, 5);
        expect(email.html).toContain('Start Free');
        expect(email.html).toContain('action trigger');
    });

    it('renders graceful fallback without CTA label', () => {
        const email = renderNurtureEmail(minimalBp, 5);
        expect(email.html).toContain('Book a Clarity Call');
        expect(email.html).toContain('most important moment');
    });
});

// ── Cross-Cutting ───────────────────────────────────────────

describe('cross-cutting email properties', () => {
    it('all emails include Cleland Studio footer', () => {
        for (const num of [2, 3, 4, 5] as const) {
            const email = renderNurtureEmail(photographerBp, num);
            expect(email.html).toContain('Cleland Studio');
        }
    });

    it('all emails use firstName greeting', () => {
        for (const num of [2, 3, 4, 5] as const) {
            const email = renderNurtureEmail(photographerBp, num);
            expect(email.html).toContain('Aria');
        }
    });

    it('all emails escape HTML in user content', () => {
        const xssBp: BlueprintData = {
            ...photographerBp,
            first_name: '<script>alert("xss")</script>',
            discovery: {
                ...photographerBp.discovery,
                ctaPrimaryLabel: '<img onerror="alert(1)">',
            },
        };

        for (const num of [2, 3, 4, 5] as const) {
            const email = renderNurtureEmail(xssBp, num);
            // Raw script tags must not appear in output
            expect(email.html).not.toContain('<script>');
            expect(email.html).not.toContain('<img onerror');
        }
    });
});
