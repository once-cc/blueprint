import { useRef } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { GridSection } from "@/components/ui/grid-section";

interface WordRevealProps {
    children: string;
    progress: MotionValue<number>;
    range: [number, number];
}

const Word = ({ children, progress, range }: WordRevealProps) => {
    const opacity = useTransform(progress, range, [0.3, 1]);
    const highlight = useTransform(
        progress,
        range,
        ["hsl(220 12% 8% / 0.4)", "hsl(45 10% 92%)"] // muted to foreground
    );

    return (
        <span className="relative">
            <motion.span
                style={{ opacity: 1, color: highlight }}
                className="transition-colors duration-100"
            >
                {children}
            </motion.span>
        </span>
    );
};

export function ScrollytellSection() {
    const containerRef = useRef<HTMLElement>(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start center", "end center"],
    });

    const text = "A meticulously engineered framework. We eliminate guesswork by defining your entire digital architecture before development begins. The result is a high-performance ecosystem designed exclusively to convert.";
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
                        <span className="font-display type-structural-bold tracking-widest text-[10px] md:text-sm text-accent uppercase flex items-center gap-2">
                            <span className="text-accent/60">//</span> The Foundation
                        </span>
                    </motion.div>

                    <h2 className="font-display heading-editorial text-2xl md:text-4xl lg:text-[2.75rem] leading-[1.2] tracking-tight block w-full text-left">
                        {/* Indent element to push the first line over on desktop */}
                        <div className="hidden md:block float-left w-[160px] lg:w-[200px] h-4" aria-hidden="true" />

                        {words.map((word, i) => {
                            const start = i / words.length;
                            const end = start + 1 / words.length;

                            // Apply specific styling to key words for cinematic effect
                            if (["engineered", "framework.", "guesswork", "digital", "architecture", "high-performance", "ecosystem", "convert."].some(w => word.includes(w))) {
                                return (
                                    <span key={i}>
                                        <span className="relative italic text-accent font-medium">
                                            <motion.span
                                                style={{
                                                    opacity: useTransform(scrollYProgress, [start, end], [0.3, 1])
                                                }}
                                            >
                                                {word}
                                            </motion.span>
                                        </span>
                                        {i !== words.length - 1 && " "}
                                    </span>
                                );
                            }

                            return (
                                <span key={i}>
                                    <Word progress={scrollYProgress} range={[start, end]}>
                                        {word}
                                    </Word>
                                    {i !== words.length - 1 && " "}
                                </span>
                            );
                        })}
                    </h2>
                </div>
            </div>
        </GridSection>
    );
}
