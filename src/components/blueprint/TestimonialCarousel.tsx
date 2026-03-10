import React, { useRef, useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, useAnimationFrame, useMotionValueEvent, MotionValue } from "framer-motion";
import { capabilityShowcase, type CapabilityShowcase } from "@/data/testimonials";

// We use 4 duplicated sets. Set 0 (offscreen left), Set 1 (main), Set 2, Set 3 (buffer right).
const MULTIPLIER = 4;
const SET_LENGTH = capabilityShowcase.length; // items per full set
const extendedShowcase = Array.from({ length: MULTIPLIER }).flatMap((_, idx) =>
  capabilityShowcase.map(t => ({ ...t, uniqueKey: `${t.id}-${idx}`, setIndex: idx }))
);

export function TestimonialCarousel() {
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isVisible = useRef(false);

  // Shared mobile breakpoint — single listener instead of 24 per-card listeners
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // To track the pixel width of exactly one "Set" of testimonials
  const setWidth = useMotionValue(0);

  // Track continuous horizontal scroll — this is the single source of truth
  const x = useMotionValue(0);

  // Measure the width of a single set dynamically on mount and resize
  useEffect(() => {
    function measure() {
      const isDesktop = window.matchMedia("(min-width: 768px)").matches;
      // Exact calculation based on Tailwind classes: card width + gap width
      const cardWidth = isDesktop ? 750 : 680;
      const gap = isDesktop ? 32 : 16;
      const width = (cardWidth + gap) * SET_LENGTH;
      setWidth.set(width);

      // Start the carousel safely anchored one full set in, so dragging right immediately works
      if (x.get() === 0) {
        x.set(-width);
      }
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [x, setWidth]);

  // Visibility gate: only run RAF work when the carousel is near the viewport
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { isVisible.current = entry.isIntersecting; },
      { rootMargin: "500px 0px" }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Infinite motion loop — gated behind visibility check
  useAnimationFrame((_, delta) => {
    if (!isVisible.current) return;

    let currentX = x.get();

    // Auto scroll left slowly if not dragging
    if (!isDragging.current) {
      currentX -= delta * 0.05;
    }

    // Seamless Snap Logic (the illusion)
    // If we've scrolled deep enough left past 2 full sets
    const w = setWidth.get();
    if (w > 0) {
      if (currentX <= -(w * 2)) {
        // Jump exactly one full set right
        currentX += w;
      }
      // Or if we drag right past 0 (meaning we are entering Set 0 territory at the start)
      else if (currentX >= 0) {
        // Jump exactly one full set left
        currentX -= w;
      }
    }

    x.set(currentX);
  });

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden py-12 md:py-24 bg-transparent select-none">

      {/* 3D Scene Container */}
      <div
        className="flex justify-start items-center relative z-10 w-full overflow-hidden"
        style={{ perspective: "1000px" }}
      >
        {/* Top Rail Fill — opaque, no blend mode */}
        <div className="absolute inset-x-[-10vw] top-0 h-[50px] md:h-[70px] pointer-events-none z-[1] overflow-visible">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 1000 100" preserveAspectRatio="none">
            <path d="M 0 0 Q 500 200 1000 0 L 1000 8 Q 500 208 0 8 Z" fill="rgba(10,10,15,1)" />
          </svg>
        </div>

        {/* Architectural Track Rails — Top Pair (3D Curved Illusion) */}
        <div className="absolute inset-x-[-10vw] top-0 h-[50px] md:h-[70px] pointer-events-none z-0 mix-blend-plus-lighter overflow-visible">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 1000 100" preserveAspectRatio="none">
            {/* Outer Faint Rail */}
            <path d="M 0 0 Q 500 200 1000 0" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            {/* Inner Bright Rail Glow (Replaced expensive drop-shadow filter with geometric path scaling) */}
            <path d="M 0 8 Q 500 208 1000 8" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" vectorEffect="non-scaling-stroke" />
            {/* Inner Bright Rail Core */}
            <path d="M 0 8 Q 500 208 1000 8" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          </svg>
        </div>

        {/* Bottom Rail Fill — opaque, no blend mode */}
        <div className="absolute inset-x-[-10vw] bottom-0 h-[50px] md:h-[70px] pointer-events-none z-[1] overflow-visible">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 1000 100" preserveAspectRatio="none">
            <path d="M 0 92 Q 500 -108 1000 92 L 1000 100 Q 500 -100 0 100 Z" fill="rgba(10,10,15,1)" />
          </svg>
        </div>

        {/* Architectural Track Rails — Bottom Pair (3D Curved Illusion) */}
        <div className="absolute inset-x-[-10vw] bottom-0 h-[50px] md:h-[70px] pointer-events-none z-0 mix-blend-plus-lighter overflow-visible">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 1000 100" preserveAspectRatio="none">
            {/* Inner Bright Rail Glow (Replaced expensive drop-shadow filter with geometric path scaling) */}
            <path d="M 0 92 Q 500 -108 1000 92" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" vectorEffect="non-scaling-stroke" />
            {/* Inner Bright Rail Core */}
            <path d="M 0 92 Q 500 -108 1000 92" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            {/* Outer Faint Rail */}
            <path d="M 0 100 Q 500 -100 1000 100" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          </svg>
        </div>

        <motion.div
          className="flex gap-4 md:gap-8 cursor-grab active:cursor-grabbing px-0 md:px-0 touch-pan-y"
          style={{ x, transformStyle: "preserve-3d", touchAction: "pan-y", willChange: "transform" }}
          drag="x"
          dragDirectionLock
          dragConstraints={{ left: -100000, right: 100000 }} // Arbitrarily large limits; our snapping logic prevents hitting ends
          dragElastic={0}
          onDragStart={() => isDragging.current = true}
          onDragEnd={() => {
            setTimeout(() => {
              isDragging.current = false;
            }, 500);
          }}
        >
          {extendedShowcase.map((item, idx) => (
            <Card
              key={item.uniqueKey}
              item={item}
              index={idx}
              x={x}
              isMobile={isMobile}
            />
          ))}
        </motion.div>
      </div>

    </div>
  );
}

// Optimized Card — pure math positioning, ZERO getBoundingClientRect
const Card = React.memo(({ item, index, x, isMobile }: { item: CapabilityShowcase & { uniqueKey: string }, index: number, x: MotionValue<number>, isMobile: boolean }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isActive, setIsActive] = useState(false);

  // --- PURE MATH POSITIONING (no DOM measurement) ---
  // Every card is identical: same width, same gap. So each card's center
  // in the flex container's local coordinate space is deterministic.
  const cardWidth = isMobile ? 680 : 750;
  const gap = isMobile ? 16 : 32;
  const s = cardWidth + gap; // stride: 782px desktop, 696px mobile

  // Card's local center = index * stride + half a card width
  const localCenter = index * s + cardWidth / 2;

  // centerDistance = how far this card's center is from the viewport center
  // The motion value `x` shifts the entire track, so:
  // screenPosition = localCenter + x
  // centerDistance = screenPosition - viewportCenter
  const centerDistance = useTransform(x, (xVal) => {
    const windowCenter = typeof window !== "undefined" ? window.innerWidth / 2 : 600;
    return localCenter + xVal - windowCenter;
  });

  // Active threshold at 55% of stride
  useMotionValueEvent(centerDistance, "change", (latest) => {
    setIsActive(Math.abs(latest) < s * 0.55);
  });

  // All ranges derived from stride (s) for mathematically uniform transitions
  // ±1.5s is the full transform range (covers the nearest 1.5 cards on each side)

  // 3D concave depth — peaks at center, pushes back symmetrically
  const z = useTransform(centerDistance, [-s * 1.5, 0, s * 1.5], isMobile ? [120, -200, 120] : [80, -160, 80]);

  // Gentle inward tilt — proportional to stride distance
  const rotateY = useTransform(centerDistance, [-s * 1.5, 0, s * 1.5], isMobile ? [20, 0, -20] : [12, 0, -12]);

  // --- ARTIFACT DOMINANCE EFFECTS ---

  // Opacity: symmetric bell curve anchored to stride positions
  // 0 → 0.35 → 0.7 → 1 → 0.7 → 0.35 → 0
  const opacity = useTransform(
    centerDistance,
    [-s * 2, -s, -s * 0.5, 0, s * 0.5, s, s * 2],
    [0, 0.35, 0.7, 1, 0.7, 0.35, 0]
  );

  // Scale: 1 at center, 0.88 at ±1.5 strides
  const scale = useTransform(centerDistance, [-s * 1.5, 0, s * 1.5], [0.88, 1, 0.88]);

  // Blueprint Grid Opacity — subtle brightening at center
  const gridOpacity = useTransform(centerDistance, [-s * 1.5, 0, s * 1.5], [0.3, 0.45, 0.3]);

  // Blur and BoxShadow continuous string calculations removed for 60fps performance gains

  // ID Formatting
  const idNumber = String((index % SET_LENGTH) + 1).padStart(3, '0');

  // Animation Variants for Sequence Reveal
  // Sequence narrowed strictly to the metadata content, making the overall experience much softer.
  const staggerContainer = {
    hidden: { opacity: 0.85 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04,
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const staggerItem = {
    hidden: { opacity: 0.7, y: 2 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  return (
    <motion.div
      ref={cardRef}
      className="flex-shrink-0 w-[680px] md:w-[750px] relative flex items-stretch overflow-hidden bg-[#1C1C1E] border border-white/5 rounded-[24px] select-none px-8 pb-8 pt-3"
      style={{
        z,
        rotateY,
        opacity,
        scale,
        transformStyle: "preserve-3d",
        willChange: "transform, opacity"
      }}
    >
      {/* Blueprint background grid lines */}
      <motion.div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          opacity: gridOpacity,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          backgroundPosition: "center center"
        }}
      />

      {/* Blueprint cross marks */}
      <div className="absolute top-12 left-12 w-4 h-4 text-white/20 select-none z-0 pointer-events-none">
        <svg viewBox="0 0 100 100" className="w-full h-full"><path d="M50 0v100M0 50h100" stroke="currentColor" strokeWidth="2" /></svg>
      </div>
      <div className="absolute bottom-12 right-12 w-4 h-4 text-white/20 select-none z-0 pointer-events-none">
        <svg viewBox="0 0 100 100" className="w-full h-full"><path d="M50 0v100M0 50h100" stroke="currentColor" strokeWidth="2" /></svg>
      </div>
      <div className="absolute bottom-12 left-12 w-4 h-4 text-white/20 select-none z-0 pointer-events-none">
        <svg viewBox="0 0 100 100" className="w-full h-full"><path d="M50 0v100M0 50h100" stroke="currentColor" strokeWidth="2" /></svg>
      </div>
      <div className="absolute top-12 right-12 w-4 h-4 text-white/20 select-none z-0 pointer-events-none">
        <svg viewBox="0 0 100 100" className="w-full h-full"><path d="M50 0v100M0 50h100" stroke="currentColor" strokeWidth="2" /></svg>
      </div>

      <div className="relative z-10 flex items-stretch gap-8 w-full justify-center" style={{ transformStyle: "preserve-3d" }}>

        {/* Artifact Panel Container */}
        <motion.div
          className="relative flex flex-col flex-shrink-0 p-[14px] rounded-[18px] bg-white/[0.04] transition-transform duration-220 ease-out hover:-translate-y-1 hover:scale-[1.01] h-full"
          initial="hidden"
          animate={isActive ? "visible" : "hidden"}
          variants={staggerContainer}
          style={{
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04), 0 10px 40px rgba(0,0,0,0.6)',
            transform: "translateZ(30px)",
            transformStyle: "preserve-3d"
          }}
        >
          {/* Corner Frame Marks */}
          <div className="absolute top-[-8px] left-[-8px] w-4 h-4 border-t border-l border-white/20" />
          <div className="absolute top-[-8px] right-[-8px] w-4 h-4 border-t border-r border-white/20" />
          <div className="absolute bottom-[-8px] left-[-8px] w-4 h-4 border-b border-l border-white/20" />
          <div className="absolute bottom-[-8px] right-[-8px] w-4 h-4 border-b border-r border-white/20" />

          {/* Image */}
          <div
            className="w-[300px] md:w-[350px] flex-grow aspect-auto md:aspect-[3/4] relative overflow-hidden rounded-md border border-white/5 bg-transparent"
            style={{ transform: "translateZ(10px)", transformStyle: "preserve-3d", minHeight: "260px" }}
          >
            {/* Overlay ID Marker on top right of the image */}
            <div className="absolute top-4 right-4 z-20 text-[10px] font-mono tracking-[0.2em] font-medium text-white/40 uppercase bg-black/40 backdrop-blur-md px-2 py-1 rounded-[4px] border border-white/10">
              CS-{idNumber}
            </div>
            {item.image ? (
              <img
                src={item.image}
                alt={item.systemName}
                className="absolute inset-0 w-full h-full object-cover"
                draggable={false}
              />
            ) : (
              <div className="absolute inset-0 bg-transparent" />
            )}
            {/* Bottom Vignette */}
            <div className="absolute inset-x-0 bottom-0 h-[40%] pointer-events-none" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.4))' }} />
          </div>
        </motion.div>

        <motion.div
          className="w-[270px] flex-shrink-0 bg-white/[0.02] border-l border-white/[0.08] p-5 md:p-7 flex flex-col justify-center gap-3 md:gap-6 rounded-r-lg"
          initial="hidden"
          animate={isActive ? "visible" : "hidden"}
          variants={staggerContainer}
          style={{ transform: "translateZ(20px)" }}
        >
          <ArtifactMetadataSpine item={item} isEnhanced={item.isEnhancedArtifact} staggerItem={staggerItem} />
        </motion.div>

      </div>

    </motion.div>
  );
});

