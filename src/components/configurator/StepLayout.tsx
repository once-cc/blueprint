import { motion } from 'framer-motion';
import { ReactNode, forwardRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfiguratorAct } from '@/types/blueprint';
import { ShinyButton } from '@/components/ui/shiny-button';
import { AnimatedButtonIcon } from '@/components/ui/AnimatedButtonIcon';
import paperplaneAnimation from "@/assets/ui/1paperplane.json";
import { cn } from '@/lib/utils';
const springConfig = { type: "spring" as const, stiffness: 400, damping: 25 };

// Staggered "curtain rise" choreography for step entry (#6)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.12,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

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
    const [isHovered, setIsHovered] = useState(false);
    return (
      <motion.div
        ref={ref}
        key={stepNumber}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col min-h-[calc(100vh-12rem)] supports-[height:100dvh]:min-h-[calc(100dvh-12rem)] md:min-h-[calc(100vh-16rem)] md:supports-[height:100dvh]:min-h-[calc(100dvh-16rem)]"
      >
        {/* Step Header - SCROLL ANCHOR · staggered choreography */}
        <motion.div
          id="step-header-anchor"
          className="mb-6 md:mb-8 relative overflow-visible"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Ambient Mobile-Only Backdrop Typography */}
          <motion.div
            className="absolute top-0 right-[-10%] w-full h-full pointer-events-none z-0 block md:hidden select-none"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          >
            <span
              className="font-nohemi font-bold whitespace-nowrap uppercase absolute top-[0] right-0 text-transparent bg-clip-text bg-gradient-to-b from-white/30 to-background pointer-events-none"
              style={{
                fontSize: "clamp(6rem, 28vw, 160px)",
                lineHeight: 0.7,
                letterSpacing: "-0.02em"
              }}
            >
              {title}
            </span>
          </motion.div>
          {/* Act Label */}
          <motion.p
            variants={itemVariants}
            className="text-xs uppercase tracking-[0.2em] text-accent font-medium mb-1.5 relative z-10"
          >
            {actLabels[act]}
          </motion.p>

          {/* Title — slightly increased scale on mobile/small viewports */}
          <motion.h1
            variants={itemVariants}
            className="text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-nohemi font-medium tracking-[-0.02em] text-transparent bg-clip-text bg-gradient-to-b from-white from-[40%] to-zinc-700 mb-1.5 pb-1 drop-shadow-md relative inline-block w-full z-10"
          >
            {title}
          </motion.h1>

          {/* Framing — relaxed leading for readability (#11) */}
          <motion.p
            variants={itemVariants}
            className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl leading-snug relative z-10"
          >
            {framing}
          </motion.p>

          {/* Helper Text */}
          {helperText && (
            <motion.p
              variants={itemVariants}
              className="text-xs sm:text-sm text-muted-foreground/70 mt-2"
            >
              {helperText}
            </motion.p>
          )}
        </motion.div>

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
            className={cn(
              "flex items-center pt-8 md:pt-12 mt-auto border-t border-border/30 relative",
              act === 'review'
                ? "flex-col-reverse sm:flex-row justify-center gap-6 sm:gap-0"
                : "justify-between"
            )}
          >
            {/* Back Button */}
            {onBack ? (
              <motion.div
                className={act === 'review' ? "w-full hidden sm:flex justify-start sm:w-auto sm:absolute sm:bottom-0 sm:left-0 sm:pb-8 md:pb-12" : ""}
                whileHover={{ x: -2, transition: springConfig }}
                whileTap={{ scale: 0.98, transition: springConfig }}
              >
                <Button
                  onClick={onBack}
                  size={act === 'review' ? 'sm' : 'default'}
                  className={cn(
                    "relative overflow-hidden group gap-2 bg-transparent text-muted-foreground hover:text-accent-foreground hover:bg-transparent shadow-none border-0 transition-colors duration-300",
                    act === 'review' ? "text-xs sm:text-sm px-2 sm:px-4 h-8 sm:h-10" : ""
                  )}
                >
                  <span className="absolute inset-0 bg-accent -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out" />
                  <ArrowLeft className={cn("relative z-10", act === 'review' ? "w-3 h-3 sm:w-4 sm:h-4" : "w-4 h-4")} />
                  <span className="relative z-10">Back</span>
                </Button>
              </motion.div>
            ) : (
              <div />
            )}

            {/* Next Button — with "ready" shimmer (#13) */}
            {onNext && (
              <motion.div
                className="relative"
                whileHover={{ scale: canGoNext && !isLoading ? 1.02 : 1, x: canGoNext && !isLoading ? 2 : 0, transition: springConfig }}
                whileTap={{ scale: canGoNext && !isLoading ? 0.98 : 1, transition: springConfig }}
              >
                {/* Ready shimmer overlay */}
                {canGoNext && !isLoading && (
                  <motion.div
                    className="absolute inset-0 rounded-lg pointer-events-none overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <motion.div
                      className="absolute inset-0"
                      animate={{ opacity: [0, 0.12, 0] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                      style={{ background: 'linear-gradient(90deg, transparent, hsl(var(--accent) / 0.25), transparent)' }}
                    />
                  </motion.div>
                )}

                {act === 'review' ? (
                  <ShinyButton
                    onClick={onNext}
                    disabled={!canGoNext || isLoading}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    className="flex items-center justify-center gap-3 w-full sm:w-auto sm:min-w-[280px] md:min-w-[320px] relative z-10 text-lg shadow-2xl shadow-accent/20"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-3">
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </span>
                    ) : (
                      <span className="flex items-center gap-3">
                        {nextLabel}
                        <AnimatedButtonIcon
                          animationData={paperplaneAnimation}
                          isActive={isHovered}
                          staticFrame={90}
                          playOnVisible={true}
                          playVisibleDelay={1250}
                          className="w-7 h-7 ml-1"
                        />
                      </span>
                    )}
                  </ShinyButton>
                ) : (
                  <Button
                    onClick={onNext}
                    disabled={!canGoNext || isLoading}
                    className="gap-2 min-w-[140px] relative z-10"
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
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </motion.div>
    );
  }
);
