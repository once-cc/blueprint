import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { springConfig, checkSpring, cardHover, cardTap, getContentShift } from './animationConfig';

interface SelectChipProps {
  value: string;
  label: string;
  isSelected: boolean;
  onToggle: (value: string) => void;
  index?: number;
}

export function SelectChip({ value, label, isSelected, onToggle, index = 0 }: SelectChipProps) {
  return (
    <motion.button
      onClick={() => onToggle(value)}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ ...springConfig, delay: index * 0.05 }}
      whileHover={{ ...cardHover, transition: springConfig }}
      whileTap={{ ...cardTap, transition: springConfig }}
      className={cn(
        'inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium',
        'transition-all duration-[220ms] ease-out cfg-surface-subtle',
        'border',
        isSelected
          ? 'bg-accent text-accent-foreground border-accent/50 cfg-surface-selected'
          : 'bg-card/80 text-muted-foreground border-border/40 dark:border-border/50 hover:bg-card hover:text-foreground'
      )}
    >
      {isSelected && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={checkSpring}
        >
          <Check className="w-3.5 h-3.5" />
        </motion.span>
      )}
      <motion.span
        animate={getContentShift(isSelected)}
        transition={springConfig}
      >
        {label}
      </motion.span>
    </motion.button>
  );
}
