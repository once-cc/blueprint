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
    'shadow-[inset_0_2px_10px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_2px_15px_rgba(0,0,0,0.5)]',

    // Border - quiet, theme-aware
    'border',
    isSelected
      ? 'border-accent/50'
      : 'border-white/10 dark:border-white/5',

    // Transitions (disabled for reduced motion)
    !prefersReducedMotion && 'transition-[box-shadow,transform,border-color,background-color] duration-[220ms] ease-out',

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
