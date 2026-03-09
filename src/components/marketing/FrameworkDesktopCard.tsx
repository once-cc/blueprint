import { useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { processSteps } from "@/data/blueprint";

export interface FrameworkDesktopCardProps {
    index: number;
    step: typeof processSteps[0];
    isLast: boolean;
}

// ═══════════════════════════════════════════════════════════════
// Per-card color theming — the ONLY difference between the
// former Discovery / Design / Delivery card files
// ═══════════════════════════════════════════════════════════════

interface CardColorTheme {
    /** Gradient classes for the large floating title behind the card */
    bigTitleGradient: string;
    /** Gradient classes for the headline text inside the card bottom zone */
    headlineGradient: string;
    /** Optional extra className on the headline span (e.g. pr-1 on Delivery) */
    headlineExtra?: string;
}

const CARD_THEMES: CardColorTheme[] = [
    {
        // Discovery — dark title, neutral headline
        bigTitleGradient: "bg-gradient-to-t from-black from-[20%] via-zinc-900 to-zinc-700",
        headlineGradient: "bg-gradient-to-b from-zinc-200 to-zinc-600",
    },
    {
        // Design — warm parchment tones
        bigTitleGradient: "bg-gradient-to-t from-background from-[45%] via-[#c3bdaf]/15 to-[#c3bdaf]/40",
        headlineGradient: "bg-gradient-to-b from-[#c3bdaf] to-[#c3bdaf]/60",
    },
    {
        // Delivery — ivory/cream tones
        bigTitleGradient: "bg-gradient-to-t from-background from-[45%] via-[#e8e0d4]/15 to-[#e8e0d4]/40",
        headlineGradient: "bg-gradient-to-b from-[#e8e0d4] to-[#e8e0d4]/60",
        headlineExtra: "pr-1",
    },
];

// ═══════════════════════════════════════════════════════════════
// Motion constants
// ═══════════════════════════════════════════════════════════════

const EASE_ARCH: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp = (delay: number, y: number = 8) => ({
    initial: { opacity: 0, y },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay, ease: EASE_ARCH },
});

const fadeIn = (delay: number) => ({
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.4, delay, ease: EASE_ARCH },
});

// ═══════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════

