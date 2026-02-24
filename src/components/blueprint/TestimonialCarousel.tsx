import { useRef, useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { testimonials, type Testimonial } from "@/data/testimonials";

// Number of duplicate sets to ensure smooth infinite sweeping
const MULTIPLIER = 3;
const extendedTestimonials = Array.from({ length: MULTIPLIER }).flatMap((_, idx) =>
  testimonials.map(t => ({ ...t, uniqueKey: `${t.id}-${idx}` }))
);

export function TestimonialCarousel() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Track continuous horizontal scroll
  const x = useMotionValue(0);
  // Add a spring to smooth out the dragging and snapping
  const animatedX = useSpring(x, { stiffness: 400, damping: 40 });

  return (
    <div className="relative w-full overflow-hidden py-24 bg-background select-none">

      {/* Background Gradient Fades to mask edges smoothly */}
      <div className="absolute left-0 top-0 bottom-0 w-24 md:w-64 bg-gradient-to-r from-background to-transparent z-20 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 md:w-64 bg-gradient-to-l from-background to-transparent z-20 pointer-events-none" />

      {/* 3D Scene Container */}
      <div
        ref={containerRef}
        className="flex justify-center items-center relative z-10 w-full"
        style={{ perspective: "1000px" }}
      >
        <motion.div
          className="flex gap-4 md:gap-8 cursor-grab active:cursor-grabbing px-[50vw]" // Padding ensures cards can reach center
          style={{ x: animatedX, transformStyle: "preserve-3d" }}
          drag="x"
          dragConstraints={{ left: -3000, right: 3000 }} // Loose constraints, ideally infinite
          dragElastic={0.1}
        >
          {extendedTestimonials.map((testimonial, idx) => (
            <Card
              key={testimonial.uniqueKey}
              testimonial={testimonial}
              index={idx}
              x={animatedX}
            />
          ))}
        </motion.div>
      </div>

    </div>
  );
}

// Extract Card to its own component so it can track its individual position
function Card({ testimonial, x }: { testimonial: Testimonial & { uniqueKey: string }, index: number, x: any }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [centerDistance, setCenterDistance] = useState(0);

  // Track global X motion and calculate this specific card's distance from the absolute viewport center
  useEffect(() => {
    return x.onChange(() => {
      if (!cardRef.current) return;
      // Get card's current bounding box on screen
      const rect = cardRef.current.getBoundingClientRect();
      const cardCenter = rect.left + rect.width / 2;
      const windowCenter = window.innerWidth / 2;
      // Distance in pixels from the absolute screen center
      setCenterDistance(cardCenter - windowCenter);
    });
  }, [x]);

  // Create a local motion value that updates alongside state, 
  // to drive smooth Framer useTransforms
  const distanceMotionValue = useMotionValue(0);
  useEffect(() => {
    distanceMotionValue.set(centerDistance);
  }, [centerDistance, distanceMotionValue]);

  // If perfectly centered (0), z is pushed back slightly (-200px). If far left or right (±800px), brought forward gently (100px)
  // This creates the requested subtle concave effect
  const z = useTransform(distanceMotionValue, [-800, 0, 800], [100, -200, 100]);

  // Smooth, gentle inward tilt: far left (-800px) tilts right (-20deg). Far right (800px), tilts left (20deg).
  // CSS 3D rotateY works clockwise viewing from top-down. 
  const rotateY = useTransform(distanceMotionValue, [-800, 0, 800], [-20, 0, 20]);

  // Fade out cards as they get to the absolute edges
  const opacity = useTransform(distanceMotionValue, [-800, -500, 0, 500, 800], [0, 0.8, 1, 0.8, 0]);

  return (
    <motion.div
      ref={cardRef}
      className="flex-shrink-0 w-[280px] md:w-[350px] aspect-[4/5] md:aspect-square relative flex items-center justify-center rounded-3xl overflow-hidden bg-muted border border-border/20 shadow-xl"
      style={{
        z,
        rotateY,
        opacity,
        transformStyle: "preserve-3d"
      }}
    >
      {/* The Reference image specifically mentions portrait images, clean and minimal */}
      {testimonial.image ? (
        <img
          src={testimonial.image}
          alt={testimonial.name}
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
      ) : (
        // Fallback minimal text design if no image is present, staying faithful to the reference vibe
        <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-between bg-gradient-to-br from-card to-background text-foreground">
          <p className="text-base md:text-xl font-raela font-medium leading-snug line-clamp-[6]">
            "{testimonial.quote}"
          </p>

          <div className="mt-4">
            <p className="font-nohemi font-semibold text-base md:text-lg">{testimonial.name}</p>
            <p className="text-xs md:text-sm text-accent lowercase tracking-wide">{testimonial.role}</p>
          </div>
        </div>
      )}

      {/* Subtle inner shadow overlay to give it physical volume */}
      <div className="absolute inset-0 border border-white/10 rounded-3xl pointer-events-none" />
    </motion.div>
  );
}
