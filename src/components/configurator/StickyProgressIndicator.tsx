import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { springConfig } from './ui/animationConfig';

interface StickyProgressIndicatorProps {
  currentStep: number;
  totalSteps?: number;
}

export function StickyProgressIndicator({ 
  currentStep, 
  totalSteps = 10 
}: StickyProgressIndicatorProps) {
  const percentage = Math.round(((currentStep - 1) / (totalSteps - 1)) * 100);
  const isComplete = percentage >= 100;
  
  // SVG circle properties
  const size = 40;
  const strokeWidth = 2.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={springConfig}
      className="fixed bottom-6 right-6 z-50"
    >
      <motion.div 
        className="relative flex items-center justify-center bg-card/95 rounded-full shadow-lg border border-border/50"
        animate={isComplete ? { scale: [1, 1.15, 1] } : { scale: 1 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        {/* SVG Progress Ring */}
        <svg
          width={size}
          height={size}
          className="-rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
            className="opacity-30"
          />
          {/* Progress circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ 
              strokeDashoffset,
              stroke: isComplete ? "hsl(var(--accent))" : "hsl(var(--primary))"
            }}
            transition={springConfig}
            className="drop-shadow-[0_0_6px_hsl(var(--primary)/0.4)]"
          />
        </svg>
        
        {/* Percentage text or Checkmark */}
        <AnimatePresence mode="wait">
          {isComplete ? (
            <motion.div
              key="checkmark"
              initial={{ opacity: 0, scale: 0, rotate: -180 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Check className="w-5 h-5 text-accent" strokeWidth={3} />
            </motion.div>
          ) : (
            <motion.span
              key="percentage"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="absolute inset-0 flex items-center justify-center text-[10px] font-medium text-foreground"
            >
              {percentage}%
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
