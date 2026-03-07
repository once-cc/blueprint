import { useRef, useEffect } from "react";
import { processSteps } from "@/data/blueprint";
import { useRayPause } from "@/hooks/useRayPause";
import { FrameworkDesktopCard } from "@/components/marketing/FrameworkDesktopCard";
import { MobileStackCard } from "@/components/marketing/MobileStackCard";
import { DiscoveryMobileCard } from "@/components/marketing/DiscoveryMobileCard";
import { DesignMobileCard } from "@/components/marketing/DesignMobileCard";
import { DeliveryMobileCard } from "@/components/marketing/DeliveryMobileCard";
import { Crosshair } from "@/components/ui/crosshair";
import { GridSection } from "@/components/ui/grid-section";

function FrameworkDesktop() {
    return (
        <div className="hidden md:block w-full">
            {/* Stacking Container Height flows organically from physical spacing on children */}
            <div className="relative">
                {processSteps.map((step, i) => (
                    <FrameworkDesktopCard
                        key={i}
                        index={i}
                        step={step}
                        isLast={i === processSteps.length - 1}
                    />
                ))}
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
                    // Discovery (index 0) → media-forward architectural card
                    if (i === 0) {
                        return (
                            <DiscoveryMobileCard
                                key={i}
                                index={i}
                                step={step}
                                isLast={i === processSteps.length - 1}
                            />
                        );
                    }
                    if (i === 1) {
                        return (
                            <DesignMobileCard
                                key={i}
                                index={i}
                                step={step}
                                isLast={i === processSteps.length - 1}
                            />
                        );
                    }
                    if (i === 2) {
                        return (
                            <DeliveryMobileCard
                                key={i}
                                index={i}
                                step={step}
                                isLast={i === processSteps.length - 1}
                            />
                        );
                    }
                    return null;
                })}
            </div>
        </div>
    );
}

export function FrameworkSection() {
    const frameworkRaysRef = useRayPause<HTMLDivElement>();
    const sectionRef = useRef<HTMLDivElement>(null);

    // Preload framework images when section approaches viewport
    useEffect(() => {
        const el = sectionRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    processSteps.forEach((step) => {
                        const img = new Image();
                        img.src = step.imageUrl;
                    });
                    observer.disconnect();
                }
            },
            { rootMargin: "100% 0px 100% 0px" }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, []);
    return (
        // The z-0 is essential here: it allows the BenefitStackSection (which we will give z-20) 
        // to render OVER this sticky framework section as you scroll down.
        // Removed padding-bottom from the section so it doesn't add empty space after the last card pins.
        <GridSection ref={sectionRef} className="bg-background relative z-0 w-full border-y-0">
            {/* Faint Global Editorial Grid */}
            <div className="absolute inset-0 bg-editorial-grid pointer-events-none" />

            {/* Environmental Volumetric Light Rays (Replicating Hero over entire section scroll) */}
            <div ref={frameworkRaysRef} className="absolute inset-0 z-0 pointer-events-none">
                <div className="sticky top-0 w-full h-screen overflow-hidden">
                    <div className="absolute top-[-10vh] right-[-20vw] w-[60vw] h-[150vh] bg-gradient-to-l from-transparent via-white/10 to-transparent blur-3xl mix-blend-plus-lighter animate-light-ray-corner-reverse opacity-80" />
                    <div className="absolute top-[-20vh] right-[10vw] w-[40vw] h-[150vh] bg-gradient-to-l from-transparent via-white/5 to-transparent blur-2xl mix-blend-plus-lighter animate-light-ray-corner-reverse delay-700 opacity-60" />
                </div>
            </div>

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
