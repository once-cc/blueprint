import { describe, it, expect } from 'vitest';
import { scoreBlueprint, ScoringInput } from './scoring';

describe('scoring.ts - Business Logic Engine', () => {

    it('gracefully handles completely malformed inputs (avoids crashing)', () => {
        const malformedInput = {
            discovery: null,
            design: "not an object",
            deliver: [],
            references_count: -5,
            dream_intent: null,
            first_name: undefined,
            last_name: null,
            user_email: 12345,
            business_name: NaN
        } as unknown as ScoringInput;

        const result = scoreBlueprint(malformedInput);

        // Assert it outputs safe numeric/string bounds, not NaN or crashing
        expect(typeof result.complexity_score).toBe("number");
        expect(typeof result.integrity_score).toBe("number");
        expect(['essential', 'growth', 'enterprise']).toContain(result.complexity_tier);
        expect(result.complexity_score).not.toBeNaN();
        expect(result.integrity_score).not.toBeNaN();
    });

    it('calculates proper bounds with partial data', () => {
        const partialInput = {
            discovery: { brandVoice: null },
            design: {},
            deliver: { pages: "10" },
            references_count: NaN,
            dream_intent: "",
            first_name: "John",
            last_name: "Doe",
            user_email: "test@example.com",
            business_name: null
        } as unknown as ScoringInput;

        const result = scoreBlueprint(partialInput);

        expect(result.complexity_score).toBeGreaterThanOrEqual(0);
        expect(result.complexity_score).toBeLessThanOrEqual(100);
        expect(result.integrity_score).toBeGreaterThanOrEqual(0);
        expect(result.integrity_score).toBeLessThanOrEqual(100);
    });

    it('scores a highly complex enterprise project accurately', () => {
        const enterpriseInput: ScoringInput = {
            discovery: {
                primaryPurpose: "Monetization",
                salesPersonality: "Aggressive",
                brandVoice: { tone: "Bold", presence: "Strong", personality: "Direct" },
                conversionGoals: ["Sales", "Leads"]
            },
            design: {
                visualStyle: "Premium",
                typography_direction: "Modern",
                animationIntensity: 10
            },
            deliver: {
                // > 6 pages = max complexity score for pages
                pages: ["Home", "About", "Services", "Contact", "Blog", "Pricing", "FAQ"],
                features: ["Auth", "Dashboard", "Payments", "Custom CRM"],
                timeline: "urgent", // Highest modifier
                budget: "10_25k", // Highest modifier
                riskTolerance: 10
            },
            references_count: 2,
            dream_intent: "To build a global brand",
            first_name: "Bruce",
            last_name: "Wayne",
            user_email: "bruce@wayne.com",
            business_name: "Wayne Enterprises"
        };

        const result = scoreBlueprint(enterpriseInput);

        // Assert tier output based on high factor input
        expect(result.complexity_tier).toBe('enterprise');
        expect(result.complexity_score).toBeGreaterThan(60);
        expect(result.integrity_score).toBeGreaterThan(80); // Mostly complete profile
    });

});
