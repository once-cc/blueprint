/**
 * insight-map.ts — Deterministic Insight Mapping for Blueprint Email Summaries
 *
 * Transforms raw configurator enum values into human-readable labels and
 * strategic observations. No AI/LLM at runtime — purely lookup-based.
 *
 * Editorial voice: interpretive, not descriptive. Every observation tells the
 * user something they didn't know they were communicating. Follows the
 * observation_copywriting_principles.md guidelines.
 *
 * Four-layer observation system:
 *   Layer 1: Industry context opener (siteTopic)
 *   Layer 2: Purpose + goals pattern detection
 *   Layer 3: Sales personality modifier
 *   Layer 4: Advanced objective precision (optional)
 */

// ── Types ───────────────────────────────────────────────────

export interface InsightEntry {
    label: string;
    insight: string;
}

export interface SummaryData {
    directionLabel: string;       // e.g. "Lead & Contact Generation"
    goalsLabel: string;           // e.g. "Call Booking · Lead Capture"
    supportingLabel: string | null; // e.g. "+ Promotion & Visibility" or null
    observation: string;          // 1–2 sentence strategic insight
}

export interface DiscoveryInput {
    siteTopic?: string;
    primaryPurpose?: string;
    secondaryPurposes?: string[];
    conversionGoals?: string[];
    salesPersonality?: string;
    advancedObjectives?: Record<string, string>;
}

// ── Purpose Map ─────────────────────────────────────────────

export const PURPOSE_MAP: Record<string, InsightEntry> = {
    monetization: {
        label: 'Monetization & Sales',
        insight: 'Every page on your site either earns revenue or gets in the way of it. There is no neutral ground.',
    },
    lead_contact: {
        label: 'Lead & Contact Generation',
        insight: 'You\'re in the business of starting conversations, not closing transactions. That changes everything about how trust is built on your site.',
    },
    promotion: {
        label: 'Promotion & Visibility',
        insight: 'Your site is your first impression — and most visitors will decide within 3 seconds whether you\'re worth their attention.',
    },
    operations: {
        label: 'Operations & Admin',
        insight: 'Your site is infrastructure. It doesn\'t need to persuade — it needs to perform. Clarity and reliability over cleverness.',
    },
    content_community: {
        label: 'Content & Community',
        insight: 'You\'re building a publishing platform. The editorial experience is the product — how content is consumed determines whether people stay or scan.',
    },
};

// ── Conversion Goal Map ─────────────────────────────────────

export const GOAL_MAP: Record<string, InsightEntry> = {
    // Monetization
    sell_products: {
        label: 'Product Sales',
        insight: 'If somebody wants what you\'re selling, the only thing that stops them is friction. Every click between interest and checkout is a leak.',
    },
    sell_services: {
        label: 'Service Sales',
        insight: 'Nobody buys a service they don\'t trust. Your site has to demonstrate expertise before it asks for money.',
    },
    subscriptions: {
        label: 'Subscriptions',
        insight: 'Recurring revenue means recurring proof of value. Your tiers need to make the upgrade feel obvious, not optional.',
    },
    // Lead & Contact
    capture_leads: {
        label: 'Lead Capture',
        insight: 'An email address is a currency exchange. What you\'re offering above the form has to feel worth more than the inbox space it costs.',
    },
    book_calls: {
        label: 'Call Booking',
        insight: 'A booking CTA only works if the visitor already believes the conversation will be worth their time. The page above the button has to earn that belief.',
    },
    get_inquiries: {
        label: 'Direct Inquiries',
        insight: 'Inquiry forms convert best when visitors already know what to ask for. Your site should set the scope before the form appears.',
    },
    // Promotion
    showcase_portfolio: {
        label: 'Portfolio Showcase',
        insight: 'Your work is your sales team. Every image, every case study, either earns the next scroll or loses the visitor. Presentation is positioning.',
    },
    build_authority: {
        label: 'Authority Building',
        insight: 'Authority isn\'t built by saying you\'re an expert. It\'s demonstrated by showing depth that competitors don\'t bother with.',
    },
    attract_talent: {
        label: 'Talent Attraction',
        insight: 'The best candidates don\'t apply to job listings. They apply to cultures they want to be part of. Your site needs to show the experience, not just the role.',
    },
    // Operations
    client_portal: {
        label: 'Client Portal',
        insight: 'A portal is a retention tool disguised as a feature. Every interaction should reinforce why they chose you.',
    },
    internal_tools: {
        label: 'Internal Tools',
        insight: 'Internal tools have one job: make the team faster. Design for speed and clarity, not aesthetics.',
    },
    documentation: {
        label: 'Documentation Hub',
        insight: 'Documentation is self-service support. If people can\'t find what they need in 30 seconds, they\'ll message you instead. That means structure is the design problem.',
    },
    // Content & Community
    publish_content: {
        label: 'Content Publishing',
        insight: 'Content doesn\'t convert because it exists. It converts because it\'s organised in a way that makes people want the next piece.',
    },
    build_audience: {
        label: 'Audience Growth',
        insight: 'Audience capture has to be woven into the content experience. If the opt-in feels bolted on, it gets ignored.',
    },
    foster_community: {
        label: 'Community Building',
        insight: 'Passive consumption is the enemy of community. If people aren\'t interacting, they\'re just browsing — and browsers leave.',
    },
};

