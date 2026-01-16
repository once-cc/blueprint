import React, { useRef, useState, useEffect } from "react";
import { motion, useTransform, MotionValue, AnimatePresence, useMotionValueEvent } from "framer-motion";
import { useSmoothScroll } from "@/components/providers/SmoothScrollProvider";
import { Calendar, Star } from "lucide-react";
import { StaticTypeRig } from "../cinematic/TypeRig";
import { FullscreenMenu } from "@/components/navigation/FullscreenMenu";
import { AnimatedHamburger } from "@/components/navigation/AnimatedHamburger";
import profileShot from "@/assets/profileshot.webp";

// Depth band assets - new cinematic layers
import L5BGHero from "@/assets/L5-BGHero.mp4";
import L4Mountain from "@/assets/L4-Mountain-Full.webp";
import L3Ridge from "@/assets/L3-Ridge.webp";
import L2Dune from "@/assets/L2-Dune.webp";

// ═══════════════════════════════════════════════════════════════════════════
// CAPACITY INDICATOR COMPONENT
// 5-bar system showing monthly client capacity with cinematic stagger animation
// ═══════════════════════════════════════════════════════════════════════════
function CapacityIndicator({
  filledSlots = 1,
  totalSlots = 5,
  isNavigating = false
}: {
  filledSlots?: number;
  totalSlots?: number;
  isNavigating?: boolean;
}) {
  const availableSlots = totalSlots - filledSlots;
  return <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 bg-background/90 backdrop-blur-sm px-1.5 py-1 rounded-sm">
    <div className="flex items-center gap-[3px]">
      {Array.from({
        length: totalSlots
      }).map((_, index) => {
        const isFilled = index < filledSlots;
        const availableIndex = index - filledSlots; // 0-indexed within available bars

        return <div key={index} className="w-[3px] h-2.5 rounded-[1px]" style={{
          backgroundColor: isFilled ? "hsl(var(--accent))" : "hsl(var(--accent) / 0.25)",
          animation: isFilled ? "none" : `capacityBlink 3s ease-in-out infinite`,
          animationDelay: isFilled ? "0s" : `${availableIndex * 0.4}s`,
          animationPlayState: isNavigating ? 'paused' : 'running'
        }} />;
      })}
    </div>
    <span className="text-[8px] font-display text-foreground ml-0.5">
      {availableSlots} {availableSlots === 1 ? "slot" : "slots"} open Jan'26
    </span>
  </div>;
}

// ═══════════════════════════════════════════════════════════════════════════
// REUSABLE DEPTH CONFIGURATION
// Updated for new cinematic parallax chamber
// ═══════════════════════════════════════════════════════════════════════════
export const DEPTH_BANDS = {
  L5: {
    y: [0, 0],
    scale: [1, 1.03]
  },
  // Video - deep, stable
  L4: {
    y: [0, -65],
    scale: [1.05, 1.12]
  },
  // Mountain - deeper terrain
  L3: {
    y: [0, -50],
    scale: [1.1, 1.32]
  },
  // Ridge - mid terrain
  L2: {
    y: [0, -60],
    scale: [1.12, 1.4]
  } // Dune - nearest terrain
} as const;

// ─────────────────────────────────────────────────────────────────────────
// CINEMATIC EASING CURVES
// Slow start → accelerates through mid-scroll → settles as section exits
// Creates natural momentum like a physical camera moving through space
// ─────────────────────────────────────────────────────────────────────────
const PARALLAX_EASE = (p: number) => {
  // Ease-in-out cubic: gentle start, builds momentum, settles smoothly
  return p < 0.5 ? 4 * p * p * p // Cubic ease-in (slow start)
    : 1 - Math.pow(-2 * p + 2, 3) / 2; // Cubic ease-out (smooth settle)
};
const CONTENT_EASE = (p: number) => {
  // Ease-in-out quad: even slower start for elegant content movement
  return p < 0.5 ? 2 * p * p // Quadratic ease-in
    : 1 - Math.pow(-2 * p + 2, 2) / 2; // Quadratic ease-out
};

// Linear easing - consistent speed throughout scroll (no acceleration/deceleration)
const LINEAR_EASE = (p: number) => p;
export type DepthBandKey = keyof typeof DEPTH_BANDS;

