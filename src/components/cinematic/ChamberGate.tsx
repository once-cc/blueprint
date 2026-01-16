import { motion, AnimatePresence } from 'framer-motion';
import React, { useEffect, useState } from 'react';

// ... imports

const VerticalLines = React.memo(({ side }: { side: 'left' | 'right' }) => (
  // ... existing implementation
  <div className="absolute inset-0 overflow-hidden">
    {[...Array(8)].map((_, i) => (
      <div
        key={i}
        className="absolute h-full w-[1px]"
        style={{
          left: side === 'left' ? `${12 + i * 12}%` : `${8 + i * 12}%`,
          background: `linear-gradient(180deg, 
            transparent 0%, 
            hsl(var(--accent) / 0.15) 20%, 
            hsl(var(--accent) / 0.25) 50%, 
            hsl(var(--accent) / 0.15) 80%, 
            transparent 100%
          )`,
        }}
      />
    ))}
  </div>
));
VerticalLines.displayName = 'VerticalLines';

export const ChamberGate = ({
  isClosing,
  isOpening,
  onCloseComplete,
  onOpenComplete
}: ChamberGateProps) => {
  const [showGate, setShowGate] = useState(false);
  const [showSeam, setShowSeam] = useState(false);

  useEffect(() => {
    if (isClosing || isOpening) {
      setShowGate(true);
      if (isOpening) {
        setShowSeam(true);
        // Safety cleanup: Ensure gate unmounts if animation callback fails/stalls
        const safetyTimer = setTimeout(() => {
          setShowGate(false);
          setShowSeam(false);
          // We don't call onOpenComplete here to avoid duplicate triggers if possible, 
          // but we ensure the visual heavy nodes are gone.
        }, 2600); // 2.2s animation + 400ms buffer
        return () => clearTimeout(safetyTimer);
      }
    }
  }, [isClosing, isOpening]);

  // ... existing code
  if (!showGate) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] pointer-events-none">
        {/* Left Panel */}
        <motion.div
          className="absolute top-0 left-0 h-full w-1/2 origin-left pointer-events-auto"
          style={{ background: 'hsl(var(--bg-chamber))' }}
          variants={isClosing ? leftCloseVariants : leftOpenVariants}
          initial={isClosing ? 'hidden' : 'visible'}
          animate={isClosing ? 'visible' : isOpening ? 'hidden' : 'visible'}
          onAnimationComplete={() => {
            if (isClosing && onCloseComplete) {
              onCloseComplete();
            }
            if (isOpening && onOpenComplete) {
              setShowGate(false);
              setShowSeam(false);
              onOpenComplete();
            }
          }}
        >
          {/* Solid background */}
          <div className="absolute inset-0 bg-[hsl(var(--bg-chamber))]" />

          {/* Vertical mechanical lines */}
          <VerticalLines side="left" />

          {/* Subtle texture overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(180deg, 
                hsl(var(--accent) / 0.03) 0%, 
                transparent 30%, 
                transparent 70%, 
                hsl(var(--accent) / 0.03) 100%
              )`,
            }}
          />

          {/* Golden Edge Shimmer - Right side of LEFT panel */}
          <motion.div
            className="absolute top-0 right-0 w-[4px] h-full"
            style={{
              background: `linear-gradient(180deg, 
                hsl(var(--accent) / 0.3) 0%, 
                hsl(var(--accent)) 20%, 
                hsl(var(--accent)) 50%, 
                hsl(var(--accent)) 80%, 
                hsl(var(--accent) / 0.3) 100%
              )`,
              boxShadow: `
                0 0 30px hsl(var(--accent) / 0.7), 
                0 0 60px hsl(var(--accent) / 0.4), 
                inset 0 0 10px hsl(var(--accent) / 0.5)
              `,
            }}
            animate={{
              opacity: [0.7, 1, 0.7],
              boxShadow: [
                '0 0 30px hsl(var(--accent) / 0.7), 0 0 60px hsl(var(--accent) / 0.4)',
                '0 0 50px hsl(var(--accent) / 0.9), 0 0 80px hsl(var(--accent) / 0.6)',
                '0 0 30px hsl(var(--accent) / 0.7), 0 0 60px hsl(var(--accent) / 0.4)',
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Inner gold glow gradient */}
          <div
            className="absolute top-0 right-0 w-32 h-full"
            style={{
              background: `linear-gradient(270deg, 
                hsl(var(--accent) / 0.15) 0%, 
                transparent 100%
              )`,
            }}
          />
        </motion.div>

        {/* Right Panel */}
        <motion.div
          className="absolute top-0 right-0 h-full w-1/2 origin-right pointer-events-auto"
          style={{ background: 'hsl(var(--bg-chamber))' }}
          variants={isClosing ? rightCloseVariants : rightOpenVariants}
          initial={isClosing ? 'hidden' : 'visible'}
          animate={isClosing ? 'visible' : isOpening ? 'hidden' : 'visible'}
        >
          {/* Solid background */}
          <div className="absolute inset-0 bg-[hsl(var(--bg-chamber))]" />

          {/* Vertical mechanical lines */}
          <VerticalLines side="right" />

          {/* Subtle texture overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(180deg, 
                hsl(var(--accent) / 0.03) 0%, 
                transparent 30%, 
                transparent 70%, 
                hsl(var(--accent) / 0.03) 100%
              )`,
            }}
          />

          {/* Golden Edge Shimmer - Left side of RIGHT panel */}
          <motion.div
            className="absolute top-0 left-0 w-[4px] h-full"
            style={{
              background: `linear-gradient(180deg, 
                hsl(var(--accent) / 0.3) 0%, 
                hsl(var(--accent)) 20%, 
                hsl(var(--accent)) 50%, 
                hsl(var(--accent)) 80%, 
                hsl(var(--accent) / 0.3) 100%
              )`,
              boxShadow: `
                0 0 30px hsl(var(--accent) / 0.7), 
                0 0 60px hsl(var(--accent) / 0.4), 
                inset 0 0 10px hsl(var(--accent) / 0.5)
              `,
            }}
            animate={{
              opacity: [0.7, 1, 0.7],
              boxShadow: [
                '0 0 30px hsl(var(--accent) / 0.7), 0 0 60px hsl(var(--accent) / 0.4)',
                '0 0 50px hsl(var(--accent) / 0.9), 0 0 80px hsl(var(--accent) / 0.6)',
                '0 0 30px hsl(var(--accent) / 0.7), 0 0 60px hsl(var(--accent) / 0.4)',
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Inner gold glow gradient */}
          <div
            className="absolute top-0 left-0 w-32 h-full"
            style={{
              background: `linear-gradient(90deg, 
                hsl(var(--accent) / 0.15) 0%, 
                transparent 100%
              )`,
            }}
          />
        </motion.div>

        {/* Center Seam Light */}
        {showSeam && (
          <motion.div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[3px] h-full"
            style={{
              background: `linear-gradient(180deg, 
                transparent 2%, 
                hsl(var(--accent)) 15%, 
                hsl(var(--accent)) 50%, 
                hsl(var(--accent)) 85%, 
                transparent 98%
              )`,
              boxShadow: `
                0 0 40px hsl(var(--accent) / 0.8), 
                0 0 80px hsl(var(--accent) / 0.5), 
                0 0 120px hsl(var(--accent) / 0.3)
              `,
            }}
            initial={{ opacity: 0, scaleY: 0 }}
            animate={isClosing
              ? { opacity: 1, scaleY: 1 }
              : isOpening
                ? { opacity: 0, scaleY: 0 }
                : {}
            }
            transition={{
              duration: isClosing ? 0.8 : 0.6,
              delay: isClosing ? 0.2 : 0,
              ease: 'easeOut'
            }}
          />
        )}

        {/* Ambient Particle Glows */}
        {showSeam && [...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full"
            style={{
              background: 'hsl(var(--accent))',
              boxShadow: '0 0 12px hsl(var(--accent)), 0 0 24px hsl(var(--accent) / 0.5)',
              left: '50%',
              top: `${10 + i * 11}%`,
            }}
            initial={{ opacity: 0, x: '-50%', scale: 0 }}
            animate={isClosing ? {
              opacity: [0, 1, 0],
              scale: [0.3, 1.5, 0.3],
            } : {}}
            transition={{
              duration: 1.8,
              delay: 0.5 + i * 0.08,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </AnimatePresence>
  );
};
