import React, { useEffect, useRef } from "react";
import Lottie, { LottieRefCurrentProps } from "lottie-react";

interface AnimatedButtonIconProps {
    animationData: Record<string, unknown>;
    isActive: boolean;
    className?: string;
    staticFrame?: number;
    playOnVisible?: boolean;
    playVisibleDelay?: number;
}

export const AnimatedButtonIcon = React.memo(({
    animationData,
    isActive,
    className = "",
    staticFrame = 0,
    playOnVisible = false,
    playVisibleDelay = 0
}: AnimatedButtonIconProps) => {
    const lottieRef = useRef<LottieRefCurrentProps>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const hasPlayedVisible = useRef(false);
    const wasActive = useRef(false);

    // Initial load handling: Snap to the static frame ONLY if we are NOT using playOnVisible
    useEffect(() => {
        if (lottieRef.current && !isActive && !playOnVisible) {
            lottieRef.current.goToAndStop(staticFrame, true);
        }
    }, [lottieRef.current, staticFrame, playOnVisible]);

    // Handle intersection for playOnVisible (runs once when scrolled into view)
    useEffect(() => {
        if (!playOnVisible || !containerRef.current) return;

        let timeoutId: NodeJS.Timeout;

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !hasPlayedVisible.current && !isActive) {
                hasPlayedVisible.current = true;

                if (playVisibleDelay > 0) {
                    timeoutId = setTimeout(() => {
                        // Double check isActive hasn't changed while waiting
                        if (!wasActive.current) {
                            lottieRef.current?.goToAndPlay(0, true);
                        }
                    }, playVisibleDelay);
                } else {
                    lottieRef.current?.goToAndPlay(0, true);
                }
            }
        }, { threshold: 0.1 });

        observer.observe(containerRef.current);

        return () => {
            observer.disconnect();
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [playOnVisible, playVisibleDelay, isActive]);

    // Hover state handling
    useEffect(() => {
        if (!lottieRef.current) return;

        if (isActive) {
            wasActive.current = true;
            lottieRef.current.goToAndPlay(0, true);
        } else if (wasActive.current) {
            wasActive.current = false;
            lottieRef.current.goToAndStop(staticFrame, true);
        }
    }, [isActive, staticFrame]);

    return (
        <div ref={containerRef} className={`flex items-center justify-center flex-shrink-0 ${className}`}>
            <Lottie
                lottieRef={lottieRef}
                animationData={animationData}
                loop={false}
                autoplay={false}
                style={{ width: "100%", height: "100%" }}
            />
        </div>
    );
});

AnimatedButtonIcon.displayName = "AnimatedButtonIcon";
