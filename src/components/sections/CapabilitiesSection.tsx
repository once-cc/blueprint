import { useRef } from "react";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";

import work01 from "@/assets/work-01.jpg";
import work02 from "@/assets/work-02.jpg";
import work03 from "@/assets/work-03.jpg";
import work04 from "@/assets/work-04.jpg";
import work05 from "@/assets/work-05.jpg";

const capabilities = [
  { id: "01", title: "Brand Identity" },
  { id: "02", title: "Digital Design" },
  { id: "03", title: "Product Design" },
  { id: "04", title: "Marketing & Growth" },
  { id: "05", title: "Development" },
];

const galleryImages = [
  { src: work01, parallaxOffset: 250 },
  { src: work02, parallaxOffset: 180 },
  { src: work03, parallaxOffset: 300 },
  { src: work04, parallaxOffset: 220 },
  { src: work05, parallaxOffset: 200 },
];

import type { MotionValue } from "framer-motion";

interface ScrollDrivenServiceProps {
  cap: { id: string; title: string };
  index: number;
  scrollProgress: MotionValue<number>;
}

function ScrollDrivenService({ cap, index, scrollProgress }: ScrollDrivenServiceProps) {
  // Varying spring configs for temporal depth - each item responds differently
  const springConfigs = [
    { stiffness: 40, damping: 18, mass: 1.1 },   // Heaviest, drifts longest
    { stiffness: 50, damping: 20, mass: 1.0 },   // Medium
    { stiffness: 45, damping: 17, mass: 1.05 },  // Medium-heavy
    { stiffness: 55, damping: 22, mass: 0.95 },  // Medium-light
    { stiffness: 60, damping: 24, mass: 0.9 },   // Lightest, settles fastest
  ];
  
  const springConfig = springConfigs[index % 5];

  // Increased stagger gap: 4% scroll between each item's reveal start
  // Increased duration: 8% scroll for each item's full reveal
  const staggerGap = 0.04;
  const itemDuration = 0.08;
  
  const start = index * staggerGap;
  const end = start + itemDuration;

  // Raw scroll-driven values
  const rawOpacity = useTransform(scrollProgress, [start, end], [0, 1]);
  const rawX = useTransform(scrollProgress, [start, end], [-30, 0]);
  const rawScale = useTransform(scrollProgress, [start, end], [0.95, 1]);

  // Apply spring physics for floaty, inertial motion
  const opacity = useSpring(rawOpacity, springConfig);
  const x = useSpring(rawX, springConfig);
  const scale = useSpring(rawScale, springConfig);

  return (
    <motion.li style={{ opacity, x, scale }}>
      <span className="text-2xl md:text-3xl lg:text-4xl font-serif font-medium text-foreground/80 hover:text-foreground transition-colors duration-500 cursor-default">
        {cap.title}
      </span>
    </motion.li>
  );
}

interface ParallaxImageProps {
  src: string;
  parallaxOffset: number;
  index: number;
  isLast: boolean;
  isFirst: boolean;
}

