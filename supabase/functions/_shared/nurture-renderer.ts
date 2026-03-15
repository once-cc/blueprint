/**
 * nurture-renderer.ts — Email 2–5 HTML Renderer
 *
 * Renders deterministic, editorial nurture emails using Blueprint data.
 * Each email draws from a different data layer:
 *
 *   Email 2 (1hr):  Discovery → pattern implication + personality insight
 *   Email 3 (24hr): Discovery → brandVoice + riskTolerance contradictions
 *   Email 4 (72hr): Deliver  → pages, features, timeline, budget analysis
 *   Email 5 (7d):   Discovery → ctaPrimaryLabel + salesPersonality + CTA
 *
 * Follows White-Paper Editorial design tokens.
 * No CTA for Emails 2–4. Clarity Call CTA for Email 5 only.
 */

import { formatSummaryData, type DiscoveryInput } from './insight-map.ts';

// ── Types ───────────────────────────────────────────────────

export interface BlueprintData {
    id: string;
    first_name: string;
    business_name: string;
    user_email: string;
    discovery: {
        siteTopic?: string;
        primaryPurpose?: string;
        secondaryPurposes?: string[];
        conversionGoals?: string[];
        salesPersonality?: string;
        advancedObjectives?: Record<string, string>;
        brandVoice?: {
            tone?: number;
            presence?: number;
            personality?: number;
            visitorFeeling?: { energy?: number };
        };
        ctaPrimaryLabel?: string;
        ctaStrategyNotes?: string;
    };
    deliver: {
        pages?: string[];
        features?: string[];
        timeline?: string;
        budget?: string;
        riskTolerance?: number;
    };
}

export interface NurtureEmail {
    subject: string;
    html: string;
    emailNumber: number;
}

// ── Design Tokens ───────────────────────────────────────────

const FONT_STACK = "system-ui, -apple-system, 'Segoe UI', sans-serif";
const SERIF_STACK = "Georgia, 'Times New Roman', serif";

// ── Label Maps ──────────────────────────────────────────────

const TONE_LABELS: Record<number, string> = {
    1: 'Formal', 2: 'Professional', 3: 'Neutral', 4: 'Approachable', 5: 'Friendly',
};

const PRESENCE_LABELS: Record<number, string> = {
    1: 'Subtle', 2: 'Minimal', 3: 'Balanced', 4: 'Confident', 5: 'Bold',
};

const PERSONALITY_LABELS: Record<number, string> = {
    1: 'Elegant', 2: 'Calm', 3: 'Authentic', 4: 'Playful', 5: 'Rebellious',
};

const ENERGY_LABELS: Record<number, string> = {
    1: 'Peaceful', 2: 'Calm', 3: 'Balanced', 4: 'Energized', 5: 'Electric',
};

const RISK_ZONES: Record<string, string> = {
    '1': 'Safe', '2': 'Safe',
    '3': 'Cautious', '4': 'Cautious',
    '5': 'Balanced', '6': 'Balanced',
    '7': 'Bold', '8': 'Bold',
    '9': 'Experimental', '10': 'Experimental',
};

const TIMELINE_LABELS: Record<string, string> = {
    urgent: 'Urgent',
    '4_6_weeks': 'Standard (4–6 weeks)',
    '6_10_weeks': 'Comfortable (6–10 weeks)',
    flexible: 'Flexible',
};

const BUDGET_LABELS: Record<string, string> = {
    under_5k: 'Under $5K',
    '5_10k': '$5–10K',
    '10_25k': '$10–25K',
    flexible: 'Flexible',
};

const FEATURE_LABELS: Record<string, string> = {
    booking_system: 'Booking System',
    ecommerce: 'E-commerce',
    client_portal: 'Client Portal',
    cms_blog: 'CMS/Blog',
    email_marketing: 'Email Marketing',
    chatbot: 'Chat-bot',
    analytics: 'Analytics Dashboard',
    seo_tools: 'SEO Tools',
    multi_language: 'Multi-language',
    custom_forms: 'Custom Forms',
    lead_funnel: 'Lead or Sales Funnel',
    other: 'Other',
};

