import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface CheckboxCardProps<T extends string> {
  value: T;
  label: string;
  checked: boolean;
  onToggle: (value: T) => void;
  index?: number;
}

const springConfig = { type: "spring", stiffness: 400, damping: 25 };
const checkSpring = { type: "spring", stiffness: 500, damping: 30 };

export function CheckboxCard<T extends string>({
  value,
  label,
  checked,
  onToggle,
  index = 0,
}: CheckboxCardProps<T>) {
  return (
    <motion.button
      type="button"
      onClick={() => onToggle(value)}
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        ...springConfig, 
        delay: index * 0.05,
      }}
      whileHover={{ scale: 1.02, transition: springConfig }}
      whileTap={{ scale: 0.98, transition: springConfig }}
      className={cn(
        'w-full px-4 py-3 text-left rounded-lg border transition-colors duration-200 flex items-center gap-3',
        'focus:outline-none focus:ring-2 focus:ring-foreground/20',
        checked
          ? 'border-foreground bg-foreground text-background'
          : 'border-border bg-background text-foreground hover:border-foreground/40'
      )}
    >
      <motion.div
        className={cn(
          'w-5 h-5 rounded border flex items-center justify-center flex-shrink-0',
          checked
            ? 'bg-background border-background'
            : 'border-muted-foreground'
        )}
        animate={{ 
          scale: checked ? [1, 1.15, 1] : 1,
        }}
        transition={springConfig}
      >
        <AnimatePresence mode="wait">
          {checked && (
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 45 }}
              transition={checkSpring}
            >
              <Check className="w-3.5 h-3.5 text-foreground" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      <motion.span 
        className="font-medium"
        animate={{ x: checked ? 2 : 0 }}
        transition={springConfig}
      >
        {label}
      </motion.span>
    </motion.button>
  );
}