// ── Goal Category Map ───────────────────────────────────────

const GOAL_CATEGORIES: Record<string, string> = {
    sell_products: 'monetization',
    sell_services: 'monetization',
    subscriptions: 'monetization',
    capture_leads: 'lead_contact',
    book_calls: 'lead_contact',
    get_inquiries: 'lead_contact',
    showcase_portfolio: 'promotion',
    build_authority: 'promotion',
    attract_talent: 'promotion',
    client_portal: 'operations',
    internal_tools: 'operations',
    documentation: 'operations',
    publish_content: 'content_community',
    build_audience: 'content_community',
    foster_community: 'content_community',
};

// ── Site Topic Map ──────────────────────────────────────────

const TOPIC_OPENERS: Record<string, string> = {
    photography: 'Your photography platform',
    design_creative: 'Your creative studio',
    health_wellness: 'Your wellness platform',
    real_estate: 'Your real estate presence',
    construction_trades: 'Your construction platform',
    ecommerce: 'Your e-commerce platform',
    saas_software: 'Your software platform',
    education: 'Your education platform',
    consulting_services: 'Your consultancy',
    personal_brand: 'Your platform',
};

// ── Sales Personality Modifiers ─────────────────────────────

const PERSONALITY_MODIFIERS: Record<string, string> = {
    fast_freemium: 'Your freemium approach means the barrier to entry has to be invisible. The site should convert visitors into users before they finish deciding whether they need you.',
    social_proof_closer: 'You sell through evidence, not persuasion. That means your testimonials, results, and client stories aren\'t supporting content — they\'re the main act.',
    natural_approachable: 'Your approachable tone means the site should feel like an open door, not a sales pitch. Warmth first, offer second.',
    guided_sherpa: 'You lead people through decisions, not into them. Your site needs a clear, step-by-step path that makes overwhelm impossible.',
    educator: 'You teach before you sell. That means content quality drives conversions, not urgency. Depth is your closing mechanism.',
    quietly_authoritative: 'You let the work do the talking. That means the design has to demonstrate confidence — not state it. No urgency banners. No popups. Just undeniable proof, then the invitation.',
    luxury_gatekeeper: 'You make access feel earned. That means the site has to justify the gate — exceptional credibility above the fold, before the visitor even knows there\'s a velvet rope.',
    slow_burn_strategist: 'You play the long game. Your site\'s editorial and nurture architecture matters as much as the conversion. You\'re building trust that compounds.',
    movement_starter: 'You\'re not selling a product — you\'re building something people want to belong to. The site needs to create a sense of membership, not just a purchase path.',
    algorithmic_closer: 'Your funnel-driven approach means guided pathways need to feel intelligent and personalised. If it feels mechanical, you lose the prospect at the first branch.',
};

// ── Advanced Objective Precision ────────────────────────────

