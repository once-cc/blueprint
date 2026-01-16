import React, { ReactNode } from "react";
import { motion, MotionValue, useTransform, useMotionValue } from "framer-motion";

interface TypeRigProps {
  children: ReactNode;
  scrollProgress?: MotionValue<number>;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span" | "div";
  showGhost?: boolean;
  ghostScale?: number;
  ghostOpacity?: number;
  enterRange?: [number, number];
  exitRange?: [number, number];
}

export function TypeRig({
  children,
  scrollProgress,
  className = "",
  as: Component = "div",
  showGhost = true,
  ghostScale = 1.05,
  ghostOpacity = 0.15,
  enterRange = [0, 0.3],
  exitRange = [0.7, 1],
}: TypeRigProps) {
  const fallbackProgress = useMotionValue(0.5);
  const progress = scrollProgress || fallbackProgress;

  const y = useTransform(
    progress,
    [0, enterRange[1], exitRange[0], 1],
    [24, 0, 0, -24]
  );

  const opacity = useTransform(
    progress,
    [0, enterRange[1], exitRange[0], 1],
    [0, 1, 1, 0]
  );

  const blur = useTransform(
    progress,
    [0, enterRange[1], exitRange[0], 1],
    [10, 0, 0, 10]
  );

  const letterSpacing = useTransform(
    progress,
    [0, enterRange[1]],
    ["0.08em", "0em"]
  );

  const filterBlur = useTransform(blur, (v) => (v > 0 ? `blur(${v}px)` : "none"));

  const MotionComponent = motion[Component as keyof typeof motion] as any;

  return (
    <div className="type-rig relative">
      {/* Ghost layer for depth */}
      {showGhost && (
        <div
          className="type-rig-ghost pointer-events-none select-none absolute inset-0"
          style={{
            transform: `scale(${ghostScale}) translateY(-2px)`,
            opacity: ghostOpacity,
            color: "hsl(var(--ghost))",
          }}
          aria-hidden="true"
        >
          {children}
        </div>
      )}

      {/* Main text with motion */}
      <MotionComponent
        className={`type-rig-main relative ${className}`}
        style={{
          y: scrollProgress ? y : 0,
          opacity: scrollProgress ? opacity : 1,
          filter: scrollProgress ? filterBlur : "none",
          letterSpacing: scrollProgress ? letterSpacing : "0em",
        }}
      >
        {children}
      </MotionComponent>
    </div>
  );
}

// Simplified version for static display with just ghost effect
interface StaticTypeRigProps {
  children: ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span" | "div";
  showGhost?: boolean;
  ghostScale?: number;
  ghostOpacity?: number;
}

export function StaticTypeRig({
  children,
  className = "",
  as: Component = "div",
  showGhost = true,
  ghostScale = 1.05,
  ghostOpacity = 0.15,
}: StaticTypeRigProps) {
  return (
    <div className="type-rig relative">
      {showGhost && (
        <div
          className="absolute inset-0 pointer-events-none select-none"
          style={{
            transform: `scale(${ghostScale}) translateY(-2px)`,
            opacity: ghostOpacity,
            color: "hsl(var(--ghost))",
          }}
          aria-hidden="true"
        >
          {children}
        </div>
      )}
      <Component className={`relative ${className}`}>
        {children}
      </Component>
    </div>
  );
}

// Word-by-word staggered reveal - simplified
interface StaggeredTypeProps {
  text: string;
  className?: string;
  delay?: number;
}

export function StaggeredType({
  text,
  className = "",
  delay = 0,
}: StaggeredTypeProps) {
  const words = text.split(" ");

  return (
    <span className={`inline-block ${className}`}>
      {words.map((word, index) => (
        <motion.span
          key={index}
          className="inline-block mr-[0.3em]"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: delay + index * 0.05,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}
