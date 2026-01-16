import React from "react";
import { motion, MotionValue, useTransform } from "framer-motion";

interface ScrollIndicatorProps {
  scrollProgress: MotionValue<number>;
  visible?: boolean;
  className?: string;
}

export function ScrollIndicator({
  scrollProgress,
  visible = true,
  className = "",
}: ScrollIndicatorProps) {
  const scaleY = useTransform(scrollProgress, [0, 1], [0, 1]);

  if (!visible) return null;

  return (
    <div className={`scroll-indicator ${className}`}>
      <motion.div
        className="scroll-indicator-progress h-full"
        style={{ scaleY, transformOrigin: "top" }}
      />
    </div>
  );
}

// Progress dots for checkpoints
interface CheckpointDotsProps {
  checkpoints: { progress: number; label?: string }[];
  scrollProgress: MotionValue<number>;
  className?: string;
}

export function CheckpointDots({
  checkpoints,
  scrollProgress,
  className = "",
}: CheckpointDotsProps) {
  return (
    <div className={`fixed left-12 top-1/2 -translate-y-1/2 flex flex-col gap-4 ${className}`}>
      {checkpoints.map((checkpoint, index) => {
        const isActive = useTransform(
          scrollProgress,
          [checkpoint.progress - 0.05, checkpoint.progress + 0.05],
          [0, 1]
        );

        return (
          <motion.div
            key={index}
            className="relative flex items-center gap-3"
          >
            <motion.div
              className="w-2 h-2 rounded-full border border-muted-foreground/40"
              style={{
                backgroundColor: useTransform(
                  isActive,
                  [0, 1],
                  ["transparent", "hsl(var(--accent))"]
                ),
                borderColor: useTransform(
                  isActive,
                  [0, 1],
                  ["hsl(var(--muted-foreground) / 0.4)", "hsl(var(--accent))"]
                ),
              }}
            />
            {checkpoint.label && (
              <motion.span
                className="text-xs text-muted-foreground font-display uppercase tracking-wider"
                style={{
                  opacity: useTransform(isActive, [0, 1], [0.3, 1]),
                }}
              >
                {checkpoint.label}
              </motion.span>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
