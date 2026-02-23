import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
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

// Helper to track when a section is in view
function SectionObserver({
    index,
    setActiveIndex
}: {
    index: number;
    setActiveIndex: (i: number) => void;
}) {
    const ref = useRef<HTMLDivElement>(null);
    // trigger when 50% of the item is visible
    const isInView = useInView(ref, { margin: "-45% 0px -45% 0px" });

    useEffect(() => {
        if (isInView) {
            setActiveIndex(index);
        }
    }, [isInView, index, setActiveIndex]);

    return <div ref={ref} className="absolute inset-y-0 left-0 w-full pointer-events-none" />;
}

export function FrameworkSection() {
    const [activeIndex, setActiveIndex] = useState(0);

    return (
        <section className="py-24 bg-background relative z-10">
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

            <div className="container mx-auto px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-12 lg:gap-24 items-start pb-24 relative">

                    {/* LEFT COLUMN: Sticky Oversized Number */}
                    <div className="hidden md:block sticky top-32 lg:top-48 h-[60vh] flex flex-col justify-center border-l border-white/10 pl-8 lg:pl-12">
                        <div className="relative overflow-hidden h-64 lg:h-80 w-full flex items-center">
                            <AnimatePresence mode="popLayout" initial={false}>
                                <motion.div
                                    key={activeIndex}
                                    initial={{ opacity: 0, y: 100 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -100 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 25 }}
                                    className="font-display type-structural-bold tracking-tighter absolute inset-0 flex items-center"
                                >
                                    <span
                                        className="text-[12rem] lg:text-[16rem] leading-none text-transparent"
                                        style={{ WebkitTextStroke: "2px hsl(var(--border) / 0.8)" }}
                                    >
                                        0{activeIndex + 1}
                                    </span>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                        {/* Animated Underline indicator mapped to index */}
                        <div className="flex gap-4 mt-8">
                            {[0, 1, 2].map((i) => (
                                <div
                                    key={i}
                                    className={`h-0.5 transition-all duration-500 rounded flex-1 ${i === activeIndex ? 'bg-accent' : 'bg-border/40'}`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Scrolling Content */}
                    <div className="relative flex flex-col pt-[10vh] pb-[20vh] space-y-[40vh] md:space-y-[60vh]">
                        {processSteps.map((step, index) => (
                            <div key={step.id} className="relative min-h-[50vh] flex flex-col justify-center border-y border-white/5 py-16">
                                {/* Horizontal Grid Anchors (Crosshairs) - Bound only to right scrolling column */}
                                <Crosshair className="absolute -top-[8.5px] -left-[8.5px] text-white/40 z-20" />
                                <Crosshair className="absolute -bottom-[8.5px] -left-[8.5px] text-white/40 z-20" />

                                <Crosshair className="absolute -top-[8.5px] -right-[8.5px] text-white/40 z-20" />
                                <Crosshair className="absolute -bottom-[8.5px] -right-[8.5px] text-white/40 z-20" />

                                {/* Intersection target */}
                                <SectionObserver index={index} setActiveIndex={setActiveIndex} />

                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true, margin: "-20%" }}
                                    transition={{ duration: 0.6 }}
                                    className="w-full relative z-10"
                                >
                                    {/* Phase header & Mobile Number indicator */}
                                    <div className="flex items-end gap-6 mb-8 border-b border-border/30 pb-6 w-full">
                                        <span className="md:hidden font-display type-structural-bold text-6xl text-transparent" style={{ WebkitTextStroke: "1px hsl(var(--border))" }}>
                                            0{index + 1}
                                        </span>
                                        <h3 className="heading-editorial text-4xl lg:text-5xl shrink-0">{step.title}</h3>
                                    </div>

                                    {/* SVG Asset */}
                                    <div className="relative w-full aspect-video bg-card/20 border border-border/10 rounded-2xl flex items-center justify-center overflow-hidden mb-10 shadow-lg">
                                        <step.SvgComponent />
                                    </div>

                                    {/* Body Copy */}
                                    <p className="font-body type-functional-light text-lg md:text-xl text-muted-foreground leading-relaxed mb-8">
                                        {step.description}
                                    </p>

                                    {/* Bullet Points */}
                                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {step.bullets.map((bullet, idx) => (
                                            <li key={idx} className="flex flex-row items-center gap-3 bg-card/30 border border-border/20 p-4 rounded-xl backdrop-blur-sm">
                                                <CheckCircle className="w-5 h-5 text-accent shrink-0" />
                                                <span className="font-body type-functional text-sm md:text-base text-foreground/90">{bullet}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </motion.div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
