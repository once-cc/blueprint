import { useRef } from "react";
import { useScroll } from "framer-motion";
import { DepthBandHero } from "./DepthBandHero";
import { AuthorityBand } from "../sections/AuthorityBand";

/**
 * Unified scroll controller for the Hero → Authority transition.
 * Single scroll tracker — all children receive raw progress directly.
 * No spring physics, synced motion across all sections.
 */
export function HeroFounderTransition() {
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Single scroll tracker for the entire transition zone
  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end start"],
  });

  return (
    <div ref={wrapperRef}>
      <DepthBandHero sharedProgress={scrollYProgress} />
      <AuthorityBand sharedProgress={scrollYProgress} />
      {/* Sentinel for nav visibility detection - triggers when AuthorityBand leaves viewport */}
      <div id="nav-reveal-sentinel" className="h-px w-full" aria-hidden="true" />
    </div>
  );
}
