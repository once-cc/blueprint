import { useRef, useEffect } from "react";
import { motion, useMotionValue, useTransform, useAnimationFrame, MotionValue } from "framer-motion";
import { testimonials, type Testimonial } from "@/data/testimonials";

// Reduced from 12 to 6 — only need enough cards to fill ~3x viewport width
// for a seamless infinite illusion. 6 × 6 testimonials = 36 cards is plenty.
const MULTIPLIER = 6;
const extendedTestimonials = Array.from({ length: MULTIPLIER }).flatMap((_, idx) =>
  testimonials.map(t => ({ ...t, uniqueKey: `${t.id}-${idx}` }))
);

// Card width + gap constants (must match the CSS below)
const CARD_WIDTH_MD = 350;
const CARD_WIDTH_SM = 280;
const GAP_MD = 32; // gap-8
const GAP_SM = 16; // gap-4

export function TestimonialCarousel() {
  const isDragging = useRef(false);

  // Track continuous horizontal scroll — this is the single source of truth
  const x = useMotionValue(0);

  // Infinite motion loop ticking on every animation frame
  useAnimationFrame((_, delta) => {
    if (!isDragging.current) {
      x.set(x.get() - delta * 0.05);
    }
  });

  return (
    <div className="relative w-full overflow-hidden py-24 bg-transparent select-none">

      {/* 3D Scene Container */}
      <div
        className="flex justify-center items-center relative z-10 w-full"
        style={{ perspective: "1000px" }}
      >
        <motion.div
          className="flex gap-4 md:gap-8 cursor-grab active:cursor-grabbing px-[50vw]"
          style={{ x, transformStyle: "preserve-3d" }}
          drag="x"
          dragConstraints={{ left: -10000, right: 10000 }}
          dragElastic={0.1}
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
function Card({ testimonial, index, x }: { testimonial: Testimonial & { uniqueKey: string }, index: number, x: MotionValue<number> }) {
  const cardRef = useRef<HTMLDivElement>(null);

  // We compute the card's distance from the viewport center using:
  // card's visual center = initialOffset + x (the carousel motion value)
  // This avoids getBoundingClientRect entirely.
  const initialOffset = useMotionValue(0);

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

  // 3D concave effect: centered cards pushed back, edge cards brought forward
  const z = useTransform(centerDistance, [-800, 0, 800], [100, -200, 100]);

  // Gentle inward tilt for 3D perspective
  const rotateY = useTransform(centerDistance, [-800, 0, 800], [20, 0, -20]);

  // Fade edges
  const opacity = useTransform(centerDistance, [-1000, -600, 0, 600, 1000], [0, 1, 1, 1, 0]);

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
}
