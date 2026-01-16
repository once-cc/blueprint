import { useState, useEffect, useRef, useCallback, memo } from "react";
import { motion, useMotionValueEvent } from "framer-motion";
import { useSmoothScroll } from "@/components/providers/SmoothScrollProvider";
import type { CarouselProject } from "@/data/projectCarouselData";

interface CarouselProjectCardProps {
  project: CarouselProject;
  variant?: 'supporting' | 'hero' | 'far-background';
}

// Helper functions moved outside component to reduce closure overhead
const getCardWidth = (variant: string) => {
  if (variant === 'hero') return "clamp(320px, 36vw, 460px)";
  if (variant === 'far-background') return "clamp(255px, 27vw, 350px)";
  return "clamp(260px, 28vw, 360px)";
};

// Structural border — ALWAYS VISIBLE (defines TV screen bezel)
const getStructuralBorder = (variant: string) => {
  if (variant === 'hero') {
    return `
      inset 0 0 0 2px hsl(var(--sidebar-border)),
      inset 0 4px 0 0 rgba(255,255,255,0.30),
      inset 0 -4px 0 0 rgba(0,0,0,0.50)
    `;
  }
  if (variant === 'far-background') {
    return `
      inset 0 0 0 1px hsl(var(--sidebar-border)),
      inset 0 2px 0 0 rgba(255,255,255,0.15),
      inset 0 -2px 0 0 rgba(0,0,0,0.28)
    `;
  }
  return `
    inset 0 0 0 1.5px hsl(var(--sidebar-border)),
    inset 0 3px 0 0 rgba(255,255,255,0.22),
    inset 0 -3px 0 0 rgba(0,0,0,0.38)
  `;
};

// Drop shadow — FLATTENS DURING SCROLL (performance optimization)
const getDropShadow = (variant: string, isNavigating: boolean = false) => {
  // During high-velocity navigation, return a single flattened shadow to reduce GPU overdraw
  if (isNavigating) {
    if (variant === 'hero') return '0 20px 80px -8px rgba(0,0,0,0.75)';
    if (variant === 'far-background') return '0 8px 36px -4px rgba(0,0,0,0.50)';
    return '0 14px 56px -6px rgba(0,0,0,0.60)';
  }

  if (variant === 'hero') {
    return `
      0 20px 80px -8px rgba(0,0,0,0.75),
      0 10px 40px -4px rgba(0,0,0,0.55),
      0 5px 15px rgba(0,0,0,0.35)
    `;
  }
  if (variant === 'far-background') {
    return '0 8px 36px -4px rgba(0,0,0,0.50)';
  }
  return `
    0 14px 56px -6px rgba(0,0,0,0.60),
    0 8px 28px -4px rgba(0,0,0,0.45)
  `;
};

// Inner lip shadow — ALWAYS VISIBLE (architectural depth illusion)
const getInnerLipShadow = (variant: string) => {
  if (variant === 'hero') return 'inset 0 0 0 2px rgba(255,255,255,0.18), inset 0 3px 12px rgba(0,0,0,0.22)';
  if (variant === 'far-background') return 'inset 0 0 0 1px rgba(255,255,255,0.08), inset 0 1.5px 4px rgba(0,0,0,0.12)';
  return 'inset 0 0 0 1.5px rgba(255,255,255,0.12), inset 0 2px 8px rgba(0,0,0,0.16)';
};

const getImageFilter = (variant: string, showColor: boolean) => {
  if (showColor) return "grayscale(0%)";
  if (variant === 'hero') return "grayscale(100%) brightness(1.03) contrast(1.05)";
  if (variant === 'far-background') return "grayscale(100%) brightness(0.82) contrast(0.95) saturate(0.85)";
  return "grayscale(100%) brightness(0.86) contrast(0.98)";
};

const getOverlayOpacity = (variant: string, showColor: boolean) => {
  if (showColor) return 0.35;
  if (variant === 'hero') return 0.4;
  if (variant === 'far-background') return 0.78;
  return 0.72;
};

