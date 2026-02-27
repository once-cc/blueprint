import { useState, useRef, useEffect } from "react";
import { useInView } from "framer-motion";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export const ScrambleText = ({ text }: { text: string }) => {
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-10% 0px" });

    useEffect(() => {
        if (!isInView || !ref.current) return;

        let iteration = 0;
        // 1.5s total duration. If interval is 30ms, we need 50 iterations.
        const maxIterations = 50;
        const intervalMs = 30;

        // Set initial text to prevent pop-in delay
        ref.current.innerText = text;

        const interval = setInterval(() => {
            if (!ref.current) return;

            ref.current.innerText = text.split("").map((char, index) => {
                if (index < Math.floor(iteration / (maxIterations / text.length))) {
                    return char;
                }
                return CHARS[Math.floor(Math.random() * CHARS.length)];
            }).join("");

            if (iteration >= maxIterations) {
                clearInterval(interval);
                if (ref.current) ref.current.innerText = text;
            }
            iteration++;
        }, intervalMs);

        return () => clearInterval(interval);
    }, [text, isInView]);

    return <span ref={ref} className="inline-block tabular-nums min-w-[2.2ch]">{text}</span>;
};
