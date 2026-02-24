import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, X, ChevronUp } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface DreamIntentTooltipProps {
  show: boolean;
  currentStep?: number;
  onClick?: () => void;
}

export function DreamIntentTooltip({ show, currentStep, onClick }: DreamIntentTooltipProps) {
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
            "fixed z-40 cursor-pointer",
            isMobile
              ? "top-[72px] left-4 w-[calc(100vw-32px)] max-w-[320px]"
              : "top-16 left-4 w-80"
          )}
          onClick={(e) => {
            // Only fire if the click wasn't on the close button
            const isCloseButton = (e.target as HTMLElement).closest('button');
            if (onClick && !isCloseButton) {
              onClick();
              setIsVisible(false);
            }
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onClick?.();
              setIsVisible(false);
            }
          }}
        >
          <style>{`
            @property --gradient-angle {
              syntax: "<angle>";
              initial-value: 0deg;
              inherits: false;
            }
            @property --gradient-angle-offset {
              syntax: "<angle>";
              initial-value: 0deg;
              inherits: false;
            }
            @property --gradient-percent {
              syntax: "<percentage>";
              initial-value: 5%;
              inherits: false;
            }
            @property --gradient-shine {
              syntax: "<color>";
              initial-value: white;
              inherits: false;
            }
            .shiny-tooltip-container {
              --shiny-cta-bg: #000000;
              --shiny-cta-bg-subtle: #1a1818;
              --shiny-cta-fg: #ffffff;
              --shiny-cta-highlight: #F5A623;
              --shiny-cta-highlight-subtle: #FDE68A;
              --animation: gradient-angle linear infinite;
              --duration: 3s;
              --shadow-size: 2px;
              --transition: 800ms cubic-bezier(0.25, 1, 0.5, 1);
              
              isolation: isolate;
              position: relative;
              overflow: hidden;
              background: linear-gradient(var(--shiny-cta-bg), var(--shiny-cta-bg)) padding-box,
                conic-gradient(
                  from calc(var(--gradient-angle) - var(--gradient-angle-offset)),
                  transparent,
                  var(--shiny-cta-highlight) var(--gradient-percent),
                  var(--gradient-shine) calc(var(--gradient-percent) * 2),
                  var(--shiny-cta-highlight) calc(var(--gradient-percent) * 3),
                  transparent calc(var(--gradient-percent) * 4)
                ) border-box;
              box-shadow: inset 0 0 0 1px var(--shiny-cta-bg-subtle), 0 10px 40px -10px rgba(0,0,0,0.5);
              transition: var(--transition);
              transition-property: --gradient-angle-offset, --gradient-percent, --gradient-shine, filter, transform;
            }
            .shiny-tooltip-container::before,
            .shiny-tooltip-container::after {
              content: "";
              pointer-events: none;
              position: absolute;
              inset-inline-start: 50%;
              inset-block-start: 50%;
              translate: -50% -50%;
              z-index: -1;
            }
            .shiny-tooltip-container::before {
              --size: calc(100% - var(--shadow-size) * 3);
              --position: 2px;
              --space: calc(var(--position) * 2);
              width: var(--size);
              height: var(--size);
              background: radial-gradient(
                circle at var(--position) var(--position),
                white calc(var(--position) / 4),
                transparent 0
              ) padding-box;
              background-size: var(--space) var(--space);
              background-repeat: space;
              mask-image: conic-gradient(
                from calc(var(--gradient-angle) + 45deg),
                black,
                transparent 10% 90%,
                black
              );
              border-radius: inherit;
              opacity: 0.15;
              z-index: -1;
            }
            .shiny-tooltip-container::after {
              --animation: shimmer linear infinite;
              width: 100%;
              aspect-ratio: 1;
              background: linear-gradient(-50deg, transparent, var(--shiny-cta-highlight), transparent);
              mask-image: radial-gradient(circle at bottom, transparent 40%, black);
              opacity: 0.2;
            }
            .shiny-tooltip-container:is(:hover, :focus-within) {
              --gradient-percent: 20%;
              --gradient-angle-offset: 95deg;
              --gradient-shine: var(--shiny-cta-highlight-subtle);
            }
            .shiny-tooltip-container:is(:hover, :focus-within)::before,
            .shiny-tooltip-container:is(:hover, :focus-within)::after {
              animation-play-state: running;
            }
            @keyframes gradient-angle { to { --gradient-angle: 360deg; } }
            @keyframes shimmer { to { rotate: 360deg; } }
          `}</style>
          <div className={cn(
            "relative shiny-tooltip-container border border-transparent rounded-xl shadow-2xl backdrop-blur-md",
            isMobile ? "p-3" : "p-4"
          )}>
            {/* Arrow pointing up - positioned based on pill location */}
            <div className="absolute -top-2 left-6">
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
                <Eye className={cn(
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
              className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent origin-left rounded-b-xl opacity-70"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
