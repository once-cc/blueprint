import React, { useRef, useState, useEffect, useCallback } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent, AnimatePresence, useMotionValue, MotionValue } from "framer-motion";
import { useSmoothScroll } from "@/components/providers/SmoothScrollProvider";
import { cn } from "@/lib/utils";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { EditorialGridLines } from "@/components/ui/EditorialGridLines";
import { useInView } from "framer-motion";
import { SiFigma, SiReact, SiTailwindcss, SiTypescript, SiFramer, SiVercel, SiNotion, SiSlack } from "@icons-pack/react-simple-icons";
interface CraftStep {
  number: string;
  letter: string;
  title: string;
  tagline: string;
  bullets: string[];
  action: string;
  output: string;
}
const craftSteps: CraftStep[] = [{
  number: "1",
  letter: "C",
  title: "Clarify the Vision",
  tagline: "Get crystal clear on what success looks like for you.",
  bullets: ["Deep-dive discovery session to understand your goals, audience, and market.", "Identify your unique positioning and competitive advantages.", "Define success metrics and project scope."],
  action: "Discovery Session",
  output: "Vision Document + Project Brief"
}, {
  number: "2",
  letter: "R",
  title: "Research & Refine",
  tagline: "Know your market. Know your edge.",
  bullets: ["Competitive analysis to find gaps and opportunities.", "Audience research to understand decision triggers.", "Content audit and messaging hierarchy development."],
  action: "Research Sprint",
  output: "Market Positioning Report + Content Strategy"
}, {
  number: "3",
  letter: "A",
  title: "Align the Strategy",
  tagline: "Everyone on the same page. Same plan. Same direction.",
  bullets: ["Walk through every element of the Blueprint together.", "Stress-test assumptions, priorities, and constraints.", "Lock the timeline, investment tier, deliverables, and expectations."],
  action: "Strategy Call",
  output: "Approved Blueprint + Signed Agreement + Build Plan"
}, {
  number: "4",
  letter: "F",
  title: "Forge the Foundation",
  tagline: "Build it once. Build it right.",
  bullets: ["Design development with iterative feedback loops.", "Copywriting that connects and converts.", "Technical build with performance and SEO baked in."],
  action: "Build Phase",
  output: "Complete Website + Brand Assets + Documentation"
}, {
  number: "5",
  letter: "T",
  title: "Transform & Launch",
  tagline: "From potential to presence. You're live.",
  bullets: ["Final review, testing, and quality assurance.", "Launch coordination and go-live support.", "90-day optimization and strategic guidance."],
  action: "Launch Day",
  output: "Live Website + Training + 90-Day Support"
}];
const trustedBrands = [{
  name: "Figma",
  icon: SiFigma
}, {
  name: "React",
  icon: SiReact
}, {
  name: "Tailwind",
  icon: SiTailwindcss
}, {
  name: "TypeScript",
  icon: SiTypescript
}, {
  name: "Framer",
  icon: SiFramer
}, {
  name: "Vercel",
  icon: SiVercel
}, {
  name: "Notion",
  icon: SiNotion
}, {
  name: "Slack",
  icon: SiSlack
}];

// ScrollyLine component for staggered blur-in text animation
interface ScrollyLineProps {
  children: React.ReactNode;
  className?: string;
  staggerIndex?: number;
  progress?: any; // Shared progress value
}
function ScrollyLine({
  children,
  className = "",
  staggerIndex = 0,
  progress
}: ScrollyLineProps) {
  // Defensive fallback motion value
  const fallbackProgress = useMotionValue(0);
  const activeProgress = progress || fallbackProgress;

  // Map shared progress to animation window - loosened to 0.05s
  const staggerOffset = staggerIndex * 0.05;
  const start = 0.2 + staggerOffset;
  const end = 0.5 + staggerOffset;

  const opacity = useTransform(activeProgress, [start, end], [0, 1]);
  const y = useTransform(activeProgress, [start, end], [20, 0]);

  return (
    <motion.div
      className={className}
      style={{
        opacity: progress ? opacity : 1,
        y: progress ? y : 0,
        willChange: "transform, opacity"
      }}
    >
      {children}
    </motion.div>
  );
}
function InfiniteBrandCarousel() {
  const { isNavigating } = useSmoothScroll();
  const [isNavigatingLocal, setIsNavigatingLocal] = useState(false);
  const tracksRef = useRef<HTMLDivElement>(null);

  useMotionValueEvent(isNavigating, "change", (latest) => {
    setIsNavigatingLocal(latest);
  });

  return <div className="relative h-full flex items-center overflow-hidden">
    {/* Left fade */}
    <div className="absolute left-0 h-full w-24 bg-gradient-to-r from-background to-transparent z-10" />

    {/* Marquee track - moves RIGHT to simulate "entering" the framework */}
    <div ref={tracksRef} className={cn("marquee-track-reverse flex items-center gap-16 whitespace-nowrap", isNavigatingLocal && "carousel-paused")}>
      {[...trustedBrands, ...trustedBrands, ...trustedBrands].map((brand, i) => <div key={i} className="flex items-center gap-3 opacity-30 hover:opacity-60 transition-opacity duration-300">
        <brand.icon size={20} className="text-muted-foreground/60" />
        <span className="text-[10px] font-mono tracking-[0.2em] text-muted-foreground/40 uppercase">
          {brand.name}
        </span>
      </div>)}
    </div>

    {/* Right fade - more pronounced toward headline */}
    <div className="absolute right-0 h-full w-48 bg-gradient-to-l from-background via-background/90 to-transparent z-10" />

    {/* Arrow hint flowing into title */}
    <div className="absolute right-6 top-1/2 -translate-y-1/2 z-20">

    </div>
  </div>;
}
// Constants for mobile sticky behavior
const STICKY_OFFSET = 154; // 72px NAV + ~70px header + 12px gap

