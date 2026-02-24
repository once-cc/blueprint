import { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, animate, PanInfo } from "framer-motion";
import { testimonials } from "@/data/testimonials";
import { TestimonialCard } from "./TestimonialCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function TestimonialCarousel() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Carousel Physics State
  // We have 6 testimonials. 360 / 6 = 60 degrees.
  const theta = 360 / testimonials.length;

  // A larger radius pushes the cards further out from the center OF THE CYLINDER.
  // To keep the *front* card exactly at scale 1, we push the cylinder itself back by the same amount.
  const CYLINDER_RADIUS = 850;

  const rotation = useMotionValue(0);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    return rotation.onChange((val) => {
      const normalized = ((val % 360) + 360) % 360;
      let closest = Math.round((360 - normalized) / theta) % testimonials.length;
      if (closest < 0) closest += testimonials.length;
      setActiveIndex(closest);
    });
  }, [rotation, theta]);

  const snapToDegree = (targetRotation: number) => {
    animate(rotation, targetRotation, {
      type: "spring",
      stiffness: 150,
      damping: 25,
      mass: 1
    });
  };

  const handlePanEnd = (_e: any, info: PanInfo) => {
    const currentRot = rotation.get();

    // Convert swipe velocity to momentum logic. 
    // Faster swipe = spins further before snapping.
    const velocityFactor = info.velocity.x * 0.08;
    const targetWithMomentum = currentRot + velocityFactor;

    // Find nearest natural resting face
    const nearestFace = Math.round(targetWithMomentum / theta) * theta;
    snapToDegree(nearestFace);
  };

  const spinCarousel = (direction: -1 | 1) => {
    const currentRot = rotation.get();
    const roundedCurrentRot = Math.round(currentRot / theta) * theta;
    const nextRot = roundedCurrentRot + (direction * theta);
    snapToDegree(nextRot);
  };

  const handleCardClick = (index: number) => {
    if (index === activeIndex) return;

    const currentRot = rotation.get();
    const currentNormalized = ((currentRot % 360) + 360) % 360;
    const targetNormalized = (360 - (index * theta)) % 360;

    let diff = targetNormalized - currentNormalized;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;

    snapToDegree(currentRot + diff);
  };

  return (
    <div className="relative w-full overflow-hidden py-16 bg-background">

      {/* Background Gradient Fades (Z-index high to mask cylinder clipping at edges) */}
      <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-background to-transparent z-20 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-background to-transparent z-20 pointer-events-none" />

      {/* Navigation Controls */}
      <button
        onClick={() => spinCarousel(1)}
        className="absolute left-4 md:left-12 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-card border border-border/50 flex items-center justify-center hover:border-accent hover:text-accent transition-colors shadow-lg"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={() => spinCarousel(-1)}
        className="absolute right-4 md:right-12 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-card border border-border/50 flex items-center justify-center hover:border-accent hover:text-accent transition-colors shadow-lg"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* 3D Scene */}
      <div
        ref={containerRef}
        className="flex justify-center items-center h-[500px] relative z-10 touch-none"
        style={{ perspective: "1000px" }}
      >
        {/* Invisible Pan Detector 
            Takes up entire scene, captures drag without physically moving.
            We use onPan instead of drag="x" so it doesn't slide off screen. */}
        <motion.div
          className="absolute inset-0 z-20 cursor-grab active:cursor-grabbing"
          onPan={(_e, info) => {
            const currentRot = rotation.get();
            // Map physical pixel drag to rotation degrees. 
            rotation.set(currentRot + info.delta.x * 0.2);
          }}
          onPanEnd={handlePanEnd}
        />

        {/* The Rotatable Cylinder 
            Pushed back mathematically by -CYLINDER_RADIUS so the active front card sits naturally at Z=0 */}
        <motion.div
          className="relative flex justify-center items-center pointer-events-none"
          style={{
            rotateY: rotation,
            z: -CYLINDER_RADIUS,
            transformStyle: "preserve-3d"
          }}
        >
          {testimonials.map((testimonial, idx) => {
            const itemRotationY = idx * theta;

            return (
              <motion.div
                key={testimonial.id}
                className="absolute flex justify-center items-center"
                style={{
                  width: "350px",
                  height: "400px",
                  // Position card around the cylinder perimeter
                  transform: `rotateY(${itemRotationY}deg) translateZ(${CYLINDER_RADIUS}px)`,
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden"
                }}
              >
                {/* Re-enable pointer events so cards beneath the pan-layer can still be clicked */}
                <div className="w-full h-full relative pointer-events-auto z-30">
                  <TestimonialCard
                    testimonial={testimonial}
                    onClick={() => handleCardClick(idx)}
                    isActive={activeIndex === idx}
                  />
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </div>
  );
}