function ParallaxImage({ src, parallaxOffset, index, isLast, isFirst }: ParallaxImageProps) {
  const runwayRef = useRef<HTMLDivElement>(null);
  
  // Track the runway container's position in the viewport
  const { scrollYProgress } = useScroll({
    target: runwayRef,
    offset: ["start end", "end start"]
  });

  // For last image: standard parallax behavior
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    [parallaxOffset, -parallaxOffset]
  );

  // Scale animation
  // All images: scale up 0.90→1.0 during reveal, then scale down during exit
  const scale = useTransform(
    scrollYProgress,
    isFirst 
      ? [0, 0.18, 0.71, 0.77, 0.89]
      : isLast ? [0, 0.18, 0.5, 1] : [0, 0.18, 0.4, 0.8],
    isFirst
      ? [0.90, 1, 1, 1, 0]
      : isLast ? [0.90, 1, 1, 0.95] : [0.90, 1, 1, 0]
  );

  // Opacity fade
  const containerOpacity = useTransform(
    scrollYProgress,
    isFirst
      ? [0, 0.71, 0.80, 0.89]
      : isLast ? [0, 0.6, 0.85, 1] : [0, 0.2, 0.5, 0.8],
    isFirst
      ? [1, 1, 0.5, 0]
      : isLast ? [1, 1, 0.5, 0.15] : [1, 1, 0.5, 0]
  );

  // Vignette intensifies as image scrolls up
  const vignetteOpacity = useTransform(
    scrollYProgress,
    [0, 0.4, 0.8, 1],
    [0, 0.2, 0.6, 0.9]
  );

  // Blur effect as image scales down (cinematic depth-of-field)
  const blur = useTransform(
    scrollYProgress,
    isFirst
      ? [0, 0.71, 0.80, 0.89]
      : isLast ? [0, 0.6, 0.85, 1] : [0, 0.4, 0.6, 0.8],
    isFirst
      ? [0, 0, 2, 6]
      : isLast ? [0, 0, 1, 2] : [0, 0, 2, 6]
  );
  const filterBlur = useTransform(blur, (value) => `blur(${value}px)`);

  // Subtle rotation as image scales down (only for non-last images)
  const rotate = useTransform(
    scrollYProgress,
    isFirst
      ? [0, 0.71, 0.80, 0.89]
      : isLast ? [0, 1] : [0, 0.4, 0.6, 0.8],
    isFirst
      ? [0, 0, -1.5, -5]
      : isLast ? [0, 0] : [0, 0, -1.5, -5]
  );

  // Chromatic aberration - only for non-last images
  const chromaticIntensity = useTransform(
    scrollYProgress,
    isFirst
      ? [0, 0.71, 0.80, 0.89]
      : isLast ? [0, 1] : [0, 0.4, 0.6, 0.8],
    isFirst
      ? [0, 0, 1.5, 3]
      : isLast ? [0, 0] : [0, 0, 1.5, 3]
  );
  const redOffset = useTransform(chromaticIntensity, (v) => -v);
  const blueOffset = useTransform(chromaticIntensity, (v) => v);

  // Hover-driven chromatic boost
  const hoverBoost = useMotionValue(0);
  const smoothHoverBoost = useSpring(hoverBoost, { stiffness: 300, damping: 30 });

  // Combine scroll-driven offset with hover boost
  const redOffsetWithHover = useTransform(
    [redOffset, smoothHoverBoost],
    ([scroll, hover]: number[]) => scroll + (hover * -1)
  );
  const blueOffsetWithHover = useTransform(
    [blueOffset, smoothHoverBoost],
    ([scroll, hover]: number[]) => scroll + hover
  );

  // Hover handlers
  const handleHoverStart = () => {
    if (!isLast) hoverBoost.set(4);
  };
  const handleHoverEnd = () => {
    hoverBoost.set(0);
  };

  const imageContent = (
    <motion.div 
      className="h-[66vh] relative overflow-hidden cursor-pointer"
      style={{ scale, opacity: containerOpacity, filter: filterBlur, rotate }}
      onHoverStart={handleHoverStart}
      onHoverEnd={handleHoverEnd}
    >
      {/* Base image */}
      <img
        src={src}
        alt={`Work showcase ${index + 1}`}
        className="w-full h-full object-cover absolute inset-0"
      />

      {/* Chromatic aberration layers - only for non-last images */}
      {!isLast && (
        <>
          {/* SVG filters for chromatic aberration */}
          <svg className="absolute w-0 h-0" aria-hidden="true">
            <defs>
              <filter id={`redChannel-${index}`}>
                <feColorMatrix type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" />
              </filter>
              <filter id={`cyanChannel-${index}`}>
                <feColorMatrix type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0" />
              </filter>
            </defs>
          </svg>

          {/* Red channel - offset left */}
          <motion.img
            src={src}
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover absolute inset-0 pointer-events-none"
            style={{ 
              x: redOffsetWithHover,
              mixBlendMode: "lighten",
              filter: `url(#redChannel-${index})`
            }}
          />

          {/* Cyan channel - offset right */}
          <motion.img
            src={src}
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover absolute inset-0 pointer-events-none"
            style={{ 
              x: blueOffsetWithHover,
              mixBlendMode: "lighten",
              filter: `url(#cyanChannel-${index})`
            }}
          />
        </>
      )}
      
      {/* Scroll-driven vignette overlay */}
      <motion.div 
        className="absolute inset-0 pointer-events-none"
        style={{ 
          opacity: vignetteOpacity,
          background: "radial-gradient(ellipse at center, transparent 25%, hsl(var(--background) / 0.95) 80%)"
        }}
      />
    </motion.div>
  );

  // Last image: normal scroll behavior, no sticky
  if (isLast) {
    return (
      <motion.div
        ref={runwayRef}
        className="relative w-full px-[10%]"
        style={{ y }}
      >
        {imageContent}
      </motion.div>
    );
  }

  // First image: sticky-centered in the overlap runway, waiting to be revealed
  if (isFirst) {
    return (
      <div ref={runwayRef} className="h-[320vh] relative">
        {/* Sticky container: pinned at viewport center during overlap */}
        <div className="sticky top-1/2 -translate-y-1/2 px-[10%]">
          {imageContent}
        </div>
      </div>
    );
  }

  // All other images: sticky at viewport center with scale-to-zero
  return (
    <div ref={runwayRef} className="h-[100vh] relative">
      <div className="sticky top-1/2 -translate-y-1/2 px-[10%]">
        {imageContent}
      </div>
    </div>
  );
}

