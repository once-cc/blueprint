/**
 * ServicesViewportBackdrop - Full-viewport editorial backdrop plate
 * Slides in from the left when Services section enters viewport
 * Fixed position for true 100vw x 100vh coverage
 */

import { memo } from "react";
import { motion, MotionValue, useTransform } from "framer-motion";
import { EditorialGridLines } from "@/components/ui/EditorialGridLines";

interface ServicesViewportBackdropProps {
  /** Scroll progress from 0-1 tracking the Services section */
  scrollProgress: MotionValue<number>;
}

export const ServicesViewportBackdrop = memo(function ServicesViewportBackdrop({
  scrollProgress
}: ServicesViewportBackdropProps) {
  // Entrance animation: slides in from left as user enters Services section
  // Progress 0.02-0.08 = slide in from left
  // Progress 0.08-0.92 = fully visible (stable)
  // Progress 0.92-0.98 = slide out to left
  const translateX = useTransform(
    scrollProgress,
    [0, 0.08, 0.14, 0.96, 0.995, 1],
    ["-100%", "-100%", "0%", "0%", "-100%", "-100%"]
  );

  // Opacity ramp during entrance/exit
  // Exit is delayed (0.98) and softened (fades to 0.1) for peaceful handoff into Framework
  const opacity = useTransform(
    scrollProgress,
    [0, 0.08, 0.14, 0.98, 1],
    [0, 0, 1, 1, 0.1]
  );

  return (
    <motion.div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{
        x: translateX,
        opacity,
        zIndex: 1, // Authoritative background layer
        willChange: "transform, opacity",
      }}
      aria-hidden="true"
    >
      {/* Solid background plate - uses sidebar color token */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: 'hsl(var(--sidebar-background))'
        }}
      />

      {/* Subtle vignette + texture combined into single layer */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.12) 100%),
            linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 40px 40px, 40px 40px'
        }}
      />

      {/* Editorial grid overlay */}
      <EditorialGridLines
        showHorizontalTop={false}
        showHorizontalCenter={false}
        showHorizontalBottom={false}
      />

      {/* Top edge fade - blends into content above */}
      <div
        className="absolute top-0 left-0 right-0 h-32"
        style={{
          background: 'linear-gradient(to bottom, transparent 0%, hsl(var(--sidebar-background)) 100%)'
        }}
      />

      {/* Bottom edge fade - blends into content below */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32"
        style={{
          background: 'linear-gradient(to top, transparent 0%, hsl(var(--sidebar-background)) 100%)'
        }}
      />
    </motion.div>
  );
});
