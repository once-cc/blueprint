import React, { useEffect, useRef } from 'react';
import lottie, { AnimationItem } from 'lottie-web';

import unlockData from '@/assets/ui/unlock.json';
import unlockAmberData from '@/assets/ui/unlock_amber.json';
import { cn } from '@/lib/utils';

interface AnimatedLockIconProps {
    isLocked: boolean;
    className?: string;
}

export const AnimatedLockIcon: React.FC<AnimatedLockIconProps> = ({ isLocked, className }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const animRef = useRef<AnimationItem | null>(null);
    const isReversingRef = useRef(false);
    const prevLockedRef = useRef(isLocked);

    // Use a stable reference to keep track of initializing
    const initLottie = (data: any, goToFrame: number | 'end') => {
        if (animRef.current) {
            animRef.current.destroy();
        }
        const anim = lottie.loadAnimation({
            container: containerRef.current!,
            renderer: 'svg',
            loop: false,
            autoplay: false,
            animationData: data,
        });
        animRef.current = anim;

        anim.addEventListener('DOMLoaded', () => {
            if (goToFrame === 'end') {
                anim.goToAndStop(Math.max(0, anim.totalFrames - 1), true);
            } else {
                anim.goToAndStop(goToFrame, true);
            }
        });

        anim.addEventListener('complete', () => {
            if (isReversingRef.current) {
                // We finished returning to rest state.
                isReversingRef.current = false;
                // Instantly swap to Neutral
                initLottie(unlockData, 0);
            }
        });

        return anim;
    };

    useEffect(() => {
        if (!containerRef.current) return;
        initLottie(isLocked ? unlockAmberData : unlockData, isLocked ? 'end' : 0);

        return () => {
            if (animRef.current) {
                animRef.current.destroy();
                animRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (prevLockedRef.current === isLocked) return;
        prevLockedRef.current = isLocked;

        const anim = animRef.current;
        if (!anim) return;

        if (isLocked) {
            // False -> True (Locking/Engaging Amber)
            isReversingRef.current = false;
            // Instantly swap to amber, keeping on last frame
            initLottie(unlockAmberData, 'end');
        } else {
            // True -> False (Unlocking/Reverting to Neutral)
            // Play backwards to return to resting state
            isReversingRef.current = true;
            anim.setDirection(-1);
            anim.play();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLocked]);

    const handleMouseEnter = () => {
        // If engaged, do nothing (keep on last frame)
        if (isLocked) return;
        // If currently reversing back to neutral, do not interrupt
        if (isReversingRef.current) return;

        // If neutral, play forward
        if (animRef.current) {
            animRef.current.setDirection(1);
            animRef.current.play();
        }
    };

    const handleMouseLeave = () => {
        // If engaged, do nothing
        if (isLocked) return;
        // If currently reversing back to neutral, do not interrupt
        if (isReversingRef.current) return;

        // If neutral, instantly reset to frame 0
        if (animRef.current) {
            animRef.current.goToAndStop(0, true);
        }
    };

    return (
        <div
            ref={containerRef}
            className={cn("w-4 h-4", className)}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        />
    );
};
