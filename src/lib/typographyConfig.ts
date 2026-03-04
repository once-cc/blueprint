export interface WeightPrefTargets {
    light: { h1: number; h2: number; h3: number; h4: number; body: number };
    regular: { h1: number; h2: number; h3: number; h4: number; body: number };
    bold: { h1: number; h2: number; h3: number; h4: number; body: number };
}

export interface TypographyStyleConfig {
    value: string;
    label: string;
    fontFamily: string;
    headingWeight: number;
    bodyWeight: number;
    maxHeadingWeight: number;
    minBodyWeight: number;
    weightPrefTargets: WeightPrefTargets;
    useCaseHints: { h1: string; h2: string; h3: string };
}

export const typographyStyles: TypographyStyleConfig[] = [
    {
        value: 'modern_minimal',
        label: 'Modern Minimal',
        fontFamily: 'Inter, system-ui, sans-serif',
        headingWeight: 500,
        bodyWeight: 400,
        maxHeadingWeight: 800,
        minBodyWeight: 300,
        weightPrefTargets: {
            light: { h1: 400, h2: 400, h3: 400, h4: 400, body: 300 },
            regular: { h1: 500, h2: 500, h3: 500, h4: 500, body: 400 },
            bold: { h1: 800, h2: 700, h3: 650, h4: 600, body: 500 },
        },
        useCaseHints: { h1: 'Luxury brand storytelling', h2: 'High-end hospitality', h3: 'Refined lifestyle brands' }
    },
    {
        value: 'bold_expressive',
        label: 'Bold Expressive',
        fontFamily: 'Syne, sans-serif',
        headingWeight: 700,
        bodyWeight: 400,
        maxHeadingWeight: 850,
        minBodyWeight: 300,
        weightPrefTargets: {
            light: { h1: 500, h2: 500, h3: 400, h4: 400, body: 300 },
            regular: { h1: 700, h2: 600, h3: 500, h4: 500, body: 400 },
            bold: { h1: 850, h2: 800, h3: 700, h4: 600, body: 500 },
        },
        useCaseHints: { h1: 'Creative agencies', h2: 'Disruptive D2C brands', h3: 'Portfolio websites' }
    },
    {
        value: 'refined_serif',
        label: 'Refined Serif',
        fontFamily: 'Playfair Display, serif',
        headingWeight: 600,
        bodyWeight: 400,
        maxHeadingWeight: 900,
        minBodyWeight: 300,
        weightPrefTargets: {
            light: { h1: 400, h2: 400, h3: 400, h4: 400, body: 300 },
            regular: { h1: 600, h2: 500, h3: 500, h4: 400, body: 400 },
            bold: { h1: 900, h2: 700, h3: 600, h4: 500, body: 500 },
        },
        useCaseHints: { h1: 'Law firms & professional services', h2: 'Financial advisory', h3: 'Classic editorial platforms' }
    },
    {
        value: 'technical_mono',
        label: 'Technical Mono',
        fontFamily: 'JetBrains Mono, monospace',
        headingWeight: 500,
        bodyWeight: 400,
        maxHeadingWeight: 800,
        minBodyWeight: 300,
        weightPrefTargets: {
            light: { h1: 400, h2: 400, h3: 400, h4: 400, body: 300 },
            regular: { h1: 500, h2: 500, h3: 400, h4: 400, body: 400 },
            bold: { h1: 700, h2: 700, h3: 600, h4: 500, body: 500 },
        },
        useCaseHints: { h1: 'SaaS product interfaces', h2: 'Developer documentation', h3: 'Fintech dashboards' }
    },
    {
        value: 'editorial',
        label: 'Editorial',
        fontFamily: 'Cormorant Garamond, serif',
        headingWeight: 400,
        bodyWeight: 300,
        maxHeadingWeight: 700,
        minBodyWeight: 300,
        weightPrefTargets: {
            light: { h1: 300, h2: 300, h3: 300, h4: 300, body: 300 },
            regular: { h1: 400, h2: 400, h3: 400, h4: 400, body: 400 },
            bold: { h1: 700, h2: 700, h3: 600, h4: 600, body: 500 },
        },
        useCaseHints: { h1: 'Hero announcements', h2: 'Sports & entertainment', h3: 'Bold campaign headlines' }
    }
];

export const fontWeights = [
    { value: 'light', label: 'Light / Thin' },
    { value: 'regular', label: 'Regular' },
    { value: 'mixed', label: 'Mixed Weights' },
    { value: 'bold', label: 'Bold / Heavy' },
] as const;
