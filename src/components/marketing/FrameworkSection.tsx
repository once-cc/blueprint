import { useRef } from "react";
import { useScroll } from "framer-motion";
import { processSteps } from "@/data/blueprint";
import { DesktopStackCard } from "@/components/marketing/DesktopStackCard";
import { MobileStackCard } from "@/components/marketing/MobileStackCard";
import { Crosshair } from "@/components/ui/crosshair";
import { GridSection } from "@/components/ui/grid-section";

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
    return (
        <div className="block md:hidden">
            {/* Container flows organically from individual card runway heights, matching desktop pattern */}
            <div className="container mx-auto px-0 relative">
                {/* Editorial Docking Rails — matching BenefitStackSection style */}
                <div className="absolute top-0 bottom-0 left-4 w-px bg-white/10 pointer-events-none z-20" />
                <div className="absolute top-0 bottom-0 right-4 w-px bg-white/10 pointer-events-none z-20" />

                {processSteps.map((step, i) => {
                    return (
                        <MobileStackCard
                            key={i}
                            index={i}
                            step={step}
                            isLast={i === processSteps.length - 1}
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
        <GridSection className="bg-background relative z-0 w-full border-y-0">
            {/* Faint Global Editorial Grid */}
            <div className="absolute inset-0 bg-editorial-grid pointer-events-none" />

            {/* Inner Content Grid rails (1240px wide) tying into inner 1240px container lines */}
            <div className="absolute top-0 bottom-0 left-1/2 -px-1/2 w-full md:max-w-[1240px] pointer-events-none z-0 transform -translate-x-1/2">
                <div className="absolute top-0 bottom-0 left-0 w-px bg-white/10" />
                <div className="absolute top-0 bottom-0 right-0 w-px bg-white/10" />
            </div>

            <div className="container mx-auto px-6">
                <FrameworkDesktop />
                <FrameworkMobile />
            </div>
        </GridSection>
    );
}
