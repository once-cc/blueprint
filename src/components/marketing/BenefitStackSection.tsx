import { useRef } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { ShieldCheck, Zap, LineChart, Target } from "lucide-react";
import { GridSection } from "@/components/ui/grid-section";

const benefits = [
    {
        title: "Absolute Certainty",
        description: "Eliminate the guesswork from development. You see exactly what you're getting, how it maps to conversion, and why every decision was made before writing a single line of code.",
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

interface WordRevealProps {
    children: string;
    progress: MotionValue<number>;
    range: [number, number];
}

const Word = ({ children, progress, range }: WordRevealProps) => {
    const opacity = useTransform(progress, range, [0.25, 1]);
    const highlight = useTransform(
        progress,
        range,
        ["hsl(220 12% 50% / 0.25)", "hsl(45 10% 92%)"]
    );

    return (
        <span className="relative">
            <motion.span
                style={{ opacity, color: highlight }}
                className="transition-colors duration-100"
            >
                {children}
            </motion.span>
        </span>
    );
};

export function BenefitStackSection() {
    const containerRef = useRef<HTMLElement>(null);
    const textRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: textRef,
        offset: ["start 85%", "start 35%"] // Start fading in as it enters bottom, finish as it reaches upper-mid screen
    });

    const introText = "Why Start With a Blueprint? It eliminates the costly risks of developing blind. A precise architectural map ensuring pixel-perfect execution.";
    const words = introText.split(" ");

    return (
        <GridSection ref={containerRef} className="py-24 md:py-32 bg-muted/30 z-20 overflow-visible relative">
            {/* The Editorial Ramp / Central Spine connecting to next section */}
            <div className="absolute top-0 bottom-0 left-1/2 -ml-px w-px bg-white/[0.03] pointer-events-none hidden md:block" />

            <div className="container mx-auto px-6 mb-24 relative z-10">
                <div ref={textRef} className="max-w-4xl mx-auto text-center flex flex-col items-center">
                    <span className="font-nohemi font-medium tracking-widest text-[10px] md:text-sm text-accent uppercase flex items-center gap-2 mb-8">
                        <span className="text-accent/60">//</span> Strategic Intelligence
                    </span>

                    <h2 className="font-nohemi font-medium text-3xl md:text-5xl lg:text-6xl leading-[1.2] tracking-tight block w-full text-center">
                        {words.map((word, i) => {
                            const start = i / words.length;
                            const end = start + 1 / words.length;

                            if (["Blueprint?", "costly", "risks", "pixel-perfect"].some(w => word.includes(w))) {
                                return (
                                    <span key={i}>
                                        <span className="relative italic font-nohemi font-medium text-transparent bg-clip-text bg-gradient-to-b from-zinc-600 from-[50%] to-zinc-950 pr-1.5">
                                            <motion.span
                                                style={{
                                                    opacity: useTransform(scrollYProgress, [start, end], [0.4, 1])
                                                }}
                                            >
                                                {word}
                                            </motion.span>
                                        </span>
                                        {i !== words.length - 1 && " "}
                                    </span>
                                );
                            }

                            return (
                                <span key={i}>
                                    <Word progress={scrollYProgress} range={[start, end]}>
                                        {word}
                                    </Word>
                                    {i !== words.length - 1 && " "}
                                </span>
                            );
                        })}
                    </h2>
                </div>
            </div>

            {/* Architectural Schematic Grid */}
            <div className="container mx-auto px-4 md:px-6 relative z-10 flex justify-center">
                <div className="w-full md:max-w-[90vw] lg:max-w-[1240px] relative">

                    {/* True Edge Docking Rails extending upwards from the grid's literal bounds */}
                    <div className="absolute -top-[500px] bottom-[100px] md:bottom-0 left-0 w-px bg-white/10 pointer-events-none z-20" />
                    <div className="absolute -top-[500px] bottom-[100px] md:bottom-0 right-0 w-px bg-white/10 pointer-events-none z-20" />

                    {/* The 2x2 Drawn Grid */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="grid grid-cols-1 md:grid-cols-2 bg-background border-y border-white/10 divide-y divide-white/10 md:divide-y-0 relative shadow-2xl"
                    >
                        {/* Horizontal divider for desktop row 2 */}
                        <div className="hidden md:absolute md:block top-1/2 left-0 right-0 h-px bg-white/10 z-0 pointer-events-none" />
                        {/* Vertical divider for desktop col 2 */}
                        <div className="hidden md:absolute md:block top-0 bottom-0 left-1/2 w-px bg-white/10 z-0 pointer-events-none" />

                        {benefits.map((benefit, i) => (
                            <div
                                key={i}
                                className="group relative p-8 md:p-12 flex flex-col gap-8 transition-colors duration-500 hover:bg-white/[0.02]"
                            >
                                {/* Technical Header */}
                                <div className="flex justify-between items-start">
                                    <div className="flex flex-col gap-2">
                                        <span className="font-mono text-[10px] tracking-widest uppercase flex items-center gap-2" style={{ color: benefit.color }}>
                                            <span className="opacity-60">//</span> 0{i + 1}
                                        </span>
                                        <h3 className="font-nohemi font-medium text-2xl lg:text-3xl text-foreground group-hover:text-white transition-colors duration-300">
                                            {benefit.title}
                                        </h3>
                                    </div>
                                    <div className="relative w-12 h-12 rounded bg-background border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:border-white/30 transition-colors duration-500">
                                        <benefit.icon className="w-5 h-5 opacity-80" style={{ color: benefit.color }} />
                                    </div>
                                </div>

                                {/* Annotation copy */}
                                <p className="font-body type-functional-light text-sm md:text-base text-muted-foreground leading-relaxed max-w-sm">
                                    {benefit.description}
                                </p>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </GridSection>
    );
}
