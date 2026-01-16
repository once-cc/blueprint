import { useEffect, useMemo, useState, useRef, useCallback, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BlueprintDesign } from '@/types/blueprint';
import { StepLayout } from '../StepLayout';
import { Label } from '@/components/ui/label';
import { VoiceAxisSlider } from '../ui/VoiceAxisSlider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RotateCcw, Hand, Copy, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

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
import { cn } from '@/lib/utils';

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
        helperText="Select a colour relationship to generate your palette."
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
          <Label className="text-sm font-medium text-foreground flex items-center gap-2">
            Colour Relationship <span className="text-destructive">*</span>
          </Label>
          
          {/* Arc Selector */}
          <div className="relative flex flex-col items-center py-8">
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
            <div className="text-center mt-4 w-[384px]">
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
          </div>
        </motion.div>

        {/* Interactive Color Wheel for Base Hue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-foreground">Rotate Base Hue</Label>
            {isHueCustomized && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleResetHue}
                className="text-xs text-muted-foreground hover:text-foreground gap-1.5"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </Button>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Drag the handle to shift your palette's base colour while maintaining the relationship.
          </p>
          
          <div className="flex items-center justify-center gap-8 py-4">
            <InteractiveColorWheel
              baseHue={baseHue}
              relationship={relationship}
              onChange={handleBaseHueChange}
            />
            
            {/* Numeric hue input with color preview */}
            <div className="flex flex-col items-center gap-4">
              <Label className="text-xs text-muted-foreground">Base Hue</Label>
              
              {/* Color preview swatch */}
              <div 
                className="w-12 h-12 rounded-lg border-2 border-white/20 shadow-lg transition-colors duration-200"
                style={{ backgroundColor: `hsl(${baseHue}, 70%, 50%)` }}
                title={`hsl(${Math.round(baseHue)}, 70%, 50%)`}
              />
              
              {/* Degree input */}
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1">
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
                    className="w-20 h-10 text-center text-lg font-medium"
                  />
                  <span className="text-lg text-muted-foreground">°</span>
                </div>
                <p className="text-[10px] text-muted-foreground">Degrees</p>
              </div>
              
              {/* Hex input with copy button */}
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1">
                  <Input
                    type="text"
                    placeholder="#FF5500"
                    defaultValue={hslToHex(baseHue, 70, 50)}
                    key={Math.round(baseHue)} // Reset when hue changes externally
                    onChange={(e) => {
                      const hue = hexToHue(e.target.value);
                      if (hue !== null) {
                        handleBaseHueChange(hue);
                      }
                    }}
                    className="w-24 h-9 text-center font-mono text-sm uppercase"
                  />
                  <CopyHexButton hex={hslToHex(baseHue, 70, 50)} />
                </div>
                <p className="text-[10px] text-muted-foreground">Hex Code</p>
              </div>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <Label className="text-sm font-medium text-foreground">Generated Palette</Label>
          
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
          <Label className="text-sm font-medium text-foreground">Refinement</Label>
          
          <div className="space-y-8">
            {/* Energy Slider */}
            <div className="space-y-2">
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
            <div className="space-y-2">
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

