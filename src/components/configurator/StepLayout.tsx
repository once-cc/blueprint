import { motion } from 'framer-motion';
import { ReactNode, forwardRef } from 'react';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfiguratorAct } from '@/types/blueprint';

const springConfig = { type: "spring" as const, stiffness: 400, damping: 25 };

interface StepLayoutProps {
  act: ConfiguratorAct;
  stepNumber: number;
  title: string;
  framing: string;
  helperText?: string;
  children: ReactNode;
  onBack?: () => void;
  onNext?: () => void;
  canGoNext?: boolean;
  isLoading?: boolean;
  nextLabel?: string;
  hideNavigation?: boolean;
}

const actLabels: Record<ConfiguratorAct, string> = {
  discovery: 'Act I — Discovery',
  design: 'Act II — Design',
  deliver: 'Act III — Deliver',
  review: 'Review',
};

export const StepLayout = forwardRef<HTMLDivElement, StepLayoutProps>(
  function StepLayout({
    act,
    stepNumber,
    title,
    framing,
    helperText,
    children,
    onBack,
    onNext,
    canGoNext = true,
    isLoading = false,
    nextLabel = 'Continue',
    hideNavigation = false,
  }, ref) {
    return (
      <motion.div
        ref={ref}
        key={stepNumber}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col min-h-[calc(100vh-12rem)] md:min-h-[calc(100vh-16rem)]"
    >
      {/* Step Header - SCROLL ANCHOR */}
      <div id="step-header-anchor" className="mb-8 md:mb-12">
        {/* Act Label */}
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xs uppercase tracking-[0.2em] text-accent font-medium mb-3"
        >
          {actLabels[act]}
        </motion.p>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-3xl md:text-4xl lg:text-5xl font-display font-bold tracking-tight text-foreground mb-4"
        >
          {title}
        </motion.h1>

        {/* Framing */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl"
        >
          {framing}
        </motion.p>

        {/* Helper Text */}
        {helperText && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="text-sm text-muted-foreground/70 mt-2"
          >
            {helperText}
          </motion.p>
        )}
      </div>

      {/* Content Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex-1"
      >
        {children}
      </motion.div>

      {/* Navigation */}
      {!hideNavigation && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-between pt-8 md:pt-12 mt-auto border-t border-border/30"
        >
          {/* Back Button */}
          {onBack ? (
            <motion.div
              whileHover={{ x: -2, transition: springConfig }}
              whileTap={{ scale: 0.98, transition: springConfig }}
            >
              <Button
                variant="ghost"
                onClick={onBack}
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </motion.div>
          ) : (
            <div />
          )}

          {/* Next Button */}
          {onNext && (
            <motion.div
              whileHover={{ scale: canGoNext && !isLoading ? 1.02 : 1, x: canGoNext && !isLoading ? 2 : 0, transition: springConfig }}
              whileTap={{ scale: canGoNext && !isLoading ? 0.98 : 1, transition: springConfig }}
            >
              <Button
                onClick={onNext}
                disabled={!canGoNext || isLoading}
                className="gap-2 min-w-[140px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    {nextLabel}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </motion.div>
      )}
      </motion.div>
    );
  }
);
