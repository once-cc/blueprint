/**
 * ApproachProjectsBand - Unified scroll container for Approach → Projects → Services
 * Single sticky background video plane spans all three sections
 */

import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, MotionValue, useMotionValue, useMotionValueEvent } from "framer-motion";
import { EditorialGridLines } from "@/components/ui/EditorialGridLines";
import { ApproachBackdrop } from "@/components/home/ApproachBackdrop";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { InfiniteMarquee } from "@/components/projects/InfiniteMarquee";
import { CarouselProjectCard } from "@/components/projects/CarouselProjectCard";
import { ServicesContent } from "@/components/sections/ServicesContent";
import { CraftSection } from "@/components/sections/CraftSection";
import { useSmoothScroll } from "@/components/providers/SmoothScrollProvider";
import { topRowProjects, bottomRowProjects, thirdRowProjects, carouselProjects } from "@/data/projectCarouselData";
import profileShot from "@/assets/profileshot.webp";
import ProjectsStageVideo from "@/assets/ProjectsStage.webm";
import { VideoLogo } from "@/components/ui/VideoLogo";
import { ScrollGrayscaleImage } from "@/components/ui/ScrollGrayscaleImage";
// ScrollyLine component optimized to use parent scroll progress
interface ScrollyLineProps {
  children: React.ReactNode;
  className?: string;
  staggerIndex?: number;
  scrollYProgress?: MotionValue<number>; // Optional for boot-safety
  baseRange?: [number, number]; // Optional override for where in the section it appears [start, end]
}

function ScrollyLine({
  children,
  className = "",
  staggerIndex = 0,
  scrollYProgress,
  baseRange = [0, 0.3] // Default: Animate in during the first 30% of the section's viewport traversal
}: ScrollyLineProps) {
  // Defensive fallback motion value
  const fallbackProgress = useMotionValue(0);
  const activeProgress = scrollYProgress || fallbackProgress;

  // Calculate specific trigger range based on stagger - loosened to 0.05s
  const staggerDelay = staggerIndex * 0.05;
  const start = baseRange[0] + staggerDelay;
  const end = baseRange[1] + staggerDelay;

  // Safe clamp in case of extreme values
  const safeStart = Math.min(start, 0.9);
  const safeEnd = Math.min(end, 0.95);

  const opacity = useTransform(activeProgress, [safeStart, safeEnd], [0, 1]);
  const y = useTransform(activeProgress, [safeStart, safeEnd], [30, 0]);

  return (
    <motion.div
      className={className}
      style={{
        opacity: scrollYProgress ? opacity : 1,
        y: scrollYProgress ? y : 0,
        willChange: "transform, opacity"
      }}
    >
      {children}
    </motion.div>
  );
}

