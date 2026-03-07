// Service Buckets Data for Additional Services Selection

export interface ServiceSubBucket {
  id: string;
  label: string;
}

export interface ServiceBucket {
  id: string;
  label: string;
  description: string;
  expandedCopy: {
    headline: string;
    body: string;
  };
  mobileCopy: string;
  subBuckets: ServiceSubBucket[];
}

export const SERVICE_BUCKETS: ServiceBucket[] = [
  {
    id: 'strategy_positioning',
    label: 'Strategy & Positioning',
    description: 'Clarify your market position and messaging',
    expandedCopy: {
      headline: 'Clarify what you stand for, who you serve, and why you win.',
      body: 'This layer defines the strategic spine of your business. We align your brand, offer, and messaging so your platform doesn\'t just look good — it knows exactly who it\'s speaking to and what action it\'s driving. This work removes ambiguity, sharpens differentiation, and ensures every page converts with intent rather than guesswork.',
    },
    mobileCopy: 'Define your market position, offer clarity, and messaging direction.',
    subBuckets: [
      { id: 'brand_strategy', label: 'Brand strategy & positioning' },
      { id: 'offer_architecture', label: 'Offer architecture & pricing' },
      { id: 'icp_definition', label: 'ICP definition' },
      { id: 'messaging_framework', label: 'Messaging framework' },
      { id: 'market_analysis', label: 'Market/competitor analysis' },
      { id: 'gtm_planning', label: 'Go-to-market planning' },
    ],
  },
  {
    id: 'design_experience',
    label: 'Design & Experience',
    description: 'Visual identity and interface design',
    expandedCopy: {
      headline: 'Translate strategy into a visual and experiential system.',
      body: 'Design is not decoration — it\'s communication. This service focuses on crafting a visual identity and interface experience that feels premium, intentional, and intuitive across all devices. Every interaction, layout, and motion choice is designed to reinforce trust, clarity, and momentum.',
    },
    mobileCopy: 'Create a refined visual identity and intuitive user experience.',
    subBuckets: [
      { id: 'visual_identity', label: 'Visual identity & brand system' },
      { id: 'website_ux', label: 'Website UI/UX design' },
      { id: 'design_system', label: 'Design system for scale' },
      { id: 'motion_micro', label: 'Motion & micro-interactions' },
      { id: 'mobile_responsive', label: 'Mobile/responsive optimisation' },
      { id: 'accessibility_usability', label: 'Accessibility & usability refinement' },
    ],
  },
  {
    id: 'website_platform',
    label: 'Platform Build',
    description: 'Core platform development and hosting',
    expandedCopy: {
      headline: 'Build the foundation your business actually runs on.',
      body: 'This is the technical execution layer — where strategy and design become a fast, reliable, scalable platform. We architect and build it with performance, maintainability, and future growth in mind, ensuring it works just as well behind the scenes as it does on the surface.',
    },
    mobileCopy: 'Build a fast, scalable, production-ready platform.',
    subBuckets: [
      { id: 'marketing_website', label: 'Marketing website build' },
      { id: 'landing_pages', label: 'Custom landing pages' },
      { id: 'cms_setup', label: 'CMS setup' },
      { id: 'performance_opt', label: 'Performance optimisation' },
      { id: 'accessibility_compliance', label: 'Accessibility compliance' },
      { id: 'hosting_deployment', label: 'Hosting & deployment setup' },
    ],
  },
  {
    id: 'products_systems',
    label: 'Products, Services & Systems',
    description: 'Digital products and client-facing tools',
    expandedCopy: {
      headline: 'Turn what you sell into structured, scalable systems.',
      body: 'Here we move beyond "pages" and into functionality. Whether you\'re offering services, digital products, memberships, or internal tools, this layer focuses on building systems that reduce manual work, improve user experience, and support scale without complexity.',
    },
    mobileCopy: 'Structure services and tools into scalable systems.',
    subBuckets: [
      { id: 'service_productisation', label: 'Service productisation' },
      { id: 'digital_product_arch', label: 'Digital product architecture' },
      { id: 'client_portals', label: 'Client portals & dashboards' },
      { id: 'booking_scheduling', label: 'Booking & scheduling' },
      { id: 'memberships_gated', label: 'Memberships/gated content' },
      { id: 'workflows_automation', label: 'Workflows & automation' },
    ],
  },
  {
    id: 'marketing_growth',
    label: 'Marketing, Growth & Conversion',
    description: 'Lead generation and sales systems',
    expandedCopy: {
      headline: 'Design the paths that turn attention into revenue.',
      body: 'This layer focuses on how people find you, move through your platform, and take action. We engineer funnels, copy, and tracking systems that support growth — not vanity metrics — so your platform actively contributes to lead generation and sales.',
    },
    mobileCopy: 'Design funnels that drive leads and sales.',
    subBuckets: [
      { id: 'lead_sales_funnels', label: 'Lead/sales funnels' },
      { id: 'conversion_copywriting', label: 'Conversion copywriting' },
      { id: 'email_marketing', label: 'Email marketing & automation' },
      { id: 'crm_pipeline', label: 'CRM & pipeline setup' },
      { id: 'analytics_tracking', label: 'Analytics & tracking' },
      { id: 'seo_foundations', label: 'SEO foundations' },
    ],
  },
  {
    id: 'technical_automation',
    label: 'Technical & Automation',
    description: 'Integrations, APIs, and backend logic',
    expandedCopy: {
      headline: 'Connect, automate, and harden your digital stack.',
      body: 'This service handles the invisible machinery that powers modern businesses. From integrations to backend logic, we ensure your tools talk to each other cleanly, data flows correctly, and performance and security are treated as first-class concerns.',
    },
    mobileCopy: 'Integrate systems, automate workflows, and harden performance.',
    subBuckets: [
      { id: 'crm_implementation', label: 'CRM implementation' },
      { id: 'third_party_integrations', label: 'Third-party integrations' },
      { id: 'automation_logic', label: 'Automation logic (Zapier/GHL/custom)' },
      { id: 'api_backend', label: 'API/backend logic' },
      { id: 'data_dashboards', label: 'Data/reporting dashboards' },
      { id: 'security_performance', label: 'Security & performance hardening' },
    ],
  },
  {
    id: 'launch_support',
    label: 'Launch, Support & Ongoing',
    description: 'Post-launch care and partnership',
    expandedCopy: {
      headline: 'Ensure your platform performs beyond launch day.',
      body: 'A platform isn\'t finished when it goes live. This layer supports launch execution, team handover, ongoing optimisation, and long-term partnership — ensuring it continues to evolve as your business grows.',
    },
    mobileCopy: 'Support launch, iteration, and long-term growth.',
    subBuckets: [
      { id: 'launch_qa', label: 'Launch planning & QA' },
      { id: 'training_handover', label: 'Training & handover' },
      { id: 'ongoing_support', label: 'Ongoing support & maintenance' },
      { id: 'iteration_cycles', label: 'Iteration & optimisation cycles' },
      { id: 'growth_experiments', label: 'Growth experiments/testing' },
      { id: 'fractional_partner', label: 'Fractional digital partner support' },
    ],
  },
];
