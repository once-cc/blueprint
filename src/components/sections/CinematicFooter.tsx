import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Instagram, Linkedin, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { Link } from "react-router-dom";
import { useChamberGate } from "@/hooks/useChamberGate";

// Import parallax layer images
import bgFooter from "@/assets/footer/bg-footer.webp";
import sunImg from "@/assets/footer/sun.webp";
import mountainImg from "@/assets/footer/mountain.webp";
import midTerrainImg from "@/assets/footer/mid-terrain.webp";
import benchImg from "@/assets/footer/bench.webp";
import moundImg from "@/assets/footer/mound.webp";

interface CinematicFooterProps {
  id?: string;
}

// Navigation links
const navLinks = {
  navigate: [
    { label: "Approach", href: "#approach" },
    { label: "Projects", href: "#projects" },
    { label: "Services", href: "#services" },
    { label: "C.R.A.F.T.™", href: "#craft" },
  ],
  services: [
    { label: "Web Design", href: "#services" },
    { label: "Brand Strategy", href: "#services" },
    { label: "Conversion Systems", href: "#services" },
    { label: "Digital Presence", href: "#services" },
  ],
  connect: [
    { label: "Instagram", href: "https://instagram.com", icon: Instagram },
    { label: "LinkedIn", href: "https://linkedin.com", icon: Linkedin },
    { label: "X / Twitter", href: "https://x.com", icon: Twitter },
  ],
};

