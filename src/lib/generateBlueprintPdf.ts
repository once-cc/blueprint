/**
 * Client-side PDF generation for submitted blueprints.
 *
 * Uses jspdf to programmatically build a branded PDF document
 * from the Blueprint data model. White-paper studio artifact
 * aesthetic with editorial typography and architectural precision.
 */

import { jsPDF } from 'jspdf';
import type { Blueprint, BlueprintReference, BrandAsset } from '@/types/blueprint';
import { SALES_PERSONALITIES, CONFIGURATOR_STEPS } from '@/types/blueprint';

// ── Brand Constants ────────────────────────────────────────────

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

// ── Reference Lookups ──────────────────────────────────────────

const REFERENCE_ROLES: Record<string, string> = {
    hero_reference: 'Hero Inspiration',
    layout_reference: 'Layout Reference',
    colour_reference: 'Colour Reference',
    typography_reference: 'Typography Reference',
    overall_vibe: 'Overall Vibe',
    other: 'Other',
};

const ASSET_TYPES: Record<string, string> = {
    headshot: 'Headshot',
    product: 'Product',
    portfolio: 'Portfolio',
    lifestyle: 'Lifestyle',
    campaign: 'Campaign',
    logo: 'Logo',
    background: 'Background',
    texture: 'Texture',
    other: 'Other',
    unassigned: 'Unassigned',
};

// ── Helpers ────────────────────────────────────────────────────

