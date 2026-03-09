import React from "react";
import { MotionValue } from "framer-motion";

export interface WordRevealProps {
    children: React.ReactNode;
    progress?: MotionValue<number>; // Kept for backwards compatibility but unused internally
    range: [number, number];
}

export interface WordRevealColors {
    /** Start color (dim state) */
    from: string;
    /** End color (revealed state) */
    to: string;
}

/**
 * Scroll-driven word reveal — heavily optimized to use exactly zero JS hooks per word.
 * Parent controls `--progress` CSS var via Framer Motion, and children use CSS calc() 
 * and color-mix() to run the interpolation natively on the browser compositor.
 */
export const Word = ({ children, range, colors }: WordRevealProps & { colors: WordRevealColors }) => {
    return (
        <span
            className="relative"
            style={{
                "--start": range[0],
                "--end": range[1],
                "--color-from": colors.from,
                "--color-to": colors.to,
                opacity: "calc(0.25 + 0.75 * clamp(0, (var(--progress, 0) - var(--start)) / (var(--end) - var(--start)), 1))",
                color: "color-mix(in srgb, var(--color-to) calc(clamp(0, (var(--progress, 0) - var(--start)) / (var(--end) - var(--start)), 1) * 100%), var(--color-from))"
            } as React.CSSProperties}
        >
            {children}
        </span>
    );
};

/**
 * Scroll-driven highlighted word — opacity only, color comes from parent CSS.
 */
export const HighlightedWord = ({ children, range }: WordRevealProps) => {
    return (
        <span
            style={{
                "--start": range[0],
                "--end": range[1],
                opacity: "calc(0.4 + 0.6 * clamp(0, (var(--progress, 0) - var(--start)) / (var(--end) - var(--start)), 1))"
            } as React.CSSProperties}
        >
            {children}
        </span>
    );
};
