import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Pencil, Check } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface DreamIntentHUDProps {
  dreamIntent?: string;
  onUpdate: (intent: string) => void;
  isCollapsed?: boolean;
}

export function DreamIntentHUD({ dreamIntent, onUpdate, isCollapsed = false }: DreamIntentHUDProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [editValue, setEditValue] = useState(dreamIntent || '');
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isEditing) {
      setEditValue(dreamIntent || '');
    }
  }, [isEditing, dreamIntent]);

  const maxDisplayLength = isMobile ? 35 : 80;

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
        className={`fixed top-4 z-50 ${isMobile ? 'left-4' : 'left-1/2 -translate-x-1/2'}`}
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
          <Sparkles className="w-4 h-4 text-accent" />
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, maxWidth: 0 }}
                animate={{ opacity: 1, maxWidth: isMobile ? 180 : 300 }}
                exit={{ opacity: 0, maxWidth: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="text-sm text-muted-foreground truncate overflow-hidden whitespace-nowrap"
              >
                {truncatedIntent || 'Set your dream intent...'}
              </motion.span>
            )}
          </AnimatePresence>
          {showSuccess ? (
            <Check className="w-4 h-4 text-accent" />
          ) : (
            <Pencil className="w-4 h-4 text-muted-foreground" />
          )}
        </motion.button>
      </motion.div>

      {/* Inline Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-[550px] border-border/50 bg-background/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-nohemi tracking-tight">Revise Your Vision</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground/60 mt-1.5 focus:outline-none">
              What does success look like for this website?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
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
                  conic-gradient(
                    from var(--hud-gradient-angle),
                    transparent 40%,
                    var(--hud-highlight) 80%,
                    var(--hud-highlight-bright) 100%
                  ) border-box;
                border: 1px solid transparent;
                animation: hud-gradient-spin 4s linear infinite;
              }

              @keyframes hud-gradient-spin {
                to {
                  --hud-gradient-angle: 360deg;
                }
              }
            `}</style>
            <div className="hud-input-container p-[1px]">
              <Textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="min-h-[120px] text-lg bg-zinc-950/80 border-none focus-visible:ring-0 focus-visible:ring-offset-0 resize-none p-4 w-full h-full relative z-10"
                placeholder="Describe the application you want to build..."
                autoFocus
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => handleSave(editValue)}
              className="bg-accent text-accent-foreground hover:bg-accent/90 px-6"
              disabled={!editValue.trim() || editValue === dreamIntent}
            >
              Save Vision
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
