import { useEffect, useRef, type RefObject } from 'react';

/**
 * Pauses CSS animations inside a container when it scrolls off-screen.
 * Uses pure DOM class toggle — zero React state, zero re-renders.
 *
 * @param rootMargin  IO rootMargin (default: generous 300px buffer so
 *                    animations resume before the section enters view)
 * @returns ref to attach to the container element
 */
export function useRayPause<T extends HTMLElement>(rootMargin = '300px 0px'): RefObject<T | null> {
    const ref = useRef<T>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                // When NOT intersecting, add class to pause child animations
                el.classList.toggle('rays-paused', !entry.isIntersecting);
            },
            { rootMargin }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [rootMargin]);

    return ref;
}
