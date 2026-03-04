export interface CapabilityShowcase {
  id: string;
  category: string;
  systemName: string;
  headline: string;
  description: string;
  features: string[];
  image: string;
  glowColor?: string;
}

export const capabilityShowcase: CapabilityShowcase[] = [
  {
    id: "portal-hub",
    category: "Client Experience",
    systemName: "Portal Hub",
    headline: "Structured project environments out of the box.",
    description: "Every client gets a dedicated, secure portal. A single source of truth for assets, deliverables, and communication that elevates the standard of service and eliminates email chaos.",
    features: ["Real-time stage tracking", "Asset management", "Secure credential vault"],
    image: "/src/assets/carousel-cases/case.webp",
    glowColor: "rgba(120, 160, 255, 0.4)"
  },
  {
    id: "observatory",
    category: "Internal Operations",
    systemName: "The Observatory",
    headline: "Operational intelligence, engineered in-house.",
    description: "A centralized command centre that aggregates every client signal, message, and milestone into a single sorted feed, allowing operators to prioritize action over administration.",
    features: ["Urgency-sorted signals", "Cross-portal aggregation", "Live status markers"],
    image: "/src/assets/carousel-cases/case2.webp",
    glowColor: "rgba(255, 160, 80, 0.4)"
  },
  {
    id: "client-portal",
    category: "Client Experience",
    systemName: "Client Dashboard",
    headline: "Clarity and momentum at a glance.",
    description: "The welcome dashboard sets the tone from day one. Clients see exactly where their project stands, what's expected of them, and what happens next — reducing friction and anxiety.",
    features: ["Milestone progression", "Analog time/location sync", "Clear next actions"],
    image: "/src/assets/carousel-cases/case3.webp",
    glowColor: "rgba(100, 255, 180, 0.4)"
  },
  {
    id: "ops-calendar",
    category: "Internal Operations",
    systemName: "Ops Console",
    headline: "Capacity and scheduling, visualized.",
    description: "A scheduling interface built specifically for high-ticket service delivery, integrating strategic milestones directly into the operational calendar alongside key performance metrics.",
    features: ["Capacity KPIs", "Service-tier color coding", "Integrated booking"],
    image: "/src/assets/carousel-cases/case4.webp",
    glowColor: "rgba(200, 120, 255, 0.4)"
  },
  {
    id: "automation",
    category: "Systems & Automation",
    systemName: "Automation Engine",
    headline: "Sophisticated communication at scale.",
    description: "Our infrastructure includes pre-built, variable-driven email templates and automation sequences that trigger based on client lifecycle stages, ensuring nothing falls through the cracks.",
    features: ["Dynamic merge variables", "Live client preview", "Stage-based triggers"],
    image: "/src/assets/carousel-cases/case5.webp",
    glowColor: "rgba(255, 220, 100, 0.4)"
  },
  {
    id: "framework",
    category: "Strategic Foundation",
    systemName: "C.R.A.F.T. Framework",
    headline: "Driven by a rigorous methodology.",
    description: "The technology is just the vehicle; the strategic framework is the engine. Every piece of infrastructure we deploy is rooted in a tested process for digital excellence and growth.",
    features: ["Clarify & Research", "Architect & Align", "Form & Test"],
    image: "/src/assets/carousel-cases/case6.webp",
    glowColor: "rgba(150, 200, 255, 0.4)"
  },
  {
    id: "booking-system",
    category: "Revenue Infrastructure",
    systemName: "Booking Engine",
    headline: "Conversion-optimized scheduling, built in.",
    description: "A frictionless booking interface that integrates directly with service tiers, availability logic, and payment gateways — turning interest into confirmed engagements without manual follow-up.",
    features: ["Service-tier selection", "Availability sync", "Deposit capture"],
    image: "/src/assets/carousel-cases/case7.webp",
    glowColor: "rgba(255, 120, 160, 0.4)"
  },
  {
    id: "analytics-suite",
    category: "Performance Intelligence",
    systemName: "Insight Layer",
    headline: "Decisions backed by data, not instinct.",
    description: "A performance analytics layer that surfaces conversion funnels, engagement heatmaps, and ROI attribution across every client touchpoint — giving operators the clarity to iterate with precision.",
    features: ["Funnel analytics", "Engagement heatmaps", "ROI attribution"],
    image: "/src/assets/carousel-cases/case8.webp",
    glowColor: "rgba(120, 255, 230, 0.4)"
  },
  {
    id: "landing-engine",
    category: "Conversion Architecture",
    systemName: "Launch Pad",
    headline: "High-converting pages, engineered to perform.",
    description: "Purpose-built landing pages designed around conversion psychology and technical performance. Every element — from load speed to CTA placement — is architecturally optimized for results.",
    features: ["A/B testing ready", "Speed-optimized builds", "Conversion-first layouts"],
    image: "/src/assets/carousel-cases/case9.webp",
    glowColor: "rgba(220, 120, 80, 0.4)"
  }
];
