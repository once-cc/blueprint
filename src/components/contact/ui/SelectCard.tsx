import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SelectCardProps<T extends string> {
  value: T;
  label: string;
  selected: boolean;
  onSelect: (value: T) => void;
  index?: number;
}

const springConfig = { type: "spring", stiffness: 400, damping: 25 };

export function SelectCard<T extends string>({
  value,
  label,
  selected,
  onSelect,
  index = 0,
}: SelectCardProps<T>) {
  return (
    <motion.button
      type="button"
      onClick={() => onSelect(value)}
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        ...springConfig, 
        delay: index * 0.05,
      }}
      whileHover={{ scale: 1.02, transition: springConfig }}
      whileTap={{ scale: 0.98, transition: springConfig }}
      className={cn(
        'w-full px-4 py-3 text-left rounded-lg border transition-colors duration-200',
        'focus:outline-none focus:ring-2 focus:ring-foreground/20',
        selected
          ? 'border-foreground bg-foreground text-background'
          : 'border-border bg-background text-foreground hover:border-foreground/40'
      )}
    >
      <motion.span 
        className="font-medium block"
        animate={{ 
          x: selected ? 4 : 0 
        }}
        transition={springConfig}
      >
        {label}
      </motion.span>
    </motion.button>
  );
}
