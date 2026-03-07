import { jsPDF } from 'jspdf';
import * as fs from 'fs';

const COLORS = {
    bg: '#fcfcfc',
    primaryText: '#111111',
    secondaryText: '#888888',
    structural: '#e5e5e5',
} as const;

const MARGIN = 30;
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

// ── Complete dummy data matching the full configurator ──────────

const blueprint = {
    id: "bp_1234567890",
    firstName: "Aria",
    lastName: "Vance",
    businessName: "Aethera Aesthetics",
    userEmail: "hello@aethera.co",
    dreamIntent: "I want a website that feels like walking into a five-star spa — the moment someone lands on the page, they should feel an overwhelming sense of calm, trust, and exclusivity. Every detail should whisper luxury.",
    discovery: {
        siteTopic: "High-end Medical Spa",
        primaryPurpose: "lead_contact",
        secondaryPurposes: ["promotion", "content_community"],
        conversionGoals: ["capture_leads", "book_calls", "build_authority"],
        advancedObjectives: {
            booking_type: "private_consultation",
            lead_type: "high_value_inquiry",
            visibility: "seo_organic",
        },
        brandVoice: {
            tone: "Professional",
            presence: "Confident",
            personality: "Elegant",
            visitorFeeling: {
                energy: "Calm",
                confidence: "Absolute trust"
            }
        },
        salesPersonality: "luxury_gatekeeper",
        ctaPrimaryLabel: "Apply for a Private Consultation",
        ctaStrategyNotes: "Focus on exclusivity and high-touch service. Application model to filter leads."
    },
    design: {
        visualStyle: "luxury",
        imageryStyle: "cinematic",
        brandImageryMode: "upload",
        brandAssets: [
            { id: "ba_1", filename: "hero-treatment-room.jpg", size: 2400000, type: "lifestyle", notes: "Main hero banner — treatment suite", isPrimary: true, order: 0 },
            { id: "ba_2", filename: "dr-vance-headshot.jpg", size: 1800000, type: "headshot", notes: "Founder portrait for About page", isPrimary: false, order: 1 },
            { id: "ba_3", filename: "aethera-logo-gold.svg", size: 45000, type: "logo", notes: "Primary brand mark — gold variant", isPrimary: false, order: 2 },
            { id: "ba_4", filename: "product-serum-line.jpg", size: 3200000, type: "product", notes: "Product line imagery for services section", isPrimary: false, order: 3 },
        ],
        typographyMode: "upload",
        customFonts: {
            files: [
                { id: "cf_1", fileData: "", filename: "Cormorant-SemiBold.woff2", weight: "600", style: "normal" },
                { id: "cf_2", fileData: "", filename: "Cormorant-Italic.woff2", weight: "400", style: "italic" },
                { id: "cf_3", fileData: "", filename: "Inter-Regular.woff2", weight: "400", style: "normal" },
            ],
            roles: {
                h1: "cf_1",
                h2: "cf_1",
                h3: "cf_2",
                eyebrow: "cf_3",
                body: "cf_3",
                button: "cf_3",
            }
        },
        typography_direction: "elegant_premium",
        fontWeight: "mixed",
        animationIntensity: 4,
        colourRelationship: "monochrome",
        baseHue: 45,
        paletteEnergy: 3,
        paletteContrast: 8,
        generatedPalette: [
            { role: "Background", color: "#0a0a0f" },
            { role: "Surface", color: "#1a1a1f" },
            { role: "Text", color: "#f5f5f5" },
            { role: "Accent", color: "#d4a853" },
            { role: "Muted", color: "#6b6b6b" },
        ]
    },
    deliver: {
        pages: ["Home", "About", "Services", "Portfolio", "Contact", "Blog"],
        features: ["Booking System", "CMS / Blog", "Email Marketing", "Analytics Dashboard", "SEO Tools"],
        timeline: "6_10_weeks",
        budget: "10_25k",
        riskTolerance: 3
    },
    references: [
        { id: "ref_1", type: "link", url: "https://www.augustinusbader.com", role: "hero_reference", label: "Augustinus Bader", notes: "Love the clinical luxury feel and photography treatment", createdAt: new Date() },
        { id: "ref_2", type: "image", url: "", filename: "moodboard-interior.jpg", role: "overall_vibe", notes: "Spa interior atmosphere — marble and warm tones", createdAt: new Date() },
        { id: "ref_3", type: "link", url: "https://www.drbarbarasturm.com", role: "layout_reference", label: "Dr. Barbara Sturm", notes: "Elegant editorial layout with strong hierarchy", createdAt: new Date() },
        { id: "ref_4", type: "image", url: "", filename: "typography-sample.png", role: "typography_reference", notes: "Serif + sans pairing reference", createdAt: new Date() },
        { id: "ref_5", type: "link", url: "https://www.lamer.com", role: "colour_reference", label: "La Mer", notes: "The deep ocean teal with gold accents", createdAt: new Date() },
    ]
};

