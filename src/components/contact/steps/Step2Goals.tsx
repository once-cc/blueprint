import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { CheckboxCard } from '../ui/CheckboxCard';
import { Goal, goalOptions } from '@/types/contact';

interface Step2GoalsProps {
  goals: Goal[];
  onToggle: (value: Goal) => void;
  onBack: () => void;
  onNext: () => void;
}

const springConfig = { type: "spring", stiffness: 400, damping: 25 };

export function Step2Goals({ goals, onToggle, onBack, onNext }: Step2GoalsProps) {
  const isValid = goals.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <motion.div 
        className="space-y-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-2xl font-semibold tracking-tight">What are your goals?</h2>
        <p className="text-muted-foreground">Where do you want to be?</p>
      </motion.div>

      {/* Goals */}
      <motion.div 
        className="space-y-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        <Label>Select all that apply</Label>
        <div className="grid grid-cols-1 gap-3">
          {goalOptions.map((option, index) => (
            <CheckboxCard
              key={option.value}
              value={option.value}
              label={option.label}
              checked={goals.includes(option.value)}
              onToggle={onToggle}
              index={index}
            />
          ))}
        </div>
      </motion.div>

      {/* Navigation */}
      <motion.div 
        className="flex justify-between pt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <motion.div whileHover={{ x: -2 }} whileTap={{ scale: 0.98 }}>
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </motion.div>
        <motion.div 
          whileHover={{ scale: 1.02, x: 2 }} 
          whileTap={{ scale: 0.98 }}
          transition={springConfig}
        >
          <Button onClick={onNext} disabled={!isValid} className="gap-2 group">
            Continue
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
