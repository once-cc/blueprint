import { useRef } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { GridSection } from "@/components/ui/grid-section";

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

export function ScrollytellSection() {
    const containerRef = useRef<HTMLElement>(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start center", "end center"],
    });

    const text = "Most websites fail before they're built. They begin with assumptions. They skip alignment. They rush execution. We don't. Discovery removes uncertainty. Design removes misperception. Delivery removes fragmentation. Nothing is built without clarity.";
    const words = text.split(" ");

    return (
        <GridSection ref={containerRef} className="relative py-24 md:py-32 bg-muted/30">
            <div className="container mx-auto px-6 overflow-hidden">
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
        </GridSection>
    );
}
