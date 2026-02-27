import { motion, useTransform, MotionValue } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { processSteps } from "@/data/blueprint";
import { ScrambleText } from "@/components/ui/scramble-text";

export interface MobileStackCardProps {
    index: number;
    step: typeof processSteps[0];
    progressRange: [number, number];
    progressTotal: MotionValue<number>;
}

export const MobileStackCard = ({ index, step, progressRange, progressTotal }: MobileStackCardProps) => {
    // Drive scale and darken effect based on scroll progress
    // Replaced expensive `filter: brightness` with an opacity overlay
    const scale = useTransform(progressTotal, progressRange, [1, 0.95]);
    const darkenOpacity = useTransform(progressTotal, progressRange, [0, 0.6]);

    return (
        <div className="sticky top-24 pt-4 pb-4" style={{ zIndex: index }}>
            <motion.div
                style={{ scale }}
                className="w-full bg-card border border-border/20 rounded-3xl p-6 flex flex-col gap-6 shadow-2xl relative overflow-hidden"
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
                <p className="font-body type-functional-light text-base text-muted-foreground leading-relaxed whitespace-pre-line">
                    {step.description}
                </p>

                {/* Image Asset */}
                <div className="relative w-full aspect-video bg-background/50 border border-border/10 rounded-xl flex items-center justify-center overflow-hidden">
                    <img src={step.imageUrl} alt={step.title} loading="lazy" className="w-full h-full object-cover" />
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
