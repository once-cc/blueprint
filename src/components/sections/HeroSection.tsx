import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Calendar, ArrowUpRight, Star } from "lucide-react";
import { StaticTypeRig } from "../cinematic/TypeRig";
import { VideoLogo } from "@/components/ui/VideoLogo";
import heroBackground from "@/assets/hero-background.jpg";
import founderPortrait from "@/assets/founder-portrait.jpg";

export function HeroSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Parallax transforms for depth layers
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.02, 1.15]);
  const bgOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.7, 0.3]);

  // Railway exit: slide LEFT (inverted direction)
  const typoX = useTransform(scrollYProgress, [0, 0.5], [0, -1200]);
  const typoOpacity = useTransform(scrollYProgress, [0, 0.35, 0.5], [1, 0.7, 0]);

  // Card and proof also slide LEFT (slightly slower)
  const cardX = useTransform(scrollYProgress, [0, 0.5], [0, -900]);
  const cardOpacity = useTransform(scrollYProgress, [0, 0.4, 0.55], [1, 0.8, 0]);

  const proofX = useTransform(scrollYProgress, [0, 0.5], [0, -700]);

  // === SCROLL-DRIVEN BLUR HANDOFF ===
  // Staggered blur: STUDIO first, then CLELAND, then NAV (lighter)
  const studioBlur = useTransform(scrollYProgress, [0.3, 0.7], [0, 20]);
  const clelandBlur = useTransform(scrollYProgress, [0.35, 0.75], [0, 18]);
  const navBlur = useTransform(scrollYProgress, [0.45, 0.85], [0, 8]);
  const bgBlur = useTransform(scrollYProgress, [0.4, 0.8], [0, 12]);

  // Foreground elements blur - profile card and social proof
  const cardBlur = useTransform(scrollYProgress, [0.35, 0.7], [0, 14]);
  const proofBlur = useTransform(scrollYProgress, [0.4, 0.75], [0, 10]);
  const valueBlur = useTransform(scrollYProgress, [0.38, 0.72], [0, 12]);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[200vh]"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* L0 - Atmosphere Layer */}
        <div className="absolute inset-0 z-0">
          <div className="grain-overlay" />
        </div>

        {/* L1 - Background Media with scroll blur */}
        <motion.div
          className="absolute inset-0 z-10 overflow-hidden"
          style={{ y: bgY, scale: bgScale, opacity: bgOpacity, filter: useTransform(bgBlur, (v) => `blur(${v}px)`), willChange: "transform, opacity" }}
        >
          <img
            src={heroBackground}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="absolute inset-0 bg-background/30" />
        </motion.div>

        {/* L2 - Structural UI (Header) - with scroll blur */}
        <motion.div
          className="absolute inset-x-0 top-0 z-20 px-8 py-6"
          style={{ filter: useTransform(navBlur, (v) => `blur(${v}px)`) }}
        >
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <VideoLogo size="sm" />
              <span className="text-muted-foreground text-xs">®</span>
            </div>

            <div className="hidden md:flex items-center gap-8 text-sm font-display uppercase tracking-wider text-muted-foreground">
              <span>AOTEAROA (NZ)</span>
              <span>{new Date().toLocaleTimeString("en-NZ", { hour: "2-digit", minute: "2-digit", timeZone: "Pacific/Auckland" })}</span>
            </div>

            <div className="flex items-center gap-6">
              <a href="#work" className="text-sm font-display uppercase tracking-wider text-foreground hover:text-accent transition-colors">
                Our Work
              </a>
              <button className="w-8 h-8 flex flex-col items-center justify-center gap-1.5">
                <span className="w-5 h-px bg-foreground" />
                <span className="w-5 h-px bg-foreground" />
              </button>
            </div>
          </nav>
        </motion.div>

        {/* L3 - Primary Typography with railway exit */}
        <motion.div
          className="absolute inset-0 z-30 flex flex-col justify-center px-8 md:px-16 lg:px-24"
          style={{ x: typoX, opacity: typoOpacity, willChange: "transform, opacity" }}
        >
          <div className="max-w-[90vw]">
            {/* Digital Infrastructure Architects - Tagline */}
            <motion.div
              className="mb-6"
              style={{ filter: useTransform(studioBlur, (v) => `blur(${v}px)`) }}
            >
              <span className="text-[11px] md:text-xs font-mono tracking-[0.35em] text-foreground/80 uppercase">
                Digital Infrastructure Architects
              </span>
            </motion.div>

            {/* CLELAND - blurs second */}
            <motion.div style={{ filter: useTransform(clelandBlur, (v) => `blur(${v}px)`) }}>
              <StaticTypeRig
                as="h1"
                showGhost={true}
                ghostOpacity={0.12}
                ghostScale={1.03}
              >
                <span className="heading-hero text-foreground">CLELAND</span>
              </StaticTypeRig>
            </motion.div>

            {/* STUDIO - blurs first (earliest) */}
            <motion.div
              className="relative -mt-4 md:-mt-8"
              style={{ filter: useTransform(studioBlur, (v) => `blur(${v}px)`) }}
            >
              <StaticTypeRig
                as="span"
                showGhost={true}
                ghostOpacity={0.08}
                ghostScale={1.02}
              >
                <span className="heading-hero text-ghost-foreground ml-[20%] md:ml-[30%]">STUDIO</span>
              </StaticTypeRig>
            </motion.div>
          </div>

        </motion.div>

        {/* L4 - Foreground Objects */}
        {/* Profile Card */}
        <motion.div
          className="absolute z-40 bottom-24 md:bottom-32 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-[15%] lg:right-[20%]"
          style={{ x: cardX, opacity: cardOpacity, filter: useTransform(cardBlur, (v) => `blur(${v}px)`), willChange: "transform, opacity" }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="profile-card w-64 md:w-72 rounded-sm overflow-hidden">
            {/* Portrait */}
            <div className="relative aspect-[4/5] overflow-hidden">
              <img
                src={founderPortrait}
                alt="James Cleland"
                className="w-full h-full object-cover"
              />
              {/* Availability tag */}
              <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-sm">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-0.5 h-3 bg-accent rounded-full" />
                  ))}
                </div>
                <span className="text-xs font-display text-foreground">
                  2 slots open <span className="text-muted-foreground">Jan'25</span>
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="p-4 border-t border-border/50">
              <h3 className="font-display font-semibold text-foreground">James Cleland</h3>
              <p className="text-sm text-muted-foreground">Creative Director</p>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/30">
                <div className="text-sm">
                  <span className="text-muted-foreground">Plans start at </span>
                  <span className="text-foreground font-medium">£7,500 / m</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>

            {/* CTA */}
            <button className="w-full flex items-center justify-between px-4 py-3 bg-secondary hover:bg-secondary/80 transition-colors border-t border-border/30">
              <span className="text-sm font-display text-foreground">Book a 15-Min Call</span>
              <Calendar className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </motion.div>

        {/* Value Proposition */}
        <motion.div
          className="absolute z-40 bottom-24 right-8 md:right-16 max-w-sm hidden lg:block"
          style={{ x: cardX, opacity: typoOpacity, filter: useTransform(valueBlur, (v) => `blur(${v}px)`) }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          <p className="text-lg leading-relaxed">
            <span className="text-foreground font-medium">We've reimagined how great design happens.</span>
            {" "}
            <span className="text-muted-foreground">
              No pitches. No proposals. No project management theater. Just exceptional work from senior designers who become an extension of your team.
            </span>
          </p>
        </motion.div>

        {/* Social Proof Cluster */}
        <motion.div
          className="absolute z-40 bottom-8 left-8 md:left-16 flex items-center gap-4"
          style={{ x: proofX, opacity: typoOpacity, filter: useTransform(proofBlur, (v) => `blur(${v}px)`), willChange: "transform, opacity" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.6 }}
        >
          {/* Overlapping avatars */}
          <div className="flex -space-x-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full bg-secondary border-2 border-background flex items-center justify-center text-xs text-muted-foreground font-medium"
              >
                {String.fromCharCode(64 + i)}
              </div>
            ))}
            <div className="w-8 h-8 rounded-full bg-accent/20 border-2 border-background flex items-center justify-center">
              <span className="text-[10px] text-accent">You?</span>
            </div>
          </div>

          {/* Rating */}
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-accent text-accent" />
              ))}
              <span className="text-xs text-foreground ml-1">4.9<span className="text-muted-foreground">/5</span></span>
            </div>
            <span className="text-xs text-muted-foreground">100+ Happy clients</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
