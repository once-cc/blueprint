import { useRef, useEffect } from "react";
import { useInView, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface TextRevealParagraphProps {
    lines: string[];
    amberWords?: string[];
    dimWords?: string[];
    onStateChange?: (isVisible: boolean, durationMs: number) => void;
    className?: string;
    textClassName?: string;
    activeColor?: string;
    inactiveColor?: string;
    globalLineOffset?: number;
    scrollDirection?: "down" | "up";
}

const BENEFIT_COLORS = {
    from: "hsla(220, 12%, 50%, 0.25)",
    to: "hsl(45, 10%, 92%)",
};

export function TextRevealParagraph({
    lines,
    amberWords = [],
    dimWords = [],
    onStateChange,
    className,
    textClassName,
    activeColor = BENEFIT_COLORS.to,
    inactiveColor = BENEFIT_COLORS.from,
    globalLineOffset = 0,
    scrollDirection = "down"
}: TextRevealParagraphProps) {
    const textRef = useRef<HTMLSpanElement>(null);
    const isTextInView = useInView(textRef, { margin: "0px 0px -20% 0px", once: false });

    const totalWords = lines.reduce((acc, line) => acc + line.split(" ").length, 0);

    useEffect(() => {
        if (onStateChange) {
            onStateChange(isTextInView, (totalWords * 30) + 500);
        }
    }, [isTextInView, totalWords, onStateChange]);

    const totalLines = lines.length;

    return (
        <span ref={textRef} className={cn("block mb-10 md:mb-14 last:mb-0", className)}>
            {lines.map((line, lIdx) => {
                const words = line.split(" ");
                let delayIndex: number;

                // 1. Calculate the foundational line delay identical to our offset sequencing
                if (isTextInView) {
                    delayIndex = scrollDirection === "down"
                        ? (globalLineOffset * 0.7) + lIdx
                        : (globalLineOffset * 0.7) + (totalLines - 1 - lIdx);
                } else {
                    delayIndex = scrollDirection === "down"
                        ? (globalLineOffset * 0.7) + lIdx
                        : (globalLineOffset * 0.7) + (totalLines - 1 - lIdx);
                }

                // Instead of staggering whole lines by 200ms, line chunks still start at 200ms, 
                // but child words increment off that foundation.
                const lineBaseDelayS = (delayIndex * 200) / 1000;

                return (
                    <span key={lIdx} className={cn("block relative", textClassName)}>
                        {words.map((word, wIdx) => {
                            const cleanWord = word.replace(/[.,]/g, '');
                            const isAmber = amberWords.some(w => word.includes(w) || cleanWord === w);
                            const isDim = dimWords.some(w => word.includes(w) || cleanWord === w);

                            let highlightClass = "";
                            let finalColor = activeColor;

                            // Framer Motion struggles to cross-fade `color` with `linear-gradient` via standard CSS properties.
                            // To animate gradients on text, we must:
                            // 1. Maintain the CSS inline `-webkit-text-fill-color: transparent` to punch out the letters
                            // 2. Animate opacity instead of color, letting the background gradient class show through.
                            const hasGradientClass = isAmber || isDim;

                            if (isAmber) {
                                highlightClass = "text-transparent bg-clip-text bg-gradient-to-b from-[hsl(38_85%_55%)] from-[10%] to-[hsl(38_85%_30%)] italic font-medium";
                            } else if (isDim) {
                                highlightClass = "text-transparent bg-clip-text bg-gradient-to-b from-zinc-600 from-[30%] to-zinc-800 italic font-medium";
                            }

                            // Calculate individual character/word micro-stagger incremented from the base line delay
                            // We offset every word sequentially across the line by a fast 0.05 seconds (50ms).
                            const wordSequenceDelay = scrollDirection === "down" ? wIdx : (words.length - 1 - wIdx);
                            const animationDelayS = lineBaseDelayS + (wordSequenceDelay * 0.04);

                            // If we have a gradient class, we DO NOT animate Framer Motion's `color` property.
                            // Doing so overrides the CSS `transparent` fill, breaking the gradient backgrounds.

                            return (
                                <span key={wIdx} className="inline-block whitespace-pre-wrap">
                                    <motion.span
                                        initial={{
                                            opacity: 0.2,
                                            ...(hasGradientClass ? {} : { color: inactiveColor })
                                        }}
                                        animate={
                                            isTextInView
                                                ? {
                                                    opacity: 1,
                                                    ...(hasGradientClass ? {} : { color: activeColor })
                                                }
                                                : {
                                                    opacity: 0.2,
                                                    ...(hasGradientClass ? {} : { color: inactiveColor })
                                                }
                                        }
                                        transition={{
                                            duration: 0.4,
                                            delay: animationDelayS,
                                            ease: "easeOut",
                                            opacity: { duration: 0.5, delay: animationDelayS },
                                            ...(hasGradientClass ? {} : { color: { duration: 0.8, delay: animationDelayS } })
                                        }}
                                        className={cn("relative inline-block", highlightClass)}
                                        style={hasGradientClass
                                            ? { paddingRight: "0.15em", marginRight: "-0.15em", WebkitTextFillColor: "transparent" }
                                            : {}}
                                    >
                                        {word}
                                    </motion.span>
                                    {wIdx !== words.length - 1 && " "}
                                </span>
                            );
                        })}
                    </span>
                );
            })}
        </span>
    );
}