export function ApproachProjectsBand() {
  const bandRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Section Refs for ScrollyTelling
  const approachRef = useRef<HTMLElement>(null);
  const projectsRef = useRef<HTMLElement>(null);

  const portraitRef = useRef<HTMLDivElement>(null);
  const { lenis } = useSmoothScroll();

  // Respect prefers-reduced-motion
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // 1. Band-level Scroll (video logic potential)
  const { scrollYProgress: bandScrollProgress } = useScroll({
    target: bandRef,
    offset: ["start start", "end end"]
  });

  // 2. Approach Section Scroll
  const { scrollYProgress: approachScrollProgress } = useScroll({
    target: approachRef,
    offset: ["start 0.9", "end start"] // Start triggering when top hits 90% of viewport
  });

  // 3. Projects Section Scroll with 8% Neutral Padding (Reset Windows)
  const { scrollYProgress: rawProjectsScrollProgress } = useScroll({
    target: projectsRef,
    offset: ["start 0.9", "end start"]
  });

  // Create padded progress: 0-8% dead air, 8-92% animation, 92-100% dead air
  const projectsScrollProgress = useTransform(
    rawProjectsScrollProgress,
    [0, 0.08, 0.92, 1],
    [0, 0, 1, 1]
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);


  // Scroll-driven grayscale effect for portrait - OPTIMIZED
  // Using the new bandScrollProgress would be complex due to relative offsets.
  // We will keep this localized for precision but ensure the image is lazy.
  const { scrollYProgress: portraitProgress } = useScroll({
    target: portraitRef,
    offset: ["start 0.8", "start 0.5"]
  });

  const portraitOpacity = useTransform(portraitProgress, [0, 1], [0, 1]);

  const { isNavigating } = useSmoothScroll();
  const [isNavigatingLocal, setIsNavigatingLocal] = useState(false);

  useMotionValueEvent(isNavigating, "change", (latest) => {
    setIsNavigatingLocal(latest);
  });

  const [isLogoActive, setIsLogoActive] = useState(true);

  return (
    <div
      ref={bandRef}
      className="relative"
      style={{ minHeight: '1350vh' }}
    >
      {/* ═══════════════════════════════════════════════════════════════
          STICKY BACKGROUND PLANE (z-0)
          CLASS B' Isolation: Persistent Spectator Infrastructure
          ═══════════════════════════════════════════════════════════════ */}
      <div className="sticky top-0 h-screen w-full overflow-hidden z-0 pointer-events-none isolation-isolate contain-paint">
        {/* Video element - Persistent Environment Plane */}
        <video
          ref={videoRef}
          muted
          loop
          autoPlay
          playsInline
          preload="auto"
          disablePictureInPicture
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            transform: 'translateZ(0)'
          }}
        >
          <source src={ProjectsStageVideo} type="video/webm" />
        </video>

        {/* ═══════════════════════════════════════════════════════════════
            LOGO OVERLAY - Centered within light ring
            ═══════════════════════════════════════════════════════════════ */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ zIndex: 1 }}
        >
          <VideoLogo
            size="custom"
            className="select-none"
            style={{
              width: 'clamp(120px, 18vw, 280px)',
              height: 'auto',
              opacity: prefersReducedMotion ? 0.6 : 0.9,
            }}
          />
        </div>

        {/* Top fade (soft reveal) */}
        <div
          className="absolute inset-x-0 top-0 h-40"
          style={{
            background: 'linear-gradient(to bottom, hsl(var(--background)) 0%, transparent 100%)'
          }}
        />

        {/* Bottom fade (soft exit) */}
        <div
          className="absolute inset-x-0 bottom-0 h-40"
          style={{
            background: 'linear-gradient(to top, hsl(var(--background)) 0%, transparent 100%)'
          }}
        />
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          FOREGROUND CONTENT (z-10)
          ═══════════════════════════════════════════════════════════════ */}
      <div className="relative z-10">

        {/* ─────────────────────────────────────────────────────────────
            APPROACH SECTION CONTENT
            ───────────────────────────────────────────────────────────── */}
        <section
          ref={approachRef} // Attaching ref for consolidated scroll
          id="approach"
          className="relative pt-16 lg:pt-20 pb-32 lg:pb-40 overflow-hidden"
        >
          {/* Background Plate - obscures video, uses sidebar color */}
          <ApproachBackdrop />

          {/* Content Layer - sits above backdrop */}
          <div className="relative z-10 container mx-auto px-6 lg:px-8 max-w-7xl">
            {/* Section Label - Scrollytelling */}
            <ScrollyLine
              className="mb-16"
              staggerIndex={0}
              scrollYProgress={approachScrollProgress}
              baseRange={[0, 0.2]}
            >
              <SectionTitle>[01] Our Approach</SectionTitle>
            </ScrollyLine>

            {/* Mixed-Weight Headline - Scrollytelling */}
            <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-serif leading-[1.1] tracking-tight mb-24 lg:mb-32 max-w-5xl">
              <ScrollyLine className="inline" staggerIndex={1} scrollYProgress={approachScrollProgress}>
                <span className="text-muted-foreground">Your online presence is already speaking.</span>{" "}
              </ScrollyLine>
              <ScrollyLine className="inline" staggerIndex={2} scrollYProgress={approachScrollProgress}>
                <span className="text-foreground">The question is — what is it saying?</span>{" "}
              </ScrollyLine>
              <ScrollyLine className="inline" staggerIndex={3} scrollYProgress={approachScrollProgress}>
                <span className="text-muted-foreground">We align design, messaging, and automation</span>{" "}
              </ScrollyLine>
              <ScrollyLine className="inline" staggerIndex={4} scrollYProgress={approachScrollProgress}>
                <span className="text-foreground">so you can attract your best clients — and keep them.</span>
              </ScrollyLine>
            </h2>

            {/* Portrait + Quote Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-16 xl:gap-20 mb-20">
              {/* Founder Portrait - Scroll-driven grayscale */}
              <motion.div
                ref={portraitRef}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative aspect-[4/5] md:aspect-[3/4] lg:aspect-[4/5] overflow-hidden max-w-md md:max-w-none mx-auto md:mx-0"
              >
                <ScrollGrayscaleImage
                  src={profileShot}
                  alt="Joshua Cleland, Founder"
                  className="w-full h-full object-cover"
                  startOffset={0.2}
                  endOffset={0.5}
                  imageClassName=""
                />
                {/* Subtle overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent pointer-events-none" />
              </motion.div>

              {/* Quote Block */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="flex flex-col justify-center"
              >
                {/* Decorative Quote Mark */}
                <span
                  className="text-8xl lg:text-9xl font-serif text-muted-foreground/20 leading-none select-none -mb-8 lg:-mb-12"
                  aria-hidden="true"
                >
                  "
                </span>

                <blockquote className="text-xl md:text-2xl lg:text-3xl font-serif leading-relaxed text-foreground mb-8">
                  Most websites fail for one reason: The message isn't engineered.
                  The offer is buried. The customer journey is unclear.
                </blockquote>

                {/* Two-Column Body Text */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    At Cleland Studio, we treat your website like a system. Design, story,
                    and automation working together — quiet, precise, and built to convert.
                  </p>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    No noise. No theatre. Just craftsmanship that moves the needle.
                    Premium-built for businesses building upward.
                  </p>
                </div>

                {/* Attribution */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-px bg-border" />
                  <span className="text-sm text-muted-foreground tracking-wide">
                    Joshua Cleland, Founder / Creative Director
                  </span>
                </div>
              </motion.div>
            </div>
          </div>
          {/* Bottom seam */}
          <div
            className="absolute bottom-0 left-0 right-0 h-px"
            style={{
              background: 'linear-gradient(to right, transparent 0%, rgba(255,255,255,0.06) 20%, rgba(255,255,255,0.06) 80%, transparent 100%)'
            }}
          />
        </section>

        {/* ─────────────────────────────────────────────────────────────
            PROJECTS SECTION CONTENT
            ───────────────────────────────────────────────────────────── */}
        <section
          ref={projectsRef}
          id="projects"
          className="relative pt-24 md:pt-32 lg:pt-40 pb-32 md:pb-40 lg:pb-48"
        >
          {/* Grain overlay */}
          <div className="grain-overlay opacity-[0.02] pointer-events-none isolation-isolate contain-paint" />

          {/* Editorial Grid Lines */}
          <EditorialGridLines showHorizontalTop horizontalTopPosition="12%" />

          {/* Section Header with Staggered Blur-In */}
          <div className="container mx-auto px-6 lg:px-8 max-w-7xl">
            <div className="mb-20 md:mb-28 lg:mb-36 space-y-1">
              {/* Staggered primer lines */}
              <ScrollyLine staggerIndex={0} scrollYProgress={projectsScrollProgress}>
                <p className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-serif leading-[1.15] tracking-tight max-w-5xl">
                  <span className="text-muted-foreground">Crafted digital experiences</span>
                </p>
              </ScrollyLine>

              <ScrollyLine staggerIndex={1} scrollYProgress={projectsScrollProgress}>
                <p className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-serif leading-[1.15] tracking-tight max-w-5xl">
                  <span className="text-foreground">designed to drive real outcomes.</span>
                </p>
              </ScrollyLine>

              <ScrollyLine staggerIndex={2} scrollYProgress={projectsScrollProgress}>
                <p className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-serif leading-[1.15] tracking-tight max-w-5xl">
                  <span className="text-muted-foreground">From strategy to execution,</span>
                </p>
              </ScrollyLine>

              <ScrollyLine staggerIndex={3} scrollYProgress={projectsScrollProgress}>
                <p className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-serif leading-[1.15] tracking-tight max-w-5xl">
                  <span className="text-foreground">every build is intentional.</span>
                </p>
              </ScrollyLine>

              {/* Section label */}
              <ScrollyLine staggerIndex={4} className="pt-12" scrollYProgress={projectsScrollProgress}>
                <div className="flex items-baseline justify-between">
                  <SectionTitle>[02] Projects</SectionTitle>
                  <span className="text-sm text-muted-foreground">
                    Our Work [{carouselProjects.length.toString().padStart(2, "0")}]
                  </span>
                </div>
              </ScrollyLine>

              {/* Main headline */}
              <ScrollyLine staggerIndex={5} className="pt-4" scrollYProgress={projectsScrollProgress}>
                <h2 className="heading-display text-foreground">
                  Case studies
                </h2>
              </ScrollyLine>

              {/* Year range */}
              <ScrollyLine staggerIndex={6} scrollYProgress={projectsScrollProgress}>
                <p className="text-muted-foreground mt-4 text-lg">© 2025 -2026 </p>
              </ScrollyLine>
            </div>
          </div>

          {/* Depth anchor glow - centered behind middle carousel */}
          <div
            className="absolute left-1/2 -translate-x-1/2 z-0 pointer-events-none isolation-isolate contain-paint"
            style={{
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: '85%',
              maxWidth: '1400px',
              height: '450px',
              background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.018) 0%, transparent 70%)',
              filter: 'blur(80px)',
            }}
          />

          {/* Dual Counter-Scrolling Carousels */}
          <div className="relative z-10 space-y-4 md:space-y-6 lg:space-y-8">
            {/* Top horizontal gridline */}
            <div
              className="w-full h-px"
              style={{
                background: 'linear-gradient(to right, transparent 0%, rgba(255,255,255,0.03) 10%, rgba(255,255,255,0.03) 90%, transparent 100%)'
              }}
            />

            {/* Top Row - Moves Right (very slow, authoritative) - Far Background */}
            <div className="relative">
              {/* Top recession gradient - fades from top */}
              <div
                className="absolute inset-0 z-20 pointer-events-none"
                style={{
                  background: 'linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, transparent 60%)'
                }}
              />
              <div
                className="carousel-edge-mask"
              >
                <InfiniteMarquee
                  direction="right"
                  speed={85}
                  priority="low"
                >
                  {topRowProjects.map((project) => (
                    <CarouselProjectCard
                      key={`top-${project.id}`}
                      project={project}
                      variant="far-background"
                    />
                  ))}
                </InfiniteMarquee>
              </div>
            </div>

            {/* Middle horizontal gridline */}
            <div
              className="w-full h-px"
              style={{
                background: 'linear-gradient(to right, transparent 0%, rgba(255,255,255,0.04) 15%, rgba(255,255,255,0.04) 85%, transparent 100%)'
              }}
            />

            {/* Middle Row - Moves Left (fast, energetic) - HERO */}
            <div>
              <div
                className="carousel-edge-mask"
              >
                <InfiniteMarquee
                  direction="left"
                  speed={32}
                  priority="high"
                >
                  {bottomRowProjects.map((project) => (
                    <CarouselProjectCard
                      key={`middle-${project.id}`}
                      project={project}
                      variant="hero"
                    />
                  ))}
                </InfiniteMarquee>
              </div>
            </div>

            {/* Second horizontal gridline */}
            <div
              className="w-full h-px"
              style={{
                background: 'linear-gradient(to right, transparent 0%, rgba(255,255,255,0.03) 15%, rgba(255,255,255,0.03) 85%, transparent 100%)'
              }}
            />

            {/* Third Row - Moves Right (medium pace, A/B/A pattern) - Supporting (mid-background) */}
            <div className="relative">
              {/* Bottom recession gradient - gentler than top */}
              <div
                className="absolute inset-0 z-20 pointer-events-none"
                style={{
                  background: 'linear-gradient(to top, rgba(0,0,0,0.15) 0%, transparent 50%)'
                }}
              />
              <div
                className="carousel-edge-mask"
              >
                <InfiniteMarquee
                  direction="right"
                  speed={60}
                  priority="low"
                >
                  {thirdRowProjects.map((project) => (
                    <CarouselProjectCard
                      key={`third-${project.id}`}
                      project={project}
                      variant="supporting"
                    />
                  ))}
                </InfiniteMarquee>
              </div>
            </div>

            {/* Bottom horizontal gridline */}
            <div
              className="w-full h-px"
              style={{
                background: 'linear-gradient(to right, transparent 0%, rgba(255,255,255,0.03) 10%, rgba(255,255,255,0.03) 90%, transparent 100%)'
              }}
            />
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            SERVICES SECTION CONTENT
            ───────────────────────────────────────────────────────────── */}
        <ServicesContent id="services" />

        {/* ─────────────────────────────────────────────────────────────
            C.R.A.F.T.™ FRAMEWORK SECTION CONTENT
            ───────────────────────────────────────────────────────────── */}
        <CraftSection id="craft" />
      </div>
    </div>
  );
}