const PERSONALITY_NAMES: Record<string, string> = {
    fast_freemium: 'zero-friction',
    social_proof_closer: 'social proof-driven',
    natural_approachable: 'approachable',
    guided_sherpa: 'guided',
    educator: 'educator-led',
    quietly_authoritative: 'quietly authoritative',
    luxury_gatekeeper: 'gatekeeper',
    slow_burn_strategist: 'slow-burn',
    movement_starter: 'movement-driven',
    algorithmic_closer: 'funnel-driven',
};

const TOPIC_OPENERS: Record<string, string> = {
    photography: 'photography',
    design_creative: 'design',
    health_wellness: 'wellness',
    real_estate: 'real estate',
    construction_trades: 'construction',
    ecommerce: 'e-commerce',
    saas_software: 'software',
    education: 'education',
    consulting_services: 'consulting',
    personal_brand: 'personal brand',
};

// ── Main Entry ──────────────────────────────────────────────

export function renderNurtureEmail(
    blueprint: BlueprintData,
    emailNumber: 2 | 3 | 4 | 5,
): NurtureEmail {
    const firstName = escapeHtml(blueprint.first_name || 'there');

    switch (emailNumber) {
        case 2: return renderEmail2(blueprint, firstName);
        case 3: return renderEmail3(blueprint, firstName);
        case 4: return renderEmail4(blueprint, firstName);
        case 5: return renderEmail5(blueprint, firstName);
    }
}

// ── Email 2: The Echo (1hr) ─────────────────────────────────
// Data source: Pattern implication + personality insight
// Purpose: Demonstrate we actually read their submission

function renderEmail2(bp: BlueprintData, firstName: string): NurtureEmail {
    const d = bp.discovery;
    const { observation } = formatSummaryData(d as DiscoveryInput);

    // Get the personality name for the subject line
    const personalityName = PERSONALITY_NAMES[d.salesPersonality || ''] || 'your';
    const topicLabel = TOPIC_OPENERS[d.siteTopic || ''] || 'platform';

    // Build insight paragraphs
    const p1 = observation;

    // Build a personality-specific second paragraph
    const p2 = buildPersonalityInsight(d.salesPersonality || '', d.conversionGoals || []);

    const subject = goalBasedSubject(d.conversionGoals || [], topicLabel);

    return {
        subject,
        emailNumber: 2,
        html: wrapEmail(firstName, [p1, p2, 'That\'s one signal. There are others.'], 'We\'re still reading your Blueprint. More soon.'),
    };
}

function goalBasedSubject(goals: string[], topic: string): string {
    if (goals.includes('showcase_portfolio')) return `Your portfolio has a job to do`;
    if (goals.includes('book_calls')) return `Your booking page is doing more than you think`;
    if (goals.includes('subscriptions')) return `Your pricing page is an argument`;
    if (goals.includes('sell_services')) return `Your service page carries more weight than copy`;
    if (goals.includes('sell_products')) return `Your product page has a trust problem to solve`;
    if (goals.includes('capture_leads')) return `Your lead capture is a promise`;
    if (goals.includes('publish_content')) return `Your content has a conversion job`;
    if (goals.includes('build_authority')) return `Authority isn't claimed — it's architected`;
    if (goals.includes('build_audience')) return `Audience growth has a structural pattern`;
    return `Something stood out in your ${topic} blueprint`;
}

