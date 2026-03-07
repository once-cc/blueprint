import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Pencil, Check, CheckCircle2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShinyButton } from '@/components/ui/shiny-button';
import { Textarea } from '@/components/ui/textarea';
import { ConfiguratorCardHeader } from './ui/ConfiguratorCardHeader';

interface DreamIntentHUDProps {
  dreamIntent?: string;
  onUpdate: (intent: string) => void;
  isCollapsed?: boolean;
  isEditing?: boolean;
  onEditingChange?: (editing: boolean) => void;
}

export function DreamIntentHUD({
  dreamIntent,
  onUpdate,
  isCollapsed = false,
  isEditing: externalIsEditing,
  onEditingChange
}: DreamIntentHUDProps) {
  // Use external state if provided, otherwise fallback to local
  const [localIsEditing, setLocalIsEditing] = useState(false);
  const isEditing = externalIsEditing !== undefined ? externalIsEditing : localIsEditing;

  const setIsEditing = (value: boolean) => {
    if (onEditingChange) {
      onEditingChange(value);
    } else {
      setLocalIsEditing(value);
    }
  };
  const [showSuccess, setShowSuccess] = useState(false);
  const [editValue, setEditValue] = useState(dreamIntent || '');
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isEditing) {
      setEditValue(dreamIntent || '');
    }
  }, [isEditing, dreamIntent]);

  const maxDisplayLength = isMobile ? 35 : 80;
  const isValidInput = Boolean(editValue.trim() && editValue !== dreamIntent);

  const handleSave = (intent: string) => {
    onUpdate(intent);
    setIsEditing(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 1500);
  };

  const truncatedIntent = dreamIntent && dreamIntent.length > maxDisplayLength
    ? `${dreamIntent.slice(0, maxDisplayLength)}...`
    : dreamIntent;

  return (
    <>
      {/* HUD Pill */}
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.9 }}
        animate={{
          opacity: 1,
          y: 0,
          scale: [0.9, 1.05, 0.98, 1],
        }}
        transition={{
          duration: 0.6,
          ease: [0.22, 1, 0.36, 1],
          scale: {
            times: [0, 0.5, 0.75, 1],
            duration: 0.7,
          }
        }}
        className="fixed top-4 left-4 z-50"
      >
        <motion.button
          layout
          layoutId="dream-intent-pill"
          onClick={() => setIsEditing(true)}
          className={`
            flex items-center rounded-full
            bg-background/80 backdrop-blur-md border border-border/50
            hover:bg-muted/50 transition-colors duration-300
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background
            ${isMobile ? 'gap-1.5 px-3 py-1.5' : 'gap-2 px-4 py-2'}
            ${isCollapsed ? 'px-3' : ''}
          `}
          transition={{ layout: { duration: 0.2, ease: 'easeInOut' } }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Eye className="w-4 h-4 text-accent" />
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, maxWidth: 0 }}
                animate={{ opacity: 1, maxWidth: isMobile ? 110 : 300 }}
                exit={{ opacity: 0, maxWidth: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className={`text-muted-foreground truncate overflow-hidden whitespace-nowrap ${isMobile ? 'text-xs' : 'text-sm'}`}
              >
                {truncatedIntent || 'Set Your Vision..'}
              </motion.span>
            )}
          </AnimatePresence>
          {showSuccess ? (
            <Check className="w-4 h-4 text-accent" />
          ) : dreamIntent ? (
            <CheckCircle2 className="w-4 h-4 text-accent" />
          ) : (
            <Pencil className="w-4 h-4 text-muted-foreground" />
          )}
        </motion.button>
      </motion.div>

      {/* Inline Edit Dialog — Configurator Card Surface aesthetic */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent
          className="sm:max-w-[550px] p-0 border-0 bg-transparent shadow-none overflow-visible [&>button]:hidden"
        >
          {/* Machined Inset Plate Surface (mirrors ConfiguratorCardSurface) */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative bg-card/90 dark:bg-zinc-950/80 backdrop-blur-sm rounded-xl border border-[hsl(220_12%_12%_/_0.6)] shadow-[inset_0_0_0_1px_hsl(220_12%_20%_/_0.25),inset_0_2px_15px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            {/* Warm gold radial glow from bottom */}
            <div className="absolute inset-x-0 -bottom-1/2 h-full z-0 pointer-events-none bg-[radial-gradient(80%_40%_at_50%_100%,hsl(37_91%_55%_/_0.05),transparent_70%)] rounded-[inherit]" />
            {/* Top-down light gradient */}
            <div className="absolute inset-0 z-0 pointer-events-none rounded-[inherit] bg-[linear-gradient(to_bottom,hsl(45_10%_92%_/_0.04),transparent_40%)]" />
            {/* Noise texture overlay */}
            <div className="absolute inset-0 z-0 pointer-events-none rounded-[inherit] opacity-[0.03] mix-blend-soft-light" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

            {/* ConfiguratorCardHeader — corner ticks, title with amber dots, metadata label, editorial underline */}
            <ConfiguratorCardHeader
              title="Revise Your Vision"
              metaLabel="SYS.VISION"
              delay={0}
            />

            {/* Modal Content */}
            <div className="relative z-10 pt-[4.5rem] pb-6 px-6">
              {/* Description */}
              <p className="text-sm text-muted-foreground/60 text-center mb-5">
                What does success look like for this project?
              </p>

              {/* Textarea with animated border */}
              <style>{`
                @property --hud-gradient-angle {
                  syntax: "<angle>";
                  initial-value: 0deg;
                  inherits: false;
                }

                .hud-input-container {
                  --hud-bg: #0a0a0f;
                  --hud-highlight: rgba(245, 166, 35, 0.4);
                  --hud-highlight-bright: rgba(245, 166, 35, 0.8);
                  
                  position: relative;
                  isolation: isolate;
                  border-radius: var(--radius);
                  background: linear-gradient(var(--hud-bg), var(--hud-bg)) padding-box,
                    linear-gradient(rgba(245, 166, 35, 0.15), rgba(245, 166, 35, 0.15)) border-box;
                  border: 1px solid transparent;
                }

                .hud-input-container.animating:not(:focus-within) {
                  background: linear-gradient(var(--hud-bg), var(--hud-bg)) padding-box,
                    conic-gradient(
                      from var(--hud-gradient-angle),
                      transparent 40%,
                      var(--hud-highlight) 80%,
                      var(--hud-highlight-bright) 100%
                    ) border-box;
                  animation: hud-gradient-spin 4s linear infinite;
                }

                .hud-input-container:focus-within {
                  background: linear-gradient(var(--hud-bg), var(--hud-bg)) padding-box,
                    linear-gradient(var(--hud-highlight-bright), var(--hud-highlight-bright)) border-box;
                  animation: hud-focus-pulse 2.5s ease-in-out infinite;
                }

                @keyframes hud-gradient-spin {
                  to {
                    --hud-gradient-angle: 360deg;
                  }
                }

                @keyframes hud-focus-pulse {
                  0% {
                    box-shadow: 0 0 0 0 rgba(245, 166, 35, 0%);
                  }
                  50% {
                    box-shadow: 0 0 15px 1px rgba(245, 166, 35, 0.3);
                  }
                  100% {
                    box-shadow: 0 0 0 0 rgba(245, 166, 35, 0%);
                  }
                }
              `}</style>
              <div className={`hud-input-container p-[1px] ${!isValidInput ? 'animating' : ''}`}>
                <Textarea
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="min-h-[120px] text-lg bg-[#0a0a0f]/90 border-none focus-visible:ring-0 focus-visible:ring-offset-0 resize-none p-4 w-full h-full relative z-10 rounded-[inherit]"
                  placeholder="Use natural language — we'll translate it."
                  autoFocus
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-5">
                <button type="button" onClick={() => setIsEditing(false)} className="rounded-full px-6 py-2 text-sm text-muted-foreground/60 hover:text-white transition-colors duration-200">
                  Cancel
                </button>
                <ShinyButton
                  onClick={() => handleSave(editValue)}
                  disabled={!isValidInput}
                  isAnimating={isValidInput}
                  size="sm"
                >
                  Save Vision
                </ShinyButton>
              </div>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>
    </>
  );
}
