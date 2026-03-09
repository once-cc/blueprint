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
import { HeadlineBanner } from "@/components/ui/HeadlineBanner";
import { EyebrowBanner } from "@/components/ui/EyebrowBanner";
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

      // Dynamically align the bottom of the section to the bottom of the viewport.
      // This guarantees the Architectural Primitives marquee (LogoGrid) at the
      // section's foot stays visible on every screen size.
      const sectionHeight = el.offsetHeight;
      const viewportHeight = window.innerHeight;
      const bottomAlignOffset = sectionHeight - viewportHeight + 24; // 24px breathing room

      lenisScrollTo(el, {
        offset: bottomAlignOffset,
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
              className="fixed inset-0 z-[100] bg-black pointer-events-none flex items-center justify-center"
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
              <div className="absolute top-[-10%] right-[-20%] w-[60%] h-[150%] bg-gradient-to-l from-transparent via-white/10 to-transparent blur-3xl mix-blend-plus-lighter pointer-events-none z-10 animate-light-ray-corner-reverse" style={{ willChange: 'transform, opacity, filter' }} />
              <div className="absolute top-[-20%] right-[10%] w-[40%] h-[150%] bg-gradient-to-l from-transparent via-white/5 to-transparent blur-2xl mix-blend-plus-lighter pointer-events-none z-10 animate-light-ray-corner-reverse delay-700" style={{ willChange: 'transform, opacity, filter' }} />
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
                  className="heading-editorial text-[14vw] min-[400px]:text-[4.25rem] sm:text-[4.5rem] leading-[1.05] md:text-[5.5rem] lg:text-8xl tracking-tight drop-shadow-md pb-1"
                >
                  <span className="text-transparent bg-clip-text bg-gradient-to-b from-white from-[40%] to-zinc-700 block pt-2 -mt-2 pb-2 -mb-2">
                    The <em className="italic font-medium pr-2 md:pr-4">Crafted</em>
                  </span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-b from-white from-[40%] to-zinc-700 block pt-2 -mt-2 pb-3 -mb-3">
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
            <div className="absolute top-[30%] left-[-15%] w-[60%] h-[180%] bg-gradient-to-r from-transparent via-white/5 to-transparent blur-3xl mix-blend-plus-lighter animate-light-ray-corner opacity-50" style={{ willChange: 'transform, opacity, filter' }} />
            <div className="absolute top-[-10%] right-[20%] w-[40%] h-[150%] bg-gradient-to-l from-transparent via-white/[0.03] to-transparent blur-2xl mix-blend-plus-lighter animate-light-ray-corner-reverse delay-500 opacity-40" style={{ willChange: 'transform, opacity, filter' }} />
          </div>



          {/* Testimonial Banner Block — Full substrate treatment matching ScrollyTell section */}
          {/* Reduced vertical padding and bottom margin to draw the carousel closer to the banner */}
          <HeadlineBanner
            className="mb-8"
            dockingRails="both"
            headline={
              <h2 className="font-nohemi font-medium text-[clamp(1.75rem,8.5vw,6rem)] md:text-5xl lg:text-6xl leading-[1.05] tracking-tight mb-4">
                {/* We use inline-block so the gradient spans the ENTIRE physical bounding box, rather than recalculating per-line */}
                <span className="text-transparent bg-clip-text bg-gradient-to-b from-zinc-100 to-zinc-500 inline-block">
                  What the Blueprint Makes Possible
                </span>
              </h2>
            }
            subheadline={
              <p className="text-lg md:text-xl font-body text-transparent bg-clip-text bg-gradient-to-b from-zinc-300 to-zinc-600 max-w-2xl mx-auto">
                Conversion-led websites, operational dashboards, client portals, booking systems — all engineered from a strategic architecture.
              </p>
            }
          />

          {/* Editorial label — echoes "Architectural Primitives" treatment */}
          <EyebrowBanner>
            Engineered Visions
          </EyebrowBanner>

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
        className={`fixed bottom-0 left-0 w-full bg-black -z-10 flex flex-col justify-end overflow-hidden transition-opacity duration-1000 ${isReady ? 'opacity-100' : 'opacity-0'}`}
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

