import React, { useRef, useState, useEffect, useCallback, forwardRef } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent, AnimatePresence, useMotionValue, MotionValue } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLenisScroll } from "@/hooks/useLenisScroll";
// Accordion removed - mobile now uses stacked editorial chapters
import { cn } from "@/lib/utils";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { EditorialGridLines } from "@/components/ui/EditorialGridLines";
import { ScrollGrayscaleImage } from "@/components/ui/ScrollGrayscaleImage";
import { ChevronDown } from "lucide-react";
import work01 from "@/assets/work-01.jpg";
import work02 from "@/assets/work-02.jpg";
import work03 from "@/assets/work-03.jpg";
import work04 from "@/assets/work-04.jpg";
import work05 from "@/assets/work-05.jpg";
import brandVideo from "@/assets/services/ServicesVideos_Brand.mp4";
import digitalDesignVideo from "@/assets/services/DigitalDesign.mp4";
import productDesignVideo from "@/assets/services/ProductDesign.mp4";
import marketingGrowthVideo from "@/assets/services/Marketing_Growth.mp4";
import developmentVideo from "@/assets/services/Development.mp4";

// Lazy-loading video component - only loads when approaching viewport
function LazyVideo({
  src,
  className
}: {
  src: string;
  className: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setShouldLoad(true);
        video.play().catch(() => { });
      } else {
        video.pause();
      }
    }, {
      rootMargin: "300px"
    } // Start loading 300px before entering viewport
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);
  return <video ref={videoRef} autoPlay loop muted playsInline preload={shouldLoad ? "auto" : "none"} className={className}>
    <source src={src} type="video/mp4" />
  </video>;
}
const services = [{
  id: "01",
  title: "Brand Identity",
  positioning: "Strategic clarity before aesthetics",
  primaryDescription: "We define what your business stands for, who it serves best, and how it positions itself in the market — then translate that clarity into a cohesive brand identity system designed to scale.",
  capabilities: ["Brand Strategy & Positioning", "Visual Identity Systems", "Messaging Architecture", "Brand Guidelines & Asset Systems", "Offer & Market Alignment"],
  deliverables: ["Brand identity refinement (new or existing brands)", "Ideal Customer Profile (ICP / Avatar definition)", "Offer architecture & positioning (value-led)", "Brand narrative & message hierarchy", "Visual direction & tonal guardrails", "Strategic brand documentation (internal + external use)"],
  signal: "We don't just design — we make decisions stick.",
  image: work01,
  video: brandVideo
}, {
  id: "02",
  title: "Digital Design",
  positioning: "Conversion-led, not trend-led",
  primaryDescription: "We design websites and digital interfaces that feel effortless to use and intentional by design — balancing aesthetics, usability, and conversion from the first interaction.",
  capabilities: ["Website & Interface Design", "UX / UI Architecture", "Design Systems", "Prototyping & Interaction Design", "Mobile-First Optimisation"],
  deliverables: ["Cinematic website design (desktop + mobile)", "Conversion-aware layout & page structure", "Custom qualifying forms & user flows", "Mobile optimisation & performance pass", "Design systems for future scaling", "UX decisions tied to business outcomes"],
  signal: "Every design choice has a reason.",
  image: work02,
  video: digitalDesignVideo
}, {
  id: "03",
  title: "Product Design",
  positioning: "From idea to usable system",
  primaryDescription: "We turn ideas into structured services and digital products — mapping functionality, flows, and system logic so nothing is built blindly.",
  capabilities: ["Product & Service Strategy", "MVP Definition & Scoping", "Functional System Design", "Experience & Flow Architecture", "Design Sprints"],
  deliverables: ["Crafted Website Blueprint (core differentiator)", "Customer journey framework", "Service & capability mapping", "Client / customer portal design", "Custom booking & scheduling systems", "Service productisation frameworks"],
  signal: "We think in systems, not pages.",
  image: work03,
  video: productDesignVideo
}, {
  id: "04",
  title: "Marketing & Growth",
  positioning: "Infrastructure, not hype",
  primaryDescription: "We build marketing and growth systems that compound — aligning messaging, funnels, and automation so acquisition feels intentional, not forced.",
  capabilities: ["Funnel Strategy & Design", "Conversion Optimisation", "Campaign & Asset Design", "Email & Lifecycle Systems", "Analytics & Optimisation"],
  deliverables: ["Sales funnels & lead funnels", "Conversion-focused copywriting", "Lead engine setup", "Automated texts, emails & bookings", "Email automation sequences", "Analytics dashboard setup", "SEO foundations (technical + content alignment)"],
  signal: "Growth without chaos.",
  image: work04,
  video: marketingGrowthVideo
}, {
  id: "05",
  title: "Development",
  positioning: "Reliable, scalable execution",
  primaryDescription: "We build what we design — cleanly, efficiently, and with performance in mind — so systems remain stable and scale as your business grows.",
  capabilities: ["Frontend & Backend Development", "React / Next.js", "CMS & Platform Integration", "Performance & Accessibility", "System Automation"],
  deliverables: ["CRM implementation & integration", "GoHighLevel automations", "Client & internal dashboards", "Custom workflows & system logic", "Performance optimisation", "Accessibility & compliance considerations"],
  signal: "Built properly the first time.",
  image: work05,
  video: developmentVideo
}];

