import { useEffect, useMemo, useState, forwardRef, useRef } from 'react';
import { motion } from 'framer-motion';
import { BlueprintDesign } from '@/types/blueprint';
import { StepLayout } from '../StepLayout';
import { Label } from '@/components/ui/label';
import { VoiceAxisSlider } from '../ui/VoiceAxisSlider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RotateCcw, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ColorWheelDiagram, RelationshipIcon } from '../ui/ColorWheelDiagram';
import { InteractiveColorWheel } from '../ui/InteractiveColorWheel';
import { ConfiguratorCardSurface } from '../ui/ConfiguratorCardSurface';
import { ConfiguratorCardHeader } from '../ui/ConfiguratorCardHeader';
import { CopyHexButton } from '../ui/ColorWheelDiagram';
import { AnimatedLockIcon } from '../ui/AnimatedLockIcon';

import {
  ENERGY_ZONES,
  energyToZone,
  zoneToEnergy,
  CONTRAST_ZONES,
  contrastToZone,
  zoneToContrast,
  colourRelationships,
  aestheticBaseHues,
  hslToHex,
  hexToHue,
  hexToHslData,
  generatePalette
} from '@/lib/colorUtils';

interface ColorPaletteStepProps {
  design: BlueprintDesign;
  onUpdate: (updates: Partial<BlueprintDesign>) => void;
  onBack: () => void;
  onNext: () => void;
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

    const [localHexInput, setLocalHexInput] = useState(hslToHex(baseHue, 70, 50));
    const [hexFocused, setHexFocused] = useState(false);

    // Sync external wheel spins back to local targeted hex input text
    useEffect(() => {
      // Don't override while user is actively typing
      if (hexFocused) return;
      setLocalHexInput((prev) => {
        const derivedFromInput = hexToHue(prev);
        // Only force an update if the external hue change doesn't match our current text box value (e.g wheel drag vs typing)
        if (derivedFromInput === null || Math.round(derivedFromInput) !== Math.round(baseHue)) {
          return hslToHex(baseHue, 70, 50);
        }
        return prev;
      });
    }, [baseHue, hexFocused]);

    // Normalize hex input: ensure it starts with # and is uppercase
    const normalizeHexInput = (val: string): string => {
      let clean = val.trim();
      if (clean && !clean.startsWith('#')) clean = '#' + clean;
      return clean.toUpperCase();
    };

    const handleHexInputChange = (val: string) => {
      setLocalHexInput(val);
      const hue = hexToHue(val);
      if (hue !== null) {
        handleBaseHueChange(hue);
      }
    };

    const handleHexBlur = () => {
      setHexFocused(false);
      const normalized = normalizeHexInput(localHexInput);
      const hue = hexToHue(normalized);
      if (hue !== null) {
        setLocalHexInput(normalized);
        handleBaseHueChange(hue);
      } else {
        // Invalid hex, revert to current hue
        setLocalHexInput(hslToHex(baseHue, 70, 50));
      }
    };

    const [paletteMode, setPaletteMode] = useState<'system' | 'manual'>('system');
    const [lockedColors, setLockedColors] = useState<Record<string, string>>({});

    // Generate palette whenever inputs change
    const systemPalette = useMemo(() => {
      return generatePalette(relationship, baseHue, energy, contrast);
    }, [relationship, baseHue, energy, contrast]);

    const activePalette = useMemo(() => {
      return systemPalette.map(sys => {
        if (lockedColors[sys.role]) {
          return { ...sys, color: lockedColors[sys.role] };
        }
        return sys;
      });
    }, [systemPalette, lockedColors]);

    // Update generated palette when it changes
    useEffect(() => {
      onUpdate({ generatedPalette: activePalette });
    }, [activePalette]);

    const handleManualHexChange = (role: string, hex: string) => {
      setLockedColors(prev => ({ ...prev, [role]: hex }));
    };

