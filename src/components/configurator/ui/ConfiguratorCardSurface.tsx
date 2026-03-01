import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { springConfig } from './animationConfig';

export interface ConfiguratorCardSurfaceProps {
  children: React.ReactNode;
  className?: string;
  isSelected?: boolean;
  isHoverable?: boolean;
  variant?: 'default' | 'elevated' | 'subtle';
  as?: 'div' | 'button';
  onClick?: () => void;
  disabled?: boolean;
  animateEntry?: boolean;
  entryDelay?: number;
}

export function ConfiguratorCardSurface({
  children,
  className,
  isSelected = false,
  isHoverable = true,
  variant = 'default',
  as = 'div',
  onClick,
  disabled = false,
  animateEntry = false,
  entryDelay = 0,
}: ConfiguratorCardSurfaceProps) {
  const prefersReducedMotion = useReducedMotion();

  const baseClasses = cn(
    // Base surface - Machined Inset Plate Effect
    'relative bg-card/90 dark:bg-zinc-950/80 backdrop-blur-sm rounded-xl',
    'shadow-[inset_0_0_0_1px_hsl(220_12%_20%_/_0.25),inset_0_2px_15px_rgba(0,0,0,0.5)]',

    // Border - quiet, theme-aware (Precision 1px)
    'border',
    isSelected
      ? 'border-accent/50'
      : 'border-[hsl(220_12%_12%_/_0.6)]',

    // Cinematic Transitions (disabled for reduced motion)
    !prefersReducedMotion && 'transition-[box-shadow,transform,border-color,background-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',

    // Focus states (accessibility)
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background',

    // Disabled state
    disabled && 'opacity-50 cursor-not-allowed',

    // Apply CSS surface class for shadows
    'cfg-surface',
    variant === 'elevated' && 'cfg-surface-elevated',
    variant === 'subtle' && 'cfg-surface-subtle',
    isSelected && 'cfg-surface-selected',

    // User classes
    className
  );

  const hoverAnimation = isHoverable && !disabled && !prefersReducedMotion
    ? { y: -1, transition: { duration: 0.22, ease: 'easeOut' } }
    : undefined;

  const tapAnimation = isHoverable && !disabled && !prefersReducedMotion
    ? { y: 0, transition: { duration: 0.1, ease: 'easeOut' } }
    : undefined;

  const entryAnimation = animateEntry && !prefersReducedMotion
    ? {
      initial: { opacity: 0, y: 20, scale: 0.95 },
      animate: { opacity: 1, y: 0, scale: 1 },
      transition: { ...springConfig, delay: entryDelay },
    }
    : {};

  if (as === 'button') {
    return (
      <motion.button
        type="button"
        onClick={!disabled ? onClick : undefined}
        disabled={disabled}
        className={baseClasses}
        whileHover={hoverAnimation}
        whileTap={tapAnimation}
        animate={isSelected && !prefersReducedMotion ? {
          boxShadow: [
            '0 0 0 2px hsl(var(--accent) / 0.5)',
            '0 0 0 4px hsl(var(--accent) / 0.15)',
            '0 0 0 2px hsl(var(--accent) / 0.3)',
          ],
        } : {}}
        transition={isSelected ? { duration: 0.5, ease: 'easeOut' } : undefined}
        {...entryAnimation}
      >
        <div className="absolute inset-x-0 -bottom-1/2 h-full z-[-1] pointer-events-none bg-[radial-gradient(80%_40%_at_50%_100%,hsl(37_91%_55%_/_0.05),transparent_70%)] rounded-[inherit]" />
        <div className="absolute inset-0 z-0 pointer-events-none rounded-[inherit] bg-[linear-gradient(to_bottom,hsl(45_10%_92%_/_0.04),transparent_40%)]" />
        <div className="absolute inset-0 z-0 pointer-events-none rounded-[inherit] opacity-[0.03] mix-blend-soft-light" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
        {children}
      </motion.button>
    );
  }

  return (
    <motion.div
      onClick={!disabled ? onClick : undefined}
      className={baseClasses}
      whileHover={hoverAnimation}
      whileTap={tapAnimation}
      animate={isSelected && !prefersReducedMotion ? {
        boxShadow: [
          '0 0 0 2px hsl(var(--accent) / 0.5)',
          '0 0 0 4px hsl(var(--accent) / 0.15)',
          '0 0 0 2px hsl(var(--accent) / 0.3)',
        ],
      } : {}}
      transition={isSelected ? { duration: 0.5, ease: 'easeOut' } : undefined}
      {...entryAnimation}
    >
      <div className="absolute inset-x-0 -bottom-1/2 h-full z-[-1] pointer-events-none bg-[radial-gradient(80%_40%_at_50%_100%,hsl(37_91%_55%_/_0.05),transparent_70%)] rounded-[inherit]" />
      <div className="absolute inset-0 z-0 pointer-events-none rounded-[inherit] bg-[linear-gradient(to_bottom,hsl(45_10%_92%_/_0.04),transparent_40%)]" />
      <div className="absolute inset-0 z-0 pointer-events-none rounded-[inherit] opacity-[0.03] mix-blend-soft-light" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
      {children}
    </motion.div>
  );
}

/**
 * CSS class-based alternative for components where wrapper is too invasive.
 * Add 'cfg-surface' class and the appropriate variant class.
 * 
 * Usage:
 * - Default: className="cfg-surface"
 * - Elevated: className="cfg-surface cfg-surface-elevated"  
 * - Subtle: className="cfg-surface cfg-surface-subtle"
 * - Selected: className="cfg-surface cfg-surface-selected"
 */
