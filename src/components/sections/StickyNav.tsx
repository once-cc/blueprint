import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { FullscreenMenu } from "@/components/navigation/FullscreenMenu";
import { AnimatedHamburger } from "@/components/navigation/AnimatedHamburger";
import { VideoLogo } from "@/components/ui/VideoLogo";
import { useChamberGate } from "@/hooks/useChamberGate";


/**
 * Sticky navigation that appears after scrolling past the FounderSection.
 * Uses Intersection Observer on a sentinel element for precise, responsive detection.
 */
export function StickyNav() {
  const [isVisible, setIsVisible] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { triggerGateToHome } = useChamberGate();

  useEffect(() => {
    const sentinel = document.getElementById("nav-reveal-sentinel");
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Only show nav if sentinel is NOT intersecting AND is ABOVE the viewport
        // (meaning user has scrolled past it, not that we haven't reached it yet)
        const isPastSentinel = !entry.isIntersecting && entry.boundingClientRect.top < 0;
        setIsVisible(isPastSentinel);
      },
      { 
        root: null, 
        rootMargin: "0px", 
        threshold: 0 
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const handleLogoClick = useCallback(() => {
    triggerGateToHome();
  }, [triggerGateToHome]);

  return (
    <>
      <motion.div
        className="fixed inset-x-0 top-0 z-[100] px-8 py-6 bg-background/80 backdrop-blur-md border-b border-border/10"
        initial={{ y: "-100%", opacity: 0 }}
        animate={{
          y: isVisible ? 0 : "-100%",
          opacity: isVisible ? 1 : 0,
        }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <nav className="flex items-center justify-between max-w-7xl mx-auto">
          <button 
            onClick={handleLogoClick}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            aria-label="Scroll to top"
          >
            <VideoLogo size="sm" />
            <span className="text-muted-foreground text-xs">®</span>
          </button>

          <div className="hidden md:flex items-center gap-8 text-sm font-display uppercase tracking-wider text-muted-foreground">
            <span>AOTEAROA (NZ)</span>
            <span>
              {new Date().toLocaleTimeString("en-NZ", {
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "Pacific/Auckland",
              })}
            </span>
          </div>

          <div className="flex items-center gap-6">
            <AnimatedHamburger 
              isOpen={isMenuOpen}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            />
          </div>
        </nav>
      </motion.div>

      <AnimatePresence>
        {isMenuOpen && (
          <FullscreenMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
}
