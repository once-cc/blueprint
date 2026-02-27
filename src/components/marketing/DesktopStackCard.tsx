import { useRef } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { Crosshair } from "@/components/ui/crosshair";
import { processSteps } from "@/data/blueprint";
import { ScrambleText } from "@/components/ui/scramble-text";

export interface DesktopStackCardProps {
    index: number;
    step: typeof processSteps[0];
    progressRange: [number, number];
    progressTotal: MotionValue<number>;
    isLast: boolean;
}

export const DesktopStackCard = ({ index, step, progressRange, progressTotal, isLast }: DesktopStackCardProps) => {
    // We use a relative trackerRef wrapping the sticky content. 
    // This allows useScroll to perfectly map its document position without getting paused/stuck by position: sticky!
    const trackerRef = useRef<HTMLDivElement>(null);

    // Title pops up perfectly as the card centers into the viewport
    const { scrollYProgress: popProgress } = useScroll({
        target: trackerRef,
        offset: ["start 80%", "start 20%"]
    });

    const titleY = useTransform(popProgress, [0, 1], ["85%", "40%"]);
    // Opacity: First card starts fully visible instantly, subsequent cards fade in as they pop.
    // However, the LAST card shouldn't fade back out later.
    const titleOpacity = useTransform(popProgress, [0, 0.4, 1], [index === 0 ? 1 : 0, 1, 1]);

    // Exit begins the moment this card hits its sticky position (top-[22vh]).
    // We extend the tracking distance to -80vh so the animation is slower and the card is visible longer.
    const { scrollYProgress: descendProgress } = useScroll({
        target: trackerRef,
        offset: ["start 22vh", "start -80vh"]
    });

    // Suppress exit animation precisely for the last card so it stays pinned as the next section overlays it
    // Lowered the drop-off rate on opacity by delaying the fade curve to start dropping more gradually over the longer stretch.
    const groupScale = useTransform(descendProgress, [0, 1], [1, isLast ? 1 : 0.85]);
    const groupOpacity = useTransform(descendProgress, [0, 0.3, 1], [1, isLast ? 1 : 1, isLast ? 1 : 0]);
    const groupY = useTransform(descendProgress, [0, 1], ["0vh", "0vh"]); // Strictly stationary, no drift
    const groupRotateX = useTransform(descendProgress, [0, 1], ["0deg", "0deg"]);

    return (
        // To prevent this card from "un-pinning" and sliding up naturally before it fades out,
        // we artificially extend the container's height. We then use a negative margin
        // on non-last cards to preserve visual spacing. Since they exit almost immediately after
        // becoming sticky, we can drastically reduce this runway from 250vh to 120vh.
        <div ref={trackerRef} className={`relative w-full ${isLast ? "h-[120vh]" : "h-[120vh] -mb-[40vh]"}`}>

            {/* Top aligned natively to ensure layout boundaries perfectly match visual boundaries for flush docking */}
            <div className="sticky top-[22vh] w-full flex justify-center" style={{ zIndex: index, perspective: "1500px" }}>

                {/* Removed the -10vh entering pop shift so the card sits perfectly flush against the upstream section boundary */}
                <div className="w-full flex justify-center">
                    <motion.div
                        style={{ scale: groupScale, opacity: groupOpacity, y: groupY, rotateX: groupRotateX }}
                        // Important to ensure the perspective origin behaves well
                        className="relative w-full max-w-[90vw] lg:max-w-[1240px] flex justify-center"
                    >
                        <motion.div
                            style={{ y: titleY, opacity: titleOpacity }}
                            // Positioned bottom-full so the baseline of the text container rests exactly on top of the card's top border
                            className="absolute bottom-full w-full flex items-end justify-center pointer-events-none -z-10"
                        >
                            <span
                                // pt-8 pb-4 prevents the text from being prematurely clipped
                                className="font-nohemi font-bold pt-8 pb-4 select-none whitespace-nowrap uppercase text-zinc-600 relative inline-block"
                                style={{
                                    fontSize: "clamp(3rem, 13vw, 190px)",
                                    lineHeight: 1
                                }}
                            >
                                {step.title}
                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent pointer-events-none" style={{ height: '70%', top: 'auto', bottom: 0 }} />
                            </span>
                        </motion.div>

                        <div
                            // Unified width is inherited from the parent motion.div. Relaxing height restrictions to prevent clipping
                            className="w-full bg-card border border-white/10 shadow-[0_60px_120px_-20px_rgba(0,0,0,0.95)] ring-1 ring-black/50 flex relative overflow-hidden rounded-xl"
                        >
                            {/* Darkening overlay removed; group opacity handles the void fade organically */}

                            {/* Editorial Outlines on Outer Frame */}
                            <Crosshair className="absolute -top-[8.5px] -left-[8.5px] text-white/50 z-20" />
                            <Crosshair className="absolute -bottom-[8.5px] -left-[8.5px] text-white/50 z-20" />
                            <Crosshair className="absolute -top-[8.5px] -right-[8.5px] text-white/50 z-20" />
                            <Crosshair className="absolute -bottom-[8.5px] -right-[8.5px] text-white/50 z-20" />

                            {/* Content Grid */}
                            <div className="grid grid-cols-2 w-full h-full relative z-10">

                                {/* LEFT COLUMN: Data & Copy */}
                                <div className="flex flex-col border-r border-white/20 p-8 lg:p-12 justify-between bg-black/40 relative h-full">
                                    {/* Number / Heading */}
                                    <div className="flex flex-col h-full">
                                        <div className="flex flex-col items-start gap-3 mb-8 border-b border-white/10 pb-6 w-full">
                                            <span className="font-nohemi font-medium tracking-widest text-[10px] md:text-sm text-accent uppercase flex items-center gap-2">
                                                <span className="text-accent/60">//</span> <ScrambleText text={`0${index + 1}`} />
                                            </span>
                                            <h3 className="font-nohemi font-bold text-3xl lg:text-5xl shrink-0 leading-none pb-2">{step.title}</h3>
                                        </div>

                                        {/* Body Copy */}
                                        <p className="font-body type-functional-light text-lg lg:text-xl text-muted-foreground leading-relaxed mb-auto pr-6 whitespace-pre-line">
                                            {step.description}
                                        </p>

                                        {/* Bullets */}
                                        <ul className="flex flex-col gap-4 mt-8 relative">
                                            {/* Small connective line running behind the dots */}
                                            <div className="absolute left-[11.5px] top-6 bottom-6 w-[1px] bg-white/10" />

                                            {step.bullets.map((bullet, idx) => (
                                                <li key={idx} className="flex flex-row items-center gap-5 bg-black/40 border border-white/10 p-4 lg:p-5">
                                                    {/* Glowing sequence indicator */}
                                                    <div className="relative w-6 h-6 shrink-0 flex items-center justify-center z-10">
                                                        {/* Outer faint ring */}
                                                        <div className="absolute w-3 h-3 bg-accent/20 rounded-full" />

                                                        {/* Pulsating core */}
                                                        <motion.div
                                                            initial={{ scale: 0.8, opacity: 0.4 }}
                                                            animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.4, 1, 0.4] }}
                                                            transition={{
                                                                duration: 2.5,
                                                                repeat: Infinity,
                                                                ease: "easeInOut",
                                                                delay: idx * 0.4 // Waterfall the animation down the list
                                                            }}
                                                            className="w-1.5 h-1.5 bg-accent rounded-full shadow-[0_0_10px_hsl(var(--accent))]"
                                                        />
                                                    </div>
                                                    <span className="font-body type-functional text-sm lg:text-base text-foreground/90 uppercase tracking-widest leading-none pt-0.5">{bullet}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                {/* RIGHT COLUMN: Visual Identity */}
                                <div className="flex items-center justify-center p-8 lg:p-12 bg-card/10 relative h-full">
                                    {/* Internal Framing line creating a square crop for the SVG */}
                                    <div className="w-full aspect-square max-h-[400px] border border-white/10 relative flex items-center justify-center p-8 bg-background/30 overflow-hidden shadow-inner">
                                        <Crosshair className="absolute -top-[8.5px] -left-[8.5px] text-white/30 z-20" />
                                        <Crosshair className="absolute -bottom-[8.5px] -left-[8.5px] text-white/30 z-20" />
                                        <Crosshair className="absolute -top-[8.5px] -right-[8.5px] text-white/30 z-20" />
                                        <Crosshair className="absolute -bottom-[8.5px] -right-[8.5px] text-white/30 z-20" />

                                        {/* Visual Graphic Image */}
                                        <img src={step.imageUrl} alt={step.title} loading="lazy" className="w-full h-full object-cover rounded-sm" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};
