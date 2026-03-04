import { useRef } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { GridSection } from "@/components/ui/grid-section";
import { Word, HighlightedWord, type WordRevealColors } from "@/components/ui/WordReveal";

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

    const text = "Most websites fail before they're built. They begin with assumptions. They skip alignment. They rush execution. We don't. Discovery removes uncertainty. Design removes misperception. Delivery removes fragmentation. Nothing is built without clarity.";
    const words = text.split(" ");

    return (
        <GridSection ref={containerRef} className="relative py-24 md:py-32 bg-[hsl(220_15%_4%)] shadow-[inset_0_0_0_1px_hsl(220_12%_20%_/_0.15),inset_0_2px_15px_rgba(0,0,0,0.8)] overflow-hidden">
            {/* Architectural Bevel Lighting (from ConfiguratorCardSurface) */}
            <div className="absolute inset-x-0 -bottom-1/2 h-full z-0 pointer-events-none bg-[radial-gradient(80%_40%_at_50%_100%,hsl(37_91%_55%_/_0.03),transparent_70%)]" />
            <div className="absolute inset-0 z-0 pointer-events-none bg-[linear-gradient(to_bottom,hsl(45_10%_92%_/_0.02),transparent_40%)]" />

            {/* ══ SUBSTRATE ENHANCEMENT LAYERS ══ */}

            {/* Layer 1: Micro Film Grain — SVG feTurbulence noise (reused from ConfiguratorCardSurface) */}
            {/* baseFrequency tuned to 0.65 for a coarser, fibrous matte-paper feel */}
            <div className="absolute inset-0 z-[1] pointer-events-none opacity-[0.25] mix-blend-soft-light" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

            {/* Layer 2: Luminance Falloff — Left-biased radial lift for reading focus + edge darkening */}
            <div className="absolute inset-0 z-[1] pointer-events-none bg-[radial-gradient(60%_50%_at_25%_40%,hsl(220_10%_12%_/_0.5),transparent_70%)]" />
            <div className="absolute inset-0 z-[1] pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_35%,hsl(220_15%_2%_/_0.75)_100%)]" />

            {/* Layer 4: Micro Chromatic Drift — Cool shadows in corners, warm centre */}
            <div className="absolute inset-0 z-[1] pointer-events-none bg-[radial-gradient(70%_60%_at_30%_45%,hsl(37_30%_55%_/_0.07),transparent_70%)]" />
            <div className="absolute inset-0 z-[1] pointer-events-none bg-[radial-gradient(50%_50%_at_85%_80%,hsl(220_40%_30%_/_0.08),transparent_60%)]" />

            {/* Layer 6: Ghost Editorial Grid — barely perceivable brand continuity */}
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

                    <h2 className="font-nohemi font-medium text-3xl md:text-5xl lg:text-6xl leading-[1.2] tracking-tight block w-full text-left">
                        {/* Indent element to push the first line over on desktop */}
                        <div className="hidden md:block float-left w-[160px] lg:w-[200px] h-4" aria-hidden="true" />

                        {words.map((word, i) => {
                            const start = i / words.length;
                            const end = start + 1 / words.length;

                            // Add line breaks after specific sentences to match exactly the user's requested layout
                            const isSingleBreak = word.includes("built.") || word.includes("uncertainty.") || word.includes("misperception.") || word.includes("fragmentation.");
                            const isDoubleBreak = word.includes("execution.") || word.includes("don't.");

                            if (["fail", "assumptions.", "alignment.", "rush", "execution.", "don't.", "uncertainty.", "misperception.", "fragmentation.", "clarity."].some(w => word.includes(w))) {
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
                    </h2>
                </div>
            </div>
        </GridSection>
    );
}