export function CinematicFooter({ id }: CinematicFooterProps) {
  const containerRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const { triggerGateNavigation } = useChamberGate();

  // Tablet detection (768-1024px)
  const [isTablet, setIsTablet] = useState(false);
  useEffect(() => {
    const checkTablet = () => {
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };
    checkTablet();
    window.addEventListener("resize", checkTablet);
    return () => window.removeEventListener("resize", checkTablet);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"],
  });

  // ========== LAYER TRANSFORMS (Declarative from scrollYProgress) ==========
  // No useSpring() - motion is perfectly synced to Lenis/Actual scroll

  // L5: Background - near static, subtle atmospheric drift
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "3%"]);

  // L4: Sun - rises up from behind the mountain
  // Note: mobile checks are baked into the transform mapping
  const sunY = useTransform(
    scrollYProgress,
    isMobile ? [0, 0.5, 0.9] : [0, 0.6, 1],
    isMobile ? ["20%", "8%", "0%"] : ["35%", "15%", "-5%"]
  );

  const sunScale = useTransform(
    scrollYProgress,
    isMobile ? [0, 0.5, 0.9] : [0, 0.6, 1],
    isMobile ? [1.8, 1.5, 1.4] : [1.95, 1.65, 1.5]
  );

  const sunOpacity = useTransform(scrollYProgress, [0, 0.15, 0.8, 1], [0, 1, 0.9, 0.7]);

  // L3: Mountain
  const mountainY = useTransform(
    scrollYProgress,
    isMobile ? [0, 0.6, 1] : [0, 1],
    isMobile ? ["15%", "-15%", "-35%"] : ["5%", "-10%"]
  );

  // L2: Mid Terrain
  const midTerrainY = useTransform(
    scrollYProgress,
    isMobile ? [0, 0.5, 1] : [0, 1],
    isMobile ? ["15%", "-5%", "-18%"] : ["-8%", "-15%"]
  );

  // L1: Bench
  const benchY = useTransform(
    scrollYProgress,
    isMobile ? [0, 0.2, 0.6, 1] : [0, 0.4, 0.95, 1],
    isMobile ? ["80%", "60%", "-20%", "-55%"] : ["100%", "100%", "5%", "5%"]
  );

  // L0: Mound/Foreground
  const moundY = useTransform(
    scrollYProgress,
    isMobile ? [0, 0.25, 0.65, 1] : [0, 0.45, 0.95, 1],
    isMobile ? ["60%", "40%", "-10%", "-40%"] : ["100%", "100%", "3%", "3%"]
  );

  // ========== OVERLAY & CONTENT TRANSFORMS ==========

  // Entry gradient - starts fading just before sticky section activates
  const entryGradientOpacity = useTransform(
    scrollYProgress,
    [0, 0.35, 0.63, 0.85],
    [1, 1, 0.6, 0]
  );

  // Black gradient overlay - blends CTA into parallax sky
  const gradientOpacity = useTransform(scrollYProgress, [0, 0.21, 0.50], [1, 0.6, 0]);

  // ========== CTA COPY - Scrollytell upward exit (pushed by incoming title) ==========
  const ctaCopyOpacity = useTransform(scrollYProgress, [0, 0.15, 0.62, 0.78], [0, 1, 1, 0]);

  const ctaCopyY = useTransform(
    scrollYProgress,
    [0, 0.18, 0.62, 0.82],
    ["30px", "0px", "0px", "-120px"]
  );

  // Subtle blur-out as copy exits
  const ctaCopyBlur = useTransform(scrollYProgress, [0.62, 0.78], [0, 6]);

  // ========== CTA BUTTON - Stays longer, remains with CLELAND STUDIO ==========
  const ctaButtonOpacity = useTransform(scrollYProgress, [0, 0.15, 0.78, 0.95], [0, 1, 1, 0]);

  const ctaButtonY = useTransform(
    scrollYProgress,
    [0, 0.18, 0.8, 1],
    ["30px", "0px", "0px", "-30px"]
  );

  // Large "CLELAND STUDIO" typography
  const studioTitleY = useTransform(scrollYProgress, [0.6, 0.8, 0.95], ["80%", "15%", "0%"]);

  const studioTitleOpacity = useTransform(scrollYProgress, [0.6, 0.72, 0.9, 1], [0, 0.7, 0.65, 0.4]);

  // Blur-to-sharp transition as title emerges
  const studioTitleBlur = useTransform(scrollYProgress, [0.6, 0.75, 0.85], [8, 3, 0]);

  // Footer content
  const footerOpacity = useTransform(scrollYProgress, [0.75, 0.9], [0, 1]);

  const footerY = useTransform(scrollYProgress, [0.75, 0.95], ["30px", "0px"]);

  // Reduced motion fallback
  if (prefersReducedMotion) {
    return (
      <section id={id} className="relative min-h-screen bg-background">
        <div className="relative h-screen flex flex-col">
          {/* Static background */}
          <div className="absolute inset-0">
            <img
              src={bgFooter}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>

          {/* Static CTA */}
          <div className="relative z-40 flex-1 flex items-center justify-center">
            <div className="text-center px-6">
              <span className="text-accent font-mono text-sm tracking-widest mb-6 block">
                [05] BEGIN
              </span>
              <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground mb-6">
                Ready to start building<br />your website now?
              </h2>
              <Button
                size="lg"
                className="group"
                onClick={() => triggerGateNavigation('/blueprint')}
              >
                Generate Free Blueprint
                <ArrowUpRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Button>
            </div>
          </div>

          {/* Static Footer */}
          <footer className="relative z-50 py-8 px-6">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
              <span>© {new Date().getFullYear()} Cleland Studio. All rights reserved.</span>
              <div className="flex gap-6">
                <a href="/terms" className="hover:text-foreground transition-colors">Terms</a>
                <a href="/privacy" className="hover:text-foreground transition-colors">Privacy</a>
              </div>
            </div>
          </footer>
        </div>
      </section>
    );
  }

  // Responsive section height
  const sectionHeight = isMobile ? "160vh" : isTablet ? "180vh" : "220vh";

  return (
    <section
      id={id}
      ref={containerRef}
      className="relative"
      style={{ height: sectionHeight }}
    >
      {/* Sticky container - the viewport frame */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">

        {/* ========== L5: BACKGROUND SKY ========== */}
        <motion.div
          className="absolute inset-0 z-0"
          style={{
            y: bgY,
            willChange: "transform",
          }}
        >
          <img
            src={bgFooter}
            alt=""
            className="w-full h-full object-cover scale-105"
          />
        </motion.div>

        {/* ========== ENTRY GRADIENT (Framework → Parallax transition) ========== */}
        <motion.div
          className="absolute inset-0 z-[2] pointer-events-none"
          style={{
            opacity: entryGradientOpacity,
            background: "linear-gradient(to bottom, hsl(var(--background)) 0%, hsl(var(--background)) 75%, transparent 100%)",
            willChange: "opacity",
          }}
        />

        {/* ========== BLACK GRADIENT OVERLAY (CTA → Parallax transition) ========== */}
        <motion.div
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{
            opacity: gradientOpacity,
            background: "linear-gradient(to bottom, hsl(var(--background)) 0%, hsl(var(--background)) 40%, transparent 100%)",
            willChange: "opacity",
          }}
        />

        {/* ========== L4: SUN ========== */}
        <motion.div
          className="absolute inset-0 z-[5] flex items-center justify-center pointer-events-none"
          style={{
            y: sunY,
            scale: sunScale,
            opacity: sunOpacity,
            willChange: "transform",
          }}
        >
          <img
            src={sunImg}
            alt=""
            className="w-[165%] sm:w-[50%] md:w-[42%] lg:w-[38%] max-w-none sm:max-w-[600px] object-contain"
            style={{
              filter: isMobile
                ? "drop-shadow(0 0 60px hsla(45, 100%, 70%, 0.4))"
                : "drop-shadow(0 0 100px hsla(45, 100%, 70%, 0.5))",
            }}
          />
        </motion.div>

        {/* ========== PEAK-ALIGNED SPLIT TITLE (Behind Sun & Mountain) ========== */}
        <motion.div
          className="absolute inset-0 z-[4] pointer-events-none overflow-hidden"
          style={{
            y: studioTitleY,
            opacity: studioTitleOpacity,
            filter: useTransform(studioTitleBlur, (v) => `blur(${v}px)`),
            willChange: "transform, filter",
          }}
        >
          {/* Container positioned in upper-middle third with editorial offset */}
          <div
            className="absolute inset-x-0 flex items-center justify-center"
            style={{
              top: "28%",
              transform: "translateX(2vw)",
            }}
          >
            {/* Split title container - stacked on mobile, side-by-side on tablet+ */}
            <div className="relative flex flex-col items-center justify-center gap-0 sm:flex-row sm:items-baseline sm:gap-[2.5vw] md:gap-[3vw] lg:gap-[4vw]">

              {/* CLELAND */}
              <h2
                className="font-display text-[18vw] sm:text-[11vw] md:text-[9vw] lg:text-[7vw] leading-[0.85] sm:leading-none tracking-[0.1em] sm:tracking-[0.2em] text-foreground/65 uppercase whitespace-nowrap"
                style={{
                  textShadow: "0 4px 80px rgba(0,0,0,0.4)",
                  maskImage: "linear-gradient(to bottom, black 65%, transparent 100%)",
                  WebkitMaskImage: "linear-gradient(to bottom, black 65%, transparent 100%)",
                }}
              >
                CLELAND
              </h2>

              {/* STUDIO */}
              <h2
                className="font-display text-[18vw] sm:text-[11vw] md:text-[9vw] lg:text-[7vw] leading-[0.85] sm:leading-none tracking-[0.1em] sm:tracking-[0.2em] text-foreground/65 uppercase whitespace-nowrap"
                style={{
                  textShadow: "0 4px 80px rgba(0,0,0,0.4)",
                  maskImage: "linear-gradient(to bottom, black 65%, transparent 100%)",
                  WebkitMaskImage: "linear-gradient(to bottom, black 65%, transparent 100%)",
                }}
              >
                STUDIO
              </h2>

            </div>
          </div>
        </motion.div>

        {/* ========== L3: MOUNTAIN ========== */}
        <motion.div
          className="absolute inset-x-0 bottom-0 z-10 pointer-events-none"
          style={{
            y: mountainY,
            willChange: "transform",
          }}
        >
          <img
            src={mountainImg}
            alt=""
            className="w-[200%] translate-x-1/4 sm:w-full sm:translate-x-0 h-auto object-cover object-bottom"
          />
        </motion.div>

        {/* ========== L2: MID TERRAIN ========== */}
        <motion.div
          className="absolute bottom-0 z-20 pointer-events-none left-0 w-[180%] -translate-x-[20%] sm:w-[120%] sm:translate-x-0 sm:-left-[10%] md:-left-[15%] md:w-[130%]"
          style={{
            y: midTerrainY,
            willChange: "transform",
          }}
        >
          <img
            src={midTerrainImg}
            alt=""
            className="w-full h-auto object-cover object-bottom scale-[1.1] sm:scale-[1.2] md:scale-[1.3]"
          />
        </motion.div>

        {/* ========== L1: BENCH ========== */}
        <motion.div
          className="absolute inset-x-0 bottom-0 z-30 pointer-events-none"
          style={{
            y: benchY,
            willChange: "transform",
          }}
        >
          <img
            src={benchImg}
            alt=""
            className="w-[200%] translate-x-1/4 sm:w-full sm:translate-x-0 h-auto object-cover object-bottom"
          />
        </motion.div>

        {/* ========== L0: MOUND/FOREGROUND ========== */}
        <motion.div
          className="absolute inset-x-0 bottom-0 z-[35] pointer-events-none"
          style={{
            y: moundY,
            willChange: "transform",
          }}
        >
          <img
            src={moundImg}
            alt=""
            className="w-[200%] translate-x-1/4 sm:w-full sm:translate-x-0 h-auto object-cover object-bottom"
          />
        </motion.div>

        {/* ========== CTA COPY LAYER - Scrolls upward with blur exit ========== */}
        <motion.div
          className="absolute inset-0 z-[45] flex items-center justify-center pointer-events-none px-4 sm:px-6"
          style={{
            opacity: ctaCopyOpacity,
            y: ctaCopyY,
            filter: useTransform(ctaCopyBlur, (v) => `blur(${v}px)`),
            willChange: "transform, filter",
          }}
        >
          <div className="text-center px-4 sm:px-6 max-w-2xl mx-auto">
            <span className="text-accent font-mono text-xs sm:text-sm tracking-widest mb-4 sm:mb-6 block">
              [05] BEGIN
            </span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-foreground mb-6 sm:mb-8 leading-tight">
              Ready to start building<br />
              <span className="text-accent">your website now?</span>
            </h2>
            <p className="text-foreground text-base sm:text-lg md:text-xl max-w-md sm:max-w-xl mx-auto">
              Free, customised blueprint that clarifies purpose and design — ready to brief a developer when you are.
            </p>
          </div>
        </motion.div>

        {/* ========== CTA BUTTON LAYER - Remains with CLELAND STUDIO ========== */}
        <motion.div
          className="absolute inset-0 z-[46] flex items-center justify-center pointer-events-none px-4 sm:px-6"
          style={{
            opacity: ctaButtonOpacity,
            y: ctaButtonY,
            willChange: "transform, opacity",
          }}
        >
          <div className="text-center pointer-events-auto pt-[48vh] sm:pt-[50vh] md:pt-[52vh] lg:pt-[55vh]">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              animate={{
                boxShadow: [
                  "0 0 20px 0px rgba(255, 255, 255, 0.15)",
                  "0 0 40px 8px rgba(255, 255, 255, 0.35)",
                  "0 0 20px 0px rgba(255, 255, 255, 0.15)",
                ],
              }}
              transition={{
                boxShadow: {
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
                scale: { type: "spring", stiffness: 400, damping: 25 },
              }}
              className="rounded-md"
            >
              <Button
                size="lg"
                className="group text-sm sm:text-base px-6 sm:px-8 py-5 sm:py-6 w-full sm:w-auto"
                onClick={() => triggerGateNavigation('/blueprint')}
              >
                Generate Free Blueprint
                <ArrowUpRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* ========== FOOTER CONTENT LAYER - Editorial Single Row ========== */}
        <motion.footer
          className="absolute inset-x-0 bottom-0 z-50 pb-6 sm:pb-8"
          style={{
            opacity: footerOpacity,
            y: footerY,
            willChange: "transform, opacity",
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">

            {/* Main footer - stacked on mobile, row on tablet+ */}
            <div className="flex flex-col items-center gap-5 md:flex-row md:justify-between md:gap-4">

              {/* Brand - centered on mobile, left on desktop */}
              <span className="font-display text-sm text-foreground/80 tracking-wide order-1 md:order-none">
                Cleland Studio
              </span>

              {/* Navigation - wrapped on mobile, inline on tablet+ */}
              <nav className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 sm:gap-x-1.5 text-xs text-muted-foreground/70 order-3 md:order-none">
                {navLinks.navigate.map((link, index) => (
                  <span key={link.label} className="flex items-center gap-1.5">
                    <a
                      href={link.href}
                      className="hover:text-foreground/90 transition-colors py-2 min-h-[44px] flex items-center"
                    >
                      {link.label}
                    </a>
                    {index < navLinks.navigate.length - 1 && (
                      <span className="text-muted-foreground/40 hidden sm:inline">·</span>
                    )}
                  </span>
                ))}
              </nav>

              {/* Social icons - larger touch targets on mobile */}
              <div className="flex items-center gap-5 sm:gap-4 order-2 md:order-none">
                {navLinks.connect.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground/60 hover:text-foreground/80 transition-colors p-2 -m-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
                    aria-label={link.label}
                  >
                    <link.icon className="h-5 w-5 sm:h-4 sm:w-4" />
                  </a>
                ))}
              </div>

            </div>

            {/* Copyright line - centered on mobile */}
            <div className="mt-4 sm:mt-6 text-center md:text-left">
              <span className="text-[10px] text-muted-foreground/40 tracking-wide">
                © {new Date().getFullYear()} Cleland Studio
              </span>
            </div>

          </div>
        </motion.footer>

      </div>
    </section>
  );
}
