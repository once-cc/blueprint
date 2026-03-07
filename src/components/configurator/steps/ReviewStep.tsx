import { useState, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Blueprint, BlueprintReference, BRAND_ARCHETYPES, SALES_PERSONALITIES } from '@/types/blueprint';
import { StepLayout } from '../StepLayout';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Pencil, Building2, MessageCircle, Zap, Palette, Type,
  Layers, Rocket, Image, CheckCircle2, User, Mail, ChevronDown, ArrowLeft
} from 'lucide-react';
import { UserDetailsForm, UserDetailsData } from '../ui/UserDetailsForm';
import { z } from 'zod';
import { useIsMobile } from '@/hooks/use-mobile';
import { riskToZone } from './CreativeRiskStep';

interface ReviewStepProps {
  blueprint: Blueprint;
  references: BlueprintReference[];
  onUpdateUserDetails: (data: Partial<UserDetailsData>) => void;
  onGoToStep: (step: number) => void;
  onSubmit: (userDetails?: { firstName?: string; lastName?: string; userEmail?: string; businessName?: string }) => Promise<boolean>;
  onBack: () => void;
}

const userDetailsSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().trim().min(1, 'Last name is required').max(50, 'Last name too long'),
  userEmail: z.string().trim().email('Invalid email').max(255, 'Email too long'),
  businessName: z.string().trim().min(1, 'Business / Brand name is required').max(200, 'Business name too long'),
});

const sections = [
  {
    act: 'Discovery',
    icon: Building2,
    steps: [
      { step: 1, title: 'Business Foundations', icon: Building2 },
      { step: 2, title: 'Brand Voice', icon: MessageCircle },
      { step: 3, title: 'CTA Energy', icon: Zap },
    ]
  },
  {
    act: 'Design',
    icon: Palette,
    steps: [
      { step: 4, title: 'Visual Style', icon: Palette },
      { step: 5, title: 'Typography & Motion', icon: Type },
      { step: 6, title: 'Colour & Imagery', icon: Layers },
    ]
  },
  {
    act: 'Deliver',
    icon: Rocket,
    steps: [
      { step: 7, title: 'Functionality & Scope', icon: Layers },
      { step: 8, title: 'Creative Risk', icon: Rocket },
      { step: 9, title: 'References', icon: Image },
    ]
  },
];

// Color swatch component for displaying palette colors
const ColorSwatch = ({ role, color }: { role: string; color: string }) => (
  <div className="flex items-center gap-2">
    <div
      className="w-4 h-4 rounded-full border border-border/50 shrink-0"
      style={{ backgroundColor: color }}
    />
    <span className="text-xs text-muted-foreground">
      {role}: <span className="font-mono text-foreground/80">{color.toUpperCase()}</span>
    </span>
  </div>
);

// Muted "Not provided" display
const NotProvided = () => (
  <span className="text-xs text-muted-foreground/50 italic">Not provided</span>
);

