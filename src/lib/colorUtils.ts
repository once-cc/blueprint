export const ENERGY_ZONES = ['Calm', 'Gentle', 'Balanced', 'Vibrant', 'Energetic'] as const;

export function energyToZone(value: number): string {
    if (value <= 2) return 'Calm';
    if (value <= 4) return 'Gentle';
    if (value <= 6) return 'Balanced';
    if (value <= 8) return 'Vibrant';
    return 'Energetic';
}

export function zoneToEnergy(zone: string): number {
    const map: Record<string, number> = { Calm: 2, Gentle: 4, Balanced: 6, Vibrant: 8, Energetic: 10 };
    return map[zone] || 5;
}

export const CONTRAST_ZONES = ['Subtle', 'Soft', 'Balanced', 'Strong', 'Bold'] as const;

export function contrastToZone(value: number): string {
    if (value <= 2) return 'Subtle';
    if (value <= 4) return 'Soft';
    if (value <= 6) return 'Balanced';
    if (value <= 8) return 'Strong';
    return 'Bold';
}

export function zoneToContrast(zone: string): number {
    const map: Record<string, number> = { Subtle: 2, Soft: 4, Balanced: 6, Strong: 8, Bold: 10 };
    return map[zone] || 5;
}

export const colourRelationships = [
    {
        value: 'monochrome',
        label: 'Monochrome',
        description: 'Single hue, tonal depth, calm and editorial',
        angle: 0,
    },
    {
        value: 'analogous',
        label: 'Analogous',
        description: 'Adjacent hues, harmonious and natural',
        angle: 30,
    },
    {
        value: 'complementary',
        label: 'Complementary',
        description: 'Opposite hues, high impact and vibrant',
        angle: 180,
    },
    {
        value: 'split_complementary',
        label: 'Split Complementary',
        description: 'High contrast with less tension',
        angle: 150,
    },
    {
        value: 'triadic',
        label: 'Triadic',
        description: 'Evenly spaced hues, dynamic and balanced',
        angle: 120,
    }
];

export const aestheticBaseHues: Record<string, number> = {
    minimal: 0,
    dark_cinematic: 240,
    urban: 30,
    luxury: 45,
    playful: 300,
    tech: 200,
};

export function hslToHex(h: number, s: number, l: number): string {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = (n: number) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}

