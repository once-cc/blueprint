import { forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BlueprintDesign } from '@/types/blueprint';
import { StepLayout } from '../StepLayout';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { springConfig } from '../ui/animationConfig';
import { ConfiguratorDropdown, DropdownItem } from '../ui/ConfiguratorDropdown';
interface TypographyMotionStepProps {
  design: BlueprintDesign;
  onUpdate: (updates: Partial<BlueprintDesign>) => void;
  onBack: () => void;
  onNext: () => void;
}

// Clamp utility for weight calculations
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

// Weight preference targets type
type WeightPrefTargets = {
  light: { h1: number; h2: number; h3: number; h4: number; body: number };
  regular: { h1: number; h2: number; h3: number; h4: number; body: number };
  mixed: { h1: number; h2: number; h3: number; h4: number; body: number };
  bold: { h1: number; h2: number; h3: number; h4: number; body: number };
};

const typographyStyles: Array<{
  value: string;
  label: string;
  fontFamily: string;
  headingWeight: number;
  bodyWeight: number;
  maxHeadingWeight: number;
  minBodyWeight: number;
  weightPrefTargets: WeightPrefTargets;
  useCaseHints: { h1: string; h2: string; h3: string };
}> = [
    {
      value: 'modern_minimal',
      label: 'Modern Minimal',
      fontFamily: 'Inter, system-ui, sans-serif',
      headingWeight: 500,
      bodyWeight: 400,
      maxHeadingWeight: 800,
      minBodyWeight: 300,
      weightPrefTargets: {
        light: { h1: 500, h2: 450, h3: 400, h4: 400, body: 300 },
        regular: { h1: 600, h2: 550, h3: 500, h4: 450, body: 400 },
        mixed: { h1: 700, h2: 600, h3: 500, h4: 450, body: 300 },
        bold: { h1: 800, h2: 700, h3: 600, h4: 550, body: 500 },
      },
      useCaseHints: { h1: 'Clean product launches', h2: 'Streamlined portfolios', h3: 'Tech-forward brands' }
    },
    {
      value: 'elegant_premium',
      label: 'Elegant Premium',
      fontFamily: 'Playfair Display, Georgia, serif',
      headingWeight: 500,
      bodyWeight: 400,
      maxHeadingWeight: 900,
      minBodyWeight: 300,
      weightPrefTargets: {
        light: { h1: 500, h2: 450, h3: 400, h4: 400, body: 300 },
        regular: { h1: 600, h2: 550, h3: 500, h4: 450, body: 400 },
        mixed: { h1: 700, h2: 600, h3: 550, h4: 500, body: 300 },
        bold: { h1: 800, h2: 700, h3: 650, h4: 600, body: 500 },
      },
      useCaseHints: { h1: 'Luxury brand storytelling', h2: 'High-end hospitality', h3: 'Refined lifestyle brands' }
    },
    {
      value: 'bold_expressive',
      label: 'Bold Expressive',
      fontFamily: 'Syne, sans-serif',
      headingWeight: 700,
      bodyWeight: 400,
      maxHeadingWeight: 850,
      minBodyWeight: 300,
      weightPrefTargets: {
        light: { h1: 600, h2: 550, h3: 500, h4: 450, body: 300 },
        regular: { h1: 700, h2: 650, h3: 600, h4: 550, body: 400 },
        mixed: { h1: 780, h2: 720, h3: 650, h4: 600, body: 300 },
        bold: { h1: 850, h2: 800, h3: 750, h4: 700, body: 500 },
      },
      useCaseHints: { h1: 'Creative agency manifestos', h2: 'Event campaigns', h3: 'Youth-focused brands' }
    },
    {
      value: 'tech_sans',
      label: 'Tech / Sans-Serif',
      fontFamily: 'Space Grotesk, system-ui, sans-serif',
      headingWeight: 600,
      bodyWeight: 400,
      maxHeadingWeight: 700,
      minBodyWeight: 300,
      weightPrefTargets: {
        light: { h1: 500, h2: 450, h3: 400, h4: 400, body: 300 },
        regular: { h1: 600, h2: 550, h3: 500, h4: 450, body: 400 },
        mixed: { h1: 700, h2: 600, h3: 500, h4: 450, body: 300 },
        bold: { h1: 700, h2: 700, h3: 600, h4: 500, body: 500 },
      },
      useCaseHints: { h1: 'SaaS product interfaces', h2: 'Developer documentation', h3: 'Fintech dashboards' }
    },
    {
      value: 'editorial',
      label: 'Editorial',
      fontFamily: 'Cormorant Garamond, serif',
      headingWeight: 400,
      bodyWeight: 300,
      maxHeadingWeight: 700,
      minBodyWeight: 300,
      weightPrefTargets: {
        light: { h1: 400, h2: 350, h3: 300, h4: 300, body: 300 },
        regular: { h1: 500, h2: 450, h3: 400, h4: 350, body: 300 },
        mixed: { h1: 600, h2: 500, h3: 400, h4: 350, body: 300 },
        bold: { h1: 700, h2: 600, h3: 500, h4: 450, body: 400 },
      },
      useCaseHints: { h1: 'Long-form journalism', h2: 'Cultural publications', h3: 'Author portfolios' }
    },
    {
      value: 'display',
      label: 'Display / Statement',
      fontFamily: 'Oswald, Impact, sans-serif',
      headingWeight: 500,
      bodyWeight: 400,
      maxHeadingWeight: 700,
      minBodyWeight: 300,
      weightPrefTargets: {
        light: { h1: 400, h2: 400, h3: 400, h4: 400, body: 300 },
        regular: { h1: 500, h2: 500, h3: 500, h4: 500, body: 400 },
        mixed: { h1: 700, h2: 600, h3: 500, h4: 500, body: 300 },
        bold: { h1: 700, h2: 700, h3: 600, h4: 600, body: 500 },
      },
      useCaseHints: { h1: 'Hero announcements', h2: 'Sports & entertainment', h3: 'Bold campaign headlines' }
    },
  ];

