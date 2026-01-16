import { motion } from "framer-motion";

interface AnimatedHamburgerProps {
  isOpen: boolean;
  onClick: () => void;
  className?: string;
}

/**
 * Animated hamburger menu icon that transforms to an X when open.
 * Uses Framer Motion for smooth spring-based transitions.
 */
export function AnimatedHamburger({ isOpen, onClick, className = "" }: AnimatedHamburgerProps) {
  return (
    <button
      onClick={onClick}
      className={`w-8 h-8 flex flex-col items-center justify-center gap-1.5 hover:opacity-70 transition-opacity relative ${className}`}
      aria-label={isOpen ? "Close menu" : "Open menu"}
    >
      {/* Top line */}
      <motion.span
        className="w-5 h-px bg-foreground absolute"
        initial={false}
        animate={{
          rotate: isOpen ? 45 : 0,
          y: isOpen ? 0 : -3,
        }}
        transition={{
          duration: 0.3,
          ease: [0.22, 1, 0.36, 1],
        }}
      />
      
      {/* Bottom line */}
      <motion.span
        className="w-5 h-px bg-foreground absolute"
        initial={false}
        animate={{
          rotate: isOpen ? -45 : 0,
          y: isOpen ? 0 : 3,
        }}
        transition={{
          duration: 0.3,
          ease: [0.22, 1, 0.36, 1],
        }}
      />
    </button>
  );
}