// Memoized to prevent unnecessary re-renders during scroll
export const CarouselProjectCard = memo(function CarouselProjectCard({
  project,
  variant = 'supporting',
}: CarouselProjectCardProps) {
  const cardRef = useRef<HTMLElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Desynchronized start delay for ambient cycling
  const startDelay = useRef(Math.random() * 2000);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Visibility detection for pausing offscreen animations
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        rootMargin: '400px',
        threshold: 0
      }
    );

    observer.observe(card);
    return () => observer.disconnect();
  }, []);

  const { isNavigating } = useSmoothScroll();
  const [isNavigatingLocal, setIsNavigatingLocal] = useState(false);

  useMotionValueEvent(isNavigating, "change", (latest) => {
    setIsNavigatingLocal(latest);
  });

  // Image cycling logic
  const cycleImage = useCallback(() => {
    if (project.images.length <= 1) return;

    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentImageIndex((prev) => (prev + 1) % project.images.length);
      setIsTransitioning(false);
    }, 300); // Cross-fade duration
  }, [project.images.length]);

  useEffect(() => {
    // Don't cycle if hovered, not visible, or navigating
    if (isHovered || !isVisible || isNavigatingLocal) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Start cycling with desynchronized delay
    const startCycling = () => {
      intervalRef.current = setInterval(cycleImage, 4500 + Math.random() * 1500); // 4-6s
    };

    const delayTimeout = setTimeout(startCycling, startDelay.current);

    return () => {
      clearTimeout(delayTimeout);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isHovered, isVisible, cycleImage]);

  const showColor = isHovered;

  // Determine if animations should be paused (offscreen, reduced motion, or navigating)
  const shouldPauseAnimations = !isVisible || prefersReducedMotion || isNavigatingLocal;

  return (
    <article
      ref={cardRef}
      className="relative flex-shrink-0 group cursor-pointer select-none"
      style={{
        width: getCardWidth(variant),
        // GPU acceleration hints
        contain: 'layout style paint',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      tabIndex={0}
      role="article"
      aria-label={`${project.title} - ${project.category}`}
    >
      {/* Image Container - Architectural panel construction */}
      <div
        className="relative aspect-[4/3] overflow-hidden rounded-sm bg-secondary/20"
        style={{
          boxShadow: `${getStructuralBorder(variant)}, ${getDropShadow(variant, isNavigatingLocal)}`
        }}
      >
        {/* Inner edge lip - architectural depth illusion */}
        <div
          className="absolute inset-[2px] rounded-[1px] pointer-events-none z-10"
          style={{
            boxShadow: getInnerLipShadow(variant),
            contain: 'paint'
          }}
        />
        {/* Stacked images for cross-fade */}
        {project.images.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={index === currentImageIndex ? project.title : ""}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover transition-all duration-300 ease-out"
            style={{
              opacity: index === currentImageIndex ? 1 : 0,
              filter: getImageFilter(variant, showColor),
              transform: showColor ? "scale(1.015)" : "scale(1)",
            }}
            draggable={false}
          />
        ))}

        {/* Subtle overlay for text legibility - architectural depth reinforcement */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-background/60 via-background/10 to-transparent transition-opacity duration-300"
          style={{ opacity: getOverlayOpacity(variant, showColor) }}
        />


        {/* ═══════════════════════════════════════════════════════════
            CRT SCANLINE OVERLAY - Horizontal lines mimicking old monitors
            Only rendered when visible for performance
            ═══════════════════════════════════════════════════════════ */}

        {/* ═══════════════════════════════════════════════════════════
            CRT SCANLINE OVERLAY - Horizontal lines mimicking old monitors
            Always rendered to avoid mount/unmount jank.
            Paused and hidden when offscreen.
            ═══════════════════════════════════════════════════════════ */}
        {!prefersReducedMotion && (
          <div
            className="absolute inset-0 pointer-events-none z-[11] rounded-sm animate-scanline-flicker"
            style={{
              backgroundImage: `repeating-linear-gradient(
                0deg,
                transparent,
                transparent 2px,
                rgba(0, 0, 0, 0.03) 2px,
                rgba(0, 0, 0, 0.03) 4px
              )`,
              backgroundSize: '100% 4px',
              opacity: isVisible ? 1 : 0,
              animationPlayState: shouldPauseAnimations ? 'paused' : 'running'
            }}
          />
        )}

        {/* Project Number */}
        <div className="absolute top-4 left-4 text-foreground/70 font-mono text-xs tracking-wide">
          [{project.id}]
        </div>

        {/* Year badge */}
        <div className="absolute top-4 right-4 text-foreground/60 font-mono text-xs">
          {project.year}
        </div>

        {/* Title overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.span
            className="text-foreground/90 font-display text-lg md:text-xl font-medium tracking-wide text-center px-4"
            animate={{
              opacity: showColor ? 0.95 : 0.85,
              y: showColor ? -2 : 0
            }}
            transition={{ duration: 0.25 }}
          >
            {project.title}
          </motion.span>
        </div>

        {/* Hover info reveal */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background/95 via-background/80 to-transparent"
          initial={{ opacity: 0, y: 10 }}
          animate={{
            opacity: showColor ? 1 : 0,
            y: showColor ? 0 : 10
          }}
          transition={{ duration: 0.25 }}
        >
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            {project.category}
          </p>
          <p className="text-sm text-foreground/80 line-clamp-1">
            {project.outcome}
          </p>
        </motion.div>

        {/* Focus ring for accessibility */}
        <div className="absolute inset-0 rounded-sm ring-2 ring-primary/0 group-focus-visible:ring-primary/50 transition-all" />
      </div>
    </article>
  );
}, (prevProps, nextProps) => {
  // Custom comparison - only re-render if these specific props change
  return (
    prevProps.project.id === nextProps.project.id &&
    prevProps.variant === nextProps.variant
  );
});
