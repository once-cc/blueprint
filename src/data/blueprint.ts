import { Compass, Target, Rocket } from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ═══════════════════════════════════════════════════════════════
// Process Steps — shared across Blueprint hero + FrameworkSection
// ═══════════════════════════════════════════════════════════════

export interface ProcessStep {
    id: string;
    title: string;
    description: string;
    bullets: string[];
    icon: LucideIcon;
    imageUrl: string;
    mobileImageUrl: string;
}

export const processSteps: ProcessStep[] = [
    {
        id: "discovery",
        icon: Compass,
        title: "Discovery",
        description: "Define what your asset must do.\nWhat outcomes it must support.\nAnd how it must communicate.\nBuilt with purpose, so it serves as an asset to your business.",
        bullets: ["Strategic Intent", "Conversion Pathways", "Positioning Alignment"],
        imageUrl: "/assets/framework/discovery.webp",
        mobileImageUrl: "/assets/framework/discovery-mobile.webp"
    },
    {
        id: "design",
        icon: Target,
        title: "Design",
        description: "Direct the color and visual style it wears.\nHow the design should feel.\nHow attention should move.\nDesign is how trust is felt. Before anyone reads your offer, they feel your presence.",
        bullets: ["Visual Style", "Typography Direction", "Mood and Color Palette"],
        imageUrl: "/assets/framework/design.webp",
        mobileImageUrl: "/assets/framework/design-mobile.webp"
    },
    {
        id: "deliver",
        icon: Rocket,
        title: "Deliver",
        description: "Translate strategy and design into a production-ready system.\nScope defined.\nRequirements clarified.\nConstraints acknowledged.\nInfrastructure designed to support growth — not just launch.",
        bullets: ["Features & Integrations", "Scope & Constraints", "Creative risk tolerance"],
        imageUrl: "/assets/framework/delivery.webp",
        mobileImageUrl: "/assets/framework/delivery-mobile.webp"
    }
];

// ═══════════════════════════════════════════════════════════════
// Benefits list — used in Blueprint hero section
// ═══════════════════════════════════════════════════════════════

export const benefits: string[] = [
    "Eliminate guesswork from the design process",
    "Reduce costly revisions and back-and-forth",
    "Fast-track your project from idea to launch",
    "Align your team with a shared visual reference",
    "Identify conversion opportunities early",
    "Build with confidence, not assumptions"
];

// ═══════════════════════════════════════════════════════════════
// Animation configs — shared spring presets
// ═══════════════════════════════════════════════════════════════

export const springConfig = { type: "spring" as const, stiffness: 300, damping: 30 };