function buildPersonalityInsight(personality: string, goals: string[]): string {
    switch (personality) {
        case 'quietly_authoritative':
            return 'You chose a quietly authoritative approach. That means the work has to do the convincing before the CTA appears. No urgency banners. No popups. Just undeniable proof, then the invitation.';
        case 'luxury_gatekeeper':
            return 'You\'re running a gatekeeper model — selective access, not volume. That means every design choice above the fold is doing credibility work. The gate has to feel earned, not arbitrary.';
        case 'fast_freemium':
            return 'Zero-friction entry means the first interaction can\'t ask for anything. The product has to demonstrate value before the upgrade conversation starts. That\'s a specific architecture pattern.';
        case 'educator':
            return 'An educator-led approach means content authority drives the conversion, not urgency. Your site has to teach before it asks — and the ask has to feel like the next chapter.';
        case 'social_proof_closer':
            return 'You\'re letting other people make the case for you. That means testimonials, case studies, and social proof aren\'t decoration — they\'re your primary conversion mechanism.';
        case 'guided_sherpa':
            return 'A guided approach means visitors need to feel led, not sold. The site has to feel like a curated experience — each step obvious, each transition intentional.';
        case 'slow_burn_strategist':
            return 'You play the long game. That means the site has to nurture before it converts — editorial trust-building with commercial intent woven in, not bolted on.';
        case 'movement_starter':
            return 'You\'re building a movement, not just a business. The site has to make visitors feel like they\'re joining something, not just buying something.';
        case 'algorithmic_closer':
            return 'Funnel-driven pathways mean every page has a next step. But the trick is making guided discovery feel like exploration, not manipulation.';
        case 'natural_approachable':
            return 'An approachable style means the site should feel like a conversation, not a pitch. Warmth has to come through the design, not just the copy.';
        default:
            return 'Your approach tells us how you want visitors to experience the decision. That\'s a design constraint worth taking seriously.';
    }
}

// ── Email 3: The Deeper Read (24hr) ─────────────────────────
// Data source: brandVoice + riskTolerance
// Purpose: Show we see tensions in their brand positioning

function renderEmail3(bp: BlueprintData, firstName: string): NurtureEmail {
    const d = bp.discovery;
    const bv = d.brandVoice || {};
    const risk = bp.deliver.riskTolerance;

    const toneLabel = TONE_LABELS[bv.tone || 3] || 'Neutral';
    const presenceLabel = PRESENCE_LABELS[bv.presence || 3] || 'Balanced';
    const personalityLabel = PERSONALITY_LABELS[bv.personality || 3] || 'Authentic';
    const energyLabel = ENERGY_LABELS[bv.visitorFeeling?.energy || 3] || 'Balanced';
    const riskZone = RISK_ZONES[String(risk || 5)] || 'Balanced';

    // Build the brand tension observation
    const p1 = `You want your brand to feel ${toneLabel.toLowerCase()} and ${personalityLabel.toLowerCase()} — with ${presenceLabel.toLowerCase()}, ${energyLabel.toLowerCase()} presence.`;

    const p2 = buildBrandTension(toneLabel, presenceLabel, personalityLabel, energyLabel, riskZone);

    const p3 = `Correct me if I'm wrong, but that means your website can't feel like a template. Every layout decision — spacing, type scale, image crop ratio — is doing brand work whether you intend it to or not.`;

    return {
        subject: 'Something in your brand positioning stood out',
        emailNumber: 3,
        html: wrapEmail(firstName, [p1, p2, p3]),
    };
}

