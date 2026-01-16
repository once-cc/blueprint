import { useState, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { BlueprintDesign } from '@/types/blueprint';
import { StepLayout } from '../StepLayout';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Plus, Trash2, RotateCcw } from 'lucide-react';

interface ColourImageryStepProps {
  design: BlueprintDesign;
  onUpdate: (updates: Partial<BlueprintDesign>) => void;
  onBack: () => void;
  onNext: () => void;
}

const defaultPalettes: Record<string, { role: string; color: string }[]> = {
  monochrome: [
    { role: 'Primary', color: '#1a1a1a' },
    { role: 'Secondary', color: '#4a4a4a' },
    { role: 'Accent', color: '#8a8a8a' },
    { role: 'Background', color: '#ffffff' },
  ],
  muted: [
    { role: 'Primary', color: '#2d3436' },
    { role: 'Secondary', color: '#636e72' },
    { role: 'Accent', color: '#ffeaa7' },
    { role: 'Background', color: '#dfe6e9' },
  ],
  bold: [
    { role: 'Primary', color: '#e74c3c' },
    { role: 'Secondary', color: '#3498db' },
    { role: 'Accent', color: '#f39c12' },
    { role: 'Background', color: '#ffffff' },
  ],
  dark: [
    { role: 'Primary', color: '#0d0d0d' },
    { role: 'Secondary', color: '#1a1a2e' },
    { role: 'Accent', color: '#e94560' },
    { role: 'Background', color: '#16213e' },
  ],
  pastels: [
    { role: 'Primary', color: '#a29bfe' },
    { role: 'Secondary', color: '#74b9ff' },
    { role: 'Accent', color: '#fd79a8' },
    { role: 'Background', color: '#ffeef0' },
  ],
};

const imageryStylesRefined = [
  { value: 'photography', label: 'Photography', description: 'Real photos, human, authentic' },
  { value: 'illustrations', label: 'Illustrations', description: 'Custom artwork, unique style' },
  { value: 'product', label: 'Product Focus', description: 'Clean product shots, detail oriented' },
  { value: 'cinematic', label: 'Cinematic', description: 'Film-like quality, moody lighting' },
  { value: 'minimal', label: 'Minimal / Abstract', description: 'Simple shapes, clean forms' },
  { value: 'mixed', label: 'Mixed Media', description: 'Blend of photo and illustration' },
] as const;


export const ColourImageryStep = forwardRef<HTMLDivElement, ColourImageryStepProps>(
  function ColourImageryStep({
    design,
    onUpdate,
    onBack,
    onNext,
  }, ref) {
    const [activeColorIndex, setActiveColorIndex] = useState(0);
  
    const palette = design.customPalette || 
      (design.colourPaletteStyle && defaultPalettes[design.colourPaletteStyle]) || 
      defaultPalettes.dark;

    const updatePalette = (newPalette: { role: string; color: string }[]) => {
      onUpdate({ customPalette: newPalette });
    };

    const updateColor = (index: number, color: string) => {
      const newPalette = [...palette];
      newPalette[index] = { ...newPalette[index], color };
      updatePalette(newPalette);
    };

    const updateRole = (index: number, role: string) => {
      const newPalette = [...palette];
      newPalette[index] = { ...newPalette[index], role };
      updatePalette(newPalette);
    };

    const addColor = () => {
      if (palette.length < 5) {
        updatePalette([...palette, { role: 'New Color', color: '#888888' }]);
      }
    };

    const removeColor = (index: number) => {
      if (palette.length > 2) {
        updatePalette(palette.filter((_, i) => i !== index));
        if (activeColorIndex >= palette.length - 1) {
          setActiveColorIndex(Math.max(0, palette.length - 2));
        }
      }
    };

    const resetToRecommended = () => {
      const recommended = design.colourPaletteStyle && defaultPalettes[design.colourPaletteStyle];
      if (recommended) {
        updatePalette(recommended);
      }
    };

    // ColourImageryStep is optional - no required fields
    return (
      <StepLayout
        ref={ref}
        act="design"
      stepNumber={6}
      title="Colour & Imagery"
      framing="Refine your visual palette and personality."
      helperText="Optional refinements for your brand colors and personality tags."
      onBack={onBack}
      onNext={onNext}
    >
      <div className="space-y-10">
        {/* Custom Brand Palette */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-foreground">Custom Brand Palette</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={resetToRecommended}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Reset to recommended
            </Button>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Color Swatches */}
            <div className="flex gap-2">
              {palette.map((color, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setActiveColorIndex(index)}
                  className={cn(
                    'w-12 h-12 rounded-xl border-2 transition-all duration-200',
                    activeColorIndex === index 
                      ? 'border-accent scale-110 shadow-lg' 
                      : 'border-transparent hover:scale-105'
                  )}
                  style={{ backgroundColor: color.color }}
                />
              ))}
              {palette.length < 5 && (
                <button
                  type="button"
                  onClick={addColor}
                  className="w-12 h-12 rounded-xl border-2 border-dashed border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-border transition-all"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Active Color Editor */}
            <div className="flex-1 p-4 rounded-xl border border-border/50 bg-muted/20">
              <div className="flex items-center justify-between mb-3">
                <Input
                  value={palette[activeColorIndex]?.role || ''}
                  onChange={(e) => updateRole(activeColorIndex, e.target.value)}
                  className="w-32 h-8 text-sm"
                  placeholder="Role name"
                />
                {palette.length > 2 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeColor(activeColorIndex)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={palette[activeColorIndex]?.color || '#000000'}
                  onChange={(e) => updateColor(activeColorIndex, e.target.value)}
                  className="w-10 h-10 rounded-lg border-0 cursor-pointer"
                />
                <Input
                  value={palette[activeColorIndex]?.color || ''}
                  onChange={(e) => updateColor(activeColorIndex, e.target.value)}
                  className="w-28 h-8 text-sm font-mono uppercase"
                  placeholder="#000000"
                />
              </div>
            </div>
          </div>

          {/* Palette Preview */}
          <div className="flex gap-1 h-8 rounded-lg overflow-hidden">
            {palette.map((color, index) => (
              <div
                key={index}
                className="flex-1 transition-all"
                style={{ backgroundColor: color.color }}
              />
            ))}
          </div>
        </motion.div>

        {/* Imagery Style Refinement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <Label className="text-sm font-medium text-foreground">Imagery Style</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {imageryStylesRefined.map((style) => {
              const isSelected = design.imageryStyle === style.value;

              return (
                <button
                  key={style.value}
                  type="button"
                  onClick={() => onUpdate({ imageryStyle: style.value })}
                  className={cn(
                    'p-4 rounded-xl border text-left transition-all duration-300',
                    isSelected
                      ? 'border-accent bg-accent/10 shadow-[0_0_16px_hsl(var(--accent)/0.15)]'
                      : 'border-border/50 bg-muted/20 hover:border-border hover:bg-muted/40'
                  )}
                >
                  <h4 className="font-medium text-foreground text-sm mb-1">
                    {style.label}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {style.description}
                  </p>
                </button>
              );
            })}
          </div>
          </motion.div>

        </div>
      </StepLayout>
    );
  }
);
