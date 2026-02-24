import { useRef } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { CheckCircle, ShieldCheck, Zap, LineChart, Target } from "lucide-react";

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
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start center", "center center"]
    });

    const introText = "Why Start With a Blueprint? It eliminates the costly risks of developing blind. A precise architectural map ensuring pixel-perfect execution.";
    const words = introText.split(" ");

    return (
        <section ref={containerRef} className="py-24 pt-[30vh] bg-background relative z-20">
            <div className="container mx-auto px-6 mb-24">
                <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
                    <CheckCircle className="w-6 h-6 text-accent mb-8 opacity-80" />

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

            {/* Bento Grid Container */}
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-6xl mx-auto">
                    {benefits.map((benefit, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
                            className="group relative bg-card/40 hover:bg-card/60 border border-border/20 hover:border-border/50 rounded-3xl p-8 md:p-10 flex flex-col gap-6 overflow-hidden transition-all duration-500"
                        >
                            {/* Hover glow effect aligned with brand colors */}
                            <div
                                className="absolute -inset-px rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                                style={{
                                    background: `radial-gradient(600px circle at top left, ${benefit.color}15, transparent 40%)`
                                }}
                            />

                            {/* Outer Glow */}
                            <div
                                className="absolute -top-32 -right-32 w-64 h-64 rounded-full blur-[100px] opacity-[0.03] group-hover:opacity-[0.08] pointer-events-none transition-opacity duration-500"
                                style={{ backgroundColor: benefit.color }}
                            />

                            <div className="flex items-center gap-4">
                                <div className="relative w-16 h-16 rounded-2xl bg-background border border-border/20 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500">
                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                                    <benefit.icon className="w-8 h-8 opacity-80 transition-colors duration-500" style={{ color: benefit.color }} />
                                </div>
                                <span className="font-nohemi font-medium text-xs tracking-widest text-muted-foreground uppercase">
                                    0{i + 1}
                                </span>
                            </div>

                            <div className="flex flex-col gap-3 relative z-10">
                                <h3 className="font-nohemi font-medium text-2xl md:text-3xl text-foreground group-hover:text-white transition-colors duration-300">
                                    {benefit.title}
                                </h3>
                                <p className="font-body type-functional-light text-base text-muted-foreground leading-relaxed">
                                    {benefit.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
