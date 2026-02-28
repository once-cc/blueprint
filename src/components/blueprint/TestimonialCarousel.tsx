import React, { useRef, useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, useAnimationFrame, MotionValue } from "framer-motion";
import { testimonials, type Testimonial } from "@/data/testimonials";

// We use 4 duplicated sets. Set 0 (offscreen left), Set 1 (main), Set 2, Set 3 (buffer right).
const MULTIPLIER = 4;
const SET_LENGTH = testimonials.length; // 9 items per full set
const extendedTestimonials = Array.from({ length: MULTIPLIER }).flatMap((_, idx) =>
  testimonials.map(t => ({ ...t, uniqueKey: `${t.id}-${idx}`, setIndex: idx }))
);

export function TestimonialCarousel() {
  const isDragging = useRef(false);

  // To track the pixel width of exactly one "Set" of testimonials
  const setWidth = useMotionValue(0);

  // Track continuous horizontal scroll — this is the single source of truth
  const x = useMotionValue(0);

  // Measure the width of a single set dynamically on mount and resize
  useEffect(() => {
    function measure() {
      const isDesktop = window.matchMedia("(min-width: 768px)").matches;
      // Exact calculation based on Tailwind classes: card width + gap width
      const width = isDesktop ? (350 + 32) * SET_LENGTH : (280 + 16) * SET_LENGTH;
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

  // Infinite motion loop ticking on every animation frame
  useAnimationFrame((_, delta) => {
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
    <div className="relative w-full overflow-hidden py-24 bg-transparent select-none">

      {/* 3D Scene Container */}
      <div
        className="flex justify-start items-center relative z-10 w-full"
        style={{ perspective: "1000px" }}
      >
        {/* Architectural Track Rails — Top Pair (3D Curved Illusion) */}
        <div className="absolute inset-x-[-10vw] top-0 h-[50px] md:h-[70px] pointer-events-none z-0 mix-blend-plus-lighter overflow-visible">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 1000 100" preserveAspectRatio="none">
            {/* Outer Faint Rail */}
            <path d="M 0 0 Q 500 200 1000 0" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            {/* Inner Bright Rail */}
            <path d="M 0 8 Q 500 208 1000 8" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" vectorEffect="non-scaling-stroke" style={{ filter: "drop-shadow(0px 1px 8px rgba(255,255,255,0.15))" }} />
          </svg>
        </div>

        {/* Architectural Track Rails — Bottom Pair (3D Curved Illusion) */}
        <div className="absolute inset-x-[-10vw] bottom-0 h-[50px] md:h-[70px] pointer-events-none z-0 mix-blend-plus-lighter overflow-visible">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 1000 100" preserveAspectRatio="none">
            {/* Inner Bright Rail */}
            <path d="M 0 92 Q 500 -108 1000 92" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" vectorEffect="non-scaling-stroke" style={{ filter: "drop-shadow(0px -1px 8px rgba(255,255,255,0.15))" }} />
            {/* Outer Faint Rail */}
            <path d="M 0 100 Q 500 -100 1000 100" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          </svg>
        </div>

        <motion.div
          className="flex gap-4 md:gap-8 cursor-grab active:cursor-grabbing px-0 md:px-0"
          style={{ x, transformStyle: "preserve-3d" }}
          drag="x"
          dragConstraints={{ left: -100000, right: 100000 }} // Arbitrarily large limits; our snapping logic prevents hitting ends
          dragElastic={0}
          onDragStart={() => isDragging.current = true}
          onDragEnd={() => {
            setTimeout(() => {
              isDragging.current = false;
            }, 500);
          }}
        >
          {extendedTestimonials.map((testimonial, idx) => (
            <Card
              key={testimonial.uniqueKey}
              testimonial={testimonial}
              index={idx}
              x={x}
            />
          ))}
        </motion.div>
      </div>

    </div>
  );
}

// Optimized Card — uses pure Framer Motion values, ZERO React state, ZERO getBoundingClientRect
const Card = React.memo(({ testimonial, index, x }: { testimonial: Testimonial & { uniqueKey: string }, index: number, x: MotionValue<number> }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  // We compute the card's distance from the viewport center using:
  // card's visual center = initialOffset + x (the carousel motion value)
  // This avoids getBoundingClientRect entirely.
  const initialOffset = useMotionValue(0);

  const [isMobile, setIsMobile] = useState(false);

  // Measure once on mount + resize (not per-frame!)
  useEffect(() => {
    function measure() {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      // Store the card's initial center position relative to viewport center
      // We subtract the current x value to get the "native" position
      const currentX = x.get();
      const cardCenter = rect.left + rect.width / 2;
      initialOffset.set(cardCenter - currentX);

      // Check for mobile breakpoints to dynamically shift 3D intensity
      setIsMobile(window.innerWidth < 768);
    }
    // Measure after layout settles
    const raf = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
    };
  }, [x, initialOffset]);

  // Derive the card's live distance from viewport center using motion values only
  // cardCenter = initialOffset + x, distance = cardCenter - window.innerWidth / 2
  const centerDistance = useTransform(
    [initialOffset, x] as MotionValue[],
    ([offset, xVal]: number[]) => {
      const windowCenter = typeof window !== "undefined" ? window.innerWidth / 2 : 600;
      return (offset + xVal) - windowCenter;
    }
  );

  // Responsive Input Ranges — Smaller viewports hit the edge much faster, so we tighten the math
  // to make the cards rotate and dip sharply inside a narrower pixel window
  const distanceLimits = isMobile ? [-400, 0, 400] : [-800, 0, 800];

  // 3D concave effect: centered cards pushed back, edge cards brought forward
  // On mobile, we push the center cards further back (-250) and pull edge cards closer (150)
  const zLimits = isMobile ? [150, -250, 150] : [100, -200, 100];
  const z = useTransform(centerDistance, distanceLimits, zLimits);

  // Gentle inward tilt for 3D perspective
  // On mobile, we radically increase the maximum tilt angle (35 deg vs 20 deg)
  const rotLimits = isMobile ? [35, 0, -35] : [20, 0, -20];
  const rotateY = useTransform(centerDistance, distanceLimits, rotLimits);

  // Fade edges — aggressively clip visibility on mobile to prevent cards from overflowing the viewport width
  const opacityInputs = isMobile ? [-500, -250, 0, 250, 500] : [-1000, -600, 0, 600, 1000];
  const opacity = useTransform(centerDistance, opacityInputs, [0, 1, 1, 1, 0]);

  return (
    <motion.div
      ref={cardRef}
      className="flex-shrink-0 w-[280px] md:w-[350px] aspect-[3/4] relative flex items-center justify-center rounded-xl overflow-hidden bg-muted border border-border/20 shadow-xl"
      style={{
        z,
        rotateY,
        opacity,
        transformStyle: "preserve-3d"
      }}
    >
      {testimonial.image ? (
        <img
          src={testimonial.image}
          alt={testimonial.name}
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
      ) : (
        <div
          className="absolute inset-0 p-6 md:p-8 flex flex-col justify-between bg-gradient-to-br from-card to-background text-foreground"
          style={{ transformStyle: "preserve-3d" }}
        >
          <p
            className="text-base md:text-xl font-raela font-medium leading-snug line-clamp-[6]"
            style={{ transform: "translateZ(40px)" }}
          >
            "{testimonial.quote}"
          </p>

          <div
            className="mt-4"
            style={{ transform: "translateZ(25px)" }}
          >
            <p className="font-nohemi font-semibold text-base md:text-lg">{testimonial.name}</p>
            <p className="text-xs md:text-sm text-accent lowercase tracking-wide">{testimonial.role}</p>
          </div>
        </div>
      )}

      {/* Subtle inner shadow overlay to give it physical volume */}
      <div className="absolute inset-0 border border-white/10 rounded-xl pointer-events-none" />
    </motion.div>
  );
});
