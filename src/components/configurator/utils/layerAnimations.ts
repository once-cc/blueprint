export type AnimationDirection = 'forward' | 'back';

export const getLayerVariants = (direction: AnimationDirection) => ({
  initial: {
    opacity: 0,
    x: direction === 'forward' ? 40 : -40,
  },
  animate: {
    opacity: 1,
    x: 0,
  },
  exit: {
    opacity: 0,
    x: direction === 'forward' ? -40 : 40,
  },
});

export const layerTransition = {
  duration: 0.3,
  ease: [0.4, 0, 0.2, 1] as const,
};
