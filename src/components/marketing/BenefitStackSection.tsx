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
        <GridSection ref={containerRef} className="py-24 md:py-32 bg-muted/30 z-20 overflow-visible relative">
            {/* The Editorial Ramp / Central Spine connecting to next section */}
            <div className="absolute top-0 bottom-0 left-1/2 -ml-px w-px bg-white/[0.03] pointer-events-none hidden md:block" />

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

            {/* Architectural Schematic Grid */}
            <div className="container mx-auto px-4 md:px-6 relative z-10 flex justify-center">
                <div className="w-full md:max-w-[90vw] lg:max-w-[1240px] relative">

                    {/* True Edge Docking Rails extending upwards from the grid's literal bounds */}
                    <div className="absolute -top-[500px] bottom-[100px] md:bottom-0 left-0 w-px bg-white/10 pointer-events-none z-20" />
                    <div className="absolute -top-[500px] bottom-[100px] md:bottom-0 right-0 w-px bg-white/10 pointer-events-none z-20" />

                    {/* The 2x2 Drawn Grid */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="grid grid-cols-1 md:grid-cols-2 bg-background border-y border-white/10 divide-y divide-white/10 md:divide-y-0 relative shadow-2xl"
                    >
                        {/* Horizontal divider for desktop row 2 */}
                        <div className="hidden md:absolute md:block top-1/2 left-0 right-0 h-px bg-white/10 z-0 pointer-events-none" />
                        {/* Vertical divider for desktop col 2 */}
                        <div className="hidden md:absolute md:block top-0 bottom-0 left-1/2 w-px bg-white/10 z-0 pointer-events-none" />

                        {benefits.map((benefit, i) => (
                            <div
                                key={i}
                                className="group relative p-8 md:p-12 flex flex-col gap-8 transition-colors duration-500 hover:bg-white/[0.02]"
                            >
                                {/* Technical Header */}
                                <div className="flex justify-between items-start">
                                    <div className="flex flex-col gap-2">
                                        <span className="font-mono text-[10px] tracking-widest uppercase flex items-center gap-2" style={{ color: benefit.color }}>
                                            <span className="opacity-60">//</span> 0{i + 1}
                                        </span>
                                        <h3 className="font-nohemi font-medium text-2xl lg:text-3xl text-foreground group-hover:text-white transition-colors duration-300">
                                            {benefit.title}
                                        </h3>
                                    </div>
                                    <div className="relative w-12 h-12 rounded bg-background border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:border-white/30 transition-colors duration-500">
                                        <benefit.icon className="w-5 h-5 opacity-80" style={{ color: benefit.color }} />
                                    </div>
                                </div>

                                {/* Annotation copy */}
                                <p className="font-body type-functional-light text-sm md:text-base text-muted-foreground leading-relaxed max-w-sm whitespace-pre-line">
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
