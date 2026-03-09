import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import noiseTexture from "@/assets/noise/noise.png";
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

  const baseClasses = cn(
    // Base surface - Machined Inset Plate Effect
    'relative bg-card/90 dark:bg-zinc-950/80 backdrop-blur-sm rounded-xl',
    'shadow-[inset_0_0_0_1px_hsl(220_12%_20%_/_0.25),inset_0_2px_15px_rgba(0,0,0,0.5)]',

    // Border - quiet, theme-aware (Precision 1px)
    'border',
    isSelected
      ? 'border-accent/50'
      : 'border-[hsl(220_12%_12%_/_0.6)]',

    // Cinematic Transitions
    'transition-[box-shadow,transform,border-color,background-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',

    // Focus states (accessibility)
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background',

    // Disabled state
    disabled && 'opacity-50 cursor-not-allowed',

    // User classes
    className
  );

  const hoverAnimation = isHoverable && !disabled
    ? { y: -1, transition: { duration: 0.22, ease: 'easeOut' } }
    : undefined;

  const tapAnimation = isHoverable && !disabled
    ? { y: 0, transition: { duration: 0.1, ease: 'easeOut' } }
    : undefined;

  const entryAnimation = animateEntry
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
        animate={isSelected ? {
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
        <div className="absolute inset-0 z-0 pointer-events-none rounded-[inherit] opacity-[0.20]" style={{ backgroundImage: `url(${noiseTexture})` }} />

        {/* Child Layout Wrapper (Solves Lobotomized Owl bug with absolute children) */}
        <div className="relative z-10 w-full h-full flex flex-col">
          {children}
        </div>
      </motion.button>
    );
  }

  return (
    <motion.div
      onClick={!disabled ? onClick : undefined}
      className={baseClasses}
      whileHover={hoverAnimation}
      whileTap={tapAnimation}
      animate={isSelected ? {
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
      <div className="absolute inset-0 z-0 pointer-events-none rounded-[inherit] opacity-[0.20]" style={{ backgroundImage: `url(${noiseTexture})` }} />

      {/* Child Layout Wrapper (Solves Lobotomized Owl bug with absolute children) */}
      <div className="relative z-10 w-full h-full flex flex-col">
        {children}
      </div>
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
