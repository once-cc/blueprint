import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Crosshair } from "./crosshair";

interface CrosshairColors {
    topColor: string;
    bottomColor: string;
}

interface GridSectionProps extends React.HTMLAttributes<HTMLElement> {
    children: React.ReactNode;
    showCrosshairs?: boolean;
    topCrosshairColors?: CrosshairColors;
    bottomCrosshairColors?: CrosshairColors;
    gridLineClassName?: string;
}

export const GridSection = forwardRef<HTMLElement, GridSectionProps>(
    ({ children, className, showCrosshairs = true, topCrosshairColors, bottomCrosshairColors, gridLineClassName = "bg-white/5", ...props }, ref) => {
        return (
            <section ref={ref} className={cn("relative w-full border-y border-white/5", className)} {...props}>
                {showCrosshairs && (
                    <div className="absolute inset-0 pointer-events-none flex justify-center h-full w-full z-10">
                        <div className="relative h-full w-full max-w-screen-2xl">
                            {/* Vertical Frame Lines connecting the crosshairs */}
                            <div className={cn("absolute top-0 bottom-0 left-0 w-px", gridLineClassName)} />
                            <div className={cn("absolute top-0 bottom-0 right-0 w-px", gridLineClassName)} />

                            {/* Top Crosshairs */}
                            {topCrosshairColors ? (
                                <>
                                    <Crosshair className="absolute -top-[8.5px] -left-[8.5px]" topColor={topCrosshairColors.topColor} bottomColor={topCrosshairColors.bottomColor} />
                                    <Crosshair className="absolute -top-[8.5px] -right-[8.5px]" topColor={topCrosshairColors.topColor} bottomColor={topCrosshairColors.bottomColor} />
                                </>
                            ) : (
                                <>
                                    <Crosshair className="absolute -top-[8.5px] -left-[8.5px] text-white/40" />
                                    <Crosshair className="absolute -top-[8.5px] -right-[8.5px] text-white/40" />
                                </>
                            )}

                            {/* Bottom Crosshairs */}
                            {bottomCrosshairColors ? (
                                <>
                                    <Crosshair className="absolute -bottom-[8.5px] -left-[8.5px]" topColor={bottomCrosshairColors.topColor} bottomColor={bottomCrosshairColors.bottomColor} />
                                    <Crosshair className="absolute -bottom-[8.5px] -right-[8.5px]" topColor={bottomCrosshairColors.topColor} bottomColor={bottomCrosshairColors.bottomColor} />
                                </>
                            ) : (
                                <>
                                    <Crosshair className="absolute -bottom-[8.5px] -left-[8.5px] text-white/40" />
                                    <Crosshair className="absolute -bottom-[8.5px] -right-[8.5px] text-white/40" />
                                </>
                            )}
                        </div>
                    </div>
                )}
                {children}
            </section>
        );
    }
);
GridSection.displayName = "GridSection";

