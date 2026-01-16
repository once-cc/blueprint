import { motion, AnimatePresence } from 'framer-motion';
import { PlayCircle, RotateCcw, Clock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

interface SessionResumeModalProps {
  isOpen: boolean;
  onContinue: () => void;
  onStartFresh: () => void;
  lastUpdated?: Date;
  currentStep: number;
  dreamIntent?: string;
}

const stepLabels: Record<number, string> = {
  1: 'Business Foundations',
  2: 'Brand Voice',
  3: 'CTA Energy',
  4: 'Visual Style',
  5: 'Typography & Motion',
  6: 'Color Palette',
  7: 'Functionality',
  8: 'Creative Risk',
  9: 'References',
  10: 'Review',
};

export function SessionResumeModal({
  isOpen,
  onContinue,
  onStartFresh,
  lastUpdated,
  currentStep,
  dreamIntent,
}: SessionResumeModalProps) {
  if (!isOpen) return null;

  const stepLabel = stepLabels[currentStep] || `Step ${currentStep}`;
  const timeAgo = lastUpdated ? formatDistanceToNow(lastUpdated, { addSuffix: true }) : 'recently';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-md mx-4 p-8 rounded-2xl bg-card border border-border/50 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-accent/10 text-accent">
              <PlayCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Welcome Back!</h2>
              <p className="text-sm text-muted-foreground">You have an unfinished blueprint</p>
            </div>
          </div>

          {/* Progress Info */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/30">
              <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Last updated</p>
                <p className="text-sm font-medium text-foreground truncate">{timeAgo}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/30">
              <Sparkles className="w-4 h-4 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Current progress</p>
                <p className="text-sm font-medium text-foreground">
                  Step {currentStep} of 10 — {stepLabel}
                </p>
              </div>
            </div>

            {dreamIntent && (
              <div className="p-3 rounded-lg bg-accent/5 border border-accent/20">
                <p className="text-xs text-muted-foreground mb-1">Your vision</p>
                <p className="text-sm text-foreground line-clamp-2 italic">"{dreamIntent}"</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={onContinue}
              className="w-full h-12 text-base font-medium"
              size="lg"
            >
              <PlayCircle className="w-5 h-5 mr-2" />
              Continue Where I Left Off
            </Button>
            <Button
              onClick={onStartFresh}
              variant="ghost"
              className="w-full text-muted-foreground hover:text-destructive"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Start Fresh
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
