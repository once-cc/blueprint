import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { TestimonialCarousel } from "@/components/blueprint/TestimonialCarousel";
import { useNavigate } from "react-router-dom";
import { ShinyButton } from "@/components/ui/shiny-button";
import { useLenisScroll } from "@/hooks/useLenisScroll";
import { useRayPause } from "@/hooks/useRayPause";
import { ScrollytellSection } from "@/components/marketing/ScrollytellSection";
import { FrameworkSection } from "@/components/marketing/FrameworkSection";
import { BenefitStackSection } from "@/components/marketing/BenefitStackSection";
import { VisionIntent } from "@/components/marketing/VisionIntent";
import { FooterReveal } from "@/components/marketing/FooterReveal";
import heroVideo from "@/assets/hero2.webm";
import heroPoster from "@/assets/hero-static.webp";
import footerBg from "@/assets/footer.webp";
import { GridSection } from "@/components/ui/grid-section";
import { Crosshair } from "@/components/ui/crosshair";
import { AnimatedButtonIcon } from "@/components/ui/AnimatedButtonIcon";
import paperplaneAnimation from "@/assets/ui/1paperplane.json";



export default function Blueprint() {
  const navigate = useNavigate();
  const { scrollTo: lenisScrollTo } = useLenisScroll();
  const heroRaysRef = useRayPause<HTMLDivElement>();
  const testimonialRaysRef = useRayPause<HTMLDivElement>();
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [forceReveal, setForceReveal] = useState(false);
  const [isHeroHovered, setIsHeroHovered] = useState(false);

  // Footer pinning state
  const [footerHeight, setFooterHeight] = useState(0);
  const footerRef = useRef<HTMLElement>(null);
  const trackerRef = useRef<HTMLDivElement>(null);
  // Hero visibility tracking for video performance
  const heroRef = useRef<HTMLElement>(null);

  const { scrollYProgress: footerScrollProgress } = useScroll({
    target: trackerRef,
    offset: ["start end", "end end"]
  });

  useEffect(() => {
    if (footerRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setFooterHeight(entry.target.getBoundingClientRect().height);
        }
      });
      resizeObserver.observe(footerRef.current);
      return () => resizeObserver.disconnect();
    }
  }, []);

  const scrollToChatbox = () => {
    const el = document.getElementById("chatbox-section");
    const inputEl = document.getElementById("dream-intent-input");

    if (el) {
      if (inputEl) {
        // Force focus instantly so mobile keyboards activate without waiting for the scroll
        inputEl.focus({ preventScroll: true });
      }

      // Use Lenis for smooth scroll — avoids dual-scroll-authority conflict
      // Lenis handles easing and momentum naturally
      lenisScrollTo(el, {
        offset: -window.innerHeight * (window.innerWidth < 768 ? 0.25 : 0.35),
        duration: 1.8,
      });
    }
  };

  // Safety fallback: if video hasn't loaded after 3 seconds, reveal UI anyway
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isVideoLoaded) setForceReveal(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, [isVideoLoaded]);

  // Check if video loaded (cached or 3s fallback)
  useEffect(() => {
    if (videoRef.current && videoRef.current.readyState >= 3) {
      setIsVideoLoaded(true);
    }
  }, []);

  // Performance Optimization: Pause hero video when scrolled out of view natively
  // bypassing React state to prevent massive scroll-jank re-renders
  useEffect(() => {
    if (!videoRef.current || !heroRef.current) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          videoRef.current?.play().catch(() => { }); // Catch auto-play blocks silently
        } else {
          videoRef.current?.pause();
        }
      });
    }, {
      rootMargin: "0px 0px 500px 0px"
    });

    observer.observe(heroRef.current);

    return () => observer.disconnect();
  }, []);

  const isReady = isVideoLoaded || forceReveal;

  // Force scroll to top on mount - ensures fresh page entry behavior
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <div
        className="min-h-screen bg-background text-foreground relative z-10 shadow-[0_50px_100px_40px_rgba(0,0,0,1)] flex flex-col"
      >
        {/* Splash Screen Overlay - Option D: Blur Dissolve */}
        <AnimatePresence>
          {!isReady && (
            <motion.div
              initial={{ opacity: 1, backdropFilter: "blur(60px)" }}
              exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              className="fixed inset-0 z-[100] bg-background/95 pointer-events-none flex items-center justify-center"
            />
          )}
        </AnimatePresence>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* ═══ HERO: VIDEO & HEADLINE ═══ */}
        {/* ═══════════════════════════════════════════════════════════════ */}

        <section ref={heroRef} className="relative min-h-screen flex items-center justify-center pt-24 pb-32">
          {/* Loopable Hero Video Background */}
          <div className="absolute inset-0 z-0 bg-background overflow-hidden">
            <div className="absolute inset-0 bg-background/60 md:bg-background/40 z-10 pointer-events-none" /> {/* Dimming overlay for text legibility */}

            {/* Environmental Volumetric Light Rays (Flipped to match video source: coming from top-right to bottom-left) */}
            <div ref={heroRaysRef}>
              <div className="absolute top-[-10%] right-[-20%] w-[60%] h-[150%] bg-gradient-to-l from-transparent via-white/10 to-transparent blur-3xl mix-blend-plus-lighter pointer-events-none z-10 animate-light-ray-corner-reverse" />
              <div className="absolute top-[-20%] right-[10%] w-[40%] h-[150%] bg-gradient-to-l from-transparent via-white/5 to-transparent blur-2xl mix-blend-plus-lighter pointer-events-none z-10 animate-light-ray-corner-reverse delay-700" />
            </div>

            {/* Top gradient mask to beautifully blend video ceiling removed in favor of CSS mask on video element */}

            <video
              ref={videoRef}
              src={heroVideo}
              poster={heroPoster}
              autoPlay
              muted
              loop
              playsInline
              disablePictureInPicture
              preload="auto"
              onCanPlayThrough={() => setIsVideoLoaded(true)}
              className="absolute bottom-[10%] left-[50%] -translate-x-[50%] w-[180%] max-w-none h-auto md:w-full md:h-full md:top-0 md:left-0 md:translate-x-0 md:bottom-auto md:object-cover opacity-80 pointer-events-none [mask-image:linear-gradient(to_bottom,transparent_0%,black_15%,black_100%)] md:[mask-image:none]"
              style={{ paddingBottom: '2px' }} /* Tiny offset often needed to hide 1px video edge bleed */
            />
            {/* Soft gradient mask blending video to background at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />
          </div>

          <div className="container mx-auto px-8 md:px-12 lg:px-6 relative z-20">
            {/* Added severe negative margin-top for mobile to hoist text higher */}
            <div className="grid lg:grid-cols-2 gap-12 items-center -mt-48 md:-mt-16 lg:mt-0">
              {/* Left Column Structure: Shifted further right on desktop, centered on mobile */}
              {/* Added 'group' class here to act as the parent hover trigger for the eyebrow text */}
              <div className="flex flex-col items-center md:items-start space-y-4 md:space-y-6 text-center md:text-left mx-auto md:mx-0 max-w-2xl lg:ml-16 xl:ml-24 lg:-mt-12 group">
                {/* Eyebrow - featuring a cinematic focus-pull bloom triggered by group hover */}
                <motion.div
                  initial={{ y: 30 }}
                  animate={isReady ? { y: 0 } : { y: 30 }}
                  transition={{ delay: 0.2, duration: 1.2, ease: "easeOut" }}
                  className="mb-3"
                >
                  <div
                    className="font-display type-structural tracking-[0.3em] text-[10px] md:text-[12px] uppercase text-white opacity-80 md:opacity-0 md:blur-[4px] group-hover:opacity-100 group-hover:blur-none mix-blend-difference"
                    style={{
                      transition: "opacity 1.5s cubic-bezier(0.16, 1, 0.3, 1), filter 1.5s cubic-bezier(0.16, 1, 0.3, 1)"
                    }}
                  >
                    Cleland Studios Presents
                  </div>
                </motion.div>

                {/* Headline */}
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={isReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                  className="heading-editorial text-[3.5rem] sm:text-[4rem] leading-[1.05] md:text-7xl lg:text-8xl tracking-tight drop-shadow-md pb-1"
                >
                  <span className="text-transparent bg-clip-text bg-gradient-to-b from-white from-[40%] to-zinc-700 block">
                    The <em className="italic font-medium pr-4">Crafted</em>
                  </span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-b from-white from-[40%] to-zinc-700 block">
                    Blueprint.
                  </span>
                </motion.h1>

                {/* Subheadline (Max 32ch constraint applied here) */}
                <motion.p
                  initial={{ opacity: 0, y: 30 }}
                  animate={isReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
                  className="font-body type-functional-light text-[1rem] md:text-xl text-zinc-300 leading-relaxed drop-shadow-sm max-w-[32ch] mt-[-0.5rem]"
                >
                  A complimentary strategic blueprint that defines what to build — before you invest in building it.
                </motion.p>

                {/* CTA Group */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={isReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                  className="flex items-center justify-center md:justify-start gap-4 flex-wrap mt-2 w-full md:w-auto"
                >
                  <ShinyButton
                    onClick={scrollToChatbox}
                    onMouseEnter={() => setIsHeroHovered(true)}
                    onMouseLeave={() => setIsHeroHovered(false)}
                  >
                    <span className="flex items-center gap-3">
                      Begin Your Blueprint
                      <AnimatedButtonIcon
                        animationData={paperplaneAnimation}
                        isActive={isHeroHovered}
                        staticFrame={90}
                        playOnVisible={true}
                        playVisibleDelay={1250}
                        className="w-7 h-7 ml-1 text-white"
                      />
                    </span>
                  </ShinyButton>
                </motion.div>
              </div>

              {/* Right Column (Empty to let video breathe, but acts as counterweight) */}
              <div className="hidden lg:block">
                {/* Future interactive element or visual anchor can go here */}
              </div>
            </div>
          </div>

        </section >

        {/* Seamless Section Blend Gradient connecting Hero to VisionIntent */}
        <div className="w-full h-48 bg-gradient-to-b from-transparent via-background/80 to-background relative z-20 -mt-24 pointer-events-none" />

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* ═══ MAIN CONTENT: MARKETING SECTIONS ═══ */}
        {/* ═══════════════════════════════════════════════════════════════ */}

        <VisionIntent />
        <ScrollytellSection />
        <FrameworkSection />
        <BenefitStackSection />

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* ═══ TESTIMONIALS ═══ */}
        {/* ═══════════════════════════════════════════════════════════════ */}

        {/* Restored top/bottom padding to ensure the footer reveal has enough scroll track to function properly */}
        <GridSection className="pt-24 pb-32 bg-background z-20 relative">
          {/* Faint Global Editorial Grid */}
          <div className="absolute inset-0 bg-editorial-grid pointer-events-none" />

          {/* Faint Volumetric Atmospheric Light Rays — clipped to section bounds */}
          <div ref={testimonialRaysRef} className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            <div className="absolute top-[30%] left-[-15%] w-[60%] h-[180%] bg-gradient-to-r from-transparent via-white/5 to-transparent blur-3xl mix-blend-plus-lighter animate-light-ray-corner opacity-50" />
            <div className="absolute top-[-10%] right-[20%] w-[40%] h-[150%] bg-gradient-to-l from-transparent via-white/[0.03] to-transparent blur-2xl mix-blend-plus-lighter animate-light-ray-corner-reverse delay-500 opacity-40" />
          </div>

          {/* True Edge Docking Rails spanning the entire section height */}
          <div className="absolute inset-0 pointer-events-none z-0 flex justify-center">
            <div className="w-full flex justify-center container mx-auto px-4 md:px-6 relative">
              <div className="w-full md:max-w-[90vw] lg:max-w-[1240px] relative">
                <div className="absolute top-0 bottom-0 left-0 w-px bg-white/10" />
                <div className="absolute top-0 bottom-0 right-0 w-px bg-white/10" />
              </div>
            </div>
          </div>

          {/* Testimonial Banner Block — Full substrate treatment matching ScrollyTell section */}
          {/* Reduced vertical padding and bottom margin to draw the carousel closer to the banner */}
          <div className="w-full py-12 mb-8 relative z-10 border-y border-white/10 bg-[hsl(220_15%_4%)] overflow-hidden">
            {/* Architectural Bevel Lighting */}
            <div className="absolute inset-x-0 -bottom-1/2 h-full z-0 pointer-events-none bg-[radial-gradient(80%_40%_at_50%_100%,hsl(37_91%_55%_/_0.03),transparent_70%)]" />
            <div className="absolute inset-0 z-0 pointer-events-none bg-[linear-gradient(to_bottom,hsl(45_10%_92%_/_0.02),transparent_40%)]" />

            {/* Layer 1: Micro Film Grain — SVG feTurbulence noise */}
            <div className="absolute inset-0 z-[1] pointer-events-none opacity-[0.25] mix-blend-soft-light" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

            {/* Layer 2: Luminance Falloff — Radial lift for reading focus + edge darkening */}
            <div className="absolute inset-0 z-[1] pointer-events-none bg-[radial-gradient(60%_50%_at_25%_40%,hsl(220_10%_12%_/_0.5),transparent_70%)]" />
            <div className="absolute inset-0 z-[1] pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_35%,hsl(220_15%_2%_/_0.75)_100%)]" />

            {/* Layer 3: Micro Chromatic Drift — Cool shadows, warm centre */}
            <div className="absolute inset-0 z-[1] pointer-events-none bg-[radial-gradient(70%_60%_at_30%_45%,hsl(37_30%_55%_/_0.07),transparent_70%)]" />
            <div className="absolute inset-0 z-[1] pointer-events-none bg-[radial-gradient(50%_50%_at_85%_80%,hsl(220_40%_30%_/_0.08),transparent_60%)]" />

            {/* Layer 4: Ghost Editorial Grid */}
            <div className="absolute inset-0 z-[1] pointer-events-none bg-editorial-grid opacity-[0.12]" />

            {/* Crosshairs intersecting the docking rails on the horizontal banner borders */}
            <div className="absolute inset-0 pointer-events-none flex justify-center z-20">
              <div className="w-full flex justify-center container mx-auto px-4 md:px-6 relative">
                <div className="w-full md:max-w-[90vw] lg:max-w-[1240px] relative">
                  <Crosshair className="absolute -top-[8.5px] -left-[8.5px] text-white/40" />
                  <Crosshair className="absolute -top-[8.5px] -right-[8.5px] text-white/40" />
                  <Crosshair className="absolute -bottom-[8.5px] -left-[8.5px] text-white/40" />
                  <Crosshair className="absolute -bottom-[8.5px] -right-[8.5px] text-white/40" />
                </div>
              </div>
            </div>

            <div className="container mx-auto px-6 relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <h2 className="font-nohemi font-medium text-[clamp(1.75rem,8.5vw,6rem)] md:text-5xl lg:text-6xl leading-[1.05] tracking-tight mb-4">
                  {/* We use inline-block so the gradient spans the ENTIRE physical bounding box, rather than recalculating per-line */}
                  <span className="text-transparent bg-clip-text bg-gradient-to-b from-zinc-100 to-zinc-500 inline-block">
                    What the Blueprint Makes Possible
                  </span>
                </h2>
                <p className="text-lg md:text-xl font-body text-transparent bg-clip-text bg-gradient-to-b from-zinc-300 to-zinc-600 max-w-2xl mx-auto">
                  Conversion-led websites, operational dashboards, client portals, booking systems — all engineered from a strategic architecture.
                </p>
              </motion.div>
            </div>
          </div>

          {/* Editorial label — echoes "Architectural Primitives" treatment */}
          <div className="w-full flex justify-center container mx-auto px-4 md:px-6 relative z-10">
            <div className="w-full md:max-w-[90vw] lg:max-w-[1240px]">
              <div className="w-full h-px bg-white/10" />
              <p className="w-full text-center text-[10px] uppercase tracking-[0.5em] text-white/20 py-3 bg-background/80">
                Engineered Visions
              </p>
              <div className="w-full h-px bg-white/10" />
            </div>
          </div>

          {/* Full-width carousel */}
          <div className="py-8">
            <TestimonialCarousel />
          </div>
        </GridSection>
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* ═══ FOOTER & REVEAL TRACKER ═══ */}
      {/* ═══════════════════════════════════════════════════════════════ */}

      {/* The scrolling mask/runway tracker for the footer */}
      <div ref={trackerRef} style={{ height: footerHeight }} className="w-full relative z-0 pointer-events-none" />

      {/* Final CTA Section (Pinned Reveal Footer) */}
      <footer
        ref={footerRef}
        className="fixed bottom-0 left-0 w-full bg-black -z-10 flex flex-col justify-end overflow-hidden"
      >
        {/* Architectural Schematic Grid for Footer (Reveals from underneath) */}
        <div className="absolute inset-0 pointer-events-none flex justify-center h-full w-full z-10">
          <div className="relative h-full w-full max-w-screen-2xl">
            {/* Vertical Frame Lines */}
            <div className="absolute top-0 bottom-0 left-0 w-px bg-white/5" />
            <div className="absolute top-0 bottom-0 right-0 w-px bg-white/5" />

            {/* Top Crosshairs */}
            <Crosshair className="absolute -top-[8.5px] -left-[8.5px] text-white/40" />
            <Crosshair className="absolute -top-[8.5px] -right-[8.5px] text-white/40" />
          </div>
        </div>

        {/* Background Image Layer */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-50 overflow-hidden">
          <img
            src={footerBg}
            alt="Footer Background"
            className="w-full h-full object-cover object-center"
          />
        </div>

        {/* Content Overlay */}
        <section className="text-foreground w-full pb-24 md:pb-32 pt-32 relative z-10">
          <div className="container mx-auto px-10 md:px-6">
            <FooterReveal onCtaClick={scrollToChatbox} scrollProgress={footerScrollProgress} />
          </div>
        </section>
      </footer>
    </>
  );
}

