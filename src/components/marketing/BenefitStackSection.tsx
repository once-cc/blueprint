import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { CheckCircle, ShieldCheck, Zap, LineChart, Target, Eye } from "lucide-react";

const benefits = [
    {
        title: "Absolute Certainty",
        description: "Eliminate the guesswork from development. You see exactly what you’re getting, how it maps to conversion, and why every decision was made before writing a single line of code.",
        icon: ShieldCheck,
        color: "hsl(220 12% 40%)" // Muted metallic
    },
    {
        title: "Accelerated Velocity",
        description: "Fast-track your project from idea to production-ready design. Clean handoffs mean engineering doesn't pause to ask design questions.",
        icon: Zap,
        color: "hsl(38 85% 55%)" // Accent gold
    },
    {
        title: "Conversion Architecture",
        description: "We don't just design pretty pages. Every component is audited and structured specifically to guide user intent toward your primary business goals.",
        icon: LineChart,
        color: "hsl(142 71% 45%)" // Success green
    },
    {
        title: "Alignment & Vision",
        description: "Rally your stakeholders around a unified, interactive prototype rather than abstract concepts. The blueprint acts as your single source of truth.",
        icon: Target,
        color: "hsl(221 83% 53%)" // Trust blue
    }
];

interface StackCardProps {
    index: number;
    benefit: {
        title: string;
        description: string;
        icon: any; // Lucide icon reference
        color: string;
    };
    progressRange: [number, number];
    progressTotal: import("framer-motion").MotionValue<number>;
}

// Individual Sticky Card
const StackCard = ({ index, benefit, progressRange, progressTotal }: StackCardProps) => {
    // Use the overall container scroll to drive the scale and darken effect
    // As the user scrolls past this card (progress > start of its range), it scales down and darkens
    const scale = useTransform(progressTotal, progressRange, [1, 0.95]);
    const brightness = useTransform(progressTotal, progressRange, [1, 0.4]);

    return (
        <div className="sticky top-24 pt-4 md:pt-8" style={{ zIndex: index }}>
            <motion.div
                style={{ scale, filter: `brightness(${brightness})` }}
                className="w-full bg-card border border-border/20 rounded-3xl p-8 md:p-16 flex flex-col md:flex-row gap-8 md:gap-16 items-center shadow-2xl overflow-hidden relative"
            >
                {/* Subtle Background Glow corresponding to icon color */}
                <div
                    className="absolute -top-1/2 -left-1/4 w-full h-full rounded-full blur-[100px] opacity-[0.03] pointer-events-none"
                    style={{ backgroundColor: benefit.color }}
                />

                {/* Cinematics Icon Column */}
                <div className="w-full md:w-1/3 flex justify-center items-center">
                    <div className="relative w-40 h-40 md:w-64 md:h-64 rounded-[2rem] bg-background/50 border border-border/10 flex items-center justify-center shadow-inner">
                        {/* Diagonal light sweeps (CSS only via gradients) */}
                        <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                        <benefit.icon className="w-16 h-16 md:w-24 md:h-24 opacity-80" style={{ color: benefit.color }} />
                    </div>
                </div>

                {/* Editorial Content Column */}
                <div className="w-full md:w-2/3 flex flex-col gap-6 text-center md:text-left relative z-10">
                    <div className="flex items-center gap-3 justify-center md:justify-start">
                        <CheckCircle className="w-5 h-5 text-accent/80 hidden md:block" />
                        <span className="font-nohemi font-medium text-[10px] md:text-sm tracking-widest text-muted-foreground uppercase">
                            Advantage 0{index + 1}
                        </span>
                    </div>

                    <h3 className="font-nohemi font-medium text-3xl md:text-5xl leading-tight">
                        {benefit.title}
                    </h3>

                    <p className="font-body type-functional-light text-base md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
                        {benefit.description}
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export function BenefitStackSection() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    // z-20 combined with -mt-[50vh] pulls this entire section up to overlap the last card of FrameworkSection
    // pt-[50vh] plus the existing py-24 padding ensures the content itself doesn't collide with the card it's overlapping
    return (
        <section className="py-24 pt-[50vh] -mt-[50vh] bg-background relative z-20">
            <div className="container mx-auto px-6 mb-16 md:mb-24">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center max-w-4xl mx-auto flex flex-col items-center"
                >
                    <CheckCircle className="w-6 h-6 text-accent mb-6 opacity-80" />
                    <h2 className="font-nohemi font-medium text-4xl md:text-6xl tracking-tight mb-6">
                        Why Start With a Blueprint?
                    </h2>
                    <p className="font-body type-functional-light text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                        It eliminates the costly risks of developing blind. A precise architectural map ensuring pixel-perfect execution.
                    </p>
                </motion.div>
            </div>

            {/* Stacking Container */}
            {/* Height is roughly number of cards * 100vh to ensure enough scroll duration */}
            <div ref={containerRef} className="container mx-auto px-4 sm:px-6 relative h-[400vh]">
                {benefits.map((benefit, i) => {
                    // Calculate the progress range for THIS card's "squish" effect
                    // Cards start squishing when the NEXT card starts covering them
                    const startSquish = i / benefits.length;
                    const endSquish = (i + 1) / benefits.length;

                    return (
                        <StackCard
                            key={i}
                            index={i}
                            benefit={benefit}
                            progressRange={[startSquish, endSquish]}
                            progressTotal={scrollYProgress}
                        />
                    );
                })}
            </div>
        </section>
    );
}
