import { motion } from 'framer-motion';
import { AdvancedObjectives, AdvancedObjectiveKey } from '@/types/blueprint';
import { AdvancedQuestion } from '../data/foundationsData';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, SkipForward } from 'lucide-react';
import { cn } from '@/lib/utils';
import { springConfig, cardHover, cardTap, getContentShift } from '../ui/animationConfig';
import { AnimationDirection, getLayerVariants, layerTransition } from '../utils/layerAnimations';

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
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-2xl md:text-3xl font-nohemi font-medium text-foreground"
          >
            You're all set
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-muted-foreground"
          >
            No additional details needed for your selections. Continue to the next step.
          </motion.p>
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
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-2xl md:text-3xl font-nohemi font-medium text-foreground"
          >
            Would you like to get more specific?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-muted-foreground"
          >
            These optional details help us tailor your blueprint. Skip if unsure.
          </motion.p>
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
                    <motion.button
                      key={option.value}
                      type="button"
                      onClick={() => onChange(question.key, option.value)}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      whileHover={{ ...cardHover, transition: springConfig }}
                      whileTap={{ ...cardTap, transition: springConfig }}
                      transition={{ ...springConfig, delay: 0.25 + qIndex * 0.1 + oIndex * 0.03 }}
                      className={cn(
                        'px-4 py-2 rounded-lg border text-sm font-medium transition-all duration-200',
                        isSelected
                          ? 'border-accent bg-accent/20 text-accent shadow-[0_0_15px_hsl(var(--accent)/0.2)]'
                          : 'border-border/40 bg-card/50 text-muted-foreground hover:border-border hover:bg-card/80 hover:text-foreground'
                      )}
                    >
                      <motion.span
                        animate={getContentShift(isSelected)}
                        transition={springConfig}
                      >
                        {option.label}
                      </motion.span>
                    </motion.button>
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
