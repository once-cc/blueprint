import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { VideoLogo } from "@/components/ui/VideoLogo";

interface PrivateAccessGateProps {
  onAccessGranted: () => void;
}

const CORRECT_PASSCODE = "CCH0R$369";

export function PrivateAccessGate({ onAccessGranted }: PrivateAccessGateProps) {
  const [passcode, setPasscode] = useState("");
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input on mount for mobile keyboard
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Handle input change (mobile)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isUnlocking) return;
    const value = e.target.value.toUpperCase();
    const filtered = value.replace(/[^A-Z0-9$]/g, '');
    setPasscode(filtered);
  };

  // Handle submit
  const handleSubmit = useCallback(() => {
    if (isUnlocking || passcode.length === 0) return;
    
    if (passcode.toUpperCase() === CORRECT_PASSCODE) {
      setIsUnlocking(true);
      setTimeout(onAccessGranted, 1200);
    } else {
      setShake(true);
      setTimeout(() => {
        setShake(false);
        setPasscode("");
        inputRef.current?.focus();
      }, 500);
    }
  }, [isUnlocking, passcode, onAccessGranted]);

  // Handle key input (desktop fallback - skip if input is focused)
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (isUnlocking) return;
    
    // Skip if the event came from our hidden input (mobile handles it via onChange)
    if (e.target === inputRef.current) return;
    
    if (e.key === "Enter" && passcode.length > 0) {
      handleSubmit();
    } else if (e.key === "Backspace") {
      setPasscode(prev => prev.slice(0, -1));
    } else if (e.key.length === 1 && /[a-zA-Z0-9$]/.test(e.key)) {
      setPasscode(prev => prev + e.key.toUpperCase());
    }
  }, [isUnlocking, passcode, handleSubmit]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <AnimatePresence>
      {!isUnlocking ? (
        <motion.div
          className="fixed inset-0 z-[1000] bg-background flex flex-col items-center justify-center"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Lightwave Scan Animation */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              className="absolute inset-y-0 w-[200px] bg-gradient-to-r from-transparent via-foreground/[0.03] to-transparent"
              initial={{ x: "-200px" }}
              animate={{ x: "calc(100vw + 200px)" }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatDelay: 4,
                ease: "easeInOut",
              }}
            />
          </div>

          {/* Subtle ambient glow */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-accent/[0.02] blur-[100px]" />
          </div>

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <VideoLogo size="xl" />
          </motion.div>

          {/* Subtitle */}
          <motion.p
            className="text-muted-foreground text-sm tracking-[0.2em] uppercase mt-8 mb-12 font-display"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Private Access
          </motion.p>

          {/* Single Passcode Input Box */}
          <motion.div
            className="relative"
            animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.4 }}
          >
            <motion.div
              className="min-w-[180px] h-14 border border-border/30 rounded-lg flex items-center justify-center 
                         bg-card/20 backdrop-blur-sm px-6 relative overflow-hidden cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              onClick={() => inputRef.current?.focus()}
            >
              {/* Hidden input for mobile keyboard */}
              <input
                ref={inputRef}
                type="text"
                inputMode="text"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="characters"
                spellCheck={false}
                value={passcode}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                aria-label="Enter passcode"
              />
              
              {/* Inner glow when typing */}
              {passcode.length > 0 && (
                <motion.div
                  className="absolute inset-0 bg-accent/[0.03]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                />
              )}
              
              {/* Display masked characters (bullets) */}
              <span className="text-2xl tracking-[0.3em] text-foreground relative z-10">
                {passcode.split('').map(() => '•').join('')}
              </span>
              
              {/* Blinking cursor */}
              <motion.div
                className="w-0.5 h-6 bg-accent/60 ml-1"
                animate={{ opacity: [1, 0] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
              />
            </motion.div>
          </motion.div>

          {/* Hint */}
          <motion.p
            className="text-muted-foreground/50 text-xs tracking-[0.15em] uppercase mt-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Enter access code & press return
          </motion.p>
        </motion.div>
      ) : (
        <motion.div
          className="fixed inset-0 z-[1000] bg-background flex items-center justify-center"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            initial={{ scale: 1 }}
            animate={{ scale: 1.2, opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <VideoLogo size="xl" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
