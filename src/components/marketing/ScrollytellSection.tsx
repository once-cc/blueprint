import { useRef } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { GridSection } from "@/components/ui/grid-section";
import { Word, HighlightedWord, type WordRevealColors } from "@/components/ui/WordReveal";
const noiseTexture = "/noise/noise.png";

const SCROLLYTELL_COLORS: WordRevealColors = {
    from: "hsla(220, 12%, 50%, 0.25)",
    to: "hsl(45, 10%, 92%)",
};

export function ScrollytellSection() {
    const containerRef = useRef<HTMLElement>(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start center", "end center"],
    });

    const text = "Most digital projects fail before they're built. They begin with assumptions. They skip alignment. They rush execution. We don't. Discovery removes uncertainty. Design removes misperception. Delivery removes fragmentation. Nothing is built without clarity.";
    const words = text.split(" ");

    return (
        <GridSection ref={containerRef} className="relative py-24 md:py-32 overflow-hidden z-20 bg-[hsl(220_15%_4%)] shadow-[inset_0_0_0_1px_hsl(220_12%_20%_/_0.15),inset_0_2px_15px_rgba(0,0,0,0.8)]">
            {/* ══ SUBSTRATE ENHANCEMENT LAYERS ══ */}
            {/* Consolidated: 6 gradient layers merged into one multi-background div. */}
            {/* Film grain stays separate. */}
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

            {/* Film Grain — replaced mix-blend-soft-light SVG math with static zero-cost WebP */}
            <div
                className="absolute inset-0 z-[1] pointer-events-none opacity-[0.25]"
                style={{ backgroundImage: `url(${noiseTexture})` }}
            />

            {/* Ghost Editorial Grid */}
            <div className="absolute inset-0 z-[1] pointer-events-none bg-editorial-grid opacity-[0.12]" />

            {/* True Edge Docking Rails spanning the entire section height */}
            <div className="absolute inset-0 pointer-events-none z-0 flex justify-center">
                <div className="w-full flex justify-center container mx-auto px-4 md:px-6 relative">
                    <div className="w-full md:max-w-[90vw] lg:max-w-[1240px] relative">
                        <div className="absolute top-0 bottom-0 left-0 w-px bg-white/10" />
                        <div className="absolute top-0 bottom-0 right-0 w-px bg-white/10" />
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-10 md:px-6 overflow-hidden relative z-10">
                <div className="max-w-[90ch] mx-auto text-left relative flex flex-col md:block">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-8 md:mb-0 md:absolute md:top-2 md:left-0"
                    >
                        <span className="font-nohemi font-medium tracking-widest text-[10px] md:text-sm text-accent uppercase flex items-center gap-2">
                            <span className="text-accent/60">//</span> The Foundation
                        </span>
                    </motion.div>

                    <motion.h2
                        className="font-nohemi font-medium text-3xl md:text-5xl lg:text-6xl leading-[1.2] tracking-tight block w-full text-left"
                        style={{ "--progress": scrollYProgress } as React.CSSProperties}
                    >
                        {/* Indent element to push the first line over on desktop */}
                        <div className="hidden md:block float-left w-[160px] lg:w-[200px] h-4" aria-hidden="true" />

                        {words.map((word, i) => {
                            const start = i / words.length;
                            const end = start + 1 / words.length;

                            // Add line breaks after specific sentences to match exactly the user's requested layout
                            const isSingleBreak = word.includes("built.") || word.includes("uncertainty.") || word.includes("misperception.") || word.includes("fragmentation.");
                            const isDoubleBreak = word.includes("execution.") || word.includes("don't.");

                            const isHighlighted = ["fail", "assumptions.", "alignment.", "rush", "execution.", "don't.", "uncertainty.", "misperception.", "fragmentation.", "clarity."].some(w => word.includes(w));

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
                                    <Word progress={scrollYProgress} range={[start, end]} colors={SCROLLYTELL_COLORS}>
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
        </GridSection>
    );
}
