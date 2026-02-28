import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { processSteps } from "@/data/blueprint";
import { Crosshair } from "@/components/ui/crosshair";

export interface MobileStackCardProps {
    index: number;
    step: typeof processSteps[0];
    isLast: boolean;
}

export const MobileStackCard = ({ index, step, isLast }: MobileStackCardProps) => {
    // Per-card tracker ref — same pattern as DesktopStackCard
    // Wraps the sticky element so useScroll maps document position, not sticky position
    const trackerRef = useRef<HTMLDivElement>(null);

    // Exit animation: begins when card hits sticky position (top-20), extends to -60vh
    const { scrollYProgress: descendProgress } = useScroll({
        target: trackerRef,
        offset: ["start 80px", "start -100vh"]
    });

    // Same exit mechanics as desktop: scale down + opacity fade, last card stays pinned
    const groupScale = useTransform(descendProgress, [0, 1], [1, isLast ? 1 : 0.85]);
    const groupOpacity = useTransform(descendProgress, [0, 0.6, 1], [1, isLast ? 1 : 1, isLast ? 1 : 0]);

    return (
        // Each card gets its own runway container, matching desktop pattern
        // Non-last cards use negative margin to tighten visual spacing
        <div ref={trackerRef} className={`relative w-full ${isLast ? "h-[80vh]" : "h-[120vh] -mb-[20vh]"}`}>
            <div className="sticky top-20 w-full px-4" style={{ zIndex: index }}>
                <motion.div
                    style={{ scale: groupScale, opacity: groupOpacity }}
                    className="w-full relative shadow-[0_40px_80px_-15px_rgba(0,0,0,0.9)] ring-1 ring-black/50 rounded-xl"
                >
                    {/* Editorial Outlines on Outer Frame (Placed OUTSIDE overflow-hidden) */}
                    <Crosshair className="absolute -top-[8.5px] -left-[8.5px] text-white/50 z-20" />
                    <Crosshair className="absolute -bottom-[8.5px] -left-[8.5px] text-white/50 z-20" />
                    <Crosshair className="absolute -top-[8.5px] -right-[8.5px] text-white/50 z-20" />
                    <Crosshair className="absolute -bottom-[8.5px] -right-[8.5px] text-white/50 z-20" />

                    <div className="w-full h-full bg-card border border-white/10 rounded-xl p-5 flex flex-col gap-4 relative overflow-hidden">

                        {/* Number / Phase Header */}
                        <div className="flex flex-col items-start gap-1.5 border-b border-white/10 pb-3 relative z-10">
                            <span className="font-nohemi font-medium tracking-widest text-[10px] text-accent uppercase flex items-center gap-2">
                                <span className="text-accent/60">//</span> 0{index + 1}
                            </span>
                            <h3 className="font-nohemi font-medium tracking-tight text-2xl">
                                <span className="text-transparent bg-clip-text bg-gradient-to-b from-zinc-100 to-zinc-900 inline-block">
                                    {step.title}
                                </span>
                            </h3>
                        </div>

                        {/* Body Copy */}
                        <p className="font-body type-functional-light text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                            {step.description}
                        </p>

                        {/* Image Asset */}
                        <div className="relative w-full aspect-video bg-background/50 border border-white/10 flex items-center justify-center overflow-hidden">
                            <img src={step.imageUrl} alt={step.title} loading="lazy" className="w-full h-full object-cover" />
                        </div>

                        {/* Bullets — matching desktop pulsating indicator style */}
                        <ul className="flex flex-col gap-2 relative">
                            {step.bullets.map((bullet, idx) => (
                                <li key={idx} className="flex flex-row items-center gap-3 bg-black/40 border border-white/10 p-3">
                                    <div className="relative w-5 h-5 shrink-0 flex items-center justify-center z-10">
                                        <div className="absolute w-2.5 h-2.5 bg-accent/20 rounded-full" />
                                        <motion.div
                                            initial={{ scale: 0.8, opacity: 0.4 }}
                                            animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.4, 1, 0.4] }}
                                            transition={{
                                                duration: 2.5,
                                                repeat: Infinity,
                                                ease: "easeInOut",
                                                delay: idx * 0.4
                                            }}
                                            className="w-1.5 h-1.5 bg-accent rounded-full shadow-[0_0_10px_hsl(var(--accent))]"
                                        />
                                    </div>
                                    <span className="font-body type-functional text-xs text-foreground/90 uppercase tracking-widest leading-none pt-0.5">{bullet}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
