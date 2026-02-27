import { useRef } from "react";
import { useScroll } from "framer-motion";
import { processSteps } from "@/data/blueprint";
import { DesktopStackCard } from "@/components/marketing/DesktopStackCard";
import { MobileStackCard } from "@/components/marketing/MobileStackCard";

function FrameworkDesktop() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    return (
        <div className="hidden md:block w-full">
            {/* Stacking Container Height flows organically from physical spacing on children */}
            <div ref={containerRef} className="relative">
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
