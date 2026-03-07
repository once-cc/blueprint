// Blueprint Configurator Types

// ============= Business Foundations Types (Progressive Flow) =============

// Primary Purpose (Layer 1)
export type PrimaryPurpose =
  | 'monetization'      // Monetization & Sales
  | 'lead_contact'      // Lead & Contact
  | 'promotion'         // Promotion & Visibility
  | 'operations'        // Operations & Admin
  | 'content_community'; // Content & Community

// Conversion Goal Values (Layer 3)
export type ConversionGoalValue =
  // Monetization goals
  | 'sell_products' | 'sell_services' | 'subscriptions'
  // Lead & Contact goals
  | 'capture_leads' | 'book_calls' | 'get_inquiries'
  // Promotion goals
  | 'showcase_portfolio' | 'build_authority' | 'attract_talent'
  // Operations goals
  | 'client_portal' | 'internal_tools' | 'documentation'
  // Content & Community goals
  | 'publish_content' | 'build_audience' | 'foster_community';

// Advanced Objective Keys (Layer 4)
export type AdvancedObjectiveKey =
  | 'pricing_model' | 'visibility' | 'booking_type'
  | 'lead_type' | 'content_format';

// Typed advanced objectives structure
export type AdvancedObjectives = Partial<Record<AdvancedObjectiveKey, string>>;

// ============= Discovery Section (Act I) =============

// Brand Voice structured type for slider-based UI
export interface BrandVoice {
  tone?: string; // Formal → Friendly axis
  presence?: string; // Minimal → Bold axis
  personality?: string; // Reserved → Expressive axis (Elegant, Calm, Authentic, Playful, Rebellious)
  visitorFeeling?: {
    energy?: string; // Calm → Energized axis
    confidence?: string; // Cautious → Confident axis
  };
}

export interface BlueprintDiscovery {
  // Step 1: Business Foundations (Progressive Flow)
  siteTopic?: string; // Layer 0 - Industry Context Anchor (exact value, no inference)
  primaryPurpose?: PrimaryPurpose;
  secondaryPurposes?: PrimaryPurpose[]; // Cannot include primary
  conversionGoals?: ConversionGoalValue[]; // At least 1 required
  advancedObjectives?: AdvancedObjectives;

  // Legacy fields (kept for migration compatibility)
  /** @deprecated Use primaryPurpose instead */
  businessType?: 'service' | 'ecommerce' | 'coaching' | 'agency' | 'nonprofit' | 'other';
  /** @deprecated Replaced by progressive flow */
  mainConversionGoal?: 'book_call' | 'capture_lead' | 'sell_product' | 'educate_trust';
  dreamOutcome?: string;

  // Step 2: Brand Voice (new slider-based structure)
  brandVoice?: BrandVoice;

  // Legacy fields (kept for backward compatibility)
  brandArchetype?: 'guide' | 'visionary' | 'disruptor' | 'sanctuary';
  tonePrimary?: string;
  toneSecondary?: string[];
  personalityTags?: string[];
  targetFeelings?: string[];

  // Step 3: CTA Energy
  salesPersonality?: 'fast_freemium' | 'social_proof_closer' | 'natural_approachable' | 'guided_sherpa' | 'educator' | 'quietly_authoritative' | 'luxury_gatekeeper' | 'slow_burn_strategist' | 'movement_starter' | 'algorithmic_closer';
  ctaPrimaryLabel?: string;
  ctaStrategyNotes?: string;
}

// ============= Design Section (Act II) =============

export type BrandAssetType = 'headshot' | 'product' | 'portfolio' | 'lifestyle' | 'campaign' | 'logo' | 'background' | 'texture' | 'other' | 'unassigned';

export interface BrandAsset {
  id: string;
  fileUrl: string;
  filename: string;
  size: number;
  type: BrandAssetType;
  notes: string;
  isPrimary: boolean;
  order: number;
}

export interface BlueprintDesign {
  // Step 4: Visual Style
  visualStyle?: 'minimal' | 'dark_cinematic' | 'urban' | 'luxury' | 'playful' | 'tech';
  imageryStyle?: 'photography' | 'illustrations' | 'product' | 'cinematic' | 'minimal' | 'mixed';

