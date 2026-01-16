/**
 * ServicesContent - Foreground-only Services section content
 * Designed to be rendered within a shared background band
 * No background color - transparent
 */

import React, { useRef, useState, useEffect, useCallback, memo, forwardRef } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent, AnimatePresence, MotionValue, useMotionValue } from "framer-motion";
import { useLenisScroll } from "@/hooks/useLenisScroll";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { EditorialGridLines } from "@/components/ui/EditorialGridLines";
import { ServicesViewportBackdrop } from "@/components/sections/ServicesViewportBackdrop";
import { ChevronDown } from "lucide-react";
import work01 from "@/assets/work-01.jpg";
import work02 from "@/assets/work-02.jpg";
import work03 from "@/assets/work-03.jpg";
import work04 from "@/assets/work-04.jpg";
import work05 from "@/assets/work-05.jpg";



const services = [{
  id: "01",
  title: "Brand Identity",
  positioning: "Strategic clarity before aesthetics",
  primaryDescription: "We define what your business stands for, who it serves best, and how it positions itself in the market — then translate that clarity into a cohesive brand identity system designed to scale.",
  capabilities: ["Brand Strategy & Positioning", "Visual Identity Systems", "Messaging Architecture", "Brand Guidelines & Asset Systems", "Offer & Market Alignment"],
  deliverables: ["Brand identity refinement (new or existing brands)", "Ideal Customer Profile (ICP / Avatar definition)", "Offer architecture & positioning (value-led)", "Brand narrative & message hierarchy", "Visual direction & tonal guardrails", "Strategic brand documentation (internal + external use)"],
  signal: "We don't just design — we make decisions stick.",
  image: work01
}, {
  id: "02",
  title: "Digital Design",
  positioning: "Conversion-led, not trend-led",
  primaryDescription: "We design websites and digital interfaces that feel effortless to use and intentional by design — balancing aesthetics, usability, and conversion from the first interaction.",
  capabilities: ["Website & Interface Design", "UX / UI Architecture", "Design Systems", "Prototyping & Interaction Design", "Mobile-First Optimisation"],
  deliverables: ["Cinematic website design (desktop + mobile)", "Conversion-aware layout & page structure", "Custom qualifying forms & user flows", "Mobile optimisation & performance pass", "Design systems for future scaling", "UX decisions tied to business outcomes"],
  signal: "Every design choice has a reason.",
  image: work02
}, {
  id: "03",
  title: "Product Design",
  positioning: "From idea to usable system",
  primaryDescription: "We turn ideas into structured services and digital products — mapping functionality, flows, and system logic so nothing is built blindly.",
  capabilities: ["Product & Service Strategy", "MVP Definition & Scoping", "Functional System Design", "Experience & Flow Architecture", "Design Sprints"],
  deliverables: ["Crafted Website Blueprint (core differentiator)", "Customer journey framework", "Service & capability mapping", "Client / customer portal design", "Custom booking & scheduling systems", "Service productisation frameworks"],
  signal: "We think in systems, not pages.",
  image: work03
}, {
  id: "04",
  title: "Marketing & Growth",
  positioning: "Infrastructure, not hype",
  primaryDescription: "We build marketing and growth systems that compound — aligning messaging, funnels, and automation so acquisition feels intentional, not forced.",
  capabilities: ["Funnel Strategy & Design", "Conversion Optimisation", "Campaign & Asset Design", "Email & Lifecycle Systems", "Analytics & Optimisation"],
  deliverables: ["Sales funnels & lead funnels", "Conversion-focused copywriting", "Lead engine setup", "Automated texts, emails & bookings", "Email automation sequences", "Analytics dashboard setup", "SEO foundations (technical + content alignment)"],
  signal: "Growth without chaos.",
  image: work04
}, {
  id: "05",
  title: "Development",
  positioning: "Reliable, scalable execution",
  primaryDescription: "We build what we design — cleanly, efficiently, and with performance in mind — so systems remain stable and scale as your business grows.",
  capabilities: ["Frontend & Backend Development", "React / Next.js", "CMS & Platform Integration", "Performance & Accessibility", "System Automation"],
  deliverables: ["CRM implementation & integration", "GoHighLevel automations", "Client & internal dashboards", "Custom workflows & system logic", "Performance optimisation", "Accessibility & compliance considerations"],
  signal: "Built properly the first time.",
  image: work05
}];

