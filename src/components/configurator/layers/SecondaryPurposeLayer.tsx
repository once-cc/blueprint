import { motion } from 'framer-motion';
import { forwardRef } from 'react';
import { PrimaryPurpose } from '@/types/blueprint';
import { PURPOSE_OPTIONS } from '../data/foundationsData';
import { PurposeCard } from '../ui/PurposeCard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, SkipForward } from 'lucide-react';
import { AnimationDirection, getLayerVariants, layerTransition } from '../utils/layerAnimations';
import { MotionConfiguratorQuestion, MotionConfiguratorBody } from '@/components/ui/Typography';

interface SecondaryPurposeLayerProps {
  primaryPurpose?: PrimaryPurpose;
  selected: PrimaryPurpose[];
  onChange: (purposes: PrimaryPurpose[]) => void;
  onBack: () => void;
  onContinue: () => void;
  onSkip: () => void;
  direction?: AnimationDirection;
}

export const SecondaryPurposeLayer = forwardRef<HTMLDivElement, SecondaryPurposeLayerProps>(
  function SecondaryPurposeLayer({
    primaryPurpose,
    selected,
    onChange,
    onBack,
    onContinue,
    onSkip,
    direction = 'forward',
  }, ref) {
    const variants = getLayerVariants(direction);

    // Defensive check - render loading state if primary isn't set yet
    if (!primaryPurpose) {
      return (
        <motion.div
          ref={ref}
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={layerTransition}
          className="absolute inset-0 flex items-center justify-center overflow-y-auto overscroll-contain"
          data-lenis-prevent
        >
          <span className="text-muted-foreground">Loading...</span>
        </motion.div>
      );
    }

    // Filter out the primary purpose from options
    const availableOptions = PURPOSE_OPTIONS.filter(p => p.value !== primaryPurpose);

    const handleToggle = (purpose: PrimaryPurpose) => {
      if (selected.includes(purpose)) {
        onChange(selected.filter(p => p !== purpose));
      } else {
        onChange([...selected, purpose]);
      }
    };

    return (
      <motion.div
        ref={ref}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={layerTransition}
        className="absolute inset-0 flex flex-col items-center justify-start pt-8 px-4 overflow-y-auto overscroll-contain"
        data-lenis-prevent
      >
        <div className="w-full max-w-3xl space-y-6">
          {/* Question */}
          <div className="text-center space-y-2">
            <MotionConfiguratorQuestion
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              Do you have any secondary objectives?
            </MotionConfiguratorQuestion>
            <MotionConfiguratorBody
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              Many businesses serve more than one goal. Select all that apply, or skip.
            </MotionConfiguratorBody>
          </div>

          {/* Purpose Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {availableOptions.map((purpose, index) => (
              <motion.div
                key={purpose.value}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
              >
                <PurposeCard
                  value={purpose.value}
                  label={purpose.label}
                  description={purpose.description}
                  icon={purpose.icon}
                  isSelected={selected.includes(purpose.value)}
                  onSelect={() => handleToggle(purpose.value)}
                  size="compact"
                />
              </motion.div>
            ))}
          </div>

          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-between pt-4"
          >
            <Button
              onClick={onBack}
              className="relative overflow-hidden group gap-2 bg-transparent text-muted-foreground hover:text-accent-foreground hover:bg-transparent shadow-none border-0 transition-colors duration-300"
            >
              <span className="absolute inset-0 bg-accent -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out" />
              <ArrowLeft className="w-4 h-4 relative z-10" />
              <span className="relative z-10">Back</span>
            </Button>

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={onSkip}
                className="gap-2 text-muted-foreground"
              >
                Skip
                <SkipForward className="w-4 h-4" />
              </Button>

              <Button
                onClick={onContinue}
                className="gap-2"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  });