function formatLabel(key: string): string {
    if (!key) return '';
    return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function getSalesPersonalityTitle(id?: string): string | undefined {
    if (!id) return undefined;
    return SALES_PERSONALITIES.find((p) => p.id === id)?.title;
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── PDF Builder ────────────────────────────────────────────────

function buildBlueprintPdf(blueprint: Blueprint): { doc: jsPDF; safeBusinessName: string } {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    let pageNum = 1;
    let y = 0;

    // ── Page Infrastructure ───────────────────────────────────

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

    // ── Typography Components ─────────────────────────────────

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
    const titleStr = blueprint.businessName || 'Confidential Project';
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
    doc.text(clientName || 'Client', MARGIN, y + 6);
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

    const dateStr = new Date(blueprint.submittedAt || blueprint.createdAt || new Date()).toLocaleDateString('en-NZ', { year: 'numeric', month: 'long', day: 'numeric' });
    doc.setFont('times', 'normal');
    doc.setFontSize(14);
    doc.setTextColor(COLORS.primaryText);
    doc.text(dateStr, MARGIN, y + 6);

    // ═══════════════════════════════════════════════════════════
    // ACT I — Discovery
    // ═══════════════════════════════════════════════════════════

    doc.addPage();
    pageNum++;
    drawBaseStudio();
    y = MARGIN + 20;

    actHeader('ACT I — Discovery');

    // ── Dream Intent Pull-Quote ───────────────────────────────
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

        doc.setFont('times', 'italic');
        doc.setFontSize(16);
        doc.setTextColor(COLORS.primaryText);
        const quoteText = `"${blueprint.dreamIntent}"`;
        const quoteLines = doc.splitTextToSize(quoteText, CONTENT_WIDTH - 10);
        doc.text(quoteLines, MARGIN + 5, y);

        doc.setDrawColor(COLORS.secondaryText);
        doc.setLineWidth(0.6);
        doc.line(MARGIN, y - 4, MARGIN, y + quoteLines.length * 7);

        y += quoteLines.length * 7 + 16;
    }

    // SYS.01 — Business Foundations
    editorialSection('SYS.01', CONFIGURATOR_STEPS[0].title, {
        'Industry Sector': blueprint.discovery?.siteTopic,
        'Primary Purpose': blueprint.discovery?.primaryPurpose ? formatLabel(blueprint.discovery.primaryPurpose) : undefined,
    }, {
        'Secondary Objectives': blueprint.discovery?.secondaryPurposes,
        'Conversion Goals': blueprint.discovery?.conversionGoals,
    });

    // SYS.01-B — Advanced Objectives
    if (blueprint.discovery?.advancedObjectives) {
        const objs = blueprint.discovery.advancedObjectives;
        const objFields: Record<string, string> = {};
        Object.entries(objs).forEach(([k, v]) => {
            if (v) objFields[formatLabel(k)] = formatLabel(String(v));
        });
        if (Object.keys(objFields).length > 0) {
            editorialSection('SYS.01-B', 'Strategic Parameters', objFields);
        }
    }

    // SYS.02 — Brand Voice
    if (blueprint.discovery?.brandVoice) {
        const bv = blueprint.discovery.brandVoice;
        editorialSection('SYS.02', CONFIGURATOR_STEPS[1].title, {
            'Primary Tone': bv.tone,
            'Digital Presence': bv.presence,
            'Brand Personality': bv.personality,
            'Imparted Energy': bv.visitorFeeling?.energy,
            'Visitor Confidence': bv.visitorFeeling?.confidence,
        });
    }

    // SYS.03 — CTA Energy (with human-readable sales personality)
    editorialSection('SYS.03', CONFIGURATOR_STEPS[2].title, {
        'Sales Personality': getSalesPersonalityTitle(blueprint.discovery?.salesPersonality),
        'Primary CTA Syntax': blueprint.discovery?.ctaPrimaryLabel,
        'Strategic Approach': blueprint.discovery?.ctaStrategyNotes,
    });

    // ═══════════════════════════════════════════════════════════
    // ACT II — Architecture & Design
    // ═══════════════════════════════════════════════════════════

    doc.addPage();
    pageNum++;
    drawBaseStudio();
    y = MARGIN + 20;

    actHeader('ACT II — Architecture & Design');

    // SYS.04 — Visual Style
    editorialSection('SYS.04', CONFIGURATOR_STEPS[3].title, {
        'Aesthetic Direction': blueprint.design?.visualStyle ? formatLabel(blueprint.design.visualStyle) : undefined,
        'Imagery Composition': blueprint.design?.imageryStyle ? formatLabel(blueprint.design.imageryStyle) : undefined,
    });

    // SYS.04-B — Brand Asset Catalogue
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

        blueprint.design.brandAssets.forEach((asset: BrandAsset) => {
            checkPage(18);

            const prefix = asset.isPrimary ? '★  ' : '';

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(COLORS.secondaryText);
            doc.setCharSpace(1);
            doc.text((ASSET_TYPES[asset.type] || 'Asset').toUpperCase(), MARGIN, y);
            doc.setCharSpace(0);

            doc.setFont('times', 'normal');
            doc.setFontSize(12);
            doc.setTextColor(COLORS.primaryText);
            doc.text(`${prefix}${asset.filename}`, MARGIN, y + 5);

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

    // SYS.05 — Typography & Motion
    editorialSection('SYS.05', CONFIGURATOR_STEPS[4].title, {
        'Typographic System': blueprint.design?.typography_direction ? formatLabel(blueprint.design.typography_direction) : undefined,
        'Base Weights': blueprint.design?.fontWeight ? formatLabel(blueprint.design.fontWeight) : undefined,
        'Animation Velocity (1-10)': blueprint.design?.animationIntensity !== undefined ? String(blueprint.design.animationIntensity) : undefined,
    });

    // SYS.05-B — Custom Font Specimen
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

        blueprint.design.customFonts.files.forEach((font) => {
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
            const matchedFont = files.find((f) => f.id === fileId);
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

    // SYS.06 — Color Palette
    editorialSection('SYS.06', CONFIGURATOR_STEPS[5].title, {
        'Color Relationship': blueprint.design?.colourRelationship ? formatLabel(blueprint.design.colourRelationship) : undefined,
        'Base Hue': blueprint.design?.baseHue !== undefined ? `${blueprint.design.baseHue}°` : undefined,
        'Palette Energy (1-10)': blueprint.design?.paletteEnergy !== undefined ? String(blueprint.design.paletteEnergy) : undefined,
        'Contrast Ratio (1-10)': blueprint.design?.paletteContrast !== undefined ? String(blueprint.design.paletteContrast) : undefined,
    });

    // SYS.06-B — Visual Color Swatches
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

        if (palette.length === 7) {
            // Adopt the 3-row layout from the configurator UI
            const row1 = [palette[2], palette[3], palette[4], palette[5]]; // Foregrounds & Accents
            const row2 = [palette[0], palette[1], palette[6]]; // Backgrounds & Border

            const swatchW = 18;
            const swatchH = 18;
            const rx = Math.min(swatchW / 4, 4); // rounded border

            const renderSwatch = (swatch: typeof palette[0], sx: number, sy: number) => {
                try { doc.setFillColor(swatch.color); } catch { doc.setFillColor('#888888'); }
                if (typeof doc.roundedRect === 'function') {
                    doc.roundedRect(sx, sy, swatchW, swatchH, rx, rx, 'F');
                    doc.setDrawColor(COLORS.structural); doc.setLineWidth(0.3);
                    doc.roundedRect(sx, sy, swatchW, swatchH, rx, rx, 'S');
                } else {
                    doc.rect(sx, sy, swatchW, swatchH, 'F');
                    doc.setDrawColor(COLORS.structural); doc.setLineWidth(0.3);
                    doc.rect(sx, sy, swatchW, swatchH, 'S');
                }

                const roleStr = swatch.role.replace(/_/g, ' ').toLowerCase();
                doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(COLORS.primaryText);
                const roleWidth = doc.getTextWidth(roleStr);
                doc.text(roleStr, sx + (swatchW / 2) - (roleWidth / 2), sy + swatchH + 6);

                const hexStr = swatch.color.toUpperCase();
                doc.setFont('courier', 'normal'); doc.setFontSize(7); doc.setTextColor(COLORS.secondaryText);
                const hexWidth = doc.getTextWidth(hexStr);
                doc.text(hexStr, sx + (swatchW / 2) - (hexWidth / 2), sy + swatchH + 11);
            };

            // Top Row (4 items)
            const row1Spacing = 16;
            const row1Width = (4 * swatchW) + (3 * row1Spacing);
            let startX1 = (PAGE_WIDTH / 2) - (row1Width / 2);
            row1.forEach((swatch) => { renderSwatch(swatch, startX1, y); startX1 += swatchW + row1Spacing; });

            y += swatchH + 20;

            // Middle Row (3 items)
            const row2Spacing = 24; // slightly wider spread for 3 items
            const row2Width = (3 * swatchW) + (2 * row2Spacing);
            let startX2 = (PAGE_WIDTH / 2) - (row2Width / 2);
            row2.forEach((swatch) => { renderSwatch(swatch, startX2, y); startX2 += swatchW + row2Spacing; });

            y += swatchH + 20;

            // Bottom Strip (7 joined colors)
            const stripW = CONTENT_WIDTH;
            const stripH = 8;
            const segmentW = stripW / 7;
            let stripX = MARGIN;

            palette.forEach((swatch) => {
                try { doc.setFillColor(swatch.color); } catch { doc.setFillColor('#888888'); }
                doc.rect(stripX, y, segmentW, stripH, 'F');
                stripX += segmentW;
            });

            doc.setDrawColor(COLORS.structural); doc.setLineWidth(0.3);
            doc.rect(MARGIN, y, stripW, stripH, 'S');

            y += stripH + 20;

        } else {
            // Fallback for custom palette counts
            const swatchW = Math.min((CONTENT_WIDTH - (palette.length - 1) * 4) / palette.length, 28);
            let sx = MARGIN;

            palette.forEach((swatch) => {
                try { doc.setFillColor(swatch.color); } catch { doc.setFillColor('#888888'); }
                if (typeof doc.roundedRect === 'function') {
                    doc.roundedRect(sx, y, swatchW, swatchW, 3, 3, 'F');
                } else {
                    doc.rect(sx, y, swatchW, swatchW, 'F');
                }

                doc.setDrawColor(COLORS.structural); doc.setLineWidth(0.3);

                if (typeof doc.roundedRect === 'function') {
                    doc.roundedRect(sx, y, swatchW, swatchW, 3, 3, 'S');
                } else {
                    doc.rect(sx, y, swatchW, swatchW, 'S');
                }

                doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(COLORS.secondaryText);
                doc.text(swatch.role.toUpperCase(), sx, y + swatchW + 5);

                doc.setFont('courier', 'normal'); doc.setFontSize(7); doc.setTextColor(COLORS.primaryText);
                doc.text(swatch.color, sx, y + swatchW + 10);

                sx += swatchW + 4;
            });

            y += swatchW + 20;
        }
    }

    // ═══════════════════════════════════════════════════════════
    // ACT III — Execution
    // ═══════════════════════════════════════════════════════════

    doc.addPage();
    pageNum++;
    drawBaseStudio();
    y = MARGIN + 20;

    actHeader('ACT III — Execution');

    // SYS.07 — Functionality & Scope
    editorialSection('SYS.07', CONFIGURATOR_STEPS[6].title, {
        'Deployment Timeline': blueprint.deliver?.timeline ? formatLabel(blueprint.deliver.timeline) : undefined,
        'Allocated Budget': blueprint.deliver?.budget ? formatLabel(blueprint.deliver.budget) : undefined,
    }, {
        'Architectural Pages': blueprint.deliver?.pages,
        'Functional Systems': blueprint.deliver?.features,
    });

    // SYS.08 — Creative Risk
    editorialSection('SYS.08', CONFIGURATOR_STEPS[7].title, {
        'Creative Risk Tolerance (1-10)': blueprint.deliver?.riskTolerance !== undefined ? String(blueprint.deliver.riskTolerance) : undefined,
    });

    // SYS.09 — Reference Catalogue
    const refs = blueprint.references as unknown as BlueprintReference[] | undefined;
    if (refs && refs.length > 0) {
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

        refs.forEach((ref) => {
            checkPage(22);

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(COLORS.secondaryText);
            doc.setCharSpace(1);
            doc.text((REFERENCE_ROLES[ref.role || ''] || ref.role || 'Reference').toUpperCase(), MARGIN, y);
            doc.setCharSpace(0);

            doc.setFont('times', 'normal');
            doc.setFontSize(12);
            doc.setTextColor(COLORS.primaryText);
            const displayName = ref.label || ref.filename || ref.url || 'Untitled';
            doc.text(displayName, MARGIN, y + 5);

            doc.setFont('courier', 'normal');
            doc.setFontSize(7);
            doc.setTextColor(COLORS.secondaryText);
            doc.text(ref.type.toUpperCase(), PAGE_WIDTH - MARGIN, y + 5, { align: 'right' });

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
    // Final — CTA (Perfectly Centered)
    // ═══════════════════════════════════════════════════════════

    checkPage(80);
    const centerPoint = PAGE_WIDTH / 2;

    y += 10;

    doc.setFont('courier', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(COLORS.secondaryText);
    doc.text(`[ SYS.10 ]`, centerPoint, y, { align: 'center' });
    y += 6;

    const sysTitle = 'INITIATE NEXT PHASE';
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
        'Your blueprint captures the strategic direction for what comes next. To explore this further with our team, request a clarity call below.',
        CONTENT_WIDTH - 20
    );
    closingLines.forEach((line: string) => {
        const lw = doc.getTextWidth(line);
        doc.text(line, centerPoint - (lw / 2), y);
        y += 6;
    });

    y += 10;

    const btnText = 'REQUEST CLARITY CALL';
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

    doc.link(centerPoint - (buttonW / 2), y, buttonW, 14, { url: `https://crafted.cleland.studio/clarity?id=${blueprint.id}` });

    return {
        doc,
        safeBusinessName: blueprint.businessName
            ? blueprint.businessName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()
            : 'blueprint',
    };
}

/**
 * Generate and download the PDF to the user's device.
 */
export function generateBlueprintPdf(blueprint: Blueprint): void {
    const { doc, safeBusinessName } = buildBlueprintPdf(blueprint);
    const filename = `crafted-blueprint-${safeBusinessName}.pdf`;
    doc.save(filename);
}

/**
 * Generate the PDF and return it as a Blob for upload to storage.
 */
export function generateBlueprintPdfBlob(blueprint: Blueprint): { blob: Blob; filename: string } {
    const { doc, safeBusinessName } = buildBlueprintPdf(blueprint);
    const filename = `crafted-blueprint-${safeBusinessName}.pdf`;
    const blob = doc.output('blob');
    return { blob, filename };
}
