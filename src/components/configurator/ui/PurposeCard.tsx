import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { springConfig } from './animationConfig';

interface PurposeCardProps {
  value: string;
  label: string;
  description: string;
  icon: LucideIcon;
  isSelected: boolean;
  isDisabled?: boolean;
  onSelect: () => void;
  size?: 'default' | 'compact';
}

export function PurposeCard({
  value,
  label,
  description,
  icon: Icon,
  isSelected,
  isDisabled = false,
  onSelect,
  size = 'default',
}: PurposeCardProps) {
  return (
    <motion.button
      type="button"
      onClick={() => !isDisabled && onSelect()}
      disabled={isDisabled}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={!isDisabled ? { scale: 1.02, y: -2 } : undefined}
      whileTap={!isDisabled ? { scale: 0.98 } : undefined}
      transition={springConfig}
      className={cn(
        'group relative w-full text-left rounded-xl transition-all duration-[220ms] ease-out cfg-surface',
        size === 'default' ? 'p-6' : 'p-4',
        'border bg-card/80 backdrop-blur-sm',
        isSelected
          ? 'border-accent/50 cfg-surface-selected'
          : 'border-border/40 dark:border-border/50 hover:border-border hover:bg-card/90',
        isDisabled && 'opacity-40 cursor-not-allowed hover:scale-100'
      )}
    >
      {/* Selected indicator */}
      {isSelected && (
        <motion.div
          layoutId="purpose-indicator"
          className="absolute inset-0 rounded-xl border-2 border-accent pointer-events-none"
          initial={false}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      )}
      
      <div className={cn(
        'flex items-start gap-4',
        size === 'compact' && 'gap-3'
      )}>
        {/* Icon */}
        <motion.div
          animate={{ 
            scale: isSelected ? 1.1 : 1,
            rotate: isSelected ? 5 : 0,
          }}
          transition={springConfig}
          className={cn(
            'flex-shrink-0 rounded-lg flex items-center justify-center transition-colors',
            size === 'default' ? 'w-12 h-12' : 'w-10 h-10',
            isSelected 
              ? 'bg-accent/20 text-accent' 
              : 'bg-muted/50 text-muted-foreground group-hover:text-foreground group-hover:bg-muted'
          )}
        >
          <Icon className={cn(
            size === 'default' ? 'w-6 h-6' : 'w-5 h-5'
          )} />
        </motion.div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <motion.h3
            animate={{ x: isSelected ? 4 : 0 }}
            transition={springConfig}
            className={cn(
              'font-display font-semibold text-foreground transition-colors',
              size === 'default' ? 'text-lg' : 'text-base',
              isDisabled && 'text-muted-foreground'
            )}
          >
            {label}
          </motion.h3>
          <motion.p
            animate={{ x: isSelected ? 4 : 0 }}
            transition={{ ...springConfig, delay: 0.02 }}
            className={cn(
              'text-muted-foreground mt-1',
              size === 'default' ? 'text-sm' : 'text-xs'
            )}
          >
            {description}
          </motion.p>
        </div>
        
        {/* Checkbox indicator for multi-select */}
        {isSelected && size === 'compact' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex-shrink-0 w-5 h-5 rounded-full bg-accent flex items-center justify-center"
          >
            <svg 
              className="w-3 h-3 text-accent-foreground" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={3} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          </motion.div>
        )}
      </div>
    </motion.button>
  );
}