function buildBrandTension(
    tone: string, presence: string, personality: string,
    energy: string, riskZone: string,
): string {
    // Look for interesting tensions in the brand voice selections
    const isFormal = ['Formal', 'Professional'].includes(tone);
    const isCasual = ['Approachable', 'Friendly'].includes(tone);
    const isBold = ['Confident', 'Bold'].includes(presence);
    const isSubtle = ['Subtle', 'Minimal'].includes(presence);
    const isHighEnergy = ['Energized', 'Electric'].includes(energy);
    const isLowEnergy = ['Peaceful', 'Calm'].includes(energy);

    // Formal + Bold: authority
    if (isFormal && isBold) {
        return `That's a commanding combination. ${tone} tone with ${presence.toLowerCase()} presence demands precision in every detail — the kind of design that radiates institutional confidence. Your creative risk tolerance sits at ${riskZone}, which tells us how far the design can push without losing that authority.`;
    }

    // Casual + Bold: confident warmth
    if (isCasual && isBold) {
        return `That's an unusual combination. Most brands in your space default to either buttoned-up minimal or loud-and-proud. You're describing something closer to confident warmth. Approachable but unmistakably present. Your creative risk at ${riskZone} confirms this — you want impact without the performance.`;
    }

    // Formal + Subtle: old money
    if (isFormal && isSubtle) {
        return `${tone} and ${presence.toLowerCase()} is the old-money approach. The design has to feel expensive without looking like it's trying. That constraint narrows your options significantly — but the results, when done right, are distinctive. At ${riskZone} risk tolerance, the design lane gets very specific.`;
    }

    // Casual + Subtle: understated
    if (isCasual && isSubtle) {
        return `Approachable and subtle is harder than it sounds. The design has to feel effortless without feeling empty, warm without feeling cluttered. Your ${riskZone} risk tolerance tells us how much visual restraint can work here.`;
    }

    // High energy + Low risk: controlled energy
    if (isHighEnergy && ['Safe', 'Cautious'].includes(riskZone)) {
        return `You want visitors to feel ${energy.toLowerCase()} — but your creative risk tolerance is ${riskZone}. That's not a contradiction. It means you want energy through rhythm and pacing, not through experimental layouts. Fast without being chaotic.`;
    }

    // Low energy + High risk: experimental calm
    if (isLowEnergy && ['Bold', 'Experimental'].includes(riskZone)) {
        return `${energy} energy with ${riskZone.toLowerCase()} creative risk is a rare combination. You want visitors to feel at ease — but you're willing to do that through unconventional means. That opens up some interesting design territory.`;
    }

    // Default: pair what we have
    return `${tone} tone, ${presence.toLowerCase()} presence, ${personality.toLowerCase()} personality, and ${energy.toLowerCase()} energy — that's a specific combination that rules out most templates and generic approaches. Your creative risk at ${riskZone} confirms this is intentional, not accidental.`;
}

// ── Email 4: The Strategic Scope (72hr) ─────────────────────
// Data source: pages, features, timeline, budget, riskTolerance
// Purpose: Show we understand the constraints of their project

function renderEmail4(bp: BlueprintData, firstName: string): NurtureEmail {
    const del = bp.deliver;
    const pages = del.pages || [];
    const features = del.features || [];
    const timeline = del.timeline || 'flexible';
    const budget = del.budget || 'flexible';
    const risk = del.riskTolerance || 5;
    const riskZone = RISK_ZONES[String(risk)] || 'Balanced';

    const pageCount = pages.length;
    const featureCount = features.length;
    const timelineLabel = TIMELINE_LABELS[timeline] || timeline;
    const budgetLabel = BUDGET_LABELS[budget] || budget;

    // Feature labels for natural language
    const featureNames = features.map(f => FEATURE_LABELS[f] || f);
    const featureList = featureNames.length > 0
        ? featureNames.length <= 3
            ? featureNames.join(', ')
            : featureNames.slice(0, 3).join(', ') + `, and ${featureNames.length - 3} more`
        : 'core functionality';

    const p1 = `${pageCount} page${pageCount !== 1 ? 's' : ''}. ${featureList}. ${timelineLabel} timeline. ${budgetLabel} budget.`;

    const p2 = 'Most studios would look at that and start wireframing. We read it differently.';

    const p3 = buildScopeInsight(pageCount, featureCount, timeline, budget, riskZone);

    const p4 = 'That\'s not a limitation — it\'s a focus decision. The best platforms aren\'t the ones with the most pages. They\'re the ones where every page knows its job.';

    return {
        subject: 'Your scope contains a decision',
        emailNumber: 4,
        html: wrapEmail(firstName, [p1, p2, p3, p4]),
    };
}

