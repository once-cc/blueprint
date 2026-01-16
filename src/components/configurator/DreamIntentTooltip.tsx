import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, ChevronUp } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface DreamIntentTooltipProps {
  show: boolean;
  currentStep?: number;
}

export function DreamIntentTooltip({ show, currentStep }: DreamIntentTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Handle show/hide with auto-dismiss timer
  useEffect(() => {
    if (show) {
      setIsVisible(true);
      // Auto-dismiss after 4 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [show]);

  // Dismiss on step change (if not on step 1)
  useEffect(() => {
    if (currentStep !== undefined && currentStep !== 1) {
      setIsVisible(false);
    }
  }, [currentStep]);

  // Tap-outside dismissal
  useEffect(() => {
    if (!isVisible) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
        setIsVisible(false);
      }
    };

    // Small delay to prevent immediate dismissal on touch
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          ref={tooltipRef}
          initial={{ opacity: 0, y: isMobile ? 6 : -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 25,
          }}
          className={cn(
            "fixed z-40",
            isMobile 
              ? "top-[72px] left-3 right-3 w-[min(92vw,320px)] mx-auto"
              : "top-16 left-1/2 -translate-x-1/2 max-w-sm"
          )}
        >
          <div className={cn(
            "relative bg-card/95 backdrop-blur-md border border-accent/30 rounded-xl shadow-lg",
            isMobile ? "p-3" : "p-4"
          )}>
            {/* Arrow pointing up - positioned based on pill location */}
            <div className={cn(
              "absolute -top-2",
              isMobile ? "left-6" : "left-1/2 -translate-x-1/2"
            )}>
              <ChevronUp className="w-5 h-5 text-accent" />
            </div>

            {/* Close button */}
            <button
              onClick={() => setIsVisible(false)}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted/50 transition-colors"
            >
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>

            {/* Content */}
            <div className={cn(
              "flex items-start pr-6",
              isMobile ? "gap-2.5" : "gap-3"
            )}>
              <div className={cn(
                "rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0",
                isMobile ? "w-7 h-7" : "w-8 h-8"
              )}>
                <Sparkles className={cn(
                  "text-accent",
                  isMobile ? "w-3.5 h-3.5" : "w-4 h-4"
                )} />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  Your Dream Intent
                </p>
                <p className={cn(
                  "text-xs text-muted-foreground",
                  isMobile ? "leading-snug" : "leading-relaxed"
                )}>
                  This captures your vision and carries through every step of your Blueprint journey. You can edit it anytime by clicking above.
                </p>
              </div>
            </div>

            {/* Progress bar for auto-dismiss */}
            <motion.div
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: 4, ease: "linear" }}
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent/50 origin-left rounded-b-xl"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
