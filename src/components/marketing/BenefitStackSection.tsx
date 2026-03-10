import { useRef, useState, useEffect, useCallback } from "react";
import { useInView, useScroll, useMotionValueEvent } from "framer-motion";
import { GridSection } from "@/components/ui/grid-section";
import { type WordRevealColors } from "@/components/ui/WordReveal";
import { TextRevealParagraph } from "@/components/ui/TextRevealParagraph";
import { BenefitIconWebP } from "@/components/ui/BenefitIconWebP";
const noiseTexture = "/noise/noise.png";
import clarityIcon from "@/assets/benefitstack/Clarity.webp";
import technicalIcon from "@/assets/benefitstack/Technical.webp";
import longevityIcon from "@/assets/benefitstack/Longevity.webp";
import confidenceIcon from "@/assets/benefitstack/Confidence.webp";

const benefits = [
    {
        title: "Total Clarity",
        description: "See exactly what will be built. How it converts. And why each decision exists — before committing to execution.\nNo ambiguity.\nNo surprises.",
        iconSrc: clarityIcon,
        color: "hsl(38 85% 55%)" // Accent amber
    },
    {
        title: "Zero Technical Overload",
        description: "Everything is defined as one cohesive system.\nNo guesswork.\nNo patchwork.\nNo operational confusion.\nWe secure the strategic foundation so the engineering begins flawlessly.",
        iconSrc: technicalIcon,
        color: "hsl(38 85% 55%)" // Accent amber
    },
    {
        title: "Designed for Longevity",
        description: "True premium design survives rapid scaling.\nThe Blueprint engineers your digital presence with enterprise-grade foresight, ensuring your platform never outgrows its foundations.",
        iconSrc: longevityIcon,
        staticFrame: 90,
        color: "hsl(38 85% 55%)" // Accent amber
    },
    {
        title: "Decision Confidence",
        description: "Move past abstract ideas and endless revision cycles.\nThe Blueprint provides absolute visual and technical certainty before a single line of code is written.\nYou design the direction once.",
        iconSrc: confidenceIcon,
        color: "hsl(38 85% 55%)" // Accent amber
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

    // Track scroll direction so the grid can animate in reverse when scrolling back up
    const { scrollY } = useScroll();
    const [scrollDirection, setScrollDirection] = useState<"down" | "up">("down");

    useMotionValueEvent(scrollY, "change", (current) => {
        const diff = current - scrollY.getPrevious()!;
        if (diff > 5) {
            setScrollDirection("down");
        } else if (diff < -5) {
            setScrollDirection("up");
        }
    });

    const paragraphs = [
        [
            "Why start with a Blueprint?"
        ],
        [
            "Because building first and thinking later is expensive.",
        ],
        [
            "Define it once.",
            "Build with direction.",
            "Avoid revisions, delays, and fragmented systems."
        ],
        [
            "Time saved.",
            "Money protected.",
            "Systems aligned."
        ]
    ];

    const amberWords = [
        "Blueprint?", "direction.", "saved.", "protected.", "aligned."
    ];

    const dimWords = [
        "expensive.", "revisions,", "delays,", "fragmented"
    ];

    const allParagraphsLength = paragraphs.reduce((acc, p) => acc + p.length, 0);
    let lineCountSoFar = 0;

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
            {/* PERFORMANCE UPDATE: Removed 6 stacked CSS radial gradients in favor of a single solid base color + static vignette to stop scroll tearing. */}
            <div
                className="absolute inset-0 z-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse at center, transparent 35%, hsl(220 15% 4% / 0.95) 100%)',
                }}
            />

            {/* Layer 1: Static Film Grain — Zero-cost tiling image replacement for expensive SVG math */}
            <div
                className="absolute inset-0 z-[1] pointer-events-none opacity-[0.25]"
                style={{ backgroundImage: `url(${noiseTexture})` }}
            />

            {/* Ghost Editorial Grid */}
            <div className="absolute inset-0 z-[1] pointer-events-none bg-editorial-grid opacity-40" />

            <div className="container mx-auto px-6 mb-12 md:mb-24 relative z-[25]">
                <div ref={textRef} className="max-w-4xl mx-auto text-center flex flex-col items-center relative">
                    <span className="font-nohemi font-medium tracking-widest text-[10px] md:text-sm text-accent uppercase flex items-center gap-2 mb-8">
                        <span className="text-accent/60">//</span> STRATEGIC CLARITY
                    </span>

                    <h2 className="font-nohemi font-medium text-2xl md:text-4xl lg:text-5xl leading-[1.2] tracking-tight block w-full text-center">
                        {paragraphs.map((lines, i) => {
                            const offsetDown = lineCountSoFar;
                            const offsetUp = allParagraphsLength - lineCountSoFar - lines.length;

                            const offset = scrollDirection === "down" ? offsetDown : offsetUp;

                            lineCountSoFar += lines.length;

                            return (
                                <TextRevealParagraph
                                    key={i}
                                    lines={lines}
                                    amberWords={amberWords}
                                    dimWords={dimWords}
                                    globalLineOffset={offset}
                                    scrollDirection={scrollDirection}
                                />
                            );
                        })}
                    </h2>
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
                                scrollDirection={scrollDirection}
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
// Extracted to maintain isolated useInView state for staggered animations
// ═══════════════════════════════════════════════════════════════

interface BenefitCardProps {
    benefit: typeof benefits[0];
    index: number;
    isHovered: boolean;
    setHovered: (i: number | null) => void;
    scrollDirection: "down" | "up";
}

