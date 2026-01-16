import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { BlueprintDesign } from '@/types/blueprint';
import { StepLayout } from '../StepLayout';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Minimize2, Film, Building2, Crown, Sparkles, Cpu, CheckCircle2 } from 'lucide-react';
import { springConfig, cardHover, cardTap, getContentShift, getIconAnimation } from '../ui/animationConfig';

interface VisualStyleStepProps {
  design: BlueprintDesign;
  onUpdate: (updates: Partial<BlueprintDesign>) => void;
  onBack: () => void;
  onNext: () => void;
}

const visualStyles = [
  { value: 'minimal', label: 'Minimal & Clean', description: 'Simple, focused, lots of space', icon: Minimize2 },
  { value: 'dark_cinematic', label: 'Dark & Cinematic', description: 'Dramatic, immersive, bold', icon: Film },
  { value: 'urban', label: 'Urban / Street', description: 'Edgy, authentic, raw', icon: Building2 },
  { value: 'luxury', label: 'Luxury Premium', description: 'Refined, elegant, exclusive', icon: Crown },
  { value: 'playful', label: 'Playful & Creative', description: 'Fun, energetic, dynamic', icon: Sparkles },
  { value: 'tech', label: 'Tech / Modern', description: 'Sleek, innovative, digital', icon: Cpu },
] as const;


const imageryStyles = [
  { value: 'photography', label: 'Photography', description: 'Real photos, human, authentic' },
  { value: 'illustrations', label: 'Illustrations', description: 'Custom artwork, unique style' },
  { value: 'product', label: 'Product Focus', description: 'Clean product shots, detail oriented' },
  { value: 'cinematic', label: 'Cinematic', description: 'Film-like quality, moody lighting' },
  { value: 'minimal', label: 'Minimal / Abstract', description: 'Simple shapes, clean forms' },
] as const;

export const VisualStyleStep = forwardRef<HTMLDivElement, VisualStyleStepProps>(
  function VisualStyleStep({
    design,
    onUpdate,
    onBack,
    onNext,
  }, ref) {
    // Validation - only require visualStyle now
    const isValid = !!design.visualStyle;

    return (
      <StepLayout
        ref={ref}
        act="design"
      stepNumber={4}
      title="Visual Style"
      framing="What aesthetic direction fits your brand?"
      helperText={!isValid ? "Select an aesthetic to continue" : undefined}
      onBack={onBack}
      onNext={onNext}
      canGoNext={isValid}
    >
      <div className="space-y-8">
        {/* Overall Aesthetic */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <Label className={cn(
            "text-sm font-medium flex items-center gap-2",
            design.visualStyle ? 'text-foreground' : 'text-muted-foreground'
          )}>
            Overall Aesthetic <span className="text-destructive">*</span>
            {design.visualStyle && <CheckCircle2 className="w-4 h-4 text-accent" />}
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {visualStyles.map((style, index) => {
              const Icon = style.icon;
              const isSelected = design.visualStyle === style.value;

              return (
                <motion.button
                  key={style.value}
                  type="button"
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ ...springConfig, delay: 0.05 * index }}
                  whileHover={{ ...cardHover, transition: springConfig }}
                  whileTap={{ ...cardTap, transition: springConfig }}
                  onClick={() => onUpdate({ visualStyle: style.value })}
                  className={cn(
                    'p-3 rounded-lg border text-left transition-all duration-300 group',
                    isSelected
                      ? 'border-accent bg-accent/10 shadow-[0_0_20px_hsl(var(--accent)/0.2)]'
                      : 'border-border/50 bg-muted/20 hover:border-border hover:bg-muted/40'
                  )}
                >
                  <motion.div 
                    animate={{ ...getContentShift(isSelected), ...getIconAnimation(isSelected) }}
                    transition={springConfig}
                    className={cn(
                      'w-7 h-7 rounded-md flex items-center justify-center mb-2 transition-colors',
                      isSelected ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground group-hover:text-foreground'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </motion.div>
                  <motion.h4 
                    animate={getContentShift(isSelected)}
                    transition={springConfig}
                    className="font-medium text-foreground text-sm mb-1"
                  >
                    {style.label}
                  </motion.h4>
                  <motion.p 
                    animate={getContentShift(isSelected)}
                    transition={springConfig}
                    className="text-xs text-muted-foreground"
                  >
                    {style.description}
                  </motion.p>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Imagery Style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <Label className="text-sm font-medium text-foreground">Imagery Style</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {imageryStyles.map((style, index) => {
              const isSelected = design.imageryStyle === style.value;

              return (
                <motion.button
                  key={style.value}
                  type="button"
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ ...springConfig, delay: 0.05 * index }}
                  whileHover={{ ...cardHover, transition: springConfig }}
                  whileTap={{ ...cardTap, transition: springConfig }}
                  onClick={() => onUpdate({ imageryStyle: style.value })}
                  className={cn(
                    'p-3 rounded-lg border text-left transition-all duration-300',
                    isSelected
                      ? 'border-accent bg-accent/10 shadow-[0_0_20px_hsl(var(--accent)/0.2)]'
                      : 'border-border/50 bg-muted/20 hover:border-border hover:bg-muted/40'
                  )}
                >
                  <motion.h4 
                    animate={getContentShift(isSelected)}
                    transition={springConfig}
                    className="font-medium text-foreground text-sm mb-1"
                  >
                    {style.label}
                  </motion.h4>
                  <motion.p 
                    animate={getContentShift(isSelected)}
                    transition={springConfig}
                    className="text-xs text-muted-foreground"
                  >
                    {style.description}
                  </motion.p>
                </motion.button>
              );
            })}
          </div>
          </motion.div>
        </div>
      </StepLayout>
    );
  }
);
