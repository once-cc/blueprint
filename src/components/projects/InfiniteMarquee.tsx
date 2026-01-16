import { useRef, useEffect, useState, useCallback, memo } from "react";
import { motion, useMotionValue, animate, useMotionValueEvent } from "framer-motion";
import { useSmoothScroll } from "@/components/providers/SmoothScrollProvider";
import { cn } from "@/lib/utils";

interface InfiniteMarqueeProps {
  children: React.ReactNode;
  direction: "left" | "right";
  speed?: number; // seconds for full loop
  priority?: "high" | "low";
  isPaused?: boolean;
  pauseOnHover?: boolean;
  className?: string;
}

// Memoized marquee component for performance
export const InfiniteMarquee = memo(function InfiniteMarquee({
  children,
  direction,
  speed = 45,
  isPaused = false,
  pauseOnHover = true,
  className = "",
  priority = "high"
}: InfiniteMarqueeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isHoveredLocal, setIsHoveredLocal] = useState(false);

  // Use MotionValue to avoid React re-renders during drag/animation
  const dragOffset = useMotionValue(0);
  const dragStartX = useRef(0);
  const currentDragOffset = useRef(0);
  const animationRef = useRef<any>(null);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Intersection observer to pause when off-screen
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      {
        threshold: 0,
        rootMargin: '400px'
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const { isNavigating } = useSmoothScroll();
  const [isNavigatingLocal, setIsNavigatingLocal] = useState(false);

  const tracksRef = useRef<HTMLDivElement>(null);

  useMotionValueEvent(isNavigating, "change", (latest) => {
    setIsNavigatingLocal(latest);
  });

  // Touch/drag handling
  const handleDragStart = useCallback((clientX: number) => {
    if (animationRef.current) animationRef.current.stop();
    setIsDragging(true);
    dragStartX.current = clientX;
    currentDragOffset.current = dragOffset.get();
  }, [dragOffset]);

  const handleDragMove = useCallback((clientX: number) => {
    if (!isDragging) return;
    const delta = clientX - dragStartX.current;
    dragOffset.set(currentDragOffset.current + delta);
  }, [isDragging, dragOffset]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);

    // Smooth return to normal flow using Framer's physics-driven animate function
    // This is MUCH more efficient than custom RAF + setState
    animationRef.current = animate(dragOffset, 0, {
      type: "spring",
      stiffness: 100,
      damping: 30,
      restDelta: 0.001
    });
  }, [dragOffset]);

  // Mouse events
  const handleMouseDown = useCallback((e: React.MouseEvent) => handleDragStart(e.clientX), [handleDragStart]);
  const handleMouseMove = useCallback((e: React.MouseEvent) => handleDragMove(e.clientX), [handleDragMove]);
  const handleMouseUp = useCallback(() => handleDragEnd(), [handleDragEnd]);

  // Touch events
  const handleTouchStart = useCallback((e: React.TouchEvent) => handleDragStart(e.touches[0].clientX), [handleDragStart]);
  const handleTouchMove = useCallback((e: React.TouchEvent) => handleDragMove(e.touches[0].clientX), [handleDragMove]);
  const handleTouchEnd = useCallback(() => handleDragEnd(), [handleDragEnd]);

  // Class B Motion Governance: All autonomous loops must freeze during active navigation
  // to ensure 'butter-smooth' scroll trust. No modulation, no easing, just a hard freeze.
  const shouldAnimate = isVisible && !isPaused && !isDragging && !prefersReducedMotion && !isNavigatingLocal && !(pauseOnHover && isHoveredLocal);

  const animationClass = direction === "right"
    ? "carousel-marquee-right"
    : "carousel-marquee-left";

  if (prefersReducedMotion) {
    return (
      <div
        ref={containerRef}
        className={`overflow-x-auto scrollbar-hide ${className}`}
        style={{ touchAction: "pan-x" }}
      >
        <div className="flex gap-4 md:gap-5 lg:gap-6">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden cursor-grab active:cursor-grabbing ${className}`}
      style={{
        touchAction: "pan-y",
        contain: 'paint layout style',
        isolation: 'isolate'
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseEnter={() => pauseOnHover && setIsHoveredLocal(true)}
      onMouseLeave={() => {
        setIsHoveredLocal(false);
        if (isDragging) handleDragEnd();
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <motion.div
        ref={tracksRef}
        className={cn(
          "flex gap-4 md:gap-5 lg:gap-6",
          animationClass,
          !shouldAnimate && "carousel-paused",
          priority === "high" && "gpu-accelerated contain-layout"
        )}
        style={{
          ["--carousel-duration" as any]: `${speed}s`,
          x: dragOffset,
          willChange: "transform",
        }}
      >
        {children}
        {children}
        {children}
      </motion.div>
    </div>
  );
});
