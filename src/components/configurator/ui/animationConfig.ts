// Shared animation configuration for configurator components
// Matches the contact form animation patterns for consistency

export const springConfig = { type: "spring" as const, stiffness: 400, damping: 25 };
export const checkSpring = { type: "spring" as const, stiffness: 500, damping: 30 };

// Surface transition timing
export const surfaceTransition = {
  duration: 0.22,
  ease: 'easeOut' as const,
};

// Standard card entry animation
export const cardEntryVariants = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
};

// Standard hover/tap animations (Apple-calm)
export const cardHover = { scale: 1.02, y: -2 };
export const cardTap = { scale: 0.98 };

// Surface hover/tap (more subtle for cinematic lift)
export const surfaceHover = { y: -1 };
export const surfaceTap = { y: 0 };

// Content shift on selection
export const getContentShift = (isSelected: boolean) => ({
  x: isSelected ? 4 : 0,
});

// Icon animation on selection
export const getIconAnimation = (isSelected: boolean) => ({
  scale: isSelected ? 1.1 : 1,
  rotate: isSelected ? 5 : 0,
});

// Shadow stacks for configurator surfaces
export const cfgShadows = {
  light: {
    rest: '0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.05), 0 12px 32px rgba(0,0,0,0.03)',
    hover: '0 1px 2px rgba(0,0,0,0.05), 0 6px 16px rgba(0,0,0,0.07), 0 16px 40px rgba(0,0,0,0.04)',
    pressed: '0 1px 2px rgba(0,0,0,0.06), 0 2px 6px rgba(0,0,0,0.04)',
  },
  dark: {
    rest: 'inset 0 1px 0 0 rgba(255,255,255,0.03), 0 1px 2px rgba(0,0,0,0.2), 0 4px 8px rgba(0,0,0,0.15)',
    hover: 'inset 0 1px 0 0 rgba(255,255,255,0.05), 0 1px 2px rgba(0,0,0,0.25), 0 6px 12px rgba(0,0,0,0.2)',
    pressed: 'inset 0 1px 0 0 rgba(255,255,255,0.02), 0 1px 2px rgba(0,0,0,0.15)',
  },
};