const ADVANCED_PRECISION: Record<string, Record<string, string>> = {
    booking_type: {
        discovery_call: 'With discovery calls as your conversion event, visitors need to believe the conversation will be worth their time before the button even appears.',
        consultation: 'Paid consultations position your expertise as the product. The site has to demonstrate that expertise before it asks for payment — proof before price.',
        demo: 'Product demos only convert when visitors arrive informed. The page above the CTA should answer their questions so the demo confirms, not explains.',
        interview: 'Screening conversations mean your site is pre-qualifying. Visitors should self-select before reaching the booking — the form is a filter, not a funnel.',
    },
    lead_type: {
        email_signup: 'An email opt-in is an exchange. What you\'re offering above the form has to feel worth more than the inbox space it costs.',
        contact_form: 'Contact forms convert best when visitors already know what to ask for. Your site should set the scope before they reach the form — not after.',
        gated_content: 'Gated resources turn content into a conversion mechanism. But the perceived value of the download has to exceed the cost of handing over contact details.',
        quiz_funnel: 'Quiz-based capture creates engagement before the ask. The results have to feel genuinely personalised — if they feel generic, you\'ve traded trust for a lead.',
    },
    pricing_model: {
        hourly: 'Hourly pricing anchors everything to time, not outcomes. Your site needs to shift the conversation to value — or the visitor will shop on rate alone.',
        project: 'Project-based pricing thrives on clear scope signals. What\'s included, what\'s not, and how the process works — all before the inquiry form.',
        retainer: 'Retainer models sell ongoing relationships, not one-off deliverables. The site has to make people want you long-term before they commit short-term.',
        value_based: 'Value-based pricing means your site has to communicate transformation, not deliverables. The outcome justifies the investment — so the outcome needs to be vivid.',
    },
    visibility: {
        yes: 'With pricing visible, the page becomes a self-qualification tool. Tier differentiation has to be sharp enough that visitors pick themselves.',
        no: 'With pricing withheld, the site has to build enough perceived value that visitors feel compelled to start a conversation just to find out.',
        custom_quotes: 'Quote-based pricing means the inquiry form is your conversion point. It should feel like the start of a relationship, not a chore.',
    },
    content_format: {
        articles: 'Written content demands clean editorial layouts. If it doesn\'t feel like something worth bookmarking, it gets skimmed and forgotten.',
        video: 'Video as your primary format puts exceptional demands on load performance and the viewing experience. The player is the product.',
        podcast: 'Podcast-first platforms need audio-native design — episode structure, navigation, show notes, and subscription mechanics built for listeners, not readers.',
        mixed: 'Mixed-format content needs a design system flexible enough to handle text, audio, and video without losing consistency across the experience.',
    },
};

// ── Pattern Detection ───────────────────────────────────────

type GoalPattern = 'single' | 'dual_funnel' | 'category_aligned' | 'multi_threaded' | 'ops_growth';

function detectPattern(
    goals: string[],
    primaryPurpose?: string,
    secondaryPurposes?: string[],
): GoalPattern {
    if (goals.length === 1) return 'single';

    // Check for operations + growth pattern
    if (
        primaryPurpose === 'operations' &&
        secondaryPurposes?.some(s => ['lead_contact', 'monetization', 'promotion'].includes(s))
    ) {
        return 'ops_growth';
    }

    // Get unique categories of selected goals
    const categories = new Set(goals.map(g => GOAL_CATEGORIES[g]).filter(Boolean));

    if (goals.length === 2 && categories.size === 2) return 'dual_funnel';
    if (categories.size === 1) return 'category_aligned';
    return 'multi_threaded';
}

function getCategoryLabel(category: string): string {
    return PURPOSE_MAP[category]?.label || category;
}

// ── Implication Layer ───────────────────────────────────────
// A pattern is structural. An implication is what it means.
// inputs → pattern → implication → observation

interface PatternImplication {
    structural: string;  // What the pattern IS
    meaning: string;     // What it MEANS for the visitor
}

