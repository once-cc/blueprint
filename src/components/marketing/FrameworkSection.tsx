import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useInView, useScroll, useTransform, MotionValue } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { Crosshair } from "@/components/ui/crosshair";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

const ScrambleText = ({ text }: { text: string }) => {
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-10% 0px" });
    const [display, setDisplay] = useState(text);

    useEffect(() => {
        if (!isInView) return;

        let iteration = 0;
        // 1.5s total duration. If interval is 30ms, we need 50 iterations.
        const maxIterations = 50;
        const intervalMs = 30;

        const interval = setInterval(() => {
            setDisplay(text.split("").map((char, index) => {
                if (index < Math.floor(iteration / (maxIterations / text.length))) {
                    return char;
                }
                return CHARS[Math.floor(Math.random() * CHARS.length)];
            }).join(""));

            if (iteration >= maxIterations) {
                clearInterval(interval);
                setDisplay(text);
            }
            iteration++;
        }, intervalMs);

        return () => clearInterval(interval);
    }, [text, isInView]);

    return <span ref={ref} className="inline-block tabular-nums min-w-[2.2ch]">{display}</span>;
};

const processSteps = [
    {
        id: "discovery",
        title: "Discovery",
        description: "We examine your current digital infrastructure to identify where momentum is lost, auditing every touchpoint for clarity and conversion impact.",
        bullets: ["Strategic gap analysis", "Revenue leak identification", "Audience resonance audit"],
        imageUrl: "/assets/infographics/discovery.png"
    },
    {
        id: "design",
        title: "Design",
        description: "We interpret your unique value into a visual language that commands authority, building a system-level architecture that scales with your ambition.",
        bullets: ["Brand cosmology development", "System-level interface design", "Cinematic visual production"],
        imageUrl: "/assets/infographics/design.png"
    },
    {
        id: "deliver",
        title: "Deliver",
        description: "A production-ready ecosystem handed over with complete operational clarity, ensuring you can lead your market without technical overhead.",
        bullets: ["Full-stack implementation", "Performance optimization", "Operational handoff training"],
        imageUrl: "/assets/infographics/deliver.png"
    }
];