// ============ SCROLLY LINE (Blur-In Animation) ============

interface ScrollyLineProps {
  children: React.ReactNode;
  className?: string;
  staggerIndex?: number;
  progress?: MotionValue<number>;
}

function ScrollyLine({
  children,
  className = "",
  staggerIndex = 0,
  progress
}: ScrollyLineProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Staggered trigger points - earlier lines reveal first
  const staggerOffset = staggerIndex * 0.05;
  const startOffset = 0.85 - staggerOffset;
  const endOffset = 0.55 - staggerOffset;

  // Use the passed progress if available, otherwise fallback to target-based
  const { scrollYProgress: localProgress } = useScroll({
    target: ref,
    offset: [`start ${startOffset}`, `start ${endOffset}`]
  });

  const activeProgress = progress || localProgress;

  const opacity = useTransform(activeProgress, [0, 1], [0, 1]);
  const blur = useTransform(activeProgress, [0, 1], [12, 0]);
  const y = useTransform(activeProgress, [0, 1], [20, 0]);
  const filterBlur = useTransform(blur, v => `blur(${v}px)`);

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        opacity,
        y,
        filter: filterBlur,
        willChange: "transform, opacity"
      }}
    >
      {children}
    </motion.div>
  );
}

// ============ SERVICE DETAILS COLLAPSIBLE ============

// Container wrapper variants with scale, shadow, and hover preview
const containerWrapperVariants = {
  closed: {
    scale: 0.98,
    boxShadow: "0 0 0 0 hsl(38 85% 55% / 0)",
    transition: {
      scale: {
        duration: 0.3,
        ease: [0.22, 1, 0.36, 1]
      },
      boxShadow: {
        duration: 0.25
      }
    }
  },
  open: {
    scale: 1,
    boxShadow: "0 4px 24px -4px hsl(38 85% 55% / 0.15), 0 0 0 1px hsl(38 85% 55% / 0.1)",
    transition: {
      scale: {
        type: "spring",
        stiffness: 300,
        damping: 20,
        mass: 0.8
      },
      boxShadow: {
        duration: 0.4,
        delay: 0.2
      }
    }
  }
};

