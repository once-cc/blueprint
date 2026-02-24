/**
 * contract.ts — Canonical Contract Builder + Asset Factory Input Generator
 * 
 * Produces deterministic, immutable JSON artifacts from blueprint data:
 * - blueprint_contract.json: Full canonical representation
 * - asset_factory_input.json: Structured input for the Asset Factory pipeline
 */

// ── Types ───────────────────────────────────────────────────

interface BlueprintRecord {
    id: string;
    status: string;
    user_email: string | null;
    user_name: string | null;
    business_name: string | null;
    dream_intent: string | null;
    discovery: Record<string, unknown>;
    design: Record<string, unknown>;
    deliver: Record<string, unknown>;
    created_at: string;
    submitted_at: string | null;
}

interface ReferenceRecord {
    id: string;
    type: string;
    url: string;
    filename?: string;
    notes?: string;
    role?: string;
    label?: string;
}

// ── Canonical Contract ──────────────────────────────────────

export interface BlueprintContract {
    version: string;
    generated_at: string;
    blueprint_id: string;
    status: string;

    client: {
        email: string | null;
        name: string | null;
        business_name: string | null;
    };

    intent: {
        dream_intent: string | null;
        site_topic: string | null;
        primary_purpose: string | null;
        secondary_purposes: string[];
        conversion_goals: string[];
        advanced_objectives: Record<string, string>;
    };

    brand: {
        archetype: string | null;
        voice: Record<string, unknown>;
        sales_personality: string | null;
        cta_primary_label: string | null;
        cta_strategy_notes: string | null;
    };

    design: {
        visual_style: string | null;
        imagery_style: string | null;
        typography_direction: string | null;
        font_weight: string | null;
        animation_intensity: number | null;
        colour_relationship: string | null;
        base_hue: number | null;
        palette_energy: number | null;
        palette_contrast: number | null;
        generated_palette: Array<{ role: string; color: string }>;
    };

    scope: {
        pages: string[];
        features: string[];
        timeline: string | null;
        budget: string | null;
        risk_tolerance: number | null;
    };

    references: Array<{
        id: string;
        type: string;
        url: string;
        role: string | null;
        label: string | null;
        notes: string | null;
    }>;

    metadata: {
        created_at: string;
        submitted_at: string | null;
        contract_version: string;
    };
}

export function buildCanonicalContract(
    blueprint: BlueprintRecord,
    references: ReferenceRecord[] = []
): BlueprintContract {
    const d = blueprint.discovery || {};
    const des = blueprint.design || {};
    const del = blueprint.deliver || {};

    return {
        version: "2.0.0",
        generated_at: new Date().toISOString(),
        blueprint_id: blueprint.id,
        status: blueprint.status,

        client: {
            email: blueprint.user_email,
            name: blueprint.user_name,
            business_name: blueprint.business_name,
        },

        intent: {
            dream_intent: blueprint.dream_intent,
            site_topic: (d.siteTopic as string) || null,
            primary_purpose: (d.primaryPurpose as string) || null,
            secondary_purposes: (d.secondaryPurposes as string[]) || [],
            conversion_goals: (d.conversionGoals as string[]) || [],
            advanced_objectives: (d.advancedObjectives as Record<string, string>) || {},
        },

        brand: {
            archetype: (d.brandArchetype as string) || null,
            voice: (d.brandVoice as Record<string, unknown>) || {},
            sales_personality: (d.salesPersonality as string) || null,
            cta_primary_label: (d.ctaPrimaryLabel as string) || null,
            cta_strategy_notes: (d.ctaStrategyNotes as string) || null,
        },

        design: {
            visual_style: (des.visualStyle as string) || null,
            imagery_style: (des.imageryStyle as string) || null,
            typography_direction: (des.typography_direction as string) || null,
            font_weight: (des.fontWeight as string) || null,
            animation_intensity: (des.animationIntensity as number) ?? null,
            colour_relationship: (des.colourRelationship as string) || null,
            base_hue: (des.baseHue as number) ?? null,
            palette_energy: (des.paletteEnergy as number) ?? null,
            palette_contrast: (des.paletteContrast as number) ?? null,
            generated_palette: (des.generatedPalette as Array<{ role: string; color: string }>) || [],
        },

        scope: {
            pages: (del.pages as string[]) || [],
            features: (del.features as string[]) || [],
            timeline: (del.timeline as string) || null,
            budget: (del.budget as string) || null,
            risk_tolerance: (del.riskTolerance as number) ?? null,
        },

        references: references.map((ref) => ({
            id: ref.id,
            type: ref.type,
            url: ref.url,
            role: ref.role || null,
            label: ref.label || null,
            notes: ref.notes || null,
        })),

        metadata: {
            created_at: blueprint.created_at,
            submitted_at: blueprint.submitted_at,
            contract_version: "2.0.0",
        },
    };
}

// ── Asset Factory Input ─────────────────────────────────────

export interface AssetFactoryInput {
    version: string;
    blueprint_id: string;
    generated_at: string;

    // Project identity
    project_name: string;
    client_email: string;

    // Design directives
    visual_style: string | null;
    imagery_style: string | null;
    typography_direction: string | null;
    colour_relationship: string | null;
    base_hue: number | null;
    palette_energy: number | null;
    palette_contrast: number | null;
    palette: Array<{ role: string; color: string }>;
    animation_intensity: number | null;

    // Content directives
    primary_purpose: string | null;
    conversion_goals: string[];
    sales_personality: string | null;
    cta_primary_label: string | null;
    brand_archetype: string | null;
    brand_voice: Record<string, unknown>;

    // Scope
    pages: string[];
    features: string[];
    timeline: string | null;
    budget: string | null;
    risk_tolerance: number | null;

    // References for asset generation
    reference_urls: string[];
}

export function buildAssetFactoryInput(
    contract: BlueprintContract
): AssetFactoryInput {
    return {
        version: "2.0.0",
        blueprint_id: contract.blueprint_id,
        generated_at: new Date().toISOString(),

        project_name: contract.client.business_name || "Untitled Project",
        client_email: contract.client.email || "",

        visual_style: contract.design.visual_style,
        imagery_style: contract.design.imagery_style,
        typography_direction: contract.design.typography_direction,
        colour_relationship: contract.design.colour_relationship,
        base_hue: contract.design.base_hue,
        palette_energy: contract.design.palette_energy,
        palette_contrast: contract.design.palette_contrast,
        palette: contract.design.generated_palette,
        animation_intensity: contract.design.animation_intensity,

        primary_purpose: contract.intent.primary_purpose,
        conversion_goals: contract.intent.conversion_goals,
        sales_personality: contract.brand.sales_personality,
        cta_primary_label: contract.brand.cta_primary_label,
        brand_archetype: contract.brand.archetype,
        brand_voice: contract.brand.voice,

        pages: contract.scope.pages,
        features: contract.scope.features,
        timeline: contract.scope.timeline,
        budget: contract.scope.budget,
        risk_tolerance: contract.scope.risk_tolerance,

        reference_urls: contract.references.map((r) => r.url),
    };
}

// ── SHA-256 Hashing ─────────────────────────────────────────

export async function hashArtifact(payload: unknown): Promise<string> {
    const text = typeof payload === "string" ? payload : JSON.stringify(payload);
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