// Color wheel diagram showing actual hue positions
function ColorWheelDiagram({ type, isSelected }: { type: string; isSelected: boolean }) {
  const size = 32;
  const center = size / 2;
  const outerRadius = 14;
  const innerRadius = 6;
  const indicatorRadius = (outerRadius + innerRadius) / 2; // Center of the ring
  
  // Generate 12 color segments for the wheel
  const segments = Array.from({ length: 12 }, (_, i) => {
    const startAngle = i * 30 - 90; // Start from top
    const endAngle = startAngle + 30;
    const hue = i * 30;
    return { startAngle, endAngle, hue };
  });
  
  // Get hue positions based on relationship type
  const getHuePositions = (relType: string): number[] => {
    switch (relType) {
      case 'monochrome': return [0];
      case 'analogous': return [330, 0, 30];
      case 'complementary': return [0, 180];
      case 'triadic': return [0, 120, 240];
      default: return [0];
    }
  };
  
  const huePositions = getHuePositions(type);
  
  // Helper to create arc path for donut segments
  const describeArc = (cx: number, cy: number, outerR: number, innerR: number, startAngle: number, endAngle: number) => {
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    
    const x1 = cx + outerR * Math.cos(startRad);
    const y1 = cy + outerR * Math.sin(startRad);
    const x2 = cx + outerR * Math.cos(endRad);
    const y2 = cy + outerR * Math.sin(endRad);
    const x3 = cx + innerR * Math.cos(endRad);
    const y3 = cy + innerR * Math.sin(endRad);
    const x4 = cx + innerR * Math.cos(startRad);
    const y4 = cy + innerR * Math.sin(startRad);
    
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    
    return `M ${x1} ${y1} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerR} ${innerR} 0 ${largeArc} 0 ${x4} ${y4} Z`;
  };
  
  // Get position for indicator dot
  const getIndicatorPosition = (hue: number) => {
    const angle = ((hue - 90) * Math.PI) / 180;
    return {
      x: center + indicatorRadius * Math.cos(angle),
      y: center + indicatorRadius * Math.sin(angle),
    };
  };
  
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-8 h-8">
      {/* Color wheel segments */}
      {segments.map((seg, i) => (
        <path
          key={i}
          d={describeArc(center, center, outerRadius, innerRadius, seg.startAngle, seg.endAngle)}
          fill={`hsl(${seg.hue}, 70%, 50%)`}
          opacity={isSelected ? 0.85 : 0.5}
          className="transition-opacity duration-200"
        />
      ))}
      
      {/* Connecting lines for complementary/triadic */}
      {(type === 'complementary' || type === 'triadic') && huePositions.length > 1 && (
        <motion.polygon
          key={`polygon-${type}`}
          fill="none"
          stroke={isSelected ? 'white' : 'rgba(255,255,255,0.5)'}
          strokeWidth={1.5}
          initial={false}
          animate={{ 
            points: huePositions.map(hue => {
              const pos = getIndicatorPosition(hue);
              return `${pos.x},${pos.y}`;
            }).join(' ')
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        />
      )}
      
      {/* Arc highlight for analogous - centered at top (0° hue = -90° drawing angle) */}
      {type === 'analogous' && (
        <motion.path
          d={describeArc(center, center, outerRadius + 1, innerRadius - 1, -30, 30)}
          fill="none"
          stroke={isSelected ? 'white' : 'rgba(255,255,255,0.4)'}
          strokeWidth={1.5}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        />
      )}
      
      {/* Hue position indicator dots */}
      {huePositions.map((hue, i) => {
        const pos = getIndicatorPosition(hue);
        return (
          <motion.circle
            key={`${type}-${i}`}
            r={2.5}
            fill="white"
            stroke={isSelected ? 'hsl(var(--accent))' : 'rgba(255,255,255,0.6)'}
            strokeWidth={1.5}
            initial={false}
            animate={{ cx: pos.x, cy: pos.y }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          />
        );
      })}
    </svg>
  );
}

// Rename for backwards compatibility
const RelationshipIcon = ColorWheelDiagram;

// Copy hex button component
function CopyHexButton({ hex }: { hex: string }) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(hex);
      setCopied(true);
      toast({
        title: "Copied!",
        description: `${hex} copied to clipboard`,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Failed to copy",
        description: "Please copy manually",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={handleCopy}
      className="h-9 w-9 shrink-0"
    >
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.div
            key="check"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            <Check className="h-4 w-4 text-green-500" />
          </motion.div>
        ) : (
          <motion.div
            key="copy"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            <Copy className="h-4 w-4 text-muted-foreground" />
          </motion.div>
        )}
      </AnimatePresence>
    </Button>
  );
}

