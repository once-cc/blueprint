import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LoadingSplashProps {
  onComplete: () => void;
}

type SplashPhase = 
  | { type: "word"; index: number }  // Act I: website, design, made, irresistible
  | { type: "breath" }               // Act II: intentional pause
  | { type: "your" }                 // Act III: "Your" alone
  | { type: "online" }               // Act III: "online" appears centered
  | { type: "onlinePresence" }       // Act IV: "online" shifts left, "Presence" enters
  | { type: "made" }                 // Act V: "Made" fast
  | { type: "impact" }               // Act V: "Now" final hit
  | { type: "complete" };

// Act I words - identical 420ms cadence
const words = [
  { text: "website", duration: 420 },
  { text: "design", duration: 420 },
  { text: "made", duration: 420 },
  { text: "irresistible", duration: 420 },
];

// Phase durations
const BREATH_DURATION = 220;        // Act II: intentional pause
const YOUR_DURATION = 320;          // Act III
const ONLINE_DURATION = 260;        // Act III: "online" alone
const ONLINE_PRESENCE_DURATION = 320; // Act IV: "online + Presence" hold
const MADE_DURATION = 180;          // Act V: fast
const IMPACT_DURATION = 1000;       // Act V: NOW holds
const NOW_FADE_DURATION = 2000;     // 2-second fade out
const BACKGROUND_FADE_DELAY = 1800; // background fades at 1.8s into NOW fade

/**
 * Sentence-based cinematic title sequence
 * Reveals: "Website design made irresistible. Your online presence. Made now."
 */
export function LoadingSplash({ onComplete }: LoadingSplashProps) {
  const [phase, setPhase] = useState<SplashPhase>({ type: "word", index: 0 });
  const [backgroundFading, setBackgroundFading] = useState(false);
  const [nowExiting, setNowExiting] = useState(false);

  const advancePhase = useCallback(() => {
    setPhase((current) => {
      if (current.type === "word") {
        if (current.index < words.length - 1) {
          return { type: "word", index: current.index + 1 };
        }
        return { type: "breath" };
      }
      if (current.type === "breath") return { type: "your" };
      if (current.type === "your") return { type: "online" };
      if (current.type === "online") return { type: "onlinePresence" };
      if (current.type === "onlinePresence") return { type: "made" };
      if (current.type === "made") return { type: "impact" };
      return current;
    });
  }, []);

  useEffect(() => {
    if (phase.type === "complete") {
      onComplete();
      return;
    }

    // Impact phase has special overlapping fade logic
    if (phase.type === "impact") {
      const fadeTimer = setTimeout(() => {
        setNowExiting(true);
      }, IMPACT_DURATION);

      const bgFadeTimer = setTimeout(() => {
        setBackgroundFading(true);
      }, IMPACT_DURATION + BACKGROUND_FADE_DELAY);

      const completeTimer = setTimeout(() => {
        setPhase({ type: "complete" });
      }, IMPACT_DURATION + NOW_FADE_DURATION);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(bgFadeTimer);
        clearTimeout(completeTimer);
      };
    }

    let duration: number;
    
    if (phase.type === "word") {
      duration = words[phase.index].duration;
    } else if (phase.type === "breath") {
      duration = BREATH_DURATION;
    } else if (phase.type === "your") {
      duration = YOUR_DURATION;
    } else if (phase.type === "online") {
      duration = ONLINE_DURATION;
    } else if (phase.type === "onlinePresence") {
      duration = ONLINE_PRESENCE_DURATION;
    } else if (phase.type === "made") {
      duration = MADE_DURATION;
    } else {
      return;
    }

    const timer = setTimeout(advancePhase, duration);
    return () => clearTimeout(timer);
  }, [phase, advancePhase, onComplete]);

  // Clean micro-rise animation (no blur)
  const wordVariants = {
    hidden: { 
      opacity: 0, 
      y: 12
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.12,
        ease: [0.22, 1, 0.36, 1]
      }
    },
    exit: { 
      opacity: 0, 
      y: -8,
      transition: {
        duration: 0.08,
        ease: "easeIn"
      }
    }
  };

  // "Presence" fades in from the right
  const presenceVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.15, ease: "easeOut" }
    }
  };

  const textStyle = "font-display font-bold tracking-tight text-foreground uppercase";
  const textSize = "text-[clamp(2.5rem,10vw,6rem)]";

  return (
    <motion.div 
      className="fixed inset-0 z-[999] bg-background flex items-center justify-center overflow-hidden"
      animate={{ opacity: backgroundFading ? 0 : 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <AnimatePresence mode="wait">
        {/* Act I: Authority Build - identical 420ms cadence */}
        {phase.type === "word" && (
          <motion.span
            key={`word-${phase.index}`}
            className={`${textStyle} ${textSize}`}
            variants={wordVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {words[phase.index].text}
          </motion.span>
        )}

        {/* Act II: Breath - intentional pause (renders nothing, just holds) */}
        {phase.type === "breath" && (
          <motion.div
            key="breath"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
          />
        )}

        {/* Act III: "Your" alone */}
        {phase.type === "your" && (
          <motion.span
            key="your"
            className={`${textStyle} ${textSize}`}
            variants={wordVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            Your
          </motion.span>
        )}

        {/* Act III-IV: "online" alone → "online Presence" fluid transition */}
        {(phase.type === "online" || phase.type === "onlinePresence") && (
          <motion.div
            key="online-presence-container"
            className="flex flex-row items-baseline gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.06 } }}
          >
            <motion.span
              className={`${textStyle} ${textSize}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ 
                opacity: 1, 
                y: 0,
              }}
              transition={{ duration: 0.12, ease: [0.22, 1, 0.36, 1] }}
              layout
            >
              online
            </motion.span>
            
            <AnimatePresence>
              {phase.type === "onlinePresence" && (
                <motion.span
                  key="presence"
                  className={`${textStyle} ${textSize}`}
                  variants={presenceVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0 }}
                >
                  Presence
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Act V: "Made" fast */}
        {phase.type === "made" && (
          <motion.span
            key="made-final"
            className={`${textStyle} ${textSize}`}
            variants={wordVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            Made
          </motion.span>
        )}

        {/* Act V: "Now" impact */}
        {phase.type === "impact" && (
          <motion.span
            key="now"
            className={`${textStyle} ${textSize}`}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ 
              opacity: nowExiting ? 0 : 1, 
              scale: nowExiting ? 1 : [1, 1.04, 1]
            }}
            transition={{ 
              opacity: { duration: nowExiting ? 2.0 : 0.14, ease: "easeOut" },
              scale: { duration: 0.18, times: [0, 0.6, 1], ease: "easeOut" }
            }}
          >
            Now
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