  // Brand Imagery Intake (Upload Mode)
  brandImageryMode?: 'direction' | 'upload';
  brandAssets?: BrandAsset[];


  // Step 5: Typography & Motion
  typographyMode?: 'direction' | 'upload';

  // Custom Fonts (Upload Mode)
  customFonts?: {
    files: Array<{
      id: string;
      fileData: string;
      filename: string;
      weight: string;
      style: string;
    }>;
    roles: {
      h1?: string;      // ID of the mapped file
      h2?: string;
      h3?: string;
      eyebrow?: string;
      body?: string;
      button?: string;
    };
  };

  // Typography Direction: directional signal only, not final font selection (Direction Mode)
  typography_direction?: 'modern_minimal' | 'elegant_premium' | 'bold_expressive' | 'tech_sans' | 'editorial' | 'display';
  /** @deprecated Use typography_direction instead */
  typographyStyle?: 'modern_minimal' | 'elegant_premium' | 'bold_expressive' | 'tech_sans' | 'editorial' | 'display';
  fontWeight?: 'light' | 'regular' | 'mixed' | 'bold';
  animationIntensity?: number; // 1-10

  // Step 6: Color Palette
  // INTERNAL: All colour fields are reference hints only, not final palette definition
  colourRelationship?: 'monochrome' | 'analogous' | 'complementary' | 'triadic';
  baseHue?: number; // 0-360, colour_reference_hint only
  paletteEnergy?: number; // 1-10, Calm to Energetic, colour_reference_hint
  paletteContrast?: number; // 1-10, Subtle to Bold, colour_reference_hint
  generatedPalette?: { role: string; color: string }[]; // colour_reference_hint

  // Legacy fields (kept for backward compatibility)
  colourPaletteStyle?: 'monochrome' | 'muted' | 'bold' | 'dark' | 'pastels';
  customPalette?: { role: string; color: string }[];
  personalitySummary?: string[];
  visitorFeelings?: string[];
}

// ============= Deliver Section (Act III) =============

// Service Bucket Selection (for Additional Services)
export interface ServiceBucketSelection {
  id: string;
  label: string;
  selected: boolean;
  selectedSubs: string[];
}

export interface BlueprintDeliver {
  // Step 7: Functionality & Scope
  pages?: string[];
  features?: string[];

  // DEPRECATED: Service buckets removed from user selection (kept for migration compatibility)
  /** @deprecated Service buckets no longer collected via UI */
  serviceBuckets?: ServiceBucketSelection[];

  // DEPRECATED: Keep for migration compatibility
  /** @deprecated Replaced by authority-led process scoping */
  additionalServices?: {
    domainHosting?: boolean;
    seoRequired?: boolean;
    offerPositioning?: boolean;
    serviceProductization?: boolean;
  };

  timeline?: 'urgent' | '4_6_weeks' | '6_10_weeks' | 'flexible';
  budget?: 'under_5k' | '5_10k' | '10_25k' | 'flexible';

  // Step 8: Creative Risk
  riskTolerance?: number; // 1-10
}

// ============= Reference Type =============

export type ReferenceRole = 'hero_reference' | 'layout_reference' | 'colour_reference' | 'typography_reference' | 'overall_vibe' | 'other';

export interface BlueprintReference {
  id: string;
  blueprintId: string;
  type: 'image' | 'pdf' | 'link';
  url: string;
  filename?: string;
  notes?: string;
  storagePath?: string;
  role?: ReferenceRole;
  label?: string;
  createdAt: Date;
}

// ============= Main Blueprint Interface =============

export interface Blueprint {
  id: string;
  status: 'draft' | 'submitted' | 'generated';
  userEmail?: string;
  firstName?: string;
  lastName?: string;
  businessName?: string;
  dreamIntent?: string; // For the persistent HUD
  discovery: BlueprintDiscovery;
  design: BlueprintDesign;
  deliver: BlueprintDeliver;
  references?: BlueprintReference[];
  pdfUrl?: string;
  currentStep: number;
  createdAt: Date;
  updatedAt: Date;
  submittedAt?: Date;
}

// ============= Legacy Types (for migration compatibility) =============

export interface BlueprintVision {
  visualStyle?: string;
  brandTone?: string[];
  visitorEmotion?: string;
}

