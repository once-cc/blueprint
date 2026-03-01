import { useState, useRef, useEffect, useCallback, forwardRef, memo } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

interface VoiceAxisSliderProps {
  zones: readonly string[];
  value: string | undefined;
  onChange: (value: string) => void;
  leftLabel: string;
  rightLabel: string;
}

export const VoiceAxisSlider = memo(forwardRef<HTMLDivElement, VoiceAxisSliderProps>(
  function VoiceAxisSlider({ zones, value, onChange, leftLabel, rightLabel }, ref) {
    const trackRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const isDraggingRef = useRef(false); // Synchronous drag state for pointer events

    // Calculate index from value
    const currentIndex = value ? zones.indexOf(value) : Math.floor(zones.length / 2);
    const normalizedPosition = currentIndex / (zones.length - 1);

    // Track zone changes for haptic animations
    const [prevIndex, setPrevIndex] = useState(currentIndex);
    const [snapTrigger, setSnapTrigger] = useState(0);

    // Smooth spring animation for thumb position
    const springPosition = useSpring(normalizedPosition * 100, {
      stiffness: 300,
      damping: 30,
    });

    // Haptic effect springs
    const scaleSpring = useSpring(1, { stiffness: 500, damping: 15 });
    const shakeSpring = useSpring(0, { stiffness: 600, damping: 10 });

    // Simplistic thumb transform - just percentage, since we are moving it inside the padded container
    const thumbLeft = useTransform(springPosition, v => `${v}%`);

    useEffect(() => {
      springPosition.set(normalizedPosition * 100);
    }, [normalizedPosition, springPosition]);

    // Detect zone changes and trigger haptic animations
    useEffect(() => {
      if (currentIndex !== prevIndex && prevIndex !== -1) {
        setSnapTrigger(prev => prev + 1);
        setPrevIndex(currentIndex);
      } else if (prevIndex === -1) {
        setPrevIndex(currentIndex);
      }
    }, [currentIndex, prevIndex]);

    // Trigger haptic animations on snap
    useEffect(() => {
      if (snapTrigger > 0) {
        // Real haptic feedback on mobile devices
        if ('vibrate' in navigator) {
          navigator.vibrate(10);
        }

        // Scale pulse - quick pop
        scaleSpring.set(1.35);
        const scaleTimeout = setTimeout(() => scaleSpring.set(1), 50);

        // Subtle shake - horizontal oscillation
        shakeSpring.set(3);
        const shake1 = setTimeout(() => shakeSpring.set(-2), 40);
        const shake2 = setTimeout(() => shakeSpring.set(1), 80);
        const shake3 = setTimeout(() => shakeSpring.set(0), 120);

        return () => {
          clearTimeout(scaleTimeout);
          clearTimeout(shake1);
          clearTimeout(shake2);
          clearTimeout(shake3);
        };
      }
    }, [snapTrigger, scaleSpring, shakeSpring]);

    const handleTrackClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
      if (!trackRef.current) return;

      const rect = trackRef.current.getBoundingClientRect();
      const padding = 10; // 2.5 tailwind units = 10px
      const trackWidth = rect.width - padding * 2;
      const x = e.clientX - rect.left - padding;
      const percentage = Math.max(0, Math.min(1, x / trackWidth));
      const index = Math.round(percentage * (zones.length - 1));
      onChange(zones[index]);
    }, [zones, onChange]);

    const handleDrag = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
      if (!trackRef.current || !isDraggingRef.current) return;

      const rect = trackRef.current.getBoundingClientRect();
      const padding = 10; // 2.5 tailwind units = 10px
      const trackWidth = rect.width - padding * 2;
      const x = e.clientX - rect.left - padding;
      const percentage = Math.max(0, Math.min(1, x / trackWidth));
      const index = Math.round(percentage * (zones.length - 1));
      onChange(zones[index]);
    }, [zones, onChange]);

    const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
      isDraggingRef.current = true;
      setIsDragging(true);
      trackRef.current?.setPointerCapture(e.pointerId);
      handleTrackClick(e as unknown as React.MouseEvent<HTMLDivElement>);
    }, [handleTrackClick]);

    const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
      isDraggingRef.current = false;
      setIsDragging(false);
      trackRef.current?.releasePointerCapture(e.pointerId);
    }, []);

    return (
      <div ref={ref} className="space-y-4">
        {/* Axis Labels */}
        <div className="flex justify-between items-center px-1">
          <span className="text-xs uppercase tracking-wider text-muted-foreground/60 font-medium">
            {leftLabel}
          </span>
          <span className="text-xs uppercase tracking-wider text-muted-foreground/60 font-medium">
            {rightLabel}
          </span>
        </div>

        {/* Track Container */}
        <div
          ref={trackRef}
          className="relative h-12 cursor-pointer touch-none"
          onClick={handleTrackClick}
          onPointerDown={handlePointerDown}
          onPointerMove={handleDrag}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {/* Machined Channel Track Background */}
          <div
            className="absolute top-1/2 -translate-y-1/2 left-2.5 right-2.5 h-[1px] rounded-full"
            style={{
              backgroundColor: 'hsl(220 12% 16%)',
              backgroundImage: 'linear-gradient(to right, hsl(220 12% 14%), hsl(220 12% 18%), hsl(220 12% 14%))'
            }}
          >
            {/* Top Specular Highlight */}
            <div
              className="absolute -top-[1px] left-0 right-0 h-[1px]"
              style={{
                background: 'linear-gradient(to bottom, hsl(45 10% 92% / 0.05), transparent 60%)'
              }}
            />
          </div>

          {/* Zone Markers with bounce animation */}
          <div className="absolute top-1/2 -translate-y-1/2 left-2.5 right-2.5 pointer-events-none">
            {zones.map((_, i) => {
              const percentage = (i / (zones.length - 1)) * 100;
              return (
                <div
                  key={i}
                  className="absolute top-1/2 w-1 h-1 -translate-y-1/2 -translate-x-1/2"
                  style={{ left: `${percentage}%` }}
                >
                  <motion.div
                    className={cn(
                      "w-full h-full rounded-full transition-colors duration-300",
                      i === currentIndex
                        ? "bg-accent"
                        : "bg-muted-foreground/30"
                    )}
                    animate={{
                      scale: i === currentIndex ? [1, 1.8, 1.4] : 1,
                    }}
                    transition={{
                      duration: 0.3,
                      times: [0, 0.4, 1],
                      ease: "easeOut"
                    }}
                  />
                </div>
              );
            })}

            {/* Ripple effect on snap */}
            {snapTrigger > 0 && (
              <motion.div
                key={snapTrigger}
                className="absolute top-1/2 w-5 h-5 -translate-y-1/2 -translate-x-1/2 pointer-events-none"
                style={{ left: thumbLeft }}
              >
                <motion.div
                  className="w-full h-full rounded-full bg-accent/30 pointer-events-none"
                  initial={{ scale: 1, opacity: 0.6 }}
                  animate={{ scale: 2.5, opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </motion.div>
            )}

            {/* Animated Thumb with Machined Depth */}
            <motion.div
              className="absolute top-1/2 w-5 h-5 -translate-y-1/2 -translate-x-1/2 pointer-events-none"
              style={{ left: thumbLeft }}
            >
              <motion.div
                className={cn(
                  "relative w-full h-full rounded-full transition-shadow duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] pointer-events-none",
                  "border border-white/10 shadow-[0_0_3px_rgba(0,0,0,0.5)]",
                  isDragging ? "bg-accent" : "bg-accent/80"
                )}
                style={{
                  scale: scaleSpring,
                  x: shakeSpring,
                }}
              >
                {/* Dimensional Darker Core */}
                <div className="absolute inset-[3px] rounded-full bg-black/50 shadow-[inset_0_3px_6px_rgba(0,0,0,0.6)]" />
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Zone Labels */}
        <div className="flex justify-between items-start">
          {zones.map((zone, i) => {
            const isActive = zone === value || (value === undefined && i === Math.floor(zones.length / 2));
            return (
              <button
                key={zone}
                type="button"
                onClick={() => onChange(zone)}
                className={cn(
                  "flex-1 text-center transition-all duration-300 min-h-[44px] py-3 -mx-0.5 rounded-md",
                  "active:bg-accent/10",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground/50 hover:text-muted-foreground"
                )}
              >
                <motion.span
                  className={cn(
                    "text-xs font-medium block",
                    isActive && "text-accent"
                  )}
                  animate={{
                    scale: isActive ? 1.1 : 1,
                    opacity: isActive ? 1 : 0.5,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {zone}
                </motion.span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }
));
