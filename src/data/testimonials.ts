export interface CapabilityShowcase {
  id: string;
  category: string;
  systemName: string;
  headline: string;
  description: string;
  features: string[];
  image: string;
  glowColor?: string;
  isEnhancedArtifact?: boolean;
  artifactCapability?: { title: string, name: string };
  artifactAnnotation?: string;
  artifactMetadata?: { label: string, value: string }[];
}

export const capabilityShowcase: CapabilityShowcase[] = [
  {
    id: "portal-hub",
    category: "Client Experience",
    systemName: "Portal Hub",
    headline: "Structured project environments out of the box.",
    description: "Every client gets a dedicated, secure portal. A single source of truth for assets, deliverables, and communication that elevates the standard of service and eliminates email chaos.",
    features: ["Real-time stage tracking", "Asset management", "Secure credential vault"],
    image: "/carousel-images/portfolio.webp",
    isEnhancedArtifact: true,
    artifactCapability: {
      title: "CAPABILITY",
      name: "Media Platform"
    },
    artifactAnnotation: "A cinematic showcase of photography, film, and creative work.",
    artifactMetadata: [
      { label: "SECTOR", value: "Creative Studios" },
      { label: "OBJECTIVE", value: "Portfolio Presentation" },
      { label: "ARCHITECTURE", value: "Visual Library + Video Reel" }
    ]
  },
  {
    id: "observatory",
    category: "Internal Operations",
    systemName: "The Observatory",
    headline: "Operational intelligence, engineered in-house.",
    description: "A centralized command centre that aggregates every client signal, message, and milestone into a single sorted feed, allowing operators to prioritize action over administration.",
    features: ["Urgency-sorted signals", "Cross-portal aggregation", "Live status markers"],
    image: "/carousel-images/bk.webp",
    isEnhancedArtifact: true,
    artifactCapability: {
      title: "CAPABILITY",
      name: "Financial Dashboard"
    },
    artifactAnnotation: "Clean profit-and-loss overview and digital ledger with positive metrics.",
    artifactMetadata: [
      { label: "SECTOR", value: "Accounting & Advisory" },
      { label: "OBJECTIVE", value: "Financial Clarity" },
      { label: "ARCHITECTURE", value: "Data Visualization + Secure Ledger" }
    ]
  },
  {
    id: "client-portal",
    category: "Client Experience",
    systemName: "Client Dashboard",
    headline: "Clarity and momentum at a glance.",
    description: "The welcome dashboard sets the tone from day one. Clients see exactly where their project stands, what's expected of them, and what happens next — reducing friction and anxiety.",
    features: ["Milestone progression", "Analog time/location sync", "Clear next actions"],
    image: "/carousel-images/portal.webp",
    isEnhancedArtifact: true,
    artifactCapability: {
      title: "CAPABILITY",
      name: "Operations Console"
    },
    artifactAnnotation: "Live visibility into projects, client activity, and performance metrics.",
    artifactMetadata: [
      { label: "SECTOR", value: "Professional Services" },
      { label: "OBJECTIVE", value: "Operational Oversight" },
      { label: "ARCHITECTURE", value: "Analytics Layer + Project Workspace" }
    ]
  },
  {
    id: "ops-calendar",
    category: "Internal Operations",
    systemName: "Ops Console",
    headline: "Capacity and scheduling, visualized.",
    description: "A scheduling interface built specifically for high-ticket service delivery, integrating strategic milestones directly into the operational calendar alongside key performance metrics.",
    features: ["Capacity KPIs", "Service-tier color coding", "Integrated booking"],
    image: "/carousel-images/consultant.webp",
    isEnhancedArtifact: true,
    artifactCapability: {
      title: "CAPABILITY",
      name: "Conversion Website"
    },
    artifactAnnotation: "Lead capture and consultation bookings.",
    artifactMetadata: [
      { label: "SECTOR", value: "Consulting Practice" },
      { label: "OBJECTIVE", value: "Client Acquisition" },
      { label: "ARCHITECTURE", value: "Authority Funnel" }
    ]
  },
  {
    id: "automation",
    category: "Systems & Automation",
    systemName: "Automation Engine",
    headline: "Sophisticated communication at scale.",
    description: "Our infrastructure includes pre-built, variable-driven email templates and automation sequences that trigger based on client lifecycle stages, ensuring nothing falls through the cracks.",
    features: ["Dynamic merge variables", "Live client preview", "Stage-based triggers"],
    image: "/carousel-images/podcast.webp",
    isEnhancedArtifact: true,
    artifactCapability: {
      title: "CAPABILITY",
      name: "Media Platform"
    },
    artifactAnnotation: "Central hub for content distribution and audience engagement.",
    artifactMetadata: [
      { label: "SECTOR", value: "Podcast / Content Brand" },
      { label: "OBJECTIVE", value: "Audience Growth" },
      { label: "ARCHITECTURE", value: "Episode Library + Player" }
    ]
  },
  {
    id: "framework",
    category: "Strategic Foundation",
    systemName: "C.R.A.F.T. Framework",
    headline: "Driven by a rigorous methodology.",
    description: "The technology is just the vehicle; the strategic framework is the engine. Every piece of infrastructure we deploy is rooted in a tested process for digital excellence and growth.",
    features: ["Clarify & Research", "Architect & Align", "Form & Test"],
    image: "/carousel-images/roofer.webp",
    isEnhancedArtifact: true,
    artifactCapability: {
      title: "CAPABILITY",
      name: "Conversion Website"
    },
    artifactAnnotation: "Captures local demand and converts visitors into qualified enquiries.",
    artifactMetadata: [
      { label: "SECTOR", value: "Residential Roofing" },
      { label: "OBJECTIVE", value: "Lead Generation" },
      { label: "ARCHITECTURE", value: "Service Funnel" }
    ]
  },
  {
    id: "booking-system",
    category: "Revenue Infrastructure",
    systemName: "Booking Engine",
    headline: "Conversion-optimized scheduling, built in.",
    description: "A frictionless booking interface that integrates directly with service tiers, availability logic, and payment gateways — turning interest into confirmed engagements without manual follow-up.",
    features: ["Service-tier selection", "Availability sync", "Deposit capture"],
    image: "/carousel-images/scheduling.webp",
    isEnhancedArtifact: true,
    artifactCapability: {
      title: "CAPABILITY",
      name: "Booking Infrastructure"
    },
    artifactAnnotation: "Real-time scheduling, booking control, and operational visibility.",
    artifactMetadata: [
      { label: "SECTOR", value: "Service Organisations" },
      { label: "OBJECTIVE", value: "Appointment Orchestration" },
      { label: "ARCHITECTURE", value: "Calendar Engine + Capacity Layer" }
    ]
  },
  {
    id: "analytics-suite",
    category: "Performance Intelligence",
    systemName: "Insight Layer",
    headline: "Decisions backed by data, not instinct.",
    description: "A performance analytics layer that surfaces conversion funnels, engagement heatmaps, and ROI attribution across every client touchpoint — giving operators the clarity to iterate with precision.",
    features: ["Funnel analytics", "Engagement heatmaps", "ROI attribution"],
    image: "/carousel-images/legal.webp",
    isEnhancedArtifact: true,
    artifactCapability: {
      title: "CAPABILITY",
      name: "Professional Services Website"
    },
    artifactAnnotation: "A structured digital presence for legal services and client enquiries.",
    artifactMetadata: [
      { label: "SECTOR", value: "Legal Practice" },
      { label: "OBJECTIVE", value: "Client Acquisition" },
      { label: "ARCHITECTURE", value: "Authority Website + Practice Areas" }
    ]
  },
  {
    id: "landing-engine",
    category: "Conversion Architecture",
    systemName: "Launch Pad",
    headline: "High-converting pages, engineered to perform.",
    description: "Purpose-built landing pages designed around conversion psychology and technical performance. Every element — from load speed to CTA placement — is architecturally optimized for results.",
    features: ["A/B testing ready", "Speed-optimized builds", "Conversion-first layouts"],
    image: "/carousel-images/re.webp",
    isEnhancedArtifact: true,
    artifactCapability: {
      title: "CAPABILITY",
      name: "Listing Platform"
    },
    artifactAnnotation: "Property search, curated listings, and qualified lead capture.",
    artifactMetadata: [
      { label: "SECTOR", value: "Real Estate" },
      { label: "OBJECTIVE", value: "Property Marketing" },
      { label: "ARCHITECTURE", value: "Search Interface + Lead Capture" }
    ]
  }
];