export interface BlueprintScope {
  pages?: string[];
  features?: string[];
  timeline?: string;
  budget?: string;
  ctaStyle?: string;
}

export interface BlueprintRefinement {
  colorPalette?: {
    primary: string;
    secondary: string;
    accent: string;
    neutral: string;
  };
  imageryStyle?: string;
  riskTolerance?: string;
}

export interface SessionStatus {
  hasExisting: boolean;
  confirmed: boolean;
}

// ============= Configurator Steps =============

export type ConfiguratorAct = 'discovery' | 'design' | 'deliver' | 'review';

export interface ConfiguratorStepInfo {
  step: number;
  act: ConfiguratorAct;
  title: string;
  framing: string;
}

export const CONFIGURATOR_STEPS: ConfiguratorStepInfo[] = [
  // Act I: Discovery
  { step: 1, act: 'discovery', title: 'Business Foundations', framing: 'Let\'s understand your business and what success looks like.' },
  { step: 2, act: 'discovery', title: 'Brand Voice', framing: 'How should your brand speak and feel to visitors?' },
  { step: 3, act: 'discovery', title: 'CTA Energy', framing: 'How should your platform make the first ask?' },
  // Act II: Design
  { step: 4, act: 'design', title: 'Visual Style', framing: 'What aesthetic direction fits your brand?' },
  { step: 5, act: 'design', title: 'Typography', framing: 'Set the typographic posture for your brand.' },
  { step: 6, act: 'design', title: 'Color Palette', framing: 'Define your colour logic and palette.' },
  // Act III: Deliver
  { step: 7, act: 'deliver', title: 'Functionality & Scope', framing: 'What does your platform need to do?' },
  { step: 8, act: 'deliver', title: 'Creative Risk', framing: 'How bold should we be with your design?' },
  { step: 9, act: 'deliver', title: 'References', framing: 'Share any inspiration or examples you love.' },
  // Review
  { step: 10, act: 'review', title: 'Review & Generate', framing: 'Review your Blueprint and bring it to life.' },
];

export const ACT_INFO = {
  discovery: { label: 'Discovery', description: 'Who you are', steps: [1, 2, 3] },
  design: { label: 'Design', description: 'How you look', steps: [4, 5, 6] },
  deliver: { label: 'Deliver', description: 'What you need', steps: [7, 8, 9] },
  review: { label: 'Review', description: 'Generate your Blueprint', steps: [10] },
} as const;

// ============= Archetype Definitions =============

export interface ArchetypeDefinition {
  id: BlueprintDiscovery['brandArchetype'];
  title: string;
  story: string;
  toneWords: string[];
  personalityTags: string[];
  targetFeelings: string[];
}

export const BRAND_ARCHETYPES: ArchetypeDefinition[] = [
  {
    id: 'guide',
    title: 'The Guide',
    story: 'Your brand feels like a mentor—calm, structured, and reassuring.',
    toneWords: ['Friendly', 'Warm', 'Approachable', 'Educational'],
    personalityTags: ['Approachable', 'Educational', 'Warm', 'Authentic'],
    targetFeelings: ['Calm', 'Secure', 'Welcomed', 'Confident'],
  },
  {
    id: 'visionary',
    title: 'The Visionary',
    story: 'Your brand leads with ideas, innovation, and authority.',
    toneWords: ['Bold', 'Technical', 'Elegant', 'Ambitious'],
    personalityTags: ['Innovative', 'Elegant', 'Modern', 'Bold'],
    targetFeelings: ['Inspired', 'Ambitious', 'Empowered', 'Sophisticated'],
  },
  {
    id: 'disruptor',
    title: 'The Disruptor',
    story: 'Your brand breaks patterns. Direct, charismatic, unapologetic.',
    toneWords: ['Rebellious', 'Urban', 'Modern', 'Energetic'],
    personalityTags: ['Rebellious', 'Urban', 'Edgy', 'Energetic'],
    targetFeelings: ['Energized', 'Excited', 'Bold', 'Motivated'],
  },
  {
    id: 'sanctuary',
    title: 'The Sanctuary',
    story: 'Your brand creates peace, clarity, and space.',
    toneWords: ['Minimal', 'Calm', 'Soft', 'Reassuring'],
    personalityTags: ['Clean', 'Minimal', 'Elegant', 'Warm'],
    targetFeelings: ['Calm', 'Peaceful', 'Secure', 'Welcomed'],
  },
];