// Mobile Sticky Card Component - true overlap-driven recede effect
interface MobileStickyCardProps {
  step: CraftStep;
  index: number;
  progress: MotionValue<number>;
  totalCards: number;
}

function MobileStickyCard({ step, index, progress, totalCards }: MobileStickyCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Define step ranges relative to the section's scroll (0.2 to 0.9 range)
  const stepStart = 0.2 + (index * 0.14);
  const stepEnd = stepStart + 0.14;

  // Entrance from below
  const yEntrance = useTransform(progress, [stepStart - 0.15, stepStart], [400, 0]);
  const opacityEntrance = useTransform(progress, [stepStart - 0.1, stepStart], [0, 1]);

  // Recede effect: When NEXT card enters
  const nextStart = stepEnd;
  const nextEnd = nextStart + 0.1;
  const recedeProgress = useTransform(progress, [nextStart, nextEnd], [0, 1]);

  const scale = useTransform(recedeProgress, [0, 1], [1, 0.92]);
  const rotate = useTransform(recedeProgress, [0, 1], [0, -2]);
  const recedeY = useTransform(recedeProgress, [0, 1], [0, 12]);
  const recedeOpacity = useTransform(recedeProgress, [0.4, 1], [1, 0.4]);

  const zIndex = 10 + index;

  return (
    <motion.div
      ref={cardRef}
      className="absolute inset-x-0 bg-sidebar rounded-xl border border-border/30 px-5 py-6"
      style={{
        top: `${STICKY_OFFSET}px`,
        zIndex,
        opacity: index < totalCards - 1 ? recedeOpacity : opacityEntrance,
        y: useTransform([yEntrance, recedeY], ([yE, yR]) => (yE as number) + (yR as number)),
        scale,
        rotate,
        whiteSpace: 'normal',
        willChange: "transform, opacity",
        contain: "paint layout"
      }}
    >
      <div
        className="flex items-center gap-4 mb-4"
      >
        <span className="font-display text-5xl font-light text-foreground/15">
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-accent/15 text-accent font-semibold">
          {step.letter}
        </span>
      </div>

      <div>
        <h3 className="text-xl font-display text-foreground mb-2">{step.title}</h3>
        <p className="text-sm text-muted-foreground italic mb-4">"{step.tagline}"</p>
      </div>

      <ul className="space-y-2 mb-4">
        {step.bullets.map((bullet, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full mt-1.5 bg-accent shrink-0" />
            {bullet}
          </li>
        ))}
      </ul>

      <div className="pt-3 border-t border-border/20 space-y-2">
        <div>
          <span className="text-xs uppercase tracking-wider text-accent font-mono">Action</span>
          <p className="text-sm text-foreground">{step.action}</p>
        </div>
        <div>
          <span className="text-xs uppercase tracking-wider text-accent font-mono">Output</span>
          <p className="text-sm text-foreground">{step.output}</p>
        </div>
      </div>
    </motion.div>
  );
}

