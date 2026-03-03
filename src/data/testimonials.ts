export interface CapabilityShowcase {
  id: string;
  category: string;
  systemName: string;
  headline: string;
  description: string;
  features: string[];
  image: string;
}

export const capabilityShowcase: CapabilityShowcase[] = [
  {
    id: "portal-hub",
    category: "Client Experience",
    systemName: "Portal Hub",
    headline: "Structured project environments out of the box.",
    description: "Every client gets a dedicated, secure portal. A single source of truth for assets, deliverables, and communication that elevates the standard of service and eliminates email chaos.",
    features: ["Real-time stage tracking", "Asset management", "Secure credential vault"],
    image: "/src/assets/carousel-images/hero_creator_v3_1772506437184_optimized.jpg"
  },
  {
    id: "observatory",
    category: "Internal Operations",
    systemName: "The Observatory",
    headline: "Operational intelligence, engineered in-house.",
    description: "A centralized command centre that aggregates every client signal, message, and milestone into a single sorted feed, allowing operators to prioritize action over administration.",
    features: ["Urgency-sorted signals", "Cross-portal aggregation", "Live status markers"],
    image: "/src/assets/carousel-images/hero_creator_v1_1772506343751_optimized.jpg"
  },
  {
    id: "client-portal",
    category: "Client Experience",
    systemName: "Client Dashboard",
    headline: "Clarity and momentum at a glance.",
    description: "The welcome dashboard sets the tone from day one. Clients see exactly where their project stands, what's expected of them, and what happens next — reducing friction and anxiety.",
    features: ["Milestone progression", "Analog time/location sync", "Clear next actions"],
    image: "/src/assets/carousel-images/hero_consultant_v1_1772506298532_optimized.jpg"
  },
  {
    id: "ops-calendar",
    category: "Internal Operations",
    systemName: "Ops Console",
    headline: "Capacity and scheduling, visualized.",
    description: "A scheduling interface built specifically for high-ticket service delivery, integrating strategic milestones directly into the operational calendar alongside key performance metrics.",
    features: ["Capacity KPIs", "Service-tier color coding", "Integrated booking"],
    image: "/src/assets/carousel-images/hero_creator_v3_1772506437184_optimized.jpg"
  },
  {
    id: "automation",
    category: "Systems & Automation",
    systemName: "Automation Engine",
    headline: "Sophisticated communication at scale.",
    description: "Our infrastructure includes pre-built, variable-driven email templates and automation sequences that trigger based on client lifecycle stages, ensuring nothing falls through the cracks.",
    features: ["Dynamic merge variables", "Live client preview", "Stage-based triggers"],
    image: "/src/assets/carousel-images/hero_creator_v1_1772506343751_optimized.jpg"
  },
  {
    id: "framework",
    category: "Strategic Foundation",
    systemName: "C.R.A.F.T. Framework",
    headline: "Driven by a rigorous methodology.",
    description: "The technology is just the vehicle; the strategic framework is the engine. Every piece of infrastructure we deploy is rooted in a tested process for digital excellence and growth.",
    features: ["Clarify & Research", "Architect & Align", "Form & Test"],
    image: "/src/assets/carousel-images/hero_consultant_v1_1772506298532_optimized.jpg"
  }
];
