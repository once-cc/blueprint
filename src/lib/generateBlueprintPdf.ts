/**
 * Client-side PDF generation for submitted blueprints.
 *
 * Uses jspdf to programmatically build a branded PDF document
 * from the Blueprint data model. No html2canvas needed —
 * everything is drawn via the jspdf API for crisp results.
 */

import { jsPDF } from 'jspdf';
import type { Blueprint } from '@/types/blueprint';
import { SALES_PERSONALITIES, CONFIGURATOR_STEPS } from '@/types/blueprint';

// ── Brand Constants ────────────────────────────────────────────

const COLORS = {
    bg: '#0a0a0f',
    gold: '#d4a853',
    goldLight: '#e8c97a',
    white: '#f5f5f5',
    muted: '#9ca3af',
    subtle: '#6b7280',
    border: '#1f2937',
} as const;

const MARGIN = 20;
const PAGE_WIDTH = 210; // A4 mm
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

// ── Helpers ────────────────────────────────────────────────────

function formatLabel(key: string): string {
    return key
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

function getSalesPersonalityTitle(id?: string): string | undefined {
    if (!id) return undefined;
    return SALES_PERSONALITIES.find((p) => p.id === id)?.title;
}

// ── PDF Builder ────────────────────────────────────────────────

function buildBlueprintPdf(blueprint: Blueprint): { doc: jsPDF; safeBusinessName: string } {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    let y = 0;

    // ── Page background ─────────────────────────────────────
    function drawPageBg() {
        doc.setFillColor(COLORS.bg);
        doc.rect(0, 0, 210, 297, 'F');
    }

    function checkPage(needed: number) {
        if (y + needed > 275) {
            doc.addPage();
            drawPageBg();
            y = MARGIN;
        }
    }

    // ── Typography helpers ──────────────────────────────────
    function heading(text: string, size = 16) {
        checkPage(20);
        doc.setFontSize(size);
        doc.setTextColor(COLORS.gold);
        doc.setFont('helvetica', 'bold');
        doc.text(text, MARGIN, y);
        y += size * 0.5 + 4;
    }

    function subheading(text: string) {
        checkPage(14);
        doc.setFontSize(11);
        doc.setTextColor(COLORS.white);
        doc.setFont('helvetica', 'bold');
        doc.text(text, MARGIN, y);
        y += 7;
    }

    function bodyText(label: string, value: string | number | undefined | null) {
        if (value === undefined || value === null || value === '') return;
        checkPage(10);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(COLORS.muted);
        doc.text(`${label}:`, MARGIN, y);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(COLORS.white);
        const labelWidth = doc.getTextWidth(`${label}: `);
        const valueStr = String(value);
        const lines = doc.splitTextToSize(valueStr, CONTENT_WIDTH - labelWidth - 2);
        doc.text(lines, MARGIN + labelWidth + 1, y);
        y += lines.length * 4.5 + 2;
    }

    function listItems(label: string, items: string[] | undefined) {
        if (!items || items.length === 0) return;
        checkPage(10);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(COLORS.muted);
        doc.text(`${label}:`, MARGIN, y);
        y += 5;

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(COLORS.white);
        items.forEach((item) => {
            checkPage(6);
            doc.text(`•  ${formatLabel(item)}`, MARGIN + 4, y);
            y += 4.5;
        });
        y += 2;
    }

    function divider() {
        checkPage(8);
        y += 3;
        doc.setDrawColor(COLORS.border);
        doc.setLineWidth(0.3);
        doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
        y += 6;
    }

    // ═══════════════════════════════════════════════════════════
    // PAGE 1 — Cover
    // ═══════════════════════════════════════════════════════════

    drawPageBg();

    // Gold accent line at top
    doc.setFillColor(COLORS.gold);
    doc.rect(0, 0, 210, 1.5, 'F');

    // Title
    y = 80;
    doc.setFontSize(32);
    doc.setTextColor(COLORS.gold);
    doc.setFont('helvetica', 'bold');
    doc.text('Crafted Blueprint', MARGIN, y);
    y += 16;

    // Subtitle
    doc.setFontSize(12);
    doc.setTextColor(COLORS.muted);
    doc.setFont('helvetica', 'normal');
    doc.text('Strategic Web Project Blueprint', MARGIN, y);
    y += 20;

    // Client info
    const clientName = [blueprint.firstName, blueprint.lastName].filter(Boolean).join(' ');
    if (clientName) {
        doc.setFontSize(11);
        doc.setTextColor(COLORS.white);
        doc.setFont('helvetica', 'bold');
        doc.text(clientName, MARGIN, y);
        y += 7;
    }
    if (blueprint.businessName) {
        doc.setFontSize(10);
        doc.setTextColor(COLORS.muted);
        doc.setFont('helvetica', 'normal');
        doc.text(blueprint.businessName, MARGIN, y);
        y += 7;
    }
    if (blueprint.userEmail) {
        doc.setFontSize(9);
        doc.setTextColor(COLORS.subtle);
        doc.text(blueprint.userEmail, MARGIN, y);
        y += 7;
    }

    y += 10;
    divider();

    // Metadata
    bodyText('Generated', new Date().toLocaleDateString('en-NZ', { year: 'numeric', month: 'long', day: 'numeric' }));
    bodyText('Blueprint ID', blueprint.id);
    if (blueprint.dreamIntent) {
        y += 5;
        bodyText('Dream Intent', blueprint.dreamIntent);
    }

    // Footer branding
    doc.setFontSize(8);
    doc.setTextColor(COLORS.subtle);
    doc.text('Cleland Studio · cleland.studio', MARGIN, 285);
    doc.setFillColor(COLORS.gold);
    doc.rect(0, 295.5, 210, 1.5, 'F');

    // ═══════════════════════════════════════════════════════════
    // PAGE 2+ — Discovery (Act I)
    // ═══════════════════════════════════════════════════════════

    doc.addPage();
    drawPageBg();
    y = MARGIN;

    heading('Act I — Discovery', 18);
    y += 4;

    // Step 1: Business Foundations
    subheading(CONFIGURATOR_STEPS[0].title);
    bodyText('Industry', blueprint.discovery?.siteTopic);
    bodyText('Primary Purpose', blueprint.discovery?.primaryPurpose ? formatLabel(blueprint.discovery.primaryPurpose) : undefined);
    listItems('Secondary Purposes', blueprint.discovery?.secondaryPurposes?.map(formatLabel));
    listItems('Conversion Goals', blueprint.discovery?.conversionGoals?.map(formatLabel));

    if (blueprint.discovery?.advancedObjectives) {
        const objs = blueprint.discovery.advancedObjectives;
        Object.entries(objs).forEach(([key, val]) => {
            if (val) bodyText(formatLabel(key), formatLabel(val));
        });
    }

    divider();

    // Step 2: Brand Voice
    subheading(CONFIGURATOR_STEPS[1].title);
    if (blueprint.discovery?.brandVoice) {
        const bv = blueprint.discovery.brandVoice;
        bodyText('Tone', bv.tone);
        bodyText('Presence', bv.presence);
        bodyText('Personality', bv.personality);
        if (bv.visitorFeeling) {
            bodyText('Visitor Energy', bv.visitorFeeling.energy);
            bodyText('Visitor Confidence', bv.visitorFeeling.confidence);
        }
    }
    // Legacy fallbacks
    bodyText('Brand Archetype', blueprint.discovery?.brandArchetype ? formatLabel(blueprint.discovery.brandArchetype) : undefined);
    listItems('Personality Tags', blueprint.discovery?.personalityTags);
    listItems('Target Feelings', blueprint.discovery?.targetFeelings);

    divider();

    // Step 3: CTA Energy
    subheading(CONFIGURATOR_STEPS[2].title);
    bodyText('Sales Personality', getSalesPersonalityTitle(blueprint.discovery?.salesPersonality));
    bodyText('Primary CTA Label', blueprint.discovery?.ctaPrimaryLabel);
    bodyText('Strategy Notes', blueprint.discovery?.ctaStrategyNotes);

    // ═══════════════════════════════════════════════════════════
    // Design (Act II)
    // ═══════════════════════════════════════════════════════════

    doc.addPage();
    drawPageBg();
    y = MARGIN;

    heading('Act II — Design', 18);
    y += 4;

    // Step 4: Visual Style
    subheading(CONFIGURATOR_STEPS[3].title);
    bodyText('Visual Style', blueprint.design?.visualStyle ? formatLabel(blueprint.design.visualStyle) : undefined);
    bodyText('Imagery Style', blueprint.design?.imageryStyle ? formatLabel(blueprint.design.imageryStyle) : undefined);

    divider();

    // Step 5: Typography & Motion
    subheading(CONFIGURATOR_STEPS[4].title);
    bodyText('Typography Direction', blueprint.design?.typography_direction ? formatLabel(blueprint.design.typography_direction) : undefined);
    bodyText('Font Weight', blueprint.design?.fontWeight ? formatLabel(blueprint.design.fontWeight) : undefined);
    bodyText('Animation Intensity', blueprint.design?.animationIntensity ? `${blueprint.design.animationIntensity}/10` : undefined);

    divider();

    // Step 6: Color Palette
    subheading(CONFIGURATOR_STEPS[5].title);
    bodyText('Colour Relationship', blueprint.design?.colourRelationship ? formatLabel(blueprint.design.colourRelationship) : undefined);
    bodyText('Base Hue', blueprint.design?.baseHue !== undefined ? `${blueprint.design.baseHue}°` : undefined);
    bodyText('Palette Energy', blueprint.design?.paletteEnergy ? `${blueprint.design.paletteEnergy}/10` : undefined);
    bodyText('Palette Contrast', blueprint.design?.paletteContrast ? `${blueprint.design.paletteContrast}/10` : undefined);

    // Color swatches if available
    if (blueprint.design?.generatedPalette && blueprint.design.generatedPalette.length > 0) {
        checkPage(20);
        y += 2;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(COLORS.muted);
        doc.text('Generated Palette:', MARGIN, y);
        y += 6;

        blueprint.design.generatedPalette.forEach((swatch) => {
            checkPage(10);
            // Draw colour swatch
            try {
                doc.setFillColor(swatch.color);
                doc.roundedRect(MARGIN + 4, y - 3, 8, 8, 1, 1, 'F');
            } catch {
                // Invalid colour — draw a placeholder
                doc.setFillColor(COLORS.border);
                doc.roundedRect(MARGIN + 4, y - 3, 8, 8, 1, 1, 'F');
            }

            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(COLORS.white);
            doc.text(`${swatch.role}`, MARGIN + 16, y);
            doc.setTextColor(COLORS.subtle);
            doc.text(swatch.color, MARGIN + 16 + doc.getTextWidth(swatch.role + '  '), y);
            y += 8;
        });
    }

    // ═══════════════════════════════════════════════════════════
    // Deliver (Act III)
    // ═══════════════════════════════════════════════════════════

    doc.addPage();
    drawPageBg();
    y = MARGIN;

    heading('Act III — Deliver', 18);
    y += 4;

    // Step 7: Functionality & Scope
    subheading(CONFIGURATOR_STEPS[6].title);
    listItems('Pages', blueprint.deliver?.pages);
    listItems('Features', blueprint.deliver?.features);
    bodyText('Timeline', blueprint.deliver?.timeline ? formatLabel(blueprint.deliver.timeline) : undefined);
    bodyText('Budget', blueprint.deliver?.budget ? formatLabel(blueprint.deliver.budget) : undefined);

    divider();

    // Step 8: Creative Risk
    subheading(CONFIGURATOR_STEPS[7].title);
    bodyText('Risk Tolerance', blueprint.deliver?.riskTolerance ? `${blueprint.deliver.riskTolerance}/10` : undefined);

    // ═══════════════════════════════════════════════════════════
    // Final page — footer
    // ═══════════════════════════════════════════════════════════

    y += 20;
    divider();
    y += 5;

    doc.setFontSize(11);
    doc.setTextColor(COLORS.gold);
    doc.setFont('helvetica', 'bold');
    doc.text('Thank you for creating your Blueprint.', MARGIN, y);
    y += 8;

    doc.setFontSize(9);
    doc.setTextColor(COLORS.muted);
    doc.setFont('helvetica', 'normal');
    const closingLines = doc.splitTextToSize(
        "Our team will review your Blueprint and prepare a personalised strategy. You\u2019ll hear from us within 24 hours.",
        CONTENT_WIDTH
    );
    doc.text(closingLines, MARGIN, y);
    y += closingLines.length * 4.5 + 10;

    doc.setFontSize(9);
    doc.setTextColor(COLORS.subtle);
    doc.text('blueprints@cleland.studio  ·  cleland.studio', MARGIN, y);

    return {
        doc, safeBusinessName: blueprint.businessName
            ? blueprint.businessName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()
            : 'blueprint'
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
