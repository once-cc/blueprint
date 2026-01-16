import { useScroll, useTransform, MotionValue, useMotionValue } from "framer-motion";
import { RefObject, useMemo } from "react";

interface ScrollProgressOptions {
  target?: RefObject<HTMLElement>;
  offset?: [string, string];
}

export function useScrollProgress(options: ScrollProgressOptions = {}) {
  const { target, offset = ["start start", "end end"] } = options;

  const { scrollYProgress } = useScroll({
    target,
    offset: offset as any,
  });

  return scrollYProgress;
}

// Deterministic checkpoint system
interface Checkpoint {
  progress: number;
  name: string;
}

export function useCheckpoints(
  scrollProgress: MotionValue<number>,
  checkpoints: Checkpoint[]
) {
  const sortedCheckpoints = useMemo(
    () => [...checkpoints].sort((a, b) => a.progress - b.progress),
    [checkpoints]
  );

  // Create opacity transforms for each checkpoint
  const opacityTransforms = useMemo(() => {
    return sortedCheckpoints.map((checkpoint, index) => {
      const nextProgress =
        index < sortedCheckpoints.length - 1
          ? sortedCheckpoints[index + 1].progress
          : 1;

      // 8-10% overlap window
      const overlapWindow = 0.08;
      const enterStart = Math.max(0, checkpoint.progress - overlapWindow);
      const enterEnd = checkpoint.progress;
      const exitStart = checkpoint.progress + (nextProgress - checkpoint.progress) * 0.7;
      const exitEnd = nextProgress;

      return {
        name: checkpoint.name,
        progress: checkpoint.progress,
        inputRange: [enterStart, enterEnd, exitStart, exitEnd],
        outputRange: [0, 1, 1, 0],
      };
    });
  }, [sortedCheckpoints]);

  return opacityTransforms;
}

// TypeRig animation values
export function useTypeRigMotion(scrollProgress: MotionValue<number>) {
  const y = useTransform(
    scrollProgress,
    [0, 0.3, 0.7, 1],
    [24, 0, 0, -24]
  );

  const opacity = useTransform(
    scrollProgress,
    [0, 0.2, 0.8, 1],
    [0, 1, 1, 0]
  );

  const blur = useTransform(
    scrollProgress,
    [0, 0.25, 0.75, 1],
    [10, 0, 0, 10]
  );

  const tracking = useTransform(
    scrollProgress,
    [0, 0.3, 0.7, 1],
    [0.08, 0, 0, 0.08]
  );

  return { y, opacity, blur, tracking };
}