    const toggleLock = (role: string, currentColor: string) => {
      setLockedColors(prev => {
        const next = { ...prev };
        if (next[role]) {
          delete next[role];
        } else {
          next[role] = currentColor;
        }
        return next;
      });
    };

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

    const advisoryMetrics = useMemo(() => {
      if (paletteMode !== 'manual') return null;

      const hslArr = activePalette.map(p => hexToHslData(p.color)).filter(Boolean) as { h: number, s: number, l: number }[];
      if (hslArr.length < 4) return { relationship: 'CUSTOM', energy: 'N/A', contrast: 'N/A' };

      const hues = hslArr.map(hsl => hsl.h);
      const hueDiffs = [
        Math.abs(hues[0] - hues[1]),
        Math.abs(hues[0] - hues[2]),
        Math.abs(hues[0] - hues[3])
      ].map(diff => diff > 180 ? 360 - diff : diff);

      let rel = 'CUSTOM';
      const avgDiff = hueDiffs.reduce((a, b) => a + b, 0) / 3;
      if (avgDiff < 15) rel = 'MONOCHROME';
      else if (hueDiffs.every(d => d > 15 && d < 60)) rel = 'ANALOGOUS';
      else if (hueDiffs.some(d => d > 150)) rel = 'COMPLEMENTARY';
      else if (hueDiffs.some(d => d > 90 && d < 150) || hueDiffs.every(d => d > 30)) rel = 'TRIADIC';

      const avgS = hslArr.reduce((sum, val) => sum + val.s, 0) / 4;
      let energyStr = 'BALANCED';
      if (avgS < 20) energyStr = 'CALM';
      else if (avgS < 40) energyStr = 'GENTLE';
      else if (avgS > 80) energyStr = 'ENERGETIC';
      else if (avgS > 60) energyStr = 'VIBRANT';

      const light = hslArr.map(hsl => hsl.l);
      const Ldiff = Math.max(...light) - Math.min(...light);
      let contrastStr = 'BALANCED';
      if (Ldiff < 20) contrastStr = 'SUBTLE';
      else if (Ldiff < 40) contrastStr = 'SOFT';
      else if (Ldiff > 70) contrastStr = 'BOLD';
      else if (Ldiff > 50) contrastStr = 'STRONG';

      return { relationship: rel, energy: energyStr, contrast: contrastStr };
    }, [activePalette, paletteMode]);

    const handleRelationshipSelect = (value: typeof relationship) => {
      onUpdate({ colourRelationship: value });
    };

    const handleBaseHueChange = (hue: number) => {
      onUpdate({ baseHue: hue });
    };

    const hueDragRef = useRef<{ startX: number; startHue: number } | null>(null);