// ============= Sales Personality Definitions =============

export interface SalesPersonalityDefinition {
  id: BlueprintDiscovery['salesPersonality'];
  title: string;
  story: string;
  exampleCta: string;
  icon: string;
}

export const SALES_PERSONALITIES: SalesPersonalityDefinition[] = [
  { id: 'fast_freemium', title: 'Fast Freemium', story: 'Your site leads with instant value—a free trial, demo, or download, then nurtures into paid.', exampleCta: 'Start Free in 30 Seconds', icon: 'Zap' },
  { id: 'social_proof_closer', title: 'Social Proof Closer', story: 'Your site builds belief first—proof, results, client stories—then asks for the call.', exampleCta: 'See How Others Did It', icon: 'Award' },
  { id: 'natural_approachable', title: 'Natural & Approachable', story: 'Feels like a friendly chat. Warm copy, reassuring headlines, open invitations.', exampleCta: 'Let\'s Talk About Your Goals', icon: 'MessageCircle' },
  { id: 'guided_sherpa', title: 'Guided Sherpa', story: 'Your site presents a guided path—steps, progress, clear milestones to reduce overwhelm.', exampleCta: 'Begin Your 3-Step Plan', icon: 'Compass' },
  { id: 'educator', title: 'Educator First', story: 'Your site gives away clear, structured insight first—then invites deeper work.', exampleCta: 'Get the Free Blueprint', icon: 'BookOpen' },
  { id: 'quietly_authoritative', title: 'Quietly Authoritative', story: 'Your site speaks with calm certainty; confident, grounded, no hype.', exampleCta: 'Schedule a Consultation', icon: 'Shield' },
  { id: 'luxury_gatekeeper', title: 'Luxury Gatekeeper', story: 'Your site feels like a private door—few, well-placed CTAs, framed as invitations or applications.', exampleCta: 'Apply for a Private Call', icon: 'Crown' },
  { id: 'slow_burn_strategist', title: 'Slow Burn Strategist', story: 'Your site invests in education and ongoing touchpoints—think newsletter, content hub, gentle asks.', exampleCta: 'Join the Inner Circle', icon: 'Mail' },
  { id: 'movement_starter', title: 'Movement Starter', story: 'Your brand inspires action and creates belonging—rally people around a cause or shared identity.', exampleCta: 'Join the Movement', icon: 'PartyPopper' },
  { id: 'algorithmic_closer', title: 'Algorithmic Closer', story: 'Your site behaves like a smart funnel—quizzes, paths, and conditional CTAs.', exampleCta: 'Take the 2-Minute Quiz', icon: 'TrendingUp' },
];

// ============= Option Lists =============

export const TONE_OPTIONS = [
  'Professional', 'Bold', 'Luxury', 'Friendly', 'Authoritative',
  'Playful', 'Minimal', 'Warm', 'Technical', 'Elegant', 'Rebellious'
] as const;

export const PERSONALITY_TAG_OPTIONS = [
  'Clean', 'Bold', 'Luxury', 'Playful', 'Rebellious', 'Urban',
  'Elegant', 'Modern', 'Authentic', 'Innovative', 'Warm',
  'Professional', 'Edgy', 'Sophisticated', 'Quirky'
] as const;

export const TARGET_FEELING_OPTIONS = [
  'Empowered', 'Calm', 'Energized', 'Confident', 'Inspired',
  'Secure', 'Excited', 'Sophisticated', 'Welcomed', 'Motivated',
  'Curious', 'Trustful', 'Ambitious', 'Peaceful', 'Bold'
] as const;

export const PAGE_OPTIONS = [
  'Home', 'About', 'Services', 'Portfolio', 'Blog',
  'Contact', 'Shop', 'Team', 'Testimonials', 'FAQ'
] as const;

export const FEATURE_OPTIONS = [
  'Booking System', 'E-commerce', 'Client Portal', 'CMS / Blog',
  'Email Marketing', 'Chat-bot', 'Analytics Dashboard', 'SEO Tools',
  'Multi-language', 'Custom Forms', 'Lead or Sales Funnel', 'Other'
] as const;