// Interactive Color Wheel with drag-to-rotate functionality
function InteractiveColorWheel({ 
  baseHue, 
  relationship, 
  onChange 
}: { 
  baseHue: number; 
  relationship: string; 
  onChange: (hue: number) => void;
}) {
  const wheelRef = useRef<SVGSVGElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  
  const size = 200;
  const center = size / 2;
  const outerRadius = 90;
  const innerRadius = 50;
  const handleRadius = 70; // Where the drag handle sits
  
  // Generate 24 color segments for a smoother wheel
  const segments = Array.from({ length: 24 }, (_, i) => {
    const startAngle = i * 15 - 90; // Start from top
    const endAngle = startAngle + 15;
    const hue = i * 15;
    return { startAngle, endAngle, hue };
  });
  
  // Get hue positions based on relationship type (relative to base hue)
  const getRelativeHuePositions = useCallback((relType: string, base: number): number[] => {
    switch (relType) {
      case 'monochrome': return [base];
      case 'analogous': return [base - 30, base, base + 30];
      case 'complementary': return [base, base + 180];
      case 'triadic': return [base, base + 120, base + 240];
      default: return [base];
    }
  }, []);
  
  const huePositions = getRelativeHuePositions(relationship, baseHue);
  
  // Helper to create arc path for donut segments
  const describeArc = useCallback((cx: number, cy: number, outerR: number, innerR: number, startAngle: number, endAngle: number) => {
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    
    const x1 = cx + outerR * Math.cos(startRad);
    const y1 = cy + outerR * Math.sin(startRad);
    const x2 = cx + outerR * Math.cos(endRad);
    const y2 = cy + outerR * Math.sin(endRad);
    const x3 = cx + innerR * Math.cos(endRad);
    const y3 = cy + innerR * Math.sin(endRad);
    const x4 = cx + innerR * Math.cos(startRad);
    const y4 = cy + innerR * Math.sin(startRad);
    
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    
    return `M ${x1} ${y1} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerR} ${innerR} 0 ${largeArc} 0 ${x4} ${y4} Z`;
  }, []);
  
  // Get position for indicator dot
  const getIndicatorPosition = useCallback((hue: number, radius: number) => {
    const angle = ((hue - 90) * Math.PI) / 180;
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    };
  }, [center]);
  
  // Calculate hue from mouse/touch position
  const calculateHue = useCallback((clientX: number, clientY: number) => {
    if (!wheelRef.current) return baseHue;
    const rect = wheelRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const angle = Math.atan2(clientY - centerY, clientX - centerX);
    // Convert to hue (0-360), accounting for the -90 degree offset
    const hue = ((angle * 180 / Math.PI) + 90 + 360) % 360;
    return Math.round(hue);
  }, [baseHue]);
  
  // Handle drag events
  const handleDrag = useCallback((clientX: number, clientY: number) => {
    const newHue = calculateHue(clientX, clientY);
    onChange(newHue);
  }, [calculateHue, onChange]);
  
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setHasInteracted(true);
    handleDrag(e.clientX, e.clientY);
  }, [handleDrag]);
  
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    handleDrag(e.clientX, e.clientY);
  }, [isDragging, handleDrag]);
  
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);
  
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setHasInteracted(true);
    const touch = e.touches[0];
    handleDrag(touch.clientX, touch.clientY);
  }, [handleDrag]);
  
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    handleDrag(touch.clientX, touch.clientY);
  }, [isDragging, handleDrag]);
  
  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);
  
  // Attach global event listeners for drag
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);
  
  const handlePos = getIndicatorPosition(baseHue, handleRadius);
  
  return (
    <motion.svg
      ref={wheelRef}
      viewBox={`0 0 ${size} ${size}`}
      className={cn(
        "w-48 h-48 cursor-grab select-none",
        isDragging && "cursor-grabbing"
      )}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
    >
      {/* Color wheel segments */}
      {segments.map((seg, i) => (
        <path
          key={i}
          d={describeArc(center, center, outerRadius, innerRadius, seg.startAngle, seg.endAngle)}
          fill={`hsl(${seg.hue}, 70%, 50%)`}
          className="opacity-80 transition-opacity duration-200"
        />
      ))}
      
      {/* Inner circle background */}
      <circle
        cx={center}
        cy={center}
        r={innerRadius - 4}
        fill="hsl(var(--background))"
        className="transition-colors duration-300"
      />
      
      {/* Connecting lines for complementary/triadic */}
      {(relationship === 'complementary' || relationship === 'triadic') && huePositions.length > 1 && (
        <motion.polygon
          points={huePositions.map(hue => {
            const pos = getIndicatorPosition(((hue % 360) + 360) % 360, handleRadius - 10);
            return `${pos.x},${pos.y}`;
          }).join(' ')}
          fill="none"
          stroke="hsl(var(--accent))"
          strokeWidth={2}
          strokeDasharray="4 2"
          className="opacity-60"
          initial={false}
          animate={{ opacity: 0.6 }}
        />
      )}
      
      {/* Arc highlight for analogous */}
      {relationship === 'analogous' && (
        <motion.path
          d={describeArc(center, center, outerRadius + 2, innerRadius - 2, 
            (baseHue - 30 - 90), (baseHue + 30 - 90))}
          fill="none"
          stroke="hsl(var(--accent))"
          strokeWidth={3}
          className="opacity-60"
          initial={false}
          animate={{ opacity: 0.6 }}
        />
      )}
      
      {/* Secondary hue position dots */}
      {huePositions.slice(1).map((hue, i) => {
        const normalizedHue = ((hue % 360) + 360) % 360;
        const pos = getIndicatorPosition(normalizedHue, handleRadius);
        return (
          <motion.circle
            key={i}
            cx={pos.x}
            cy={pos.y}
            r={6}
            fill={`hsl(${normalizedHue}, 70%, 50%)`}
            stroke="white"
            strokeWidth={2}
            className="transition-all duration-200"
            initial={false}
            animate={{ cx: pos.x, cy: pos.y }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          />
        );
      })}
      
      {/* Primary/Base hue handle (draggable) */}
      <motion.g
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        initial={false}
        animate={{ x: handlePos.x - center, y: handlePos.y - center }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        <g transform={`translate(${center}, ${center})`}>
          {/* Handle outer glow */}
          <circle
            r={14}
            fill={`hsl(${baseHue}, 70%, 50%)`}
            className={cn(
              "transition-all duration-200",
              isDragging ? "opacity-40" : "opacity-20"
            )}
            style={{ filter: 'blur(4px)' }}
          />
          {/* Handle main circle */}
          <circle
            r={10}
            fill={`hsl(${baseHue}, 70%, 50%)`}
            stroke="white"
            strokeWidth={3}
            className="transition-all duration-200"
          />
          {/* Handle inner dot */}
          <circle
            r={3}
            fill="white"
            className="transition-all duration-200"
          />
        </g>
      </motion.g>
      
      {/* Center label showing hue value */}
      <text
        x={center}
        y={center - 8}
        textAnchor="middle"
        className="fill-foreground text-lg font-semibold"
        style={{ fontSize: '18px' }}
      >
        {Math.round(baseHue)}°
      </text>
      <text
        x={center}
        y={center + 12}
        textAnchor="middle"
        className="fill-muted-foreground"
        style={{ fontSize: '10px' }}
      >
        Base Hue
      </text>
      
      {/* Instructional hand animation - fades after interaction */}
      <AnimatePresence>
        {!hasInteracted && (
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.g
              animate={{
                rotate: [0, 25, 0],
              }}
              transition={{
                duration: 2,
                repeat: 2,
                repeatDelay: 0.5,
                ease: "easeInOut",
              }}
              style={{ originX: `${center}px`, originY: `${center}px` }}
            >
              <motion.foreignObject
                x={handlePos.x + 8}
                y={handlePos.y - 8}
                width={28}
                height={28}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: [0.7, 1, 0.7],
                  scale: [0.9, 1.1, 0.9],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <div className="flex items-center justify-center w-full h-full">
                  <Hand className="w-5 h-5 text-accent drop-shadow-lg" />
                </div>
              </motion.foreignObject>
            </motion.g>
          </motion.g>
        )}
      </AnimatePresence>
    </motion.svg>
  );
}
