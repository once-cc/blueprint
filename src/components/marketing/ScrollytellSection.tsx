import { useRef, useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { GridSection } from "@/components/ui/grid-section";
import { TextRevealParagraph } from "@/components/ui/TextRevealParagraph";
const noiseTexture = "/noise/noise.png";

export function ScrollytellSection() {
    const containerRef = useRef<HTMLElement>(null);
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

    const paragraphs = [
        [
            "Success comes from what most miss.",
            "\u00A0",
            "Mistaking motion for direction.",
            "Chasing features instead of foundation.",
            "Spending capital without return."
        ],
        [
            "So we created the 3D Framework."
        ],
        [
            "Discovery removes uncertainty.",
            "Design removes misperception.",
            "Delivery removes fragmentation."
        ],
        [
            "The Crafted Blueprint for your next asset."
        ]
    ];

    const amberWords = [
        "Success", "direction.", "foundation.", "return.", "Discovery", "Design", "Delivery", "asset."
    ];

    const dimWords = [
        "miss.", "Mistaking", "Chasing", "Spending", "uncertainty.", "misperception.", "fragmentation."
    ];

    const allParagraphsLength = paragraphs.reduce((acc, p) => acc + p.length, 0);
    let lineCountSoFar = 0;

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
                <div className="max-w-4xl mx-auto text-center flex flex-col items-center relative">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        style={{ willChange: "transform, opacity" }}
                        className="mb-8"
                    >
                        <span className="font-nohemi font-medium tracking-widest text-[10px] md:text-sm text-accent uppercase flex items-center justify-center gap-2">
                            <span className="text-accent/60">//</span> The Foundation
                        </span>
                    </motion.div>

                    <h2
                        className="font-nohemi font-medium text-2xl md:text-4xl lg:text-5xl leading-[1.2] tracking-tight block w-full text-center"
                    >
                        {paragraphs.map((lines, i) => {
                            // When scrolling down, Paragraph 1 enters first (offset 0), Paragraph 2 second (offset 5)
                            // When scrolling up, Paragraph 4 enters first. Its offset should be 0.
                            const offsetDown = lineCountSoFar;
                            const offsetUp = allParagraphsLength - lineCountSoFar - lines.length;

                            const offset = scrollDirection === "down" ? offsetDown : offsetUp;

                            lineCountSoFar += lines.length;

                            return (
                                <TextRevealParagraph
                                    key={i}
                                    lines={lines}
                                    amberWords={amberWords}
                                    dimWords={dimWords}
                                    globalLineOffset={offset}
                                    scrollDirection={scrollDirection}
                                />
                            );
                        })}
                    </h2>
                </div>
            </div>
        </GridSection>
    );
}
