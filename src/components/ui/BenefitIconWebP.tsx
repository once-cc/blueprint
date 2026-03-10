import React, { useEffect, useState, useRef } from "react";

interface BenefitIconWebPProps {
    src: string;
    isActive: boolean;
    className?: string;
    staticFrame?: number; // Kept for API compatibility, though WebP handles static states natively if exported correctly (e.g., non-looping)
    hasPlayedOnce?: boolean;
    playDelay?: number;
}

export const BenefitIconWebP = React.memo(({
    src,
    isActive,
    className = "",
    staticFrame = 0
}: BenefitIconWebPProps) => {
    // We use a timestamp to force the WebP to restart its animation from frame 0
    // when hovered, since native WebP doesn't have a JS play() method.
    const [activeSrc, setActiveSrc] = useState(src);
    const isFirstMount = useRef(true);

    useEffect(() => {
        // Skip the very first mount so it doesn't immediately blink/reload the image
        if (isFirstMount.current) {
            isFirstMount.current = false;
            return;
        }

        // User explicitly hovers the card
        if (isActive) {
            // Force WebP animation restart by appending fresh timestamp
            setActiveSrc(`${src}?t=${Date.now()}`);
        }
        // When user stops hovering (!isActive), we do absolutely nothing. 
        // We let the WebP finish its current loop and rest on its static frame. 

    }, [isActive, src]);

    return (
        <div
            // Container precisely matches original 48x48 bounds and styling
            className={`relative w-12 h-12 rounded bg-background border border-white/10 flex items-center justify-center flex-shrink-0 transition-opacity duration-500 ${className}`}
        >
            <img
                src={activeSrc}
                alt="Benefit Icon"
                className="w-8 h-8 object-contain"
                // Using hardware acceleration hint
                style={{ transform: "translateZ(0)" }}
            />
        </div>
    );
});