const fontWeights = [
  { value: 'light', label: 'Light / Thin' },
  { value: 'regular', label: 'Regular' },
  { value: 'mixed', label: 'Mixed Weights' },
  { value: 'bold', label: 'Bold / Heavy' },
] as const;

export const TypographyMotionStep = forwardRef<HTMLDivElement, TypographyMotionStepProps>(
  function TypographyMotionStep({
    design,
    onUpdate,
    onBack,
    onNext,
  }, ref) {
    // Validation - support both new and legacy field names
    const currentTypography = design.typography_direction || design.typographyStyle;
    const isValid = !!currentTypography;

    // Get current selected style
    const selectedStyle = typographyStyles.find(s => s.value === currentTypography);

    // Transform typography styles to dropdown items
    const typographyItems: DropdownItem[] = typographyStyles.map(style => ({
      value: style.value,
      label: style.label,
      fontFamily: style.fontFamily,
      fontWeight: style.headingWeight,
      renderPreview: (
        <div className="space-y-1" style={{ fontFamily: style.fontFamily }}>
          <p
            className="text-base text-foreground leading-tight"
            style={{ fontWeight: style.headingWeight }}
          >
            {style.useCaseHints.h1}
          </p>
          <p
            className="text-sm text-foreground/80 leading-tight"
            style={{ fontWeight: Math.max(300, style.headingWeight - 100) }}
          >
            {style.useCaseHints.h2}
          </p>
          <p
            className="text-xs text-muted-foreground leading-tight"
            style={{ fontWeight: style.bodyWeight }}
          >
            {style.useCaseHints.h3}
          </p>
        </div>
      ),
    }));

    return (
      <StepLayout
        ref={ref}
        act="design"
        stepNumber={5}
        title="Typography Direction"
        framing="Set the typographic posture for your brand."
        onBack={onBack}
        onNext={onNext}
        canGoNext={isValid}
      >
        <div className="space-y-6">
          {/* Typography Style Dropdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-2"
          >
            <ConfiguratorDropdown
              label="Typography Direction"
              required
              value={currentTypography ?? null}
              onChange={(value) => onUpdate({
                typography_direction: value as BlueprintDesign['typography_direction'],
                typographyStyle: value as BlueprintDesign['typographyStyle'] // Backward compat
              })}
              items={typographyItems}
              maxHeight={320}
            />
            <p className="text-xs text-muted-foreground leading-relaxed px-1">
              Direction, not selection.<br />
              This helps us understand the typographic posture your site should aim toward — not the exact fonts that will be used.
            </p>
          </motion.div>

          {/* Live Typography Preview */}
          <AnimatePresence mode="wait">
            {currentTypography && (
              <motion.div
                initial={{ opacity: 0, y: 20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="p-5 rounded-xl border border-border/50 bg-card/50 overflow-hidden"
              >
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-4">Preview</p>
                <AnimatePresence mode="popLayout">
                  {(() => {
                    const style = typographyStyles.find(s => s.value === currentTypography);
                    if (!style) return null;

                    // Get weight targets for current preference using per-style lookup
                    const fontWeightPref = (design.fontWeight || 'regular') as 'light' | 'regular' | 'mixed' | 'bold';
                    const targets = style.weightPrefTargets[fontWeightPref] || style.weightPrefTargets.regular;

                    // Clamp weights to style's allowed range
                    const maxWeight = style.maxHeadingWeight;
                    const minBody = style.minBodyWeight;

                    const effectiveH1Weight = clamp(targets.h1, 100, maxWeight);
                    const effectiveH2Weight = clamp(targets.h2, 100, maxWeight);
                    const effectiveH3Weight = clamp(targets.h3, 100, maxWeight);
                    const effectiveH4Weight = clamp(targets.h4, 100, maxWeight);
                    const effectiveBodyWeight = clamp(targets.body, minBody, 700);

                    return (
                      <motion.div
                        key={currentTypography}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="space-y-3"
                        style={{ fontFamily: style.fontFamily }}
                      >
                        <motion.h1
                          className="text-3xl md:text-4xl text-foreground"
                          style={{ fontFamily: style.fontFamily }}
                          animate={{ fontWeight: effectiveH1Weight }}
                          transition={{ duration: 0.3, ease: 'easeOut' }}
                        >
                          {style.useCaseHints.h1}
                        </motion.h1>
                        <motion.h2
                          className="text-xl md:text-2xl text-foreground/90"
                          style={{ fontFamily: style.fontFamily }}
                          animate={{ fontWeight: effectiveH2Weight }}
                          transition={{ duration: 0.3, ease: 'easeOut' }}
                        >
                          {style.useCaseHints.h2}
                        </motion.h2>
                        <motion.h3
                          className="text-base md:text-lg text-foreground/80"
                          style={{ fontFamily: style.fontFamily }}
                          animate={{ fontWeight: effectiveH3Weight }}
                          transition={{ duration: 0.3, ease: 'easeOut' }}
                        >
                          {style.useCaseHints.h3}
                        </motion.h3>
                        <motion.h4
                          className="text-sm md:text-base font-medium text-foreground/70"
                          style={{ fontFamily: style.fontFamily }}
                          animate={{ fontWeight: effectiveH4Weight }}
                          transition={{ duration: 0.3, ease: 'easeOut' }}
                        >
                          H4 Subheading Example
                        </motion.h4>
                        <motion.p
                          className="text-sm md:text-base text-muted-foreground leading-relaxed pt-2 border-t border-border/30"
                          style={{ fontFamily: style.fontFamily }}
                          animate={{ fontWeight: effectiveBodyWeight }}
                          transition={{ duration: 0.3, ease: 'easeOut' }}
                        >
                          Body text for detailed descriptions and supporting content.
                        </motion.p>
                      </motion.div>
                    );
                  })()}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Font Weight Preference */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="space-y-3"
          >
            <Label className="text-sm font-medium text-foreground">Font Weight Preference</Label>
            <RadioGroup
              value={design.fontWeight}
              onValueChange={(value) => onUpdate({ fontWeight: value as BlueprintDesign['fontWeight'] })}
              className="grid grid-cols-2 md:grid-cols-4 gap-2"
            >
              {fontWeights.map((weight, index) => {
                const isSelected = design.fontWeight === weight.value;

                return (
                  <motion.div
                    key={weight.value}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ ...springConfig, delay: 0.03 * index }}
                    whileHover={{ scale: 1.02, transition: springConfig }}
                    whileTap={{ scale: 0.98, transition: springConfig }}
                  >
                    <Label
                      htmlFor={weight.value}
                      className={cn(
                        'flex items-center justify-center gap-2 px-3 py-2 rounded-full border cursor-pointer transition-all duration-200 text-center',
                        isSelected
                          ? 'border-accent bg-accent/10 text-foreground'
                          : 'border-border/50 bg-muted/20 text-muted-foreground hover:text-foreground hover:bg-muted/40'
                      )}
                    >
                      <RadioGroupItem value={weight.value} id={weight.value} className="sr-only" />
                      <motion.span
                        animate={{ x: isSelected ? 2 : 0 }}
                        transition={springConfig}
                        className="text-sm font-medium"
                      >
                        {weight.label}
                      </motion.span>
                    </Label>
                  </motion.div>
                );
              })}
            </RadioGroup>
          </motion.div>
        </div>
      </StepLayout>
    );
  }
);