export function hexToHue(hex: string): number | null {
    const cleanHex = hex.replace('#', '').trim();
    if (!/^[0-9A-Fa-f]{6}$/.test(cleanHex) && !/^[0-9A-Fa-f]{3}$/.test(cleanHex)) return null;

    const fullHex = cleanHex.length === 3 ? cleanHex.split('').map(c => c + c).join('') : cleanHex;
    const r = parseInt(fullHex.slice(0, 2), 16) / 255;
    const g = parseInt(fullHex.slice(2, 4), 16) / 255;
    const b = parseInt(fullHex.slice(4, 6), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    let h = 0;
    if (delta !== 0) {
        if (max === r) h = ((g - b) / delta) + (g < b ? 6 : 0);
        else if (max === g) h = (b - r) / delta + 2;
        else h = (r - g) / delta + 4;
        h /= 6;
    }
    return Math.round(h * 360);
}

export function hexToHslData(hex: string): { h: number, s: number, l: number } | null {
    const cleanHex = hex.replace('#', '').trim();
    if (!/^[0-9A-Fa-f]{6}$/.test(cleanHex) && !/^[0-9A-Fa-f]{3}$/.test(cleanHex)) return null;

    const fullHex = cleanHex.length === 3 ? cleanHex.split('').map(c => c + c).join('') : cleanHex;
    const r = parseInt(fullHex.slice(0, 2), 16) / 255;
    const g = parseInt(fullHex.slice(2, 4), 16) / 255;
    const b = parseInt(fullHex.slice(4, 6), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    let h = 0, s = 0;
    const l = (max + min) / 2;

    if (delta !== 0) {
        s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
        if (max === r) h = ((g - b) / delta) + (g < b ? 6 : 0);
        else if (max === g) h = (b - r) / delta + 2;
        else h = (r - g) / delta + 4;
        h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function generatePalette(
    relationship: string,
    customBaseHue: number,
    energy: number,
    contrast: number
): { role: string; color: string }[] {
    const saturation = 10 + (energy * 8); // energy 2 -> 26, energy 10 -> 90

    // Contrast modifiers scaling Lightness values across the system
    const fgLightnessBase = 25 - (contrast * 1.5); // contrast 2 = 22, contrast 10 = 10
    const fgLightnessSec = 50 - (contrast * 2); // contrast 2 = 46, contrast 10 = 30

    const accLightnessPrimary = Math.max(20, 55 - (contrast * 2)); // contrast 2 = 51, contrast 10 = 35
    const accLightnessSec = Math.min(80, 40 + (contrast * 2)); // contrast 2 = 44, contrast 10 = 60

    // Backgrounds get slightly closer to pure white at higher contrast
    const bgPrimaryLight = 96 + (contrast * 0.3); // contrast 2 = 96.6, contrast 10 = 99
    const bgSecLight = 93 + (contrast * 0.3); // contrast 2 = 93.6, contrast 10 = 96

    const borderLight = 80 + (contrast * 0.5); // contrast 2 = 81, const 10 = 85

    const h = customBaseHue;
    const isMinimal = saturation < 20;

    let roles: { role: string; color: string }[] = [];

    switch (relationship) {
        case 'monochrome':
            roles = [
                { role: 'background_primary', color: hslToHex(h, isMinimal ? 5 : saturation * 0.2, bgPrimaryLight) },
                { role: 'background_secondary', color: hslToHex(h, isMinimal ? 8 : saturation * 0.3, bgSecLight) },
                { role: 'foreground_primary', color: hslToHex(h, saturation * 0.8, fgLightnessBase) },
                { role: 'foreground_secondary', color: hslToHex(h, saturation * 0.6, fgLightnessSec) },
                { role: 'accent_primary', color: hslToHex(h, saturation, accLightnessPrimary) },
                { role: 'accent_secondary', color: hslToHex(h, saturation * 0.6, accLightnessSec) },
                { role: 'border', color: hslToHex(h, saturation * 0.4, borderLight) },
            ];
            break;

        case 'analogous':
            roles = [
                { role: 'background_primary', color: hslToHex(h, saturation * 0.2, bgPrimaryLight) },
                { role: 'background_secondary', color: hslToHex(h, saturation * 0.3, bgSecLight) },
                { role: 'foreground_primary', color: hslToHex(h, saturation * 0.8, fgLightnessBase) },
                { role: 'foreground_secondary', color: hslToHex((h + 30) % 360, saturation * 0.6, fgLightnessSec) },
                { role: 'accent_primary', color: hslToHex((h + 30) % 360, saturation, accLightnessPrimary) },
                { role: 'accent_secondary', color: hslToHex((h - 30 + 360) % 360, saturation, accLightnessSec) },
                { role: 'border', color: hslToHex(h, saturation * 0.4, borderLight) },
            ];
            break;

        case 'complementary':
            roles = [
                { role: 'background_primary', color: hslToHex(h, saturation * 0.1, bgPrimaryLight) },
                { role: 'background_secondary', color: hslToHex(h, saturation * 0.2, bgSecLight) },
                { role: 'foreground_primary', color: hslToHex(h, saturation * 0.7, fgLightnessBase) },
                { role: 'foreground_secondary', color: hslToHex(h, saturation * 0.5, fgLightnessSec + 5) },
                { role: 'accent_primary', color: hslToHex((h + 180) % 360, saturation, accLightnessPrimary) },
                { role: 'accent_secondary', color: hslToHex((h + 180) % 360, saturation * 0.7, accLightnessSec) },
                { role: 'border', color: hslToHex(h, saturation * 0.3, borderLight) },
            ];
            break;

        case 'split_complementary':
            roles = [
                { role: 'background_primary', color: hslToHex(h, saturation * 0.15, bgPrimaryLight) },
                { role: 'background_secondary', color: hslToHex(h, saturation * 0.25, bgSecLight) },
                { role: 'foreground_primary', color: hslToHex(h, saturation * 0.8, fgLightnessBase) },
                { role: 'foreground_secondary', color: hslToHex(h, saturation * 0.5, fgLightnessSec) },
                { role: 'accent_primary', color: hslToHex((h + 150) % 360, saturation, accLightnessPrimary) },
                { role: 'accent_secondary', color: hslToHex((h + 210) % 360, saturation, accLightnessSec) },
                { role: 'border', color: hslToHex(h, saturation * 0.3, borderLight) },
            ];
            break;

        case 'triadic':
            roles = [
                { role: 'background_primary', color: hslToHex(h, saturation * 0.15, bgPrimaryLight) },
                { role: 'background_secondary', color: hslToHex(h, saturation * 0.25, bgSecLight) },
                { role: 'foreground_primary', color: hslToHex(h, saturation * 0.8, fgLightnessBase) },
                { role: 'foreground_secondary', color: hslToHex((h + 120) % 360, saturation * 0.5, Math.max(10, fgLightnessSec - 10)) },
                { role: 'accent_primary', color: hslToHex((h + 120) % 360, saturation, accLightnessPrimary) },
                { role: 'accent_secondary', color: hslToHex((h + 240) % 360, saturation, accLightnessSec) },
                { role: 'border', color: hslToHex(h, saturation * 0.3, borderLight) },
            ];
            break;
    }
    return roles;
}