// ============ SCROLLY LINE (Blur-In Animation) ============

interface ScrollyLineProps {
  children: React.ReactNode;
  className?: string;
  staggerIndex?: number;
  progress?: MotionValue<number>; // Shared progress value
}

function ScrollyLine({
  children,
  className = "",
  staggerIndex = 0,
  progress
}: ScrollyLineProps) {
  // Map the shared progress (0 to 1) to a staggered animation window
  const fallbackProgress = useMotionValue(0);
  const activeProgress = progress || fallbackProgress;

  const staggerDelay = staggerIndex * 0.05; // Loosened to 0.05s for visual clarity
  const start = 0.02 + staggerDelay;
  const end = 0.08 + staggerDelay;   // Faster, more direct reveal

  // Use only pure opacity + subtle Y for maximum scroll performance
  // Removed Blur filter as it causes high compositor load during fast scrolls
  const opacity = useTransform(activeProgress, [start, end], [0, 1]);
  const y = useTransform(activeProgress, [start, end], [10, 0]);

  return (
    <motion.div
      className={cn(className, "will-change-[opacity,transform]")}
      style={{
        opacity: progress ? opacity : 1,
        y: progress ? y : 0,
        contain: "paint"
      }}
    >
      {children}
    </motion.div>
  );
}

// ============ SERVICE DETAILS COLLAPSIBLE ============

const containerWrapperVariants = {
  closed: {
    scale: 0.98,
    boxShadow: "0 0 0 0 hsl(38 85% 55% / 0)",
    transition: { scale: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }, boxShadow: { duration: 0.25 } }
  },
  open: {
    scale: 1,
    boxShadow: "0 4px 24px -4px hsl(38 85% 55% / 0.15), 0 0 0 1px hsl(38 85% 55% / 0.1)",
    transition: { scale: { type: "spring", stiffness: 300, damping: 20, mass: 0.8 }, boxShadow: { duration: 0.4, delay: 0.2 } }
  }
};

const contentContainerVariants = {
  hidden: {
    height: 0,
    opacity: 0,
    transition: {
      height: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
      opacity: { duration: 0.15 }
    }
  },
  visible: {
    height: "auto",
    opacity: 1,
    transition: {
      height: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
      opacity: { duration: 0.25, delay: 0.1 }
    }
  }
};

