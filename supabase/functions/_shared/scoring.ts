/**
 * scoring.ts — Weighted Scoring Engine for Blueprint Submissions
 *
 * Complexity Score (0–100): How complex the project requirements are.
 *   Factors: pages, features, animation, risk, timeline urgency, budget.
 *
 * Integrity Score (0–100): How complete and high-quality the submission is.
 *   Factors: required fields, references, dream intent, brand voice, goals, contact info.
 *
 * Tier Derivation: essential (0–30), growth (31–60), enterprise (61–100).
 *
 * Weights are stored as const objects for easy tuning without code changes.
 */

// ── Types ───────────────────────────────────────────────────

export interface ScoringInput {
    discovery: Record<string, unknown>;
    design: Record<string, unknown>;
    deliver: Record<string, unknown>;
    references_count: number;
    dream_intent: string | null;
    first_name: string | null;
    last_name: string | null;
    user_email: string | null;
    business_name: string | null;
}

export type ComplexityTier = 'essential' | 'growth' | 'enterprise';

export interface ScoringResult {
    complexity_score: number;
    integrity_score: number;
    complexity_tier: ComplexityTier;
}

// ── Configurable Weights (tune here) ────────────────────────

const COMPLEXITY_WEIGHTS = {
    pages: 0.20,
    features: 0.25,
    animationIntensity: 0.10,
    creativeRisk: 0.10,
    timeline: 0.15,
    budget: 0.20,
} as const;

const INTEGRITY_WEIGHTS = {
    requiredFields: 0.30,
    references: 0.15,
    dreamIntent: 0.10,
    brandVoice: 0.15,
    conversionGoals: 0.15,
    contactInfo: 0.15,
} as const;

const TIMELINE_SCORES: Record<string, number> = {
    urgent: 100,
    '4_6_weeks': 70,
    '6_10_weeks': 40,
    flexible: 20,
};

const BUDGET_SCORES: Record<string, number> = {
    under_5k: 20,
    '5_10k': 50,
    '10_25k': 80,
    flexible: 60,
};

// ── Utility ─────────────────────────────────────────────────

function clamp(n: number, min = 0, max = 100): number {
    return Math.max(min, Math.min(max, Math.round(n)));
}

// ── Complexity Score ────────────────────────────────────────

/**
 * How complex the project requirements are (0–100).
 * Higher = more pages, features, urgency, budget.
 */
export function calculateComplexityScore(input: ScoringInput): number {
    const deliver = (input.deliver || {}) as Record<string, unknown>;
    const design = (input.design || {}) as Record<string, unknown>;

    const pages = Array.isArray(deliver.pages) ? deliver.pages.length : 0;
    const features = Array.isArray(deliver.features)
        ? deliver.features.length
        : 0;
    const animIntensity =
        typeof design.animationIntensity === 'number'
            ? design.animationIntensity
            : 5;
    const risk =
        typeof deliver.riskTolerance === 'number' ? deliver.riskTolerance : 5;
    const timeline =
        typeof deliver.timeline === 'string' ? deliver.timeline : 'flexible';
    const budget =
        typeof deliver.budget === 'string' ? deliver.budget : 'flexible';

    const pagesScore = pages <= 3 ? 20 : pages <= 6 ? 50 : 90;
    const featuresScore = clamp(features * 15);
    const animScore = clamp(animIntensity * 10);
    const riskScore = clamp(risk * 10);
    const timelineScore = TIMELINE_SCORES[timeline] ?? 50;
    const budgetScore = BUDGET_SCORES[budget] ?? 50;

    const weighted =
        pagesScore * COMPLEXITY_WEIGHTS.pages +
        featuresScore * COMPLEXITY_WEIGHTS.features +
        animScore * COMPLEXITY_WEIGHTS.animationIntensity +
        riskScore * COMPLEXITY_WEIGHTS.creativeRisk +
        timelineScore * COMPLEXITY_WEIGHTS.timeline +
        budgetScore * COMPLEXITY_WEIGHTS.budget;

    return clamp(weighted);
}

// ── Integrity Score ─────────────────────────────────────────

/**
 * How complete and high-quality the submission is (0–100).
 * Higher = more fields filled, references provided, strong contact info.
 */
export function calculateIntegrityScore(input: ScoringInput): number {
    const discovery = (input.discovery || {}) as Record<string, unknown>;
    const design = (input.design || {}) as Record<string, unknown>;

    // Required fields completeness
    const coreFields = [
        discovery.primaryPurpose,
        discovery.salesPersonality,
        design.visualStyle,
        design.typography_direction,
    ];
    const filledCount = coreFields.filter(
        (f) => f != null && f !== '',
    ).length;
    const fieldsScore = clamp((filledCount / coreFields.length) * 100);

    // References
    const refScore =
        input.references_count === 0
            ? 0
            : input.references_count === 1
                ? 50
                : input.references_count === 2
                    ? 75
                    : 100;

    // Dream intent
    const intentScore = input.dream_intent ? 100 : 0;

    // Brand voice (3 axes)
    const bv = (discovery.brandVoice as Record<string, unknown>) ?? {};
    const bvAxes = ['tone', 'presence', 'personality'].filter(
        (k) => bv[k] != null,
    ).length;
    const bvScore = clamp((bvAxes / 3) * 100);

    // Conversion goals
    const goals = Array.isArray(discovery.conversionGoals)
        ? discovery.conversionGoals
        : [];
    const goalsScore = goals.length === 0 ? 0 : goals.length === 1 ? 50 : 100;

    // Contact info
    let contactScore = 0;
    if (input.first_name && input.user_email) contactScore = 70;
    if (input.business_name) contactScore = 100;

    const weighted =
        fieldsScore * INTEGRITY_WEIGHTS.requiredFields +
        refScore * INTEGRITY_WEIGHTS.references +
        intentScore * INTEGRITY_WEIGHTS.dreamIntent +
        bvScore * INTEGRITY_WEIGHTS.brandVoice +
        goalsScore * INTEGRITY_WEIGHTS.conversionGoals +
        contactScore * INTEGRITY_WEIGHTS.contactInfo;

    return clamp(weighted);
}

// ── Tier Derivation ─────────────────────────────────────────

/**
 * Derive the complexity tier from the complexity score.
 */
export function deriveTier(complexityScore: number): ComplexityTier {
    if (complexityScore <= 30) return 'essential';
    if (complexityScore <= 60) return 'growth';
    return 'enterprise';
}

// ── Combined Score ──────────────────────────────────────────

/**
 * Run the full scoring pipeline: complexity + integrity + tier.
 */
export function scoreBlueprint(input: ScoringInput): ScoringResult {
    const complexity_score = calculateComplexityScore(input);
    const integrity_score = calculateIntegrityScore(input);
    const complexity_tier = deriveTier(complexity_score);
    return { complexity_score, integrity_score, complexity_tier };
}