    const handleHueDragStart = (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.button !== 0) return; // Only left click / main touch
      e.currentTarget.setPointerCapture(e.pointerId);
      hueDragRef.current = {
        startX: e.clientX,
        startHue: baseHue
      };
    };

    const handleHueDragMove = (e: React.PointerEvent<HTMLDivElement>) => {
      if (!hueDragRef.current) return;

      const deltaX = e.clientX - hueDragRef.current.startX;
      // 1 degree per 2 pixels dragged for fine control
      const deltaHue = Math.round(deltaX / 2);

      let newHue = (hueDragRef.current.startHue + deltaHue) % 360;
      if (newHue < 0) newHue += 360;

      handleBaseHueChange(newHue);
    };

    const handleHueDragEnd = (e: React.PointerEvent<HTMLDivElement>) => {
      e.currentTarget.releasePointerCapture(e.pointerId);
      hueDragRef.current = null;
    };

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
            {/* Arc Selector */}
            <ConfiguratorCardSurface isHoverable={false} className="relative max-w-lg mx-auto overflow-hidden">
              <ConfiguratorCardHeader title="Color Logic" metaLabel="SYS.RELATION" delay={0.1} />
              <div className="w-full h-full flex flex-col items-center pt-16 pb-6 px-6">
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
                    className="text-sm text-muted-foreground w-full mx-auto px-4"
                  >
                    {colourRelationships.find(r => r.value === relationship)?.description}
                  </motion.p>
                </div>
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
            <ConfiguratorCardSurface isHoverable={false} className="max-w-lg mx-auto relative overflow-hidden">
              <ConfiguratorCardHeader title="Base Hue" metaLabel="SYS.BASE_HUE" delay={0.15} />
              <div className="w-full h-full pt-18 sm:pt-16 pb-4 sm:pb-6 px-5 sm:px-6">
                {/* Desktop: original horizontal layout */}
                <div className="hidden sm:flex items-center justify-center gap-8 py-2 relative z-10">
                  <InteractiveColorWheel
                    baseHue={baseHue}
                    relationship={relationship}
                    onChange={handleBaseHueChange}
                  />

                  <div className="flex flex-col items-center gap-6">
                    <div
                      className="w-16 h-16 rounded-xl border border-white/10 shadow-lg transition-colors duration-200"
                      style={{ backgroundColor: `hsl(${baseHue}, 70%, 50%)` }}
                      title={`hsl(${Math.round(baseHue)}, 70%, 50%)`}
                    />

                    <div className="flex flex-col gap-4">
                      <div
                        className="flex items-center justify-between gap-3 cursor-ew-resize touch-none select-none group"
                        onPointerDown={handleHueDragStart}
                        onPointerMove={handleHueDragMove}
                        onPointerUp={handleHueDragEnd}
                        onPointerCancel={handleHueDragEnd}
                      >
                        <Label className="text-xs text-muted-foreground w-16 text-right cursor-ew-resize group-hover:text-foreground transition-colors pointer-events-none">Degrees</Label>
                        <div className="flex items-center gap-2 w-[115px]">
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
                            className="h-8 text-center text-sm font-medium w-full cursor-ew-resize focus:cursor-text"
                          />
                          <span className="text-sm text-muted-foreground w-3 text-left pointer-events-none">°</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <Label className="text-xs text-muted-foreground w-16 text-right">Hex</Label>
                        <div className="flex items-center gap-2 w-[115px]">
                          <Input
                            type="text"
                            placeholder="#FF5500"
                            value={localHexInput}
                            onFocus={() => setHexFocused(true)}
                            onBlur={handleHexBlur}
                            onChange={(e) => handleHexInputChange(e.target.value)}
                            className="h-8 text-center font-mono text-xs uppercase min-w-[8ch] whitespace-nowrap overflow-visible px-1 w-full"
                          />
                          <div className="shrink-0 flex items-center justify-center">
                            <CopyHexButton hex={localHexInput} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mobile: Option D — compact controls top, large wheel bottom */}
                <div className="flex flex-col items-center gap-4 sm:hidden relative z-10">
                  {/* Compact top row: swatch + inputs */}
                  <div className="flex items-start gap-3 max-w-[260px]">
                    <div className="flex flex-col gap-2">
                      <div
                        className="flex items-center gap-2 cursor-ew-resize touch-none select-none group"
                        onPointerDown={handleHueDragStart}
                        onPointerMove={handleHueDragMove}
                        onPointerUp={handleHueDragEnd}
                        onPointerCancel={handleHueDragEnd}
                      >
                        <Label className="text-[10px] text-muted-foreground w-10 text-right cursor-ew-resize group-hover:text-foreground transition-colors pointer-events-none shrink-0">Degrees</Label>
                        <div className="flex items-center gap-1 w-[120px]">
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
                            className="h-7 text-center text-xs font-medium flex-1 cursor-ew-resize focus:cursor-text"
                          />
                          <span className="text-xs text-muted-foreground pointer-events-none w-4 text-center">°</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-[10px] text-muted-foreground w-10 text-right shrink-0">Hex</Label>
                        <div className="flex items-center gap-1 w-[120px]">
                          <Input
                            type="text"
                            placeholder="#FF5500"
                            value={localHexInput}
                            onFocus={() => setHexFocused(true)}
                            onBlur={handleHexBlur}
                            onChange={(e) => handleHexInputChange(e.target.value)}
                            className="h-7 text-center font-mono text-[10px] uppercase flex-1 px-1"
                          />
                          <div className="shrink-0 flex items-center justify-center w-4">
                            <CopyHexButton hex={localHexInput} />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div
                      className="w-10 h-10 rounded-lg border border-white/10 shadow-lg transition-colors duration-200 shrink-0 mt-1"
                      style={{ backgroundColor: `hsl(${baseHue}, 70%, 50%)` }}
                      title={`hsl(${Math.round(baseHue)}, 70%, 50%)`}
                    />
                  </div>

                  {/* Large wheel at bottom */}
                  <div className="w-full flex justify-center">
                    <InteractiveColorWheel
                      baseHue={baseHue}
                      relationship={relationship}
                      onChange={handleBaseHueChange}
                      className="w-[60vw] h-[60vw] max-w-[280px] max-h-[280px]"
                    />
                  </div>
                </div>
              </div>
            </ConfiguratorCardSurface>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-3 sm:space-y-4"
          >
            <ConfiguratorCardSurface isHoverable={false} className="max-w-3xl mx-auto relative overflow-hidden">
              <ConfiguratorCardHeader
                title="Generated Palette"
                metaLabel="SYS.PALETTE"
                delay={0.2}
                modeSwitch={{
                  mode: paletteMode,
                  onChange: setPaletteMode
                }}
              />
              <div className="w-full h-full pt-20 sm:pt-20 pb-4 sm:pb-6 px-4 md:px-6 space-y-5 sm:space-y-8">
                {/* Desktop/Tablet: 4-3 layout */}
                <div className="hidden sm:flex flex-col gap-6 items-center">
                  {/* Top row: fg primary, fg secondary, accent primary, accent secondary */}
                  <div className="flex gap-4 md:gap-6 justify-center">
                    {[activePalette[2], activePalette[3], activePalette[4], activePalette[5]].map((swatch, i) => {
                      const index = [2, 3, 4, 5][i];
                      return (
                        <motion.div
                          key={swatch.role}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.1 * index }}
                          className="flex flex-col items-center gap-2 relative min-h-[105px] w-[110px] md:w-[120px]"
                        >
                          <motion.div
                            layoutId={`swatch-${swatch.role}`}
                            className={cn(
                              'rounded-xl border border-border/30 shadow-sm relative group shrink-0',
                              swatch.role === 'Primary' ? 'w-14 h-14 md:w-16 md:h-16' :
                                swatch.role === 'Secondary' ? 'w-12 h-12 md:w-14 md:h-14' :
                                  swatch.role === 'Neutral' ? 'w-10 h-10 md:w-12 md:h-12' : 'w-8 h-8 md:w-10 md:h-10'
                            )}
                            animate={{ backgroundColor: swatch.color }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                          >
                            {paletteMode === 'manual' && (
                              <input type="color" value={swatch.color} onChange={(e) => handleManualHexChange(swatch.role, e.target.value.toUpperCase())} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                            )}
                            {paletteMode === 'manual' && (
                              <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleLock(swatch.role, swatch.color); }} className="absolute -top-2 -right-2 p-1 rounded-full bg-background border border-white/10 z-10">
                                <AnimatedLockIcon isLocked={!!lockedColors[swatch.role]} className="w-3 h-3" />
                              </button>
                            )}
                          </motion.div>
                          <span className="text-[10px] md:text-xs font-medium text-muted-foreground text-center line-clamp-1 break-words">{swatch.role.replace('_', ' ')}</span>
                          {paletteMode === 'manual' ? (
                            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="relative -mt-1 w-full">
                              <Input value={swatch.color} onChange={(e) => handleManualHexChange(swatch.role, e.target.value)} className="h-6 px-1 text-center font-mono text-[10px] uppercase min-w-[7ch] md:min-w-[8ch] overflow-hidden truncate bg-transparent border-none focus-visible:ring-1 focus-visible:ring-accent shadow-none" />
                            </motion.div>
                          ) : (
                            <span className="text-[10px] font-mono text-muted-foreground/80 uppercase">{swatch.color}</span>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                  {/* Bottom row: bg primary, bg secondary, border */}
                  <div className="flex gap-4 md:gap-6 justify-center">
                    {[activePalette[0], activePalette[1], activePalette[6]].map((swatch, i) => {
                      const index = [0, 1, 6][i];
                      return (
                        <motion.div
                          key={swatch.role}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.1 * index }}
                          className="flex flex-col items-center gap-2 relative min-h-[105px] w-[110px] md:w-[120px]"
                        >
                          <motion.div
                            layoutId={`swatch-${swatch.role}`}
                            className={cn(
                              'rounded-xl border border-border/30 shadow-sm relative group shrink-0',
                              swatch.role === 'Primary' ? 'w-14 h-14 md:w-16 md:h-16' :
                                swatch.role === 'Secondary' ? 'w-12 h-12 md:w-14 md:h-14' :
                                  swatch.role === 'Neutral' ? 'w-10 h-10 md:w-12 md:h-12' : 'w-8 h-8 md:w-10 md:h-10'
                            )}
                            animate={{ backgroundColor: swatch.color }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                          >
                            {paletteMode === 'manual' && (
                              <input type="color" value={swatch.color} onChange={(e) => handleManualHexChange(swatch.role, e.target.value.toUpperCase())} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                            )}
                            {paletteMode === 'manual' && (
                              <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleLock(swatch.role, swatch.color); }} className="absolute -top-2 -right-2 p-1 rounded-full bg-background border border-white/10 z-10">
                                <AnimatedLockIcon isLocked={!!lockedColors[swatch.role]} className="w-3 h-3" />
                              </button>
                            )}
                          </motion.div>
                          <span className="text-[10px] md:text-xs font-medium text-muted-foreground text-center line-clamp-1 break-words">{swatch.role.replace('_', ' ')}</span>
                          {paletteMode === 'manual' ? (
                            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="relative -mt-1 w-full">
                              <Input value={swatch.color} onChange={(e) => handleManualHexChange(swatch.role, e.target.value)} className="h-6 px-1 text-center font-mono text-[10px] uppercase min-w-[7ch] md:min-w-[8ch] overflow-hidden truncate bg-transparent border-none focus-visible:ring-1 focus-visible:ring-accent shadow-none" />
                            </motion.div>
                          ) : (
                            <span className="text-[10px] font-mono text-muted-foreground/80 uppercase">{swatch.color}</span>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Mobile: 2-3-2 staggered diamond formation */}
                <div className="flex flex-col gap-3 items-center sm:hidden">
                  {/* Row 1: first 2 swatches */}
                  <div className="flex justify-center gap-6">
                    {activePalette.slice(0, 2).map((swatch, index) => (
                      <motion.div
                        key={swatch.role}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 * index }}
                        className="flex flex-col items-center gap-1.5 relative min-h-[80px] w-[72px]"
                      >
                        <motion.div
                          layoutId={`swatch-mobile-${swatch.role}`}
                          className={cn(
                            'rounded-xl border border-border/30 shadow-sm relative group shrink-0',
                            swatch.role === 'Primary' ? 'w-12 h-12' :
                              swatch.role === 'Secondary' ? 'w-11 h-11' :
                                swatch.role === 'Neutral' ? 'w-10 h-10' : 'w-9 h-9'
                          )}
                          animate={{ backgroundColor: swatch.color }}
                          transition={{ duration: 0.5, ease: 'easeOut' }}
                        >
                          {paletteMode === 'manual' && (
                            <input type="color" value={swatch.color} onChange={(e) => handleManualHexChange(swatch.role, e.target.value.toUpperCase())} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                          )}
                          {paletteMode === 'manual' && (
                            <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleLock(swatch.role, swatch.color); }} className="absolute -top-2 -right-2 p-1 rounded-full bg-background border border-white/10 z-10">
                              <AnimatedLockIcon isLocked={!!lockedColors[swatch.role]} className="w-3 h-3" />
                            </button>
                          )}
                        </motion.div>
                        <span className="text-[10px] font-medium text-muted-foreground text-center line-clamp-2 break-words">{swatch.role.replace('_', ' ')}</span>
                        {paletteMode === 'manual' ? (
                          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="relative -mt-1 w-full">
                            <Input value={swatch.color} onChange={(e) => handleManualHexChange(swatch.role, e.target.value)} className="h-6 px-1 text-center font-mono text-[10px] uppercase min-w-[7ch] overflow-hidden truncate bg-transparent border-none focus-visible:ring-1 focus-visible:ring-accent shadow-none" />
                          </motion.div>
                        ) : (
                          <span className="text-[10px] font-mono text-muted-foreground/80 uppercase">{swatch.color}</span>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  {/* Row 2: middle 3 swatches — wider spread */}
                  <div className="flex justify-center gap-4 w-full max-w-[300px]">
                    {activePalette.slice(2, 5).map((swatch, index) => (
                      <motion.div
                        key={swatch.role}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 * (index + 2) }}
                        className="flex flex-col items-center gap-1.5 relative min-h-[80px] flex-1"
                      >
                        <motion.div
                          layoutId={`swatch-mobile-${swatch.role}`}
                          className={cn(
                            'rounded-xl border border-border/30 shadow-sm relative group shrink-0',
                            swatch.role === 'Primary' ? 'w-12 h-12' :
                              swatch.role === 'Secondary' ? 'w-11 h-11' :
                                swatch.role === 'Neutral' ? 'w-10 h-10' : 'w-9 h-9'
                          )}
                          animate={{ backgroundColor: swatch.color }}
                          transition={{ duration: 0.5, ease: 'easeOut' }}
                        >
                          {paletteMode === 'manual' && (
                            <input type="color" value={swatch.color} onChange={(e) => handleManualHexChange(swatch.role, e.target.value.toUpperCase())} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                          )}
                          {paletteMode === 'manual' && (
                            <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleLock(swatch.role, swatch.color); }} className="absolute -top-2 -right-2 p-1 rounded-full bg-background border border-white/10 z-10">
                              <AnimatedLockIcon isLocked={!!lockedColors[swatch.role]} className="w-3 h-3" />
                            </button>
                          )}
                        </motion.div>
                        <span className="text-[10px] font-medium text-muted-foreground text-center line-clamp-2 break-words">{swatch.role.replace('_', ' ')}</span>
                        {paletteMode === 'manual' ? (
                          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="relative -mt-1 w-full">
                            <Input value={swatch.color} onChange={(e) => handleManualHexChange(swatch.role, e.target.value)} className="h-6 px-1 text-center font-mono text-[10px] uppercase min-w-[7ch] overflow-hidden truncate bg-transparent border-none focus-visible:ring-1 focus-visible:ring-accent shadow-none" />
                          </motion.div>
                        ) : (
                          <span className="text-[10px] font-mono text-muted-foreground/80 uppercase">{swatch.color}</span>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  {/* Row 3: last 2 swatches */}
                  <div className="flex justify-center gap-6">
                    {activePalette.slice(5, 7).map((swatch, index) => (
                      <motion.div
                        key={swatch.role}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 * (index + 5) }}
                        className="flex flex-col items-center gap-1.5 relative min-h-[80px] w-[72px]"
                      >
                        <motion.div
                          layoutId={`swatch-mobile-${swatch.role}`}
                          className={cn(
                            'rounded-xl border border-border/30 shadow-sm relative group shrink-0',
                            swatch.role === 'Primary' ? 'w-12 h-12' :
                              swatch.role === 'Secondary' ? 'w-11 h-11' :
                                swatch.role === 'Neutral' ? 'w-10 h-10' : 'w-9 h-9'
                          )}
                          animate={{ backgroundColor: swatch.color }}
                          transition={{ duration: 0.5, ease: 'easeOut' }}
                        >
                          {paletteMode === 'manual' && (
                            <input type="color" value={swatch.color} onChange={(e) => handleManualHexChange(swatch.role, e.target.value.toUpperCase())} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                          )}
                          {paletteMode === 'manual' && (
                            <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleLock(swatch.role, swatch.color); }} className="absolute -top-2 -right-2 p-1 rounded-full bg-background border border-white/10 z-10">
                              <AnimatedLockIcon isLocked={!!lockedColors[swatch.role]} className="w-3 h-3" />
                            </button>
                          )}
                        </motion.div>
                        <span className="text-[10px] font-medium text-muted-foreground text-center line-clamp-2 break-words">{swatch.role.replace('_', ' ')}</span>
                        {paletteMode === 'manual' ? (
                          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="relative -mt-1 w-full">
                            <Input value={swatch.color} onChange={(e) => handleManualHexChange(swatch.role, e.target.value)} className="h-6 px-1 text-center font-mono text-[10px] uppercase min-w-[7ch] overflow-hidden truncate bg-transparent border-none focus-visible:ring-1 focus-visible:ring-accent shadow-none" />
                          </motion.div>
                        ) : (
                          <span className="text-[10px] font-mono text-muted-foreground/80 uppercase">{swatch.color}</span>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Palette Strip */}
                <div className="flex gap-1 h-8 md:h-10 rounded-xl overflow-hidden shadow-inner border border-white/5 relative z-10 w-full">
                  {activePalette.map((swatch) => (
                    <motion.div
                      key={`strip-${swatch.role}`}
                      className="flex-1"
                      animate={{ backgroundColor: swatch.color }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      layout
                    />
                  ))}
                </div>
              </div>
            </ConfiguratorCardSurface>

            {/* Advisory Feedback for Manual Mode */}
            {paletteMode === 'manual' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-lg mx-auto pt-2 px-4 text-center pointer-events-none"
              >
                <p className="font-mono text-[10px] sm:text-[11px] text-muted-foreground/30 uppercase tracking-widest leading-loose">
                  Suggested Relationship: {advisoryMetrics?.relationship}<br />
                  Energy: {advisoryMetrics?.energy} | Contrast: {advisoryMetrics?.contrast}
                </p>
              </motion.div>
            )}
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
              <div className="w-full text-center">
                <ConfiguratorCardSurface isHoverable={false} className="w-full relative overflow-hidden">
                  <ConfiguratorCardHeader title="Energy" metaLabel="SYS.ENERGY" delay={0.3} />
                  <div className="w-full h-full pt-16 pb-4 px-8">
                    <VoiceAxisSlider
                      zones={[...ENERGY_ZONES]}
                      value={energyToZone(energy)}
                      onChange={(zone) => onUpdate({ paletteEnergy: zoneToEnergy(zone) })}
                      leftLabel="Calm"
                      rightLabel="Energetic"
                    />
                  </div>
                </ConfiguratorCardSurface>
              </div>

              {/* Contrast Slider */}
              <div className="w-full text-center">
                <ConfiguratorCardSurface isHoverable={false} className="w-full relative overflow-hidden">
                  <ConfiguratorCardHeader title="Contrast" metaLabel="SYS.CONTRAST" delay={0.35} />
                  <div className="w-full h-full pt-16 pb-4 px-8">
                    <VoiceAxisSlider
                      zones={[...CONTRAST_ZONES]}
                      value={contrastToZone(contrast)}
                      onChange={(zone) => onUpdate({ paletteContrast: zoneToContrast(zone) })}
                      leftLabel="Subtle"
                      rightLabel="Bold"
                    />
                  </div>
                </ConfiguratorCardSurface>
              </div>
            </div>
          </motion.div>
        </div>
      </StepLayout>
    );
  }
);