function ServiceDetailsCollapsible({
  capabilities,
  deliverables,
  isOpen,
  onToggle
}: {
  capabilities: string[];
  deliverables: string[];
  isOpen: boolean;
  onToggle: () => void;
}) {
  const totalCapabilities = capabilities.length;
  const totalDeliverables = deliverables.length;

  const createListItemVariants = (totalItems: number) => ({
    hidden: { opacity: 0, y: 12 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: 0.15 + i * 0.05, duration: 0.3, ease: [0.22, 1, 0.36, 1] }
    }),
    exit: (i: number) => ({
      opacity: 0,
      y: 12,
      transition: { delay: (totalItems - 1 - i) * 0.03, duration: 0.15, ease: [0.22, 1, 0.36, 1] }
    })
  });

  const capabilitiesListVariants = createListItemVariants(totalCapabilities);
  const deliverablesListVariants = createListItemVariants(totalDeliverables);

  const capabilitiesHeaderVariants = {
    hidden: { opacity: 0, x: 24, y: -6 },
    visible: { opacity: 1, x: 0, y: 0, transition: { delay: 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, y: 8, x: 16, transition: { delay: 0.08, duration: 0.18, ease: [0.22, 1, 0.36, 1] } }
  };

  const deliverablesHeaderVariants = {
    hidden: { opacity: 0, x: -24, y: -6 },
    visible: { opacity: 1, x: 0, y: 0, transition: { delay: 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, y: 8, x: -16, transition: { delay: 0.08, duration: 0.18, ease: [0.22, 1, 0.36, 1] } }
  };

  return (
    <motion.div
      className="service-details-container"
      variants={containerWrapperVariants}
      initial="closed"
      animate={isOpen ? "open" : "closed"}
      whileHover={!isOpen ? {
        scale: 0.99,
        boxShadow: "0 2px 12px -2px hsl(38 85% 55% / 0.08), 0 0 0 1px hsl(38 85% 55% / 0.05)",
        transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] }
      } : undefined}
    >
      <button onClick={onToggle} className="flex items-center justify-between w-full px-5 py-4 text-left hover:bg-muted/5 transition-colors group">
        <motion.span className="service-section-header mb-0" animate={{ opacity: isOpen ? 0 : 1 }} transition={{ duration: 0.25 }}>
          Capabilities & Deliverables
        </motion.span>
        <motion.div
          animate={{
            rotate: isOpen ? 180 : 0,
            scale: isOpen ? 1 : [1, 1.15, 1],
            opacity: isOpen ? 1 : [0.5, 1, 0.5]
          }}
          transition={{
            rotate: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
            scale: { duration: 2, repeat: isOpen ? 0 : Infinity, ease: "easeInOut" },
            opacity: { duration: 2, repeat: isOpen ? 0 : Infinity, ease: "easeInOut" }
          }}
          whileHover={{ y: [0, -3, 0], scale: 1.2, opacity: 1, transition: { duration: 0.5, ease: "easeInOut", repeat: 0 } }}
          className="cursor-pointer"
        >
          <ChevronDown className="w-4 h-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
        </motion.div>
      </button>

      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div key="content" variants={contentContainerVariants} initial="hidden" animate="visible" exit="hidden" className="overflow-hidden">
            <div className="service-details-grid px-5 pb-5">
              <div className="pr-6">
                <motion.span className="service-section-header block" initial="hidden" animate="visible" exit="exit" variants={capabilitiesHeaderVariants}>
                  Capabilities
                </motion.span>
                <ul className="capabilities-list">
                  {capabilities.map((cap, i) => (
                    <motion.li key={i} custom={i} initial="hidden" animate="visible" exit="exit" variants={capabilitiesListVariants}>
                      {cap}
                    </motion.li>
                  ))}
                </ul>
              </div>
              <div className="pl-6">
                <motion.span className="service-section-header block" initial="hidden" animate="visible" exit="exit" variants={deliverablesHeaderVariants}>
                  Deliverables
                </motion.span>
                <ul className="deliverables-list">
                  {deliverables.map((del, i) => (
                    <motion.li key={i} custom={i} initial="hidden" animate="visible" exit="exit" variants={deliverablesListVariants}>
                      {del}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ============ ANIMATED SIGNAL LINE ============

function AnimatedSignalLine({ signal, isOpen }: { signal: string; isOpen: boolean }) {
  return (
    <motion.div
      className="mt-8 relative overflow-hidden font-serif italic text-lg lg:text-xl text-muted-foreground/75 py-4 px-5"
      style={{ background: 'linear-gradient(90deg, hsl(var(--accent) / 0.05), transparent 70%)' }}
      initial={false}
    >
      <motion.div
        className="absolute left-0 top-0 bottom-0 w-[2px] rounded-full"
        style={{ background: 'hsl(var(--muted-foreground))' }}
        initial={{ opacity: 0.05 }}
        animate={{ opacity: isOpen ? 0 : 0.05 }}
        transition={{ opacity: { duration: 0.3, ease: "easeInOut" } }}
      />
      <motion.div
        className="absolute left-0 top-0 bottom-0 w-[2px] rounded-full"
        style={{ background: 'hsl(38 85% 55%)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: isOpen ? [0.4, 0.9, 0.4] : 0 }}
        transition={{ opacity: { duration: isOpen ? 3 : 0.3, ease: "easeInOut", repeat: isOpen ? Infinity : 0 } }}
      />
      <motion.div
        className="absolute inset-0 pointer-events-none rounded-sm"
        style={{ background: 'linear-gradient(90deg, hsl(38 85% 55% / 0.09), hsl(38 85% 55% / 0.05) 25%, hsl(38 85% 55% / 0.02) 50%, transparent 75%)' }}
        initial={{ opacity: 0.05 }}
        animate={{ opacity: isOpen ? [0.5, 1, 0.5] : 0.05, x: isOpen ? '0%' : '-100%' }}
        transition={{
          opacity: { duration: isOpen ? 3 : 0.3, ease: "easeInOut", repeat: isOpen ? Infinity : 0 },
          x: { duration: isOpen ? 0.6 : 0.4, ease: [0.22, 1, 0.36, 1] }
        }}
      />
      <span className="relative z-10">"{signal}"</span>
    </motion.div>
  );
}

// ============ PARALLAX SERVICE BLOCK ============

interface ParallaxServiceBlockProps {
  service: typeof services[0];
  index: number;
  sectionProgress: MotionValue<number>;
}

const ParallaxServiceBlock = forwardRef<HTMLDivElement, ParallaxServiceBlockProps>(
  function ParallaxServiceBlock({ service, index, sectionProgress }, forwardedRef) {
    const internalRef = useRef<HTMLDivElement>(null);
    const [isCapabilitiesOpen, setIsCapabilitiesOpen] = useState(false);

    // Combine forwarded ref with internal ref
    const setRefs = useCallback((node: HTMLDivElement | null) => {
      internalRef.current = node;
      if (typeof forwardedRef === 'function') {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
    }, [forwardedRef]);

    // Services are 5 items. Total content traversal: 0.12 to 0.95 (83%)
    // Each block now has a wider reveal window (20%) with slight overlaps
    // to eliminate 'dead zones' that feel like mechanical resistance.
    const blockStart = 0.12 + (index * 0.16);
    const blockEnd = blockStart + 0.18; // Extended range for smoother bleed

    const contentOpacity = useTransform(sectionProgress, [blockStart, blockEnd], [0, 1]);

    return (
      <div ref={setRefs} className="relative" style={{ contain: "paint layout" }}>
        <div className="relative aspect-[16/10] overflow-hidden">
          <div className="absolute inset-0 w-full h-full">
            <img
              src={service.image}
              alt={service.title}
              className="w-full h-full object-cover grayscale opacity-60"
              loading="lazy"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent pointer-events-none" />
        </div>

        {/* Content Block Below Image - Flat transform for weightless scroll */}
        <motion.div
          className="py-10 lg:py-12 border-t border-border/20"
          style={{
            opacity: contentOpacity,
            willChange: "opacity"
          }}
        >
          <div className="mb-6">
            <span className="text-xs tracking-[0.3em] text-muted-foreground/60 font-mono block mb-3">[{service.id}]</span>
            <h3 className="text-3xl lg:text-4xl xl:text-5xl font-serif font-light text-foreground leading-tight mb-3">{service.title}</h3>
            <span className="service-positioning">{service.positioning}</span>
          </div>
          <p className="font-raela text-base lg:text-lg text-muted-foreground/80 leading-relaxed max-w-2xl mb-8">{service.primaryDescription}</p>
          <ServiceDetailsCollapsible capabilities={service.capabilities} deliverables={service.deliverables} isOpen={isCapabilitiesOpen} onToggle={() => setIsCapabilitiesOpen(!isCapabilitiesOpen)} />
          <AnimatedSignalLine signal={service.signal} isOpen={isCapabilitiesOpen} />
        </motion.div>

        {index < services.length - 1 && (
          <div className="h-px w-full mt-8 mb-16" style={{ background: 'linear-gradient(to right, hsl(var(--border) / 0.3), hsl(var(--border) / 0.1) 70%, transparent)' }} />
        )}
      </div>
    );
  }
);

// ============ LEFT NAVIGATION ============

// Navigation items now use plain props and shared progress for phase-locking
function ServiceNavigationItem({
  service,
  index,
  activeIndexMV,
  onServiceClick
}: {
  service: typeof services[0];
  index: number;
  activeIndexMV: MotionValue<number>;
  onServiceClick: (index: number) => void;
}) {
  const activeOpacity = useTransform(activeIndexMV,
    [index - 0.5, index, index + 0.5],
    [0.3, 1, 0.3]
  );
  const scaleX = useTransform(activeIndexMV,
    [index - 0.5, index, index + 0.5],
    [0, 1, 0]
  );

  return (
    <div className="py-2 md:py-3 w-full">
      <button
        onClick={() => onServiceClick(index)}
        className="group flex items-center gap-3 md:gap-4 w-full text-left bg-transparent border-none p-0"
      >
        <motion.div
          className="h-px w-6 bg-foreground origin-left"
          style={{ scaleX, opacity: activeOpacity }}
        />
        <motion.span
          className="text-xl md:text-2xl lg:text-3xl font-serif transition-colors duration-500"
          style={{ opacity: activeOpacity }}
        >
          {service.title}
        </motion.span>
      </button>
    </div>
  );
}

function ServiceNavigation({
  activeIndexMV,
  onServiceClick
}: {
  activeIndexMV: MotionValue<number>;
  onServiceClick: (index: number) => void;
}) {
  return (
    <div className="flex flex-col justify-center h-full">
      <div className="mb-6 md:mb-8 lg:mb-10 opacity-60">
        <SectionTitle>[03] Services</SectionTitle>
      </div>

      <div className="space-y-0 text-foreground">
        {services.map((service, index) => (
          <ServiceNavigationItem
            key={service.id}
            service={service}
            index={index}
            activeIndexMV={activeIndexMV}
            onServiceClick={onServiceClick}
          />
        ))}
      </div>
    </div>
  );
}

// ============ SCROLL PROGRESS INDICATOR ============
// Uses MotionValue directly to avoid re-renders

// MotionValue imported at top of file

function ServicesScrollProgress({ progress }: { progress: MotionValue<number> }) {
  // Use scaleY (composite) instead of height (layout) for zero-resistance tracking
  const scaleY = useTransform(progress, [0, 1], [0, 1]);
  const percentText = useTransform(progress, (p) => `${Math.round(p * 100)}%`);
  const opacity = useTransform(progress, [0, 0.05, 0.95, 1], [0, 1, 1, 0]);

  return (
    <motion.div style={{ opacity }} className="hidden lg:block fixed right-8 top-1/2 -translate-y-1/2 z-40">
      <div className="relative h-32 w-px bg-border/20">
        <motion.div
          className="absolute bottom-0 left-0 w-full h-full bg-accent/60 origin-bottom"
          style={{ scaleY }}
        />
      </div>
      <motion.span className="text-[10px] tracking-[0.2em] text-muted-foreground/40 uppercase mt-3 block text-center">
        {percentText}
      </motion.span>
    </motion.div>
  );
}

// ============ EDITORIAL GRID LINE ============

function EditorialDivider() {
  return (
    <>
      <div className="hidden md:block lg:hidden absolute top-0 bottom-0 w-px" style={{ left: '30%', background: 'linear-gradient(to bottom, transparent 5%, hsl(var(--border) / 0.25) 20%, hsl(var(--border) / 0.25) 80%, transparent 95%)' }} />
      <div className="hidden lg:block absolute top-0 bottom-0 w-px" style={{ left: '35%', background: 'linear-gradient(to bottom, transparent 5%, hsl(var(--border) / 0.25) 20%, hsl(var(--border) / 0.25) 80%, transparent 95%)' }} />
    </>
  );
}

// ============ MOBILE COMPONENTS ============

function MobileServiceChapter({
  service,
  isLast
}: {
  service: typeof services[0];
  isLast: boolean;
}) {
  const [isCapabilitiesOpen, setIsCapabilitiesOpen] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative"
    >
      <div className="mb-5">
        <span className="text-xs tracking-[0.3em] text-muted-foreground/60 font-mono block mb-2">[{service.id}]</span>
        <h3 className="text-2xl sm:text-3xl font-serif font-light text-foreground leading-tight mb-2">{service.title}</h3>
        <span className="service-positioning text-sm">{service.positioning}</span>
      </div>

      <div className="relative left-1/2 -translate-x-1/2 w-[125vw] aspect-[16/10] overflow-hidden mb-6">
        <img
          src={service.image}
          alt={service.title}
          className="w-full h-full object-cover grayscale opacity-60"
          loading="lazy"
        />
      </div>

      <p className="font-raela text-base text-muted-foreground/80 leading-relaxed mb-6">{service.primaryDescription}</p>
      <ServiceDetailsCollapsible capabilities={service.capabilities} deliverables={service.deliverables} isOpen={isCapabilitiesOpen} onToggle={() => setIsCapabilitiesOpen(!isCapabilitiesOpen)} />
      <AnimatedSignalLine signal={service.signal} isOpen={isCapabilitiesOpen} />

      {!isLast && (
        <div className="mt-14 mb-16 h-px w-full" style={{ background: 'linear-gradient(to right, hsl(var(--border) / 0.4), hsl(var(--border) / 0.15) 60%, transparent)' }} />
      )}
    </motion.article>
  );
}

function MobileServicesChapters() {
  return (
    <div className="px-6 pb-24">
      {services.map((service, index) => (
        <MobileServiceChapter
          key={service.id}
          service={service}
          isLast={index === services.length - 1}
        />
      ))}
    </div>
  );
}

function MobileChapterHeader() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.9", "center 0.3"]
  });

  return (
    <div ref={ref} className="px-6 py-16 space-y-1 text-center">
      <ScrollyLine staggerIndex={0} progress={scrollYProgress}>
        <p className="text-2xl md:text-3xl font-serif leading-[1.15] tracking-tight">
          <span className="text-muted-foreground">Strategy, design, and systems — working together.</span>
        </p>
      </ScrollyLine>
      <ScrollyLine staggerIndex={1} progress={scrollYProgress}>
        <p className="text-2xl md:text-3xl font-serif leading-[1.15] tracking-tight">
          <span className="text-foreground">From brand identity to growth infrastructure,</span>
        </p>
      </ScrollyLine>
      <ScrollyLine staggerIndex={2} progress={scrollYProgress}>
        <p className="text-2xl md:text-3xl font-serif leading-[1.15] tracking-tight">
          <span className="text-foreground">each piece is designed to compound.</span>
        </p>
      </ScrollyLine>
      <ScrollyLine staggerIndex={4} className="pt-8" progress={scrollYProgress}>
        <SectionTitle>[03] Services</SectionTitle>
      </ScrollyLine>
      <ScrollyLine staggerIndex={5} className="pt-2" progress={scrollYProgress}>
        <h2 className="heading-display text-foreground">what we do</h2>
      </ScrollyLine>
    </div>
  );
}

// ============ MAIN COMPONENT ============

interface ServicesContentProps {
  id?: string;
}

export function ServicesContent({ id }: ServicesContentProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const activeIndexMV = useMotionValue(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  // Track active service and update MotionValue index
  useMotionValueEvent(scrollYProgress, "change", progress => {
    // Skip header area (first 10%)
    const adjustedProgress = Math.max(0, (progress - 0.1) / 0.85);
    const index = Math.floor(adjustedProgress * services.length);
    const clampedIndex = Math.min(Math.max(0, index), services.length - 1);

    if (clampedIndex !== activeIndexMV.get()) {
      activeIndexMV.set(clampedIndex);
    }
  });

  // Element-based scroll navigation using Lenis
  const { scrollTo } = useLenisScroll();
  const serviceBlockRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleServiceClick = (index: number) => {
    const targetElement = serviceBlockRefs.current[index];
    if (!targetElement) return;

    // Use Lenis to scroll directly to the element
    scrollTo(targetElement, {
      duration: 1.2,
      offset: -80 // Account for sticky header
    });

    // Optimistic MotionValue update
    activeIndexMV.set(index);
  };

  // ============ MOBILE LAYOUT ============
  if (isMobile) {
    return (
      <section ref={sectionRef} id={id} className="relative">
        {/* Full-viewport backdrop plate - same slide-in animation as desktop */}
        <ServicesViewportBackdrop scrollProgress={scrollYProgress} />

        <div className="relative z-10">
          <MobileChapterHeader />
          <MobileServicesChapters />
        </div>
      </section>
    );
  }

  // ============ DESKTOP LAYOUT ============
  return (
    <section ref={sectionRef} id={id} className="relative transition-colors duration-1000" style={{ isolation: 'isolate' }}>
      {/* Full-viewport backdrop plate - slides in from left */}
      <div className="absolute inset-0 z-[1] pointer-events-none">
        <ServicesViewportBackdrop scrollProgress={scrollYProgress} />
      </div>

      <div className="relative z-10">
        {/* Editorial Grid Lines - z-2 */}
        <div className="absolute inset-0 z-[2] pointer-events-none">
          <EditorialGridLines showHorizontalTop showHorizontalCenter showHorizontalBottom horizontalTopPosition="12%" horizontalCenterPosition="50%" horizontalBottomPosition="88%" />
        </div>

        {/* Scroll Progress Indicator - now uses MotionValue directly */}
        <ServicesScrollProgress progress={scrollYProgress} />

        {/* Chapter Break Header */}
        <div className="min-h-screen flex flex-col justify-center px-6 md:px-12 lg:px-24 py-32" style={{ contain: "layout" }}>
          <div className="max-w-7xl mx-auto w-full space-y-1 text-center">
            <ScrollyLine staggerIndex={0} progress={scrollYProgress}>
              <p className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-serif leading-[1.15] tracking-tight">
                <span className="text-foreground">Strategy, design, and systems — working together.</span>
              </p>
            </ScrollyLine>
            <ScrollyLine staggerIndex={1} progress={scrollYProgress}>
              <p className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-serif leading-[1.15] tracking-tight">
                <span className="text-muted-foreground">From brand identity</span>
              </p>
            </ScrollyLine>
            <ScrollyLine staggerIndex={2} progress={scrollYProgress}>
              <p className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-serif leading-[1.15] tracking-tight">
                <span className="text-foreground">to growth infrastructure,</span>
              </p>
            </ScrollyLine>
            <ScrollyLine staggerIndex={3} progress={scrollYProgress}>
              <p className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-serif leading-[1.15] tracking-tight">
                <span className="text-muted-foreground">each piece is designed to compound.</span>
              </p>
            </ScrollyLine>
            <ScrollyLine staggerIndex={4} className="pt-12" progress={scrollYProgress}>
              <SectionTitle>[03] Services</SectionTitle>
            </ScrollyLine>
            <ScrollyLine staggerIndex={5} className="pt-4" progress={scrollYProgress}>
              <h2 className="heading-display text-foreground">What We Do</h2>
            </ScrollyLine>
          </div>
        </div>

        {/* Horizontal divider */}
        <div className="w-full h-px" style={{ background: 'linear-gradient(to right, transparent 5%, hsl(var(--border) / 0.4) 20%, hsl(var(--border) / 0.4) 80%, transparent 95%)' }} />

        {/* Two-Column Layout - z-10 */}
        <div ref={contentRef} className="relative px-6 md:px-8 lg:px-12 xl:px-24 min-h-[5000px] z-10">
          <div className="flex">
            {/* Sticky Navigation Column - z-100 */}
            <div className="hidden md:block w-[30%] lg:w-[35%] pr-6 md:pr-8 lg:pr-16 relative z-[100]">
              <div
                className="sticky top-0 h-screen py-16 md:py-20 lg:py-24"
                style={{
                  paddingLeft: 'clamp(16px, calc(8.33% + 20px), calc(8.33% + 40px))'
                }}
              >
                {/* Navigation Content */}
                <div className="h-full">
                  <ServiceNavigation
                    activeIndexMV={activeIndexMV}
                    onServiceClick={handleServiceClick}
                  />
                </div>
              </div>
            </div>
            {/* Content Rail (Service Blocks) - z-10 */}
            <div className="w-full md:w-[70%] lg:w-[65%] py-16 md:py-24 lg:py-32 z-10">
              {services.map((service, index) => (
                <ParallaxServiceBlock
                  key={service.id}
                  service={service}
                  index={index}
                  sectionProgress={scrollYProgress}
                  ref={el => { serviceBlockRefs.current[index] = el; }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
