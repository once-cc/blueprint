import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { ShieldCheck, Zap, LineChart, Target } from "lucide-react";
import { GridSection } from "@/components/ui/grid-section";

const benefits = [
    {
        title: "Total Clarity",
        description: "See exactly what will be built. How it converts. And why each decision exists — before committing to execution.\nNo ambiguity.\nNo surprises.",
        icon: ShieldCheck,
        color: "hsl(220 12% 40%)" // Muted metallic
    },
    {
        title: "Zero Technical Overload",
        description: "Everything is defined as one cohesive system.\nNo guesswork.\nNo patchwork.\nNo operational confusion.\nSimply select the strategic direction — so the build begins clean.",
        icon: Zap,
        color: "hsl(38 85% 55%)" // Accent gold
    },
    {
        title: "Designed for Longevity",
        description: "The Crafted Blueprint creates assets designed to increase in value as your business grows.\nNot a pretty page.\nBut an appreciating asset.",
        icon: LineChart,
        color: "hsl(142 71% 45%)" // Success green
    },
    {
        title: "Decision Confidence",
        description: "Instead of conveying abstract ideas, you build a clear directional blueprint.\nYou design direction once — not through endless revisions.\nThe Crafted Blueprint becomes your reference point when building your asset that will grow your business for many years to come.",
        icon: Target,
        color: "hsl(221 83% 53%)" // Trust blue
    }
];

interface WordRevealProps {
    children: string;
    progress: MotionValue<number>;
    range: [number, number];
}

const Word = ({ children, progress, range }: WordRevealProps) => {
    const opacity = useTransform(progress, range, [0.25, 1]);
    const color = useTransform(progress, range, ["hsla(220, 12%, 50%, 0.25)", "hsl(45, 10%, 92%)"]);

    return (
        <motion.span className="relative transition-colors duration-100" style={{ opacity, color }}>
            {children}
        </motion.span>
    );
};

const HighlightedWord = ({ children, progress, range }: WordRevealProps) => {
    const opacity = useTransform(progress, range, [0.4, 1]);

    return (
        <motion.span style={{ opacity }}>
            {children}
        </motion.span>
    );
};