// Extracted Sub-component for Metadata handling
const ArtifactMetadataSpine = ({ item, isEnhanced, staggerItem }: { item: CapabilityShowcase, isEnhanced?: boolean, staggerItem: any }) => {
  if (isEnhanced) {
    return (
      <>
        {/* Capability Header */}
        <motion.div variants={staggerItem} className="flex flex-col gap-1">
          <p className="text-[10px] text-white/55 tracking-[0.22em] uppercase font-mono">{item.artifactCapability?.title || "CAPABILITY"}</p>
          <p className="text-[22px] text-white font-medium tracking-[0.02em] leading-tight font-nohemi">{item.artifactCapability?.name || item.systemName}</p>
        </motion.div>

        {/* Output Label + Outcome Annotation */}
        <motion.div variants={staggerItem} className="mt-2 flex flex-col gap-1">
          <p className="text-[10px] text-white/45 tracking-[0.2em] uppercase font-mono">OUTPUT</p>
          <p className="text-[14px] text-white/75 leading-relaxed max-w-[220px] font-raela">
            {item.artifactAnnotation || item.description}
          </p>
        </motion.div>

        {/* Subtle Divider */}
        <motion.div variants={staggerItem}>
          <div className="w-full h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
        </motion.div>

        {/* Dynamic Metadata Fields */}
        <motion.div variants={staggerItem} className="flex flex-col gap-[22px]">
          {item.artifactMetadata?.map((field, idx) => (
            <div key={idx} className="flex flex-col">
              <span className="text-[10px] text-white/45 tracking-[0.2em] uppercase font-mono">{field.label}</span>
              <span className="text-[14px] text-white/85 mt-1 font-raela">{field.value}</span>
            </div>
          ))}
        </motion.div>
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4 opacity-50">
        <div className="w-12 h-px bg-white/20" />
        <div className="w-full h-px bg-white/10" />

        <div className="flex flex-col gap-2 mt-2">
          <div className="w-10 h-px bg-white/20" />
          <div className="w-24 h-1 bg-white/10 rounded-full" />
        </div>
        <div className="flex flex-col gap-2 mt-2">
          <div className="w-16 h-px bg-white/20" />
          <div className="w-32 h-1 bg-white/10 rounded-full" />
        </div>
      </div>

      <div className="w-full h-24 border border-white/10 rounded-sm bg-white/[0.02] opacity-50" />

      <div className="flex flex-col gap-4 opacity-50">
        <div className="flex flex-col gap-2">
          <div className="w-12 h-px bg-white/20" />
          <div className="w-20 h-1 bg-white/10 rounded-full" />
        </div>
        <div className="flex flex-col gap-2 mt-2">
          <div className="w-8 h-px bg-white/20" />
          <div className="w-28 h-1 bg-white/10 rounded-full" />
        </div>
      </div>
    </>
  );
};
