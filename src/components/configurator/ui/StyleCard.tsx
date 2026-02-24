import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { springConfig, checkSpring, cardHover, cardTap, getContentShift, getIconAnimation } from './animationConfig';

interface StyleCardProps {
  value: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  isSelected: boolean;
  onSelect: (value: string) => void;
  variant?: 'default' | 'compact';
  index?: number;
}

export function StyleCard({
  value,
  label,
  description,
  icon,
  isSelected,
  onSelect,
  variant = 'default',
  index = 0,
}: StyleCardProps) {
  const isCompact = variant === 'compact';

  return (
    <motion.button
      onClick={() => onSelect(value)}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ ...springConfig, delay: index * 0.05 }}
      whileHover={{ ...cardHover, transition: springConfig }}
      whileTap={{ ...cardTap, transition: springConfig }}
      className={cn(
        'relative w-full text-left transition-all duration-[220ms] ease-out cfg-surface',
        isCompact ? 'p-3 rounded-xl' : 'p-6 rounded-2xl',
        'border bg-card/80 backdrop-blur-sm',
        isSelected
          ? 'border-accent/50 cfg-surface-selected'
          : 'border-border/40 dark:border-border/50 hover:border-border/60'
      )}
    >
      {/* Selected Indicator */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={checkSpring}
          className={`absolute ${isCompact ? 'top-2 right-2' : 'top-4 right-4'}`}
        >
          <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center">
            <Check className="w-3 h-3 text-accent-foreground" />
          </div>
        </motion.div>
      )}

      {/* Icon */}
      {icon && (
        <motion.div
          animate={{ ...getContentShift(isSelected), ...getIconAnimation(isSelected) }}
          transition={springConfig}
          className={`${isCompact ? 'mb-2' : 'mb-4'} ${isSelected ? 'text-accent' : 'text-muted-foreground'
            }`}
        >
          {icon}
        </motion.div>
      )}

      {/* Label */}
      <motion.h3
        animate={getContentShift(isSelected)}
        transition={springConfig}
        className={`font-nohemi font-medium ${isCompact ? 'text-base' : 'text-lg md:text-xl'
          } ${isSelected ? 'text-foreground' : 'text-foreground/90'}`}
      >
        {label}
      </motion.h3>

      {/* Description */}
      {description && (
        <motion.p
          animate={getContentShift(isSelected)}
          transition={springConfig}
          className={`mt-2 text-muted-foreground ${isCompact ? 'text-xs' : 'text-sm'
            }`}
        >
          {description}
        </motion.p>
      )}
    </motion.button>
  );
}
