import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { SelectCard } from '../ui/SelectCard';
import { Timeline, Investment, timelineOptions, investmentOptions } from '@/types/contact';

interface Step4TimelineProps {
  timeline: Timeline | null;
  investment: Investment | null;
  onChange: (field: string, value: string) => void;
  onBack: () => void;
  onNext: () => void;
}

const springConfig = { type: "spring", stiffness: 400, damping: 25 };

export function Step4Timeline({
  timeline,
  investment,
  onChange,
  onBack,
  onNext,
}: Step4TimelineProps) {
  const isValid = timeline && investment;

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
        <h2 className="text-2xl font-semibold tracking-tight">Timeline & investment</h2>
        <p className="text-muted-foreground">When do you want to launch?</p>
      </motion.div>

      {/* Timeline */}
      <motion.div 
        className="space-y-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        <Label>Timeline</Label>
        <div className="grid grid-cols-2 gap-3">
          {timelineOptions.map((option, index) => (
            <SelectCard
              key={option.value}
              value={option.value}
              label={option.label}
              selected={timeline === option.value}
              onSelect={(val) => onChange('timeline', val)}
              index={index}
            />
          ))}
        </div>
      </motion.div>

      {/* Investment Range */}
      <motion.div 
        className="space-y-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Label>Investment Range</Label>
        <div className="grid grid-cols-1 gap-3">
          {investmentOptions.map((option, index) => (
            <SelectCard
              key={option.value}
              value={option.value}
              label={option.label}
              selected={investment === option.value}
              onSelect={(val) => onChange('investment', val)}
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
        transition={{ delay: 0.5 }}
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
