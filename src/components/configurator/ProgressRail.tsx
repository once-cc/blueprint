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

  // Calculate overall progress percentage
  const progressPercentage = ((currentStep - 1) / 9) * 100;

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
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{ boxShadow: '0 0 12px hsl(var(--accent) / 0.5)' }}
          />

          {/* Act Nodes */}
          {acts.map((act, actIndex) => (
            <div key={act.key} className="relative flex flex-col items-center z-10">
              {/* Act Circle with Step Dots */}
              <div className="flex items-center gap-1">
                {act.steps.map((step, stepIndex) => {
                  const complete = isStepComplete(step);
                  const current = isStepCurrent(step);
                  const stepInfo = getStepInfo(step);

                  return (
                    <div key={step} className="relative">
                      {/* Step Dot */}
                      <motion.button
                        onClick={() => onStepClick?.(step)}
                        onMouseEnter={() => setHoveredStep(step)}
                        onMouseLeave={() => setHoveredStep(null)}
                        className={cn(
                          'relative w-8 h-8 rounded-full flex items-center justify-center',
                          'transition-all duration-300 cursor-pointer',
                          complete && 'bg-accent shadow-[0_0_16px_hsl(var(--accent)/0.4)]',
                          current && 'bg-accent',
                          !complete && !current && 'bg-muted/50 border border-border/50'
                        )}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {/* Pulsing ring for current step */}
                        {current && (
                          <motion.div
                            className="absolute inset-0 rounded-full bg-accent/30"
                            animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
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

                      {/* Glassmorphism Tooltip */}
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
                              'px-3 py-2 rounded-lg whitespace-nowrap',
                              'bg-card/95 backdrop-blur-md border border-border/50',
                              'shadow-xl'
                            )}>
                              <p className="text-xs font-medium text-foreground">
                                Step {step} — {stepInfo.title}
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

      {/* Mobile Progress Bar */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">
            {ACT_INFO[getCurrentAct()].label}
          </span>
          <span className="text-xs text-muted-foreground">
            Step {currentStep} of 10
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="relative h-1.5 bg-muted/50 rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-accent rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / 10) * 100}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            style={{ boxShadow: '0 0 8px hsl(var(--accent) / 0.5)' }}
          />
        </div>

        {/* Step dots for mobile */}
        <div className="flex justify-between mt-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(step => (
            <button
              key={step}
              onClick={() => onStepClick?.(step)}
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-200',
                isStepComplete(step) && 'bg-accent',
                isStepCurrent(step) && 'bg-accent scale-150',
                !isStepComplete(step) && !isStepCurrent(step) && 'bg-muted-foreground/30'
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