export function CapabilitiesSection() {
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Header motion - delayed entrance for left column
  const headerOpacity = useTransform(scrollYProgress, [0.05, 0.15], [0, 1]);
  const headerY = useTransform(scrollYProgress, [0.05, 0.15], [80, 0]);
  const headerSpring = useSpring(headerY, { stiffness: 50, damping: 20 });

  // Atmospheric layer parallax - matches ManifestoSection
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.0, 1.08]);

  // Accent glow - counter-parallax for depth
  const glowY = useTransform(scrollYProgress, [0, 1], [120, -120]);
  const glowOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.12, 0.22, 0.22, 0.12]);

  return (
    <section
      ref={sectionRef}
      id="capabilities"
      className="relative bg-background overflow-x-clip"
      style={{
        minHeight: "550vh",
        marginTop: "-100vh",
        zIndex: 5,
      }}
    >
      {/* L0 - Base Vignette Layer (slow parallax) */}
      <motion.div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ y: bgY, scale: bgScale }}
        aria-hidden="true"
      >
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 50%, hsl(220 12% 10%) 0%, hsl(220 15% 4%) 100%)'
          }}
        />
      </motion.div>

      {/* L1 - Accent Glow Layer (counter-parallax) */}
      <motion.div
        className="absolute inset-0 z-[1] pointer-events-none"
        aria-hidden="true"
      >
        <motion.div
          className="absolute"
          style={{ 
            y: glowY, 
            opacity: glowOpacity,
            left: '55%',
            top: '35%',
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, hsl(38 85% 55% / 0.25) 0%, transparent 65%)',
            filter: 'blur(100px)',
            transform: 'translate(-50%, -50%)',
          }}
        />
      </motion.div>

      {/* L2 - Grain overlay */}
      <div className="absolute inset-0 z-[2] opacity-[0.02] pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc1IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI2EpIi8+PC9zdmc+')]" />

      {/* L2.5 - Right edge dark gradient for seamless image blending */}
      <div 
        className="absolute inset-0 z-[2] pointer-events-none"
        style={{
          background: 'linear-gradient(to left, hsl(220 15% 4% / 1) 0%, hsl(220 15% 4% / 0.95) 15%, hsl(220 15% 4% / 0.7) 25%, hsl(220 15% 4% / 0.3) 40%, transparent 60%)'
        }}
        aria-hidden="true"
      />

      {/* L3+ Content layer */}
      <div className="relative z-[3] grid grid-cols-1 lg:grid-cols-[1fr_2fr]">
        {/* LEFT: Sticky column - delayed start after overlap zone */}
        <motion.div 
          className="lg:sticky lg:top-0 lg:h-screen flex flex-col justify-center px-8 md:px-16 lg:px-24 py-24 lg:py-0"
          style={{ 
            marginTop: "100vh",  // Typography starts AFTER overlap zone
            opacity: headerOpacity,
            y: headerSpring
          }}
        >
          <div>
            <span className="text-sm font-display uppercase tracking-[0.3em] text-muted-foreground block mb-4">
              [04] What We Do
            </span>
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-serif font-medium tracking-tight text-foreground">
              Services
            </h2>
            <p className="mt-8 max-w-md text-lg md:text-xl font-serif text-muted-foreground leading-relaxed">
              Full-spectrum design capabilities under one roof. Whether you need a
              complete brand overhaul or ongoing creative support.
            </p>
          </div>

          {/* Service list - scroll-driven reveal */}
          <ul className="mt-12 space-y-4 md:space-y-6">
            {capabilities.map((cap, index) => (
              <ScrollDrivenService
                key={cap.id}
                cap={cap}
                index={index}
                scrollProgress={scrollYProgress}
              />
            ))}
          </ul>
        </motion.div>

        {/* RIGHT: Images - starts in overlap zone */}
        <div className="relative">
          {/* OVERLAP RUNWAY - first image controls its own height */}
          <ParallaxImage
            src={galleryImages[0].src}
            parallaxOffset={galleryImages[0].parallaxOffset}
            index={0}
            isLast={false}
            isFirst={true}
          />
          
          {/* Normal scroll zone for remaining images */}
          <div className="py-24 lg:py-40 px-4 lg:px-8">
            {galleryImages.slice(1).map((img, index) => (
              <ParallaxImage
                key={index + 1}
                src={img.src}
                parallaxOffset={img.parallaxOffset}
                index={index + 1}
                isLast={index === galleryImages.length - 2}
                isFirst={false}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
