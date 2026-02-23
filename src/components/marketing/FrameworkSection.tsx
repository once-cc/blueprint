import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useInView, useScroll, useTransform, MotionValue } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { DiscoverySvg } from "./graphics/DiscoverySvg";
import { DesignSvg } from "./graphics/DesignSvg";
import { DeliverSvg } from "./graphics/DeliverSvg";
import { Crosshair } from "@/components/ui/crosshair";

const processSteps = [
    {
        id: "discovery",
        icon: null,
        title: "Discovery",
        description: "We examine your current digital infrastructure to identify where momentum is lost, auditing every touchpoint for clarity and conversion impact.",
        bullets: ["Strategic gap analysis", "Revenue leak identification", "Audience resonance audit"],
        SvgComponent: DiscoverySvg
    },
    {
        id: "design",
        icon: null,
        title: "Design",
        description: "We interpret your unique value into a visual language that commands authority, building a system-level architecture that scales with your ambition.",
        bullets: ["Brand cosmology development", "System-level interface design", "Cinematic visual production"],
        SvgComponent: DesignSvg
    },
    {
        id: "deliver",
        icon: null,
        title: "Deliver",
        description: "A production-ready ecosystem handed over with complete operational clarity, ensuring you can lead your market without technical overhead.",
        bullets: ["Full-stack implementation", "Performance optimization", "Operational handoff training"],
        SvgComponent: DeliverSvg
    }
];

function FrameworkDesktop() {
    return (
        <div className="hidden md:flex flex-col w-full pb-32">
            {processSteps.map((step, index) => (
                <div key={step.id} className="relative w-full border-y border-white/10 py-24 -mt-px">

                    {/* Horizontal Grid Anchors (Crosshairs) - Bound to the full row outer edges */}
                    <Crosshair className="absolute -top-[8.5px] -left-[8.5px] text-white/40 z-20" />
                    <Crosshair className="absolute -bottom-[8.5px] -left-[8.5px] text-white/40 z-20" />
                    <Crosshair className="absolute -top-[8.5px] -right-[8.5px] text-white/40 z-20" />
                    <Crosshair className="absolute -bottom-[8.5px] -right-[8.5px] text-white/40 z-20" />

                    <div className="grid grid-cols-12 gap-6 items-start">

                        {/* Column 1: Number (Span 2) */}
                        <div className="col-span-2">
                            <span className="font-display type-structural-bold text-5xl text-transparent block mt-1" style={{ WebkitTextStroke: "1px hsl(var(--border) / 0.8)" }}>
                                /{(index + 1).toString().padStart(2, '0')}
                            </span>
                        </div>

                        {/* Column 2: Title (Span 4) */}
                        <div className="col-span-4 pr-12">
                            <h3 className="heading-editorial text-4xl lg:text-5xl uppercase tracking-tight">{step.title}</h3>
                        </div>

                        {/* Column 3: Detailed Content (Span 6) */}
                        <div className="col-span-6 flex flex-col pl-6 border-l border-white/5 relative">
                            {/* SVG Asset */}
                            <div className="relative w-full aspect-[21/9] bg-card/20 border border-border/10 rounded-2xl flex items-center justify-center overflow-hidden mb-8 shadow-lg">
                                <step.SvgComponent />
                            </div>

                            {/* Body Copy */}
                            <p className="font-body type-functional-light text-xl text-muted-foreground leading-relaxed mb-8">
                                {step.description}
                            </p>

                            {/* Bullet Points */}
                            <ul className="grid grid-cols-2 gap-4">
                                {step.bullets.map((bullet, idx) => (
                                    <li key={idx} className="flex flex-row items-center gap-3">
                                        <span className="font-body type-functional text-sm text-muted-foreground">#{(bullet.replace(/\s+/g, '').toUpperCase())}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            ))}
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

                {/* SVG Interface Asset */}
                <div className="relative w-full aspect-video bg-background/50 border border-border/10 rounded-xl flex items-center justify-center overflow-hidden">
                    <step.SvgComponent />
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
        <section className="py-24 bg-background relative z-10 w-full">
            <div className="container mx-auto px-6 mb-16 md:mb-24">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-left max-w-3xl"
                >
                    <span className="font-display type-structural-bold tracking-widest text-accent text-[10px] md:text-sm uppercase mb-4 block">
                        A DEFINITIVE FRAMEWORK
                    </span>
                    <h2 className="heading-editorial text-4xl md:text-6xl lg:text-7xl tracking-tight leading-[1.1]">
                        Discovery, Design, Delivery.
                    </h2>
                </motion.div>
            </div>

            <div className="container mx-auto px-0 md:px-6">
                <FrameworkDesktop />
                <FrameworkMobile />
            </div>
        </section>
    );
}
