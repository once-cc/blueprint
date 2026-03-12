import { useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { processSteps } from "@/data/blueprint";
import { TextRevealParagraph } from "@/components/ui/TextRevealParagraph";

export interface FrameworkMobileCardProps {
    index: number;
    step: typeof processSteps[0];
    isLast: boolean;
}

// ═══════════════════════════════════════════════════════════════
// Per-card color theming — unified mobile map
// ═══════════════════════════════════════════════════════════════

interface CardColorTheme {
    headlineGradient: string;
    headlineExtra?: string;
}

const CARD_THEMES: CardColorTheme[] = [
    {
        // Discovery
        headlineGradient: "bg-gradient-to-b from-zinc-200 to-zinc-600",
    },
    {
        // Design
        headlineGradient: "bg-gradient-to-b from-[#c3bdaf] to-[#c3bdaf]/60",
    },
    {
        // Delivery
        headlineGradient: "bg-gradient-to-b from-[#e8e0d4] to-[#e8e0d4]/60",
    },
];

const EASE_ARCH: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp = (delay: number, y: number = 8) => ({
    initial: { opacity: 0, y },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay, ease: EASE_ARCH },
});

const fadeIn = (delay: number) => ({
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.4, delay, ease: EASE_ARCH },
});

export const FrameworkMobileCard = ({ index, step, isLast }: FrameworkMobileCardProps) => {
    const trackerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(contentRef, { once: true, margin: "-10% 0px -10% 0px" });

    const theme = CARD_THEMES[index] ?? CARD_THEMES[0];

    // ── Scroll choreography ──
    const { scrollYProgress: descendProgress } = useScroll({
        target: trackerRef,
        offset: ["start 0px", "start -100vh"],
    });

    const groupScale = useTransform(descendProgress, [0, 1], [1, isLast ? 1 : 0.85]);
    const groupOpacity = useTransform(
        descendProgress,
        [0, 0.6, 1],
        [1, isLast ? 1 : 1, isLast ? 1 : 0.2]
    );

    const bodyLines = step.description.split("\n");

    return (
        <div
            ref={trackerRef}
            className={`relative w-full ${!isLast ? "h-[150vh] -mb-[50vh]" : ""}`}
            style={isLast ? { height: "calc(100vh + max(50vh - 310px, 5vh))", marginBottom: "calc(-1 * max(50vh - 310px, 5vh))" } : {}}
        >
            <div className="sticky top-0 h-[100vh] w-full px-4 flex flex-col items-center justify-center -translate-y-[2vh]" style={{ zIndex: index, willChange: "transform" }}>
                <motion.div
                    style={{ scale: groupScale, opacity: groupOpacity, willChange: "transform, opacity" }}
                    className="w-full relative ring-1 ring-black/50 rounded-xl"
                >

                    {/* CARD SHELL */}
                    <div
                        ref={contentRef}
                        className="w-full bg-card border border-white/10 rounded-xl relative overflow-hidden h-[620px] max-h-[82vh]"
                        style={{ willChange: "transform" }}
                    >
                        {/* Structural Ticks */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="absolute inset-0 pointer-events-none z-20 rounded-[inherit]"
                        >
                            <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-white/20 rounded-tl-[inherit]" />
                            <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-white/20 rounded-tr-[inherit]" />
                            <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-white/20 rounded-bl-[inherit]" />
                            <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-white/20 rounded-br-[inherit]" />
                        </motion.div>

                        {/* BACKGROUND IMAGE — no fade; card-level motion handles reveal */}
                        <div className="absolute inset-0">
                            <img
                                src={step.mobileImageUrl}
                                srcSet={`${step.mobileImageUrl} 1170w, ${step.imageUrl} 5504w`}
                                sizes="100vw"
                                alt={step.title}
                                decoding="async"
                                width={1170}
                                height={653}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* GRADIENT SCRIMS */}
                        <div className="absolute inset-0 bg-black/40 pointer-events-none" />
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.8)_120%)] pointer-events-none" />

                        {/* EDITORIAL OVERLAYS */}
                        <div
                            className="absolute inset-0 pointer-events-none z-[1]"
                            aria-hidden="true"
                        >
                            <div className="absolute top-0 bottom-0 left-[50%] w-px bg-white/[0.04]" />
                            <div className="absolute left-5 top-[30%] w-2 h-px bg-white/[0.05]" />
                            <div className="absolute left-5 top-[60%] w-2 h-px bg-white/[0.05]" />
                            <div
                                className="absolute inset-0 opacity-[0.02]"
                                style={{
                                    backgroundImage:
                                        "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
                                    backgroundSize: "60px 60px",
                                }}
                            />
                        </div>

                        {/* READING FIELD MASK */}
                        <div
                            className="absolute inset-y-0 left-0 w-[60%] z-[5] pointer-events-none"
                            style={{
                                background: 'linear-gradient(to right, rgba(10,10,15,0.78) 0%, rgba(10,10,15,0.65) 35%, rgba(10,10,15,0.45) 70%, rgba(10,10,15,0.20) 100%)',
                                borderRight: '1px solid rgba(255,255,255,0.05)',
                            }}
                        />

                        {/* CONTENT OVERLAY */}
                        <div className="absolute inset-0 z-10 p-5 flex flex-col justify-between">
                            {/* Amber accent axis */}
                            <motion.div
                                className="absolute top-0 left-5 w-px h-full bg-[#d4a853]/10"
                                {...(isInView
                                    ? {
                                        initial: { opacity: 0 },
                                        animate: { opacity: 1 },
                                        transition: {
                                            duration: 0.6,
                                            delay: 0.2,
                                            ease: EASE_ARCH,
                                        },
                                    }
                                    : { initial: { opacity: 0 } })}
                            />

                            {/* TOP ZONE */}
                            <div className="grid grid-cols-[50%_1fr]">
                                <div>
                                    <motion.span
                                        className="font-nohemi italic font-medium text-base text-[#d4a853] flex items-center gap-2 mb-4"
                                        {...(isInView ? fadeUp(0.3, 6) : { initial: { opacity: 0 } })}
                                    >
                                        <span className="opacity-50">//</span> 0{index + 1}
                                    </motion.span>
                                    <div className="h-px bg-white/[0.15] mb-4 w-24" />

                                    <div className="flex flex-col gap-1" style={{ fontFamily: "var(--font-body)" }}>
                                        <TextRevealParagraph
                                            lines={bodyLines}
                                            className="mb-0 md:mb-0"
                                            textClassName="text-[13px] leading-relaxed"
                                            activeColor="rgba(255,255,255,0.6)"
                                            inactiveColor="rgba(255,255,255,0.15)"
                                        />
                                    </div>
                                </div>
                                <div />
                            </div>

                            {/* BOTTOM ZONE */}
                            <div className="flex flex-col gap-4">
                                {/* Headline */}
                                <div>
                                    <motion.div
                                        className="h-px bg-white/[0.15] mb-3 w-16"
                                        {...(isInView
                                            ? {
                                                initial: {
                                                    scaleX: 0,
                                                    transformOrigin: "left",
                                                },
                                                animate: { scaleX: 1 },
                                                transition: {
                                                    duration: 0.6,
                                                    delay: 0.6,
                                                    ease: EASE_ARCH,
                                                },
                                            }
                                            : { initial: { scaleX: 0 } })}
                                    />
                                    <motion.h3
                                        className="tracking-tight text-3xl leading-none"
                                        style={{ fontFamily: "var(--font-editorial)" }}
                                        {...(isInView
                                            ? fadeUp(0.5, 8)
                                            : { initial: { opacity: 0 } })}
                                    >
                                        <span className={`text-transparent bg-clip-text ${theme.headlineGradient} inline-block ${theme.headlineExtra ?? ""}`} style={{ textShadow: '0px 2px 4px rgba(0,0,0,0.5)' }}>
                                            {step.title}
                                        </span>
                                    </motion.h3>
                                </div>

                                {/* Metadata rows */}
                                <div className="flex flex-col gap-2">
                                    {step.bullets.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center gap-3 border-y border-white/[0.08] px-3 py-2"
                                        >
                                            <div className="relative w-4 h-4 shrink-0 flex items-center justify-center">
                                                <div className="absolute w-2 h-2 bg-[#d4a853]/20 rounded-full" />
                                                <motion.div
                                                    initial={{ scale: 0.8, opacity: 0.5 }}
                                                    animate={isInView ? {
                                                        scale: [0.8, 1.2, 0.8],
                                                        opacity: [0.5, 1, 0.5],
                                                    } : { scale: 0.8, opacity: 0.5 }}
                                                    transition={isInView ? {
                                                        duration: 2.5,
                                                        repeat: Infinity,
                                                        ease: "easeInOut",
                                                        delay: idx * 0.4,
                                                    } : {
                                                        duration: 0.5
                                                    }}
                                                    className="w-1.5 h-1.5 bg-[#d4a853] rounded-full shadow-[0_0_8px_#d4a853]"
                                                />
                                            </div>
                                            <span
                                                className={`text-[11px] uppercase tracking-[0.15em] leading-none text-transparent bg-clip-text ${theme.headlineGradient}`}
                                                style={{ fontFamily: "var(--font-body)", textShadow: "0px 2px 4px rgba(0,0,0,0.5)" }}
                                            >
                                                {item}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