export const FrameworkDesktopCard = ({
    index,
    step,
    isLast,
}: FrameworkDesktopCardProps) => {
    const trackerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(contentRef, { once: true, margin: "-10% 0px -10% 0px" });

    // Resolve color theme for this card index
    const theme = CARD_THEMES[index] ?? CARD_THEMES[0];

    // ── Scroll choreography ──────────
    const { scrollYProgress: popProgress } = useScroll({
        target: trackerRef,
        offset: ["start 80%", "start 20%"],
    });

    const delayPop = index === 0 ? 0 : 0.65;
    const titleY = useTransform(popProgress, [delayPop, 1], ["85%", "40%"]);
    const titleOpacity = useTransform(
        popProgress,
        [delayPop, delayPop + 0.2, 1],
        [index === 0 ? 1 : 0, 1, 1]
    );

    const { scrollYProgress: descendProgress } = useScroll({
        target: trackerRef,
        offset: ["start 22vh", "start -80vh"],
    });

    const groupScale = useTransform(descendProgress, [0, 1], [1, isLast ? 1 : 0.85]);
    const groupOpacity = useTransform(
        descendProgress,
        [0, 0.1, 0.85],
        [1, isLast ? 1 : 1, isLast ? 1 : 0]
    );

    // Derive body copy lines from data model
    const bodyLines = step.description.split("\n");

    return (
        <div
            ref={trackerRef}
            className={`relative w-full ${isLast ? "h-[120vh]" : "h-[120vh] -mb-[40vh]"}`}
        >
            <div
                className="sticky top-[22vh] w-full flex justify-center"
                style={{ zIndex: index, perspective: "1500px" }}
            >
                <div className="w-full flex justify-center">
                    <motion.div
                        style={{
                            scale: groupScale,
                            opacity: groupOpacity,
                            willChange: "transform, opacity" // Force browser to take a static texture snapshot for scaling
                        }}
                        className="relative w-full max-w-[90vw] lg:max-w-[1240px] flex justify-center"
                    >
                        {/* ── Big Title (behind card) ── */}
                        <motion.div
                            style={{ y: titleY, opacity: titleOpacity, willChange: "transform, opacity" }}
                            className="absolute bottom-full w-full flex items-end justify-center pointer-events-none -z-10"
                        >
                            {/* Hardware acceleration boundary ensures the text clip mask doesn't re-rasterize on scale */}
                            <span
                                className={`font-nohemi font-bold pt-8 pb-4 select-none whitespace-nowrap uppercase relative inline-block text-transparent bg-clip-text ${theme.bigTitleGradient}`}
                                style={{
                                    fontSize: "clamp(3rem, 13vw, 190px)",
                                    lineHeight: 1,
                                    WebkitTransform: "translateZ(0)", // Force GPU layer
                                    textShadow: "0 20px 40px rgba(0,0,0,0.4)" // Replaced box-shadow with text-shadow per request
                                }}
                            >
                                {step.title}
                            </span>
                        </motion.div>


                        {/* ═══════════════════════════════════════════════════ */}
                        {/* CARD SHELL — Bounded height, image as full-bleed   */}
                        {/* ═══════════════════════════════════════════════════ */}
                        <div
                            ref={contentRef}
                            className="w-full bg-card border border-white/10 ring-1 ring-black/50 relative overflow-hidden rounded-xl h-[550px] lg:h-[640px]"
                        >
                            {/* Structural Ticks */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 1, delay: 0.2 }}
                                className="absolute inset-0 pointer-events-none z-20 rounded-[inherit]"
                            >
                                {/* Top Left */}
                                <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-white/20 rounded-tl-[inherit]" />
                                {/* Top Right */}
                                <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-white/20 rounded-tr-[inherit]" />
                                {/* Bottom Left */}
                                <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-white/20 rounded-bl-[inherit]" />
                                {/* Bottom Right */}
                                <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-white/20 rounded-br-[inherit]" />
                            </motion.div>
                            {/* ── BACKGROUND IMAGE ── */}
                            <motion.div
                                className="absolute inset-0"
                                {...(isInView ? fadeIn(0) : { initial: { opacity: 0 } })}
                            >
                                <img
                                    src={step.imageUrl}
                                    alt={step.title}
                                    loading="lazy"
                                    className="w-full h-full object-cover"
                                />
                            </motion.div>

                            {/* ── BACKGROUND DARKENING & VIGNETTE ── */}
                            {/* Replaced heavy mix-blend-multiply and 120px inner shadows with cheap static overlays/gradients */}
                            <div className="absolute inset-0 bg-black/40 pointer-events-none" />
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.8)_120%)] pointer-events-none" />

                            {/* ── EDITORIAL OVERLAYS (non-structural) ── */}
                            <div
                                className="absolute inset-0 pointer-events-none z-[1]"
                                aria-hidden="true"
                            >
                                {/* Vertical column guides */}
                                <div className="absolute top-0 bottom-0 left-[33%] w-px bg-white/[0.05]" />
                                <div className="absolute top-0 bottom-0 left-[66%] w-px bg-white/[0.05]" />

                                {/* Micro alignment ticks */}
                                <div className="absolute left-8 lg:left-12 top-[25%] w-3 h-px bg-white/[0.06]" />
                                <div className="absolute left-8 lg:left-12 top-[50%] w-3 h-px bg-white/[0.06]" />
                                <div className="absolute left-8 lg:left-12 top-[75%] w-3 h-px bg-white/[0.06]" />

                                {/* Blueprint grid */}
                                <div
                                    className="absolute inset-0 opacity-[0.02]"
                                    style={{
                                        backgroundImage:
                                            "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
                                        backgroundSize: "80px 80px",
                                    }}
                                />
                            </div>

                            {/* ═══════════════════════════════════════════════ */}
                            {/* READING FIELD MASK — Left 40% controlled zone  */}
                            {/* ═══════════════════════════════════════════════ */}
                            <div
                                className="absolute inset-y-0 left-0 w-[40%] z-[5] pointer-events-none"
                                style={{
                                    background: 'linear-gradient(to right, rgba(10,10,15,0.78) 0%, rgba(10,10,15,0.65) 25%, rgba(10,10,15,0.45) 55%, rgba(10,10,15,0.2) 80%, transparent 100%)',
                                    borderRight: '1px solid rgba(255,255,255,0.05)',
                                }}
                            />

                            {/* ═══════════════════════════════════════════════ */}
                            {/* CONTENT OVERLAY — Copy layered on image        */}
                            {/* ═══════════════════════════════════════════════ */}
                            <div className="absolute inset-0 z-10 p-8 lg:p-12 flex flex-col justify-between">
                                {/* ── Amber accent axis line ── */}
                                <motion.div
                                    className="absolute top-0 left-8 lg:left-12 w-px h-full bg-[#d4a853]/10"
                                    {...(isInView
                                        ? {
                                            initial: { opacity: 0 },
                                            animate: { opacity: 1 },
                                            transition: {
                                                duration: 0.6,
                                                delay: 0.2,
                                                ease: EASE_ARCH,
                                            },
                                        }
                                        : { initial: { opacity: 0 } })}
                                />

                                {/* ── TOP ZONE: Label + Body (40/60 structural grid) ── */}
                                <div className="grid grid-cols-[35%_1fr]">
                                    <div>
                                        <motion.span
                                            className="font-nohemi font-medium tracking-[0.2em] text-[10px] md:text-xs text-[#d4a853] uppercase flex items-center gap-2 mb-4"
                                            {...(isInView ? fadeUp(0.3, 6) : { initial: { opacity: 0 } })}
                                        >
                                            <span className="text-[#d4a853]/60">//</span> 0{index + 1}
                                        </motion.span>

                                        <div className="flex flex-col gap-1">
                                            {bodyLines.map((line, idx) => (
                                                <motion.p
                                                    key={idx}
                                                    className="text-sm lg:text-base text-white leading-relaxed"
                                                    style={{ fontFamily: "var(--font-body)" }}
                                                    {...(isInView
                                                        ? fadeUp(0.4 + idx * 0.08, 6)
                                                        : { initial: { opacity: 0 } })}
                                                >
                                                    {line}
                                                </motion.p>
                                            ))}
                                        </div>
                                    </div>
                                    {/* Right 40% — imagery breathing room */}
                                    <div />
                                </div>

                                {/* ── BOTTOM ZONE: Headline + Metadata ── */}
                                <div className="flex justify-between items-end gap-8">
                                    {/* Left: Divider + Headline */}
                                    <div>
                                        <motion.div
                                            className="h-px bg-white/[0.15] mb-4 w-24"
                                            {...(isInView
                                                ? {
                                                    initial: {
                                                        scaleX: 0,
                                                        transformOrigin: "left",
                                                    },
                                                    animate: { scaleX: 1 },
                                                    transition: {
                                                        duration: 0.6,
                                                        delay: 0.6,
                                                        ease: EASE_ARCH,
                                                    },
                                                }
                                                : { initial: { scaleX: 0 } })}
                                        />
                                        <motion.h3
                                            className="tracking-tight text-4xl lg:text-6xl leading-none"
                                            style={{ fontFamily: "var(--font-editorial)" }}
                                            {...(isInView
                                                ? fadeUp(0.5, 8)
                                                : { initial: { opacity: 0 } })}
                                        >
                                            {/* Hardware acceleration boundary for the masked text */}
                                            <span
                                                className={`text-transparent bg-clip-text ${theme.headlineGradient} inline-block ${theme.headlineExtra ?? ''} mix-blend-plus-lighter`}
                                                style={{
                                                    textShadow: '0px 2px 4px rgba(0,0,0,0.5)', // Replaced expensive CSS filter with text-shadow
                                                    WebkitTransform: "translateZ(0)" // Force GPU layer
                                                }}
                                            >
                                                {step.title}
                                            </span>
                                        </motion.h3>
                                    </div>

                                    {/* Right: Metadata rows */}
                                    <div className="flex flex-col gap-2.5">
                                        {step.bullets.map((item, idx) => (
                                            <motion.div
                                                key={idx}
                                                className="flex items-center gap-3 border border-white/[0.08] bg-black/25 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4),0_1px_0_rgba(255,255,255,0.03)] px-4 py-2.5 rounded-sm"
                                                {...(isInView
                                                    ? {
                                                        initial: { opacity: 0, y: 8 },
                                                        animate: { opacity: 1, y: 0 },
                                                        transition: { duration: 0.8, delay: 0.9 + idx * 0.25, ease: EASE_ARCH }
                                                    }
                                                    : { initial: { opacity: 0, y: 8 } })}
                                            >
                                                <div className="relative w-4 h-4 shrink-0 flex items-center justify-center">
                                                    <div className="absolute w-2 h-2 bg-[#d4a853]/20 rounded-full" />
                                                    <motion.div
                                                        initial={{ scale: 0.8, opacity: 0.4 }}
                                                        // Gate the infinite animation so it pauses when scrolled out of view
                                                        animate={isInView ? {
                                                            scale: [0.8, 1.2, 0.8],
                                                            opacity: [0.4, 1, 0.4],
                                                        } : { scale: 0.8, opacity: 0.4 }}
                                                        transition={isInView ? {
                                                            duration: 2.5,
                                                            repeat: Infinity,
                                                            ease: "easeInOut",
                                                            delay: idx * 0.4,
                                                        } : {
                                                            duration: 0.5
                                                        }}
                                                        className="w-1.5 h-1.5 bg-[#d4a853] rounded-full shadow-[0_0_8px_#d4a853]"
                                                    />
                                                </div>
                                                <span
                                                    className="text-xs text-white/85 uppercase tracking-[0.15em] leading-none"
                                                    style={{ fontFamily: "var(--font-body)", textShadow: "0 -1px 1px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.04)" }}
                                                >
                                                    {item}
                                                </span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};
