import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { useLenisScroll } from "@/hooks/useLenisScroll";

interface JourneyStage {
  id: string;
  label: string;
  section: string;
}

const journeyStages: JourneyStage[] = [
  { id: "approach", label: "Approach", section: "[01]" },
  { id: "projects", label: "Projects", section: "[02]" },
  { id: "services", label: "Services", section: "[03]" },
  { id: "craft", label: "C.R.A.F.T.™", section: "[04]" },
  { id: "begin", label: "Begin", section: "[05]" },
];

export function CustomerJourneyIndicator() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const isVisibleRef = useRef(false);
  const { scrollTo } = useLenisScroll();

  // Use Framer Motion's scroll hook for efficient scroll tracking
  const { scrollY } = useScroll();

  // Cache section positions to avoid layout thrashing during scroll
  const sectionOffsetsRef = useRef<{ id: string; top: number; bottom: number }[]>([]);

  // Measure sections on mount and resize
  useEffect(() => {
    const measureSections = () => {
      const offsets = journeyStages.map((stage) => {
        const element = document.getElementById(stage.id);
        if (!element) return null;
        const rect = element.getBoundingClientRect();
        // Calculate absolute top position relative to document
        const absoluteTop = rect.top + window.scrollY;
        return {
          id: stage.id,
          top: absoluteTop,
          bottom: absoluteTop + rect.height,
        };
      }).filter((item): item is { id: string; top: number; bottom: number } => item !== null);

      sectionOffsetsRef.current = offsets;
    };

    measureSections();

    // Debounced resize handler
    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(measureSections, 100);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimer);
    };
  }, []);

  // Use useMotionValueEvent to react to scroll changes with zero DOM reads
  useMotionValueEvent(scrollY, "change", (latest) => {
    // 1. Check Visibility (Approach section threshold)
    // We already moved "Approach" offset into the cached array
    const approachOffset = sectionOffsetsRef.current.find(s => s.id === "approach");
    let shouldBeVisible = false;

    if (approachOffset) {
      // Visible if we are past 20% of the viewport relative to the section start? 
      // Original logic: rect.top < window.innerHeight * 0.8
      // rect.top = absoluteTop - latest
      // absoluteTop - latest < innerHeight * 0.8  =>  latest > absoluteTop - innerHeight * 0.8
      shouldBeVisible = latest > (approachOffset.top - window.innerHeight * 0.8);
    }

    if (shouldBeVisible !== isVisibleRef.current) {
      isVisibleRef.current = shouldBeVisible;
      setIsVisible(shouldBeVisible);
    }

    // 2. Active Section Tracking
    const scrollFocusPoint = latest + window.innerHeight * 0.3; // Focus point 30% down screen
    let newIndex = 0;

    // Pure math comparison against cached offsets
    sectionOffsetsRef.current.forEach((section, index) => {
      if (scrollFocusPoint >= section.top) {
        newIndex = index;
      }
    });

    if (newIndex !== activeIndexRef.current) {
      activeIndexRef.current = newIndex;
      setActiveIndex(newIndex);
    }
  });

  const handleClick = (id: string) => {
    scrollTo(`#${id}`);
  };

  const getBarStyle = (index: number) => {
    if (index < activeIndex) {
      return { width: 10, opacity: 0.4 };
    } else if (index === activeIndex) {
      return { width: 16, opacity: 1 };
    } else {
      return { width: 5, opacity: 0.2 };
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed z-50 hidden xl:flex flex-col items-start gap-2"
          style={{
            left: "2rem",
            top: "5rem",
          }}
          initial={{ opacity: 0, y: -30, filter: "blur(8px)" }}
          animate={{
            opacity: 1,
            y: 0,
            filter: "blur(0px)"
          }}
          exit={{ opacity: 0, y: -30, filter: "blur(8px)" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Vertical Progress Line (background) - on left side */}
          <div
            className="absolute left-0 top-0 bottom-0 w-px bg-border/20"
            style={{ marginLeft: "-1px" }}
          />

          {/* Animated Progress Fill */}
          <motion.div
            className="absolute left-0 top-0 w-px bg-accent/60"
            style={{ marginLeft: "-1px" }}
            initial={{ height: "0%" }}
            animate={{
              height: `${((activeIndex + 1) / journeyStages.length) * 100}%`
            }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          />

          {journeyStages.map((stage, index) => {
            const barStyle = getBarStyle(index);
            const isActive = index === activeIndex;
            const isPassed = index < activeIndex;

            return (
              <motion.button
                key={stage.id}
                onClick={() => handleClick(stage.id)}
                className="relative flex items-center gap-2 group cursor-pointer py-1 pl-3"
                aria-label={`Navigate to ${stage.label} section`}
                whileHover={{ x: 2 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* Horizontal Bar (extends right from vertical line) */}
                <motion.div
                  className="h-px bg-foreground origin-left"
                  initial={false}
                  animate={{
                    width: barStyle.width,
                    opacity: barStyle.opacity,
                  }}
                  whileHover={{
                    width: barStyle.width + 8,
                    opacity: Math.min(barStyle.opacity + 0.3, 1),
                  }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                />

                {/* Section number and Label (right side) */}
                <motion.span
                  className={`text-[10px] font-mono tracking-wide whitespace-nowrap transition-colors duration-300 ${isActive
                      ? "text-foreground"
                      : isPassed
                        ? "text-muted-foreground/40"
                        : "text-muted-foreground/20 group-hover:text-muted-foreground/40"
                    }`}
                  initial={false}
                  animate={{
                    opacity: isActive ? 1 : isPassed ? 0.5 : 0.3,
                  }}
                  whileHover={{
                    opacity: 1,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="text-accent/60 group-hover:text-accent">{stage.section}</span>{" "}
                  {stage.label}
                </motion.span>
              </motion.button>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