export const ReviewStep = forwardRef<HTMLDivElement, ReviewStepProps>(
  function ReviewStep({
    blueprint,
    references,
    onUpdateUserDetails,
    onGoToStep,
    onSubmit,
    onBack
  }, ref) {
    const isMobile = useIsMobile();
    const [expandedSteps, setExpandedSteps] = useState<Record<number, boolean>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [localDetails, setLocalDetails] = useState({
      firstName: blueprint.firstName || '',
      lastName: blueprint.lastName || '',
      userEmail: blueprint.userEmail || '',
      businessName: blueprint.businessName || '',
    });

    const toggleStep = (step: number) => {
      setExpandedSteps(prev => ({ ...prev, [step]: !prev[step] }));
    };

    const handleDetailChange = (field: keyof typeof localDetails, value: string) => {
      setLocalDetails(prev => ({ ...prev, [field]: value }));
      setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const handleSubmit = async () => {
      // Validate user details
      const result = userDetailsSchema.safeParse(localDetails);
      if (!result.success) {
        const newErrors: Record<string, string> = {};
        result.error.errors.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
        return;
      }

      // Update user details in React state (for local consistency)
      onUpdateUserDetails(localDetails);

      setIsSubmitting(true);
      try {
        // Pass user details directly through the submit chain
        // This bypasses the debounced sync race condition
        await onSubmit(localDetails);
      } finally {
        setIsSubmitting(false);
      }
    };

    const getDiscoverySummary = (step: number): string[] => {
      const { discovery } = blueprint;
      switch (step) {
        case 1:
          return [
            discovery.siteTopic && `Platform Focus: ${discovery.siteTopic}`,
            discovery.businessType && `Type: ${discovery.businessType.replace(/_/g, ' ')}`,
            discovery.primaryPurpose && `Purpose: ${discovery.primaryPurpose.replace(/_/g, ' ')}`,
            discovery.mainConversionGoal && `Primary Goal: ${discovery.mainConversionGoal.replace(/_/g, ' ')}`,
            discovery.conversionGoals && discovery.conversionGoals.length > 0
              ? `Specific Goals: ${discovery.conversionGoals.map(g => g.replace(/_/g, ' ')).join(', ')}`
              : null,
          ].filter(Boolean) as string[];
        case 2: {
          const archetype = BRAND_ARCHETYPES.find(a => a.id === discovery.brandArchetype);
          const brandVoice = discovery.brandVoice || {};
          return [
            archetype && `Archetype: ${archetype.title}`,
            (brandVoice.tone || discovery.tonePrimary) && `Tone: ${brandVoice.tone || discovery.tonePrimary}`,
            brandVoice.presence && `Presence: ${brandVoice.presence}`,
            (brandVoice.personality || discovery.personalityTags?.[0]) && `Personality: ${brandVoice.personality || discovery.personalityTags?.[0]}`,
            (brandVoice.visitorFeeling?.energy || discovery.targetFeelings?.[0]) && `Energy: ${brandVoice.visitorFeeling?.energy || discovery.targetFeelings?.[0]}`,
          ].filter(Boolean) as string[];
        }
        case 3: {
          const personality = SALES_PERSONALITIES.find(p => p.id === discovery.salesPersonality);
          return [
            personality && `Style: ${personality.title}`,
            discovery.ctaPrimaryLabel && `CTA: "${discovery.ctaPrimaryLabel}"`,
          ].filter(Boolean) as string[];
        }
        default:
          return [];
      }
    };

    const getDesignSummary = (step: number): string[] => {
      const { design } = blueprint;
      switch (step) {
        case 4:
          return [
            design.visualStyle && `Style: ${design.visualStyle.replace(/_/g, ' ')}`,
            design.imageryStyle && `Imagery: ${design.imageryStyle}`,
          ].filter(Boolean) as string[];
        case 5:
          return [
            (design.typography_direction || design.typographyStyle) && `Typography: ${(design.typography_direction || design.typographyStyle)!.replace(/_/g, ' ')}`,
            design.fontWeight && `Weight: ${design.fontWeight}`,
            design.animationIntensity && `Animation: ${design.animationIntensity}/10`,
          ].filter(Boolean) as string[];
        case 6: {
          const lines: string[] = [];
          if (design.imageryStyle) {
            lines.push(`Imagery: ${design.imageryStyle}`);
          }
          if (design.colourPaletteStyle) {
            lines.push(`Palette: ${design.colourPaletteStyle}`);
          }
          return lines;
        }
        default:
          return [];
      }
    };

    // Get color palette items for Step 6 (rendered separately with swatches)
    const getColorPaletteItems = (): { role: string; color: string }[] => {
      const { design } = blueprint;
      if (design.generatedPalette && design.generatedPalette.length > 0) {
        return design.generatedPalette;
      }
      // Fallback to legacy customPalette
      if (design.customPalette && design.customPalette.length > 0) {
        return design.customPalette;
      }
      return [];
    };

    const getDeliverSummary = (step: number): string[] => {
      const { deliver } = blueprint;
      switch (step) {
        case 7:
          return [
            deliver.pages?.length && `${deliver.pages.length} pages`,
            deliver.features?.length && `${deliver.features.length} features`,
            deliver.timeline && `Timeline: ${deliver.timeline.replace(/_/g, ' ')}`,
            deliver.budget && `Budget: ${deliver.budget.replace(/_/g, ' ')}`,
          ].filter(Boolean) as string[];
        case 8:
          return [
            deliver.riskTolerance && `Risk: ${deliver.riskTolerance}/10 (${riskToZone(deliver.riskTolerance)})`,
          ].filter(Boolean) as string[];
        case 9:
          return references?.length > 0
            ? references.map(ref => ref.filename || ref.label || ref.url || 'Unnamed Reference')
            : ['No references uploaded'];
        default:
          return [];
      }
    };

    const getSummary = (step: number): string[] => {
      if (step <= 3) return getDiscoverySummary(step);
      if (step <= 6) return getDesignSummary(step);
      return getDeliverSummary(step);
    };

    // Render step content (shared between desktop and mobile expanded view)
    const renderStepContent = (step: { step: number; title: string; icon: React.ElementType }) => {
      const summary = getSummary(step.step);
      const hasContent = summary.length > 0;
      const paletteItems = step.step === 6 ? getColorPaletteItems() : [];
      const hasPalette = paletteItems.length > 0;

      return (
        <>
          {hasContent ? (
            <ul className="space-y-1">
              {summary.map((item, i) => (
                <li
                  key={i}
                  className="text-xs text-muted-foreground flex items-start gap-1.5"
                >
                  <CheckCircle2 className="w-3 h-3 text-accent shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          ) : !hasPalette ? (
            <p className="text-xs text-muted-foreground/60 italic">
              Not yet configured
            </p>
          ) : null}

          {/* Color palette swatches for Step 6 */}
          {step.step === 6 && (
            <div className="mt-2 space-y-1.5">
              {hasPalette ? (
                paletteItems.map((item, i) => (
                  <ColorSwatch key={i} role={item.role} color={item.color} />
                ))
              ) : (
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full bg-muted/30 border border-dashed border-border/50 shrink-0" />
                  <NotProvided />
                </div>
              )}
            </div>
          )}
        </>
      );
    };

    return (
      <StepLayout
        ref={ref}
        act="review"
        stepNumber={10}
        title="Review & Generate"
        framing="Review your Blueprint and bring it to life."
        onBack={onBack}
        onNext={handleSubmit}
        canGoNext={!!localDetails.firstName && !!localDetails.lastName && !!localDetails.userEmail && !!localDetails.businessName}
        isLoading={isSubmitting}
        nextLabel="Generate Blueprint"
      >
        <div className="space-y-10">
          <UserDetailsForm
            details={localDetails}
            errors={errors}
            onChange={handleDetailChange}
          />

          {/* Blueprint Summary */}
          <div className="space-y-6">
            {sections.map((section, sectionIndex) => (
              <motion.div
                key={section.act}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + sectionIndex * 0.1 }}
                className="space-y-3"
              >
                <div className="flex items-center gap-2">
                  <section.icon className="w-4 h-4 text-accent" />
                  <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                    Act {sectionIndex + 1}: {section.act}
                  </h3>
                </div>

                {/* Desktop: Grid layout */}
                {!isMobile && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {section.steps.map((step) => {
                      const summary = getSummary(step.step);
                      const paletteItems = step.step === 6 ? getColorPaletteItems() : [];
                      const hasContent = summary.length > 0 || paletteItems.length > 0;

                      return (
                        <div
                          key={step.step}
                          className="p-4 rounded-xl border border-border/40 dark:border-border/50 transition-all duration-[220ms] ease-out cfg-surface bg-card/80 backdrop-blur-sm group hover:border-border hover:bg-card/90"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <step.icon className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm font-medium text-foreground">
                                {step.title}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onGoToStep(step.step)}
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-accent"
                            >
                              <Pencil className="w-3 h-3" />
                            </Button>
                          </div>

                          {renderStepContent(step)}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Mobile: Collapsible dropdowns */}
                {isMobile && (
                  <div className="space-y-2">
                    {section.steps.map((step) => {
                      const isExpanded = expandedSteps[step.step] || false;
                      const summary = getSummary(step.step);
                      const paletteItems = step.step === 6 ? getColorPaletteItems() : [];
                      const hasContent = summary.length > 0 || paletteItems.length > 0;

                      return (
                        <div
                          key={step.step}
                          className="rounded-xl border border-border/40 dark:border-border/50 transition-all duration-[220ms] ease-out cfg-surface bg-card/80 backdrop-blur-sm overflow-hidden group hover:border-border hover:bg-card/90"
                        >
                          {/* Collapsible header */}
                          <button
                            type="button"
                            onClick={() => toggleStep(step.step)}
                            className="w-full p-4 flex items-center justify-between text-left"
                          >
                            <div className="flex items-center gap-2">
                              <step.icon className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm font-medium text-foreground">
                                {step.title}
                              </span>
                              {hasContent && (
                                <CheckCircle2 className="w-3 h-3 text-accent" />
                              )}
                            </div>
                            <ChevronDown
                              className={cn(
                                'w-4 h-4 text-muted-foreground transition-transform duration-200',
                                isExpanded && 'rotate-180'
                              )}
                            />
                          </button>

                          {/* Expanded content */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="px-4 pb-4 pt-0">
                                  <div className="flex justify-end mb-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => onGoToStep(step.step)}
                                      className="h-7 px-2 text-xs text-muted-foreground hover:text-accent"
                                    >
                                      <Pencil className="w-3 h-3 mr-1" />
                                      Edit
                                    </Button>
                                  </div>
                                  {renderStepContent(step)}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Mobile Back Button & Dream Intent Preview */}
          <div className="space-y-4 pt-2">
            {/* Mobile Back */}
            {isMobile && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start w-full sm:hidden"
              >
                <Button
                  onClick={onBack}
                  size="sm"
                  className="relative overflow-hidden group bg-transparent text-muted-foreground hover:text-accent-foreground hover:bg-transparent shadow-none border-0 w-8 h-8 p-0 transition-colors duration-300 -ml-2"
                  aria-label="Go back"
                >
                  <span className="absolute inset-0 bg-accent -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out" />
                  <ArrowLeft className="relative z-10 w-4 h-4" />
                </Button>
              </motion.div>
            )}

            {/* Dream Intent Preview */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="p-5 rounded-xl transition-all duration-[220ms] ease-out cfg-surface border border-accent/50 bg-card/80 backdrop-blur-sm text-center"
            >
              <p className="text-xs uppercase tracking-wider text-accent mb-2">Your Vision</p>
              <p className={cn("italic", blueprint.dreamIntent ? "text-foreground" : "text-muted-foreground")}>
                {blueprint.dreamIntent ? `"${blueprint.dreamIntent}"` : "Not yet configured."}
              </p>
            </motion.div>
          </div>
        </div>
      </StepLayout>
    );
  }
);
