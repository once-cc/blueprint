import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useBlueprint } from '@/hooks/useBlueprint';
import { useLenisScroll } from '@/hooks/useLenisScroll';
import { ProgressRail } from './ProgressRail';
import { DreamIntentHUD } from './DreamIntentHUD';
import { DreamIntentTooltip } from './DreamIntentTooltip';
import { ThemeToggle } from './ThemeToggle';

import { ActTransition } from './ActTransition';
import { SuccessState } from './SuccessState';
import { SessionResumeModal } from './SessionResumeModal';
import { StepLayout } from './StepLayout';
import { VideoLogo } from '@/components/ui/VideoLogo';
import { Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import { ConfiguratorAct } from '@/types/blueprint';
import { useNavigate } from 'react-router-dom';
import { preloadTypographyFonts } from '@/utils/fontPreloader';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Act I: Discovery Steps
import { BusinessFoundationsStep } from './steps/BusinessFoundationsStep';
import { BrandVoiceStep } from './steps/BrandVoiceStep';
import { CTAEnergyStep } from './steps/CTAEnergyStep';

// Act II: Expression Steps
import { VisualStyleStep } from './steps/VisualStyleStep';
import { TypographyMotionStep } from './steps/TypographyMotionStep';
import { ColorPaletteStep } from './steps/ColorPaletteStep';

// Act III: Execution Steps
import { FunctionalityStep } from './steps/FunctionalityStep';
import { CreativeRiskStep } from './steps/CreativeRiskStep';
import { ReferencesStep } from './steps/ReferencesStep';

// Review Step
import { ReviewStep } from './steps/ReviewStep';

import { BlueprintReference, ReferenceRole } from '@/types/blueprint';
import { supabase } from '@/integrations/supabase/client';
import { getBlueprintClient } from '@/lib/blueprintClient';

type TransitionState = { from: ConfiguratorAct; to: ConfiguratorAct } | null;


export function BlueprintConfigurator() {
  const {
    blueprint,
    isLoading,
    sessionStatus,
    updateDiscovery,
    updateDesign,
    updateDeliver,
    updateDreamIntent,
    setCurrentStep,
    updateUserDetails,
    submitBlueprint,
    resetBlueprint,
    confirmSession,
  } = useBlueprint();

  // Reordered transition state to track if we're actively transitioning between acts
  const [activeTransition, setActiveTransition] = useState<TransitionState>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ scores?: { integrity: number; complexity: number; tier?: string } } | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [references, setReferences] = useState<BlueprintReference[]>([]);
  const [showDreamTooltip, setShowDreamTooltip] = useState(false);
  const [isDreamIntentEditing, setIsDreamIntentEditing] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const navigate = useNavigate();
  const { scrollTo } = useLenisScroll();

  // Preload all typography fonts on mount
  useEffect(() => {
    preloadTypographyFonts();
  }, []);

  // Show tooltip on step 1 after a brief delay
  useEffect(() => {
    if (blueprint?.currentStep === 1) {
      const timer = setTimeout(() => setShowDreamTooltip(true), 500);
      return () => clearTimeout(timer);
    } else {
      setShowDreamTooltip(false);
    }
  }, [blueprint?.currentStep]);

  // Track scroll for HUD collapse with hysteresis to prevent wobble
  useEffect(() => {
    let isCurrentlyScrolled = false;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      // Hysteresis: different thresholds for expand vs collapse prevents rapid toggling
      const shouldCollapse = scrollY > 50;
      const shouldExpand = scrollY < 20;

      if (shouldCollapse && !isCurrentlyScrolled) {
        isCurrentlyScrolled = true;
        setIsScrolled(true);
      } else if (shouldExpand && isCurrentlyScrolled) {
        isCurrentlyScrolled = false;
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load existing references when blueprint is available
  useEffect(() => {
    if (!blueprint?.id) return;

    const loadReferences = async () => {
      const blueprintClient = getBlueprintClient();
      if (!blueprintClient) {
        console.error('[Blueprint] No session token found for loading references');
        return;
      }

      const { data, error } = await blueprintClient
        .from('blueprint_references')
        .select('*')
        .eq('blueprint_id', blueprint.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('[Blueprint] Failed to load references:', error);
        return;
      }

      if (data) {
        // Refresh signed URLs for uploaded files
        const refsWithUrls = await Promise.all(
          data.map(async (ref) => {
            let url = ref.url;

            // Refresh signed URL if this is an uploaded file (not a link)
            if (ref.storage_path && ref.type !== 'link') {
              const { data: signedData } = await supabase.storage
                .from('blueprint-references')
                .createSignedUrl(ref.storage_path, 3600);
              if (signedData?.signedUrl) {
                url = signedData.signedUrl;
              }
            }

            return {
              id: ref.id,
              blueprintId: ref.blueprint_id,
              type: ref.type as 'image' | 'pdf' | 'link',
              url,
              filename: ref.filename || undefined,
              storagePath: ref.storage_path || undefined,
              role: (ref.role as ReferenceRole) || 'other',
              notes: ref.notes || undefined,
              label: ref.label || undefined,
              createdAt: new Date(ref.created_at),
            };
          })
        );

        setReferences(refsWithUrls);
      }
    };

    loadReferences();
  }, [blueprint?.id]);

  // We removed the early return for isLoading to allow a smooth overlay transition

  if (isSubmitted || blueprint?.status === 'submitted') {
    return (
      <SuccessState
        blueprintId={blueprint?.id || ''}
        blueprint={blueprint!}
        scores={submitResult?.scores || null}
        deliver={blueprint?.deliver as Record<string, unknown> | null}
      />
    );
  }

  // Show resume modal for returning users
  if (sessionStatus.hasExisting && !sessionStatus.confirmed) {
    return (
      <SessionResumeModal
        isOpen={true}
        onContinue={confirmSession}
        onStartFresh={resetBlueprint}
        lastUpdated={blueprint?.updatedAt || new Date()}
        currentStep={blueprint?.currentStep || 1}
        dreamIntent={blueprint?.dreamIntent}
      />
    );
  }

  const currentStep = blueprint?.currentStep ?? 1;

  const goToStep = (step: number) => {
    // Check for act transitions
    const fromAct = getActForStep(currentStep);
    const toAct = getActForStep(step);

    if (step > currentStep && fromAct !== toAct && toAct !== 'review') {
      setActiveTransition({ from: fromAct, to: toAct });
    } else {
      setCurrentStep(step);
    }
    // Scroll to step header anchor on step change
    setTimeout(() => {
      if (document.getElementById('step-header-anchor')) {
        scrollTo('#step-header-anchor', { duration: 0.8, offset: -120 });
      }
    }, 50);
  };

  const handleTransitionContinue = () => {
    if (activeTransition) {
      const nextStep = activeTransition.to === 'design' ? 4 : 7;
      setCurrentStep(nextStep);
      setActiveTransition(null);
      setTimeout(() => {
        if (document.getElementById('step-header-anchor')) {
          scrollTo('#step-header-anchor', { duration: 0.8, offset: -120 });
        }
      }, 50);
    }
  };

  const handleSubmit = async () => {
    const result = await submitBlueprint();
    if (result.success) {
      setSubmitResult({ scores: result.scores });
      setIsSubmitted(true);
    }
    return result.success;
  };


  // Render step content
  const renderStep = () => {
    // Intercept with transition screen if active
    if (activeTransition) {
      return (
        <ActTransition
          key={`transition-${activeTransition.from}-${activeTransition.to}`}
          completedAct={activeTransition.from}
          nextAct={activeTransition.to}
          onContinue={handleTransitionContinue}
          discovery={blueprint.discovery}
          design={blueprint.design}
        />
      );
    }

    switch (currentStep) {
      // Act I: Discovery
      case 1:
        return (
          <BusinessFoundationsStep
            key="step-1"
            discovery={blueprint.discovery}
            onUpdate={updateDiscovery}
            onNext={() => goToStep(2)}
          />
        );
      case 2:
        return (
          <BrandVoiceStep
            key="step-2"
            discovery={blueprint.discovery}
            onUpdate={updateDiscovery}
            onBack={() => goToStep(1)}
            onNext={() => goToStep(3)}
          />
        );
      case 3:
        return (
          <CTAEnergyStep
            key="step-3"
            discovery={blueprint.discovery}
            onUpdate={updateDiscovery}
            onBack={() => goToStep(2)}
            onNext={() => goToStep(4)}
          />
        );

      // Act II: Design
      case 4:
        return (
          <VisualStyleStep
            key="step-4"
            design={blueprint.design}
            onUpdate={updateDesign}
            onBack={() => goToStep(3)}
            onNext={() => goToStep(5)}
          />
        );
      case 5:
        return (
          <TypographyMotionStep
            key="step-5"
            design={blueprint.design}
            onUpdate={updateDesign}
            onBack={() => goToStep(4)}
            onNext={() => goToStep(6)}
          />
        );
      case 6:
        return (
          <ColorPaletteStep
            key="step-6"
            design={blueprint.design}
            onUpdate={updateDesign}
            onBack={() => goToStep(5)}
            onNext={() => goToStep(7)}
          />
        );

      // Act III: Deliver
      case 7:
        return (
          <FunctionalityStep
            key="step-7"
            deliver={blueprint.deliver}
            onUpdate={updateDeliver}
            onBack={() => goToStep(6)}
            onNext={() => goToStep(8)}
          />
        );
      case 8:
        return (
          <CreativeRiskStep
            key="step-8"
            deliver={blueprint.deliver}
            onUpdate={updateDeliver}
            onBack={() => goToStep(7)}
            onNext={() => goToStep(9)}
          />
        );
      case 9:
        return (
          <ReferencesStep
            key="step-9"
            blueprintId={blueprint.id}
            references={references}
            onReferencesChange={setReferences}
            onBack={() => goToStep(8)}
            onNext={() => goToStep(10)}
          />
        );

      // Review
      case 10:
        return (
          <ReviewStep
            key="step-10"
            blueprint={blueprint}
            onUpdateUserDetails={updateUserDetails}
            onGoToStep={goToStep}
            onSubmit={handleSubmit}
            onBack={() => goToStep(9)}
          />
        );

      default:
        return null;
    }
  };

  const renderPlaceholder = (act: ConfiguratorAct, step: number) => {
    const stepTitles: Record<number, { title: string; framing: string }> = {
      4: { title: 'Visual Style', framing: 'What aesthetic direction fits your brand?' },
      5: { title: 'Typography & Motion', framing: 'Define your typographic personality and animation style.' },
      6: { title: 'Color Palette', framing: 'Define your colour logic and palette.' },
      7: { title: 'Functionality & Scope', framing: 'What does your website need to do?' },
      8: { title: 'Creative Risk', framing: 'How bold should we be with your design?' },
      9: { title: 'References', framing: 'Share any inspiration or examples you love.' },
      10: { title: 'Review & Generate', framing: 'Review your Blueprint and bring it to life.' },
    };

    const config = stepTitles[step];

    return (
      <StepLayout
        key={`step-${step}`}
        act={act}
        stepNumber={step}
        title={config.title}
        framing={config.framing}
        onBack={() => goToStep(step - 1)}
        onNext={step < 10 ? () => goToStep(step + 1) : undefined}
        nextLabel={step === 10 ? 'Generate Blueprint' : 'Continue'}
      >
        <div className="flex items-center justify-center h-64 border border-dashed border-border/50 rounded-2xl bg-muted/10">
          <p className="text-muted-foreground">
            Step {step} content coming in Phase 3-5
          </p>
        </div>
      </StepLayout>
    );
  };

  return (
    <>
      <AnimatePresence>
        {(isLoading || !blueprint) && (
          <motion.div
            key="splash"
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background overflow-hidden"
            exit={{ opacity: 0, scale: 1.05, filter: 'blur(15px)' }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-accent/5 via-background to-background opacity-50" />
            <motion.div
              className="relative z-10 flex flex-col items-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="relative">
                <motion.div
                  className="absolute inset-0 rounded-full blur-2xl bg-accent/20"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
                <VideoLogo size="lg" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content conditionally wrapped in AnimatePresence but structurally persistent outside the early splash */}
      {!isLoading && blueprint && (
        <motion.div
          initial={{ opacity: 0, filter: 'blur(10px)', y: 20 }}
          animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          className="min-h-screen bg-background bg-editorial-grid"
        >
          {/* Animated gradient background */}
          <div className="animated-gradient-bg" aria-hidden="true" />

          {/* Global Components */}
          <DreamIntentHUD
            dreamIntent={blueprint.dreamIntent}
            onUpdate={updateDreamIntent}
            isCollapsed={isScrolled}
            isEditing={isDreamIntentEditing}
            onEditingChange={setIsDreamIntentEditing}
          />
          <DreamIntentTooltip
            show={showDreamTooltip && currentStep === 1}
            currentStep={currentStep}
            onClick={() => setIsDreamIntentEditing(true)}
          />
          <div className="fixed top-4 right-4 z-50">
            <ThemeToggle />
          </div>



          {/* Main Content */}
          <div className="container mx-auto px-6 sm:px-8 md:px-12 pt-4 pb-16 md:pt-5 md:pb-20">
            {/* Logo above progress - cinematic centered */}
            <motion.div
              className="flex justify-center mb-2"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <button
                onClick={() => setShowExitDialog(true)}
                className="hover:scale-105 transition-transform duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-full"
                aria-label="Return to Blueprint Home"
              >
                <VideoLogo size="sm" />
              </button>
            </motion.div>

            <ProgressRail
              currentStep={currentStep}
              onStepClick={goToStep}
              className="mb-4 md:mb-6"
            />

            <div className="max-w-4xl mx-auto">
              <AnimatePresence mode="wait">
                {renderStep()}
              </AnimatePresence>
            </div>
          </div>

          <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
            <AlertDialogContent className="max-w-[400px]">
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure you want to exit?</AlertDialogTitle>
                <AlertDialogDescription>
                  Your progress is automatically saved to your session. Are you sure you'd like to exit to the Blueprint homepage?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="sm:justify-between flex-col-reverse sm:flex-row w-full mt-6 sm:space-x-0 gap-3">
                <AlertDialogAction
                  onClick={() => navigate('/blueprint')}
                  className="relative overflow-hidden group gap-2 bg-transparent text-foreground hover:text-accent-foreground hover:bg-transparent shadow-none border border-border/50 transition-colors duration-300 w-full sm:w-auto"
                >
                  <span className="absolute inset-0 bg-accent -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out" />
                  <ArrowLeft className="relative z-10 w-4 h-4" />
                  <span className="relative z-10">Exit to Homepage</span>
                </AlertDialogAction>

                <AlertDialogCancel
                  className="gap-2 min-w-[140px] bg-primary text-primary-foreground hover:bg-primary/90 border-transparent hover:scale-105 active:scale-95 transition-all duration-300 mt-0 sm:mt-0 w-full sm:w-auto"
                >
                  Cancel
                  <ArrowRight className="w-4 h-4" />
                </AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </motion.div >
      )
      }
    </>
  );
}

function getActForStep(step: number): ConfiguratorAct {
  if (step <= 3) return 'discovery';
  if (step <= 6) return 'design';
  if (step <= 9) return 'deliver';
  return 'review';
}