// ═══════════════════════════════════════════════════════════════════════════
// DEPTH BAND HERO COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
interface DepthBandHeroProps {
  sharedProgress: MotionValue<number>;
}
export function DepthBandHero({
  sharedProgress
}: DepthBandHeroProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { isNavigating } = useSmoothScroll();
  const [isNavigatingLocal, setIsNavigatingLocal] = useState(false);

  useMotionValueEvent(isNavigating, "change", (latest) => {
    setIsNavigatingLocal(latest);
  });

  // Class B' Isolation: background video is a persistent spectator
  // and must not know scroll exists. Continuous playback yields trust.

  // Map shared progress to hero range (0-0.5 of wrapper = hero zone)
  const scrollYProgress = useTransform(sharedProgress, [0, 0.5], [0, 1], { clamp: true });



  // ─────────────────────────────────────────────────────────────────────────
  // L5 - Video Background (deepest, subtle scale only)
  // ─────────────────────────────────────────────────────────────────────────
  const l5Scale = useTransform(scrollYProgress, [0, 1], [DEPTH_BANDS.L5.scale[0], DEPTH_BANDS.L5.scale[1]]);

  // ─────────────────────────────────────────────────────────────────────────
  // L4 - Mountain (Y + scale only, no X-axis)
  // ─────────────────────────────────────────────────────────────────────────
  const l4Y = useTransform(scrollYProgress, [0, 1], ["0%", `${DEPTH_BANDS.L4.y[1]}%`]);
  const l4Scale = useTransform(scrollYProgress, [0, 1], [DEPTH_BANDS.L4.scale[0], DEPTH_BANDS.L4.scale[1]]);

  // ─────────────────────────────────────────────────────────────────────────
  // L3 - Ridge (Y + scale only, no X-axis)
  // ─────────────────────────────────────────────────────────────────────────
  const l3Y = useTransform(scrollYProgress, [0, 1], ["0%", `${DEPTH_BANDS.L3.y[1]}%`]);
  const l3Scale = useTransform(scrollYProgress, [0, 1], [DEPTH_BANDS.L3.scale[0], DEPTH_BANDS.L3.scale[1]]);

  // ─────────────────────────────────────────────────────────────────────────
  // L2 - Dune (Y + scale only, no X-axis)
  // ─────────────────────────────────────────────────────────────────────────
  const l2Y = useTransform(scrollYProgress, [0, 1], ["0%", `${DEPTH_BANDS.L2.y[1]}%`]);
  const l2Scale = useTransform(scrollYProgress, [0, 1], [DEPTH_BANDS.L2.scale[0], DEPTH_BANDS.L2.scale[1]]);

  // ─────────────────────────────────────────────────────────────────────────
  // HEADLINE - Nearly anchored, minimal motion, PERSISTS longest
  // ─────────────────────────────────────────────────────────────────────────
  const headlineY = useTransform(scrollYProgress, [0, 1], [0, -15]);
  const headlineOpacity = useTransform(scrollYProgress, [0.8, 0.98], [1, 0]);
  const headlineScale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);

  // ─────────────────────────────────────────────────────────────────────────
  // SUBHEADER - Exits FIRST (reinforces "work recedes, clarity remains")
  // Represents "the work of the climb" - falls away as you ascend
  // ─────────────────────────────────────────────────────────────────────────
  const subheaderY = useTransform(scrollYProgress, [0, 0.85], [0, 15]); // Moves down slightly
  const subheaderOpacity = useTransform(scrollYProgress, [0.75, 0.92], [1, 0]); // Exits before headline, mountain occludes

  // ─────────────────────────────────────────────────────────────────────────
  // Content layer transforms (stable with subtle movement)
  // ─────────────────────────────────────────────────────────────────────────
  const cardY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const cardOpacity = useTransform(scrollYProgress, [0, 0.5, 0.8], [1, 0.8, 0]);
  const proofY = useTransform(scrollYProgress, [0, 1], [0, 50]);

  const navOpacity = useTransform(scrollYProgress, [0, 0.5, 0.7], [1, 1, 0]); // Fade out as it goes behind mountain

  // ─────────────────────────────────────────────────────────────────────────
  // REVERSE SCALE (1 → 0.97/0.98) - UNIFIED TIMING
  // ─────────────────────────────────────────────────────────────────────────
  const cardScale = useTransform(scrollYProgress, [0.35, 0.65], [1, 0.97]);
  const proofScale = useTransform(scrollYProgress, [0.35, 0.65], [1, 0.98]);
  return <section ref={sectionRef} className="relative" style={{
    minHeight: "240vh"
  }}>
    {/* ═══════════════════════════════════════════════════════════════════
          STICKY VIEWPORT CHAMBER
          ═══════════════════════════════════════════════════════════════════ */}
    <div className="sticky top-0 h-screen w-full overflow-hidden">
      {/* ─────────────────────────────────────────────────────────────────
            z-0: L5 - VIDEO BACKGROUND (deepest layer)
            Class B' Isolation: Persistent Spectator Infrastructure
            ───────────────────────────────────────────────────────────────── */}
      <motion.div className="absolute inset-0 z-0 pointer-events-none overflow-hidden isolation-isolate contain-paint" style={{
        willChange: "transform"
      }}>
        <motion.video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          // @ts-ignore - fetchPriority is valid HTML attribute but not in React types yet
          fetchPriority="high"
          className="w-full h-full object-cover"
          style={{
            scale: l5Scale,
            willChange: "transform",
            transform: "translateZ(0)"
          }}
        >
          <source src={L5BGHero} type="video/mp4" />
        </motion.video>
      </motion.div>

      {/* ─────────────────────────────────────────────────────────────────
            z-10: L4 - MOUNTAIN (deepest image, slowest parallax)
            ───────────────────────────────────────────────────────────────── */}
      <motion.div className="absolute inset-x-0 z-10 pointer-events-none" style={{
        top: "50%",
        bottom: "-50%",
        y: l4Y,
        scale: l4Scale,
        willChange: "transform",
      }}>
        <img src={L4Mountain} alt="" className="w-full h-full object-cover object-top" />
      </motion.div>

      {/* ─────────────────────────────────────────────────────────────────
            z-20: L3 - RIDGE (mid-depth)
            ───────────────────────────────────────────────────────────────── */}
      <motion.div className="absolute inset-x-0 z-20 pointer-events-none" style={{
        top: "30%",
        bottom: "-30%",
        y: l3Y,
        scale: l3Scale,
        willChange: "transform",
      }}>
        <img src={L3Ridge} alt="" className="w-full h-full object-cover" />
      </motion.div>

      {/* ─────────────────────────────────────────────────────────────────
            z-30: L2 - DUNE (nearest background, fastest parallax)
            ───────────────────────────────────────────────────────────────── */}
      <motion.div className="absolute inset-x-0 z-30 pointer-events-none" style={{
        top: "20%",
        bottom: "-20%",
        y: l2Y,
        scale: l2Scale,
        willChange: "transform",
      }}>
        <img src={L2Dune} alt="" className="w-full h-full object-cover" />
      </motion.div>

      {/* ─────────────────────────────────────────────────────────────────
            z-40: ATMOSPHERIC POST-STACK
            ───────────────────────────────────────────────────────────────── */}
      <motion.div className="absolute inset-0 z-40 pointer-events-none" style={{
        willChange: "opacity, transform",
        transform: "translateZ(0)"
      }}>
        {/* Radial vignette */}
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse at center, transparent 40%, hsl(220 15% 4% / 0.7) 100%)"
        }} />

        {/* Bottom gradient for continuity */}
        <div className="absolute inset-0" style={{
          background: "linear-gradient(to top, hsl(220 15% 4% / 0.9) 0%, transparent 30%)"
        }} />

        {/* Grain overlay */}
        <div className="grain-overlay" />
      </motion.div>

      {/* ─────────────────────────────────────────────────────────────────
            z-50: L1 - CONTENT PLANE (stable & readable)
            ───────────────────────────────────────────────────────────────── */}

      {/* Header/Nav - Tucked behind L4 mountain (same layer as headline) */}
      <motion.div className="absolute inset-x-0 top-0 z-[5] px-8 py-6" style={{
        opacity: navOpacity,
        willChange: "opacity"
      }}>
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-lg tracking-tight text-foreground">CLELAND</span>
            <span className="text-muted-foreground text-xs">®</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-display uppercase tracking-wider text-muted-foreground">
            <span>AOTEAROA (NZ)</span>
            <span>
              {new Date().toLocaleTimeString("en-NZ", {
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "Pacific/Auckland"
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

      {/* ═══════════════════════════════════════════════════════════════════
            HERO TYPOGRAPHY STACK - Single container, flexbox layout
            Headline persists, subheader recedes first on scroll
            ═══════════════════════════════════════════════════════════════════ */}
      <motion.div className="absolute inset-x-0 z-[5] px-6 sm:px-8 md:px-16 lg:px-24" style={{
        top: "20vh",
        willChange: "transform, opacity",
        transform: "translateZ(0)"
      }} initial={{
        opacity: 0,
      }} animate={{
        opacity: 1,
      }} transition={{
        delay: 0.3,
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1]
      }}>
        <div className="flex flex-col items-center gap-3 md:gap-4 lg:gap-5 text-center">
          {/* HEADLINE - "Clarity comes with elevation." */}
          <motion.h1 className="font-display font-semibold text-foreground tracking-[-0.03em] leading-[1.05] max-w-[18ch] md:max-w-none" style={{
            fontSize: "clamp(2.25rem, 6vw, 5.5rem)",
            y: headlineY,
            opacity: headlineOpacity,
            scale: headlineScale,
            willChange: "transform, opacity"
          }}>
            Clarity comes with elevation.
          </motion.h1>

          {/* SUBHEADER - "The work of the climb" */}
          <motion.p className="font-display text-foreground/75 max-w-[48ch] tracking-tight leading-relaxed" style={{
            fontSize: "clamp(0.95rem, 1.8vw, 1.25rem)",
            y: subheaderY,
            opacity: subheaderOpacity
          }}>
            Premium-built websites and conversion-focused automation systems for businesses building upward.
          </motion.p>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════════
            BOTTOM-RIGHT CLUSTER: Profile Card (left) + Value Prop (right)
            ═══════════════════════════════════════════════════════════════════ */}
      <motion.div className="
            absolute z-[60] pointer-events-auto
            right-3 bottom-20 sm:right-6 sm:bottom-6
            max-w-[95vw] sm:max-w-[90vw] md:max-w-[520px]
            flex flex-row
            items-end
            gap-2 sm:gap-3 md:gap-4
            bg-black/15 backdrop-blur-[4px] rounded-xl p-2 sm:p-2.5 md:p-3 shadow-lg shadow-black/20
          " style={{
          y: cardY,
          opacity: cardOpacity,
          scale: cardScale,
          willChange: "transform, opacity",
          transform: "translateZ(0)",
          backfaceVisibility: "hidden"
        }} initial={{
          opacity: 0,
        }} animate={{
          opacity: 1,
        }} transition={{
          delay: 0.8,
          duration: 0.8,
          ease: [0.22, 1, 0.36, 1]
        }}>
        {/* Compact Credential Card */}
        <div className="profile-card w-[120px] sm:w-[140px] md:w-[160px] rounded-lg overflow-hidden flex-shrink-0 bg-card">
          {/* Square-ish Portrait */}
          <div className="relative h-[80px] sm:h-[100px] md:h-[120px] overflow-hidden">
            <img src={profileShot} alt="James Cleland" className="w-full h-full object-cover object-top" />
            {/* Capacity Indicator - 5 bar system */}
            <CapacityIndicator filledSlots={1} totalSlots={5} isNavigating={isNavigatingLocal} />
          </div>

          {/* Compact Info */}
          <div className="p-2 md:p-2.5 border-t border-border/50">
            <h3 className="font-display font-semibold text-foreground text-[10px] md:text-xs">Joshua Cleland</h3>
            <p className="text-[9px] md:text-[10px] text-muted-foreground">Founder & Creative Director</p>
          </div>

          {/* Compact CTA */}
          <button className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 bg-secondary hover:bg-secondary/80 transition-colors border-t border-border/30">
            <span className="text-[9px] md:text-[10px] font-display text-foreground">Book Call</span>
            <Calendar className="w-2.5 h-2.5 text-muted-foreground" />
          </button>
        </div>

        {/* Value Prop Copy */}
        <div className="flex-1 min-w-0 text-left self-end">
          <div className="text-[10px] sm:text-xs md:text-sm leading-snug tracking-tight space-y-2">
            <p className="text-muted-foreground">Don't make noise — <span className="text-foreground">create signal.</span></p>
            <p className="text-muted-foreground">Don't add layers — <span className="text-foreground">remove friction.</span></p>
            <p className="text-muted-foreground">Don't decorate — <span className="text-foreground">design for outcomes.</span></p>
            <p className="text-muted-foreground">Design from a different vantage point.</p>
            {/* Bottom spacer for tablet/laptop only */}
            <div className="hidden sm:block h-8 md:h-10" aria-hidden="true" />
          </div>
        </div>
      </motion.div>

      {/* Social Proof Cluster */}
      <motion.div className="absolute z-50 bottom-8 left-8 md:left-16 flex items-center sm:flex-col sm:items-start md:flex-row md:items-center gap-4 sm:gap-2 md:gap-4" style={{
        y: proofY,
        scale: proofScale,
        willChange: "transform",
        transform: "translateZ(0)",
        backfaceVisibility: "hidden"
      }} initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} transition={{
        delay: 1.4,
        duration: 0.6
      }}>
        {/* Overlapping avatars */}
        <div className="flex -space-x-2 order-first sm:order-last md:order-first">
          {[1, 2, 3, 4].map(i => <div key={i} className="w-8 h-8 rounded-full bg-secondary border-2 border-background flex items-center justify-center text-xs text-muted-foreground font-medium">
            {String.fromCharCode(64 + i)}
          </div>)}
          <div className="w-8 h-8 rounded-full bg-accent/20 border-2 border-background flex items-center justify-center">
            <span className="text-[10px] text-accent">You?</span>
          </div>
        </div>

        {/* Rating */}
        <div className="flex flex-col gap-0.5 order-last sm:order-first md:order-last">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-accent text-accent" />)}
            <span className="text-xs text-foreground ml-1">
              4.9<span className="text-muted-foreground">/5</span>
            </span>
          </div>
          <span className="text-xs text-muted-foreground">100+ Happy clients</span>
        </div>
      </motion.div>
    </div>

    {/* Fullscreen Menu */}
    <AnimatePresence>
      {isMenuOpen && (
        <FullscreenMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      )}
    </AnimatePresence>
  </section>;
}