import { useCallback } from 'react';
import { useSmoothScroll } from '@/components/providers/SmoothScrollProvider';

interface ScrollToOptions {
  offset?: number;
  duration?: number;
  immediate?: boolean;
  onComplete?: () => void;
}

export function useLenisScroll() {
  const { lenis } = useSmoothScroll();

  const scrollTo = useCallback((
    target: string | number | HTMLElement,
    options?: ScrollToOptions
  ) => {
    if (!lenis) {
      // Fallback to native scroll if Lenis not available
      if (typeof target === 'string') {
        const element = document.querySelector(target);
        element?.scrollIntoView({ behavior: 'smooth' });
      } else if (typeof target === 'number') {
        window.scrollTo({ top: target, behavior: 'smooth' });
      } else if (target instanceof HTMLElement) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    lenis.scrollTo(target, {
      offset: options?.offset ?? 0,
      duration: options?.duration ?? 1.4,
      immediate: options?.immediate ?? false,
      onComplete: options?.onComplete,
    });
  }, [lenis]);

  const stop = useCallback(() => {
    lenis?.stop();
  }, [lenis]);

  const start = useCallback(() => {
    lenis?.start();
  }, [lenis]);

  return { scrollTo, stop, start, lenis };
}