// Content container variants for cinematic expand/collapse
const contentContainerVariants = {
  hidden: {
    height: 0,
    opacity: 0,
    transition: {
      height: {
        delay: 0.25,
        duration: 0.35,
        ease: [0.22, 1, 0.36, 1]
      },
      opacity: {
        delay: 0.2,
        duration: 0.15
      }
    }
  },
  visible: {
    height: "auto",
    opacity: 1,
    transition: {
      height: {
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1]
      },
      opacity: {
        duration: 0.25,
        delay: 0.05
      }
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
  // Calculate total items for reverse stagger
  const totalCapabilities = capabilities.length;
  const totalDeliverables = deliverables.length;

  // Animation variants for staggered list items - reverse stagger on exit (moving DOWN with container)
  const createListItemVariants = (totalItems: number) => ({
    hidden: {
      opacity: 0,
      y: 12
    },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.15 + i * 0.05,
        duration: 0.3,
        ease: [0.22, 1, 0.36, 1]
      }
    }),
    exit: (i: number) => ({
      opacity: 0,
      y: 12,
      // Move DOWN (same direction as container shrinking)
      transition: {
        delay: (totalItems - 1 - i) * 0.03,
        duration: 0.15,
        ease: [0.22, 1, 0.36, 1]
      }
    })
  });
  const capabilitiesListVariants = createListItemVariants(totalCapabilities);
  const deliverablesListVariants = createListItemVariants(totalDeliverables);

  // Header animation - slides in from center, exits DOWNWARD toward center (following container)
  const capabilitiesHeaderVariants = {
    hidden: {
      opacity: 0,
      x: 24,
      y: -6
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        delay: 0.1,
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1]
      }
    },
    exit: {
      opacity: 0,
      y: 8,
      // Move DOWN (following container shrink direction)
      x: 16,
      transition: {
        delay: 0.08,
        duration: 0.18,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };
  const deliverablesHeaderVariants = {
    hidden: {
      opacity: 0,
      x: -24,
      y: -6
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        delay: 0.1,
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1]
      }
    },
    exit: {
      opacity: 0,
      y: 8,
      // Move DOWN (following container shrink direction)
      x: -16,
      transition: {
        delay: 0.08,
        duration: 0.18,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };
  return <motion.div className="service-details-container" variants={containerWrapperVariants} initial="closed" animate={isOpen ? "open" : "closed"} whileHover={!isOpen ? {
    scale: 0.99,
    boxShadow: "0 2px 12px -2px hsl(38 85% 55% / 0.08), 0 0 0 1px hsl(38 85% 55% / 0.05)",
    transition: {
      duration: 0.25,
      ease: [0.22, 1, 0.36, 1]
    }
  } : undefined}>
    {/* Trigger Button */}
    <button onClick={onToggle} className="flex items-center justify-between w-full px-5 py-4 text-left hover:bg-muted/5 transition-colors group">
      {/* Trigger text fades out when opening */}
      <motion.span className="service-section-header mb-0" animate={{
        opacity: isOpen ? 0 : 1
      }} transition={{
        duration: 0.25
      }}>
        Capabilities & Deliverables
      </motion.span>
      <motion.div animate={{
        rotate: isOpen ? 180 : 0,
        scale: isOpen ? 1 : [1, 1.15, 1],
        opacity: isOpen ? 1 : [0.5, 1, 0.5]
      }} transition={{
        rotate: {
          duration: 0.35,
          ease: [0.22, 1, 0.36, 1]
        },
        scale: {
          duration: 2,
          repeat: isOpen ? 0 : Infinity,
          ease: "easeInOut"
        },
        opacity: {
          duration: 2,
          repeat: isOpen ? 0 : Infinity,
          ease: "easeInOut"
        }
      }} whileHover={{
        y: [0, -3, 0],
        scale: 1.2,
        opacity: 1,
        transition: {
          duration: 0.5,
          ease: "easeInOut",
          repeat: 0
        }
      }} className="cursor-pointer">
        <ChevronDown className="w-4 h-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
      </motion.div>
    </button>

    {/* AnimatePresence-controlled content */}
    <AnimatePresence mode="wait">
      {isOpen && <motion.div key="content" variants={contentContainerVariants} initial="hidden" animate="visible" exit="hidden" className="overflow-hidden">
        <div className="service-details-grid px-5 pb-5">
          {/* Capabilities Column */}
          <div className="pr-6">
            <motion.span className="service-section-header block" initial="hidden" animate="visible" exit="exit" variants={capabilitiesHeaderVariants}>
              Capabilities
            </motion.span>
            <ul className="capabilities-list">
              {capabilities.map((cap, i) => <motion.li key={i} custom={i} initial="hidden" animate="visible" exit="exit" variants={capabilitiesListVariants}>
                {cap}
              </motion.li>)}
            </ul>
          </div>

          {/* Deliverables Column */}
          <div className="pl-6">
            <motion.span className="service-section-header block" initial="hidden" animate="visible" exit="exit" variants={deliverablesHeaderVariants}>
              Deliverables
            </motion.span>
            <ul className="deliverables-list">
              {deliverables.map((del, i) => <motion.li key={i} custom={i} initial="hidden" animate="visible" exit="exit" variants={deliverablesListVariants}>
                {del}
              </motion.li>)}
            </ul>
          </div>
        </div>
      </motion.div>}
    </AnimatePresence>
  </motion.div>;
}