function buildScopeInsight(
    pageCount: number, featureCount: number,
    timeline: string, budget: string, riskZone: string,
): string {
    const isUrgent = timeline === 'urgent';
    const isBudgetConstrained = budget === 'under_5k';
    const isAmbitious = featureCount >= 5 || pageCount >= 8;
    const isBoldRisk = ['Bold', 'Experimental'].includes(riskZone);

    // Ambitious scope + tight constraints
    if (isAmbitious && (isUrgent || isBudgetConstrained)) {
        return `A ${riskZone.toLowerCase()} creative risk tolerance on ${isUrgent ? 'an urgent' : 'a constrained'} timeline at ${BUDGET_LABELS[budget] || budget} means you can't build ${riskZone.toLowerCase()} into every page. You have to choose which pages carry the ambition and which ones stay clean and functional.`;
    }

    // Bold risk but comfortable timeline
    if (isBoldRisk && !isUrgent && !isBudgetConstrained) {
        return `You have runway — comfortable timeline, flexible investment. With ${riskZone.toLowerCase()} creative risk, the temptation is to push every page. The discipline is knowing which pages benefit from creative range and which ones need to get out of the way.`;
    }

    // Many features + tight budget
    if (featureCount >= 4 && isBudgetConstrained) {
        return `${featureCount} features at ${BUDGET_LABELS[budget] || budget} means each one has to earn its place. The question isn't what to build — it's what to build first. A phased rollout almost always outperforms trying to ship everything in one push.`;
    }

    // Minimal scope + high budget (quality signal)
    if (pageCount <= 4 && budget === '10_25k') {
        return `A lean ${pageCount}-page scope at ${BUDGET_LABELS[budget] || budget} tells us you're investing in quality over quantity. That's a specific signal — the pages that exist need to be exceptional, not numerous.`;
    }

    // Default
    return `${pageCount} pages and ${featureCount} features at ${riskZone.toLowerCase()} creative risk — the constraint isn't what to build, it's how to sequence the build so the most important pages ship sharp, not spread thin.`;
}

// ── Email 5: The Invitation (7d) ────────────────────────────
// Data source: ctaPrimaryLabel + salesPersonality
// Purpose: Interpret their CTA choice + invite to Clarity Call

function renderEmail5(bp: BlueprintData, firstName: string): NurtureEmail {
    const d = bp.discovery;
    const ctaLabel = d.ctaPrimaryLabel || '';
    const personality = d.salesPersonality || '';
    const personalityName = PERSONALITY_NAMES[personality] || '';

    let p1: string;
    let p2: string;

    if (ctaLabel) {
        p1 = `You chose "${escapeHtml(ctaLabel)}" as your primary CTA.`;
        p2 = buildCtaInsight(ctaLabel, personalityName);
    } else {
        p1 = 'Your CTA is the single most important moment on your site.';
        p2 = `With a ${personalityName || 'considered'} approach, visitors need to feel like clicking is the natural next step — not a leap of faith.`;
    }

    const p3 = 'That\'s an engineering problem, not a design preference. And it\'s solvable.';

    const p4 = 'If you\'d like to spend 30 minutes aligning on how to make that work, we have a few openings this week.';

    return {
        subject: 'One last thing before we go quiet',
        emailNumber: 5,
        html: wrapEmailWithCta(bp.id, firstName, [p1, p2, p3, p4]),
    };
}

function buildCtaInsight(ctaLabel: string, personalityName: string): string {
    const lower = ctaLabel.toLowerCase();

    // Conversation-style CTAs
    if (lower.includes('talk') || lower.includes('chat') || lower.includes('connect')) {
        return `That phrasing says a lot. It's not "Book Now" or "Get a Quote" — it's a conversation opener. ${personalityName ? `Paired with your ${personalityName} approach, that` : 'That'} button needs to feel like the natural conclusion of a story your site already told. Visitors should reach it feeling like the conversation has already started.`;
    }

    // Action-style CTAs
    if (lower.includes('start') || lower.includes('begin') || lower.includes('try')) {
        return `"${escapeHtml(ctaLabel)}" is an action trigger. It implies momentum. ${personalityName ? `With a ${personalityName} approach, the` : 'The'} entire page has to build enough velocity that clicking feels like accelerating, not committing.`;
    }

    // Get/Receive-style CTAs
    if (lower.includes('get') || lower.includes('download') || lower.includes('access')) {
        return `"${escapeHtml(ctaLabel)}" promises something in return. That means the value has to be obvious before the button appears. ${personalityName ? `Your ${personalityName} approach ` : ''}means the page has to make the exchange feel generous, not transactional.`;
    }

    // Quote/Pricing-style CTAs
    if (lower.includes('quote') || lower.includes('price') || lower.includes('cost')) {
        return `Asking for a quote is already a high-intent action. Your site's job is to make the visitor feel confident enough to submit it. ${personalityName ? `A ${personalityName} approach ` : ''}means the path to that button has to remove doubt, not create urgency.`;
    }

    // Default
    return `That specific phrasing — "${escapeHtml(ctaLabel)}" — reveals how you want the conversion moment to feel. ${personalityName ? `Paired with your ${personalityName} approach, it` : 'It'} tells us exactly what the page needs to accomplish before that button earns the click.`;
}