function BenefitCard({ benefit, index, isHovered, setHovered, scrollDirection }: BenefitCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);

    // Each card row decoupled into its own intersection observer
    const isInView = useInView(cardRef, { margin: "-20% 0px -20% 0px", once: false });

    // 60fps Optimization: 
    // CSS layout animations stagger generously (0ms, 150ms, 300ms) over the grid cards
    // Lotties/WebPs wait an additional generous 250ms after the CSS layout has finished allocating before parsing

    // ENTRANCE logic: 
    // - Scrolling down: Row 1 plays, then Row 2 triggers independently when it scrolls into view.
    // - Since rows are decoupled now, we only need to stagger horizontally between the two columns (even/odd)
    // - We use index % 2 to get the column (0 for left, 1 for right)
    let delayIndex;
    if (isInView) {
        delayIndex = scrollDirection === "down" ? (index % 2) : (1 - (index % 2));
    } else {
        delayIndex = scrollDirection === "down" ? (1 - (index % 2)) : (index % 2);
    }

    const cssDelay = delayIndex * 300;
    const lottieDelay = delayIndex * 300 + 250;

    return (
        <div
            ref={cardRef}
            onMouseEnter={() => setHovered(index)}
            onMouseLeave={() => setHovered(null)}
            // Card is 'group/card'. 
            // On grid hover: all cards get a faint white glow.
            // On card hover: this card isolates and gets a strong branded radial glow, while others fade back.
            className={`group/card relative p-8 md:p-12 flex flex-col gap-8 transition-all duration-700 hover:-translate-y-1 z-10 hover:z-20 ${isInView ? "opacity-100 xl:translate-y-0" : "opacity-0 xl:translate-y-8"
                }`}
            style={{
                transitionDelay: `${cssDelay}ms`,
                willChange: "transform, opacity"
            }}
        >
            {/* Conditionally render the structural dividing lines inside the cards so the hover glow perfectly traces them */}
            {/* Top inner border (for bottom row) */}
            {index > 1 && <div className="hidden md:block absolute top-0 left-0 right-0 h-px bg-white/5 z-[5]" />}
            {/* Left inner border (for right column) */}
            {index % 2 !== 0 && <div className="hidden md:block absolute top-0 bottom-0 left-0 w-px bg-white/5 z-[5]" />}

            {/* Background Hover Illuminations */}
            {/* 1. The collective grid glow - SCROLL PERFORMANCE OPTIMIZATION: Removed opacity transition, made static faint background to prevent whole-grid layer repaints */}
            <div className="absolute inset-0 bg-white/[0.01] pointer-events-none z-0" />

            {/* 2. The isolated card glow */}
            <div
                className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none z-0"
                style={{
                    background: `radial-gradient(circle at center, ${benefit.color}15 0%, transparent 70%)`
                }}
            />

            {/* 3. The isolated card outline: Lightweight inset shadow approach */}
            <div
                className="absolute inset-px pointer-events-none opacity-100 group-hover/card:opacity-100 transition-opacity duration-500 z-10"
                style={{
                    boxShadow: isHovered
                        ? `inset 0 0 0 1px ${benefit.color}60, inset 0 0 20px ${benefit.color}20`
                        : `inset 0 0 0 1px rgba(255,255,255,0.03)`
                }}
            />

            {/* RESTORED: Premium glowing border, optimized by opacity fading so it costs zero GPU when not hovered */}
            <div
                className="animated-glow-border opacity-0 group-hover/card:opacity-100 transition-opacity duration-700 pointer-events-none"
                style={{
                    background: `conic-gradient(from calc(var(--gradient-angle) * 1), transparent 25%, ${benefit.color} 45%, ${benefit.color} 55%, transparent 75%)`
                }}
            />

            {/* Corner Alignment Marks (Positioned to center inside a global grid cell)

                The global grid is 50px (mobile), 75px (tablet), 100px (desktop).
                To sit "inside the center of a cell", we offset them down and inwards.
                Given a 100px grid on desktop, 50px offset places it dead center of the first available top-left cell.
            */}
            <div className="absolute bottom-[25px] right-[25px] md:bottom-[37.5px] md:right-[37.5px] lg:bottom-[50px] lg:right-[50px] w-1 h-1 bg-white/[0.25] pointer-events-none z-10 transition-colors duration-500 group-hover/card:bg-[#f5a524] translate-x-1/2 translate-y-1/2" />

            {/* Technical Header */}
            <div className="flex justify-between items-start relative z-10">
                <div className="flex flex-col gap-2">
                    <span className="font-mono text-[10px] tracking-widest uppercase flex items-center gap-2" style={{ color: "#f5a524" }}>
                        <span className="opacity-60">//</span> 0{index + 1}
                    </span>
                    <div className="h-px bg-white/[0.15] w-24 my-2" />
                    <h3 className="font-nohemi font-medium text-2xl lg:text-3xl text-transparent bg-clip-text bg-gradient-to-b from-white from-[40%] to-zinc-700 group-hover/card:to-white transition-all duration-300">
                        {benefit.title}
                    </h3>
                </div>
                <BenefitIconWebP
                    src={benefit.iconSrc}
                    isActive={isHovered}
                />
            </div>

            {/* Annotation copy */}
            <p className="font-body type-functional-light text-sm md:text-base text-zinc-400 opacity-70 leading-relaxed max-w-sm whitespace-pre-line relative z-10 group-hover/card:text-zinc-200 group-hover/card:opacity-100 transition-all duration-500">
                {benefit.description}
            </p>
        </div>
    );
}
