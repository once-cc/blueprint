import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface EyebrowBannerProps {
    children: ReactNode;
    className?: string;
    containerClassName?: string;
    fullViewport?: boolean;
    dockingRails?: 'top' | 'bottom' | 'both' | 'none';
}

export function EyebrowBanner({
    children,
    className,
    containerClassName,
    fullViewport = false,
    dockingRails = 'none'
}: EyebrowBannerProps) {
    return (
        <div
            className={cn(
                "flex justify-center container mx-auto px-4 md:px-6 relative",
                fullViewport ? "w-[100vw] relative left-1/2 -translate-x-1/2" : "w-full",
                containerClassName
            )}
        >
            <div className="w-full md:max-w-[90vw] lg:max-w-[1240px] relative">
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
                <div className="w-full h-px bg-white/10" />
                <p className={cn("w-full text-center text-[10px] uppercase tracking-[0.5em] text-white/20 py-3 bg-background/80", className)}>
                    {children}
                </p>
                <div className="w-full h-px bg-white/10" />
            </div>
        </div>
    );
}