// Container component that manages shared refs for overlap detection
function MobileStickyCards({ progress }: { progress: MotionValue<number> }) {
  return (
    <div className="relative h-full w-full">
      {/* Sticky Root Wrapper */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <div className="relative h-full px-6">
          {craftSteps.map((step, index) => (
            <MobileStickyCard
              key={step.number}
              step={step}
              index={index}
              progress={progress}
              totalCards={craftSteps.length}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Pill Scroll Indicator Component
function PillScrollIndicator({
  activeIndex,
  totalSteps,
  scrollProgress,
  onStepClick,
  isNavigating = false
}: {
  activeIndex: number;
  totalSteps: number;
  scrollProgress: MotionValue<number>;
  onStepClick: (index: number) => void;
  isNavigating?: boolean;
}) {
  // Use declarative visibility based on progress ranges
  const opacity = useTransform(scrollProgress, [0.18, 0.22, 0.92, 0.98], [0, 1, 1, 0]);
  const pointerEvents = useTransform(scrollProgress, [0.18, 0.22, 0.92, 0.98], ["none", "auto", "auto", "none"] as any);

  return (
    <motion.div
      style={{ opacity, pointerEvents }}
      className="fixed right-8 top-1/2 -translate-y-1/2 z-50 hidden lg:block"
    >
      {/* Pill container */}
      <div className="flex flex-col items-center gap-3 px-2.5 py-4 rounded-full bg-background/60 backdrop-blur-sm border border-border/30">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <motion.button
            key={index}
            onClick={() => onStepClick(index)}
            className="relative cursor-pointer p-1 -m-1 group"
            animate={{
              scale: index === activeIndex ? 1.3 : 1,
            }}
            whileHover={{ scale: 1.5 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {/* Dot */}
            <motion.div
              className="w-2 h-2 rounded-full transition-colors group-hover:bg-accent"
              animate={{
                backgroundColor: index <= activeIndex
                  ? "hsl(var(--accent))"
                  : "hsl(var(--border) / 0.4)",
              }}
              transition={{ duration: 0.3 }}
            />
            {/* Active glow ring */}
            {index === activeIndex && !isNavigating && (
              <motion.div
                className="absolute inset-0 rounded-full bg-accent/30"
                initial={{ scale: 1, opacity: 0 }}
                animate={{ scale: 2, opacity: 0.5 }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              />
            )}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

// Bouncing scroll continue pill - ambient directional affordance
function ScrollContinuePill({
  scrollProgress,
  onScrollNext,
  isNavigating = false
}: {
  scrollProgress: MotionValue<number>;
  onScrollNext?: () => void;
  isNavigating?: boolean;
}) {
  const opacity = useTransform(scrollProgress, [0.18, 0.25, 0.82, 0.88], [0, 1, 1, 0]);
  const pointerEvents = useTransform(scrollProgress, [0.18, 0.25, 0.82, 0.88], ["none", "auto", "auto", "none"] as any);

  return (
    <motion.div
      style={{ opacity, pointerEvents }}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 hidden md:block"
    >
      <motion.div
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-background/40 backdrop-blur-sm border border-accent/20 cursor-pointer"
        onClick={onScrollNext}
        animate={isNavigating ? { y: 0 } : {
          y: [0, -8, 0]
        }}
        transition={isNavigating ? { duration: 0.3 } : {
          duration: 1.6,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "loop"
        }}
        whileHover={{ scale: 1.05, backgroundColor: "hsl(var(--accent) / 0.15)" }}
      >
        {/* Chevron icon */}
        <svg
          className="w-4 h-4 text-accent/70"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
        <span className="text-xs font-mono tracking-wider text-accent/60 uppercase">
          Scroll
        </span>
      </motion.div>
    </motion.div>
  );
}

interface CraftSectionProps {
  id?: string;
}
export function CraftSection({
  id
}: CraftSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexMV = useMotionValue(0);
  const [committedIndex, setCommittedIndex] = useState(0);
  const [previousIndex, setPreviousIndex] = useState<number | null>(null);
  const [isTabletOrBelow, setIsTabletOrBelow] = useState(false);
  const { isNavigating, scrollTo } = useSmoothScroll();
  const [isNavigatingLocal, setIsNavigatingLocal] = useState(false);

  useMotionValueEvent(isNavigating, "change", (latest) => {
    setIsNavigatingLocal(latest);
  });

  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingTriggered, setLoadingTriggered] = useState(false);

  // === CRAFT Interaction Contract - Design Constants ===
  const CRAFT_ACTIVE_START = 0.05;    // scrollYProgress where section "owns" scroll
  const CRAFT_ACTIVE_END = 0.95;      // scrollYProgress where section releases scroll
  const CRAFT_HEADER_SKIP = 0.15;     // portion reserved for header animation
  const CRAFT_CONTENT_RANGE = 0.80;   // portion used for step panels
  const NAV_LOCK_DURATION = 650;      // ms to hold lock during state transition
  const HEADER_OFFSET = 0;            // adjust if sticky nav exists

  // Navigation lock - prevents scroll listeners from fighting indicator clicks
  const isNavigatingRef = useRef(false);

  // Track if CRAFT section is currently the active interaction zone
  const isCraftActiveRef = useRef(false);

  // Anchor ref for precise scroll positioning
  const craftAnchorRef = useRef<HTMLDivElement>(null);

  // Navigate to a specific CRAFT step via direct state control
  const navigateToStep = useCallback((index: number) => {
    // Guard against rapid re-entry - each click waits its turn
    if (isNavigatingRef.current) return;
    if (!sectionRef.current || !craftAnchorRef.current) return;

    // Clamp index to valid range
    const targetIndex = Math.min(Math.max(0, index), craftSteps.length - 1);

    // Already on this step? Do nothing
    if (targetIndex === committedIndex) return;

    // Engage navigation lock
    isNavigatingRef.current = true;

    // Commit state change with functional update to avoid stale closure
    const commitNavigation = () => {
      setCommittedIndex(current => {
        setPreviousIndex(current);
        return targetIndex;
      });
      setActiveIndex(targetIndex);
      activeIndexMV.set(targetIndex);

      // Release lock after panel animation settles
      setTimeout(() => {
        isNavigatingRef.current = false;
      }, NAV_LOCK_DURATION);
    };

    // Check if CRAFT section is currently the active interaction zone
    if (!isCraftActiveRef.current) {
      // Section not active - scroll to anchor first, then commit state
      const anchorY = craftAnchorRef.current.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;

      scrollTo(anchorY, {
        duration: 0.8,
        onComplete: () => {
          setTimeout(commitNavigation, 100);
        }
      });
    } else {
      // Section is active - directly update state (no scrolling)
      commitNavigation();
    }
  }, [scrollTo, committedIndex]);

  // Navigate to next step (for continue pill)
  const navigateToNextStep = useCallback(() => {
    if (committedIndex < craftSteps.length - 1) {
      navigateToStep(committedIndex + 1);
    }
  }, [committedIndex, navigateToStep]);

  // Hysteresis threshold - prevents flickering at boundaries
  const HYSTERESIS = 0.02;
  const lastThresholdRef = useRef<number>(0);

  // Time-based loading cascade triggered when first panel expands
  const runLoadingCascade = () => {
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      setLoadingProgress(currentStep);
      if (currentStep >= craftSteps.length) {
        clearInterval(interval);
        // Mark complete after a brief pause
        setTimeout(() => setLoadingProgress(6), 150);
      }
    }, 180); // 180ms per step
  };
  useEffect(() => {
    const checkWidth = () => {
      setIsTabletOrBelow(window.innerWidth < 768);
    };
    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  // Header scroll context
  const headerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: headerScrollProgress } = useScroll({
    target: headerRef,
    offset: ["start 0.9", "center 0.3"]
  });

  const {
    scrollYProgress
  } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"]
  });

  // Threshold-based committed transitions
  useMotionValueEvent(scrollYProgress, "change", progress => {
    // Track active zone state using design constants
    isCraftActiveRef.current = progress > CRAFT_ACTIVE_START && progress < CRAFT_ACTIVE_END;

    // CRITICAL: Skip state updates if indicator navigation is in progress
    if (isNavigatingRef.current) return;

    // Skip header section
    const adjustedProgress = Math.max(0, (progress - CRAFT_HEADER_SKIP) / CRAFT_CONTENT_RANGE);
    const rawIndex = adjustedProgress * craftSteps.length;
    const stepIndex = Math.floor(rawIndex);
    const clampedIndex = Math.min(Math.max(0, stepIndex), craftSteps.length - 1);

    // Update activeIndex and committedIndex for UI logic and swap
    if (clampedIndex !== committedIndex) {
      // Calculate threshold position for current step with small hysteresis
      const progressInSteps = adjustedProgress / (1 / craftSteps.length);
      const positionInCurrentStep = progressInSteps % 1;

      const shouldCommit =
        (clampedIndex > committedIndex && positionInCurrentStep > 0.3) ||
        (clampedIndex < committedIndex && positionInCurrentStep < 0.7);

      if (shouldCommit) {
        setPreviousIndex(committedIndex);
        setCommittedIndex(clampedIndex);
        setActiveIndex(clampedIndex);
        activeIndexMV.set(clampedIndex);
      }
    }

    // Trigger time-based loading cascade when first panel starts expanding
    if (progress >= 0.18 && !loadingTriggered) {
      setLoadingTriggered(true);
      runLoadingCascade();
    }
  });

  // === SIDEBAR ANIMATION: Enter from LEFT, stay visible throughout ===

  // === SIDEBAR ANIMATION: Enter from LEFT, stay visible throughout ===
  const sidebarX = useTransform(scrollYProgress, [0, 0.14], [-100, 0]);
  const sidebarOpacity = useTransform(scrollYProgress, [0.06, 0.14], [0, 1]);
  const sidebarXPercent = useTransform(sidebarX, v => `${v}%`);

  // === FIRST PANEL: Enters from LEFT after header clears (starts at 0.12) ===
  const firstPanelX = useTransform(scrollYProgress, [0.12, 0.22], [-100, 0]);
  const firstPanelOpacity = useTransform(scrollYProgress, [0.12, 0.20], [0, 1]);
  const firstPanelXPercent = useTransform(firstPanelX, v => `${v}%`);

  // === REMAINING 4 PANELS: Enter from RIGHT after first panel locks (starts at 0.20) ===
  const remainingPanelsX = useTransform(scrollYProgress, [0.20, 0.32], [100, 0]);
  const remainingPanelsOpacity = useTransform(scrollYProgress, [0.20, 0.30], [0, 1]);
  const remainingPanelsXPercent = useTransform(remainingPanelsX, v => `${v}%`);

  // Mobile section ref for scroll-based header fade
  // Mobile/Tablet: Simple Sticky Header + Natural Scrolling Panels
  if (isTabletOrBelow) {
    return (
      <section id={id} className="relative bg-transparent">
        <div className="grain-overlay opacity-[0.02]" />

        {/* Scrollytell Header - Tighter spacing to match Services */}
        <div ref={headerRef} className="px-6 pt-12 pb-8 relative">
          <EditorialGridLines showHorizontalTop horizontalTopPosition="0%" />

          <div className="space-y-1 text-right">
            <ScrollyLine staggerIndex={0} progress={headerScrollProgress}>
              <p className="text-2xl sm:text-3xl font-serif leading-[1.15] tracking-tight">
                <span className="text-foreground">From intent to execution.</span>
              </p>
            </ScrollyLine>

            <ScrollyLine staggerIndex={1} progress={headerScrollProgress}>
              <p className="text-2xl sm:text-3xl font-serif leading-[1.15] tracking-tight">
                <span className="text-muted-foreground">A structured approach that</span>
              </p>
            </ScrollyLine>

            <ScrollyLine staggerIndex={2} progress={headerScrollProgress}>
              <p className="text-2xl sm:text-3xl font-serif leading-[1.15] tracking-tight">
                <span className="text-foreground">aligns brand, UX, and systems</span>
              </p>
            </ScrollyLine>

            <ScrollyLine staggerIndex={3} progress={headerScrollProgress}>
              <p className="text-2xl sm:text-3xl font-serif leading-[1.15] tracking-tight">
                <span className="text-muted-foreground">to create a high-performing</span>
              </p>
            </ScrollyLine>

            <ScrollyLine staggerIndex={4} progress={headerScrollProgress}>
              <p className="text-2xl sm:text-3xl font-serif leading-[1.15] tracking-tight">
                <span className="text-muted-foreground">digital presence.</span>
              </p>
            </ScrollyLine>
          </div>
        </div>

        {/* Sticky Header - Section title + Headline - locks below NAV with blur-in */}
        <div className="sticky top-[72px] z-20 bg-sidebar backdrop-blur-sm shadow-md px-6 pt-4 pb-3">
          <div className="text-right">
            <ScrollyLine staggerIndex={5} className="" progress={headerScrollProgress}>
              <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                [04] The C.R.A.F.T.™ Framework
              </span>
            </ScrollyLine>
            <ScrollyLine staggerIndex={6} className="mt-1" progress={headerScrollProgress}>
              <h2 className="heading-display text-foreground text-3xl sm:text-4xl">
                C.R.A.F.T.™
              </h2>
            </ScrollyLine>
          </div>
          {/* Gradient fade below - seamless "sliding under" effect, flush with header */}
          <div
            className="absolute bottom-0 left-0 right-0 h-16 translate-y-full pointer-events-none"
            style={{
              background: 'linear-gradient(to bottom, hsl(var(--background)) 0%, hsl(var(--background) / 0.6) 40%, transparent 100%)'
            }}
          />
        </div>

        {/* Simulated Sticky Cards Container */}
        <div className="h-[400vh] relative">
          <MobileStickyCards progress={scrollYProgress} />
        </div>
      </section>
    );
  }

  // Desktop: Architectural Panels Layout
  return <section ref={sectionRef} id={id} className="relative bg-transparent" style={{
    minHeight: "600vh"
  }}>
    {/* Scroll anchor for precise positioning */}
    <div ref={craftAnchorRef} className="absolute top-0 left-0 h-px w-px pointer-events-none" />
    {/* Scrollytell Header - Full viewport intro ABOVE the sticky panel - Right Aligned */}
    <div ref={headerRef} className="min-h-screen flex flex-col justify-center px-6 md:px-12 lg:px-24 py-32 relative">
      {/* Editorial Grid Lines for cohesion */}
      <EditorialGridLines />

      <div className="max-w-7xl mx-auto w-full space-y-1 text-right">
        <ScrollyLine staggerIndex={0} progress={headerScrollProgress}>
          <p className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-serif leading-[1.15] tracking-tight max-w-5xl ml-auto">
            <span className="text-foreground">From intent to execution.</span>
          </p>
        </ScrollyLine>

        <ScrollyLine staggerIndex={1} progress={headerScrollProgress}>
          <p className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-serif leading-[1.15] tracking-tight max-w-5xl ml-auto">
            <span className="text-muted-foreground">A structured approach that</span>
          </p>
        </ScrollyLine>

        <ScrollyLine staggerIndex={2} progress={headerScrollProgress}>
          <p className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-serif leading-[1.15] tracking-tight max-w-5xl ml-auto">
            <span className="text-foreground">aligns brand, UX, and systems</span>
          </p>
        </ScrollyLine>

        <ScrollyLine staggerIndex={3} progress={headerScrollProgress}>
          <p className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-serif leading-[1.15] tracking-tight max-w-5xl ml-auto">
            <span className="text-muted-foreground">to create a high-performing digital presence.</span>
          </p>
        </ScrollyLine>

        <ScrollyLine staggerIndex={5} className="pt-12" progress={headerScrollProgress}>
          <SectionTitle>[04] The C.R.A.F.T.™ Framework</SectionTitle>
        </ScrollyLine>

        <ScrollyLine staggerIndex={6} className="pt-4" progress={headerScrollProgress}>
          <h2 className="heading-display text-foreground">C.R.A.F.T.™</h2>
        </ScrollyLine>
      </div>
    </div>

    {/* Horizontal divider line after header */}
    <div className="w-full h-px" style={{
      background: 'linear-gradient(to right, transparent 5%, hsl(var(--border) / 0.4) 20%, hsl(var(--border) / 0.4) 80%, transparent 95%)'
    }} />

    {/* Sticky Panel with Logo Carousel and Step Panels */}
    <div className="sticky top-0 h-screen w-full overflow-hidden">
      <div className="grain-overlay opacity-[0.02]" />

      <div className="relative h-full max-w-[1800px] mx-auto flex flex-col">
        {/* Logo Carousel Zone - Flows into title */}
        <div className="h-[80px] relative overflow-hidden border-b border-border/10">
          <InfiniteBrandCarousel />
        </div>

        {/* Two Column Layout */}
        <div className="flex-1 flex">
          {/* Left Column: Sidebar Panel - Independent Animation */}
          <motion.div className="hidden xl:flex w-64 flex-shrink-0 flex-col justify-between py-12 pl-12 border-r border-border/20 relative" style={{
            x: sidebarXPercent,
            opacity: sidebarOpacity
          }}>
            {/* Vertical grid line */}
            <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-border/40 via-border/20 to-border/40" />

            {/* Top: Reserved space */}
            <div />

            {/* Middle: Operational Markers with Vertical Accent Bars */}
            <div className="space-y-6">
              {/* KICKOFF */}
              <div className="flex items-stretch gap-4">
                <div className="w-1 bg-accent rounded-full" />
                <div>
                  <span className="text-[10px] font-mono tracking-[0.15em] text-muted-foreground/60 uppercase">
                    Kickoff
                  </span>
                  <p className="text-2xl font-serif font-medium text-foreground mt-1">3-5 Days</p>
                </div>
              </div>

              {/* TURNAROUND */}
              <div className="flex items-stretch gap-4">
                <div className="w-1 bg-accent rounded-full" />
                <div>
                  <span className="text-[10px] font-mono tracking-[0.15em] text-muted-foreground/60 uppercase">
                    Turnaround
                  </span>
                  <p className="text-2xl font-serif font-medium text-foreground mt-1">48 Hours</p>
                </div>
              </div>

              {/* TOTAL TIMELINE */}
              <div className="flex items-stretch gap-4">
                <div className="w-1 bg-accent rounded-full" />
                <div>
                  <span className="text-[10px] font-mono tracking-[0.15em] text-muted-foreground/60 uppercase">
                    Total Timeline
                  </span>
                  <p className="text-2xl font-serif font-medium text-foreground mt-1">4-8 Weeks</p>
                </div>
              </div>
            </div>

            {/* Bottom: Progress Indicator - Explicit Animation Trigger */}
            <div className="flex flex-col gap-2">
              {craftSteps.map((step, index) => {
                // During loading phase (0 < loadingProgress < 6), use cascade logic
                const isLoading = loadingProgress > 0 && loadingProgress < 6;
                const isCommitted = isLoading ? index < loadingProgress // Sequential light-up during loading
                  : index === committedIndex; // Use committed index for trigger behavior
                const isPast = !isLoading && index < committedIndex;
                return (
                  <motion.button
                    key={step.number}
                    onClick={() => navigateToStep(index)}
                    className="h-1.5 rounded-full overflow-hidden cursor-pointer"
                    initial={{ width: 48 }}
                    animate={{ width: isCommitted ? 72 : 48 }}
                    whileHover={{ width: 80, opacity: 0.9 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <motion.div
                      className="h-full rounded-full"
                      initial={{ scaleX: 0, originX: 0 }}
                      animate={{
                        scaleX: isCommitted ? 1 : isPast ? 0.85 : 0.5,
                        backgroundColor: isCommitted ? "hsl(var(--accent))" : isPast ? "hsl(var(--foreground) / 0.4)" : "hsl(var(--border) / 0.3)"
                      }}
                      transition={{
                        duration: 0.6,
                        delay: isLoading ? index * 0.08 : 0,
                        ease: [0.22, 1, 0.36, 1]
                      }}
                      style={{ width: "100%", height: "100%" }}
                    />
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Right Column: Panel Grid */}
          <div className="flex-1 flex flex-col h-full relative overflow-hidden">
            {/* Panel Grid - Choreographed Entry */}
            <div className="flex-1 flex items-stretch relative" style={{ contain: "paint layout" }}>
              {/* Horizontal frame lines */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/40 to-transparent z-10" />
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/40 to-transparent z-10" />

              {/* Additional horizontal accent line */}
              <div className="absolute top-[15%] left-0 right-0 h-px bg-gradient-to-r from-border/10 via-border/20 to-border/10 z-10" />

              {craftSteps.map((step, index) => (
                <motion.div
                  key={step.number}
                  initial={false}
                  animate={{
                    flex: index === committedIndex ? 2 : 0.5
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 120, // Slightly crisper for performance
                    damping: 24,
                    mass: 0.5
                  }}
                  style={{
                    x: index === 0 ? firstPanelXPercent : remainingPanelsXPercent,
                    opacity: index === 0 ? firstPanelOpacity : remainingPanelsOpacity,
                    willChange: "flex, transform",
                    contain: "paint layout"
                  }}
                >
                  <CraftPanel step={step} index={index} isActive={index === committedIndex} isContracting={previousIndex !== null && index === previousIndex} totalSteps={craftSteps.length} />
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Section label for smaller screens - aligned with panel top */}
        <div className="absolute top-[80px] left-8 xl:hidden">
          {/* Top editorial line */}
          <div
            className="w-40 h-px mb-4"
            style={{
              background: 'linear-gradient(to right, hsl(var(--border) / 0.5), transparent)'
            }}
          />

          <SectionTitle>[04] The C.R.A.F.T.™ Framework</SectionTitle>

          {/* Bottom editorial line */}
          <div
            className="w-28 h-px mt-4"
            style={{
              background: 'linear-gradient(to right, hsl(var(--border) / 0.3), transparent)'
            }}
          />
        </div>

        {/* Continue Scroll Indicator - inside sticky panel for proper positioning */}
        <ScrollContinuePill
          scrollProgress={scrollYProgress}
          onScrollNext={navigateToNextStep}
          isNavigating={isNavigatingLocal}
        />
      </div>
    </div>

    {/* Indicators and Navigation Controls */}
    <PillScrollIndicator
      activeIndex={committedIndex}
      totalSteps={craftSteps.length}
      scrollProgress={scrollYProgress}
      onStepClick={navigateToStep}
      isNavigating={isNavigatingLocal}
    />

    <ScrollContinuePill
      scrollProgress={scrollYProgress}
      onScrollNext={navigateToNextStep}
      isNavigating={isNavigatingLocal}
    />
  </section>;
}
interface CraftPanelProps {
  step: CraftStep;
  index: number;
  isActive: boolean;
  isContracting: boolean;
  totalSteps: number;
}
function CraftPanel({
  step,
  index,
  isActive,
  isContracting,
  totalSteps
}: CraftPanelProps) {
  return <div className={`relative h-full w-full flex flex-col ${isActive ? "bg-sidebar" : "bg-sidebar/95"}`}>
    {/* Editorial grid texture overlay for active panel */}
    {isActive && (
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
              linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)
            `,
          backgroundSize: '40px 40px',
          contain: 'strict'
        }}
      />
    )}

    {/* Left vertical grid line */}
    <div className={`absolute left-0 top-0 bottom-0 w-px transition-all duration-500 ${isActive ? "bg-gradient-to-b from-accent/40 via-accent/20 to-accent/40" : "bg-gradient-to-b from-transparent via-border/30 to-transparent"}`} />

    {/* Right vertical grid line (only on last panel) */}
    {index === totalSteps - 1 && <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-border/30 to-transparent" />}

    {/* Active panel highlight */}
    {isActive && <motion.div className="absolute inset-0 pointer-events-none" initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} exit={{
      opacity: 0
    }}>
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-accent/30" />
      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-accent/20" />
    </motion.div>}

    {/* Large Number - Always visible */}
    <div className="absolute top-8 left-6">
      <motion.span className="text-7xl lg:text-8xl xl:text-9xl font-serif font-bold leading-none" animate={{
        color: isActive ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground) / 0.15)"
      }} transition={{
        duration: 0.5
      }}>
        {step.number}
      </motion.span>
    </div>

    {/* Content - Revealed when active */}
    <AnimatePresence mode="wait">
      {isActive && <motion.div className="absolute inset-0 flex flex-col justify-start p-8 pt-48 overflow-hidden" initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} transition={{
        duration: 0.4
      }}>
        {/* Letter Badge - enters first */}
        <motion.div initial={{
          opacity: 0,
          x: 40
        }} animate={{
          opacity: 1,
          x: 0
        }} exit={{
          opacity: 0,
          x: 20
        }} transition={{
          duration: 0.5,
          delay: 0.15,
          ease: [0.22, 1, 0.36, 1]
        }} className="mb-4">
          <span className="text-xs font-mono text-accent tracking-widest">
            {step.letter}.
          </span>
        </motion.div>

        {/* Title - enters second */}
        <motion.h3 className="text-2xl lg:text-3xl xl:text-4xl font-serif font-medium text-foreground mb-3" initial={{
          opacity: 0,
          x: 60
        }} animate={{
          opacity: 1,
          x: 0
        }} exit={{
          opacity: 0,
          x: 30
        }} transition={{
          duration: 0.5,
          delay: 0.2,
          ease: [0.22, 1, 0.36, 1]
        }}>
          {step.title}
        </motion.h3>

        {/* Tagline - enters third */}
        <motion.p className="text-lg font-serif italic text-muted-foreground mb-6" initial={{
          opacity: 0,
          x: 80
        }} animate={{
          opacity: 1,
          x: 0
        }} exit={{
          opacity: 0,
          x: 40
        }} transition={{
          duration: 0.5,
          delay: 0.25,
          ease: [0.22, 1, 0.36, 1]
        }}>
          "{step.tagline}"
        </motion.p>

        {/* Bullets - staggered cascade from right */}
        <motion.ul className="space-y-2 mb-8" initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} exit={{
          opacity: 0
        }} transition={{
          duration: 0.3,
          delay: 0.3
        }}>
          {step.bullets.map((bullet, i) => <motion.li key={i} className="text-sm text-muted-foreground flex items-start gap-2" initial={{
            opacity: 0,
            x: 50
          }} animate={{
            opacity: 1,
            x: 0
          }} exit={{
            opacity: 0,
            x: 25
          }} transition={{
            duration: 0.4,
            delay: 0.35 + i * 0.08,
            ease: [0.22, 1, 0.36, 1]
          }}>
            <span className="w-1 h-1 rounded-full bg-accent mt-1.5 flex-shrink-0" />
            {bullet}
          </motion.li>)}
        </motion.ul>

        {/* Action & Output - rise up from below as finale */}
        <motion.div className="grid grid-cols-2 gap-4 pt-6 border-t border-border/30" initial={{
          opacity: 0,
          y: 40
        }} animate={{
          opacity: 1,
          y: 0
        }} exit={{
          opacity: 0,
          y: 20
        }} transition={{
          duration: 0.6,
          delay: 0.55,
          ease: [0.22, 1, 0.36, 1]
        }}>
          <motion.div initial={{
            opacity: 0,
            y: 30
          }} animate={{
            opacity: 1,
            y: 0
          }} exit={{
            opacity: 0,
            y: 15
          }} transition={{
            duration: 0.5,
            delay: 0.6,
            ease: [0.22, 1, 0.36, 1]
          }}>
            <span className="text-[10px] font-mono text-accent tracking-widest uppercase">
              Action
            </span>
            <p className="text-sm font-medium text-foreground mt-1">{step.action}</p>
          </motion.div>
          <motion.div initial={{
            opacity: 0,
            y: 30
          }} animate={{
            opacity: 1,
            y: 0
          }} exit={{
            opacity: 0,
            y: 15
          }} transition={{
            duration: 0.5,
            delay: 0.7,
            ease: [0.22, 1, 0.36, 1]
          }}>
            <span className="text-[10px] font-mono text-accent tracking-widest uppercase">
              Output
            </span>
            <p className="text-sm font-medium text-foreground mt-1">{step.output}</p>
          </motion.div>
        </motion.div>
      </motion.div>}
    </AnimatePresence>

    {/* Inactive: Show letter subtly */}
    {!isActive && <div className="absolute bottom-8 left-6">
      <span className="text-xs font-mono text-muted-foreground/40 tracking-widest">
        {step.letter}.
      </span>
    </div>}
  </div>;
}