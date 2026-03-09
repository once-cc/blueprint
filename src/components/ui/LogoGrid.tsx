import React from "react";
import { Crosshair } from "@/components/ui/crosshair";
import { useRayPause } from "@/hooks/useRayPause";

import framerMotionLogo from "@/assets/brandlogos/framermotion-white.svg";
import githubLogo from "@/assets/brandlogos/github-white.svg";
import openaiLogo from "@/assets/brandlogos/openai-white.svg";
import resendLogo from "@/assets/brandlogos/resend-white.svg";
import supabaseLogo from "@/assets/brandlogos/supabase.svg";
import vercelLogo from "@/assets/brandlogos/vercel-white.svg";
import viteLogo from "@/assets/brandlogos/vite.svg";

// Logical grouping of logos to map into distinct vertical columns
const brandPairs = [
    [{ name: "Resend", src: resendLogo }, { name: "OpenAI", src: openaiLogo }],
    [{ name: "Vercel", src: vercelLogo }, { name: "GitHub", src: githubLogo }],
    [{ name: "Supabase", src: supabaseLogo }, { name: "Vite", src: viteLogo }],
    [{ name: "Framer Motion", src: framerMotionLogo }, { name: "Resend", src: resendLogo }], // Reusing one for a 4th column on ultra-wide
];

export function LogoGrid() {
    const gridRef = useRayPause<HTMLDivElement>();
    return (
        <div ref={gridRef} className="w-full relative isolate border-y border-white/10">
            {/* Opaque background layer — sits at -z-10 to mask -z-20 crosshairs */}
            <div className="absolute inset-0 bg-background/80 -z-10 pointer-events-none" />
            <div className="w-full flex justify-center container mx-auto px-4 md:px-6 relative">
                <div className="w-full md:max-w-[90vw] lg:max-w-[1240px] relative">

                    {/* Crosshairs at the primary grid intersections matching ScrollytellSection */}
                    <Crosshair className="absolute -top-[8.5px] -left-[8.5px] text-white/40 -z-20" />
                    <Crosshair className="absolute -top-[8.5px] -right-[8.5px] text-white/40 -z-20" />
                    <Crosshair className="absolute -bottom-[8.5px] -left-[8.5px] text-white/40 -z-20" />
                    <Crosshair className="absolute -bottom-[8.5px] -right-[8.5px] text-white/40 -z-20" />

                    <div className="absolute -top-16 left-0 w-full z-10">
                        <div className="w-full h-px bg-white/10" />
                        <h3 className="w-full text-center text-[10px] uppercase tracking-[0.5em] text-white/20 py-3 bg-background/80">
                            Architectural Primitives
                        </h3>
                        <div className="w-full h-px bg-white/10" />
                    </div>

                    {/* Geometric Grid Container (Inner) */}
                    <div className="grid grid-cols-4 relative">
                        {/* Horizontal masking gradients to fade vertical grid movement slightly */}
                        <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none" />
                        <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />

                        {brandPairs.map((pair, colIndex) => {
                            // Stagger animation durations to create the ambient "living" feel
                            // Col 0: 24s, Col 1: 30s, Col 2: 26s, Col 3: 32s
                            const duration = 24 + (colIndex % 2 === 0 ? colIndex * 2 : colIndex * 4);

                            // Intelligently calculate borders so the end columns use the outer docking rails and avoid "double 1px lines"
                            // We don't apply border-y here because the outer wrapper handles full-width grid clamping
                            const borderClasses = `border-white/10 ${colIndex !== 3 ? "border-r" : ""}`;

                            return (
                                <div
                                    key={`logo-col-${colIndex}`}
                                    className={`relative h-[120px] md:h-[160px] ${borderClasses} flex-col items-center justify-start overflow-hidden bg-white/[0.01] hover:bg-white/[0.03] transition-colors duration-500 group flex`}
                                >
                                    {/* Inner vertical hardware-accelerated scrolling track */}
                                    <div
                                        className="flex flex-col w-full marquee-track-vertical"
                                        style={{
                                            animationDuration: `${duration}s`,
                                        }}
                                    >
                                        {/* We map the pair multiple times to create the infinite scroll illusion */}
                                        {[...pair, ...pair, ...pair].map((logo, index) => (
                                            <div
                                                key={`${logo.name}-${index}`}
                                                className="h-[120px] md:h-[160px] w-full flex items-center justify-center shrink-0 px-8"
                                            >
                                                <img
                                                    src={logo.src}
                                                    alt={logo.name}
                                                    className="w-full max-w-[120px] max-h-[40px] object-contain opacity-40 grayscale group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-500"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