// ── HTML Wrappers ───────────────────────────────────────────

function wrapEmail(firstName: string, paragraphs: string[], exitLine?: string): string {
    const bodyParagraphs = paragraphs.map(p =>
        `<p style="font-size: 15px; line-height: 1.7; color: #555555; margin-bottom: 20px;">${escapeHtml(p)}</p>`
    ).join('\n          ');

    const exit = exitLine
        ? `\n          <p style="font-size: 13px; line-height: 1.6; color: #888888; margin-top: 32px; margin-bottom: 0; font-style: italic;">${escapeHtml(exitLine)}</p>`
        : '';

    return `
        <div style="font-family: ${FONT_STACK}; max-width: 600px; margin: 0 auto; padding: 48px 32px; background: #fcfcfc; color: #111111;">

          <p style="font-size: 15px; line-height: 1.7; color: #555555; margin-bottom: 20px;">
            ${escapeHtml(firstName)} —
          </p>

          ${bodyParagraphs}
          ${exit}

          <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 40px 0 24px 0;" />

          <p style="font-size: 11px; color: #aaaaaa; margin: 0;">
            Cleland Studio<br/>Crafted Digital Systems for Owners and Operators
          </p>
        </div>`;
}

function wrapEmailWithCta(blueprintId: string, firstName: string, paragraphs: string[], ctaLabel = 'Book a Clarity Call'): string {
    const bodyParagraphs = paragraphs.map(p =>
        `<p style="font-size: 15px; line-height: 1.7; color: #555555; margin-bottom: 20px;">${escapeHtml(p)}</p>`
    ).join('\n          ');

    return `
        <div style="font-family: ${FONT_STACK}; max-width: 600px; margin: 0 auto; padding: 48px 32px; background: #fcfcfc; color: #111111;">

          <p style="font-size: 15px; line-height: 1.7; color: #555555; margin-bottom: 20px;">
            ${escapeHtml(firstName)} —
          </p>

          ${bodyParagraphs}

          <div style="text-align: center; margin: 32px 0;">
            <a href="https://crafted.cleland.studio/clarity?id=${blueprintId}" style="display: inline-block; padding: 14px 36px; border: 1px solid #111111; color: #111111; text-decoration: none; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase;">
              ${escapeHtml(ctaLabel)}
            </a>
          </div>
          <p style="font-size: 13px; color: #888888; text-align: center; margin-bottom: 0;">
            No pitch. No commitment. Just direction.
          </p>

          <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 40px 0 24px 0;" />

          <p style="font-size: 11px; color: #aaaaaa; margin: 0;">
            Cleland Studio<br/>Crafted Digital Systems for Owners and Operators
          </p>
        </div>`;
}

/**
 * Wraps operator-edited body text in the same White-Paper Editorial template.
 * Used by process-nurture-queue when override columns are present.
 * Preserves design consistency — operator edits copy only, never HTML.
 */
export function wrapOverrideBody(
    blueprint: BlueprintData,
    bodyText: string,
    ctaLabel: string | null,
    emailNumber: number,
): string {
    const firstName = escapeHtml(blueprint.first_name || 'there');
    const paragraphs = bodyText.split('\n').filter(p => p.trim());

    // Email 5 gets a CTA button; all others are plain editorial
    if (emailNumber === 5) {
        return wrapEmailWithCta(blueprint.id, firstName, paragraphs, ctaLabel || 'Book a Clarity Call');
    }
    return wrapEmail(firstName, paragraphs);
}

// ── Utility ─────────────────────────────────────────────────

function escapeHtml(text: string): string {
    const map: Record<string, string> = {
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
}
