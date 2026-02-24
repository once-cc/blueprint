import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Pencil, Check, CheckCircle2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShinyButton } from '@/components/ui/shiny-button';
import { Textarea } from '@/components/ui/textarea';

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

      {/* Inline Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-[550px] border-border/50 bg-background/95 backdrop-blur-xl">
          <DialogHeader className="space-y-0 pb-3">
            <DialogTitle className="text-2xl font-nohemi tracking-tight">Revise Your Vision</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground/60 focus:outline-none pt-0.5">
              What does success look like for this project?
            </DialogDescription>
          </DialogHeader>
          <div className="pb-2">
            <style>{`
              @property --hud-gradient-angle {
                syntax: "<angle>";
                initial-value: 0deg;
                inherits: false;
              }

              .hud-input-container {
                --hud-bg: #1a1a1a;
                --hud-highlight: rgba(245, 166, 35, 0.4); /* Brand Amber, muted */
                --hud-highlight-bright: rgba(245, 166, 35, 0.8);
                
                position: relative;
                isolation: isolate;
                border-radius: var(--radius);
                background: linear-gradient(var(--hud-bg), var(--hud-bg)) padding-box,
                  linear-gradient(rgba(245, 166, 35, 0.15), rgba(245, 166, 35, 0.15)) border-box;
                border: 1px solid transparent;
              }

              /* Animating state: drawing attention when empty/unchanged */
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

              /* Focused state: glowing amber border with subtle pulse */
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
                className="min-h-[120px] text-lg bg-zinc-950/80 border-none focus-visible:ring-0 focus-visible:ring-offset-0 resize-none p-4 w-full h-full relative z-10"
                placeholder="Use natural language — we'll translate it."
                autoFocus
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setIsEditing(false)} className="rounded-full px-6 text-sm">
              Cancel
            </Button>
            <ShinyButton
              onClick={() => handleSave(editValue)}
              disabled={!isValidInput}
              isAnimating={isValidInput}
              size="sm"
            >
              Save Vision
            </ShinyButton>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