// ============ ANIMATED SIGNAL LINE ============

function AnimatedSignalLine({
  signal,
  isOpen
}: {
  signal: string;
  isOpen: boolean;
}) {
  return <motion.div className="mt-8 relative overflow-hidden font-serif italic text-lg lg:text-xl text-muted-foreground/75 py-4 px-5" style={{
    background: 'linear-gradient(90deg, hsl(var(--accent) / 0.05), transparent 70%)'
  }} initial={false}>
    {/* Static grey border - only visible when collapsed */}
    <motion.div className="absolute left-0 top-0 bottom-0 w-[2px] rounded-full" style={{
      background: 'hsl(var(--muted-foreground))'
    }} initial={{
      opacity: 0.05
    }} animate={{
      opacity: isOpen ? 0 : 0.05
    }} transition={{
      opacity: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }} />

    {/* Animated gold border - pulses when expanded */}
    <motion.div className="absolute left-0 top-0 bottom-0 w-[2px] rounded-full" style={{
      background: 'hsl(38 85% 55%)'
    }} initial={{
      opacity: 0
    }} animate={{
      opacity: isOpen ? [0.4, 0.9, 0.4] : 0
    }} transition={{
      opacity: {
        duration: isOpen ? 3 : 0.3,
        ease: "easeInOut",
        repeat: isOpen ? Infinity : 0
      }
    }} />

    {/* Animated horizontal glow overlay with pulsing effect */}
    <motion.div className="absolute inset-0 pointer-events-none rounded-sm" style={{
      background: 'linear-gradient(90deg, hsl(38 85% 55% / 0.09), hsl(38 85% 55% / 0.05) 25%, hsl(38 85% 55% / 0.02) 50%, transparent 75%)'
    }} initial={{
      opacity: 0.05
    }} animate={{
      opacity: isOpen ? [0.5, 1, 0.5] : 0.05,
      x: isOpen ? '0%' : '-100%'
    }} transition={{
      opacity: {
        duration: isOpen ? 3 : 0.3,
        ease: "easeInOut",
        repeat: isOpen ? Infinity : 0
      },
      x: {
        duration: isOpen ? 0.6 : 0.4,
        ease: [0.22, 1, 0.36, 1]
      }
    }} />

    {/* Quote text */}
    <span className="relative z-10">"{signal}"</span>
  </motion.div>;
}

// ============ PARALLAX SERVICE BLOCK ============

interface ParallaxServiceBlockProps {
  service: typeof services[0];
  index: number;
}

const ParallaxServiceBlock = forwardRef<HTMLDivElement, ParallaxServiceBlockProps>(
  function ParallaxServiceBlock({ service, index }, forwardedRef) {
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

    // Scroll tracking for this specific block
    const { scrollYProgress } = useScroll({
      target: internalRef,
      offset: ["start end", "end start"]
    });

    // Dramatic parallax - image moves at 40% of scroll speed (slower than page)
    const imageY = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);

    // Subtle scale on scroll
    const imageScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.15, 1.1, 1.05]);

    // Content fade in
    const contentOpacity = useTransform(scrollYProgress, [0.2, 0.4], [0, 1]);
    const contentY = useTransform(scrollYProgress, [0.2, 0.4], [40, 0]);

    return <div ref={setRefs} className="relative">
      {/* Large Media with Parallax */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <motion.div className="absolute inset-0 w-full h-[130%] -top-[15%]" style={{
          y: imageY,
          scale: imageScale
        }}>
          {service.video ? <LazyVideo src={service.video} className="w-full h-full object-cover" /> : <ScrollGrayscaleImage src={service.image} alt={service.title} className="w-full h-full" startOffset={1.1} endOffset={0.3} />}
        </motion.div>

        {/* Enhanced gradient overlay for smooth transition to content */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent pointer-events-none" />
      </div>

      {/* Content Block Below Image */}
      <motion.div className="py-10 lg:py-12 border-t border-border/20" style={{
        opacity: contentOpacity,
        y: contentY
      }}>
        {/* Service Number + Title + Positioning */}
        <div className="mb-6">
          <span className="text-xs tracking-[0.3em] text-muted-foreground/60 font-mono block mb-3">
            [{service.id}]
          </span>
          <h3 className="text-3xl lg:text-4xl xl:text-5xl font-serif font-light text-foreground leading-tight mb-3">
            {service.title}
          </h3>
          <span className="service-positioning">{service.positioning}</span>
        </div>

        {/* Primary Description */}
        <p className="font-raela text-base lg:text-lg text-muted-foreground/80 leading-relaxed max-w-2xl mb-8">
          {service.primaryDescription}
        </p>

        {/* Unified Collapsible Capabilities & Deliverables */}
        <ServiceDetailsCollapsible capabilities={service.capabilities} deliverables={service.deliverables} isOpen={isCapabilitiesOpen} onToggle={() => setIsCapabilitiesOpen(!isCapabilitiesOpen)} />

        {/* Animated Signal Line */}
        <AnimatedSignalLine signal={service.signal} isOpen={isCapabilitiesOpen} />
      </motion.div>

      {/* Horizontal divider to next service */}
      {index < services.length - 1 && <div className="h-px w-full mt-8 mb-16" style={{
        background: 'linear-gradient(to right, hsl(var(--border) / 0.3), hsl(var(--border) / 0.1) 70%, transparent)'
      }} />}
    </div>;
  }
);