function getPatternImplication(
    pattern: GoalPattern,
    goals: string[],
    primaryPurpose?: string,
): PatternImplication {
    const goalLabels = goals.map(g => GOAL_MAP[g]?.label || g);

    switch (pattern) {
        case 'single':
            return {
                structural: `has one job: ${goalLabels[0]}.`,
                meaning: 'That clarity is an advantage — every page either serves that outcome or gets out of the way.',
            };

        case 'dual_funnel':
            return {
                structural: `is running two conversion paths — ${goalLabels[0]} and ${goalLabels[1]}.`,
                meaning: 'That means visitors have to decide what the site is for before they act. If the hierarchy isn\'t obvious, neither path converts well.',
            };

        case 'category_aligned': {
            const cat = GOAL_CATEGORIES[goals[0]];
            const catLabel = getCategoryLabel(cat);
            return {
                structural: `has aligned goals within ${catLabel} — ${goalLabels.join(', ')}.`,
                meaning: 'The synergy is natural, but each still needs its own clear path — shared intent doesn\'t mean shared conversion flow.',
            };
        }

        case 'multi_threaded':
            return {
                structural: `is serving multiple objectives — ${goalLabels.join(', ')}.`,
                meaning: 'Without a clear hierarchy, every objective competes for the same attention. The site has to decide what matters most, or the visitor will decide for you.',
            };

        case 'ops_growth':
            return {
                structural: 'is pulling double duty — operational infrastructure for existing clients alongside a growth channel for new ones.',
                meaning: 'Both audiences have to feel like they\'re in the right place, but they\'re looking for completely different things.',
            };

        default:
            return {
                structural: `has ${goals.length} active conversion goals.`,
                meaning: 'The site needs to prioritise them — or risk doing all of them halfway.',
            };
    }
}

// ── Contradiction Detection ─────────────────────────────────
// Surfaces cross-field tensions that create the "they actually see us" moment.
// Contradictions are inherently interesting — they tell the user something
// they didn't realise their choices were communicating.

interface Contradiction {
    observation: string;
}

function detectContradiction(
    personality: string,
    goals: string[],
    purpose: string,
    advanced: Record<string, string>,
): Contradiction | null {
    // Priority order: most specific tensions first

    // Gatekeeper + visible pricing: the gate feels performative
    if (personality === 'luxury_gatekeeper' && advanced.visibility === 'yes') {
        return {
            observation: 'You want selective access, but your pricing is visible. That\'s not a contradiction — it means the gate isn\'t about price. It\'s about fit. The site has to make visitors self-qualify before they see the numbers.',
        };
    }

    // Freemium + service sales: different psychology on the same page
    if (personality === 'fast_freemium' && goals.includes('sell_services')) {
        return {
            observation: 'You want zero-friction entry, but service sales need trust-building. That\'s two different psychological contracts on the same platform. The product can be instant — the services need a conversation first.',
        };
    }

    // Educator + aggressive monetization (products or subscriptions)
    if (personality === 'educator' && (goals.includes('sell_products') || goals.includes('subscriptions'))) {
        return {
            observation: 'You teach before you sell — but your revenue model needs transactions. That sequence matters: if the purchase interrupts the learning, trust breaks. The buy should feel like the next chapter, not a toll booth.',
        };
    }

    // Movement starter + operations primary
    if (personality === 'movement_starter' && purpose === 'operations') {
        return {
            observation: 'You want to build a movement, but your primary need is operational. Movements need energy and belonging. Ops needs clarity and efficiency. The design has to serve both — mission-driven on the surface, functional underneath.',
        };
    }

    // Quietly authoritative + portfolio + authority building (restraint vs attention)
    if (personality === 'quietly_authoritative' && goals.includes('build_authority') && goals.includes('showcase_portfolio')) {
        return {
            observation: 'You let the work speak — but you\'re also building authority through a portfolio. That\'s restraint and display in tension. The portfolio has to showcase without feeling like it\'s trying to impress. Curation over volume.',
        };
    }

    // Algorithmic closer + content/community purpose
    if (personality === 'algorithmic_closer' && purpose === 'content_community') {
        return {
            observation: 'You want guided, funnel-driven pathways — but your platform is content-first. Hard funnels kill editorial browsing. The trick is guided discovery: structured enough to convert, open enough to explore.',
        };
    }

    // Slow burn + monetization-first
    if (personality === 'slow_burn_strategist' && purpose === 'monetization') {
        return {
            observation: 'You play the long game, but your primary purpose is revenue. That means the site has to nurture and convert simultaneously — editorial trust-building with commercial intent woven in, not bolted on.',
        };
    }

    // Social proof closer + no testimonials/case studies in features
    // (This would require features data — reserved for nurture emails)

    return null;
}

