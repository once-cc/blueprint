import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useInView, useScroll, useTransform, MotionValue } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { Crosshair } from "@/components/ui/crosshair";
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

const DesktopStackCard = ({ index, step, progressRange, progressTotal }: MobileStackCardProps) => {
    // Drive scale and darken effect based on scroll progress
    const scale = useTransform(progressTotal, progressRange, [1, 0.95]);
    const darkenOpacity = useTransform(progressTotal, progressRange, [0, 0.6]);

    return (
        // Sticky offset of ~10vh to leave room at top of viewport
        <div className="sticky top-[10vh] w-full flex justify-center pb-8" style={{ zIndex: index }}>
            <motion.div
                style={{ scale }}
                // Emphasizes a "square" or blocky proportion. Max height secures it on shorter screens.
                className="w-full max-w-5xl aspect-square md:aspect-[4/3] lg:max-h-[80vh] bg-card border border-white/20 shadow-2xl flex relative will-change-transform overflow-hidden"
            >
                {/* Darkening overlay */}
                <motion.div
                    style={{ opacity: darkenOpacity }}
                    className="absolute inset-0 bg-black pointer-events-none z-50"
                />

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
                            <div className="flex items-end gap-6 mb-8 border-b border-white/10 pb-6 w-full">
                                <span className="font-display type-structural-bold text-5xl lg:text-7xl text-transparent shrink-0" style={{ WebkitTextStroke: "1px hsl(var(--border) / 0.8)" }}>
                                    /{(index + 1).toString().padStart(2, '0')}
                                </span>
                                <h3 className="heading-editorial text-3xl lg:text-5xl shrink-0 leading-none pb-2">{step.title}</h3>
                            </div>

                            {/* Body Copy */}
                            <p className="font-body type-functional-light text-lg lg:text-xl text-muted-foreground leading-relaxed mb-auto pr-6">
                                {step.description}
                            </p>

                            {/* Bullets */}
                            <ul className="flex flex-col gap-4 mt-8">
                                {step.bullets.map((bullet, idx) => (
                                    <li key={idx} className="flex flex-row items-center gap-4 bg-card/30 border border-white/10 p-4 lg:p-5 backdrop-blur-sm">
                                        <Crosshair className="w-4 h-4 text-accent shrink-0" />
                                        <span className="font-body type-functional text-sm lg:text-base text-foreground/90 uppercase tracking-widest">{bullet}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Visual Identity */}
                    <div className="flex items-center justify-center p-8 lg:p-12 bg-card/10 relative h-full">
                        {/* Internal Framing line creating a square crop for the SVG */}
                        <div className="w-full aspect-square border-t border-r border-white/10 relative flex items-center justify-center p-8 bg-background/30 overflow-hidden shadow-inner">
                            <Crosshair className="absolute -top-[8.5px] -left-[8.5px] text-white/30 z-20" />
                            <Crosshair className="absolute -bottom-[8.5px] -left-[8.5px] text-white/30 z-20" />
                            <Crosshair className="absolute -top-[8.5px] -right-[8.5px] text-white/30 z-20" />
                            <Crosshair className="absolute -bottom-[8.5px] -right-[8.5px] text-white/30 z-20" />

                            {/* Visual Graphic Image */}
                            <img src={step.imageUrl} alt={step.title} className="w-full h-full object-cover rounded-sm" />
                        </div>
                    </div>
                </div>
            </motion.div>
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
        <div className="hidden md:block w-full pb-32">
            {/* Header Text - centered for the stack flow */}
            <div className="pt-24 mb-16 text-center flex flex-col items-center">
                <span className="font-display type-structural-bold tracking-widest text-accent text-sm uppercase mb-4 block">
                    A DEFINITIVE FRAMEWORK
                </span>
                <h2 className="font-nohemi font-medium text-5xl lg:text-7xl tracking-tight leading-[1.1] max-w-3xl">
                    Discovery, Design, Delivery.
                </h2>
            </div>

            {/* Stacking Container Height = roughly 100vh per card */}
            <div ref={containerRef} className="relative h-[300vh] mt-8">
                {processSteps.map((step, i) => {
                    const startSquish = i / processSteps.length;
                    const endSquish = (i + 1) / processSteps.length;

                    return (
                        <DesktopStackCard
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
                <div className="flex items-center gap-4 border-b border-border/20 pb-4 relative z-10">
                    <span className="font-display type-structural-bold text-4xl text-transparent shrink-0" style={{ WebkitTextStroke: "1px hsl(var(--border))" }}>
                        0{index + 1}
                    </span>
                    <h3 className="heading-editorial text-3xl">{step.title}</h3>
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
            {/* Stacking Container Height = roughly 100vh per card */}
            <div ref={containerRef} className="container mx-auto px-4 relative h-[300vh]">
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
        // Added top/bottom section borders so the square sticky cards feel contained within the overarching segment
        <section className="bg-background relative z-10 w-full border-t border-white/10 border-b">
            <div className="container mx-auto px-6">
                <FrameworkDesktop />
                <FrameworkMobile />
            </div>
        </section>
    );
}
