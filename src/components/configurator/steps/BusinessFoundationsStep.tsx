import { forwardRef, useState, useEffect, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { BlueprintDiscovery, PrimaryPurpose, ConversionGoalValue, AdvancedObjectiveKey } from '@/types/blueprint';
import { StepLayout } from '../StepLayout';
import { LayerProgress } from '../ui/LayerProgress';
import { SiteTopicLayer } from '../layers/SiteTopicLayer';
import { PrimaryPurposeLayer } from '../layers/PrimaryPurposeLayer';
import { SecondaryPurposeLayer } from '../layers/SecondaryPurposeLayer';
import { ConversionGoalsLayer } from '../layers/ConversionGoalsLayer';
import { AdvancedObjectivesLayer } from '../layers/AdvancedObjectivesLayer';
import { FoundationLayer, LAYER_ORDER } from '../data/foundationsData';
import { AnimationDirection } from '../utils/layerAnimations';
import { useLenisScroll } from '@/hooks/useLenisScroll';
import {
  deriveLayerFromAnswers,
  getAvailableGoals,
  pruneInvalidAnswers,
  getRelevantAdvancedQuestions,
  migrateLegacyDiscovery,
  canProceedToNextStep,
  isLayerComplete,
} from '../utils/foundationsUtils';

interface BusinessFoundationsStepProps {
  discovery: BlueprintDiscovery;
  onUpdate: (updates: Partial<BlueprintDiscovery>) => void;
  onBack?: () => void;
  onNext: () => void;
}

export const BusinessFoundationsStep = forwardRef<HTMLDivElement, BusinessFoundationsStepProps>(
  function BusinessFoundationsStep({
    discovery,
    onUpdate,
    onBack,
    onNext,
  }, ref) {
    // 1. Migrate legacy data on mount
    const migratedDiscovery = useMemo(
      () => migrateLegacyDiscovery(discovery),
      // Only run migration when discovery reference changes
      [discovery.mainConversionGoal, discovery.primaryPurpose]
    );

    // 2. Derive initial layer from saved answers (refresh-safe)
    const [currentLayer, setCurrentLayer] = useState<FoundationLayer>(
      () => deriveLayerFromAnswers(migratedDiscovery)
    );

    // 3. Track navigation direction for animations
    const [direction, setDirection] = useState<AnimationDirection>('forward');

    // 4. Scroll to top on layer change
    const { scrollTo } = useLenisScroll();

    useEffect(() => {
      // Guard: anchor may not exist yet during AnimatePresence transitions
      requestAnimationFrame(() => {
        if (document.getElementById('step-header-anchor')) {
          scrollTo('#step-header-anchor', { duration: 0.5, offset: -120 });
        }
      });
    }, [currentLayer, scrollTo]);

    // Helper to navigate with direction tracking
    const navigateToLayer = (targetLayer: FoundationLayer) => {
      const currentIndex = LAYER_ORDER.indexOf(currentLayer);
      const targetIndex = LAYER_ORDER.indexOf(targetLayer);
      setDirection(targetIndex > currentIndex ? 'forward' : 'back');
      setCurrentLayer(targetLayer);
    };

    // 4. Apply migration if needed (one-time)
    useEffect(() => {
      const needsMigration =
        discovery.mainConversionGoal &&
        !discovery.primaryPurpose;

      if (needsMigration) {
        const migrated = migrateLegacyDiscovery(discovery);
        if (migrated !== discovery) {
          onUpdate(migrated);
        }
      }
    }, []); // Only on mount

    // 5. Track completed layers for progress indicator
    const completedLayers = LAYER_ORDER.filter(layer =>
      isLayerComplete(layer, discovery)
    );

    // 6. Handle site topic selection
    const handleSiteTopicSelect = (topic: string) => {
      onUpdate({ siteTopic: topic });
      // Auto-advance after short delay with forward direction
      setTimeout(() => navigateToLayer('purpose'), 400);
    };

    // 7. Handle primary purpose selection with pruning
    const handlePrimaryPurposeSelect = (purpose: PrimaryPurpose) => {
      const pruned = pruneInvalidAnswers(discovery, purpose, discovery.secondaryPurposes);
      onUpdate({
        primaryPurpose: purpose,
        ...pruned,
      });
      // Auto-advance after short delay with forward direction
      setTimeout(() => navigateToLayer('secondary'), 400);
    };

    // 7. Handle secondary purposes change with pruning
    const handleSecondaryPurposesChange = (purposes: PrimaryPurpose[]) => {
      // Filter out primary purpose if accidentally included
      const filtered = purposes.filter(p => p !== discovery.primaryPurpose);
      const pruned = pruneInvalidAnswers(discovery, discovery.primaryPurpose, filtered);
      onUpdate({
        secondaryPurposes: filtered,
        ...pruned,
      });
    };

    // 8. Handle secondary continue
    const handleSecondaryContinue = () => {
      // Mark secondary as answered even if empty
      if (discovery.secondaryPurposes === undefined) {
        onUpdate({ secondaryPurposes: [] });
      }
      navigateToLayer('conversion');
    };

    // 9. Handle secondary skip
    const handleSecondarySkip = () => {
      onUpdate({ secondaryPurposes: [] });
      navigateToLayer('conversion');
    };

    // 10. Handle conversion goals change
    const handleConversionGoalsChange = (goals: ConversionGoalValue[]) => {
      onUpdate({ conversionGoals: goals });
    };

    // 11. Handle conversion continue
    const handleConversionContinue = () => {
      // Check if there are relevant advanced questions for the selected goals
      const hasAdvanced = getRelevantAdvancedQuestions(discovery.conversionGoals).length > 0;
      if (hasAdvanced) {
        navigateToLayer('advanced');
      } else {
        // No advanced questions - mark as answered (empty) and proceed to next step
        onUpdate({ advancedObjectives: {} });
        onNext();
      }
    };

    // 12. Handle advanced objective change
    const handleAdvancedChange = (key: AdvancedObjectiveKey, value: string) => {
      onUpdate({
        advancedObjectives: {
          ...discovery.advancedObjectives,
          [key]: value,
        },
      });
    };

    // 13. Handle advanced continue/skip
    const handleAdvancedContinue = () => {
      // Mark as answered if not yet
      if (discovery.advancedObjectives === undefined) {
        onUpdate({ advancedObjectives: {} });
      }
      onNext();
    };

    // 14. Handle layer navigation via progress indicator
    const handleLayerClick = (layer: FoundationLayer) => {
      const targetIndex = LAYER_ORDER.indexOf(layer);
      const currentIndex = LAYER_ORDER.indexOf(currentLayer);
      // Allow going back to any previous layer, or forward to completed layers
      if (targetIndex !== currentIndex && (targetIndex < currentIndex || completedLayers.includes(layer))) {
        navigateToLayer(layer);
      }
    };

    // 15. Compute available goals
    const availableGoals = getAvailableGoals(
      discovery.primaryPurpose,
      discovery.secondaryPurposes
    );

    // 16. Check if fallback needed
    const showGoalsFallback =
      discovery.primaryPurpose &&
      discovery.secondaryPurposes !== undefined &&
      availableGoals.length === 0;

    // 17. Get advanced questions
    const advancedQuestions = getRelevantAdvancedQuestions(discovery.conversionGoals);

    // 18. Check if can proceed to next step
    const canGoNext = canProceedToNextStep(discovery);

    return (
      <StepLayout
        ref={ref}
        act="discovery"
        stepNumber={1}
        title="Business Foundations"
        framing="Let's understand your business and what success looks like."
        onBack={onBack}
        onNext={onNext}
        canGoNext={canGoNext}
        hideNavigation={true} // We handle navigation internally
      >
        <div className="space-y-6">
          {/* Layer Progress */}
          <LayerProgress
            currentLayer={currentLayer}
            onLayerClick={handleLayerClick}
            completedLayers={completedLayers}
          />

          {/* Layer Content - Fixed Stage Container */}
          <div className="relative min-h-[70vh] overflow-clip">
            <AnimatePresence mode="popLayout" initial={false}>
              {currentLayer === 'topic' && (
                <SiteTopicLayer
                  key="topic"
                  selected={discovery.siteTopic}
                  onSelect={handleSiteTopicSelect}
                  direction={direction}
                />
              )}

              {currentLayer === 'purpose' && (
                <PrimaryPurposeLayer
                  key="purpose"
                  selected={discovery.primaryPurpose}
                  onSelect={handlePrimaryPurposeSelect}
                  direction={direction}
                />
              )}

              {currentLayer === 'secondary' && (
                <SecondaryPurposeLayer
                  key="secondary"
                  primaryPurpose={discovery.primaryPurpose}
                  selected={discovery.secondaryPurposes || []}
                  onChange={handleSecondaryPurposesChange}
                  onBack={() => navigateToLayer('purpose')}
                  onContinue={handleSecondaryContinue}
                  onSkip={handleSecondarySkip}
                  direction={direction}
                />
              )}

              {currentLayer === 'conversion' && (
                <ConversionGoalsLayer
                  key="conversion"
                  availableGoals={availableGoals}
                  selected={discovery.conversionGoals || []}
                  onChange={handleConversionGoalsChange}
                  onBack={() => navigateToLayer('secondary')}
                  onContinue={handleConversionContinue}
                  showFallback={showGoalsFallback}
                  direction={direction}
                />
              )}

              {currentLayer === 'advanced' && (
                <AdvancedObjectivesLayer
                  key="advanced"
                  questions={advancedQuestions}
                  answers={discovery.advancedObjectives || {}}
                  onChange={handleAdvancedChange}
                  onBack={() => navigateToLayer('conversion')}
                  onContinue={handleAdvancedContinue}
                  onSkip={handleAdvancedContinue}
                  direction={direction}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </StepLayout>
    );
  }
);