// ── Main: Format Summary Data ───────────────────────────────

export function formatSummaryData(discovery: DiscoveryInput): SummaryData {
    const purpose = discovery.primaryPurpose || '';
    const goals = discovery.conversionGoals || [];
    const secondaries = discovery.secondaryPurposes || [];
    const topic = discovery.siteTopic || '';
    const personality = discovery.salesPersonality || '';
    const advanced = discovery.advancedObjectives || {};

    // Direction label
    const directionLabel = PURPOSE_MAP[purpose]?.label || 'Digital Platform';

    // Goals label (human-readable, dot-separated)
    const goalsLabel = goals.length > 0
        ? goals.map(g => GOAL_MAP[g]?.label || g).join(' · ')
        : 'Not specified';

    // Supporting goals
    const supportingLabel = secondaries.length > 0
        ? '+ ' + secondaries.map(s => PURPOSE_MAP[s]?.label || s).join(' · ')
        : null;

    // Build observation (5-layer system: opener → pattern → implication → contradiction → modifier)
    const observation = buildObservation(topic, purpose, goals, secondaries, personality, advanced);

    return { directionLabel, goalsLabel, supportingLabel, observation };
}

// ── Observation Builder ─────────────────────────────────────

function buildObservation(
    topic: string,
    purpose: string,
    goals: string[],
    secondaries: string[],
    personality: string,
    advanced: Record<string, string>,
): string {
    if (goals.length === 0 && !purpose) {
        return 'Your blueprint captures a strong starting position. We\'ll review the strategic signals and follow up with observations.';
    }

    // Layer 1: Industry opener
    const opener = TOPIC_OPENERS[topic] || 'Your platform';

    // Layer 2 + 3: Pattern detection → Implication
    const pattern = detectPattern(goals, purpose, secondaries);
    const implication = getPatternImplication(pattern, goals, purpose);

    // Layer 4: Contradiction detection (cross-field tension)
    const contradiction = detectContradiction(personality, goals, purpose, advanced);

    // Layer 5a: Advanced precision (most specific modifier)
    const precisionClause = getAdvancedPrecision(advanced);

    // Layer 5b: Personality modifier (fallback if no precision or contradiction)
    const personalityClause = PERSONALITY_MODIFIERS[personality] || '';

    // Compose: opener + structural pattern + meaning.
    const core = `${opener} ${implication.structural} ${implication.meaning}`;

    // Contradiction takes priority over personality/precision (it's the most insightful layer).
    // Then advanced precision (most specific), then personality modifier (broadest).
    if (contradiction) {
        return `${core} ${contradiction.observation}`;
    }

    const modifier = precisionClause || personalityClause;
    if (modifier) {
        return `${core} ${modifier}`;
    }

    return core;
}

function getAdvancedPrecision(advanced: Record<string, string>): string {
    // Priority order: booking_type > lead_type > pricing_model + visibility > content_format
    for (const key of ['booking_type', 'lead_type', 'content_format']) {
        const value = advanced[key];
        if (value && ADVANCED_PRECISION[key]?.[value]) {
            return ADVANCED_PRECISION[key][value];
        }
    }

    // Special combo: pricing_model + visibility
    if (advanced.pricing_model && advanced.visibility) {
        const pricingClause = ADVANCED_PRECISION.pricing_model?.[advanced.pricing_model];
        const visibilityClause = ADVANCED_PRECISION.visibility?.[advanced.visibility];
        // Prefer visibility since it's more architecturally impactful
        return visibilityClause || pricingClause || '';
    }

    if (advanced.pricing_model) {
        return ADVANCED_PRECISION.pricing_model?.[advanced.pricing_model] || '';
    }

    return '';
}