// ============ LEFT NAVIGATION ============

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
  const lineWidth = useTransform(activeIndexMV,
    [index - 0.5, index, index + 0.5],
    [0, 24, 0]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
    >
      <button
        onClick={() => onServiceClick(index)}
        className="group flex items-center gap-3 md:gap-4 py-2 md:py-3 w-full text-left transition-all duration-500"
      >
        <motion.div
          className="h-px bg-foreground origin-left"
          style={{ width: lineWidth, opacity: activeOpacity }}
        />
        <motion.span
          className="text-xl md:text-2xl lg:text-3xl font-serif transition-colors duration-500"
          style={{ opacity: activeOpacity }}
        >
          {service.title}
        </motion.span>
      </button>
    </motion.div>
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
      <motion.div
        initial={{ opacity: 0, filter: 'blur(6px)' }}
        whileInView={{ opacity: 1, filter: 'blur(0px)' }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mb-6 md:mb-8 lg:mb-10"
      >
        <SectionTitle>[03] Services</SectionTitle>
      </motion.div>

      <div className="space-y-1">
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

function ServicesScrollProgress({
  progress
}: {
  progress: MotionValue<number>;
}) {
  const height = useTransform(progress, [0, 1], ["0%", "100%"]);
  const opacity = useTransform(progress, [0, 0.05, 0.95, 1], [0, 1, 1, 0]);

  // Use a ref and useMotionValueEvent to update text without parent re-render
  const textRef = useRef<HTMLSpanElement>(null);
  useMotionValueEvent(progress, "change", (latest) => {
    if (textRef.current) {
      textRef.current.textContent = `${Math.round(latest * 100)}%`;
    }
  });

  return (
    <motion.div
      style={{ opacity }}
      className="hidden lg:block fixed right-8 top-1/2 -translate-y-1/2 z-40"
    >
      <div className="relative h-32 w-px bg-border/20">
        <motion.div className="absolute bottom-0 left-0 w-full bg-accent/60 origin-bottom" style={{
          height
        }} />
      </div>
      <span
        ref={textRef}
        className="text-[10px] tracking-[0.2em] text-muted-foreground/40 uppercase mt-3 block text-center"
      >
        0%
      </span>
    </motion.div>
  );
}

// ============ EDITORIAL GRID LINE ============

function EditorialDivider() {
  return (
    <>
      {/* Tablet divider at 30% */}
      <div className="hidden md:block lg:hidden absolute top-0 bottom-0 w-px" style={{
        left: '30%',
        background: 'linear-gradient(to bottom, transparent 5%, hsl(var(--border) / 0.25) 20%, hsl(var(--border) / 0.25) 80%, transparent 95%)'
      }} />
      {/* Desktop divider at 35% */}
      <div className="hidden lg:block absolute top-0 bottom-0 w-px" style={{
        left: '35%',
        background: 'linear-gradient(to bottom, transparent 5%, hsl(var(--border) / 0.25) 20%, hsl(var(--border) / 0.25) 80%, transparent 95%)'
      }} />
    </>
  );
}

// ============ MOBILE COMPONENTS ============

// Editorial chapter for each service - stacked vertically, all content visible
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
      {/* Service Number & Title */}
      <div className="mb-5">
        <span className="text-xs tracking-[0.3em] text-muted-foreground/60 font-mono block mb-2">
          [{service.id}]
        </span>
        <h3 className="text-2xl sm:text-3xl font-serif font-light text-foreground leading-tight mb-2">
          {service.title}
        </h3>
        <span className="service-positioning text-sm">{service.positioning}</span>
      </div>

      {/* Media - Full-bleed oversized to crop white borders from video edges */}
      {service.video ? (
        <div className="relative left-1/2 -translate-x-1/2 w-[125vw] aspect-[16/10] overflow-hidden mb-6">
          <LazyVideo
            src={service.video}
            className={cn(
              "w-full h-full object-cover",
              // Brand Identity [01] - white edge at TOP, shift video up
              service.id === "01" && "scale-110 object-[center_40%]",
              // Product Design [03] - white edge at BOTTOM, shift video down
              service.id === "03" && "scale-110 object-[center_60%]"
            )}
          />
        </div>
      ) : (
        <div className="relative left-1/2 -translate-x-1/2 w-[125vw] aspect-[16/10] overflow-hidden mb-6">
          <ScrollGrayscaleImage
            src={service.image}
            alt={service.title}
            className="w-full h-full object-cover"
            startOffset={1.0}
            endOffset={0.4}
          />
        </div>
      )}

      {/* Primary Description */}
      <p className="font-raela text-base text-muted-foreground/80 leading-relaxed mb-6">
        {service.primaryDescription}
      </p>

      {/* Collapsible Capabilities & Deliverables - preserved behavior */}
      <ServiceDetailsCollapsible
        capabilities={service.capabilities}
        deliverables={service.deliverables}
        isOpen={isCapabilitiesOpen}
        onToggle={() => setIsCapabilitiesOpen(!isCapabilitiesOpen)}
      />

      {/* Signal Line */}
      <AnimatedSignalLine signal={service.signal} isOpen={isCapabilitiesOpen} />

      {/* Chapter Divider - subtle breathing room between chapters */}
      {!isLast && (
        <div
          className="mt-14 mb-16 h-px w-full"
          style={{
            background: 'linear-gradient(to right, hsl(var(--border) / 0.4), hsl(var(--border) / 0.15) 60%, transparent)'
          }}
        />
      )}
    </motion.article>
  );
}

