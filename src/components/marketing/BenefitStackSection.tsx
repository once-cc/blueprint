import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useInView } from "framer-motion";
import { GridSection } from "@/components/ui/grid-section";
import { Word, HighlightedWord, type WordRevealColors } from "@/components/ui/WordReveal";
import { BenefitIconLottie } from "@/components/ui/BenefitIconLottie";
import noiseTexture from "@/assets/noise/noise.png";
import clarityAnimation from "@/assets/benefitstack/clarity.json";
import technicalAnimation from "@/assets/benefitstack/technical.json";
import longevityAnimation from "@/assets/benefitstack/longevity.json";
import confidenceAnimation from "@/assets/benefitstack/confidence.json";

const benefits = [
    {
        title: "Total Clarity",
        description: "See exactly what will be built. How it converts. And why each decision exists — before committing to execution.\nNo ambiguity.\nNo surprises.",
        animationData: clarityAnimation,
        color: "hsl(220 12% 40%)" // Muted metallic
    },
    {
        title: "Zero Technical Overload",
        description: "Everything is defined as one cohesive system.\nNo guesswork.\nNo patchwork.\nNo operational confusion.\nWe secure the strategic foundation so the engineering begins flawlessly.",
        animationData: technicalAnimation,
        color: "hsl(38 85% 55%)" // Accent gold
    },
    {
        title: "Designed for Longevity",
        description: "True premium design survives rapid scaling.\nThe Blueprint engineers your digital presence with enterprise-grade foresight, ensuring your platform never outgrows its foundations.",
        animationData: longevityAnimation,
        staticFrame: 90,
        color: "hsl(142 71% 45%)" // Success green
    },
    {
        title: "Decision Confidence",
        description: "Move past abstract ideas and endless revision cycles.\nThe Blueprint provides absolute visual and technical certainty before a single line of code is written.\nYou design the direction once.",
        animationData: confidenceAnimation,
        color: "hsl(221 83% 53%)" // Trust blue
    }
];

const BENEFIT_COLORS: WordRevealColors = {
    from: "hsla(220, 12%, 50%, 0.25)",
    to: "hsl(45, 10%, 92%)",
};



