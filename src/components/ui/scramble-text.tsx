import { useRef, useEffect } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export const ScrambleText = ({ text }: { text: string }) => {
    const ref = useRef<HTMLSpanElement>(null);
    const hasTriggered = useRef(false);

    // Native IntersectionObserver — avoids React state updates on scroll boundaries
    useEffect(() => {
        if (!ref.current) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting && !hasTriggered.current) {
                    hasTriggered.current = true;
                    observer.disconnect();

                    let iteration = 0;
                    const maxIterations = 50;
                    const intervalMs = 30;

                    if (ref.current) ref.current.innerText = text;

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
                }
            });
        }, {
            rootMargin: "-10% 0px"
        });

        observer.observe(ref.current);
        return () => observer.disconnect();
    }, [text]);

    return <span ref={ref} className="inline-block tabular-nums min-w-[2.2ch]">{text}</span>;
};
