import React, { useRef, ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface CinematicChamberProps {
  children: ReactNode;
  height?: string; // e.g., "200vh", "520vh"
  className?: string;
  id?: string;
}

export function CinematicChamber({
  children,
  height = "200vh",
  className = "",
  id,
}: CinematicChamberProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <section
      ref={containerRef}
      id={id}
      className={`cinematic-chamber ${className}`}
      style={{ minHeight: height }}
    >
      <div className="cinematic-sticky">
        {children}
      </div>
    </section>
  );
}

// Depth layer components
interface LayerProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function AtmosphereLayer({ children, className = "", style }: LayerProps) {
  return (
    <div
      className={`layer-atmosphere ${className}`}
      style={{ zIndex: 0, ...style }}
    >
      {children}
      <div className="grain-overlay" />
    </div>
  );
}

export function BackgroundLayer({ children, className = "", style }: LayerProps) {
  return (
    <div
      className={`layer-background ${className}`}
      style={{ zIndex: 10, ...style }}
    >
      {children}
    </div>
  );
}

export function StructuralLayer({ children, className = "", style }: LayerProps) {
  return (
    <div
      className={`layer-structural ${className}`}
      style={{ zIndex: 20, ...style }}
    >
      {children}
    </div>
  );
}

export function TypographyLayer({ children, className = "", style }: LayerProps) {
  return (
    <div
      className={`layer-typography ${className}`}
      style={{ zIndex: 30, ...style }}
    >
      {children}
    </div>
  );
}

export function ForegroundLayer({ children, className = "", style }: LayerProps) {
  return (
    <div
      className={`layer-foreground ${className}`}
      style={{ zIndex: 40, ...style }}
    >
      {children}
    </div>
  );
}

// Motion-enhanced layers with scroll-linked transforms
interface MotionLayerProps extends LayerProps {
  scrollProgress?: any;
}

export function MotionBackgroundLayer({
  children,
  className = "",
  scrollProgress,
}: MotionLayerProps) {
  const y = useTransform(scrollProgress || (() => 0), [0, 1], [-18, 18]);
  const scale = useTransform(scrollProgress || (() => 0), [0, 1], [1.02, 1.06]);

  return (
    <motion.div
      className={`layer-background overflow-hidden ${className}`}
      style={{ zIndex: 10, y, scale }}
    >
      {children}
    </motion.div>
  );
}

export function MotionTypographyLayer({
  children,
  className = "",
  scrollProgress,
}: MotionLayerProps) {
  const y = useTransform(scrollProgress || (() => 0), [0, 0.3, 0.7, 1], [24, 0, 0, -24]);
  const opacity = useTransform(scrollProgress || (() => 0), [0, 0.15, 0.85, 1], [0, 1, 1, 0]);

  return (
    <motion.div
      className={`layer-typography ${className}`}
      style={{ zIndex: 30, y, opacity }}
    >
      {children}
    </motion.div>
  );
}

export function MotionForegroundLayer({
  children,
  className = "",
  scrollProgress,
}: MotionLayerProps) {
  const y = useTransform(scrollProgress || (() => 0), [0, 1], [-28, 28]);

  return (
    <motion.div
      className={`layer-foreground ${className}`}
      style={{ zIndex: 40, y }}
    >
      {children}
    </motion.div>
  );
}
