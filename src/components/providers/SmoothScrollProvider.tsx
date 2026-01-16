import { createContext, useContext, useEffect, useRef, ReactNode, useState } from 'react';
import Lenis from 'lenis';
import { motion, useScroll, MotionValue, useMotionValue } from 'framer-motion';

interface SmoothScrollContextType {
  lenis: Lenis | null;
  isReady: boolean;
  enabled: boolean;
  scrollY: MotionValue<number>;
  scrollYProgress: MotionValue<number>;
  isNavigating: MotionValue<boolean>;
  scrollVelocity: MotionValue<number>;
  scrollTo: (target: any, options?: any) => void;
}

const SmoothScrollContext = createContext<SmoothScrollContextType | null>(null);

export const useSmoothScroll = (): SmoothScrollContextType => {
  const context = useContext(SmoothScrollContext);

  // Hooks must be called unconditionally
  const fallbackScrollY = useMotionValue(0);
  const fallbackScrollYProgress = useMotionValue(0);
  const fallbackIsNavigating = useMotionValue(false);
  const fallbackScrollVelocity = useMotionValue(0);

  if (!context) {
    return {
      lenis: null,
      isReady: false,
      enabled: false,
      scrollY: fallbackScrollY,
      scrollYProgress: fallbackScrollYProgress,
      isNavigating: fallbackIsNavigating,
      scrollVelocity: fallbackScrollVelocity,
      scrollTo: () => { }
    };
  }

  return context;
};

interface SmoothScrollProviderProps {
  children: ReactNode;
  enabled?: boolean;
}

export function SmoothScrollProvider({ children, enabled = true }: SmoothScrollProviderProps) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Refs for internal state tracking
  const rafIdRef = useRef<number | null>(null);
  const isSignaledRef = useRef(false);

  // Global Motion Governance: track velocity intent for Class B motion freezing
  const isNavigating = useMotionValue(false);
  const scrollVelocity = useMotionValue(0);

  // Global Scroll Authority - Sampled once at the root
  const { scrollY, scrollYProgress } = useScroll();

  const scrollTo = (target: any, options?: any) => {
    lenis?.scrollTo(target, options);
  };

  useEffect(() => {
    if (!enabled) {
      setIsReady(false);
      isSignaledRef.current = false;
      return;
    }

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsReady(true);
      isSignaledRef.current = true;
      return;
    }

    let lenisInstance: Lenis | null = null;

    try {
      // Initialize Lenis with heavy inertial settings for cinematic momentum
      lenisInstance = new Lenis({
        lerp: 0.1,
        duration: 1.5,
        smoothWheel: true,
        wheelMultiplier: 0.9,
        touchMultiplier: 1.5,
        infinite: false,
        orientation: 'vertical',
        gestureOrientation: 'vertical',
      });

      setLenis(lenisInstance);

      // Single-Tick Ownership: Driving Lenis strictly via RAF
      function raf(time: number) {
        if (!lenisInstance) return;
        lenisInstance.raf(time);

        // Update navigation state based on velocity threshold (0.5px/ms)
        const velocity = Math.abs(lenisInstance.velocity);
        scrollVelocity.set(lenisInstance.velocity);

        if (isNavigating.get() !== (velocity > 0.5)) {
          isNavigating.set(velocity > 0.5);
        }

        rafIdRef.current = requestAnimationFrame(raf);

        if (!isSignaledRef.current) {
          isSignaledRef.current = true;
          setIsReady(true);
        }
      }

      rafIdRef.current = requestAnimationFrame(raf);
    } catch (error) {
      setIsReady(true);
      isSignaledRef.current = true;
    }

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      if (lenisInstance) {
        lenisInstance.destroy();
      }
      setLenis(null);
      setIsReady(false);
      isSignaledRef.current = false;
    };
  }, [enabled]);

  return (
    <SmoothScrollContext.Provider value={{ lenis, isReady, enabled, scrollY, scrollYProgress, isNavigating, scrollVelocity, scrollTo }}>
      {children}
    </SmoothScrollContext.Provider>
  );
}
