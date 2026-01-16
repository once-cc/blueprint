import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SelectCard } from '../ui/SelectCard';
import { Industry, industryOptions } from '@/types/contact';

interface Step1BusinessProps {
  industry: Industry | null;
  businessName: string;
  currentWebsite: string;
  onChange: (field: string, value: string) => void;
  onNext: () => void;
}

const springConfig = { type: "spring", stiffness: 400, damping: 25 };

export function Step1Business({
  industry,
  businessName,
  currentWebsite,
  onChange,
  onNext,
}: Step1BusinessProps) {
  const isValid = industry && businessName.trim();

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
        <h2 className="text-2xl font-semibold tracking-tight">Tell us about your business</h2>
        <p className="text-muted-foreground">Help us understand your current situation</p>
      </motion.div>

      {/* Industry */}
      <motion.div 
        className="space-y-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        <Label>Industry / Type</Label>
        <div className="grid grid-cols-2 gap-3">
          {industryOptions.map((option, index) => (
            <SelectCard
              key={option.value}
              value={option.value}
              label={option.label}
              selected={industry === option.value}
              onSelect={(val) => onChange('industry', val)}
              index={index}
            />
          ))}
        </div>
      </motion.div>

      {/* Business Name */}
      <motion.div 
        className="space-y-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Label htmlFor="businessName">Business Name</Label>
        <Input
          id="businessName"
          placeholder="Your business name"
          value={businessName}
          onChange={(e) => onChange('businessName', e.target.value)}
          className="transition-all focus:scale-[1.01]"
        />
      </motion.div>

      {/* Current Website */}
      <motion.div 
        className="space-y-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <Label htmlFor="currentWebsite">Current Website (optional)</Label>
        <Input
          id="currentWebsite"
          type="url"
          placeholder="https://yoursite.com"
          value={currentWebsite}
          onChange={(e) => onChange('currentWebsite', e.target.value)}
          className="transition-all focus:scale-[1.01]"
        />
      </motion.div>

      {/* Navigation */}
      <motion.div 
        className="flex justify-end pt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
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