export function BenefitStackSection() {
    const containerRef = useRef<HTMLElement>(null);
    const textRef = useRef<HTMLDivElement>(null);
    const [hoveredCardIndex, setHoveredCardIndex] = useState<number | null>(null);

    const { scrollYProgress } = useScroll({
        target: textRef,
        // Start revealing when the text enters the bottom 85% of the screen.
        // Finish revealing when the BOTTOM of the text reaches 45% of the viewport (just above the center line).
        // Since there is a mb-24 (96px) gap below the text, the TOP of the cards below 
        // will be positioned at exactly ~55% of the viewport (just under 50%) when the animation completes.
        offset: ["start 85%", "end 45%"]
    });


    const introText = "Why Start With a Blueprint? Because building first and thinking later is expensive. Define it properly once. Build with direction. Avoid the cost of revisions, delays, and fragmented systems. Time saved. Money protected. Momentum preserved.";
    const words = introText.split(" ");

    return (
        <GridSection
            ref={containerRef}
            className="py-12 md:py-32 bg-[hsl(220_15%_4%)] shadow-[inset_0_0_0_1px_hsl(220_12%_20%_/_0.15),inset_0_2px_15px_rgba(0,0,0,0.8)] overflow-hidden z-20 relative border-white/10"
            topCrosshairColors={{ topColor: "rgba(255,255,255,0.4)", bottomColor: "rgba(255,255,255,0.15)" }}
            bottomCrosshairColors={{ topColor: "rgba(255,255,255,0.15)", bottomColor: "rgba(255,255,255,0.4)" }}
            gridLineClassName="bg-white/10"
        >
            {/* The Editorial Ramp / Central Spine connecting to next section */}
            <div className="absolute top-0 bottom-0 left-1/2 -ml-px w-px bg-white/10 pointer-events-none hidden md:block z-[25]" />

            {/* True Edge Docking Rails spanning the entire section height */}
            <div className="absolute inset-0 pointer-events-none z-[25] flex justify-center">
                {/* 
                    Matches the exact width constraint of the Architectural Grid below 
                    - On mobile, it's w-full, matching the 16px inset of the grid's padding.
                    - On desktop, it's constrained by max-w-[90vw] within the 1240px container max.
                */}
                <div className="w-full flex justify-center container mx-auto px-4 md:px-6 relative">
                    <div className="w-full md:max-w-[90vw] lg:max-w-[1240px] relative">
                        <div className="absolute top-0 bottom-[100px] md:bottom-0 left-0 md:left-0 w-px bg-white/10" />
                        <div className="absolute top-0 bottom-[100px] md:bottom-0 right-0 md:right-0 w-px bg-white/10" />
                    </div>
                </div>
            </div>

            {/* ══ SUBSTRATE ENHANCEMENT LAYERS ══ */}
            {/* Consolidated: 6 gradient layers merged into one multi-background div. */}
            {/* Film grain stays separate (requires mix-blend-soft-light compositing). */}
            <div
                className="absolute inset-0 z-0 pointer-events-none"
                style={{
                    background: [
                        'radial-gradient(50% 50% at 85% 80%, hsl(220 40% 30% / 0.08), transparent 60%)',
                        'radial-gradient(70% 60% at 30% 45%, hsl(37 30% 55% / 0.07), transparent 70%)',
                        'radial-gradient(ellipse at center, transparent 35%, hsl(220 15% 2% / 0.75) 100%)',
                        'radial-gradient(60% 50% at 25% 40%, hsl(220 10% 12% / 0.5), transparent 70%)',
                        'linear-gradient(to bottom, hsl(45 10% 92% / 0.02), transparent 40%)',
                        'radial-gradient(80% 40% at 50% 100%, hsl(37 91% 55% / 0.03), transparent 70%)',
                    ].join(', '),
                }}
            />

            {/* Layer 1: Static Film Grain — Zero-cost tiling image replacement for expensive SVG math */}
            <div
                className="absolute inset-0 z-[1] pointer-events-none opacity-[0.25]"
                style={{ backgroundImage: `url(${noiseTexture})` }}
            />

            {/* Ghost Editorial Grid */}
            <div className="absolute inset-0 z-[1] pointer-events-none bg-editorial-grid opacity-[0.12]" />

            <div className="container mx-auto px-6 mb-12 md:mb-24 relative z-[25]">
                <div ref={textRef} className="max-w-4xl mx-auto text-center flex flex-col items-center relative">
                    <span className="font-nohemi font-medium tracking-widest text-[10px] md:text-sm text-accent uppercase flex items-center gap-2 mb-8">
                        <span className="text-accent/60">//</span> STRATEGIC CLARITY
                    </span>

                    <motion.h2
                        className="font-nohemi font-medium text-3xl md:text-5xl lg:text-6xl leading-[1.2] tracking-tight block w-full text-center"
                        style={{ "--progress": scrollYProgress } as React.CSSProperties}
                    >
                        {words.map((word, i) => {
                            const start = i / words.length;
                            const end = start + 1 / words.length;

                            const isSingleBreak = ["Blueprint?", "once.", "direction.", "saved.", "protected."].some(w => word.includes(w));
                            const isDoubleBreak = ["expensive.", "systems."].some(w => word.includes(w));

                            const isHighlighted = ["Blueprint?", "expensive.", "direction.", "systems.", "saved.", "protected.", "preserved."].some(w => word.includes(w));

                            if (isHighlighted) {
                                return (
                                    <span key={i}>
                                        <span className="relative italic font-nohemi font-medium text-transparent bg-clip-text bg-gradient-to-b from-zinc-600 from-[50%] to-zinc-950 pl-[0.15em] -ml-[0.15em] pr-[0.3em]">
                                            <HighlightedWord progress={scrollYProgress} range={[start, end]}>
                                                {word}
                                            </HighlightedWord>
                                        </span>
                                        {i !== words.length - 1 && " "}
                                        {isSingleBreak && <br />}
                                        {isDoubleBreak && <><br /><br /></>}
                                    </span>
                                );
                            }

                            return (
                                <span key={i}>
                                    <Word progress={scrollYProgress} range={[start, end]} colors={BENEFIT_COLORS}>
                                        {word}
                                    </Word>
                                    {i !== words.length - 1 && " "}
                                    {isSingleBreak && <br />}
                                    {isDoubleBreak && <><br /><br /></>}
                                </span>
                            );
                        })}
                    </motion.h2>
                </div>
            </div>

            {/* Architectural Schematic Grid - Shared CSS Hover Glow */}
            <div className="container mx-auto px-4 md:px-6 relative z-10 flex justify-center">
                <div className="w-full md:max-w-[90vw] lg:max-w-[1240px] relative">

                    {/* The 2x2 Drawn Grid — Using 'group/grid' to track hover over the whole section */}
                    <div className="group/grid grid grid-cols-1 md:grid-cols-2 bg-transparent border-y border-white/10 divide-y divide-white/10 md:divide-y-0 relative z-0 rounded-none">

                        {/* Drop shadow caster — Replaced heavy boxed math shadow with static radial gradient texture overlay (removed filter: blur to prevent layer repaints) */}
                        <div className="absolute inset-0 pointer-events-none z-[2] bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.4)_0%,transparent_60%)]" style={{ transform: 'translateY(20px) scaleX(0.8) scaleY(1.2)' }} />



                        {/* Faint Global Editorial Grid behind the cards */}
                        <div className="absolute inset-0 bg-editorial-grid pointer-events-none z-0" />

                        {/* Structural Ticks (Editorial Design Treatment) */}
                        <div className="absolute inset-0 pointer-events-none z-20">
                            {/* Top Left */}
                            <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-white/20" />
                            {/* Top Right */}
                            <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-white/20" />
                            {/* Bottom Left */}
                            <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-white/20" />
                            {/* Bottom Right */}
                            <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-white/20" />
                        </div>

                        {/* 1. Global Outline: Lightweight box-shadow alternative to mask-composite math */}
                        <div className="absolute inset-x-[-1px] inset-y-0 pointer-events-none border border-white/0 group-hover/grid:border-white/10 group-hover/grid:shadow-[inset_0_0_20px_rgba(255,255,255,0.05)] transition-all duration-700 z-10" />

                        {benefits.map((benefit, i) => (
                            <BenefitCard
                                key={i}
                                benefit={benefit}
                                index={i}
                                isHovered={hoveredCardIndex === i}
                                setHovered={setHoveredCardIndex}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </GridSection>
    );
}

// ═══════════════════════════════════════════════════════════════
// Sub-Component: BenefitCard
// Extracted to maintain isolated useInView state for staggered lottie animations
// ═══════════════════════════════════════════════════════════════

interface BenefitCardProps {
    benefit: typeof benefits[0];
    index: number;
    isHovered: boolean;
    setHovered: (i: number | null) => void;
}

function BenefitCard({ benefit, index, isHovered, setHovered }: BenefitCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);

    // We stagger the trigger boundaries slightly based on the card's index (0-3).
    // This prevents all 4 Lottie files from parsing their JSON and initializing 
    // their SVG canvases on the exact same scroll frame, which causes severe jank.
    const margins = ["0px 0px -25% 0px", "0px 0px -20% 0px", "0px 0px -15% 0px", "0px 0px -10% 0px"] as const;
    const margin = margins[index] || "0px 0px -10% 0px";
    const isInView = useInView(cardRef, { margin });

    return (
        <div
            ref={cardRef}
            onMouseEnter={() => setHovered(index)}
            onMouseLeave={() => setHovered(null)}
            // Card is 'group/card'. 
            // On grid hover: all cards get a faint white glow.
            // On card hover: this card isolates and gets a strong branded radial glow, while others fade back.
            className="group/card relative p-8 md:p-12 flex flex-col gap-8 transition-all duration-500"
        >
            {/* Conditionally render the structural dividing lines inside the cards so the hover glow perfectly traces them */}
            {/* Top inner border (for bottom row) */}
            {index > 1 && <div className="hidden md:block absolute top-0 left-0 right-0 h-px bg-white/5 z-[5]" />}
            {/* Left inner border (for right column) */}
            {index % 2 !== 0 && <div className="hidden md:block absolute top-0 bottom-0 left-0 w-px bg-white/5 z-[5]" />}

            {/* Background Hover Illuminations */}
            {/* 1. The collective grid glow */}
            <div className="absolute inset-0 bg-white/[0.02] opacity-0 group-hover/grid:opacity-100 group-hover/card:!opacity-0 transition-opacity duration-700 pointer-events-none z-0" />

            {/* 2. The isolated card glow */}
            <div
                className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none z-0"
                style={{
                    background: `radial-gradient(circle at center, ${benefit.color}15 0%, transparent 70%)`
                }}
            />

            {/* 3. The isolated card outline: Lightweight inset shadow approach */}
            <div
                className="absolute inset-px pointer-events-none opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 z-10"
                style={{
                    boxShadow: `inset 0 0 0 1px ${benefit.color}60, inset 0 0 20px ${benefit.color}20`
                }}
            />

            {/* Technical Header */}
            <div className="flex justify-between items-start relative z-10">
                <div className="flex flex-col gap-2">
                    <span className="font-mono text-[10px] tracking-widest uppercase flex items-center gap-2" style={{ color: "#f5a524" }}>
                        <span className="opacity-60">//</span> 0{index + 1}
                    </span>
                    <h3 className="font-nohemi font-medium text-2xl lg:text-3xl text-white group-hover/card:text-white transition-colors duration-300">
                        {benefit.title}
                    </h3>
                </div>
                <BenefitIconLottie
                    animationData={benefit.animationData}
                    color={benefit.color}
                    isActive={isHovered}
                    hasPlayedOnce={isInView}
                    staticFrame={benefit.staticFrame}
                />
            </div>

            {/* Annotation copy */}
            <p className="font-body type-functional-light text-sm md:text-base text-zinc-300 leading-relaxed max-w-sm whitespace-pre-line relative z-10 group-hover/card:text-white transition-colors duration-500">
                {benefit.description}
            </p>
        </div>
    );
}
