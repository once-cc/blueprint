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
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md mx-4 p-8 rounded-[2rem] bg-black/60 backdrop-blur-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden"
        >
          {/* Subtle Ambient Background Glow */}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-accent/10 to-transparent pointer-events-none" />

          {/* Header */}
          <div className="flex items-center gap-4 mb-8 relative z-10">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-accent/10 text-accent shadow-[0_0_20px_hsl(var(--accent)/0.2)] ring-1 ring-accent/30 shrink-0">
              <PlayCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-nohemi font-medium text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">Welcome Back</h2>
              <p className="text-sm font-light text-muted-foreground/80 mt-0.5">Resume your unfinished blueprint</p>
            </div>
          </div>

          {/* Progress Info Grid (Bento Style) */}
          <div className="grid grid-cols-2 gap-3 mb-6 relative z-10">
            {/* Last Updated Card */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 group hover:bg-white/[0.05] transition-colors cursor-default">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-muted-foreground/60" />
                <p className="text-[10px] font-mono tracking-wider uppercase text-muted-foreground/80">Last Updated</p>
              </div>
              <p className="text-sm font-medium text-white line-clamp-1">{timeAgo}</p>
            </div>

            {/* Current Progress Card */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 group hover:bg-white/[0.05] transition-colors cursor-default">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-accent/80" />
                <p className="text-[10px] font-mono tracking-wider uppercase text-accent/80">Progress</p>
              </div>
              <p className="text-sm font-medium text-white line-clamp-1">Step {currentStep} <span className="text-white/40 font-light mx-1">/</span> 10</p>
              <p className="text-[10px] text-muted-foreground/60 mt-0.5 line-clamp-1 truncate">{stepLabel}</p>
            </div>
          </div>

          {/* "Your Vision" Editorial Block */}
          {dreamIntent && (
            <div className="mb-8 pl-4 py-2 border-l-2 border-accent/80 bg-gradient-to-r from-accent/5 to-transparent relative z-10">
              <p className="text-[10px] font-mono tracking-widest uppercase text-accent/60 mb-2">Your Strategic Vision</p>
              <p className="text-sm font-serif italic text-white/90 leading-relaxed pr-2">"{dreamIntent}"</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-4 relative z-10">
            {/* Premium CTA Button */}
            <button
              onClick={onContinue}
              className="relative w-full h-14 rounded-xl font-medium text-base text-black bg-white overflow-hidden group transition-transform active:scale-[0.98]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-center justify-center gap-2 h-full">
                <PlayCircle className="w-5 h-5" />
                Continue Architecting
              </div>
            </button>

            {/* Subdued Ghost Button */}
            <button
              onClick={onStartFresh}
              className="flex items-center justify-center gap-2 w-full h-10 text-xs font-medium text-muted-foreground/50 hover:text-white transition-colors duration-300 rounded-lg focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Discard & Start Fresh
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
