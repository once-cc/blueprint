/**
 * Blueprint Data Contract v1.0
 * 
 * Canonical, immutable data structure for PDF generation.
 * All keys must exist (undefined → null).
 * Missing data renders as "Not provided".
 * No computed or inferred values.
 */

import { Blueprint, BlueprintReference } from '@/types/blueprint';

// ============= Contract Types =============

export interface BlueprintDataContract {
  meta: {
    id: string;
    contract_version: "1.0";
    created_at: string;
    submitted_at: string | null;
    client_name: string | null;
    client_email: string | null;
    business_name: string | null;
    site_topic: string | null;
    dream_intent: string | null;
  };

  discovery: {
    business_foundations: {
      site_topic: string | null;
      primary_purpose: string | null;
      secondary_purposes: string[];
      conversion_goals: string[];
      advanced_objectives: Record<string, string>;
    };
    brand_voice: {
      tone: string | null;
      presence: string | null;
      personality: string | null;
      visitor_energy: string | null;
      visitor_confidence: string | null;
    };
    cta_energy: {
      sales_personality: string | null;
      cta_primary_label: string | null;
      cta_strategy_notes: string | null;
    };
  };

  design: {
    visual_style: {
      style: string | null;
      imagery_style: string | null;
    };
    typography_motion: {
      typography_style: string | null;
      font_weight: string | null;
      animation_intensity: number | null;
    };
    colour_imagery: {
      colour_relationship: string | null;
      base_hue: number | null;
      palette_energy: number | null;
      palette_contrast: number | null;
      generated_palette: Array<{ role: string; color: string }>;
    };
  };

  deliver: {
    pages: string[];
    features: string[];
    service_buckets: Array<{
      id: string;
      label: string;
      selected_subs: string[];
    }>;
    timeline: string | null;
    budget: string | null;
    risk_tolerance: number | null;
    additional_notes: string | null;
  };

  references: Array<{
    id: string;
    type: string;
    url: string;
    role: string | null;
    label: string | null;
    filename: string | null;
  }>;
}

// ============= Label Maps for PDF Rendering =============

export const PURPOSE_LABELS: Record<string, string> = {
  monetization: 'Monetization & Sales',
  lead_contact: 'Lead & Contact',
  promotion: 'Promotion & Visibility',
  operations: 'Operations & Admin',
  content_community: 'Content & Community',
};

export const CONVERSION_GOAL_LABELS: Record<string, string> = {
  sell_products: 'Sell Products',
  sell_services: 'Sell Services',
  subscriptions: 'Subscriptions',
  capture_leads: 'Capture Leads',
  book_calls: 'Book Calls',
  get_inquiries: 'Get Inquiries',
  showcase_portfolio: 'Showcase Portfolio',
  build_authority: 'Build Authority',
  attract_talent: 'Attract Talent',
  client_portal: 'Client Portal',
  internal_tools: 'Internal Tools',
  documentation: 'Documentation',
  publish_content: 'Publish Content',
  build_audience: 'Build Audience',
  foster_community: 'Foster Community',
};

export const VISUAL_STYLE_LABELS: Record<string, string> = {
  minimal: 'Minimal',
  dark_cinematic: 'Dark Cinematic',
  urban: 'Urban',
  luxury: 'Luxury',
  playful: 'Playful',
  tech: 'Tech',
};

export const TYPOGRAPHY_LABELS: Record<string, string> = {
  modern_minimal: 'Modern Minimal',
  elegant_premium: 'Elegant Premium',
  bold_expressive: 'Bold Expressive',
  tech_sans: 'Tech Sans',
  editorial: 'Editorial',
  display: 'Display',
};

export const COLOUR_RELATIONSHIP_LABELS: Record<string, string> = {
  monochrome: 'Monochrome',
  analogous: 'Analogous',
  complementary: 'Complementary',
  triadic: 'Triadic',
};

export const SALES_PERSONALITY_LABELS: Record<string, string> = {
  fast_freemium: 'Fast Freemium',
  social_proof_closer: 'Social Proof Closer',
  natural_approachable: 'Natural & Approachable',
  guided_sherpa: 'Guided Sherpa',
  educator: 'Educator First',
  quietly_authoritative: 'Quietly Authoritative',
  luxury_gatekeeper: 'Luxury Gatekeeper',
  slow_burn_strategist: 'Slow Burn Strategist',
  movement_starter: 'Movement Starter',
  algorithmic_closer: 'Algorithmic Closer',
};

export const TIMELINE_LABELS: Record<string, string> = {
  urgent: 'Urgent (within 1 month)',
  '4_6_weeks': '4-6 weeks',
  '6_10_weeks': '6-10 weeks',
  flexible: 'Flexible',
};

export const BUDGET_LABELS: Record<string, string> = {
  under_5k: 'Under $5,000',
  '5_10k': '$5,000 - $10,000',
  '10_25k': '$10,000 - $25,000',
  flexible: 'Flexible for the right solution',
};

