import { motion } from 'framer-motion';
import { Crosshair } from './crosshair';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

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
                {/* Architectural Bevel Lighting */}
                <div className="absolute inset-x-0 -bottom-1/2 h-full z-0 pointer-events-none bg-[radial-gradient(80%_40%_at_50%_100%,hsl(37_91%_55%_/_0.03),transparent_70%)]" />
                <div className="absolute inset-0 z-0 pointer-events-none bg-[linear-gradient(to_bottom,hsl(45_10%_92%_/_0.02),transparent_40%)]" />

                {/* Layer 1: Micro Film Grain — SVG feTurbulence noise */}
                <div
                    className="absolute inset-0 z-[1] pointer-events-none opacity-[0.25] mix-blend-soft-light"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
                />

                {/* Layer 2: Luminance Falloff — Radial lift for reading focus + edge darkening */}
                <div className="absolute inset-0 z-[1] pointer-events-none bg-[radial-gradient(60%_50%_at_25%_40%,hsl(220_10%_12%_/_0.5),transparent_70%)]" />
                <div className="absolute inset-0 z-[1] pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_35%,hsl(220_15%_2%_/_0.75)_100%)]" />

                {/* Layer 3: Micro Chromatic Drift — Cool shadows, warm centre */}
                <div className="absolute inset-0 z-[1] pointer-events-none bg-[radial-gradient(70%_60%_at_30%_45%,hsl(37_30%_55%_/_0.07),transparent_70%)]" />
                <div className="absolute inset-0 z-[1] pointer-events-none bg-[radial-gradient(50%_50%_at_85%_80%,hsl(220_40%_30%_/_0.08),transparent_60%)]" />

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