// Stacked editorial chapters container
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
  return <div className="px-6 py-16 space-y-1 text-center">
    {/* Staggered primer lines for mobile */}
    <ScrollyLine staggerIndex={0}>
      <p className="text-2xl md:text-3xl font-serif leading-[1.15] tracking-tight">
        <span className="text-muted-foreground">Strategy, design, and systems — working together.</span>
      </p>
    </ScrollyLine>

    <ScrollyLine staggerIndex={1}>
      <p className="text-2xl md:text-3xl font-serif leading-[1.15] tracking-tight">
        <span className="text-foreground">From brand identity to growth infrastructure,</span>
      </p>
    </ScrollyLine>

    <ScrollyLine staggerIndex={2}>
      <p className="text-2xl md:text-3xl font-serif leading-[1.15] tracking-tight">
        <span className="text-foreground">each piece is designed to compound.</span>
      </p>
    </ScrollyLine>

    {/* Section label */}
    <ScrollyLine staggerIndex={4} className="pt-8">
      <SectionTitle>[03] Services</SectionTitle>
    </ScrollyLine>

    {/* Main headline */}
    <ScrollyLine staggerIndex={5} className="pt-2">
      <h2 className="heading-display text-foreground">
        what we do
      </h2>
    </ScrollyLine>
  </div>;
}

// ============ MAIN COMPONENT ============

