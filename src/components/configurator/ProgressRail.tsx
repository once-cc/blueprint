import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { ACT_INFO, CONFIGURATOR_STEPS, ConfiguratorAct } from '@/types/blueprint';
import { cn } from '@/lib/utils';

interface ProgressRailProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
  className?: string;
}

const acts: { key: ConfiguratorAct; label: string; steps: number[] }[] = [
  { key: 'discovery', label: 'Discovery', steps: [1, 2, 3] },
  { key: 'design', label: 'Design', steps: [4, 5, 6] },
  { key: 'deliver', label: 'Deliver', steps: [7, 8, 9] },
];

export function ProgressRail({ currentStep, onStepClick, className = '' }: ProgressRailProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  // Handle scroll collapse behavior
  useEffect(() => {
    const handleScroll = () => {
      setIsCollapsed(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getCurrentAct = (): ConfiguratorAct => {
    if (currentStep <= 3) return 'discovery';
    if (currentStep <= 6) return 'design';
    if (currentStep <= 9) return 'deliver';
    return 'review';
  };

  const isStepComplete = (step: number) => currentStep > step;
  const isStepCurrent = (step: number) => currentStep === step;
  const isActComplete = (act: ConfiguratorAct) => {
    const actInfo = ACT_INFO[act];
    return currentStep > Math.max(...actInfo.steps);
  };

  const getStepInfo = (step: number) => {
    return CONFIGURATOR_STEPS.find(s => s.step === step);
  };

  // Precisely calculate the width of the progress track based on the flex layout (justify-between)
  // Each node group is ~104px wide (3 nodes * 32px + 2 gaps * 4px).
  const getDesktopProgressWidth = (step: number) => {
    switch (step) {
      case 1: return '16px';
      case 2: return '52px';
      case 3: return '88px';
      case 4: return 'calc(50% - 36px)';
      case 5: return '50%';
      case 6: return 'calc(50% + 36px)';
      case 7: return 'calc(100% - 88px)';
      case 8: return 'calc(100% - 52px)';
      case 9: return 'calc(100% - 16px)';
      default: return '100%';
    }
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Desktop Progress Rail */}
      <div className="hidden md:block">
        <div className="relative flex items-center justify-between max-w-3xl mx-auto">
          {/* Background Track */}
          <div className="absolute top-4 left-0 right-0 h-0.5 bg-border/30" />

          {/* Animated Progress Overlay */}
          <motion.div
            className="absolute top-4 left-0 h-0.5 bg-accent"
            initial={{ width: 0 }}
            animate={{ width: getDesktopProgressWidth(currentStep > 9 ? 10 : currentStep) }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{ boxShadow: '0 0 12px hsl(var(--accent) / 0.5)' }}
          />

          {/* Act Nodes */}
          {acts.map((act) => (
            <div key={act.key} className="relative flex flex-col items-center z-10">
              {/* Act Circle with Step Dots */}
              <div className="flex items-center gap-1">
                {act.steps.map((step) => {
                  const complete = isStepComplete(step);
                  const current = isStepCurrent(step);
                  const stepInfo = getStepInfo(step);

                  return (
                    <div key={step} className="relative">
                      {/* Step Dot — with ARIA semantics (#18) */}
                      <motion.button
                        onClick={() => onStepClick?.(step)}
                        onMouseEnter={() => setHoveredStep(step)}
                        onMouseLeave={() => setHoveredStep(null)}
                        aria-current={current ? 'step' : undefined}
                        aria-label={`Step ${step}: ${stepInfo?.title ?? ''}. ${complete ? 'Completed' : current ? 'Current step' : 'Not started'}`}
                        className={cn(
                          'relative w-8 h-8 rounded-full flex items-center justify-center',
                          'transition-all duration-300 cursor-pointer',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                          complete && 'bg-accent shadow-[0_0_16px_hsl(var(--accent)/0.4)]',
                          current && 'bg-accent',
                          !complete && !current && 'bg-muted/50 border border-border/50'
                        )}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {/* Strengthened pulsing ring for current step (#4) */}
                        {current && (
                          <motion.div
                            className="absolute inset-0 rounded-full"
                            style={{
                              background: 'radial-gradient(circle, hsl(var(--accent) / 0.4) 0%, transparent 70%)',
                            }}
                            animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                          />
                        )}

                        {/* Checkmark or number */}
                        {complete ? (
                          <Check className="w-4 h-4 text-accent-foreground" />
                        ) : (
                          <span className={cn(
                            'text-xs font-medium',
                            current ? 'text-accent-foreground' : 'text-muted-foreground'
                          )}>
                            {step}
                          </span>
                        )}
                      </motion.button>

                      {/* Enhanced Glassmorphism Tooltip (#12) */}
                      <AnimatePresence>
                        {hoveredStep === step && stepInfo && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 5, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-50"
                          >
                            <div className={cn(
                              'px-4 py-3 rounded-xl whitespace-nowrap',
                              'bg-card/95 backdrop-blur-xl border border-border/50',
                              'shadow-2xl'
                            )}>
                              <div className="flex items-center gap-2 mb-0.5">
                                {complete && <Check className="w-3 h-3 text-accent" />}
                                <p className="text-xs font-medium text-foreground">
                                  {stepInfo.title}
                                </p>
                              </div>
                              <p className="text-[10px] text-muted-foreground">
                                {complete ? 'Completed' : current ? 'Current step' : `Step ${step} of 10`}
                              </p>
                            </div>
                            {/* Arrow */}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                              <div className="w-2 h-2 bg-card/95 border-r border-b border-border/50 rotate-45 -translate-y-1" />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

              {/* Act Label - Collapsible */}
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-3 text-center"
                  >
                    <span className={cn(
                      'text-xs font-medium uppercase tracking-wider',
                      isActComplete(act.key) || getCurrentAct() === act.key
                        ? 'text-foreground'
                        : 'text-muted-foreground'
                    )}>
                      {act.label}
                    </span>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {ACT_INFO[act.key].description}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Progress Bar (Premium 3-Phase Design) */}
      <div className="md:hidden">
        {/* Glassmorphic Container Wrapper */}
        <div className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl px-4 py-3 shadow-2xl relative overflow-hidden">

          {/* Subtle Ambient Glow Behind Container */}
          <div className="absolute inset-0 bg-gradient-to-t from-accent/5 to-transparent opacity-50 pointer-events-none" />

          {/* Typography Header */}
          <div className="flex items-center justify-between mb-2 relative z-10">
            <span className="text-sm font-nohemi font-medium tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent/80 drop-shadow-sm uppercase">
              {ACT_INFO[getCurrentAct()].label}
            </span>
            <span className="text-[10px] font-mono tracking-widest text-muted-foreground/80 uppercase">
              Step {currentStep} <span className="text-white/20">/</span> 10
            </span>
          </div>

          {/* 3-Phase Progress Indicators */}
          <div className="flex items-center justify-between gap-1.5 w-full relative z-10">
            {acts.map((act, idx) => {
              // Calculate progress for this phase
              let widthPercent = 0;
              const isCompleted = isActComplete(act.key);
              const isCurrent = getCurrentAct() === act.key;
              const isUpcoming = !isCompleted && !isCurrent;

              if (isCompleted) {
                widthPercent = 100;
              } else if (isCurrent) {
                const minStep = act.steps[0];
                const stepsInAct = act.key === 'deliver' && currentStep > 9 ? 4 : act.steps.length;
                const currentInPhase = currentStep - minStep + 1;
                widthPercent = Math.min(((currentInPhase) / act.steps.length) * 100, 100);
              }

              const isFullyComplete = widthPercent === 100;

              return (
                <div key={act.key} className="flex-1 flex items-center shrink-0 min-w-0">
                  {/* Phase Bar Container */}
                  <div className="relative h-2 w-full bg-black/60 rounded-full overflow-hidden shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] border border-white/5 shrink-0 min-w-0">

                    {/* Active Track Gradient Fill */}
                    <motion.div
                      className="absolute inset-y-0 left-0 rounded-full"
                      style={{
                        background: 'linear-gradient(90deg, hsl(var(--accent)/0.6) 0%, hsl(var(--accent)) 100%)',
                        boxShadow: isFullyComplete
                          ? '0 0 10px hsl(var(--accent)/0.4), inset 0 0 4px hsl(var(--accent)/0.8)'
                          : '0 0 15px hsl(var(--accent)/0.5), inset 0 0 4px hsl(var(--accent)/0.8)'
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${widthPercent}%` }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    >
                      {/* Leading Edge Flare for Active (Not fully complete) phases */}
                      {!isFullyComplete && widthPercent > 0 && (
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-full bg-gradient-to-r from-transparent to-white/60 blur-[1px]" />
                      )}
                    </motion.div>
                  </div>

                  {/* Phase Connector (Dot/Line) */}
                  {idx < acts.length - 1 && (
                    <div className="flex items-center justify-center shrink-0 w-3 mx-0.5">
                      <motion.div
                        className="h-1 w-1 rounded-full transition-all duration-300"
                        animate={{
                          backgroundColor: isFullyComplete
                            ? 'hsl(var(--accent))'
                            : 'rgba(255,255,255,0.1)',
                          boxShadow: isFullyComplete
                            ? '0 0 6px hsl(var(--accent)/0.6)'
                            : '0 0 0px transparent'
                        }}
                        transition={{ duration: 0.3, delay: isFullyComplete ? 0.2 : 0 }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
