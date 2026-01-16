import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface DreamIntentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (intent: string) => void;
  initialValue?: string;
  /** Button label for the save action */
  saveLabel?: string;
  /** Description text shown below the title */
  description?: string;
}

export function DreamIntentModal({ 
  isOpen, 
  onClose, 
  onSave, 
  initialValue = '',
  saveLabel = 'Continue',
  description = 'What does success look like for this website? This will guide your entire Blueprint journey.'
}: DreamIntentModalProps) {
  const [editValue, setEditValue] = useState(initialValue);

  // Sync editValue when initialValue changes (e.g., when reopening modal)
  useEffect(() => {
    setEditValue(initialValue);
  }, [initialValue]);

  const handleSave = () => {
    onSave(editValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSave();
    }
    if (e.key === 'Escape') {
      setEditValue(initialValue);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            onClick={e => e.stopPropagation()}
            className="relative w-full max-w-lg bg-card border border-border rounded-2xl p-6 shadow-2xl"
            style={{ boxShadow: '0 0 60px hsl(var(--accent) / 0.1)' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-accent" />
              <h3 className="text-lg font-display font-semibold text-foreground">
                Dream Intent
              </h3>
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">
              {description}
            </p>

            <Textarea
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g., A bold portfolio showcasing my creative work that generates qualified leads..."
              className="min-h-[120px] resize-none mb-4"
              autoFocus
            />

            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={!editValue.trim()}>
                <Check className="w-4 h-4 mr-1" />
                {saveLabel}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
