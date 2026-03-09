import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';

// --- Static Typography Components ---

export const ConfiguratorQuestion = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
    ({ className, ...props }, ref) => (
        <h2
            ref={ref}
            className={cn("text-xl sm:text-2xl font-nohemi font-medium text-foreground/90 leading-tight", className)}
            {...props}
        />
    )
);
ConfiguratorQuestion.displayName = "ConfiguratorQuestion";

export const ConfiguratorModuleTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
    ({ className, ...props }, ref) => (
        <h3
            ref={ref}
            className={cn("text-[11px] sm:text-xs font-raela font-medium uppercase tracking-[0.2em] text-foreground/80", className)}
            {...props}
        />
    )
);
ConfiguratorModuleTitle.displayName = "ConfiguratorModuleTitle";

export const ConfiguratorBody = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
    ({ className, ...props }, ref) => (
        <p
            ref={ref}
            className={cn("text-sm text-foreground/80 leading-relaxed", className)}
            {...props}
        />
    )
);
ConfiguratorBody.displayName = "ConfiguratorBody";

export const ConfiguratorHelper = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
    ({ className, ...props }, ref) => (
        <p
            ref={ref}
            className={cn("text-xs text-muted-foreground/70 leading-snug", className)}
            {...props}
        />
    )
);
ConfiguratorHelper.displayName = "ConfiguratorHelper";

export const ConfiguratorMeta = forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
    ({ className, ...props }, ref) => (
        <span
            ref={ref}
            className={cn("font-mono text-[10px] sm:text-[11px] uppercase tracking-wider text-muted-foreground/40", className)}
            {...props}
        />
    )
);
ConfiguratorMeta.displayName = "ConfiguratorMeta";

// --- Animated (Motion) Typography Components ---

export const MotionConfiguratorQuestion = motion(ConfiguratorQuestion);
export const MotionConfiguratorModuleTitle = motion(ConfiguratorModuleTitle);
export const MotionConfiguratorBody = motion(ConfiguratorBody);
export const MotionConfiguratorHelper = motion(ConfiguratorHelper);
export const MotionConfiguratorMeta = motion(ConfiguratorMeta);