// ── Sales personality lookup ──────────────────────────────────

const SALES_PERSONALITIES: Record<string, string> = {
    fast_freemium: "Fast Freemium",
    social_proof_closer: "Social Proof Closer",
    natural_approachable: "Natural & Approachable",
    guided_sherpa: "Guided Sherpa",
    educator: "Educator First",
    quietly_authoritative: "Quietly Authoritative",
    luxury_gatekeeper: "Luxury Gatekeeper",
    slow_burn_strategist: "Slow Burn Strategist",
    movement_starter: "Movement Starter",
    algorithmic_closer: "Algorithmic Closer",
};

const REFERENCE_ROLES: Record<string, string> = {
    hero_reference: "Hero Inspiration",
    layout_reference: "Layout Reference",
    colour_reference: "Colour Reference",
    typography_reference: "Typography Reference",
    overall_vibe: "Overall Vibe",
    other: "Other",
};

const ASSET_TYPES: Record<string, string> = {
    headshot: "Headshot",
    product: "Product",
    portfolio: "Portfolio",
    lifestyle: "Lifestyle",
    campaign: "Campaign",
    logo: "Logo",
    background: "Background",
    texture: "Texture",
    other: "Other",
    unassigned: "Unassigned",
};

function formatLabel(key: string) {
    if (!key) return '';
    return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── PDF Builder ───────────────────────────────────────────────

function buildBlueprintPdf() {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    let pageNum = 1;
    let y = 0;

    function drawBaseStudio() {
        doc.setFillColor(COLORS.bg);
        doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, 'F');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(COLORS.secondaryText);
        doc.text('CLELAND STUDIO', MARGIN, PAGE_HEIGHT - 15);
        doc.text('Crafted Blueprint System', MARGIN, PAGE_HEIGHT - 11);
        doc.text('CONFIDENTIAL', PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 15, { align: 'right' });
        doc.text(`Page 0${pageNum}`, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 11, { align: 'right' });
    }

    function checkPage(needed: number) {
        if (y + needed > PAGE_HEIGHT - 30) {
            pageNum++;
            doc.addPage();
            drawBaseStudio();
            y = MARGIN + 10;
        }
    }

    function actHeader(actTitle: string) {
        checkPage(30);
        doc.setFontSize(16);
        doc.setTextColor(COLORS.primaryText);
        doc.setFont('times', 'italic');
        doc.text(actTitle, MARGIN, y);
        y += 20;
    }

    function editorialSection(sysId: string, title: string, fieldsDict: Record<string, any>, tagsDict?: Record<string, string[]>) {
        checkPage(40);

        doc.setFont('courier', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(COLORS.secondaryText);
        doc.text(`[ ${sysId} ]`, MARGIN, y);
        y += 6;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(COLORS.primaryText);
        doc.setCharSpace(1.5);
        doc.text(title.toUpperCase(), MARGIN, y);
        doc.setCharSpace(0);

        y += 4;
        doc.setDrawColor(COLORS.structural);
        doc.setLineWidth(0.2);
        doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
        y += 12;

        if (fieldsDict) {
            Object.entries(fieldsDict).forEach(([label, value]) => {
                if (!value || String(value).trim() === '') return;
                checkPage(18);

                doc.setFont('helvetica', 'normal');
                doc.setFontSize(8);
                doc.setTextColor(COLORS.secondaryText);
                doc.setCharSpace(1);
                doc.text(label.toUpperCase(), MARGIN, y);
                doc.setCharSpace(0);

                doc.setFont('times', 'normal');
                doc.setFontSize(14);
                doc.setTextColor(COLORS.primaryText);
                const splitVal = doc.splitTextToSize(String(value), CONTENT_WIDTH);
                doc.text(splitVal, MARGIN, y + 6);
                y += splitVal.length * 6 + 10;
            });
        }

        if (tagsDict) {
            Object.entries(tagsDict).forEach(([label, items]) => {
                if (!items || items.length === 0) return;
                checkPage(20);

                doc.setFont('helvetica', 'normal');
                doc.setFontSize(8);
                doc.setTextColor(COLORS.secondaryText);
                doc.setCharSpace(1);
                doc.text(label.toUpperCase(), MARGIN, y);
                doc.setCharSpace(0);

                doc.setFont('times', 'normal');
                doc.setFontSize(14);
                doc.setTextColor(COLORS.primaryText);
                const joined = items.map(i => formatLabel(i)).join('  •  ');
                const splitVal = doc.splitTextToSize(joined, CONTENT_WIDTH);
                doc.text(splitVal, MARGIN, y + 6);
                y += splitVal.length * 6 + 10;
            });
        }

        y += 10;
    }

    // ═══════════════════════════════════════════════════════════
    // PAGE 1 — Cover
    // ═══════════════════════════════════════════════════════════

    drawBaseStudio();
    y = 100;

    // Centered eyebrow
    const eyebrow = 'CRAFTED BLUEPRINT';
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(16);
    doc.setTextColor(COLORS.secondaryText);
    const ebSpace = 4;
    doc.setCharSpace(0);
    const ewBase = doc.getTextWidth(eyebrow);
    const ewTotal = ewBase + (eyebrow.length - 1) * ebSpace;
    doc.setCharSpace(ebSpace);
    doc.text(eyebrow, (PAGE_WIDTH / 2) - (ewTotal / 2), y);
    doc.setCharSpace(0);

    y += 24;

    // Centered hero title
    let titleStr = blueprint.businessName || "Confidential Project";
    doc.setFont('times', 'italic');
    doc.setFontSize(44);
    doc.setTextColor(COLORS.primaryText);
    const titleLines = doc.splitTextToSize(titleStr, CONTENT_WIDTH);
    titleLines.forEach((line: string) => {
        const lw = doc.getTextWidth(line);
        doc.text(line, (PAGE_WIDTH / 2) - (lw / 2), y);
        y += 16;
    });

    y += 24;

    // Left-aligned metadata block
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(COLORS.secondaryText);
    doc.text('Architectural Strategy Document', MARGIN, y);
    y += 16;

    // PREPARED FOR
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(COLORS.secondaryText);
    doc.setCharSpace(1);
    doc.text('PREPARED FOR', MARGIN, y);
    doc.setCharSpace(0);

    const clientName = [blueprint.firstName, blueprint.lastName].filter(Boolean).join(' ');
    doc.setFont('times', 'normal');
    doc.setFontSize(16);
    doc.setTextColor(COLORS.primaryText);
    doc.text(clientName, MARGIN, y + 6);

    y += 24;

    // EMAIL
    if (blueprint.userEmail) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(COLORS.secondaryText);
        doc.setCharSpace(1);
        doc.text('CONTACT', MARGIN, y);
        doc.setCharSpace(0);

        doc.setFont('times', 'normal');
        doc.setFontSize(14);
        doc.setTextColor(COLORS.primaryText);
        doc.text(blueprint.userEmail, MARGIN, y + 6);
        y += 20;
    }

    // GENERATED
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(COLORS.secondaryText);
    doc.setCharSpace(1);
    doc.text('GENERATED', MARGIN, y);
    doc.setCharSpace(0);

    const dateStr = new Date("2026-03-07").toLocaleDateString('en-NZ', { year: 'numeric', month: 'long', day: 'numeric' });
    doc.setFont('times', 'normal');
    doc.setFontSize(14);
    doc.setTextColor(COLORS.primaryText);
    doc.text(dateStr, MARGIN, y + 6);

    // ═══════════════════════════════════════════════════════════
    // PAGE 2 — ACT I: Discovery
    // ═══════════════════════════════════════════════════════════

    doc.addPage();
    pageNum++;
    drawBaseStudio();
    y = MARGIN + 20;

    actHeader('ACT I — Discovery');

    // ── DREAM INTENT PULL-QUOTE ──────────────────────────────
    if (blueprint.dreamIntent) {
        checkPage(40);

        doc.setFont('courier', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(COLORS.secondaryText);
        doc.text(`[ VISION ]`, MARGIN, y);
        y += 6;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(COLORS.primaryText);
        doc.setCharSpace(1.5);
        doc.text('PROJECT VISION', MARGIN, y);
        doc.setCharSpace(0);

        y += 4;
        doc.setDrawColor(COLORS.structural);
        doc.setLineWidth(0.2);
        doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
        y += 12;

        // Large italic pull-quote
        doc.setFont('times', 'italic');
        doc.setFontSize(16);
        doc.setTextColor(COLORS.primaryText);
        const quoteText = `"${blueprint.dreamIntent}"`;
        const quoteLines = doc.splitTextToSize(quoteText, CONTENT_WIDTH - 10);
        doc.text(quoteLines, MARGIN + 5, y);

        // Vertical accent bar on the left
        doc.setDrawColor(COLORS.secondaryText);
        doc.setLineWidth(0.6);
        doc.line(MARGIN, y - 4, MARGIN, y + quoteLines.length * 7);

        y += quoteLines.length * 7 + 16;
    }

    // SYS.01 Business Foundations
    editorialSection('SYS.01', 'Business Foundations', {
        'Industry Sector': blueprint.discovery?.siteTopic,
        'Primary Purpose': formatLabel(blueprint.discovery?.primaryPurpose)
    }, {
        'Secondary Objectives': blueprint.discovery?.secondaryPurposes,
        'Conversion Goals': blueprint.discovery?.conversionGoals
    });

    // Advanced Objectives (Tier 3)
    if (blueprint.discovery?.advancedObjectives) {
        const objs = blueprint.discovery.advancedObjectives;
        const objFields: Record<string, string> = {};
        Object.entries(objs).forEach(([k, v]) => {
            objFields[formatLabel(k)] = formatLabel(String(v));
        });
        editorialSection('SYS.01-B', 'Strategic Parameters', objFields);
    }

    // SYS.02 Brand Voice
    if (blueprint.discovery?.brandVoice) {
        const bv = blueprint.discovery.brandVoice;
        editorialSection('SYS.02', 'Brand Voice', {
            'Primary Tone': bv.tone,
            'Digital Presence': bv.presence,
            'Brand Personality': bv.personality,
            'Imparted Energy': bv.visitorFeeling?.energy,
            'Visitor Confidence': bv.visitorFeeling?.confidence
        });
    }

    // SYS.03 CTA Energy — with human-readable sales personality title
    editorialSection('SYS.03', 'CTA Energy', {
        'Sales Personality': SALES_PERSONALITIES[blueprint.discovery?.salesPersonality || ''] || formatLabel(blueprint.discovery?.salesPersonality || ''),
        'Primary CTA Syntax': blueprint.discovery?.ctaPrimaryLabel,
        'Strategic Approach': blueprint.discovery?.ctaStrategyNotes
    });

    // ═══════════════════════════════════════════════════════════
    // PAGE — ACT II: Architecture & Design
    // ═══════════════════════════════════════════════════════════

    doc.addPage();
    pageNum++;
    drawBaseStudio();
    y = MARGIN + 20;

    actHeader('ACT II — Architecture & Design');

    // SYS.04 Visual Style
    editorialSection('SYS.04', 'Visual Style', {
        'Aesthetic Direction': formatLabel(blueprint.design?.visualStyle || ''),
        'Imagery Composition': formatLabel(blueprint.design?.imageryStyle || '')
    });

    // ── BRAND ASSETS CATALOGUE (Tier 2) ─────────────────────
    if (blueprint.design?.brandAssets && blueprint.design.brandAssets.length > 0) {
        checkPage(40);

        doc.setFont('courier', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(COLORS.secondaryText);
        doc.text(`[ SYS.04-B ]`, MARGIN, y);
        y += 6;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(COLORS.primaryText);
        doc.setCharSpace(1.5);
        doc.text('BRAND ASSET CATALOGUE', MARGIN, y);
        doc.setCharSpace(0);

        y += 4;
        doc.setDrawColor(COLORS.structural);
        doc.setLineWidth(0.2);
        doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
        y += 10;

        blueprint.design.brandAssets.forEach((asset: any) => {
            checkPage(18);

            // Primary badge
            const prefix = asset.isPrimary ? '★  ' : '';

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(COLORS.secondaryText);
            doc.setCharSpace(1);
            doc.text(`${ASSET_TYPES[asset.type] || 'Asset'}`.toUpperCase(), MARGIN, y);
            doc.setCharSpace(0);

            doc.setFont('times', 'normal');
            doc.setFontSize(12);
            doc.setTextColor(COLORS.primaryText);
            doc.text(`${prefix}${asset.filename}`, MARGIN, y + 5);

            // File size
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(COLORS.secondaryText);
            doc.text(formatFileSize(asset.size), PAGE_WIDTH - MARGIN, y + 5, { align: 'right' });

            if (asset.notes) {
                doc.setFont('times', 'italic');
                doc.setFontSize(10);
                doc.setTextColor(COLORS.secondaryText);
                doc.text(asset.notes, MARGIN, y + 11);
                y += 20;
            } else {
                y += 14;
            }
        });

        y += 8;
    }

    // SYS.05 Typography & Motion
    editorialSection('SYS.05', 'Typography & Motion', {
        'Typographic System': formatLabel(blueprint.design?.typography_direction || ''),
        'Base Weights': formatLabel(blueprint.design?.fontWeight || ''),
        'Animation Velocity (1-10)': String(blueprint.design?.animationIntensity)
    });

    // ── CUSTOM FONT SPECIMEN (Tier 1) ───────────────────────
    if (blueprint.design?.customFonts && blueprint.design.customFonts.files.length > 0) {
        checkPage(50);

        doc.setFont('courier', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(COLORS.secondaryText);
        doc.text(`[ SYS.05-B ]`, MARGIN, y);
        y += 6;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(COLORS.primaryText);
        doc.setCharSpace(1.5);
        doc.text('UPLOADED TYPE SPECIMEN', MARGIN, y);
        doc.setCharSpace(0);

        y += 4;
        doc.setDrawColor(COLORS.structural);
        doc.setLineWidth(0.2);
        doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
        y += 10;

        // Font files
        blueprint.design.customFonts.files.forEach((font: any) => {
            checkPage(12);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(COLORS.secondaryText);
            doc.text(font.filename, MARGIN, y);

            doc.setFont('times', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(COLORS.primaryText);
            doc.text(`Weight: ${font.weight}  |  Style: ${font.style}`, MARGIN + 60, y);
            y += 8;
        });

        y += 6;

        // Role assignments
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(COLORS.secondaryText);
        doc.setCharSpace(1);
        doc.text('ROLE ASSIGNMENTS', MARGIN, y);
        doc.setCharSpace(0);
        y += 6;

        const roles = blueprint.design.customFonts.roles;
        const files = blueprint.design.customFonts.files;
        Object.entries(roles).forEach(([role, fileId]) => {
            if (!fileId) return;
            checkPage(10);
            const matchedFont = files.find((f: any) => f.id === fileId);
            const fontName = matchedFont ? matchedFont.filename : 'Unmapped';

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(COLORS.secondaryText);
            doc.text(role.toUpperCase(), MARGIN, y);

            doc.setFont('times', 'normal');
            doc.setFontSize(12);
            doc.setTextColor(COLORS.primaryText);
            doc.text(fontName, MARGIN + 25, y);
            y += 8;
        });

        y += 10;
    }

    // SYS.06 Color Palette
    editorialSection('SYS.06', 'Color Palette', {
        'Color Relationship': formatLabel(blueprint.design?.colourRelationship || ''),
        'Base Hue': `${blueprint.design?.baseHue}°`,
        'Palette Energy (1-10)': String(blueprint.design?.paletteEnergy),
        'Contrast Ratio (1-10)': String(blueprint.design?.paletteContrast)
    });

    // ── COLOR SWATCHES (Tier 1 — Visual Showpiece) ──────────
    if (blueprint.design?.generatedPalette && blueprint.design.generatedPalette.length > 0) {
        checkPage(50);

        doc.setFont('courier', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(COLORS.secondaryText);
        doc.text(`[ SYS.06-B ]`, MARGIN, y);
        y += 6;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(COLORS.primaryText);
        doc.setCharSpace(1.5);
        doc.text('COMPILED TOKENS', MARGIN, y);
        doc.setCharSpace(0);

        y += 4;
        doc.setDrawColor(COLORS.structural);
        doc.setLineWidth(0.2);
        doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
        y += 12;

        const palette = blueprint.design.generatedPalette;
        const swatchW = Math.min((CONTENT_WIDTH - (palette.length - 1) * 4) / palette.length, 28);
        let sx = MARGIN;

        // Draw horizontal swatches
        palette.forEach((swatch: any) => {
            checkPage(40);

            // Filled color rectangle
            try {
                doc.setFillColor(swatch.color);
            } catch {
                doc.setFillColor('#888888');
            }
            doc.rect(sx, y, swatchW, swatchW, 'F');

            // Subtle border
            doc.setDrawColor(COLORS.structural);
            doc.setLineWidth(0.3);
            doc.rect(sx, y, swatchW, swatchW, 'S');

            // Role label beneath
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7);
            doc.setTextColor(COLORS.secondaryText);
            doc.text(swatch.role.toUpperCase(), sx, y + swatchW + 5);

            // Hex value
            doc.setFont('courier', 'normal');
            doc.setFontSize(7);
            doc.setTextColor(COLORS.primaryText);
            doc.text(swatch.color, sx, y + swatchW + 10);

            sx += swatchW + 4;
        });

        y += swatchW + 20;
    }

    // ═══════════════════════════════════════════════════════════
    // PAGE — ACT III: Execution
    // ═══════════════════════════════════════════════════════════

    doc.addPage();
    pageNum++;
    drawBaseStudio();
    y = MARGIN + 20;

    actHeader('ACT III — Execution');

    // SYS.07 Functionality & Scope
    editorialSection('SYS.07', 'Functionality & Scope', {
        'Deployment Timeline': formatLabel(blueprint.deliver?.timeline || ''),
        'Allocated Budget': formatLabel(blueprint.deliver?.budget || '')
    }, {
        'Architectural Pages': blueprint.deliver?.pages,
        'Functional Systems': blueprint.deliver?.features
    });

    // SYS.08 Creative Risk
    editorialSection('SYS.08', 'Creative Risk', {
        'Creative Risk Tolerance (1-10)': String(blueprint.deliver?.riskTolerance)
    });

    // ── REFERENCES CATALOGUE (Tier 2) ───────────────────────
    if (blueprint.references && blueprint.references.length > 0) {
        checkPage(40);

        doc.setFont('courier', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(COLORS.secondaryText);
        doc.text(`[ SYS.09 ]`, MARGIN, y);
        y += 6;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(COLORS.primaryText);
        doc.setCharSpace(1.5);
        doc.text('REFERENCE CATALOGUE', MARGIN, y);
        doc.setCharSpace(0);

        y += 4;
        doc.setDrawColor(COLORS.structural);
        doc.setLineWidth(0.2);
        doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
        y += 10;

        blueprint.references.forEach((ref: any) => {
            checkPage(22);

            // Role label
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(COLORS.secondaryText);
            doc.setCharSpace(1);
            doc.text((REFERENCE_ROLES[ref.role] || ref.role || 'Reference').toUpperCase(), MARGIN, y);
            doc.setCharSpace(0);

            // Title / filename / URL
            doc.setFont('times', 'normal');
            doc.setFontSize(12);
            doc.setTextColor(COLORS.primaryText);
            const displayName = ref.label || ref.filename || ref.url || 'Untitled';
            doc.text(displayName, MARGIN, y + 5);

            // Type badge + URL on right
            doc.setFont('courier', 'normal');
            doc.setFontSize(7);
            doc.setTextColor(COLORS.secondaryText);
            doc.text(ref.type.toUpperCase(), PAGE_WIDTH - MARGIN, y + 5, { align: 'right' });

            // Notes
            if (ref.notes) {
                doc.setFont('times', 'italic');
                doc.setFontSize(10);
                doc.setTextColor(COLORS.secondaryText);
                const noteLines = doc.splitTextToSize(ref.notes, CONTENT_WIDTH - 5);
                doc.text(noteLines, MARGIN, y + 11);
                y += noteLines.length * 5 + 16;
            } else {
                y += 14;
            }
        });

        y += 8;
    }

    // ═══════════════════════════════════════════════════════════
    // FINAL — CTA (Perfectly Centered)
    // ═══════════════════════════════════════════════════════════

    checkPage(80);
    const centerPoint = PAGE_WIDTH / 2;

    y += 10;

    doc.setFont('courier', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(COLORS.secondaryText);
    doc.text(`[ SYS.10 ]`, centerPoint, y, { align: 'center' });
    y += 6;

    const sysTitle = 'INITIATE EXECUTION PHASE';
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(COLORS.primaryText);
    const titleSpace = 1.5;
    doc.setCharSpace(0);
    const twBase = doc.getTextWidth(sysTitle);
    const twTotal = twBase + (sysTitle.length - 1) * titleSpace;
    doc.setCharSpace(titleSpace);
    doc.text(sysTitle, centerPoint - (twTotal / 2), y);
    doc.setCharSpace(0);

    y += 4;
    doc.setDrawColor(COLORS.structural);
    doc.setLineWidth(0.2);
    doc.line(centerPoint - 20, y, centerPoint + 20, y);

    y += 15;

    doc.setFontSize(12);
    doc.setTextColor(COLORS.secondaryText);
    doc.setFont('times', 'normal');
    const closingLines = doc.splitTextToSize(
        "Your strategic parameters have been catalogued and locked. To move forward with implementation, authorize a strategy sequence below.",
        CONTENT_WIDTH - 20
    );
    closingLines.forEach((line: string) => {
        const lw = doc.getTextWidth(line);
        doc.text(line, centerPoint - (lw / 2), y);
        y += 6;
    });

    y += 10;

    const btnText = 'REQUEST STRATEGY SESSION';
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const btnSpace = 1.5;
    doc.setCharSpace(0);
    const btnWBase = doc.getTextWidth(btnText);
    const btnWTotal = btnWBase + (btnText.length - 1) * btnSpace;

    const buttonW = btnWTotal + 16;
    doc.setDrawColor(COLORS.primaryText);
    doc.setLineWidth(0.4);
    doc.rect(centerPoint - (buttonW / 2), y, buttonW, 14, 'S');

    doc.setTextColor(COLORS.primaryText);
    doc.setCharSpace(btnSpace);
    doc.text(btnText, centerPoint - (btnWTotal / 2), y + 8);
    doc.setCharSpace(0);

    doc.link(centerPoint - (buttonW / 2), y, buttonW, 14, { url: `https://cleland.studio/strategy?id=${blueprint.id}` });

    return doc;
}

const doc = buildBlueprintPdf();
fs.writeFileSync('example_blueprint.pdf', Buffer.from(doc.output('arraybuffer')));
console.log("PDF created at example_blueprint.pdf");