interface ServicesSectionProps {
  id?: string;
}
export function ServicesSection({
  id
}: ServicesSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const { scrollTo } = useLenisScroll();

  const {
    scrollYProgress
  } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"]
  });

  // No React state updates during scroll
  const activeIndexMV = useMotionValue(0);

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

  // Element-based refs for service blocks
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
      <section id={id} className="relative bg-background">
        <MobileChapterHeader />
        <MobileServicesChapters />
      </section>
    );
  }

  // ============ DESKTOP LAYOUT ============
  return <section ref={sectionRef} id={id} className="relative bg-background">
    {/* Editorial Grid Lines - Frame the section */}
    <EditorialGridLines showHorizontalTop showHorizontalCenter showHorizontalBottom horizontalTopPosition="12%" horizontalCenterPosition="50%" horizontalBottomPosition="88%" />

    {/* Scroll Progress Indicator - Declarative visibility */}
    <ServicesScrollProgress progress={scrollYProgress} />

    {/* Chapter Break Header - Blur-In Scroll Animation */}
    <div className="min-h-screen flex flex-col justify-center px-6 md:px-12 lg:px-24 py-32">
      <div className="max-w-7xl mx-auto w-full space-y-1 text-center">
        {/* Updated primer lines */}
        {/* Line 1: WHITE */}
        <ScrollyLine staggerIndex={0} progress={scrollYProgress}>
          <p className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-serif leading-[1.15] tracking-tight">
            <span className="text-foreground">Strategy, design, and systems — working together.</span>
          </p>
        </ScrollyLine>

        {/* Line 2: OFF-WHITE/GREY */}
        <ScrollyLine staggerIndex={1} progress={scrollYProgress}>
          <p className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-serif leading-[1.15] tracking-tight">
            <span className="text-muted-foreground">From brand identity</span>
          </p>
        </ScrollyLine>

        {/* Line 3: WHITE */}
        <ScrollyLine staggerIndex={2} progress={scrollYProgress}>
          <p className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-serif leading-[1.15] tracking-tight">
            <span className="text-foreground">to growth infrastructure,</span>
          </p>
        </ScrollyLine>

        {/* Line 4: OFF-WHITE/GREY */}
        <ScrollyLine staggerIndex={3} progress={scrollYProgress}>
          <p className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-serif leading-[1.15] tracking-tight">
            <span className="text-muted-foreground">each piece is designed to compound.</span>
          </p>
        </ScrollyLine>

        {/* Section label - after primer lines */}
        <ScrollyLine staggerIndex={4} className="pt-12" progress={scrollYProgress}>
          <SectionTitle>[03] Services</SectionTitle>
        </ScrollyLine>

        {/* Main headline */}
        <ScrollyLine staggerIndex={5} className="pt-4" progress={scrollYProgress}>
          <h2 className="heading-display text-foreground">
            What We Do
          </h2>
        </ScrollyLine>
      </div>
    </div>

    {/* Horizontal divider line after header */}
    <div className="w-full h-px" style={{
      background: 'linear-gradient(to right, transparent 5%, hsl(var(--border) / 0.4) 20%, hsl(var(--border) / 0.4) 80%, transparent 95%)'
    }} />

    {/* Two-Column Layout: Navigation | Content */}
    <div ref={contentRef} className="relative px-6 md:px-8 lg:px-12 xl:px-24">
      <div className="flex">

        {/* Col 1: Sticky Service Navigation (30% tablet, 35% desktop) */}
        <div className="hidden md:block w-[30%] lg:w-[35%] pr-6 md:pr-8 lg:pr-16">
          <div className="sticky top-0 h-screen py-16 md:py-20 lg:py-24" style={{
            paddingLeft: 'clamp(16px, calc(8.33% + 20px), calc(8.33% + 40px))'
          }}>
            <ServiceNavigation activeIndexMV={activeIndexMV} onServiceClick={handleServiceClick} />
          </div>
        </div>

        {/* Col 2: Stacked Service Blocks with Parallax Images (70% tablet, 65% desktop) */}
        <div className="w-full md:w-[70%] lg:w-[65%] py-16 md:py-24 lg:py-32">
          {services.map((service, index) => (
            <ParallaxServiceBlock
              key={service.id}
              service={service}
              index={index}
              ref={el => { serviceBlockRefs.current[index] = el; }}
            />
          ))}
        </div>

      </div>
    </div>
  </section>;
}