import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';
import { useBlueprint } from '@/hooks/useBlueprint';
import { useLenisScroll } from '@/hooks/useLenisScroll';
import { ProgressRail } from './ProgressRail';
import { DreamIntentHUD } from './DreamIntentHUD';
import { DreamIntentTooltip } from './DreamIntentTooltip';
import { ThemeToggle } from './ThemeToggle';
import { StickyProgressIndicator } from './StickyProgressIndicator';
import { ActTransition } from './ActTransition';
import { SuccessState } from './SuccessState';
import { SessionResumeModal } from './SessionResumeModal';
import { StepLayout } from './StepLayout';
import { VideoLogo } from '@/components/ui/VideoLogo';
import { Loader2, ArrowLeft } from 'lucide-react';
import { ConfiguratorAct } from '@/types/blueprint';
import { useChamberGate } from '@/hooks/useChamberGate';
import { preloadTypographyFonts } from '@/utils/fontPreloader';

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

type TransitionState = { from: ConfiguratorAct; to: ConfiguratorAct } | null;

const SESSION_TOKEN_KEY = 'blueprint_session_token';

// Factory to create a token-scoped Supabase client for blueprint operations
const createBlueprintClient = () => {
  const token = localStorage.getItem(SESSION_TOKEN_KEY);
  if (!token) return null;
  
  return createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    {
      global: { 
        headers: { 'x-blueprint-token': token } 
      }
    }
  );
};

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

  const [showTransition, setShowTransition] = useState<TransitionState>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [references, setReferences] = useState<BlueprintReference[]>([]);
  const [showDreamTooltip, setShowDreamTooltip] = useState(false);
  const { triggerGateNavigation } = useChamberGate();
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
      const blueprintClient = createBlueprintClient();
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

  if (isLoading || !blueprint) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (isSubmitted || blueprint.status === 'submitted') {
    return <SuccessState />;
  }

  // Show resume modal for returning users
  if (sessionStatus.hasExisting && !sessionStatus.confirmed) {
    return (
      <SessionResumeModal
        isOpen={true}
        onContinue={confirmSession}
        onStartFresh={resetBlueprint}
        lastUpdated={blueprint.updatedAt}
        currentStep={blueprint.currentStep}
        dreamIntent={blueprint.dreamIntent}
      />
    );
  }

  const currentStep = blueprint.currentStep;

  const goToStep = (step: number) => {
    // Check for act transitions
    const fromAct = getActForStep(currentStep);
    const toAct = getActForStep(step);

    if (step > currentStep && fromAct !== toAct && toAct !== 'review') {
      setShowTransition({ from: fromAct, to: toAct });
    } else {
      setCurrentStep(step);
    }
    // Scroll to step header anchor on step change
    setTimeout(() => {
      scrollTo('#step-header-anchor', { duration: 0.8, offset: 0 });
    }, 50);
  };

  const handleTransitionContinue = () => {
    if (showTransition) {
      const nextStep = showTransition.to === 'design' ? 4 : 7;
      setCurrentStep(nextStep);
      setShowTransition(null);
      setTimeout(() => {
        scrollTo('#step-header-anchor', { duration: 0.8, offset: 0 });
      }, 50);
    }
  };

  const handleSubmit = async () => {
    const result = await submitBlueprint();
    if (result.success) {
      setIsSubmitted(true);
    }
    return result.success;
  };

  // Render transition screen
  if (showTransition) {
    return (
      <div className="min-h-screen bg-background">
        {/* Animated gradient background */}
        <div className="animated-gradient-bg" aria-hidden="true" />
        {/* Global Components */}
        <DreamIntentHUD
          dreamIntent={blueprint.dreamIntent}
          onUpdate={updateDreamIntent}
          isCollapsed={isScrolled}
        />
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>

        <div className="container mx-auto px-4 py-20">
          <ProgressRail 
            currentStep={currentStep} 
            onStepClick={goToStep}
            className="mb-8" 
          />
          <ActTransition
            completedAct={showTransition.from}
            nextAct={showTransition.to}
            onContinue={handleTransitionContinue}
            discovery={blueprint.discovery}
            design={blueprint.design}
          />
        </div>
      </div>
    );
  }

  // Render step content
  const renderStep = () => {
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
    <div className="min-h-screen bg-background">
      {/* Animated gradient background */}
      <div className="animated-gradient-bg" aria-hidden="true" />
      
      {/* Back to Blueprint button */}
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => triggerGateNavigation('/blueprint')}
        className="hidden sm:flex fixed top-4 left-4 z-50 items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-full bg-background/80 backdrop-blur-md border border-border/50"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Blueprint</span>
      </motion.button>

      {/* Global Components */}
      <DreamIntentHUD
        dreamIntent={blueprint.dreamIntent}
        onUpdate={updateDreamIntent}
        isCollapsed={isScrolled}
      />
      <DreamIntentTooltip show={showDreamTooltip && currentStep === 1} currentStep={currentStep} />
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      
      {/* Sticky Progress Indicator */}
      <StickyProgressIndicator currentStep={currentStep} />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-20 md:py-24">
        {/* Logo above progress - cinematic centered */}
        <motion.div 
          className="flex justify-center mb-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <VideoLogo size="sm" />
        </motion.div>

        <ProgressRail 
          currentStep={currentStep} 
          onStepClick={goToStep}
          className="mb-8 md:mb-12" 
        />

        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function getActForStep(step: number): ConfiguratorAct {
  if (step <= 3) return 'discovery';
  if (step <= 6) return 'design';
  if (step <= 9) return 'deliver';
  return 'review';
}
