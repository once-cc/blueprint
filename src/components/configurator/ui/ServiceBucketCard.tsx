import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { ServiceBucket } from '../data/serviceBucketsData';
import { springConfig } from './animationConfig';
import { useIsMobile } from '@/hooks/use-mobile';

interface ServiceBucketCardProps {
  bucket: ServiceBucket;
  selected: boolean;
  expanded: boolean;
  selectedSubs: string[];
  onToggleSelected: () => void;
  onToggleExpanded: () => void;
  onToggleSub: (subId: string) => void;
  index: number;
}

export function ServiceBucketCard({
  bucket,
  selected,
  expanded,
  selectedSubs,
  onToggleSelected,
  onToggleExpanded,
  onToggleSub,
  index,
}: ServiceBucketCardProps) {
  const isMobile = useIsMobile();

  // Toggle switch handler - ONLY changes selected state
  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Chevron click handler - ONLY changes expanded state
  const handleChevronClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleExpanded();
  };

  // Row content click handler - Expands only (not toggle)
  const handleRowClick = () => {
    onToggleExpanded();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...springConfig, delay: index * 0.05 }}
      className={cn(
        'rounded-xl overflow-hidden cfg-surface',
        'border transition-all duration-[220ms] ease-out',
        selected
          ? 'border-accent/50 bg-accent/5 cfg-surface-selected'
          : 'border-border/40 dark:border-border/50 bg-card/80'
      )}
    >
      {/* Main Row */}
      <div
        className="flex items-center gap-3 p-4 cursor-pointer"
        onClick={handleRowClick}
      >
        {/* Left Zone - Title & Description */}
        <div className="flex-1 min-w-0">
          <p className={cn(
            'font-medium transition-colors',
            'text-sm md:text-base', // ~14px mobile, ~16px desktop
            selected ? 'text-foreground' : 'text-foreground/90'
          )}>
            {bucket.label}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {bucket.description}
          </p>
        </div>

        {/* Right Zone - Toggle & Chevron */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Toggle Switch */}
          <div onClick={handleToggle}>
            <Switch
              checked={selected}
              onCheckedChange={onToggleSelected}
              className="data-[state=checked]:bg-accent"
            />
          </div>

          {/* Chevron */}
          <motion.button
            type="button"
            onClick={handleChevronClick}
            className="p-1 rounded-md hover:bg-muted/30 transition-colors"
            whileTap={{ scale: 0.9 }}
          >
            <motion.div
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            </motion.div>
          </motion.button>
        </div>
      </div>

      {/* Expanded Panel */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 pt-2 border-t border-border/30">
              {/* Expanded Description Copy */}
              <div className="mb-0">
                {isMobile ? (
                  // Mobile: condensed one-liner
                  <p className="text-xs text-muted-foreground leading-tight">
                    {bucket.mobileCopy}
                  </p>
                ) : (
                  // Desktop: headline + body
                  <div className="space-y-1.5">
                    <p className="text-sm font-medium text-foreground/90">
                      {bucket.expandedCopy.headline}
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {bucket.expandedCopy.body}
                    </p>
                  </div>
                )}
              </div>

              {/* Editorial Divider - Copy to Grid */}
              <div className="relative my-3">
                <div className="h-px w-full bg-gradient-to-r from-transparent via-border/30 dark:via-border/15 to-transparent" />
              </div>

              {/* Sub-services Grid - Always 2 columns */}
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 md:gap-x-4 md:gap-y-2">
                {bucket.subBuckets.map((sub, subIndex) => {
                  const isChecked = selectedSubs.includes(sub.id);
                  const isEndOfRow = (subIndex + 1) % 2 === 0;
                  const isLastRow = subIndex >= bucket.subBuckets.length - 2;
                  
                  return (
                    <React.Fragment key={sub.id}>
                      {/* Sub-service button with stagger animation */}
                      <motion.button
                        type="button"
                        initial={{ opacity: 0, y: 2 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.18,
                          delay: subIndex * 0.04,
                          ease: "easeOut",
                        }}
                        onClick={() => onToggleSub(sub.id)}
                        className={cn(
                          'flex items-center gap-2 p-2 rounded-lg transition-colors text-left min-h-[44px]',
                          'hover:bg-muted/30',
                          isChecked && 'bg-muted/20'
                        )}
                        whileTap={{ scale: 0.98 }}
                        disabled={!selected}
                      >
                        {/* Checkbox - slightly smaller on mobile */}
                        <motion.div
                          className={cn(
                            'rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors',
                            'w-4 h-4 md:w-5 md:h-5',
                            isChecked ? 'border-accent bg-accent' : 'border-border',
                            !selected && 'opacity-40'
                          )}
                          animate={isChecked ? { scale: [1, 1.1, 1] } : {}}
                          transition={{ duration: 0.2 }}
                        >
                          <AnimatePresence>
                            {isChecked && (
                              <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ duration: 0.15 }}
                              >
                                <Check className="w-2.5 h-2.5 md:w-3 md:h-3 text-accent-foreground" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                        
                        {/* Label - smaller on mobile */}
                        <span className={cn(
                          'transition-colors leading-tight',
                          'text-xs md:text-sm',
                          selected ? 'text-foreground' : 'text-muted-foreground',
                          isChecked && 'font-medium'
                        )}>
                          {sub.label}
                        </span>
                      </motion.button>
                      
                      {/* Editorial Row Divider - between rows, not after last */}
                      {isEndOfRow && !isLastRow && (
                        <motion.div 
                          className="col-span-2 py-1.5"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{
                            duration: 0.18,
                            delay: (subIndex + 1) * 0.04,
                            ease: "easeOut",
                          }}
                        >
                          <div className="h-px w-full bg-gradient-to-r from-transparent via-border/20 dark:via-border/10 to-transparent" />
                        </motion.div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
