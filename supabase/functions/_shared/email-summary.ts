/**
 * email-summary.ts — Blueprint Summary Card HTML Renderer
 *
 * Centralised HTML renderer for the Blueprint Summary card used in
 * both submit-blueprint and resend-email-1 edge functions.
 *
 * Uses the insight-map module for deterministic label + observation generation.
 * Follows White-Paper Editorial design tokens.
 */

import { formatSummaryData, type DiscoveryInput } from './insight-map.ts';

/**
 * Renders the Blueprint Summary card HTML for email embedding.
 * Both submit-blueprint and resend-email-1 call this to ensure identical output.
 */
export function renderSummaryCard(discovery: DiscoveryInput): string {
    const { directionLabel, goalsLabel, supportingLabel, observation } =
        formatSummaryData(discovery);

    // Build table rows
    let rows = '';

    // Row 1: Direction
    if (directionLabel && directionLabel !== 'Digital Platform') {
        rows += `
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; color: #888888; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; vertical-align: top; width: 140px;">Direction</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0; text-align: right; color: #111111; font-size: 14px;">${escapeHtml(directionLabel)}</td>
              </tr>`;
    }

    // Row 2: Conversion Focus
    if (goalsLabel && goalsLabel !== 'Not specified') {
        rows += `
              <tr>
                <td style="padding: 8px 0;${supportingLabel ? ' border-bottom: 1px solid #f0f0f0;' : ''} color: #888888; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; vertical-align: top; width: 140px;">Conversion Focus</td>
                <td style="padding: 8px 0;${supportingLabel ? ' border-bottom: 1px solid #f0f0f0;' : ''} text-align: right; color: #111111; font-size: 14px;">${escapeHtml(goalsLabel)}</td>
              </tr>`;
    }

    // Row 3: Supporting Goals (optional)
    if (supportingLabel) {
        rows += `
              <tr>
                <td style="padding: 8px 0; color: #888888; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; vertical-align: top; width: 140px;">Supporting Goals</td>
                <td style="padding: 8px 0; text-align: right; color: #111111; font-size: 14px;">${escapeHtml(supportingLabel)}</td>
              </tr>`;
    }

    // Build the full card
    return `
          <div style="padding: 24px; background: #ffffff; border: 1px solid #e5e5e5; margin-bottom: 32px;">
            <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #888888; margin: 0 0 16px 0;">
              Blueprint Summary
            </p>
            <table style="width: 100%; font-size: 14px; color: #555555; border-collapse: collapse;">
              ${rows}
            </table>
            ${observation ? `
            <p style="font-size: 14px; line-height: 1.6; color: #555555; margin: 16px 0 0 0; padding-top: 16px; border-top: 1px solid #f0f0f0;">
              ${escapeHtml(observation)}
            </p>` : ''}
          </div>`;
}

/**
 * HTML escape — duplicated here so the shared module is self-contained
 * within the edge function runtime.
 */
function escapeHtml(text: string): string {
    const map: Record<string, string> = {
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
}