export const REFERENCE_ROLE_LABELS: Record<string, string> = {
  hero_reference: 'Hero Reference',
  layout_reference: 'Layout Reference',
  colour_reference: 'Colour Reference',
  typography_reference: 'Typography Reference',
  overall_vibe: 'Overall Vibe',
  other: 'Other',
};

// ============= Contract Builder =============

/**
 * Builds a canonical Blueprint Data Contract from a Blueprint entity.
 * 
 * This function:
 * - Enforces all keys exist (undefined → null)
 * - Normalizes arrays (undefined → [])
 * - Strips UI-only fields
 * - Freezes ordering
 * - Adds contract version
 * 
 * @param blueprint - The Blueprint entity from the database
 * @param references - Optional array of BlueprintReference entities
 * @returns A frozen, canonical BlueprintDataContract
 */
export function buildBlueprintContract(
  blueprint: Blueprint,
  references: BlueprintReference[] = []
): BlueprintDataContract {
  const { discovery, design, deliver } = blueprint;

  return {
    meta: {
      id: blueprint.id,
      contract_version: "1.0",
      created_at: blueprint.createdAt.toISOString(),
      submitted_at: blueprint.submittedAt?.toISOString() ?? null,
      client_name: [blueprint.firstName, blueprint.lastName].filter(Boolean).join(' ') || null,
      client_email: blueprint.userEmail ?? null,
      business_name: blueprint.businessName ?? null,
      site_topic: discovery.siteTopic ?? null,
      dream_intent: blueprint.dreamIntent ?? null,
    },

    discovery: {
      business_foundations: {
        site_topic: discovery.siteTopic ?? null,
        primary_purpose: discovery.primaryPurpose ?? null,
        secondary_purposes: discovery.secondaryPurposes ?? [],
        conversion_goals: discovery.conversionGoals ?? [],
        advanced_objectives: discovery.advancedObjectives ?? {},
      },
      brand_voice: {
        tone: discovery.brandVoice?.tone ?? null,
        presence: discovery.brandVoice?.presence ?? null,
        personality: discovery.brandVoice?.personality ?? null,
        visitor_energy: discovery.brandVoice?.visitorFeeling?.energy ?? null,
        visitor_confidence: discovery.brandVoice?.visitorFeeling?.confidence ?? null,
      },
      cta_energy: {
        sales_personality: discovery.salesPersonality ?? null,
        cta_primary_label: discovery.ctaPrimaryLabel ?? null,
        cta_strategy_notes: discovery.ctaStrategyNotes ?? null,
      },
    },

    design: {
      visual_style: {
        style: design.visualStyle ?? null,
        imagery_style: design.imageryStyle ?? null,
      },
      typography_motion: {
        typography_style: design.typography_direction ?? design.typographyStyle ?? null,
        font_weight: design.fontWeight ?? null,
        animation_intensity: design.animationIntensity ?? null,
      },
      colour_imagery: {
        // NOTE: All colour fields are reference hints only, not final palette definition
        colour_relationship: design.colourRelationship ?? null,
        base_hue: design.baseHue ?? null,
        palette_energy: design.paletteEnergy ?? null,
        palette_contrast: design.paletteContrast ?? null,
        generated_palette: design.generatedPalette ?? [],
      },
    },

    deliver: {
      pages: deliver.pages ?? [],
      features: deliver.features ?? [],
      service_buckets: (deliver.serviceBuckets ?? [])
        .filter(bucket => bucket.selected)
        .map(bucket => ({
          id: bucket.id,
          label: bucket.label,
          selected_subs: bucket.selectedSubs,
        })),
      timeline: deliver.timeline ?? null,
      budget: deliver.budget ?? null,
      risk_tolerance: deliver.riskTolerance ?? null,
      additional_notes: null, // Reserved for future use
    },

    references: references.map(ref => ({
      id: ref.id,
      type: ref.type,
      url: ref.url,
      role: ref.role ?? null,
      label: ref.label ?? null,
      filename: ref.filename ?? null,
    })),
  };
}

// ============= Display Helpers =============

/**
 * Returns the display label for a value, or "Not provided" if null/undefined.
 */
export function getDisplayLabel(
  value: string | null | undefined,
  labels: Record<string, string>
): string {
  if (!value) return 'Not provided';
  return labels[value] ?? value;
}

/**
 * Returns an array of display labels, or "None selected" if empty.
 */
export function getDisplayLabels(
  values: string[] | null | undefined,
  labels: Record<string, string>
): string {
  if (!values || values.length === 0) return 'None selected';
  return values.map(v => labels[v] ?? v).join(', ');
}

/**
 * Formats a number with fallback.
 */
export function getDisplayNumber(
  value: number | null | undefined,
  suffix = ''
): string {
  if (value === null || value === undefined) return 'Not provided';
  return `${value}${suffix}`;
}

/**
 * Formats a date for PDF display.
 */
export function formatContractDate(isoDate: string | null): string {
  if (!isoDate) return 'Not provided';
  try {
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return 'Not provided';
  }
}
