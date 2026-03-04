import { motion, useTransform, MotionValue } from "framer-motion";

export interface WordRevealProps {
    children: string;
    progress: MotionValue<number>;
    range: [number, number];
}

export interface WordRevealColors {
    /** Start color (dim state) */
    from: string;
    /** End color (revealed state) */
    to: string;
}

/**
 * Scroll-driven word reveal — opacity + color interpolation.
 * Accepts color config so a single component serves both dark-on-light
 * and light-on-dark sections.
 */
export const Word = ({ children, progress, range, colors }: WordRevealProps & { colors: WordRevealColors }) => {
    const opacity = useTransform(progress, range, [0.25, 1]);
    const color = useTransform(progress, range, [colors.from, colors.to]);

    return (
        <motion.span className="relative" style={{ opacity, color }}>
            {children}
        </motion.span>
    );
};

/**
 * Scroll-driven highlighted word — opacity only, color comes from parent CSS.
 */
export const HighlightedWord = ({ children, progress, range }: WordRevealProps) => {
    const opacity = useTransform(progress, range, [0.4, 1]);

    return (
        <motion.span style={{ opacity }}>
            {children}
        </motion.span>
    );
};
