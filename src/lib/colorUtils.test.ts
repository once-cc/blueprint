import { describe, it, expect } from 'vitest';
import {
    hslToHex,
    hexToHue,
    hexToHslData,
    generatePalette,
    energyToZone,
    zoneToEnergy,
    contrastToZone,
    zoneToContrast,
} from './colorUtils';

describe('colorUtils.ts - Color Conversion & Palette Generation', () => {

    describe('hslToHex', () => {
        it('converts pure red (0, 100, 50) correctly', () => {
            expect(hslToHex(0, 100, 50)).toBe('#ff0000');
        });

        it('converts pure white (0, 0, 100) correctly', () => {
            expect(hslToHex(0, 0, 100)).toBe('#ffffff');
        });

        it('converts pure black (0, 0, 0) correctly', () => {
            expect(hslToHex(0, 0, 0)).toBe('#000000');
        });

        it('converts a mid-range blue correctly', () => {
            const hex = hslToHex(240, 100, 50);
            expect(hex).toBe('#0000ff');
        });
    });

    describe('hexToHue', () => {
        it('extracts hue from pure red', () => {
            expect(hexToHue('#ff0000')).toBe(0);
        });

        it('extracts hue from pure green', () => {
            expect(hexToHue('#00ff00')).toBe(120);
        });

        it('handles shorthand 3-char hex', () => {
            expect(hexToHue('#f00')).toBe(0); // red shorthand
        });

        it('returns null for invalid hex', () => {
            expect(hexToHue('not-a-hex')).toBeNull();
            expect(hexToHue('#xyz')).toBeNull();
        });
    });

    describe('hexToHslData', () => {
        it('converts pure red to HSL data', () => {
            const result = hexToHslData('#ff0000');
            expect(result).toEqual({ h: 0, s: 100, l: 50 });
        });

        it('converts a grey to HSL (no saturation)', () => {
            const result = hexToHslData('#808080');
            expect(result).toEqual({ h: 0, s: 0, l: 50 });
        });

        it('returns null for invalid hex', () => {
            expect(hexToHslData('invalid')).toBeNull();
        });
    });

    describe('energyToZone / zoneToEnergy', () => {
        it('maps energy values to correct zone labels', () => {
            expect(energyToZone(1)).toBe('Calm');
            expect(energyToZone(3)).toBe('Gentle');
            expect(energyToZone(5)).toBe('Balanced');
            expect(energyToZone(7)).toBe('Vibrant');
            expect(energyToZone(10)).toBe('Energetic');
        });

        it('round-trips zone labels back to energy values', () => {
            expect(zoneToEnergy('Calm')).toBe(2);
            expect(zoneToEnergy('Energetic')).toBe(10);
        });

        it('returns default for unknown zones', () => {
            expect(zoneToEnergy('Unknown')).toBe(5);
        });
    });

    describe('contrastToZone / zoneToContrast', () => {
        it('maps contrast values to correct zone labels', () => {
            expect(contrastToZone(1)).toBe('Subtle');
            expect(contrastToZone(5)).toBe('Balanced');
            expect(contrastToZone(9)).toBe('Bold');
        });

        it('round-trips zone labels back to contrast values', () => {
            expect(zoneToContrast('Subtle')).toBe(2);
            expect(zoneToContrast('Bold')).toBe(10);
        });
    });

    describe('generatePalette', () => {
        it('generates 7 color roles for monochrome relationship', () => {
            const palette = generatePalette('monochrome', 200, 5, 5);
            expect(palette).toHaveLength(7);

            const roles = palette.map(p => p.role);
            expect(roles).toContain('background_primary');
            expect(roles).toContain('foreground_primary');
            expect(roles).toContain('accent_primary');
            expect(roles).toContain('border');
        });

        it('generates valid hex colors for every relationship type', () => {
            const relationships = ['monochrome', 'analogous', 'complementary', 'split_complementary', 'triadic'];

            for (const rel of relationships) {
                const palette = generatePalette(rel, 180, 6, 6);
                expect(palette.length).toBeGreaterThan(0);
                for (const entry of palette) {
                    expect(entry.color).toMatch(/^#[0-9a-f]{6}$/);
                }
            }
        });

        it('returns an empty array for an unknown relationship', () => {
            const palette = generatePalette('nonexistent', 100, 5, 5);
            expect(palette).toEqual([]);
        });

        it('produces different accent colors for complementary vs monochrome', () => {
            const mono = generatePalette('monochrome', 0, 7, 7);
            const comp = generatePalette('complementary', 0, 7, 7);

            const monoAccent = mono.find(p => p.role === 'accent_primary')?.color;
            const compAccent = comp.find(p => p.role === 'accent_primary')?.color;

            expect(monoAccent).not.toBe(compAccent);
        });
    });

});
