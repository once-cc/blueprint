import { motion } from 'framer-motion';
import { Crosshair } from './crosshair';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';
const noiseTexture = "/noise/noise.png";

interface HeadlineBannerProps {
    headline: ReactNode;
    subheadline?: ReactNode;
    className?: string;
    delay?: number;
    fullViewport?: boolean;
    dockingRails?: 'top' | 'bottom' | 'both' | 'none';
}

export function HeadlineBanner({
    headline,
    subheadline,
    className,
    delay = 0,
    fullViewport = false,
    dockingRails = 'none',
}: HeadlineBannerProps) {
    return (
        <div
            className={cn(
                "py-8 relative isolate",
                fullViewport ? "w-[100vw] relative left-1/2 -translate-x-1/2" : "w-full",
                className
            )}
        >
            <div className="absolute inset-0 border-y border-white/10 bg-[hsl(220_15%_4%)] overflow-hidden pointer-events-none -z-10">
                {/* Consolidated Background Layers — Merged 6 heavy compositor overlaps into a single CSS multi-background string */}
                <div
                    className="absolute inset-x-0 -bottom-1/2 h-full z-0 pointer-events-none"
                    style={{
                        background: [
                            'radial-gradient(80% 40% at 50% 100%, hsl(37 91% 55% / 0.03), transparent 70%)',
                            'linear-gradient(to bottom, hsl(45 10% 92% / 0.02), transparent 40%)'
                        ].join(', ')
                    }}
                />

                <div
                    className="absolute inset-0 z-[1] pointer-events-none"
                    style={{
                        background: [
                            'radial-gradient(70% 60% at 30% 45%, hsl(37 30% 55% / 0.07), transparent 70%)',
                            'radial-gradient(50% 50% at 85% 80%, hsl(220 40% 30% / 0.08), transparent 60%)',
                            'radial-gradient(60% 50% at 25% 40%, hsl(220 10% 12% / 0.5), transparent 70%)',
                            'radial-gradient(ellipse at center, transparent 35%, hsl(220 15% 2% / 0.75) 100%)'
                        ].join(', ')
                    }}
                />

                {/* Layer 1: Static Film Grain — Zero-cost tiling image replacement for expensive SVG math */}
                <div
                    className="absolute inset-0 z-[1] pointer-events-none opacity-[0.25]"
                    style={{ backgroundImage: `url(${noiseTexture})` }}
                />

                {/* Layer 4: Ghost Editorial Grid */}
                <div className="absolute inset-0 z-[1] pointer-events-none bg-editorial-grid opacity-[0.12]" />
            </div>

            {/* Crosshairs intersecting the docking rails on the horizontal banner borders */}
            <div className="absolute inset-0 pointer-events-none flex justify-center -z-20">
                <div className="w-full flex justify-center container mx-auto px-4 md:px-6 relative">
                    <div className="w-full md:max-w-[90vw] lg:max-w-[1240px] relative">
                        <Crosshair className="absolute -top-[8.5px] -left-[8.5px] text-white/40" />
                        <Crosshair className="absolute -top-[8.5px] -right-[8.5px] text-white/40" />
                        <Crosshair className="absolute -bottom-[8.5px] -left-[8.5px] text-white/40" />
                        <Crosshair className="absolute -bottom-[8.5px] -right-[8.5px] text-white/40" />

                        {(dockingRails === 'top' || dockingRails === 'both') && (
                            <>
                                <div className="absolute bottom-full left-0 w-px h-[100vh] bg-white/10 pointer-events-none" />
                                <div className="absolute bottom-full right-0 w-px h-[100vh] bg-white/10 pointer-events-none" />
                            </>
                        )}
                        {(dockingRails === 'bottom' || dockingRails === 'both') && (
                            <>
                                <div className="absolute top-full left-0 w-px h-[100vh] bg-white/10 pointer-events-none z-0" />
                                <div className="absolute top-full right-0 w-px h-[100vh] bg-white/10 pointer-events-none z-0" />
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay, duration: 0.6 }}
                    className="text-center"
                >
                    {headline}
                    {subheadline && (
                        <div className="mt-4">
                            {subheadline}
                        </div>
                    )}
                </motion.div>
            </div>
        </div >
    );
}
