import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { springConfig, checkSpring, getContentShift, getIconAnimation } from './animationConfig';
import { ConfiguratorCardSurface } from './ConfiguratorCardSurface';

export type ConfiguratorOptionVariant = 'default' | 'compact' | 'chip' | 'minimal';
export type ConfiguratorOptionIndicator = 'check' | 'none' | 'border' | 'ring';

export interface ConfiguratorOptionProps {
  value: string;
  label: string;
  description?: string;
  icon?: ReactNode;

  isSelected: boolean;
  isDisabled?: boolean;
  onSelect: (value: string) => void;

  variant?: ConfiguratorOptionVariant;
  indicator?: ConfiguratorOptionIndicator;
  index?: number;
}

export function ConfiguratorOption({
  value,
  label,
  description,
  icon,
  isSelected,
  isDisabled = false,
  onSelect,
  variant = 'default',
  indicator = 'check',
  index = 0,
}: ConfiguratorOptionProps) {

  // Style Mappings based on Variant
  const isChip = variant === 'chip';
  const isCompact = variant === 'compact';
  const isMinimal = variant === 'minimal';

  const layoutClasses = cn(
    'relative w-full text-left flex',
    isChip && 'flex flex-row items-center justify-center px-5 py-3.5 w-auto',
    isCompact && 'px-5 py-4 gap-3 items-start',
    isMinimal && 'p-2 px-4 gap-2 items-center',
    variant === 'default' && 'flex-col p-5 items-start gap-5',
    isDisabled && 'opacity-40 cursor-not-allowed hover:scale-100'
  );

  return (
    <ConfiguratorCardSurface
      as="button"
      isSelected={isSelected}
      onClick={() => !isDisabled && onSelect(value)}
      disabled={isDisabled}
      animateEntry={true}
      entryDelay={index * 0.05}
      className={cn(layoutClasses, 'group', isChip && 'rounded-xl')}
    >
      {/* Top-Right Absolute Check Indicator */}
      {isSelected && indicator === 'check' && !isCompact && !isChip && !isMinimal && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={checkSpring}
          className="absolute top-4 right-4"
        >
          <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center">
            <Check className="w-3 h-3 text-accent-foreground" />
          </div>
        </motion.div>
      )}


      {/* Inline Left Icon/Checkbox Wrapper (Compact & Chip & Default) */}
      <div className={cn(
        "flex w-full",
        (isCompact || isMinimal || isChip) ? "items-center" : "flex-col gap-4",
        isChip && "justify-center gap-2.5",
        isCompact && "gap-3",
        isMinimal && "gap-2"
      )}>

        {/* Dynamic Icon / Inline Checkbox */}
        <motion.div
          animate={{
            scale: isSelected && !isChip && !isCompact ? 1.1 : 1,
          }}
          transition={springConfig}
          className={cn(
            'flex-shrink-0 flex items-center justify-center transition-colors',

            // Default Icon Box Styling
            variant === 'default' && icon && 'w-8 h-8 rounded-md bg-muted/50 text-muted-foreground',
            variant === 'default' && icon && !isSelected && 'group-hover:text-foreground group-hover:bg-muted',
            variant === 'default' && icon && isSelected && 'bg-accent/20 text-accent',
            // Compact/Minimal Inline Checkbox Styling
            (isCompact || isMinimal) && indicator === 'check' && 'w-5 h-5 rounded border-2 border-muted-foreground/30 group-hover:border-muted-foreground/50',
            (isCompact || isMinimal) && indicator === 'check' && isSelected && 'border-accent bg-accent'
          )}
        >
          {/* Render provided icon */}
          {icon && variant === 'default' && icon}

          {/* Render inline compact/minimal check */}
          {isSelected && (isCompact || isMinimal) && indicator === 'check' && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={checkSpring}>
              <Check className="w-3 h-3 text-accent-foreground" />
            </motion.div>
          )}

          {/* Render inline chip check */}
          {isSelected && isChip && indicator === 'check' && (
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={checkSpring} className="mr-1">
              <Check className="w-3.5 h-3.5 text-accent" />
            </motion.span>
          )}

          {/* Render provided icon for chip */}
          {icon && isChip && (
            <div className={cn(
              "w-4 h-4 mr-1 transition-colors",
              isSelected ? "text-accent" : "text-muted-foreground group-hover:text-foreground"
            )}>{icon}</div>
          )}
        </motion.div>

        {/* Compact icon rendered outside checkbox, between checkbox and label */}
        {icon && isCompact && (
          <div className={cn(
            "w-4 h-4 flex-shrink-0 transition-colors",
            isSelected ? "text-accent" : "text-muted-foreground group-hover:text-foreground"
          )}>{icon}</div>
        )}

        {/* Content Body */}
        <div className={cn(
          "flex-1 min-w-0 flex",
          isCompact ? "flex-col gap-0.5" : "flex-col justify-center"
        )}>
          <motion.h3
            animate={getContentShift(isSelected)}
            transition={springConfig}
            className={cn(
              'transition-colors',
              // Font styling
              !isMinimal && !isChip && 'font-nohemi font-medium',
              isChip && 'font-normal', // Pills are Regular weight in design
              isMinimal && 'font-medium',
              // Sizes
              variant === 'default' && 'text-lg',
              isCompact && 'text-sm font-medium',
              isMinimal && 'text-sm',
              isChip && 'text-[15px] tracking-wide',
              // Colors
              isSelected && (isChip || isMinimal || isCompact) ? 'text-accent' : 'text-foreground/90',
              !isSelected && (isChip || isMinimal) && 'text-muted-foreground group-hover:text-foreground',
              isDisabled && 'text-muted-foreground'
            )}
          >
            {label}
          </motion.h3>

          {description && (
            <motion.p
              animate={getContentShift(isSelected)}
              transition={{ ...springConfig, delay: 0.02 }}
              className={cn(
                'text-muted-foreground transition-colors',
                variant === 'default' && 'text-sm mt-1',
                isCompact && 'text-xs',
                isSelected && isCompact && 'text-accent/80'
              )}
            >
              <span>{description}</span>
            </motion.p>
          )}
        </div>

        {/* Trailing Indicators (Compact Multi-select ring) */}
        {isSelected && indicator === 'ring' && isCompact && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex-shrink-0 w-5 h-5 rounded-full bg-accent flex items-center justify-center ml-auto"
          >
            <Check className="w-3 h-3 text-accent-foreground" />
          </motion.div>
        )}
      </div>
    </ConfiguratorCardSurface>
  );
}