export function BenefitStackSection() {
    const containerRef = useRef<HTMLElement>(null);
    const textRef = useRef<HTMLDivElement>(null);

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
        <GridSection ref={containerRef} className="py-24 md:py-32 bg-muted/30 z-20 relative">
            {/* The Editorial Ramp / Central Spine connecting to next section */}
            <div className="absolute top-0 bottom-0 left-1/2 -ml-px w-px bg-white/[0.03] pointer-events-none hidden md:block" />

            {/* Faint Volumetric Atmospheric Light Rays — clipped to section bounds to prevent touch interception on mobile */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[10%] left-[-10%] w-[50%] h-[120%] bg-gradient-to-r from-transparent via-white/5 to-transparent blur-3xl mix-blend-plus-lighter animate-light-ray-corner opacity-60" />
                <div className="absolute top-[20%] right-[-10%] w-[60%] h-[150%] bg-gradient-to-l from-transparent via-white/[0.02] to-transparent blur-2xl mix-blend-plus-lighter animate-light-ray-corner-reverse delay-1000 opacity-40" />
            </div>

            {/* True Edge Docking Rails spanning the entire section height */}
            <div className="absolute inset-0 pointer-events-none z-0 flex justify-center">
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

            <div className="container mx-auto px-6 mb-24 relative z-10">
                <div ref={textRef} className="max-w-4xl mx-auto text-center flex flex-col items-center relative">
                    <span className="font-nohemi font-medium tracking-widest text-[10px] md:text-sm text-accent uppercase flex items-center gap-2 mb-8">
                        <span className="text-accent/60">//</span> STRATEGIC CLARITY
                    </span>

                    <h2 className="font-nohemi font-medium text-3xl md:text-5xl lg:text-6xl leading-[1.2] tracking-tight block w-full text-center">
                        {words.map((word, i) => {
                            const start = i / words.length;
                            const end = start + 1 / words.length;

                            const isSingleBreak = ["Blueprint?", "once.", "direction.", "saved.", "protected."].some(w => word.includes(w));
                            const isDoubleBreak = ["expensive.", "systems."].some(w => word.includes(w));

                            const isHighlighted = ["Blueprint?", "expensive.", "direction.", "systems.", "saved.", "protected.", "preserved."].some(w => word.includes(w));

                            if (isHighlighted) {
                                return (
                                    <span key={i}>
                                        <span className="relative italic font-nohemi font-medium text-transparent bg-clip-text bg-gradient-to-b from-zinc-600 from-[50%] to-zinc-950 pr-1.5">
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
                                    <Word progress={scrollYProgress} range={[start, end]}>
                                        {word}
                                    </Word>
                                    {i !== words.length - 1 && " "}
                                    {isSingleBreak && <br />}
                                    {isDoubleBreak && <><br /><br /></>}
                                </span>
                            );
                        })}
                    </h2>
                </div>
            </div>

            {/* Architectural Schematic Grid - Shared CSS Hover Glow */}
            <div className="container mx-auto px-4 md:px-6 relative z-10 flex justify-center">
                <div className="w-full md:max-w-[90vw] lg:max-w-[1240px] relative">

                    {/* The 2x2 Drawn Grid — Using 'group/grid' to track hover over the whole section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="group/grid grid grid-cols-1 md:grid-cols-2 bg-background border-y border-white/10 divide-y divide-white/10 md:divide-y-0 relative shadow-2xl"
                    >
                        {/* Faint Global Editorial Grid behind the cards */}
                        <div className="absolute inset-0 bg-editorial-grid pointer-events-none z-0" />

                        {/* 1. Global Outline: Visible when idle. Fades out immediately when the grid is hovered (since any hover hits a card) */}
                        <div className="animated-glow-border opacity-100 group-hover/grid:opacity-0 transition-opacity duration-700 z-10" />

                        {benefits.map((benefit, i) => (
                            <div
                                key={i}
                                // Card is 'group/card'. 
                                // On grid hover: all cards get a faint white glow.
                                // On card hover: this card isolates and gets a strong branded radial glow, while others fade back.
                                className="group/card relative p-8 md:p-12 flex flex-col gap-8 transition-all duration-500"
                            >
                                {/* Conditionally render the structural dividing lines inside the cards so the hover glow perfectly traces them */}
                                {/* Top inner border (for bottom row) */}
                                {i > 1 && <div className="hidden md:block absolute top-0 left-0 right-0 h-px bg-white/10 z-[5]" />}
                                {/* Left inner border (for right column) */}
                                {i % 2 !== 0 && <div className="hidden md:block absolute top-0 bottom-0 left-0 w-px bg-white/10 z-[5]" />}

                                {/* Background Hover Illuminations */}
                                {/* 1. The collective grid glow (faint white, appears when hovering anywhere in the grid, but hides if hovering on THIS card) */}
                                <div className="absolute inset-0 bg-white/[0.02] opacity-0 group-hover/grid:opacity-100 group-hover/card:!opacity-0 transition-opacity duration-700 pointer-events-none z-0" />

                                {/* 2. The isolated card glow (branded radial gradient, appears ONLY when hovering on THIS specific card) */}
                                <div
                                    className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none z-0"
                                    style={{
                                        background: `radial-gradient(circle at center, ${benefit.color}15 0%, transparent 70%)`
                                    }}
                                />

                                {/* 3. The isolated card outline (CSS mask shiny border! isolated strictly to THIS card) */}
                                <div className="animated-glow-border opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 z-10" />

                                {/* Technical Header */}
                                <div className="flex justify-between items-start relative z-10">
                                    <div className="flex flex-col gap-2">
                                        <span className="font-mono text-[10px] tracking-widest uppercase flex items-center gap-2" style={{ color: benefit.color }}>
                                            <span className="opacity-60">//</span> 0{i + 1}
                                        </span>
                                        <h3 className="font-nohemi font-medium text-2xl lg:text-3xl text-foreground group-hover/card:text-white transition-colors duration-300">
                                            {benefit.title}
                                        </h3>
                                    </div>
                                    <div
                                        className="relative w-12 h-12 rounded bg-background border border-white/10 flex items-center justify-center flex-shrink-0 transition-all duration-500"
                                        style={{ borderColor: "rgba(255,255,255,0.1)" }}
                                    >
                                        <benefit.icon className="w-5 h-5 opacity-80 group-hover/card:opacity-100 transition-opacity" style={{ color: benefit.color }} />
                                    </div>
                                </div>

                                {/* Annotation copy */}
                                <p className="font-body type-functional-light text-sm md:text-base text-muted-foreground leading-relaxed max-w-sm whitespace-pre-line relative z-10 group-hover/card:text-zinc-300 transition-colors duration-500">
                                    {benefit.description}
                                </p>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </GridSection>
    );
}
