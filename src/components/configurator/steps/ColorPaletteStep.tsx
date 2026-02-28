import { useEffect, useMemo, useState, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { BlueprintDesign } from '@/types/blueprint';
import { StepLayout } from '../StepLayout';
import { Label } from '@/components/ui/label';
import { VoiceAxisSlider } from '../ui/VoiceAxisSlider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ColorWheelDiagram, RelationshipIcon } from '../ui/ColorWheelDiagram';
import { InteractiveColorWheel } from '../ui/InteractiveColorWheel';
import { ConfiguratorCardSurface } from '../ui/ConfiguratorCardSurface';
import { CopyHexButton } from '../ui/ColorWheelDiagram';

// Energy zones and conversion functions
const ENERGY_ZONES = ['Calm', 'Gentle', 'Balanced', 'Vibrant', 'Energetic'] as const;

const energyToZone = (value: number): string => {
  if (value <= 2) return 'Calm';
  if (value <= 4) return 'Gentle';
  if (value <= 6) return 'Balanced';
  if (value <= 8) return 'Vibrant';
  return 'Energetic';
};

const zoneToEnergy = (zone: string): number => {
  const map: Record<string, number> = {
    'Calm': 2, 'Gentle': 4, 'Balanced': 5, 'Vibrant': 7, 'Energetic': 9
  };
  return map[zone] ?? 5;
};

// Contrast zones and conversion functions
const CONTRAST_ZONES = ['Subtle', 'Soft', 'Balanced', 'Strong', 'Bold'] as const;

const contrastToZone = (value: number): string => {
  if (value <= 2) return 'Subtle';
  if (value <= 4) return 'Soft';
  if (value <= 6) return 'Balanced';
  if (value <= 8) return 'Strong';
  return 'Bold';
};

const zoneToContrast = (zone: string): number => {
  const map: Record<string, number> = {
    'Subtle': 2, 'Soft': 4, 'Balanced': 5, 'Strong': 7, 'Bold': 9
  };
  return map[zone] ?? 5;
};

interface ColorPaletteStepProps {
  design: BlueprintDesign;
  onUpdate: (updates: Partial<BlueprintDesign>) => void;
  onBack: () => void;
  onNext: () => void;
}

const colourRelationships = [
  {
    value: 'monochrome',
    label: 'Monochrome',
    description: 'Single hue, tonal depth, calm and editorial',
    angle: 0,
  },
  {
    value: 'analogous',
    label: 'Analogous',
    description: 'Neighbouring hues, cohesive and premium',
    angle: 30,
  },
  {
    value: 'complementary',
    label: 'Complementary',
    description: 'High contrast, bold accent focus',
    angle: 180,
  },
  {
    value: 'triadic',
    label: 'Triadic',
    description: 'Balanced contrast, expressive energy',
    angle: 120,
  },
] as const;

// Base hues based on aesthetic
const aestheticBaseHues: Record<string, number> = {
  minimal: 0, // Neutral grays
  dark_cinematic: 240, // Deep blue
  urban: 30, // Orange/brown
  luxury: 45, // Gold
  playful: 300, // Magenta
  tech: 200, // Cyan
};

function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

// Convert hex color to hue (0-360)
function hexToHue(hex: string): number | null {
  // Remove # if present and validate
  const cleanHex = hex.replace('#', '').trim();
  if (!/^[0-9A-Fa-f]{6}$/.test(cleanHex) && !/^[0-9A-Fa-f]{3}$/.test(cleanHex)) {
    return null;
  }

  // Expand 3-digit hex
  const fullHex = cleanHex.length === 3
    ? cleanHex.split('').map(c => c + c).join('')
    : cleanHex;

  const r = parseInt(fullHex.slice(0, 2), 16) / 255;
  const g = parseInt(fullHex.slice(2, 4), 16) / 255;
  const b = parseInt(fullHex.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  if (delta === 0) return 0; // Gray, no hue

  let hue = 0;
  if (max === r) {
    hue = ((g - b) / delta) % 6;
  } else if (max === g) {
    hue = (b - r) / delta + 2;
  } else {
    hue = (r - g) / delta + 4;
  }

  hue = Math.round(hue * 60);
  if (hue < 0) hue += 360;

  return hue;
}

function generatePalette(
  relationship: string,
  customBaseHue: number,
  energy: number,
  contrast: number
): { role: string; color: string }[] {
  const baseHue = customBaseHue;
  const baseSaturation = 10 + (energy - 1) * 8; // 10-82% based on energy
  const lightnessSpread = 10 + (contrast - 1) * 5; // How much luminance varies

  const isMonochrome = relationship === 'monochrome';
  const saturation = isMonochrome ? Math.min(baseSaturation, 15) : baseSaturation;

  let hues: number[];
  switch (relationship) {
    case 'monochrome':
      hues = [baseHue, baseHue, baseHue, baseHue];
      break;
    case 'analogous':
      hues = [baseHue, baseHue + 30, baseHue - 30, baseHue + 15];
      break;
    case 'complementary':
      hues = [baseHue, baseHue, baseHue + 180, baseHue];
      break;
    case 'triadic':
      hues = [baseHue, baseHue + 120, baseHue + 240, baseHue + 60];
      break;
    default:
      hues = [baseHue, baseHue, baseHue, baseHue];
  }

  // Normalize hues
  hues = hues.map(h => ((h % 360) + 360) % 360);

  const baseLightness = 50;
  const primaryL = baseLightness;
  const secondaryL = baseLightness + lightnessSpread;
  const neutralL = 85 + (10 - contrast); // Lighter for low contrast
  const accentL = baseLightness - lightnessSpread / 2;

  return [
    { role: 'Primary', color: hslToHex(hues[0], saturation, primaryL) },
    { role: 'Secondary', color: hslToHex(hues[1], saturation * 0.7, secondaryL) },
    { role: 'Neutral', color: hslToHex(hues[2], isMonochrome ? 5 : saturation * 0.3, neutralL) },
    { role: 'Accent', color: hslToHex(hues[3], saturation * 1.2, accentL) },
  ];
}

export const ColorPaletteStep = forwardRef<HTMLDivElement, ColorPaletteStepProps>(
  function ColorPaletteStep({
    design,
    onUpdate,
    onBack,
    onNext,
  }, ref) {
    const relationship = design.colourRelationship || 'monochrome';
    const energy = design.paletteEnergy || 5;
    const contrast = design.paletteContrast || 5;

    // Get default hue based on aesthetic
    const defaultHue = aestheticBaseHues[design.visualStyle || 'minimal'] || 0;
    const baseHue = design.baseHue ?? defaultHue;

    // Generate palette whenever inputs change
    const generatedPalette = useMemo(() => {
      return generatePalette(relationship, baseHue, energy, contrast);
    }, [relationship, baseHue, energy, contrast]);

    // Update generated palette when it changes
    useEffect(() => {
      onUpdate({ generatedPalette });
    }, [generatedPalette]);

    // Initialize with defaults if not set
    useEffect(() => {
      if (!design.colourRelationship) {
        onUpdate({
          colourRelationship: 'monochrome',
          paletteEnergy: 5,
          paletteContrast: 5,
          baseHue: defaultHue,
        });
      }
    }, []);

    const handleRelationshipSelect = (value: typeof relationship) => {
      onUpdate({ colourRelationship: value });
    };

    const handleBaseHueChange = (hue: number) => {
      onUpdate({ baseHue: hue });
    };

    const handleResetHue = () => {
      onUpdate({ baseHue: defaultHue });
    };

    const isHueCustomized = design.baseHue !== undefined && design.baseHue !== defaultHue;

    return (
      <StepLayout
        ref={ref}
        act="design"
        stepNumber={6}
        title="Color Palette"
        framing="Define your colour logic and palette."
        onBack={onBack}
        onNext={onNext}
      >
        <div className="space-y-12">
          {/* Colour Relationship Selector - Arc/Wheel Style */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            <Label className="text-sm font-medium text-foreground flex items-center justify-center gap-2">
              Colour Relationship <span className="text-destructive">*</span>
            </Label>

            {/* Arc Selector */}
            <ConfiguratorCardSurface className="relative flex flex-col items-center py-6 max-w-lg mx-auto overflow-hidden">
              <div className="relative w-[384px] h-[180px] overflow-visible">
                {/* Arc Background */}
                <svg
                  viewBox="0 0 384 180"
                  className="absolute inset-0 w-full h-full"
                >
                  {/* Arc path */}
                  <path
                    d="M 52 170 A 140 140 0 0 1 332 170"
                    fill="none"
                    stroke="hsl(var(--border))"
                    strokeWidth="40"
                    strokeLinecap="round"
                    className="opacity-30"
                  />
                </svg>

                {/* Relationship Options */}
                {colourRelationships.map((rel, index) => {
                  const isSelected = relationship === rel.value;
                  // Symmetric arc positioning: apex (-90°) between icons 2 and 3
                  const startAngle = -160;
                  const endAngle = -20;
                  const totalSpan = endAngle - startAngle;
                  const spacing = totalSpan / (colourRelationships.length - 1);
                  const arcAngle = startAngle + (index * spacing);

                  const radius = 140;
                  const centerX = 192;
                  const centerY = 170;
                  const x = centerX + radius * Math.cos((arcAngle * Math.PI) / 180);
                  const y = centerY + radius * Math.sin((arcAngle * Math.PI) / 180);

                  // Convert to percentages based on the 384x180 viewBox
                  const xPercent = (x / 384) * 100;
                  const yPercent = (y / 180) * 100;

                  return (
                    <motion.button
                      key={rel.value}
                      type="button"
                      onClick={() => handleRelationshipSelect(rel.value as typeof relationship)}
                      className="absolute z-10"
                      style={{
                        left: `${xPercent}%`,
                        top: `${yPercent}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      <div className={cn(
                        'w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300',
                        'border-2',
                        isSelected
                          ? 'border-accent bg-accent/20 shadow-[0_0_24px_hsl(var(--accent)/0.4)]'
                          : 'border-border/50 bg-muted/40 hover:border-border hover:bg-muted/60'
                      )}>
                        {/* Mini color wheel indicator */}
                        <RelationshipIcon type={rel.value} isSelected={isSelected} />
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Center Label - positioned below the arc */}
              <div className="text-center w-[384px]">
                <motion.p
                  key={relationship}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-lg font-medium text-foreground"
                >
                  {colourRelationships.find(r => r.value === relationship)?.label}
                </motion.p>
                <motion.p
                  key={`${relationship}-desc`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-sm text-muted-foreground max-w-[280px] mx-auto"
                >
                  {colourRelationships.find(r => r.value === relationship)?.description}
                </motion.p>
              </div>
            </ConfiguratorCardSurface>
          </motion.div>

          {/* Interactive Color Wheel for Base Hue */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-center">
              <Label className="text-sm font-medium text-foreground">Rotate Base Hue</Label>
            </div>

            <ConfiguratorCardSurface className="max-w-lg mx-auto p-6 relative overflow-hidden">
              <div className="flex items-center justify-center gap-8 py-2 relative z-10">
                <InteractiveColorWheel
                  baseHue={baseHue}
                  relationship={relationship}
                  onChange={handleBaseHueChange}
                />

                {/* Numeric hue input with color preview */}
                <div className="flex flex-col items-center gap-6">
                  {/* Color preview swatch */}
                  <div
                    className="w-16 h-16 rounded-xl border border-white/10 shadow-lg transition-colors duration-200"
                    style={{ backgroundColor: `hsl(${baseHue}, 70%, 50%)` }}
                    title={`hsl(${Math.round(baseHue)}, 70%, 50%)`}
                  />

                  {/* Inputs Container */}
                  <div className="flex flex-col gap-4">
                    {/* Degree input */}
                    <div className="flex items-center justify-between gap-3">
                      <Label className="text-xs text-muted-foreground w-16 text-right">Degrees</Label>
                      <div className="flex items-center gap-1 w-24">
                        <Input
                          type="number"
                          min={0}
                          max={360}
                          value={Math.round(baseHue)}
                          onChange={(e) => {
                            const value = parseInt(e.target.value, 10);
                            if (!isNaN(value)) {
                              const normalizedHue = ((value % 360) + 360) % 360;
                              handleBaseHueChange(normalizedHue);
                            }
                          }}
                          className="h-8 text-center text-sm font-medium"
                        />
                        <span className="text-sm text-muted-foreground w-3 text-left">°</span>
                      </div>
                    </div>

                    {/* Hex input */}
                    <div className="flex items-center justify-between gap-3">
                      <Label className="text-xs text-muted-foreground w-16 text-right">Hex</Label>
                      <div className="flex items-center gap-1 w-24">
                        <Input
                          type="text"
                          placeholder="#FF5500"
                          defaultValue={hslToHex(baseHue, 70, 50)}
                          key={Math.round(baseHue)}
                          onChange={(e) => {
                            const hue = hexToHue(e.target.value);
                            if (hue !== null) {
                              handleBaseHueChange(hue);
                            }
                          }}
                          className="h-8 text-center font-mono text-xs uppercase"
                        />
                        <CopyHexButton hex={hslToHex(baseHue, 70, 50)} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {isHueCustomized && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleResetHue}
                  className="absolute bottom-4 left-4 text-xs text-muted-foreground hover:text-foreground gap-1.5 h-8 px-2 z-20"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </Button>
              )}
            </ConfiguratorCardSurface>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <Label className="text-sm font-medium text-foreground flex justify-center">Generated Palette</Label>

            <div className="flex gap-4 justify-center">
              {generatedPalette.map((swatch, index) => (
                <motion.div
                  key={swatch.role}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex flex-col items-center gap-2"
                >
                  <motion.div
                    layoutId={`swatch-${swatch.role}`}
                    className={cn(
                      'rounded-xl border border-border/30',
                      swatch.role === 'Primary' ? 'w-16 h-16' :
                        swatch.role === 'Secondary' ? 'w-14 h-14' :
                          swatch.role === 'Neutral' ? 'w-12 h-12' : 'w-10 h-10'
                    )}
                    animate={{ backgroundColor: swatch.color }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                  <span className="text-xs text-muted-foreground">{swatch.role}</span>
                </motion.div>
              ))}
            </div>

            {/* Palette Strip */}
            <div className="flex gap-1 h-8 rounded-lg overflow-hidden max-w-md mx-auto">
              {generatedPalette.map((swatch) => (
                <motion.div
                  key={`strip-${swatch.role}`}
                  className="flex-1"
                  animate={{ backgroundColor: swatch.color }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  layout
                />
              ))}
            </div>
          </motion.div>

          {/* Refinement Sliders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-8"
          >
            <div className="space-y-8">
              {/* Energy Slider */}
              <div className="space-y-2 text-center">
                <Label className="text-sm font-medium text-foreground">Energy</Label>
                <VoiceAxisSlider
                  zones={[...ENERGY_ZONES]}
                  value={energyToZone(energy)}
                  onChange={(zone) => onUpdate({ paletteEnergy: zoneToEnergy(zone) })}
                  leftLabel="Calm"
                  rightLabel="Energetic"
                />
              </div>

              {/* Contrast Slider */}
              <div className="space-y-2 text-center">
                <Label className="text-sm font-medium text-foreground">Contrast</Label>
                <VoiceAxisSlider
                  zones={[...CONTRAST_ZONES]}
                  value={contrastToZone(contrast)}
                  onChange={(zone) => onUpdate({ paletteContrast: zoneToContrast(zone) })}
                  leftLabel="Subtle"
                  rightLabel="Bold"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </StepLayout>
    );
  }
);