const DesktopStackCard = ({ index, step, progressRange, progressTotal, isLast }: DesktopStackCardProps) => {
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

    // Exit begins the moment this card's top hits -30vh from the viewport top
    // (exactly when the next card's top enters the viewport from the bottom).
    // It completes after 100vh of scroll (when this card's top is at -130vh).
    const { scrollYProgress: descendProgress } = useScroll({
        target: trackerRef,
        offset: ["start -30vh", "start -130vh"]
    });

    // Suppress exit animation precisely for the last card so it stays pinned as the next section overlays it
    const groupScale = useTransform(descendProgress, [0, 1], [1, isLast ? 1 : 0.85]);
    const groupOpacity = useTransform(descendProgress, [0, 0.8, 1], [1, isLast ? 1 : 0, isLast ? 1 : 0]);
    const groupY = useTransform(descendProgress, [0, 1], ["0vh", "0vh"]); // Strictly stationary, no drift
    const groupRotateX = useTransform(descendProgress, [0, 1], ["0deg", "0deg"]);

    return (
        // To prevent this card from "un-pinning" and sliding up naturally before it fades out,
        // we artificially extend the container's height to 250vh. We then use a negative margin
        // on non-last cards to preserve the exact same 130vh visual spacing. This guarantees beautifully locked descent!
        <div ref={trackerRef} className={`relative w-full ${isLast ? "h-[180vh]" : "h-[250vh] -mb-[120vh]"}`}>

            {/* Top aligned natively to ensure layout boundaries perfectly match visual boundaries for flush docking */}
            <div className="sticky top-[22vh] w-full flex justify-center" style={{ zIndex: index, perspective: "1500px" }}>

                <motion.div style={{ y: useTransform(popProgress, [0, 1], ["-10vh", "0vh"]) }} className="w-full flex justify-center">
                    <motion.div
                        style={{ scale: groupScale, opacity: groupOpacity, y: groupY, rotateX: groupRotateX }}
                        // Important to ensure the perspective origin behaves well
                        className="relative w-full max-w-[90vw] lg:max-w-[1240px] flex justify-center will-change-transform origin-top"
                    >
                        <motion.div
                            style={{ y: titleY, opacity: titleOpacity }}
                            // Positioned bottom-full so the baseline of the text container rests exactly on top of the card's top border
                            className="absolute bottom-full w-full flex items-end justify-center pointer-events-none -z-10"
                        >
                            <span
                                // pt-8 pb-4 prevents the text from being prematurely clipped by bg-clip-text's bounds
                                className="font-nohemi font-bold pt-8 pb-4 select-none whitespace-nowrap uppercase text-transparent bg-clip-text bg-[linear-gradient(to_top,#020817_0%,theme(colors.zinc.900)_50%,theme(colors.zinc.800)_95%,#FFFFF0_100%)]"
                                style={{
                                    fontSize: "clamp(3rem, 13vw, 190px)",
                                    lineHeight: 1
                                }}
                            >
                                {step.title}
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
                                <div className="flex flex-col border-r border-white/20 p-8 lg:p-12 justify-between bg-background/50 backdrop-blur-sm relative h-full">
                                    {/* Number / Heading */}
                                    <div className="flex flex-col h-full">
                                        <div className="flex flex-col items-start gap-3 mb-8 border-b border-white/10 pb-6 w-full">
                                            <span className="font-nohemi font-medium tracking-widest text-[10px] md:text-sm text-accent uppercase flex items-center gap-2">
                                                <span className="text-accent/60">//</span> <ScrambleText text={`0${index + 1}`} />
                                            </span>
                                            <h3 className="font-nohemi font-bold text-3xl lg:text-5xl shrink-0 leading-none pb-2">{step.title}</h3>
                                        </div>

                                        {/* Body Copy */}
                                        <p className="font-body type-functional-light text-lg lg:text-xl text-muted-foreground leading-relaxed mb-auto pr-6">
                                            {step.description}
                                        </p>

                                        {/* Bullets */}
                                        <ul className="flex flex-col gap-4 mt-8 relative">
                                            {/* Small connective line running behind the dots */}
                                            <div className="absolute left-[11.5px] top-6 bottom-6 w-[1px] bg-white/10" />

                                            {step.bullets.map((bullet, idx) => (
                                                <li key={idx} className="flex flex-row items-center gap-5 bg-card/30 border border-white/10 p-4 lg:p-5 backdrop-blur-sm">
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
                                        <img src={step.imageUrl} alt={step.title} className="w-full h-full object-cover rounded-sm" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

function FrameworkDesktop() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    return (
        <div className="hidden md:block w-full">
            {/* Stacking Container Height flows organically from physical spacing on children */}
            <div ref={containerRef} className="relative mt-8 md:mt-16">
                {processSteps.map((step, i) => {
                    return (
                        <DesktopStackCard
                            key={i}
                            index={i}
                            step={step}
                            progressRange={[0, 1]} // Math calculation handled directly inside via trackerRef
                            progressTotal={scrollYProgress}
                            isLast={i === processSteps.length - 1}
                        />
                    );
                })}
            </div>
        </div>
    );
}

interface DesktopStackCardProps {
    index: number;
    step: typeof processSteps[0];
    progressRange: [number, number];
    progressTotal: MotionValue<number>;
    isLast: boolean;
}

// Mobile Sticky Card Definition
interface MobileStackCardProps {
    index: number;
    step: typeof processSteps[0];
    progressRange: [number, number];
    progressTotal: MotionValue<number>;
}

const MobileStackCard = ({ index, step, progressRange, progressTotal }: MobileStackCardProps) => {
    // Drive scale and darken effect based on scroll progress
    // Replaced expensive `filter: brightness` with an opacity overlay
    const scale = useTransform(progressTotal, progressRange, [1, 0.95]);
    const darkenOpacity = useTransform(progressTotal, progressRange, [0, 0.6]);

    return (
        <div className="sticky top-24 pt-4 pb-4" style={{ zIndex: index }}>
            <motion.div
                style={{ scale }}
                className="w-full bg-card border border-border/20 rounded-3xl p-6 flex flex-col gap-6 shadow-2xl relative overflow-hidden will-change-transform"
            >
                {/* Performance optimized darkening overlay */}
                <motion.div
                    style={{ opacity: darkenOpacity }}
                    className="absolute inset-0 bg-black pointer-events-none z-50 rounded-3xl"
                />

                {/* Number / Phase Header */}
                <div className="flex flex-col items-start gap-2 border-b border-border/20 pb-4 relative z-10">
                    <span className="font-nohemi font-medium tracking-widest text-[10px] text-accent uppercase flex items-center gap-2">
                        <span className="text-accent/60">//</span> <ScrambleText text={`0${index + 1}`} />
                    </span>
                    <h3 className="font-nohemi font-bold text-3xl tracking-tight">{step.title}</h3>
                </div>

                {/* Body Copy */}
                <p className="font-body type-functional-light text-base text-muted-foreground leading-relaxed">
                    {step.description}
                </p>

                {/* Image Asset */}
                <div className="relative w-full aspect-video bg-background/50 border border-border/10 rounded-xl flex items-center justify-center overflow-hidden">
                    <img src={step.imageUrl} alt={step.title} className="w-full h-full object-cover" />
                </div>

                {/* Bullets */}
                <ul className="grid grid-cols-1 gap-3">
                    {step.bullets.map((bullet, idx) => (
                        <li key={idx} className="flex flex-row items-center gap-3">
                            <CheckCircle className="w-4 h-4 text-accent shrink-0" />
                            <span className="font-body type-functional text-xs text-foreground/90">{bullet}</span>
                        </li>
                    ))}
                </ul>
            </motion.div>
        </div>
    );
};

function FrameworkMobile() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    return (
        <div className="block md:hidden">
            {/* Stacking Container Height = roughly 100vh per card, plus 50vh extra runway to dock flush */}
            <div ref={containerRef} className="container mx-auto px-4 relative h-[350vh]">
                {processSteps.map((step, i) => {
                    // Cards squish when the next card covers them
                    const startSquish = i / processSteps.length;
                    const endSquish = (i + 1) / processSteps.length;

                    return (
                        <MobileStackCard
                            key={i}
                            index={i}
                            step={step}
                            progressRange={[startSquish, endSquish]}
                            progressTotal={scrollYProgress}
                        />
                    );
                })}
            </div>
        </div>
    );
}

export function FrameworkSection() {
    return (
        // The z-0 is essential here: it allows the BenefitStackSection (which we will give z-20) 
        // to render OVER this sticky framework section as you scroll down.
        // Removed padding-bottom from the section so it doesn't add empty space after the last card pins.
        <section className="bg-background relative z-0 w-full">
            <div className="container mx-auto px-6">
                <FrameworkDesktop />
                <FrameworkMobile />
            </div>
        </section>
    );
}
