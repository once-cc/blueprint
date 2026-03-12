import { motion } from 'framer-motion';
import { AdvancedObjectives, AdvancedObjectiveKey } from '@/types/blueprint';
import { AdvancedQuestion } from '../data/foundationsData';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, SkipForward } from 'lucide-react';
import { cn } from '@/lib/utils';
import { springConfig, cardHover, cardTap, getContentShift } from '../ui/animationConfig';
import { AnimationDirection, getLayerVariants, layerTransition } from '../utils/layerAnimations';
import { MotionConfiguratorQuestion, MotionConfiguratorBody } from '@/components/ui/Typography';
import { ConfiguratorOption } from '../ui/ConfiguratorOption';

interface AdvancedObjectivesLayerProps {
  questions: AdvancedQuestion[];
  answers: AdvancedObjectives;
  onChange: (key: AdvancedObjectiveKey, value: string) => void;
  onBack: () => void;
  onContinue: () => void;
  onSkip: () => void;
  direction?: AnimationDirection;
}

export function AdvancedObjectivesLayer({
  questions,
  answers,
  onChange,
  onBack,
  onContinue,
  onSkip,
  direction = 'forward',
}: AdvancedObjectivesLayerProps) {
  const variants = getLayerVariants(direction);

  // No relevant advanced questions — show a clean pass-through state
  if (!questions || questions.length === 0) {
    return (
      <motion.div
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={layerTransition}
        className="absolute inset-0 flex flex-col items-center justify-center px-4"
        data-lenis-prevent
      >
        <div className="text-center space-y-4 max-w-md">
          <MotionConfiguratorQuestion
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            You're all set
          </MotionConfiguratorQuestion>
          <MotionConfiguratorBody
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            No additional details needed for your selections. Continue to the next step.
          </MotionConfiguratorBody>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-between w-full max-w-2xl pt-12"
        >
          <Button
            onClick={onBack}
            className="relative overflow-hidden group gap-2 bg-transparent text-muted-foreground hover:text-accent-foreground hover:bg-transparent shadow-none border-0 transition-colors duration-300"
          >
            <span className="absolute inset-0 bg-accent -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out" />
            <ArrowLeft className="w-4 h-4 relative z-10" />
            <span className="relative z-10">Back</span>
          </Button>
          <Button
            onClick={onContinue}
            className="gap-2"
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={layerTransition}
      className="absolute inset-0 flex flex-col items-center justify-start pt-8 px-4 overflow-y-auto overscroll-contain"
      data-lenis-prevent
    >
      <div className="w-full max-w-2xl space-y-8">
        {/* Question */}
        <div className="text-center space-y-2">
          <MotionConfiguratorQuestion
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Would you like to get more specific?
          </MotionConfiguratorQuestion>
          <MotionConfiguratorBody
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            These optional details help us tailor your blueprint. Skip if unsure.
          </MotionConfiguratorBody>
        </div>

        {/* Questions */}
        <div className="space-y-8">
          {questions.map((question, qIndex) => (
            <motion.div
              key={question.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + qIndex * 0.1 }}
              className="space-y-3"
            >
              <h3 className="text-base font-medium text-foreground">
                {question.question}
              </h3>

              <div className="flex flex-wrap gap-2">
                {question.options.map((option, oIndex) => {
                  const isSelected = answers[question.key] === option.value;

                  return (
                    <ConfiguratorOption
                      key={option.value}
                      value={option.value}
                      label={option.label}
                      isSelected={isSelected}
                      onSelect={() => onChange(question.key, option.value)}
                      variant="minimal"
                      indicator="none"
                      index={qIndex * 3 + oIndex}
                    />
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Progress hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <span className="text-sm text-muted-foreground/60">
            {Object.keys(answers).length} of {questions.length} answered
          </span>
        </motion.div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-between pt-4 pb-8"
        >
          <Button
            onClick={onBack}
            className="relative overflow-hidden group gap-2 bg-transparent text-muted-foreground hover:text-accent-foreground hover:bg-transparent shadow-none border-0 transition-colors duration-300"
          >
            <span className="absolute inset-0 bg-accent -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out z-0" />
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
}
