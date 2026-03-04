import React, { useEffect, useRef } from "react";
import Lottie, { LottieRefCurrentProps } from "lottie-react";

interface BenefitIconLottieProps {
    animationData: Record<string, unknown>;
    isActive: boolean;
    color: string;
    className?: string;
    staticFrame?: number;
    hasPlayedOnce?: boolean;
}

export const BenefitIconLottie = React.memo(({
    animationData,
    isActive,
    color,
    className = "",
    staticFrame = 0,
    hasPlayedOnce = false
}: BenefitIconLottieProps) => {
    const lottieRef = useRef<LottieRefCurrentProps>(null);

    // Initial mount: snap to the static frame
    useEffect(() => {
        if (lottieRef.current) {
            lottieRef.current.goToAndStop(staticFrame, true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Hover / entrance trigger: play from frame 0, or snap back to static frame
    useEffect(() => {
        if (!lottieRef.current) return;

        if (isActive || hasPlayedOnce) {
            lottieRef.current.goToAndPlay(0, true);
        } else {
            lottieRef.current.goToAndStop(staticFrame, true);
        }
    }, [isActive, hasPlayedOnce, staticFrame]);

    return (
        <div
            // Container precisely matches original 48x48 bounds and styling
            className={`relative w-12 h-12 rounded bg-background border border-white/10 flex items-center justify-center flex-shrink-0 transition-all duration-500 ${className}`}
            style={{ borderColor: "rgba(255,255,255,0.1)" }}
        >
            {/* Inner wrapper matches the visual footprint of the SVG icons (w-8 h-8 based on previous interaction, replacing w-5 h-5 / w-6 h-6 overrides) */}
            <div
                className="w-8 h-8 opacity-80 group-hover/card:opacity-100 transition-opacity flex items-center justify-center"
                style={{ color: color }}
            >
                <Lottie
                    lottieRef={lottieRef}
                    animationData={animationData}
                    loop={false}
                    autoplay={false}
                    style={{ width: "100%", height: "100%" }}
                />
            </div>
        </div>
    );
});

BenefitIconLottie.displayName = "BenefitIconLottie";
