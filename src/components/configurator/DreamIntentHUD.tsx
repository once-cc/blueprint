import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Pencil, Check } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { DreamIntentModal } from './DreamIntentModal';

interface DreamIntentHUDProps {
  dreamIntent?: string;
  onUpdate: (intent: string) => void;
  isCollapsed?: boolean;
}

export function DreamIntentHUD({ dreamIntent, onUpdate, isCollapsed = false }: DreamIntentHUDProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const isMobile = useIsMobile();
  
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

      {/* Edit Modal - using shared component */}
      <DreamIntentModal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        onSave={handleSave}
        initialValue={dreamIntent || ''}
        saveLabel="Save"
        description="What does success look like for this website?"
      />
    </>
  );
}
