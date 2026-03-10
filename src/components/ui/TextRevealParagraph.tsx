import { useRef, useEffect, useState } from "react";
import { useInView, useScroll, useMotionValueEvent } from "framer-motion";
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
    inactiveColor = BENEFIT_COLORS.from
}: TextRevealParagraphProps) {
    const textRef = useRef<HTMLSpanElement>(null);
    const isTextInView = useInView(textRef, { margin: "0px 0px -20% 0px", once: false });

    const totalWords = lines.reduce((acc, line) => acc + line.split(" ").length, 0);

    // Track scroll direction so the text can cascade in reverse when scrolling back up
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

    useEffect(() => {
        if (onStateChange) {
            onStateChange(isTextInView, (totalWords * 30) + 500);
        }
    }, [isTextInView, totalWords, onStateChange]);

    let wordCounter = 0;

    return (
        <span ref={textRef} className={cn("block mb-10 md:mb-14 last:mb-0", className)}>
            {lines.map((line, lIdx) => {
                const words = line.split(" ");
                const segments: React.ReactNode[] = [];
                let currentNormalChunk = "";

                words.forEach((word, wIdx) => {
                    const cleanWord = word.replace(/[.,]/g, ''); // For matching purposes
                    const isAmber = amberWords.some(w => word.includes(w) || cleanWord === w);
                    const isDim = dimWords.some(w => word.includes(w) || cleanWord === w);

                    if (isAmber || isDim) {
                        if (currentNormalChunk) {
                            segments.push(<span key={`n${wIdx}`}>{currentNormalChunk}</span>);
                            currentNormalChunk = "";
                        }

                        const highlightClass = isAmber
                            ? "text-[hsl(38_85%_55%)] italic font-medium" // Option B: Accent amber without expensive drop-shadow
                            : "text-zinc-600 italic font-medium"; // Dim actions

                        segments.push(
                            <span
                                key={`h${wIdx}`}
                                className={cn("relative font-nohemi inline-block transition-colors duration-700", highlightClass)}
                            >
                                {word}
                            </span>
                        );
                        if (wIdx !== words.length - 1) segments.push(<span key={`s${wIdx}`}> </span>);
                    } else {
                        currentNormalChunk += word + (wIdx !== words.length - 1 ? " " : "");
                    }
                });
                if (currentNormalChunk) {
                    segments.push(<span key="end">{currentNormalChunk}</span>);
                }

                // Reverse the delay index if scrolling upwards
                const totalLines = lines.length;
                const delayIndex = scrollDirection === "down" ? lIdx : (totalLines - 1 - lIdx);
                const delayMs = delayIndex * 300;

                return (
                    <span key={lIdx} className="block relative">
                        <span
                            className={cn("block transition-all duration-1000 ease-out", textClassName)}
                            style={{
                                color: activeColor,
                                WebkitMaskImage: `linear-gradient(to left, rgba(0,0,0,0.05) 40%, black 60%)`,
                                WebkitMaskSize: '300% 100%',
                                // 100% 0% puts the pure black on the far left (hidden).
                                // 0% 0% shifts the mask entirely to the right (fully revealed).
                                WebkitMaskPosition: isTextInView ? '0% 0%' : '100% 0%',
                                maskImage: `linear-gradient(to left, rgba(0,0,0,0.05) 40%, black 60%)`,
                                maskSize: '300% 100%',
                                maskPosition: isTextInView ? '0% 0%' : '100% 0%',
                                transitionDelay: `${delayMs}ms`,
                                transitionProperty: 'all, mask-position, -webkit-mask-position',
                            }}
                        >
                            {segments}
                        </span>
                    </span>
                );
            })}
        </span>
    );
}
