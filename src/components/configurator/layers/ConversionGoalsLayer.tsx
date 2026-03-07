import { motion } from 'framer-motion';
import { forwardRef } from 'react';
import { ConversionGoalValue } from '@/types/blueprint';
import { ConversionGoalOption, ALL_CONVERSION_GOALS } from '../data/foundationsData';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { springConfig, cardHover, cardTap, getContentShift, getIconAnimation, checkSpring } from '../ui/animationConfig';
import { AnimationDirection, getLayerVariants, layerTransition } from '../utils/layerAnimations';

interface ConversionGoalsLayerProps {
  availableGoals: ConversionGoalOption[];
  selected: ConversionGoalValue[];
  onChange: (goals: ConversionGoalValue[]) => void;
  onBack: () => void;
  onContinue: () => void;
  showFallback: boolean;
  direction?: AnimationDirection;
}

export const ConversionGoalsLayer = forwardRef<HTMLDivElement, ConversionGoalsLayerProps>(
  function ConversionGoalsLayer({
    availableGoals,
    selected,
    onChange,
    onBack,
    onContinue,
    showFallback,
    direction = 'forward',
  }, ref) {
    // Use fallback goals if none available from purpose mapping
    const goalsToShow = showFallback || availableGoals.length === 0
      ? ALL_CONVERSION_GOALS
      : availableGoals;

    const variants = getLayerVariants(direction);

    const handleToggle = (goalValue: ConversionGoalValue) => {
      if (selected.includes(goalValue)) {
        onChange(selected.filter(g => g !== goalValue));
      } else {
        onChange([...selected, goalValue]);
      }
    };

    const canContinue = selected.length > 0;

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
        <div className="w-full max-w-4xl space-y-6">
          {/* Question */}
          <div className="text-center space-y-2">
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-2xl md:text-3xl font-nohemi font-medium text-foreground"
            >
              What specific outcomes should your platform support?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-muted-foreground"
            >
              Select at least one goal. These will shape your site's structure.
            </motion.p>
          </div>

          {/* Fallback notice */}
          {showFallback && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-sm text-amber-500/80 bg-amber-500/10 rounded-lg py-2 px-4"
            >
              Showing all available goals. Select what applies to your business.
            </motion.div>
          )}

          {/* Goal Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {goalsToShow.map((goal, index) => {
              const isSelected = selected.includes(goal.value);

              return (
                <motion.button
                  key={goal.value}
                  type="button"
                  onClick={() => handleToggle(goal.value)}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ ...springConfig, delay: 0.2 + index * 0.03 }}
                  className={cn(
                    'group relative w-full text-left p-4 rounded-xl border transition-all duration-300',
                    isSelected
                      ? 'border-accent bg-accent/10 shadow-[0_0_20px_hsl(var(--accent)/0.15)]'
                      : 'border-border/40 bg-card/50 hover:border-border hover:bg-card/80'
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <motion.div
                      animate={getIconAnimation(isSelected)}
                      transition={springConfig}
                      className={cn(
                        'flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all',
                        isSelected
                          ? 'border-accent bg-accent'
                          : 'border-muted-foreground/30 group-hover:border-muted-foreground/50'
                      )}
                    >
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={checkSpring}
                        >
                          <Check className="w-3 h-3 text-accent-foreground" />
                        </motion.div>
                      )}
                    </motion.div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <motion.h3
                        animate={{ x: isSelected ? 2 : 0 }}
                        transition={springConfig}
                        className="font-medium text-sm text-foreground"
                      >
                        {goal.label}
                      </motion.h3>
                      <motion.p
                        animate={{ x: isSelected ? 2 : 0 }}
                        transition={{ ...springConfig, delay: 0.02 }}
                        className="text-xs text-muted-foreground mt-0.5"
                      >
                        {goal.description}
                      </motion.p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Selection count */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            <span className={cn(
              'text-sm transition-colors',
              selected.length > 0 ? 'text-accent' : 'text-muted-foreground/60'
            )}>
              {selected.length} goal{selected.length !== 1 ? 's' : ''} selected
            </span>
          </motion.div>

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

            <Button
              onClick={onContinue}
              disabled={!canContinue}
              className="gap-2"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      </motion.div>
    );
  });
